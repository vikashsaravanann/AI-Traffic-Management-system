import React from 'react';
import { Car, BarChart2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SidebarLeft({ densities, peakLane }) {
  const directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
  const totalCars = Object.values(densities).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4 w-80 shrink-0">
      <div className="glass-panel p-6">
        <h2 className="text-xs font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
          <BarChart2 className="w-4 h-4 text-primary" /> Traffic Analytics
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl">
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Flow</div>
            <div className="text-3xl font-display font-bold text-white leading-none">{totalCars}</div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl">
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Peak Lane</div>
            <div className="text-xl font-display font-bold text-danger leading-none">{peakLane || '---'}</div>
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-[0.2em]">Lane Density Metrics</h3>
          {directions.map((dir) => {
            const count = densities[dir];
            const percentage = Math.min(100, Math.round((count / 20) * 100));
            const isPeak = dir === peakLane;
            const barColor = percentage > 80 ? 'bg-danger' : percentage > 50 ? 'bg-warning' : 'bg-success';

            return (
              <div key={dir} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold flex items-center gap-2 transition-colors ${isPeak ? 'text-primary' : 'text-gray-400'}`}>
                    <Car className={`w-3 h-3 ${isPeak ? 'text-primary' : 'text-gray-500'}`} /> {dir}
                  </span>
                  <span className={`text-xs font-mono font-bold ${isPeak ? 'text-white' : 'text-gray-400'}`}>{count}</span>
                </div>
                <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    className={`h-full ${barColor} relative shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
                  >
                     {isPeak && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-6 mt-auto">
         <h2 className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp className="w-4 h-4 text-primary" /> AI Core Intelligence
         </h2>
         <div className="relative">
             <div className="absolute -left-6 top-0 bottom-0 w-1 bg-linear-to-b from-primary to-transparent opacity-50"></div>
             <p className="text-sm text-gray-300 leading-relaxed font-medium italic">
               <AnimatePresence mode="wait">
                 <motion.span
                   key={peakLane}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 10 }}
                 >
                   {peakLane 
                     ? `Neural engine prioritizing ${peakLane} corridor. Adaptive signal duration extended to clear heavy congestion.`
                     : `Environment stable. Global throughput optimization active. No critical bottlenecks detected.`}
                 </motion.span>
               </AnimatePresence>
             </p>
         </div>
         <div className="mt-6 flex items-center gap-2">
            <div className="signal-dot bg-primary"></div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Processing Real-time Data</span>
         </div>
      </div>
    </div>
  );
}
