import React, { useEffect, useState, useRef, Suspense } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Code2, Server, Users } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
const About3D = React.lazy(() => import('./About3D'));
import GithubStats from './GithubStats';
import profilePhoto from '../assets/profilephoto.jpeg';


// Stats data for the counters
const stats = [
  { label: 'Years Experience', value: 2, suffix: '+' },
  { label: 'Projects Completed', value: 5, suffix: '+' },
  { label: 'Lines of Code', value: 25, suffix: 'k+' },
  { label: 'Happy Clients', value: 5, suffix: '+' },
];

const Counter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(value);
      return;
    }
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value, prefersReducedMotion]);

  return (
    <span ref={ref} className="font-display font-bold text-4xl text-accent">
      {count}{suffix}
    </span>
  );
};

const About = () => {
  const GITHUB_USERNAME = "SahanPramuditha-Dev"; 
  const StatsImage = ({ src, alt, href }) => {
    const [failed, setFailed] = useState(false);
    if (failed) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 border border-accent text-accent rounded font-mono hover:bg-accent/10 transition-colors"
        >
          View on GitHub
        </a>
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="w-full max-w-md opacity-90 hover:opacity-100 transition-opacity"
        onError={() => setFailed(true)}
      />
    );
  };

  return (
    <SectionWrapper id="about">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <div className="flex flex-col md:flex-row gap-10 sm:gap-12 items-center mb-12 md:mb-20">
          {/* Image/Avatar */}
          <div className="md:w-1/3 flex justify-center w-full">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 group mx-auto">
              <div className="absolute inset-0 border-2 border-accent rounded-lg translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-accent/20 rounded-lg group-hover:bg-transparent transition-colors duration-300 z-10 pointer-events-none"></div>
              {/* Profile Photo */}
              <div className="w-full h-full bg-secondary rounded-lg overflow-hidden relative z-0">
                <img
                  src={profilePhoto}
                  alt="Sahan Pramuditha"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-2/3">
            <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-6 sm:mb-8 font-display gradient-text">
              <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">01.</span>
              <span className="flex-grow min-w-0">About Me</span>
              <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
            </h2>
            
            <div className="text-text-muted space-y-4 text-lg">
              <p>
                Hello! My name is Sahan and I enjoy creating things that live on the internet. My interest in web development started back in 2023 when I decided to try editing custom Tumblr themes — turns out hacking together HTML & CSS was pretty fun!
              </p>
              <p>
                Fast-forward to today, and I've had the privilege of building software for a variety of clients. My main focus these days is building accessible, inclusive products and digital experiences.
              </p>
              <p>
                I also manage Wybe.lk — overseeing end-to-end e‑commerce operations (catalog & pricing, inventory sync, payments and fulfillment integrations) and platform reliability for high-traffic events. See my resume for detailed metrics and outcomes.
              </p>
              <p>
                I am currently a student at <b>University Of Colombo</b> who is constantly learning and evolving my skills to stay up-to-date with the latest technologies.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-secondary/30 rounded-xl border border-secondary/40 hover:bg-secondary/50 transition-colors"
            >
              <Counter value={stat.value} suffix={stat.suffix} />
              <p className="text-text-muted text-sm mt-2 font-mono">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Engineering Approach */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-text mb-8 flex items-center gap-2">
            <span className="text-accent font-mono text-xl">01.1.</span> Engineering Approach
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-secondary/20 rounded-xl border border-secondary/50 hover:border-accent/50 transition-colors group">
              <Server className="text-accent mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-xl font-bold text-text mb-2">Scalable Architecture</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                I design systems that grow. Prioritizing modularity, microservices (when needed), and efficient database schemas to handle increasing loads without technical debt.
              </p>
            </div>
            <div className="p-6 bg-secondary/20 rounded-xl border border-secondary/50 hover:border-accent/50 transition-colors group">
              <Code2 className="text-accent mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-xl font-bold text-text mb-2">Clean & Maintainable</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                Code is read more than it's written. I follow SOLID principles, write self-documenting code, and ensure comprehensive test coverage for long-term maintainability.
              </p>
            </div>
            <div className="p-6 bg-secondary/20 rounded-xl border border-secondary/50 hover:border-accent/50 transition-colors group">
              <Users className="text-accent mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-xl font-bold text-text mb-2">User-Centric Design</h4>
              <p className="text-text-muted text-sm leading-relaxed">
                Performance and accessibility aren't afterthoughts. I build inclusive interfaces that load fast and provide a seamless experience for every user.
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Stats */}
        <div>
          <h3 className="text-2xl font-bold text-text mb-8 flex items-center gap-2">
            <span className="text-accent font-mono text-xl">01.2.</span> Open Source Presence
          </h3>
          <GithubStats username={GITHUB_USERNAME} />
          <p className="text-center text-text-muted mt-4 text-xs font-mono opacity-50">
            * Data fetched dynamically from GitHub
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default About;
