import React from "react";
import { MonitorPlay, Car, ShieldAlert, Activity } from 'lucide-react';
import Header from './components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { useTraffic } from './utils/TrafficContext';
import MapView from './components/MapView';

// ─── Constants ────────────────────────────────────────────────────────────────
const LANES = ["North", "South", "East", "West"];
const LANE_KEYS = ["north", "south", "east", "west"];

const SIGNAL_COLOR = {
  G: { bg: "bg-success", ring: "ring-success/40", label: "GREEN", text: "text-success", shadow: "shadow-success/20" },
  Y: { bg: "bg-warning", ring: "ring-warning/40", label: "YELLOW", text: "text-warning", shadow: "shadow-warning/20" },
  R: { bg: "bg-danger",  ring: "ring-danger/40",  label: "RED",    text: "text-danger", shadow: "shadow-danger/20" },
};

// ─── TrafficLight Component ────────────────────────────────────────────────────
function TrafficLight({ lane, signal, density }) {
  const s = SIGNAL_COLOR[signal] ?? SIGNAL_COLOR["R"];
  return (
    <div className="glass-panel p-4 flex flex-col items-center gap-3 transition-all duration-500 hover:border-primary/40 group relative overflow-hidden">
      <p className="text-[9px] font-black tracking-[0.2em] text-gray-500 uppercase z-10">{lane}</p>
      
      <div className="flex flex-col gap-2 bg-surface/80 border border-white/5 rounded-xl p-3 shadow-inner-premium z-10 transition-transform group-hover:scale-105">
        {["R", "Y", "G"].map((color) => (
          <motion.div
            key={color}
            animate={{ 
                scale: signal === color ? 1.2 : 1,
                opacity: signal === color ? 1 : 0.05 
            }}
            className={`w-5 h-5 rounded-full ${SIGNAL_COLOR[color].bg} ${signal === color ? `${SIGNAL_COLOR[color].ring} ring-2 ${SIGNAL_COLOR[color].shadow} shadow-lg` : ""}`}
          />
        ))}
      </div>

      <div className="w-full space-y-1.5 z-10">
          <div className="flex justify-between items-end">
              <span className={`text-[10px] font-black tracking-widest ${s.text}`}>{s.label}</span>
              <span className="text-[10px] font-bold text-gray-400">{density} <small className="text-[8px] opacity-40">VEH</small></span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((density / 30) * 100, 100)}%` }}
                className={`h-full ${s.bg} opacity-80`}
            />
          </div>
      </div>
      
      {/* Background glow for active lane */}
      <AnimatePresence>
        {signal === 'G' && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.05 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-success pointer-events-none"
            />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { data } = useTraffic();
  const totalVehicles = Object.values(data.densities).reduce((a, b) => a + b, 0);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative selection:bg-primary/20 font-sans text-white">
      
      {/* ── Emergency Alert ── */}
      <AnimatePresence>
        {data.emergency && (
          <motion.div 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed inset-x-0 top-0 z-[60] bg-danger text-white text-center py-2 text-[10px] font-black uppercase tracking-[0.4em] shadow-glow flex items-center justify-center gap-4"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            CRITICAL EVENT: Emergency Force Green — {data.emergency.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 min-h-0">
        
        {/* Left Stats Column (3/12) */}
        <div className="col-span-3 flex flex-col gap-6 overflow-y-auto">
           <section className="glass-panel p-6 bg-linear-to-b from-primary/10 to-transparent border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-primary/20 p-2 rounded-lg"><Activity className="w-4 h-4 text-primary" /></div>
                 <div>
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">Live Intelligence</h2>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Global Node Sync</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                 {[
                    { label: "Active Traffic", value: totalVehicles, unit: "VEHICLES" },
                    { label: "Inference Speed", value: Math.round(data.health.latency), unit: "MS/FRAME" },
                    { label: "Stability", value: "99.9", unit: "ESTIMATED %" }
                 ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/[0.08] transition-colors">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">{stat.label}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-display font-black leading-none">{stat.value}</span>
                            <span className="text-[8px] font-black text-primary/60">{stat.unit}</span>
                        </div>
                    </div>
                 ))}
              </div>
           </section>

           <section className="glass-panel p-6 flex-1 flex flex-col">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Control Logic</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {LANE_KEYS.map((key, i) => (
                        <TrafficLight 
                            key={key}
                            lane={LANES[i]}
                            signal={data.signals[key]}
                            density={data.densities[key]}
                        />
                    ))}
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-gray-500">ENGINE STATUS</span>
                        <span className="text-success">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-gray-500">SERIAL HANDSHAKE</span>
                        <span className={data.health.hardware ? "text-success" : "text-gray-600"}>
                            {data.health.hardware ? "SYNCED" : "OFFLINE"}
                        </span>
                    </div>
                </div>
           </section>
        </div>

        {/* Center/Main Column (9/12) */}
        <div className="col-span-9 flex flex-col gap-6 min-h-0">
            {/* Neural Simulation Area */}
            <div className="flex-1 relative">
                <MapView />
                
                {/* HUD Overlays */}
                <div className="absolute top-6 left-6 pointer-events-none space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">SIMULATION ENGINE v4.2</span>
                    </div>
                    <div className="text-[24px] font-display font-black text-white/10 select-none">COIMBATORE_JUNCTION_01</div>
                </div>

                <div className="absolute bottom-6 right-6 pointer-events-none flex flex-col items-end gap-1">
                    <span className="text-[32px] font-display font-black text-white/5 leading-none">YUDHISTHRA</span>
                    <span className="text-[10px] font-black text-primary/40 tracking-[0.3em]">AI COMMAND CENTER</span>
                </div>
            </div>

            {/* Video & Bottom Banner */}
            <div className="h-48 grid grid-cols-3 gap-6 shrink-0">
                <div className="col-span-2 glass-panel overflow-hidden relative group border-white/5">
                    <iframe
                        className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000"
                        src="https://www.youtube.com/embed/QBTkvCxaVdY"
                        title="Yudhisthra AI"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
                            <MonitorPlay className="w-3 h-3 text-primary" /> Visual Recognition Stream
                        </h3>
                    </div>
                </div>
                
                <div className="glass-panel p-6 flex flex-col justify-center gap-3 border-white/5 bg-linear-to-br from-white/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-gray-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Expert Edition<br/><span className="text-[8px] opacity-40">Build 2026.04.1.0</span></span>
                    </div>
                    <a 
                      href="https://github.com/vikashsaravanann/AI-Traffic-Management-system"
                      target="_blank"
                      className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-white transition-colors mt-2"
                    >
                      View Source Codes →
                    </a>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
