import React from 'react';
import { motion } from 'framer-motion';

export default function SignalLight({ status, direction }) {
  const getGlow = (color) => {
    if (color === 'G') return status === 'G' ? 'shadow-[0_0_15px_#00FF88] scale-110' : 'opacity-20';
    if (color === 'Y') return status === 'Y' ? 'shadow-[0_0_15px_#FFD600] scale-110' : 'opacity-20';
    if (color === 'R') return status === 'R' ? 'shadow-[0_0_15px_#FF3B3B] scale-110' : 'opacity-20';
  };

  return (
    <div className="flex flex-col gap-1.5 p-2 bg-gray-900 rounded-xl border border-white/10 w-fit">
       <span className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider">{direction}</span>
       <motion.div className={`w-5 h-5 rounded-full bg-danger transition-all duration-300 ${getGlow('R')}`} />
       <motion.div className={`w-5 h-5 rounded-full bg-warning transition-all duration-300 ${getGlow('Y')}`} />
       <motion.div className={`w-5 h-5 rounded-full bg-success transition-all duration-300 ${getGlow('G')}`} />
    </div>
  );
}
