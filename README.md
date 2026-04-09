# 🚦 Yudhisthra — TrafficVision AI

> **An Intelligent Traffic Management System** powered by YOLOv8 Computer Vision, Arduino Hardware Execution, and a Live React Dashboard.

[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-orange)](https://ultralytics.com)
[![Arduino](https://img.shields.io/badge/Arduino-C++-00979D?logo=arduino)](https://arduino.cc)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Overview

**Yudhisthra** replaces dumb, fixed-timer traffic lights with an AI-driven system that *sees* the road in real time. It counts vehicles, detects ambulances, and dynamically adjusts signal timings — all visualised on a live React dashboard.

### Architecture

```
📷 Camera Feed
     │
     ▼
┌──────────────────────────────┐
│   YOLOv8 Vision Module       │  ← Detects vehicles, density, ambulances
│   (Python / OpenCV)          │
└─────────────┬────────────────┘
              │  density data + emergency flags
              ▼
┌──────────────────────────────┐
│   Dynamic Logic Module       │  ← Computes optimal green/red timings
│   (Python / Flask API)       │
└──────┬───────────────┬───────┘
       │               │
       ▼               ▼
┌────────────┐  ┌────────────────────┐
│  Arduino   │  │  React Dashboard   │
│  Hardware  │  │  (Vite / Tailwind) │
│  (LEDs)    │  │  GitHub Pages      │
└────────────┘  └────────────────────┘
```

---

## 🎥 Demo Video

[![Demo Video](https://img.youtube.com/vi/QBTkvCxaVdY/maxresdefault.jpg)](https://www.youtube.com/watch?v=QBTkvCxaVdY)

> *Watch the YOLOv8 ambulance detection and Arduino hardware in action.*

---

## 🔌 Circuit Diagram

![Circuit Diagram](circuit_diagram.png)

> **Hardware:** 4 traffic light modules (Red/Yellow/Green LEDs) wired to Arduino Uno pins 2–13.

### Pin Mapping

| Signal      | Red | Yellow | Green |
|-------------|-----|--------|-------|
| Lane 1 (N)  | 2   | 3      | 4     |
| Lane 2 (S)  | 5   | 6      | 7     |
| Lane 3 (E)  | 8   | 9      | 10    |
| Lane 4 (W)  | 11  | 12     | 13    |

---

## 🛠️ Setup & Installation

### 1. Hardware Wiring

1. Connect **4 sets** of Red/Yellow/Green LEDs to your Arduino Uno using the pin mapping above.
2. Each LED requires a **220Ω resistor** in series to GND.
3. Connect the Arduino to your PC via USB.

### 2. Arduino Firmware

1. Open `yudhisthra_arduino.ino` in the Arduino IDE.
2. Select your board: **Tools → Board → Arduino Uno**.
3. Upload the sketch.

### 3. Python AI Backend

```bash
# Clone the repository
git clone https://github.com/vikashsaravanann/AI-Traffic-Management-system.git
cd AI-Traffic-Management-system

# Install dependencies
pip install -r requirements.txt

# ⚠️ IMPORTANT: Update your COM Port before running
# Open traffic_main.py and change this line:
#   ARDUINO_PORT = 'COM3'
# Replace 'COM3' with your Arduino's actual port:
#   - Windows: 'COM3', 'COM4', etc. (check Device Manager)
#   - macOS/Linux: '/dev/ttyUSB0' or '/dev/ttyACM0'

python traffic_main.py
```

### 4. React Dashboard

```bash
# Install Node dependencies
npm install

# Run locally
npm run dev

# Build for GitHub Pages
npm run build
npm run deploy
```

---

## ✨ Features

| Feature | Status |
|---|---|
| Real-time vehicle density estimation (YOLOv8) | ✅ |
| Ambulance / emergency vehicle detection | ✅ |
| Dynamic signal timing based on density | ✅ |
| Arduino 4-way LED traffic light control | ✅ |
| React live dashboard (Flask API) | ✅ |
| Simulation Mode (no hardware needed) | ✅ |
| Anomaly detection (stalled vehicles) | 🔄 In Progress |
| Predictive bottleneck ML model | 🔄 In Progress |

---

## 📁 Project Structure

```
AI-Traffic-Management-system/
├── yudhisthra_arduino.ino      # Arduino C++ firmware
├── src/
│   ├── App.jsx                 # React dashboard + Simulation Mode
│   ├── components/             # Reusable UI components
│   └── utils/                  # Utility classes (SerialController)
├── index.html
├── package.json
├── traffic_main.py             # YOLOv8 + Serial + Flask backend
├── requirements.txt            # Python dependencies
├── circuit_diagram.png         # Hardware wiring diagram
└── README.md
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

[MIT](LICENSE) © Vikash Saravanan
