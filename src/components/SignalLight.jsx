import React from 'react';
import { motion } from 'framer-motion';

export default function SignalLight({ status, direction }) {
  const lights = [
    { type: 'R', color: 'bg-danger', glow: 'shadow-[0_0_20px_rgba(255,59,59,0.8)]' },
    { type: 'Y', color: 'bg-warning', glow: 'shadow-[0_0_20px_rgba(255,214,0,0.8)]' },
    { type: 'G', color: 'bg-success', glow: 'shadow-[0_0_20px_rgba(0,255,136,0.8)]' }
  ];

  return (
    <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{direction}</span>
        <div className="flex flex-col gap-2 p-2 bg-surface border border-white/5 rounded-2xl shadow-inner-premium w-fit backdrop-blur-md">
            {lights.map((light) => {
                const isActive = status === light.type;
                return (
                    <motion.div 
                        key={light.type}
                        animate={{ 
                            scale: isActive ? 1.15 : 1,
                            opacity: isActive ? 1 : 0.15 
                        }}
                        className={`w-4 h-4 rounded-full ${light.color} transition-all duration-500 ${isActive ? light.glow : ''}`} 
                    />
                );
            })}
        </div>
    </div>
  );
}
