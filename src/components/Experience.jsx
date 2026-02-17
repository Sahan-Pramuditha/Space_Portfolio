import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import SectionWrapper from './SectionWrapper';

const experienceData = [
  {
    type: 'education',
    title: 'Bachelor of Information and Communication Technology (BICT)',
    organization: 'University of Colombo - Faculty of Technology',
    location: 'Sri Lanka',
    period: 'Sep 2024 - Expected Sep 2028',
    description: 'Currently pursuing a multidisciplinary ICT degree focused on System Administration, Network Administration, Database Management, and DevOps. Coursework includes Operating Systems, Programming, Computer Networks, and Databases, with practical milestones including a mini project, internship, and final-year research project.',
    skills: ['System Administration', 'Network Administration', 'Database Management', 'DevOps']
  },
  {
    type: 'work',
    title: 'Freelance Full-Stack Developer',
    organization: 'Self-Employed',
    location: 'Remote',
    period: '2022 - Present',
    description: 'Delivered 10+ custom web solutions for global clients, achieving a 100% satisfaction rate. Optimized legacy codebases to improve performance by an average of 30%. Managed end-to-end development lifecycles from requirement gathering to deployment.',
    skills: ['React', 'Node.js', 'Client Management', 'AWS']
  },
  {
    type: 'work',
    title: 'E‑commerce Operations & Platform Manager',
    organization: 'Wybe Fashion (wybe.lk)',
    location: 'Sri Lanka',
    period: 'See resume',
    description: 'Managed wybe.lk end‑to‑end — product & catalog management, pricing strategies, inventory synchronization, payment and fulfillment integrations, and platform reliability at scale. Led operational workflows across online and in‑store channels, improving order-processing efficiency and supporting peak traffic (see resume for metrics).',
    skills: ['E‑commerce Operations', 'Platform Scaling', 'Inventory Management', 'Payments & Fulfillment']
  },
  {
    type: 'education',
    title: 'G.C.E. Advanced Level (A/L) - Engineering Technology Stream',
    organization: 'Christ King College, Thudella',
    location: 'Sri Lanka',
    period: '2022 - 2023',
    description: 'A grades in ICT, Science for Technology, and General English, with a B grade in Engineering Technology. Achieved Z-Score 2.0519 (District Rank: 41, Island Rank: 343) and participated as a basketball team member.',
    skills: ['ICT', 'Engineering Technology', 'Science for Technology', 'General English']
  },
  {
    type: 'education',
    title: 'CAIT Course',
    organization: 'SLT-MOBITEL Nebula Institute of Technology',
    location: 'Welisara / Moratuwa / Kandy, Sri Lanka',
    period: '2020 (2.5 months)',
    description: 'Completed CAIT short course focused on ICT essentials and hands-on technical foundations including Office 365 applications, web and graphic design exposure, networking and OS security basics, and practical programming.',
    skills: ['Microsoft Office 365', 'Python', 'SQL', 'Power BI', 'Cyber Security']
  },
  {
    type: 'education',
    title: 'G.C.E. Ordinary Level (O/L)',
    organization: 'Christ King College, Thudella',
    location: 'Sri Lanka',
    period: '2019',
    description: 'Completed Ordinary Level studies in English medium.',
    skills: ['English Medium', 'Academic Foundation']
  }
];

const ExperienceCard = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className={`relative flex items-center justify-between md:justify-center gap-8 ${
        index % 2 === 0 ? 'md:flex-row-reverse' : ''
      }`}
    >
      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-5/12" />

      {/* Timeline Dot */}
      <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-secondary border-4 border-accent z-10 flex items-center justify-center shadow-[0_0_20px_rgb(var(--color-accent-rgb)_/_0.5)]">
        <div className="w-3 h-3 bg-accent rounded-full animate-ping" />
      </div>

      {/* Content Card */}
      <div className="w-full md:w-5/12 pl-16 md:pl-0">
        <motion.div 
          whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
          className="glass-card p-6 rounded-xl border-l-4 border-accent hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-text group-hover:text-accent transition-colors font-display tracking-wide">
                {item.title}
              </h3>
              <p className="text-text-muted font-medium">{item.organization}</p>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Briefcase size={20} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-text-muted mb-4 font-mono">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {item.period}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {item.location}
            </span>
          </div>
          
          <p className="text-text-muted/80 mb-4 text-sm leading-relaxed">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {item.skills.map((skill) => (
              <span 
                key={skill} 
                className="px-3 py-1 text-xs font-mono rounded-full bg-primary border border-secondary text-accent hover:bg-accent hover:text-white transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Experience = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <SectionWrapper id="experience">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative" ref={ref}>
        <div>
          <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-8 sm:mb-12 md:mb-16 font-display gradient-text">
            <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">02.5.</span>
            <span className="flex-grow min-w-0">Experience & Education</span>
            <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
          </h2>

          <div className="relative space-y-12">
            {/* Center Line Background */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-secondary -translate-x-1/2 rounded-full" />
            
            {/* Animated Progress Line */}
            <motion.div 
              style={{ height: lineHeight }}
              className="absolute left-8 md:left-1/2 top-0 w-1 bg-accent -translate-x-1/2 rounded-full z-0 shadow-[0_0_15px_rgb(var(--color-accent-rgb)_/_0.8)]"
            />

            {experienceData.map((item, index) => (
              <ExperienceCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Experience;
