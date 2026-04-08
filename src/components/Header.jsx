import React, { useState, useEffect } from 'react';
import { Activity, MapPin } from 'lucide-react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel flex items-center justify-between px-6 py-4 mx-4 mt-4 select-none z-10 relative">
      <div className="flex items-center gap-3">
        <Activity className="text-primary w-6 h-6 animate-pulse" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-primary text-transparent bg-clip-text">
          AI Traffic Management System
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#00FF88]"></span>
          <span className="text-sm font-semibold tracking-wide text-success">System Active</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Coimbatore Smart Junction</span>
        </div>
        
        <div className="font-mono text-xl font-semibold w-24 text-right">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>
    </header>
  );
}
