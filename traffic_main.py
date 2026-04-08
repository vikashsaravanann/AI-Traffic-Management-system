#!/usr/bin/env python3
"""
Yudhisthra — AI Traffic Management System
Team: Yudhisthra | Hackathon Project

4-Lane adaptive signal control using YOLOv8 + Arduino
Features: Deep Learning detection, Emergency Override
"""

import cv2
import numpy as np
import serial
import time
import threading
import serial.tools.list_ports
import math

try:
    from ultralytics import YOLO
except ImportError:
    print("Please install ultralytics: pip install ultralytics")
    exit(1)

# ─── CONFIG ───────────────────────────────────────────────────────────────────
ARDUINO_PORT = 'COM3'       # Fallback: Windows: COM3 | Linux/Mac: /dev/ttyUSB0
BAUD_RATE    = 9600
NUM_LANES    = 4
MAX_VEHICLES = 30
FRAME_WIDTH  = 640
FRAME_HEIGHT = 480

GREEN_THRESHOLD  = 10
YELLOW_THRESHOLD = 5

# Set up YOLO Model
print("Loading YOLOv8 Model. This may take a moment...")
model = YOLO('yolov8n.pt') # loads nano model for real-time performance
# COCO classes for vehicles: 2=car, 3=motorcycle, 5=bus, 7=truck
VEHICLE_CLASSES = [2, 3, 5, 7]

def compute_green_time(count):
    return min(60, max(10, int(count * 2.5)))

# ─── LANE SOURCES ─────────────────────────────────────────────────────────────
# Set to Mobile streams
LANE_SOURCES = ["http://172.20.51.232:4747/video", "http://100.64.24.88:8080/video", 0, 0]

# ─── GLOBALS ──────────────────────────────────────────────────────────────────
lane_counts  = [0] * NUM_LANES
lane_signals = ['R'] * NUM_LANES
lane_timers  = [0] * NUM_LANES
emergency_override = None # None or int (0-3) representing the lane with an ambulance
lock = threading.Lock()

# ─── ARDUINO ──────────────────────────────────────────────────────────────────
def connect_arduino():
    ports = list(serial.tools.list_ports.comports())
    targets = ['USB', 'UART', 'ACM', 'cu.usb', 'COM']
    found_port = None
    
    for p in ports:
        if any(t in p.device for t in targets):
            found_port = p.device
            break
            
    port_to_try = found_port if found_port else ARDUINO_PORT
    
    try:
        ard = serial.Serial(port_to_try, BAUD_RATE, timeout=0.1)
        time.sleep(2)
        print(f"  [✓] Arduino connected on {port_to_try}")
        return ard
    except Exception as e:
        print(f"  [!] Arduino hardware not detected on {port_to_try}")
        print(f"      Status: Running in Software Simulation Mode")
        return None

# ─── VEHICLE DETECTION (YOLOv8) ───────────────────────────────────────────────
def detect_vehicles(frame, is_emergency=False):
    """
    Run YOLOv8 inference on a frame.
    Optionally render an ambulance icon if is_emergency is True.
    """
    h, w = frame.shape[:2]
    
    # Run YOLO inferencing
    results = model(frame, verbose=False)
    
    count = 0
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            if cls_id in VEHICLE_CLASSES:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                # Draw sophisticated bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 128, 0), 2)
                # Label
                cv2.putText(frame, model.names[cls_id], (x1, max(15, y1 - 5)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 128, 0), 1)
                count += 1

    # Simulate Ambulance Override UI rendering
    if is_emergency:
        # Draw a bouncing ambulance icon in the center top
        offset = int(10 * math.sin(time.time() * 10))
        cx, cy = w // 2, 25 + offset
        
        # Red glow
        cv2.circle(frame, (cx, cy), 15, (0, 0, 255), -1)
        cv2.circle(frame, (cx, cy), 10, (255, 255, 255), -1)
        cv2.putText(frame, "+", (cx-6, cy+5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 2)

    return frame, min(count, MAX_VEHICLES)

# ─── SIGNAL LOGIC ─────────────────────────────────────────────────────────────
def compute_signal(count):
    if count > GREEN_THRESHOLD:  return 'G'
    if count > YELLOW_THRESHOLD: return 'Y'
    return 'R'

# ─── SIGNAL CONTROLLER THREAD ─────────────────────────────────────────────────
def signal_controller(arduino):
    global emergency_override
    timers = [0.0] * NUM_LANES
    label  = {0:'N1', 1:'N2', 2:'S1', 3:'S2'}

    while True:
        time.sleep(0.5)
        with lock:
            counts = list(lane_counts)
            current_override = emergency_override

        for i in range(NUM_LANES):
            # Check Emergency Override First
            if current_override is not None:
                if current_override == i:
                    new_sig = 'G'
                    green_time = 99  # Held indefinitely until cleared
                else:
                    new_sig = 'R'
                    green_time = 0
            else:
                # Normal AI Operation
                new_sig    = compute_signal(counts[i])
                green_time = compute_green_time(counts[i])

            if timers[i] <= 0 or new_sig != lane_signals[i]:
                old = lane_signals[i]
                lane_signals[i] = new_sig
                timers[i] = green_time
                if old != new_sig:
                    mode = "[EMERGENCY]" if current_override is not None else ""
                    print(f"  Lane {label[i]} | Count={counts[i]:>2} | "
                          f"{old}→{new_sig} | Timer={green_time}s {mode}")
            else:
                timers[i] -= 0.5

            lane_timers[i] = timers[i]

        payload = ','.join(lane_signals) + '\n'
        if arduino:
            try:
                arduino.write(payload.encode())
            except Exception as e:
                print(f"  [serial error] {e}")

# ─── SINGLE CAMERA (PROTOTYPE) ────────────────────────────────────────────────
def run_single_camera(arduino):
    global emergency_override
    print("\n[Yudhisthra] Single-camera prototype — 4 virtual lanes")
    print("  Controls:")
    print("  [1, 2, 3, 4] : Trigger Emergency Ambulance for Lane N")
    print("  [C]          : Clear Emergency Mode")
    print("  [ESC]        : Quit\n")

    cap = cv2.VideoCapture(LANE_SOURCES[0])
    
    threading.Thread(target=signal_controller, args=(arduino,), daemon=True).start()

    sig_color = {'G':(0,255,0), 'Y':(0,255,255), 'R':(0,0,255)}
    
    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            if not isinstance(LANE_SOURCES[0], int): 
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame   = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
        strip_h = FRAME_HEIGHT // NUM_LANES
        display = frame.copy()

        total = 0
        with lock:
            curr_override = emergency_override

        for i in range(NUM_LANES):
            y0, y1 = i * strip_h, (i + 1) * strip_h
            
            # Slice the particular lane row and pass it to YOLO
            lane_frame = frame[y0:y1, :]
            is_lane_emergency = (curr_override == i)
            processed_lane, count = detect_vehicles(lane_frame, is_emergency=is_lane_emergency)
            
            # Repaste processed lane into display
            display[y0:y1, :] = processed_lane

            with lock:
                lane_counts[i] = count
            total += count

            sig   = lane_signals[i]
            color = sig_color[sig]

            # Glowing Route Box if Emergency
            cv2.rectangle(display, (0, y0), (FRAME_WIDTH-1, y1-1), color, 4 if is_lane_emergency else 2)
            
            # Signal Data Tag
            tag_color = (0,0,255) if is_lane_emergency else (30,30,30)
            cv2.rectangle(display, (0, y0), (280, y0+40), tag_color, -1)
            
            status_text = "EMERGENCY CLEAR ROUTE" if is_lane_emergency else f"Signal: {sig}"
            cv2.putText(display, f"Lane {i+1}: {count} veh | {status_text}",
                        (10, y0+18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)
            cv2.putText(display, f"Timer: {int(lane_timers[i])}s",
                        (10, y0+35), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 2)

        # Draw Global Override Banner
        if curr_override is not None:
            cv2.rectangle(display, (0, 0), (FRAME_WIDTH, 40), (0, 0, 255), -1)
            cv2.putText(display, "EMERGENCY OVERRIDE ACTIVE", (FRAME_WIDTH//2 - 150, 25), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        cv2.putText(display, f"Yudhisthra YOLOv8 | Total: {total} vehicles",
                    (10, FRAME_HEIGHT-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

        cv2.imshow("Yudhisthra — Advanced Traffic Management", display)
        
        key = cv2.waitKey(1) & 0xFF
        if key == 27:
            break
        elif key == ord('1'):
            with lock: emergency_override = 0
            print(">>> EMERGENCY INITIATED: LANE 1")
        elif key == ord('2'):
            with lock: emergency_override = 1
            print(">>> EMERGENCY INITIATED: LANE 2")
        elif key == ord('3'):
            with lock: emergency_override = 2
            print(">>> EMERGENCY INITIATED: LANE 3")
        elif key == ord('4'):
            with lock: emergency_override = 3
            print(">>> EMERGENCY INITIATED: LANE 4")
        elif key == ord('c') or key == ord('C'):
            with lock: emergency_override = None
            print(">>> EMERGENCY CLEARED. Resuming normal AI operation.")

    cap.release()
    cv2.destroyAllWindows()


# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 60)
    print("  YUDHISTHRA — Real-Time AI Traffic Center (YOLOv8 Network)")
    print("=" * 60)

    arduino = connect_arduino()
    run_single_camera(arduino)
