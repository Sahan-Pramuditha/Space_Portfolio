import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Gamepad2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SnakeGame from './SnakeGame';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isGameOpen, setIsGameOpen] = useState(false);

  // Konami Code Logic
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setIsGameOpen(true);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const sections = ['home', 'about', 'skills', 'projects', 'certifications', 'contact'];
    let metrics = [];
    let ticking = false;

    const measureSections = () => {
      metrics = sections.map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const top = window.scrollY + rect.top;
        return { id, top, height: el.offsetHeight };
      }).filter(Boolean);
    };

    const updateOnScroll = () => {
      setScrolled(window.scrollY > 50);
      const scrollPosition = window.scrollY + 100;
      for (const m of metrics) {
        if (scrollPosition >= m.top && scrollPosition < m.top + m.height) {
          setActiveSection(m.id);
          break;
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateOnScroll();
          ticking = false;
        });
      }
    };

    const onResize = () => {
      measureSections();
      updateOnScroll();
    };

    measureSections();
    updateOnScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Skills', href: '#skills', id: 'skills' },
    { name: 'Projects', href: '#projects', id: 'projects' },
    { name: 'Certifications', href: '#certifications', id: 'certifications' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleClick = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-primary/80 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center max-w-7xl">
          <a href="#home" onClick={(e) => handleClick(e, '#home')} className="text-2xl font-bold text-accent">
            S<span className="text-text">ahan.</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className={`inline-flex items-center transition-colors duration-300 relative group font-medium nav-link ${
                  activeSection === link.id ? 'text-accent' : 'text-text-muted hover:text-accent'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.name}
                <span 
                  className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${
                    activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </motion.a>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsGameOpen(true)}
              className="p-2 rounded-full bg-secondary text-accent border border-accent/20 hover:border-accent hover:shadow-[0_0_15px_rgb(var(--color-accent-rgb)_/_0.3)] transition-all duration-300"
              aria-label="Play Game"
            >
              <Gamepad2 size={20} />
            </motion.button>
            
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button & Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsGameOpen(true)}
              className="p-2 rounded-full bg-secondary text-accent border border-accent/20"
              aria-label="Play Game"
            >
              <Gamepad2 size={20} />
            </motion.button>
            
            <ThemeToggle />
            <button
              className="text-text"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeInOut" } }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                className="md:hidden bg-primary/95 backdrop-blur-lg border-b border-secondary overflow-hidden absolute top-full left-0 w-full shadow-2xl"
              >
                <div className="flex flex-col items-center py-8 space-y-6">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                      className={`text-lg transition-colors font-medium ${
                        activeSection === link.id ? 'text-accent' : 'text-text-muted hover:text-accent'
                      }`}
                      onClick={(e) => handleClick(e, link.href)}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </nav>

      {/* Game Modal */}
      <SnakeGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
    </>
  );
};

export default Navbar;
