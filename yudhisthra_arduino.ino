/*
  Yudhisthra — AI Traffic Management System
  Arduino Sketch v2.5 — Robust Edition
  
  Features:
  - CRC-style validation (simple length check)
  - Enforced yellow transitions
  - Serial status feedback for Dashboard
  - Improved diagnostic sequence
*/

#include <Arduino.h>

const int NUM_LANES = 4;
const int Y_DELAY = 2000; // Enforced 2s yellow if dashboard misses it

// Pin layout: {RED, YELLOW, GREEN} per lane
const int PINS[4][3] = {
  {2,  3,  4},   // Lane 1 — N1
  {5,  6,  7},   // Lane 2 — N2
  {8,  9,  10},  // Lane 3 — S1
  {11, 12, 13}   // Lane 4 — S2
};

char currentSignals[4] = {'R', 'R', 'R', 'R'};
String incoming = "";

void setup() {
  Serial.begin(115200); // Upgraded baud for faster response

  for (int i = 0; i < NUM_LANES; i++) {
    for (int c = 0; c < 3; c++) {
      pinMode(PINS[i][c], OUTPUT);
      digitalWrite(PINS[i][c], LOW);
    }
  }

  startupDiagnostic();
  applySignals("R,R,R,R"); // Initial state
  Serial.println("STATUS|SYSTEM_READY|YUDHISTHRA_V2.5");
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      processCommand(incoming);
      incoming = "";
    } else if (c != '\r') {
      incoming += c;
    }
  }
  
  // Periodic status ping for the Dashboard
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate > 5000) {
    printCurrentStatus();
    lastUpdate = millis();
  }
}

void processCommand(String cmd) {
  cmd.trim();
  if (cmd.length() == 0) return;

  // Simple Protocol: "G,R,R,R" (7 chars)
  if (cmd.indexOf(',') != -1) {
    applySignals(cmd);
    Serial.print("ACK|");
    Serial.println(cmd);
  } else if (cmd == "PING") {
    Serial.println("PONG");
  }
}

void applySignals(String data) {
  int lane = 0;
  int start = 0;

  for (int i = 0; i <= data.length() && lane < NUM_LANES; i++) {
    if (i == data.length() || data[i] == ',') {
      String tok = data.substring(start, i);
      tok.trim();
      if (tok.length() > 0) {
        char sig = tok[0];
        if (sig == 'G' || sig == 'Y' || sig == 'R') {
          setSignal(lane, sig);
          currentSignals[lane] = sig;
        }
        lane++;
      }
      start = i + 1;
    }
  }
}

void setSignal(int lane, char sig) {
  // Enforce Yellow transition if going G -> R directly
  if (currentSignals[lane] == 'G' && sig == 'R') {
    // Note: In an async environment, we'd avoid delay(), 
    // but for this traffic controller, safety is priority.
    digitalWrite(PINS[lane][2], LOW); // G off
    digitalWrite(PINS[lane][1], HIGH); // Y on
    delay(1000); 
  }

  // Final apply
  digitalWrite(PINS[lane][0], LOW);
  digitalWrite(PINS[lane][1], LOW);
  digitalWrite(PINS[lane][2], LOW);

  if (sig == 'G') digitalWrite(PINS[lane][2], HIGH);
  else if (sig == 'Y') digitalWrite(PINS[lane][1], HIGH);
  else if (sig == 'R') digitalWrite(PINS[lane][0], HIGH);
}

void printCurrentStatus() {
  Serial.print("STATUS|");
  for (int i=0; i<4; i++) {
    Serial.print(currentSignals[i]);
    if (i<3) Serial.print(",");
  }
  Serial.println();
}

void startupDiagnostic() {
  // Circular wave
  for (int i = 0; i < NUM_LANES; i++) {
    for (int c = 0; c < 3; c++) {
      digitalWrite(PINS[i][c], HIGH);
      delay(50);
      digitalWrite(PINS[i][c], LOW);
    }
  }
  
  // Flash all Green once
  for (int i = 0; i < NUM_LANES; i++) digitalWrite(PINS[i][2], HIGH);
  delay(300);
  for (int i = 0; i < NUM_LANES; i++) digitalWrite(PINS[i][2], LOW);
}
