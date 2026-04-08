import React from 'react';
import { Settings, ShieldAlert, Zap } from 'lucide-react';
import SignalLight from './SignalLight';
import { motion } from 'framer-motion';

export default function SidebarRight({ signals, countdown, isEmergency, onTriggerEmergency }) {
  const activeGreen = Object.entries(signals).find(([, val]) => val === 'G')?.[0] || 'NONE';

  return (
    <div className="flex flex-col gap-4 w-80 shrink-0">
      <div className="glass-panel p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <Settings className="w-4 h-4 text-primary" /> Active Signals
        </h2>
        
        <div className="flex justify-around mb-6">
          <SignalLight direction="NORTH" status={signals.NORTH} />
          <SignalLight direction="EAST" status={signals.EAST} />
          <SignalLight direction="SOUTH" status={signals.SOUTH} />
          <SignalLight direction="WEST" status={signals.WEST} />
        </div>

        <div className="bg-white/5 border border-white/5 p-5 rounded-xl text-center relative overflow-hidden">
          <div className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-widest relative z-10">Active Lane</div>
          <div className="text-xl font-bold text-success relative z-10">{activeGreen} GREEN</div>
          <div className="mt-4 flex justify-center items-end gap-1 relative z-10">
            <span className="text-4xl font-mono font-bold text-white">{countdown}</span>
            <span className="text-gray-500 font-semibold mb-1">sec</span>
          </div>
          
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${(countdown / 15) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-1 bg-primary"
          />
        </div>
      </div>

      <div className="glass-panel p-5 mt-auto">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4 text-danger" /> Emergency Protocols
        </h2>

        <button 
          onClick={onTriggerEmergency}
          disabled={isEmergency}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
            isEmergency 
              ? 'bg-danger/20 text-danger border border-danger/50 cursor-not-allowed opacity-80' 
              : 'bg-white/5 text-gray-300 hover:bg-danger/20 hover:text-danger border border-white/10 hover:border-danger hover:shadow-[0_0_15px_rgba(255,59,59,0.3)]'
          }`}
        >
          <Zap className="w-5 h-5" />
          {isEmergency ? 'OVERRIDE ACTIVE' : 'SIMULATE AMBULANCE'}
        </button>
      </div>
    </div>
  );
}
