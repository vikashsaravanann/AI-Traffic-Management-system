/*
  Yudhisthra — AI Traffic Management System
  Arduino Sketch

  Receives signal states from Python over serial.
  Format: "G,Y,R,G\n"  (one letter per lane, comma-separated)

  Lane  Name  Red  Yellow  Green
  ────  ────  ───  ──────  ─────
    1    N1    2     3       4
    2    N2    5     6       7
    3    S1    8     9      10
    4    S2   11    12      13

  Each LED → 220Ω resistor → GND
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

  // Startup sequence — cycle all lights once
  startupTest();

  // Default all lanes to RED
  for (int i = 0; i < NUM_LANES; i++) setSignal(i, 'R');

  Serial.println("[Yudhisthra] Arduino ready — awaiting Python signals");
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      parseAndApply(incoming);
      incoming = "";
    } else {
      incoming += c;
    }
  }
}

// Parse "G,Y,R,G" and apply to each lane
void parseAndApply(String data) {
  data.trim();
  int lane = 0;
  int start = 0;

  for (int i = 0; i <= data.length() && lane < NUM_LANES; i++) {
    if (i == data.length() || data[i] == ',') {
      String tok = data.substring(start, i);
      tok.trim();
      if (tok.length() > 0) {
        setSignal(lane, tok[0]);
        lane++;
      }
      start = i + 1;
    }
  }
}

// Set a single lane's LEDs
void setSignal(int lane, char sig) {
  digitalWrite(PINS[lane][0], LOW);   // Red   OFF
  digitalWrite(PINS[lane][1], LOW);   // Yellow OFF
  digitalWrite(PINS[lane][2], LOW);   // Green  OFF

  switch (sig) {
    case 'G': digitalWrite(PINS[lane][2], HIGH); break;   // Green
    case 'Y': digitalWrite(PINS[lane][1], HIGH); break;   // Yellow
    case 'R': digitalWrite(PINS[lane][0], HIGH); break;   // Red
  }
}

// Startup test — lights up all LEDs in sequence
void startupTest() {
  int seq[] = {0, 1, 2};  // Red → Yellow → Green
  const char* names[] = {"RED", "YELLOW", "GREEN"};

  for (int c = 0; c < 3; c++) {
    for (int i = 0; i < NUM_LANES; i++)
      digitalWrite(PINS[i][seq[c]], HIGH);
    delay(300);
    for (int i = 0; i < NUM_LANES; i++)
      digitalWrite(PINS[i][seq[c]], LOW);
  }
}
