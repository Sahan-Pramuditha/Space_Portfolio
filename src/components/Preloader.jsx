import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2200;
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;
    let completeTimeout;

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          completeTimeout = setTimeout(onComplete, 400);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => {
      clearInterval(timer);
      if (completeTimeout) clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-accent font-mono overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),transparent_60%)]" />
        <div className="absolute inset-0 opacity-35 mix-blend-screen bg-[radial-gradient(circle,_rgba(148,163,184,0.45)_1px,transparent_1px)] bg-[length:26px_26px]" />
      </div>

      <div className="relative flex flex-col items-center w-full max-w-xl px-6">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <div className="absolute inset-4 rounded-full border border-accent/40 border-dashed animate-[spin_18s_linear_infinite]" />
            <div className="absolute inset-8 rounded-full border border-accent/20" />
            <motion.div
              className="absolute left-1/2 top-0 -translate-x-1/2 origin-[50%_115%]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
            >
              <div className="w-6 h-6 md:w-7 md:h-7 bg-accent rounded-sm shadow-[0_0_20px_rgba(56,189,248,0.9)] rotate-45" />
            </motion.div>
            <div className="absolute inset-11 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/70 flex items-center justify-center">
              <span className="text-[0.55rem] md:text-xs tracking-[0.25em] uppercase text-slate-300/80">
                Initiating Launch
              </span>
            </div>
          </div>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl lg:text-9xl font-bold relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-accent to-white drop-shadow-[0_0_18px_rgba(56,189,248,0.45)]"
          animate={{ rotate: [-2, 0, 2, 0, -2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          {Math.round(count)}%
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-slate-300/80 text-xs md:text-sm tracking-[0.28em] uppercase"
      >
        Preparing Mission Systems
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 0.7, y: 10 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-3 text-[0.65rem] md:text-xs text-slate-400 tracking-[0.18em] uppercase"
      >
        Rendering Orbit - Calibrating Thrusters - Aligning UI
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
