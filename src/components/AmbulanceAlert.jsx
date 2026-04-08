import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AmbulanceAlert({ isEmergency }) {
  return (
    <AnimatePresence>
      {isEmergency && (
        <motion.div
          initial={{ y: -100, x: '-50%', opacity: 0 }}
          animate={{ y: 20, x: '-50%', opacity: 1 }}
          exit={{ y: -100, x: '-50%', opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute top-0 left-1/2 z-50 flex items-center gap-3 px-6 py-3 bg-danger/20 border border-danger/60 rounded-full shadow-[0_0_30px_rgba(255,59,59,0.5)] backdrop-blur-md"
        >
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }} 
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <AlertTriangle className="w-6 h-6 text-danger" />
          </motion.div>
          <span className="font-bold tracking-widest text-danger uppercase">Emergency Mode Activated</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
