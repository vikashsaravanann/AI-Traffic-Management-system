import React, { useEffect, useRef } from 'react';
import { useTraffic } from '../utils/TrafficContext';

const DIRS = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
const CAR_L = 40;
const CAR_W = 20;
const ROAD_WIDTH = 140;
const MAP_SIZE = 1000;
const CENTER = MAP_SIZE / 2;

class Vehicle {
  constructor(dir, isAmbulance = false) {
    this.dir = dir;
    this.isAmbulance = isAmbulance;
    this.speed = isAmbulance ? 8 : (2.5 + Math.random() * 2);
    this.maxSpeed = this.speed;
    this.x = 0;
    this.y = 0;
    this.id = Math.random();
    this.w = ['NORTH', 'SOUTH'].includes(dir) ? CAR_W : CAR_L;
    this.h = ['NORTH', 'SOUTH'].includes(dir) ? CAR_L : CAR_W;
    this.color = isAmbulance ? '#FFFFFF' : `hsl(${200 + Math.random() * 40}, 80%, 50%)`; // Blueish theme

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

    const stopDist = ROAD_WIDTH / 2 + 30;
    const isAtStopLine = distCenter > stopDist && distCenter < stopDist + 80;

    let distToCar = Infinity;
    for (let v of vehicles) {
      if (v !== this && v.dir === this.dir) {
        let d = Infinity;
        if (this.dir === 'NORTH' && v.y > this.y) d = v.y - this.y;
        if (this.dir === 'SOUTH' && v.y < this.y) d = this.y - v.y;
        if (this.dir === 'WEST'  && v.x > this.x) d = v.x - this.x;
        if (this.dir === 'EAST'  && v.x < this.x) d = this.x - v.x;
        d -= CAR_L;
        if (d > 0 && d < distToCar) distToCar = d;
      }
    }

    let target = this.maxSpeed;
    const sigMap = { NORTH: 'north', SOUTH: 'south', EAST: 'east', WEST: 'west' };
    const sig = signals[sigMap[this.dir]];

    if (isApproaching && isAtStopLine && (sig === 'R' || sig === 'Y')) {
      if (!this.isAmbulance) target = 0;
    }

    const safeGap = this.isAmbulance ? 50 : 70;
    if (distToCar < safeGap) target = 0;
    else if (distToCar < safeGap * 2) target *= 0.5;

    if (this.speed < target) this.speed += 0.2;
    if (this.speed > target) this.speed -= 0.6;
    if (this.speed < 0) this.speed = 0;

    if (this.dir === 'NORTH') this.y += this.speed;
    if (this.dir === 'SOUTH') this.y -= this.speed;
    if (this.dir === 'WEST')  this.x += this.speed;
    if (this.dir === 'EAST')  this.x -= this.speed;
  }

  draw(ctx, scale) {
    ctx.save();
    ctx.translate(this.x * scale, this.y * scale);
    
    // Ambient Glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = (this.isAmbulance ? 30 : 10) * scale;

    ctx.fillStyle = this.color;
    const w = this.w * scale;
    const h = this.h * scale;
    ctx.roundRect(-w/2, -h/2, w, h, 4 * scale);
    ctx.fill();

    if (this.isAmbulance) {
        const phase = Math.floor(Date.now() / 150) % 2;
        ctx.fillStyle = phase === 0 ? '#ff0000' : '#00aaff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 20 * scale;
        ctx.beginPath();
        ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
  }
}

export default function MapView() {
  const { data } = useTraffic();
  const canvasRef = useRef(null);
  const vehicles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      const parent = canvas.parentElement;
      const size = Math.min(parent.clientWidth, parent.clientHeight);
      canvas.width = size;
      canvas.height = size;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const scale = canvas.width / MAP_SIZE;
      
      // Clear & Draw Road
      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Road
      ctx.fillStyle = '#11141d';
      ctx.fillRect((CENTER - ROAD_WIDTH/2)*scale, 0, ROAD_WIDTH*scale, canvas.height);
      ctx.fillRect(0, (CENTER - ROAD_WIDTH/2)*scale, canvas.width, ROAD_WIDTH*scale);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for(let i=0; i<MAP_SIZE; i+=50) {
          ctx.beginPath(); ctx.moveTo(i*scale, 0); ctx.lineTo(i*scale, canvas.height); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i*scale); ctx.lineTo(canvas.width, i*scale); ctx.stroke();
      }

      // Vehicles
      const currentVehicles = vehicles.current;
      
      // Spawn logic based on density
      const totalInSim = currentVehicles.length;
      const targetDensity = Object.values(data.densities).reduce((a,b)=>a+b, 0);
      
      if (totalInSim < targetDensity && Math.random() > 0.5) {
          const dir = DIRS[Math.floor(Math.random()*4)];
          currentVehicles.push(new Vehicle(dir, data.emergency === dir.toLowerCase()));
      }

      for (let i = currentVehicles.length - 1; i >= 0; i--) {
        const v = currentVehicles[i];
        v.update(currentVehicles, data.signals);
        v.draw(ctx, scale);

        if (v.x < -100 || v.x > MAP_SIZE + 100 || v.y < -100 || v.y > MAP_SIZE + 100) {
            currentVehicles.splice(i, 1);
        }
      }

      // Stop Line Glows
      const glows = {
          north: { x: CENTER - ROAD_WIDTH/4, y: CENTER - ROAD_WIDTH/2 - 10 },
          south: { x: CENTER + ROAD_WIDTH/4, y: CENTER + ROAD_WIDTH/2 + 10 },
          west:  { x: CENTER - ROAD_WIDTH/2 - 10, y: CENTER + ROAD_WIDTH/4 },
          east:  { x: CENTER + ROAD_WIDTH/2 + 10, y: CENTER - ROAD_WIDTH/4 }
      };

      Object.entries(data.signals).forEach(([key, sig]) => {
          const g = glows[key];
          const color = sig === 'G' ? '#00ff88' : (sig === 'Y' ? '#ffaa00' : '#ff3b3b');
          ctx.shadowColor = color;
          ctx.shadowBlur = 40 * scale;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(g.x * scale, g.y * scale, 12 * scale, 0, Math.PI * 2);
          ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [data]);

  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden rounded-3xl border border-white/5 bg-surface/50 shadow-inner-premium translate-z-0">
      <canvas ref={canvasRef} className="opacity-80"></canvas>
    </div>
  );
}
