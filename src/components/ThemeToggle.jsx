import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { accentColor, changeAccentColor, colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 relative">
      {/* Color Picker Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-secondary text-accent border border-accent/20 hover:border-accent hover:shadow-[0_0_15px_rgb(var(--color-accent-rgb)_/_0.3)] transition-all duration-300"
        aria-label="Change accent color"
      >
        <Palette size={20} />
      </motion.button>

      {/* Color Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-12 right-0 bg-secondary/90 backdrop-blur-md border border-accent/20 rounded-xl p-3 shadow-xl z-50 min-w-[150px]"
          >
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(colors).map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    changeAccentColor(color);
                    setIsOpen(false);
                  }}
                  className="w-6 h-6 rounded-full relative flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: colors[color].accent }}
                  title={color.charAt(0).toUpperCase() + color.slice(1)}
                >
                  {accentColor === color && (
                    <Check size={14} className="text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
