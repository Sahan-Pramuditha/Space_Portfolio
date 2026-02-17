import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Github, Linkedin, Mail, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { trackSocialClick, trackDownload } from '../utils/analytics';
import TechAnimation3D from './TechAnimation3D';

const TypewriterText = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Blinking cursor
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const timeout2 = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout2);
  }, [blink, prefersReducedMotion]);

  // Typing logic
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    if (subIndex === words[index].length + 1 && !reverse) {
      setReverse(true);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 75 : subIndex === words[index].length ? 1000 : 150, parseInt(Math.random() * 350)));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, prefersReducedMotion]);

  return (
    <span className="inline-block min-h-[1.2em]">
      {prefersReducedMotion ? words[0] : words[index].substring(0, subIndex)}
      <span className={`${blink ? 'opacity-100' : 'opacity-0'} ml-1 text-accent`}>|</span>
    </span>
  );
};

const Hero = () => {
  const compRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      // Only animate scroll indicator - text animations are handled by Framer Motion
      const scrollIndicator = compRef.current?.querySelector('.scroll-indicator');
      if (scrollIndicator) {
        gsap.to(scrollIndicator, {
          y: 10,
          repeat: -1,
          yoyo: true,
          duration: 1.5,
          ease: "power1.inOut"
        });
      }
    }, compRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    const envUrl = import.meta.env.VITE_RESUME_URL;
    if (envUrl) {
      setResumeUrl(envUrl);
      setResumeAvailable(true);
      return;
    }
    let cancelled = false;
    const candidates = [
      '/Sahan%20Pramuditha%20Resume.pdf',
      '/resume.pdf',
      '/Sahan_Pramuditha_CV.docx',
      '/Sahan_Pramuditha_CV.pdf',
      '/cv.pdf',
      '/CV.pdf'
    ];
    (async () => {
      for (const path of candidates) {
        try {
          const res = await fetch(path, { method: 'HEAD' });
          if (!cancelled && res.ok) {
            setResumeUrl(path);
            setResumeAvailable(true);
            break;
          }
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResumeDownload = async (e) => {
    e.preventDefault();
    if (!resumeUrl || downloading) return;
    try {
      setDownloading(true);
      const res = await fetch(resumeUrl);
      if (!res.ok) {
        setDownloading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (resumeUrl.split('/').pop()) || 'Sahan_Pramuditha_CV';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloading(false);
    } catch {
      setDownloading(false);
    }
  };

  return (
    <section ref={compRef} id="home" className="min-h-[100dvh] min-h-screen flex items-center justify-center relative z-10 overflow-hidden pt-20 sm:pt-24 md:pt-0 px-4 sm:px-0" style={{ position: 'relative' }}>
      <div className="container mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 sm:gap-12 items-center h-full max-w-7xl">
        
        {/* Text Content */}
        <motion.div 
          className="z-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
        >
          <motion.div 
            className="overflow-hidden mb-4"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <h2 className="text-accent font-mono text-lg">Hi, my name is</h2>
          </motion.div>
          <motion.div 
            className="mb-4"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text mb-2 font-display tracking-tight leading-tight">
              Sahan <span className="text-accent inline-block hover:scale-105 transition-transform duration-300 cursor-default text-shadow-glow">Pramuditha</span>
            </h1>
          </motion.div>
          <motion.div 
            className="overflow-hidden mb-6 h-20 md:h-auto"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-muted font-display flex flex-col md:block">
              <span>I build </span>
              <span className="text-text">
                <TypewriterText words={["Web Applications.", "Digital Experiences.", "Accessible Products.", "User Interfaces."]} />
              </span>
            </h2>
          </motion.div>
          <motion.div 
            className="overflow-hidden mb-8"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <p className="text-text-muted text-lg max-w-xl leading-relaxed">
              I'm a BICT student specializing in building (and occasionally designing) exceptional digital experiences. Currently, I'm focused on building accessible, human-centered products.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex gap-4 mb-10 justify-center md:justify-start"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <motion.a
              href="https://github.com/SahanPramuditha-Dev"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackSocialClick('github')}
              className="p-3 bg-secondary rounded-full text-text-muted hover:text-primary hover:bg-accent transition-all duration-300 transform shadow-md hover:shadow-lg"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="GitHub profile"
            >
              <Github size={24} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/sahan-pramuditha-754761356?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackSocialClick('linkedin')}
              className="p-3 bg-secondary rounded-full text-text-muted hover:text-primary hover:bg-accent transition-all duration-300 transform shadow-md hover:shadow-lg"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="LinkedIn profile"
            >
              <Linkedin size={24} />
            </motion.a>
            <motion.a
              href="mailto:contact@sahanpramuditha.com"
              onClick={() => trackSocialClick('email')}
              className="p-3 bg-secondary rounded-full text-text-muted hover:text-primary hover:bg-accent transition-all duration-300 transform shadow-md hover:shadow-lg"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Email Sahan"
            >
              <Mail size={24} />
            </motion.a>
          </motion.div>

          <motion.div 
            className="flex flex-wrap gap-4 justify-center md:justify-start"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <motion.a
              href="#projects"
              className="px-8 py-4 border border-accent text-accent rounded hover:bg-accent/10 transition-colors inline-block font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Check out my work!
            </motion.a>
            {resumeAvailable && (
              <motion.a
                href={resumeUrl}
                onClick={(e) => {
                  trackDownload('resume');
                  handleResumeDownload(e);
                }}
                className="px-8 py-4 bg-accent text-primary font-bold rounded hover:bg-accent/90 transition-colors inline-flex items-center gap-2 font-mono"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText size={20} />
                {downloading ? 'Downloading…' : (resumeUrl && resumeUrl.toLowerCase().endsWith('.docx') ? 'CV (DOCX)' : 'Resume')}
              </motion.a>
            )}
          </motion.div>
        </motion.div>

        {/* 3D Element */}
        <motion.div 
          className="hero-3d-container h-[280px] sm:h-[360px] md:h-[500px] w-full relative flex items-center justify-center order-first md:order-last mb-6 md:mb-0 min-h-0"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
           <TechAnimation3D />
        </motion.div>
      </div>

      <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 text-text-muted">
        <ArrowDown size={24} />
      </div>
    </section>
  );
};

export default Hero;
