#!/usr/bin/env python3
"""
YUDHISTHRA AI — EXPERT PRODUCTION RELEASE
Advanced Multi-Threaded Traffic Intelligence System
- Vision Engine (YOLOv8)
- Adaptive Signal Controller
- Distributed API Bridge (Flask)
- Hardware Abstraction Layer (HAL)
"""

import cv2
import numpy as np
import serial
import time
import threading
import logging
import serial.tools.list_ports
from flask import Flask, jsonify
from flask_cors import CORS

# ─── LOGGING CONFIG ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("Yudhisthra")

# ─── SYSTEM CONFIGURATION ─────────────────────────────────────────────────────
CONFIG = {
    "ARDUINO_PORT": "COM3",
    "BAUD": 115200,
    "LANES": ["NORTH", "SOUTH", "EAST", "WEST"],
    "LANE_KEYS": ["north", "south", "east", "west"],
    "CAMERA_SOURCE": 0,
    "FRAME_RES": (640, 480),
    "MODEL_PATH": "yolov8n.pt",
    "VEHICLE_CLASSES": [2, 3, 5, 7], # car, motor, bus, truck
    "THRESHOLDS": {"GREEN": 10, "YELLOW": 5},
    "TIMINGS": {"MIN": 10, "MAX": 60, "SCALE": 2.5}
}

class SystemState:
    """Shared state with thread-safe access"""
    def __init__(self):
        self.densities = {k: 0 for k in CONFIG["LANE_KEYS"]}
        self.signals = {k: "R" for k in CONFIG["LANE_KEYS"]}
        self.emergency_lane = None
        self.fps = 0.0
        self.inference_time = 0.0
        self.hardware_active = False
        self.lock = threading.Lock()

    def update_densities(self, new_data):
        with self.lock:
            self.densities.update(new_data)

    def update_signals(self, new_data):
        with self.lock:
            self.signals.update(new_data)

    def set_emergency(self, lane_key):
        with self.lock:
            self.emergency_lane = lane_key

    def get_snapshot(self):
        with self.lock:
            return {
                "densities": self.densities.copy(),
                "signals": self.signals.copy(),
                "emergency": self.emergency_lane,
                "health": {
                    "fps": self.fps,
                    "latency": self.inference_time,
                    "hardware": self.hardware_active
                },
                "timestamp": time.strftime("%H:%M:%S")
            }

state = SystemState()

# ─── HARDWARE BRIDGE ──────────────────────────────────────────────────────────
class HardwareBridge:
    def __init__(self, port, baud):
        self.port = port
        self.baud = baud
        self.ser = None
        self.connect()

    def connect(self):
        try:
            # Auto-detect ports on Mac/Linux if COM3 fails
            ports = list(serial.tools.list_ports.comports())
            target = self.port
            for p in ports:
                if any(x in p.device for x in ['USB', 'ACM', 'UART']):
                    target = p.device
                    break
            
            self.ser = serial.Serial(target, self.baud, timeout=0.1)
            time.sleep(2) # Arduino Reset-on-Connect wait
            state.hardware_active = True
            logger.info(f"Hardware Bridge established on {target}")
        except Exception as e:
            logger.warning(f"Hardware not detected. Entering Virtual Simulation mode.")
            state.hardware_active = False

    def send(self, signal_dict):
        if not self.ser or not state.hardware_active:
            return
        try:
            # Protocol: G,R,R,R\n
            payload = ",".join([signal_dict[k] for k in CONFIG["LANE_KEYS"]]) + "\n"
            self.ser.write(payload.encode())
        except Exception as e:
            logger.error(f"Hardware link failed: {e}")
            state.hardware_active = False

# ─── VISION ENGINE ────────────────────────────────────────────────────────────
class VisionEngine:
    def __init__(self):
        try:
            from ultralytics import YOLO
            self.model = YOLO(CONFIG["MODEL_PATH"])
        except Exception as e:
            logger.error(f"AI Engine failed to load: {e}")
            exit(1)
        
        self.cap = cv2.VideoCapture(CONFIG["CAMERA_SOURCE"])
        if not self.cap.isOpened():
            logger.error("Primary camera sensor not reachable.")

    def run(self):
        num_lanes = len(CONFIG["LANES"])
        while self.cap.isOpened():
            start_time = time.time()
            ret, frame = self.cap.read()
            if not ret: break

            frame = cv2.resize(frame, CONFIG["FRAME_RES"])
            strip_h = CONFIG["FRAME_RES"][1] // num_lanes
            current_densities = {}

            # Multi-lane slicing and detection
            for i, key in enumerate(CONFIG["LANE_KEYS"]):
                y0, y1 = i * strip_h, (i + 1) * strip_h
                lane_roi = frame[y0:y1, :]
                
                results = self.model(lane_roi, verbose=False)
                count = sum(1 for r in results for b in r.boxes if int(b.cls[0]) in CONFIG["VEHICLE_CLASSES"])
                current_densities[key] = min(count, 30)

                # Visualize
                cv2.rectangle(frame, (0, y0), (CONFIG["FRAME_RES"][0], y1), (255, 255, 255), 1)
                color = (0, 255, 0) if state.signals[key] == 'G' else (0, 0, 255)
                cv2.putText(frame, f"{CONFIG['LANES'][i]}: {count} veh", (10, y0 + 25), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            state.update_densities(current_densities)
            
            # FPS Calculation
            end_time = time.time()
            state.inference_time = (end_time - start_time) * 1000
            state.fps = 1.0 / (end_time - start_time)

            cv2.imshow("YUDHISTHRA AI — LIVE FEED", frame)
            if cv2.waitKey(1) & 0xFF == 27: break

        self.cap.release()
        cv2.destroyAllWindows()

# ─── LOGIC CONTROLLER ─────────────────────────────────────────────────────────
class SignalController:
    def __init__(self, bridge):
        self.bridge = bridge
        self.timers = {k: 0.0 for k in CONFIG["LANE_KEYS"]}

    def solve(self):
        while True:
            time.sleep(0.5)
            snapshot = state.get_snapshot()
            densities = snapshot["densities"]
            emergency = snapshot["emergency"]
            
            new_signals = {}
            for k in CONFIG["LANE_KEYS"]:
                if emergency:
                    new_signals[k] = "G" if k == emergency else "R"
                else:
                    # Adaptive Logic
                    d = densities[k]
                    if d > CONFIG["THRESHOLDS"]["GREEN"]: new_signals[k] = "G"
                    elif d > CONFIG["THRESHOLDS"]["YELLOW"]: new_signals[k] = "Y"
                    else: new_signals[k] = "R"

            state.update_signals(new_signals)
            self.bridge.send(new_signals)

# ─── API SERVER ───────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

@app.route('/api/status')
def api_status():
    return jsonify(state.get_snapshot())

# ─── ENTRY POINT ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    logger.info("Initializing Yudhisthra OS...")
    
    bridge = HardwareBridge(CONFIG["ARDUINO_PORT"], CONFIG["BAUD"])
    vision = VisionEngine()
    logic  = SignalController(bridge)

    # Spawn Async Loops
    threading.Thread(target=logic.solve, daemon=True).start()
    threading.Thread(target=lambda: app.run(host='0.0.0.0', port=5000, use_reloader=False), daemon=True).start()

    # Main Vision Loop (Must stay on main thread for OpenCV)
    vision.run()
