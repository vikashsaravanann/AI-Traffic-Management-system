import React, { useState, useEffect } from 'react';
import { Activity, Link, Link2Off, Radio, Zap, ShieldCheck } from 'lucide-react';
import { serialManager } from '../utils/SerialController';
import { useTraffic } from '../utils/TrafficContext';

export default function Header() {
  const { data, mode, setMode } = useTraffic();
  const [isSerialConnected, setIsSerialConnected] = useState(false);

  useEffect(() => {
    serialManager.onStatusChange = (status) => setIsSerialConnected(status);
  }, []);

  const handleSerialConnect = async () => {
    if (isSerialConnected) await serialManager.disconnect();
    else await serialManager.connect();
  };

  return (
    <header className="glass-panel flex items-center justify-between px-8 py-5 mx-4 mt-4 select-none z-10 relative overflow-visible">
      {/* Brand & Status */}
      <div className="flex items-center gap-4">
        <Activity className="text-primary w-7 h-7 animate-pulse" />
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-white to-primary text-transparent bg-clip-text leading-none mb-1">
            Yudhisthra OS
          </h1>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span className={`w-2 h-2 rounded-full ${data.health.hardware ? 'bg-success shadow-glow' : 'bg-gray-700'}`}></span>
            {mode === 'simulation' ? <span className="text-warning">⚡ Simulation Mode</span> : <span className="text-primary">Neural Stream Active</span>}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-6 text-white">
        {/* Hardware Link (Required for Web Serial) */}
        <button 
          onClick={handleSerialConnect}
          className={`btn-primary flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest ${isSerialConnected ? 'border-success/50 text-success bg-success/10' : 'border-primary/20 text-primary'}`}
        >
          {isSerialConnected ? <ShieldCheck className="w-3 h-3" /> : <Link className="w-3 h-3" />}
          <span>{isSerialConnected ? 'Sync Active' : 'Initialize Sync'}</span>
        </button>

        {/* Neural Engine Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <ShieldCheck className={`w-3 h-3 ${data.health.hardware ? 'text-success' : 'text-gray-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {data.health.hardware ? 'AI Optimal' : 'Virtual Core'}
            </span>
        </div>
        
        {/* Time */}
        <div className="flex flex-col items-end border-l border-white/10 pl-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Session Node</span>
          <span className="font-mono text-sm font-bold text-gray-300">
            {data.timestamp}
          </span>
        </div>
      </div>
    </header>
  );
}
