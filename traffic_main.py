"""
Yudhisthra — AI Traffic Management System
Team: Yudhisthra | Hackathon Project

4-Lane adaptive signal control using OpenCV + Arduino
"""

import cv2
import numpy as np
import serial
import time
import threading

# ─── CONFIG ───────────────────────────────────────────────────────────────────
ARDUINO_PORT = 'COM3'       # Windows: COM3 | Linux/Mac: /dev/ttyUSB0
BAUD_RATE    = 9600
NUM_LANES    = 4
MIN_AREA     = 500
MAX_VEHICLES = 20
FRAME_WIDTH  = 640
FRAME_HEIGHT = 480

GREEN_THRESHOLD  = 10
YELLOW_THRESHOLD = 5

def compute_green_time(count):
    return min(60, max(10, int(count * 2.5)))

# ─── LANE SOURCES ─────────────────────────────────────────────────────────────
# Prototype: all 4 virtual lanes from 1 camera
# Full mode: replace with camera indices or video paths per lane
LANE_SOURCES = [0, 0, 0, 0]

# ─── GLOBALS ──────────────────────────────────────────────────────────────────
lane_counts  = [0] * NUM_LANES
lane_signals = ['R'] * NUM_LANES
lane_timers  = [0] * NUM_LANES
lock = threading.Lock()

# ─── ARDUINO ──────────────────────────────────────────────────────────────────
def connect_arduino():
    try:
        ard = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)
        print(f"[✓] Arduino connected on {ARDUINO_PORT}")
        return ard
    except Exception as e:
        print(f"[!] Arduino not found ({e}) — simulation mode only")
        return None

# ─── VEHICLE DETECTION ────────────────────────────────────────────────────────
def detect_vehicles(frame, bg_sub):
    frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
    mask  = bg_sub.apply(frame)

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    count = 0
    for cnt in contours:
        if cv2.contourArea(cnt) > MIN_AREA:
            x, y, w, h = cv2.boundingRect(cnt)
            aspect = w / float(h)
            if 0.5 < aspect < 4.0:     # filter: vehicles wider than tall
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                count += 1
    return frame, mask, min(count, MAX_VEHICLES)

# ─── SIGNAL LOGIC ─────────────────────────────────────────────────────────────
def compute_signal(count):
    if count > GREEN_THRESHOLD:  return 'G'
    if count > YELLOW_THRESHOLD: return 'Y'
    return 'R'

# ─── SIGNAL CONTROLLER THREAD ─────────────────────────────────────────────────
def signal_controller(arduino):
    timers = [0.0] * NUM_LANES
    label  = {0:'N1', 1:'N2', 2:'S1', 3:'S2'}

    while True:
        time.sleep(0.5)
        with lock:
            counts = list(lane_counts)

        for i in range(NUM_LANES):
            new_sig    = compute_signal(counts[i])
            green_time = compute_green_time(counts[i])

            if timers[i] <= 0 or new_sig != lane_signals[i]:
                old = lane_signals[i]
                lane_signals[i] = new_sig
                timers[i] = green_time
                if old != new_sig:
                    print(f"  Lane {label[i]} | Count={counts[i]:>2} | "
                          f"{old}→{new_sig} | Timer={green_time}s")
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
    print("\n[Yudhisthra] Single-camera prototype — 4 virtual lanes")
    print("  Press ESC to quit\n")

    cap = cv2.VideoCapture(LANE_SOURCES[0])
    subs = [cv2.createBackgroundSubtractorMOG2() for _ in range(NUM_LANES)]

    threading.Thread(target=signal_controller, args=(arduino,), daemon=True).start()

    sig_color = {'G':(0,200,0), 'Y':(0,200,255), 'R':(0,0,220)}
    sig_text  = {'G':'GREEN',   'Y':'YELLOW',      'R':'RED'}

    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame   = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
        strip_h = FRAME_HEIGHT // NUM_LANES
        display = frame.copy()

        for i in range(NUM_LANES):
            y0, y1 = i * strip_h, (i + 1) * strip_h
            _, _, count = detect_vehicles(frame[y0:y1, :], subs[i])
            with lock:
                lane_counts[i] = count

            sig   = lane_signals[i]
            color = sig_color[sig]

            cv2.rectangle(display, (0, y0), (FRAME_WIDTH-1, y1-1), color, 2)
            cv2.rectangle(display, (0, y0), (210, y0+22), color, -1)
            cv2.putText(display, f"Lane {i+1}: {count} veh | {sig_text[sig]}",
                        (6, y0+15), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255,255,255), 1)
            cv2.putText(display, f"T={int(lane_timers[i])}s",
                        (6, y0+35), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)

        total = sum(lane_counts)
        cv2.putText(display, f"Yudhisthra AI Traffic | Total: {total} vehicles",
                    (10, FRAME_HEIGHT-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

        cv2.imshow("Yudhisthra — Traffic Management", display)
        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

# ─── MULTI CAMERA (FULL MODE) ─────────────────────────────────────────────────
def run_multi_camera(arduino):
    print("\n[Yudhisthra] Multi-camera mode — 4 real lanes")
    caps = [cv2.VideoCapture(s) for s in LANE_SOURCES]
    subs = [cv2.createBackgroundSubtractorMOG2() for _ in range(NUM_LANES)]

    threading.Thread(target=signal_controller, args=(arduino,), daemon=True).start()

    sig_color = {'G':(0,200,0), 'Y':(0,200,255), 'R':(0,0,220)}
    sig_text  = {'G':'GREEN',   'Y':'YELLOW',      'R':'RED'}

    while True:
        frames = []
        for i, cap in enumerate(caps):
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()

            processed, _, count = detect_vehicles(frame, subs[i])
            with lock:
                lane_counts[i] = count

            sig   = lane_signals[i]
            color = sig_color[sig]
            cv2.putText(processed,
                        f"Lane {i+1}: {count} | {sig_text[sig]} T={int(lane_timers[i])}s",
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            cv2.rectangle(processed, (0,0), (FRAME_WIDTH-1, FRAME_HEIGHT-1), color, 4)
            frames.append(processed)

        if len(frames) == 4:
            grid = np.vstack([np.hstack(frames[:2]), np.hstack(frames[2:])])
            cv2.imshow("Yudhisthra — 4 Lane Traffic", cv2.resize(grid, (1280, 480)))

        if cv2.waitKey(1) & 0xFF == 27:
            break

    for cap in caps: cap.release()
    cv2.destroyAllWindows()

# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 50)
    print("  YUDHISTHRA — AI Traffic Management System")
    print("=" * 50)

    arduino = connect_arduino()
    run_single_camera(arduino)

    # Uncomment for 4-camera mode:
    # run_multi_camera(arduino)
