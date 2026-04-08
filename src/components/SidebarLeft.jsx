import React from 'react';
import { Car, BarChart2, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SidebarLeft({ densities, peakLane }) {
  const directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
  const totalCars = Object.values(densities).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4 w-80 shrink-0">
      <div className="glass-panel p-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
          <BarChart2 className="w-4 h-4 text-primary" /> Traffic Analytics
        </h2>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
            <div className="text-gray-400 text-xs font-semibold mb-1">Total Vehicles</div>
            <div className="text-2xl font-bold text-white">{totalCars}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
            <div className="text-gray-400 text-xs font-semibold mb-1">Peak Lane</div>
            <div className="text-xl font-bold text-danger">{peakLane || 'N/A'}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Lane Density</h3>
          {directions.map((dir) => {
            const count = densities[dir];
            // Normalize to a percentage (max ~20 cars per lane visual)
            const percentage = Math.min(100, Math.round((count / 20) * 100));
            const isPeak = dir === peakLane;
            const barColor = percentage > 75 ? 'bg-danger' : percentage > 40 ? 'bg-warning' : 'bg-success';

            return (
              <div key={dir} className={`p-3 rounded-lg border transition-all ${isPeak ? 'bg-white/10 border-primary/50 shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'bg-transparent border-white/5'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Car className="w-3 h-3 text-gray-400" /> {dir}
                  </span>
                  <span className="text-xs font-bold font-mono">{count}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${barColor}`} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-5 mt-auto">
         <h2 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp className="w-4 h-4 text-primary" /> AI Insights
         </h2>
         <div className="text-sm text-gray-300 leading-relaxed border-l-2 border-primary pl-3 mt-3">
           {peakLane 
             ? `AI Decision: Prioritizing ${peakLane} lane due to high vehicle volume.`
             : `AI Decision: Flow balanced. Optimizing general throughput.`}
         </div>
      </div>
    </div>
  );
}
