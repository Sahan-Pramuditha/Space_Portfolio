import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const colors = {
  sky: { accent: '#38bdf8', glow: '#0ea5e9', lightAccent: '#0284c7' },
  purple: { accent: '#a855f7', glow: '#d8b4fe', lightAccent: '#9333ea' },
  green: { accent: '#22c55e', glow: '#4ade80', lightAccent: '#16a34a' },
  orange: { accent: '#f97316', glow: '#fb923c', lightAccent: '#ea580c' },
  pink: { accent: '#ec4899', glow: '#f472b6', lightAccent: '#db2777' },
};

const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return null;
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return `${r} ${g} ${b}`;
};

export const ThemeProvider = ({ children }) => {
  const theme = 'dark';

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || 'sky';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const selectedColor = colors[accentColor];
    const accent = theme === 'dark' ? selectedColor.accent : selectedColor.lightAccent;
    const glow = theme === 'dark' ? selectedColor.glow : selectedColor.accent;
    const accentRgb = hexToRgb(accent);
    const glowRgb = hexToRgb(glow);

    if (theme === 'dark') {
      root.style.setProperty('--color-accent', selectedColor.accent);
      root.style.setProperty('--color-accent-glow', selectedColor.glow);
    } else {
      root.style.setProperty('--color-accent', selectedColor.lightAccent);
      root.style.setProperty('--color-accent-glow', selectedColor.accent);
    }

    if (accentRgb) {
      root.style.setProperty('--color-accent-rgb', accentRgb);
    }
    if (glowRgb) {
      root.style.setProperty('--color-accent-glow-rgb', glowRgb);
    }
    
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {};

  const changeAccentColor = (color) => {
    setAccentColor(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, changeAccentColor, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
