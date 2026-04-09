import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AmbulanceAlert({ isEmergency }) {
  return (
    <AnimatePresence>
      {isEmergency && (
        <>
          {/* Edge Glow Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[40] shadow-[inset_0_0_100px_rgba(255,59,59,0.2)]"
          />

          {/* Alert Banner */}
          <motion.div
            initial={{ y: -120, x: '-50%', opacity: 0, scale: 0.9 }}
            animate={{ y: 32, x: '-50%', opacity: 1, scale: 1 }}
            exit={{ y: -120, x: '-50%', opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-0 left-1/2 z-[50] flex items-center gap-4 px-8 py-4 bg-danger/20 border border-danger/60 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(255,59,59,0.3)] backdrop-blur-xl group overflow-hidden"
          >
            {/* Background scanner effect */}
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            />

            <div className="relative flex items-center gap-4">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="bg-danger/20 p-2 rounded-lg"
              >
                <AlertTriangle className="w-6 h-6 text-danger" />
              </motion.div>
              
              <div className="flex flex-col">
                <span className="text-xs font-bold text-danger/60 uppercase tracking-[0.3em] leading-none mb-1">Critical Event</span>
                <span className="font-display font-black tracking-widest text-white uppercase text-sm">Emergency Override Active</span>
              </div>

              <div className="h-8 w-[1px] bg-danger/30 mx-2" />

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Protocol</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                   <ShieldCheck className="w-3 h-3 text-success" /> SECURE
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
