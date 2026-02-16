import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2200; // slightly extended for smoother experience
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
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center min-h-[100dvh] min-h-[100vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-accent font-mono overflow-hidden px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      {/* Starfield + grid background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),transparent_60%)]" />
        <div className="absolute inset-0 opacity-35 mix-blend-screen bg-[radial-gradient(circle,_rgba(148,163,184,0.45)_1px,transparent_1px)] bg-[length:26px_26px]" />
      </div>

      {/* Single centered content block for mobile + desktop */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-xl text-center">
        {/* Orbiting ISS silhouette / capsule */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto">
            <div className="absolute inset-3 sm:inset-4 rounded-full border border-accent/40 border-dashed animate-[spin_18s_linear_infinite]" />
            <div className="absolute inset-6 sm:inset-8 rounded-full border border-accent/20" />
            <motion.div
              className="absolute left-1/2 top-0 -translate-x-1/2 origin-[50%_115%]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-accent rounded-sm shadow-[0_0_20px_rgba(56,189,248,0.9)] rotate-45" />
            </motion.div>
            <div className="absolute inset-8 sm:inset-10 md:inset-11 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/70 flex items-center justify-center">
              <span className="text-[0.5rem] sm:text-[0.55rem] md:text-xs tracking-[0.2em] md:tracking-[0.25em] uppercase text-slate-300/80 px-1">
                Initiating Launch
              </span>
            </div>
          </div>
        </motion.div>

        {/* Percentage */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-accent to-white drop-shadow-[0_0_18px_rgba(56,189,248,0.45)] leading-none"
          animate={{ rotate: [ -2, 0, 2, 0, -2 ] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          {Math.round(count)}%
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-6 text-slate-300/80 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.28em] uppercase"
        >
          Preparing Mission Systems
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 0.7, y: 10 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-2 sm:mt-3 text-[0.6rem] sm:text-[0.65rem] md:text-xs text-slate-400 tracking-[0.12em] sm:tracking-[0.18em] uppercase max-w-[280px] sm:max-w-none mx-auto leading-snug"
        >
          Rendering Orbit · Calibrating Thrusters · Aligning UI
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preloader;
