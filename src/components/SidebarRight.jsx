import React from 'react';
import { Settings, ShieldAlert, Zap, Radio } from 'lucide-react';
import SignalLight from './SignalLight';
import { motion } from 'framer-motion';

export default function SidebarRight({ signals, countdown, isEmergency, onTriggerEmergency }) {
  const activeGreen = Object.entries(signals).find(([, val]) => val === 'G')?.[0] || 'NONE';

  return (
    <div className="flex flex-col gap-4 w-80 shrink-0">
      <div className="glass-panel p-6">
        <h2 className="text-xs font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
          <Settings className="w-4 h-4 text-primary" /> Signal Status
        </h2>
        
        <div className="flex justify-around mb-8 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
          <SignalLight direction="N" status={signals.NORTH} />
          <SignalLight direction="E" status={signals.EAST} />
          <SignalLight direction="S" status={signals.SOUTH} />
          <SignalLight direction="W" status={signals.WEST} />
        </div>

        <div className="relative p-6 rounded-2xl text-center bg-linear-to-b from-white/[0.03] to-transparent border border-white/[0.05] overflow-hidden">
          <div className="text-gray-500 text-[10px] font-bold mb-2 uppercase tracking-[0.2em] relative z-10">Active Phase</div>
          <div className="text-2xl font-display font-bold text-success relative z-10 drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
            {activeGreen} CLEAR
          </div>
          
          <div className="mt-6 flex justify-center items-baseline gap-1 relative z-10">
            <span className="text-5xl font-mono font-bold text-white tracking-tighter">
                {typeof countdown === 'number' ? countdown : '--'}
            </span>
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">seconds</span>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.05]">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: typeof countdown === 'number' ? `${(countdown / 15) * 100}%` : '100%' }}
              transition={{ duration: 1, ease: 'linear' }}
              className="h-full bg-primary shadow-[0_0_10px_#00D4FF]"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 mt-auto border-danger/20">
        <h2 className="text-xs font-bold text-danger mb-4 flex items-center gap-2 uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4 animate-pulse" /> Emergency Control
        </h2>

        <div className="bg-danger/5 border border-danger/10 p-4 rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-2">
                <Radio className="w-3 h-3 text-danger" />
                <span className="text-[10px] font-bold text-danger/80 uppercase tracking-widest">Manual Override</span>
            </div>
            <p className="text-[11px] text-gray-400">Triggering this will immediately lock all lanes to RED and open the clearing corridor.</p>
        </div>

        <button 
          onClick={onTriggerEmergency}
          disabled={isEmergency}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
            isEmergency 
              ? 'bg-danger/20 text-danger border border-danger/50 cursor-not-allowed shadow-[inset_0_0_20px_rgba(255,59,59,0.2)]' 
              : 'btn-primary bg-white/[0.03] text-gray-300 hover:text-danger hover:border-danger'
          }`}
        >
          <Zap className={`w-5 h-5 ${isEmergency ? 'animate-bounce' : ''}`} />
          {isEmergency ? 'OVERRIDE LOGGED' : 'DETONATE AMBULANCE'}
        </button>
      </div>
    </div>
  );
}
