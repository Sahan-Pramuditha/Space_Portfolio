import React, { useEffect, useRef, useState, Suspense } from 'react';
import { ArrowDown, Github, Linkedin, Mail, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
const TechAnimation3D = React.lazy(() => import('./TechAnimation3D'));

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

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".hero-text-reveal", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2
      })
      .from(".hero-social-btn", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }, "-=0.5")
      .from(".hero-cta", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
      }, "-=0.3");

      gsap.to(".scroll-indicator", {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: "power1.inOut"
      });

    }, compRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={compRef} id="home" className="min-h-screen flex items-center justify-center relative z-10 overflow-hidden pt-24 md:pt-0">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center h-full">
        
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
            <h1 className="text-5xl lg:text-7xl font-bold text-text mb-2 font-display tracking-tight leading-tight">
              Sahan <span className="text-accent inline-block hover:scale-105 transition-transform duration-300 cursor-default text-shadow-glow">Pramuditha</span>
            </h1>
          </motion.div>
          <motion.div 
            className="overflow-hidden mb-6 h-20 md:h-auto"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-text-muted font-display flex flex-col md:block">
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
              I'm a SBIC student specializing in building (and occasionally designing) exceptional digital experiences. Currently, I'm focused on building accessible, human-centered products.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex gap-4 mb-10"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          >
            <motion.a
              href="https://github.com/sahanpramuditha"
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-secondary rounded-full text-text-muted hover:text-primary hover:bg-accent transition-all duration-300 transform shadow-md hover:shadow-lg"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="GitHub profile"
            >
              <Github size={24} />
            </motion.a>
            <motion.a
              href="https://linkedin.com/in/sahanpramuditha"
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-secondary rounded-full text-text-muted hover:text-primary hover:bg-accent transition-all duration-300 transform shadow-md hover:shadow-lg"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="LinkedIn profile"
            >
              <Linkedin size={24} />
            </motion.a>
            <motion.a
              href="mailto:contact@sahanpramuditha.com"
              className="p-3 bg-secondary rounded-full text-text-muted hover:text-primary hover:bg-accent transition-all duration-300 transform shadow-md hover:shadow-lg"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Email Sahan"
            >
              <Mail size={24} />
            </motion.a>
          </motion.div>

          <motion.div 
            className="flex flex-wrap gap-4"
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
            <motion.a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-accent text-primary font-bold rounded hover:bg-accent/90 transition-colors inline-flex items-center gap-2 font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText size={20} />
              Resume
            </motion.a>
          </motion.div>
        </motion.div>

        {/* 3D Element */}
        <motion.div 
          className="hero-3d-container h-[400px] md:h-[500px] w-full relative flex items-center justify-center order-first md:order-last mb-8 md:mb-0"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
           <Suspense fallback={<div className="w-full h-full rounded-2xl bg-gradient-to-br from-accent/20 via-secondary to-primary" />}>
             <TechAnimation3D />
           </Suspense>
        </motion.div>
      </div>

      <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 text-text-muted">
        <ArrowDown size={24} />
      </div>
    </section>
  );
};

export default Hero;
