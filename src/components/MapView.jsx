import React, { useEffect, useRef } from 'react';

// Shared logic constants
const DIRS = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
const CAR_L = 40;
const CAR_W = 20;
const ROAD_WIDTH = 140;
const MAP_SIZE = 1000;
const CENTER = MAP_SIZE / 2;

// Vehicle class — defined at module scope so all hooks can access it
class Vehicle {
  constructor(dir, isAmbulance = false) {
    this.dir = dir;
    this.isAmbulance = isAmbulance;
    this.speed = isAmbulance ? 8 : (2.5 + Math.random() * 2);
    this.maxSpeed = this.speed;
    this.x = 0;
    this.y = 0;
    this.w = ['NORTH', 'SOUTH'].includes(dir) ? CAR_W : CAR_L;
    this.h = ['NORTH', 'SOUTH'].includes(dir) ? CAR_L : CAR_W;
    this.color = isAmbulance ? '#FFFFFF' : `hsl(${Math.random() * 360}, 80%, 60%)`;

    const OFFSET = ROAD_WIDTH / 4;
    if (dir === 'NORTH') { this.x = CENTER - OFFSET; this.y = -50; }
    if (dir === 'SOUTH') { this.x = CENTER + OFFSET; this.y = MAP_SIZE + 50; }
    if (dir === 'EAST')  { this.y = CENTER - OFFSET; this.x = MAP_SIZE + 50; }
    if (dir === 'WEST')  { this.y = CENTER + OFFSET; this.x = -50; }
  }

  update(vehicles, signals) {
    let distCenter;
    let isApproaching = false;

    if (this.dir === 'NORTH') { distCenter = CENTER - this.y; isApproaching = this.y < CENTER - ROAD_WIDTH / 2; }
    if (this.dir === 'SOUTH') { distCenter = this.y - CENTER; isApproaching = this.y > CENTER + ROAD_WIDTH / 2; }
    if (this.dir === 'WEST')  { distCenter = CENTER - this.x; isApproaching = this.x < CENTER - ROAD_WIDTH / 2; }
    if (this.dir === 'EAST')  { distCenter = this.x - CENTER; isApproaching = this.x > CENTER + ROAD_WIDTH / 2; }

    const stopDist = ROAD_WIDTH / 2 + 20;
    const isAtStopLine = distCenter > stopDist && distCenter < stopDist + 60;

    let distToCar = Infinity;
    for (let v of vehicles) {
      if (v !== this && v.dir === this.dir) {
        let d = Infinity;
        if (this.dir === 'NORTH' && v.y > this.y) d = v.y - this.y;
        if (this.dir === 'SOUTH' && v.y < this.y) d = this.y - v.y;
        if (this.dir === 'WEST'  && v.x > this.x) d = v.x - this.x;
        if (this.dir === 'EAST'  && v.x < this.x) d = this.x - v.x;
        if (d > 0 && d < distToCar) distToCar = d;
      }
    }

    let target = this.maxSpeed;
    const sig = signals[this.dir];

    if (isApproaching && isAtStopLine && (sig === 'R' || sig === 'Y')) {
      if (!this.isAmbulance) target = 0;
    }

    if (distToCar < (this.isAmbulance ? 60 : 50)) {
      target = 0;
    } else if (distToCar < 120) {
      target *= 0.5;
    }

    if (this.speed < target) this.speed += 0.2;
    if (this.speed > target) this.speed -= 0.6;
    if (this.speed < 0) this.speed = 0;

    if (this.dir === 'NORTH') this.y += this.speed;
    if (this.dir === 'SOUTH') this.y -= this.speed;
    if (this.dir === 'WEST')  this.x += this.speed;
    if (this.dir === 'EAST')  this.x -= this.speed;
  }

  draw(ctx, scale) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    if (this.isAmbulance) {
      ctx.roundRect(
        (this.x - this.w / 2) * scale,
        (this.y - this.h / 2) * scale,
        this.w * scale,
        this.h * scale,
        8 * scale
      );
      ctx.fill();
      // Siren flash
      ctx.fillStyle = Math.floor(Date.now() / 150) % 2 === 0 ? '#FF3B3B' : '#00D4FF';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(
        (this.x - this.w / 4) * scale,
        (this.y - this.h / 4) * scale,
        (this.w / 2) * scale,
        (this.h / 2) * scale,
        2 * scale
      );
      ctx.fill();
    } else {
      ctx.roundRect(
        (this.x - this.w / 2) * scale,
        (this.y - this.h / 2) * scale,
        this.w * scale,
        this.h * scale,
        4 * scale
      );
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}

// Draw the intersection environment
function drawEnv(ctx, scale, emergencyRoute) {
  ctx.clearRect(0, 0, MAP_SIZE * scale, MAP_SIZE * scale);

  // Roads
  ctx.fillStyle = '#1e1e24';
  ctx.fillRect((CENTER - ROAD_WIDTH / 2) * scale, 0, ROAD_WIDTH * scale, MAP_SIZE * scale);
  ctx.fillRect(0, (CENTER - ROAD_WIDTH / 2) * scale, MAP_SIZE * scale, ROAD_WIDTH * scale);

  // Emergency route highlight (glowing corridor)
  if (emergencyRoute) {
    ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
    if (emergencyRoute === 'NORTH' || emergencyRoute === 'SOUTH') {
      ctx.fillRect((CENTER - ROAD_WIDTH / 2) * scale, 0, ROAD_WIDTH * scale, MAP_SIZE * scale);
    } else {
      ctx.fillRect(0, (CENTER - ROAD_WIDTH / 2) * scale, MAP_SIZE * scale, ROAD_WIDTH * scale);
    }
  }

  // Dashed lane markings
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 2 * scale;
  ctx.setLineDash([15 * scale, 15 * scale]);
  ctx.beginPath();
  ctx.moveTo(CENTER * scale, 0);
  ctx.lineTo(CENTER * scale, (CENTER - ROAD_WIDTH / 2) * scale);
  ctx.moveTo(CENTER * scale, (CENTER + ROAD_WIDTH / 2) * scale);
  ctx.lineTo(CENTER * scale, MAP_SIZE * scale);
  ctx.moveTo(0, CENTER * scale);
  ctx.lineTo((CENTER - ROAD_WIDTH / 2) * scale, CENTER * scale);
  ctx.moveTo((CENTER + ROAD_WIDTH / 2) * scale, CENTER * scale);
  ctx.lineTo(MAP_SIZE * scale, CENTER * scale);
  ctx.stroke();

  // Solid stop lines
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4 * scale;
  ctx.setLineDash([]);
  ctx.beginPath();
  // North stop line
  ctx.moveTo((CENTER - ROAD_WIDTH / 2) * scale, (CENTER - ROAD_WIDTH / 2) * scale);
  ctx.lineTo(CENTER * scale, (CENTER - ROAD_WIDTH / 2) * scale);
  // South stop line
  ctx.moveTo((CENTER + ROAD_WIDTH / 2) * scale, (CENTER + ROAD_WIDTH / 2) * scale);
  ctx.lineTo(CENTER * scale, (CENTER + ROAD_WIDTH / 2) * scale);
  // West stop line
  ctx.moveTo((CENTER - ROAD_WIDTH / 2) * scale, (CENTER + ROAD_WIDTH / 2) * scale);
  ctx.lineTo((CENTER - ROAD_WIDTH / 2) * scale, CENTER * scale);
  // East stop line
  ctx.moveTo((CENTER + ROAD_WIDTH / 2) * scale, (CENTER - ROAD_WIDTH / 2) * scale);
  ctx.lineTo((CENTER + ROAD_WIDTH / 2) * scale, CENTER * scale);
  ctx.stroke();
}

export default function MapView({ isEmergency, setDensities, setSignals, setCountdown, onEmergencyCleared }) {
  const canvasRef = useRef(null);

  // Physics engine state — persists across renders without causing re-renders
  const engine = useRef({
    vehicles: [],
    signals: { NORTH: 'G', SOUTH: 'G', EAST: 'R', WEST: 'R' },
    greenTimer: 15,
    phaseChangeTimer: 0,
    nextPhaseDirs: [],
    emergencyRoute: null,
    emergencyClearedCalled: false,
  });

  // Main canvas loop + AI logic tick
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let logicTickInterval;

    const resize = () => {
      const parent = canvas.parentElement;
      const size = Math.min(parent.clientWidth, parent.clientHeight) - 40;
      canvas.width = size;
      canvas.height = size;
    };
    window.addEventListener('resize', resize);
    resize();

    const e = engine.current;

    // Seed initial traffic
    if (e.vehicles.length === 0) {
      for (let i = 0; i < 8; i++) {
        e.vehicles.push(new Vehicle(DIRS[Math.floor(Math.random() * 4)]));
      }
    }

    // 60 FPS render loop
    const render = () => {
      const scale = canvas.width / MAP_SIZE;
      drawEnv(ctx, scale, e.emergencyRoute);

      for (let i = e.vehicles.length - 1; i >= 0; i--) {
        const v = e.vehicles[i];
        v.update(e.vehicles, e.signals);
        v.draw(ctx, scale);

        // Remove vehicles that have left the map
        if (v.x < -150 || v.x > MAP_SIZE + 150 || v.y < -150 || v.y > MAP_SIZE + 150) {
          if (v.isAmbulance && !e.emergencyClearedCalled) {
            e.emergencyClearedCalled = true;
            setTimeout(onEmergencyCleared, 0);
          }
          e.vehicles.splice(i, 1);
        }
      }
      animationId = requestAnimationFrame(render);
    };

    // AI decision engine — 1 Hz
    const aiTick = () => {
      const counts = { NORTH: 0, SOUTH: 0, EAST: 0, WEST: 0 };

      e.vehicles.forEach((v) => {
        let approaching = false;
        if (v.dir === 'NORTH' && v.y < CENTER) approaching = true;
        if (v.dir === 'SOUTH' && v.y > CENTER) approaching = true;
        if (v.dir === 'WEST'  && v.x < CENTER) approaching = true;
        if (v.dir === 'EAST'  && v.x > CENTER) approaching = true;
        if (approaching) counts[v.dir]++;
      });

      setDensities({ ...counts });

      // Emergency override — lock route green, everything else red
      if (e.emergencyRoute) {
        DIRS.forEach((d) => (e.signals[d] = 'R'));
        e.signals[e.emergencyRoute] = 'G';
        setSignals({ ...e.signals });
        setCountdown('--');
        if (Math.random() > 0.8) e.vehicles.push(new Vehicle(e.emergencyRoute));
        return;
      }

      // Phase transition (yellow → new green)
      if (e.phaseChangeTimer > 0) {
        e.phaseChangeTimer--;
        if (e.phaseChangeTimer === 0) {
          DIRS.forEach((d) => (e.signals[d] = 'R'));
          e.nextPhaseDirs.forEach((d) => (e.signals[d] = 'G'));
          e.greenTimer = 15;
        }
        setSignals({ ...e.signals });
        setCountdown(e.greenTimer);
        return;
      }

      // Standard AI density-based switching
      e.greenTimer--;
      if (e.greenTimer <= 0) {
        const ns = counts.NORTH + counts.SOUTH;
        const ew = counts.EAST + counts.WEST;
        const isNS = e.signals.NORTH === 'G' || e.signals.SOUTH === 'G';

        let switchPhase = false;
        if (isNS && ew > ns) {
          switchPhase = true;
          e.nextPhaseDirs = ['EAST', 'WEST'];
        } else if (!isNS && ns > ew) {
          switchPhase = true;
          e.nextPhaseDirs = ['NORTH', 'SOUTH'];
        } else if (e.greenTimer < -10 && (ns > 0 || ew > 0)) {
          switchPhase = true;
          e.nextPhaseDirs = isNS ? ['EAST', 'WEST'] : ['NORTH', 'SOUTH'];
        }

        if (switchPhase) {
          DIRS.forEach((d) => { if (e.signals[d] === 'G') e.signals[d] = 'Y'; });
          e.phaseChangeTimer = 3;
        } else {
          e.greenTimer = 5;
        }
      }

      setSignals({ ...e.signals });
      setCountdown(Math.max(0, e.greenTimer));

      // Auto-spawn traffic
      if (Math.random() > 0.4) {
        e.vehicles.push(new Vehicle(DIRS[Math.floor(Math.random() * 4)]));
      }
    };

    render();
    logicTickInterval = setInterval(aiTick, 1000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(logicTickInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // React to external emergency trigger from parent
  useEffect(() => {
    const e = engine.current;
    if (isEmergency && !e.emergencyRoute) {
      const randDir = DIRS[Math.floor(Math.random() * 4)];
      e.emergencyRoute = randDir;
      e.emergencyClearedCalled = false;
      e.vehicles.push(new Vehicle(randDir, true));
    } else if (!isEmergency) {
      e.emergencyRoute = null;
    }
  }, [isEmergency]);

  return (
    <div className="flex-1 glass-panel flex justify-center items-center relative p-4">
      <canvas ref={canvasRef} className="w-full h-full object-contain rounded-xl"></canvas>
    </div>
  );
}
