# Yudhisthra — AI Traffic Management System
**Hackathon Project | Team Yudhisthra**

---

## Quick Start

### 1. Install Python libraries
```
pip install opencv-python pyserial numpy
```

### 2. Upload Arduino code
Open `yudhisthra_arduino.ino` in Arduino IDE and upload to your board.

### 3. Connect hardware
- Arduino via USB
- Check port: Arduino IDE → Tools → Port
- Update `ARDUINO_PORT` in `traffic_main.py` (e.g. COM3, /dev/ttyUSB0)

### 4. Run
```
python traffic_main.py
```
Press **ESC** to quit.

---

## Hardware Wiring

| Lane | Name | Red LED | Yellow LED | Green LED |
|------|------|---------|------------|-----------|
| 1    | N1   | Pin 2   | Pin 3      | Pin 4     |
| 2    | N2   | Pin 5   | Pin 6      | Pin 7     |
| 3    | S1   | Pin 8   | Pin 9      | Pin 10    |
| 4    | S2   | Pin 11  | Pin 12     | Pin 13    |

Each LED → 220Ω resistor → GND

---

## Signal Logic

| Vehicle Count | Signal |
|---------------|--------|
| > 10          | 🟢 GREEN |
| 5–10          | 🟡 YELLOW |
| < 5           | 🔴 RED |

Green duration scales with traffic: `min(60s, count × 2.5s)`

---

## Modes

**Prototype (default):** 1 camera split into 4 virtual lanes  
**Full:** 4 cameras/videos (edit `LANE_SOURCES` in `traffic_main.py`)

To switch to video files, change:
```python
LANE_SOURCES = ["lane1.mp4", "lane2.mp4", "lane3.mp4", "lane4.mp4"]
```

---

## Project Structure
```
Traffic_Project/
├── traffic_main.py          ← Python (main program)
├── yudhisthra_arduino.ino   ← Arduino sketch
├── README.md
└── lane1.mp4 / lane2.mp4    ← (optional video files)
```
