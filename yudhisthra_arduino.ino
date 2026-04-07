/*
  Yudhisthra — AI Traffic Management System
  Arduino Sketch v2.0
  
  Receives signal states from Python over serial.
  Format: "G,Y,R,G\n"  (one letter per lane, comma-separated)
*/

const int NUM_LANES = 4;

// Pin layout: {RED, YELLOW, GREEN} per lane
const int PINS[4][3] = {
  {2,  3,  4},   // Lane 1 — N1
  {5,  6,  7},   // Lane 2 — N2
  {8,  9,  10},  // Lane 3 — S1
  {11, 12, 13}   // Lane 4 — S2
};

String incoming = "";

void setup() {
  Serial.begin(9600);

  for (int i = 0; i < NUM_LANES; i++) {
    for (int c = 0; c < 3; c++) {
      pinMode(PINS[i][c], OUTPUT);
      digitalWrite(PINS[i][c], LOW);
    }
  }

  // Startup sequence — professional diagnostic wave
  startupDiagnostic();

  // Default all lanes to RED
  for (int i = 0; i < NUM_LANES; i++) setSignal(i, 'R');

  Serial.println("[Yudhisthra] System Online — Link Established");
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      parseAndApply(incoming);
      incoming = "";
    } else if (c != '\r') {
      incoming += c;
    }
  }
}

void parseAndApply(String data) {
  data.trim();
  int lane = 0;
  int start = 0;

  for (int i = 0; i <= data.length() && lane < NUM_LANES; i++) {
    if (i == data.length() || data[i] == ',') {
      String tok = data.substring(start, i);
      tok.trim();
      if (tok.length() > 0) {
        char sig = tok[0];
        // Validation: Only accept G, Y, R
        if (sig == 'G' || sig == 'Y' || sig == 'R') {
          setSignal(lane, sig);
        }
        lane++;
      }
      start = i + 1;
    }
  }
}

void setSignal(int lane, char sig) {
  // Turn off all lights for this lane first
  digitalWrite(PINS[lane][0], LOW);
  digitalWrite(PINS[lane][1], LOW);
  digitalWrite(PINS[lane][2], LOW);

  if (sig == 'G') digitalWrite(PINS[lane][2], HIGH);
  else if (sig == 'Y') digitalWrite(PINS[lane][1], HIGH);
  else if (sig == 'R') digitalWrite(PINS[lane][0], HIGH);
}

void startupDiagnostic() {
  // Wave effect across lanes
  for (int c = 2; c >= 0; c--) { // Green -> Yellow -> Red
    for (int i = 0; i < NUM_LANES; i++) {
      digitalWrite(PINS[i][c], HIGH);
      delay(80);
    }
    delay(100);
    for (int i = 0; i < NUM_LANES; i++) {
      digitalWrite(PINS[i][c], LOW);
      delay(40);
    }
  }
  
  // Flash all RED once to signify "Stop/Interlock Active"
  for (int i = 0; i < NUM_LANES; i++) digitalWrite(PINS[i][0], HIGH);
  delay(500);
  for (int i = 0; i < NUM_LANES; i++) digitalWrite(PINS[i][0], LOW);
  delay(200);
}
