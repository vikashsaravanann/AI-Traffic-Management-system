# Yudhisthra — AI Traffic Management System
**The Intelligent Guardian of Urban Flow**

Yudhisthra is a state-of-the-art adaptive traffic control system that leverages Computer Vision (OpenCV) and Hardware Interfacing (Arduino) to optimize intersection throughput in real-time. By dynamically adjusting green-light intervals based on lane density, it significantly reduces cumulative wait times and carbon emissions.

---

## 🚀 Key Features

- **Computer Vision Pipeline**: Real-time vehicle detection using MOG2 background subtraction and contour analysis.
- **Neural Adaptive Logic**: Signal timing that scales proportionally to lane occupancy (`min(60s, count * 2.5s)`).
- **Premium Dashboard**: A high-fidelity, Skia-powered web interface for real-time monitoring and scenario simulation.
- **Hardware Agnostic**: Auto-detecting serial bridge for seamless Arduino/Microcontroller integration.
- **Scenario Modeling**: Test system efficiency under Peak, Emergency, and Rural conditions.

---

## 🛠 Tech Stack

- **Core**: Python 3.11+
- **Vision**: OpenCV (Open Source Computer Vision Library)
- **Interface**: JavaScript (Vanilla ES6), HSL Glassmorphism Design
- **Typography**: Skia, Inter
- **Hardware**: Arduino / Serial Communication (pyserial)

---

## 🚦 Quick Start

### 1. Environment Setup
```bash
python3 -m pip install opencv-python pyserial numpy
```

### 2. Deploy Dashboard
Simply open `index.html` in any modern browser for the visualizer.

### 3. Initialize Neural Core (Python)
Ensure your Arduino is connected if using hardware mode.
```bash
python3 traffic_main.py
```
*The system will automatically attempt to locate the Arduino on `/dev/cu.usb*` (Mac) or `COM*` (Windows).*

---

## 📦 Project Structure

```text
AI-Traffic-Management-system/
├── index.html               # Premium Dashboard & Visualizer
├── traffic_main.py          # Python Neural Core (Detection & Logic)
├── yudhisthra_arduino.ino   # Arduino Firmware (v2.0)
├── README.md                # Documentation
└── .git/                    # Version Control
```

---

## 🧠 The "Dharma" Logic

Unlike fixed-timer systems, Yudhisthra evaluates the "need" of each lane. 
- **High Density (>10 vehicles)**: Extended Green phase up to 60 seconds.
- **Low Density (<5 vehicles)**: Rapid cycling to ensure no lane stays empty while others wait.
- **Emergency Mode**: Immediate priority clearing for high-occupancy lanes.

---

*Named after Yudhisthra, the eldest Pandava, for his commitment to order, truth, and the balance of the world.*
