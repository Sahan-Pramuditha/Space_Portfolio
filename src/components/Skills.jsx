import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionWrapper from './SectionWrapper';
import TiltCard from './TiltCard';
import Laptop3D from './Laptop3D';

gsap.registerPlugin(ScrollTrigger);

const skillCategories = [
  {
    title: "Languages",
    skills: [
      { name: "JavaScript (ES6+)", level: 95, proficiency: "Advanced", rationale: "Core of modern web dev" },
      { name: "Python", level: 80, proficiency: "Proficient", rationale: "Data analysis & scripting" },
      { name: "HTML5", level: 95, proficiency: "Advanced", rationale: "Semantic markup" },
      { name: "CSS3", level: 95, proficiency: "Advanced", rationale: "Responsive design" }
    ]
  },
  {
    title: "Frameworks",
    skills: [
      { name: "React", level: 90, proficiency: "Advanced", rationale: "Component architecture" },
      { name: "Next.js", level: 85, proficiency: "Proficient", rationale: "SSR & Performance" },
      { name: "Tailwind", level: 95, proficiency: "Advanced", rationale: "Rapid styling" },
      { name: "Three.js", level: 75, proficiency: "Intermediate", rationale: "3D Visualizations" }
    ]
  },
  {
    title: "Tools & Backend",
    skills: [
      { name: "Node.js", level: 85, proficiency: "Proficient", rationale: "Scalable backend" },
      { name: "Git", level: 85, proficiency: "Proficient", rationale: "Version control" },
      { name: "MongoDB", level: 80, proficiency: "Proficient", rationale: "NoSQL Database" },
      { name: "Figma", level: 75, proficiency: "Intermediate", rationale: "Design to Code" }
    ]
  }
];

const Skills = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [threeEnabled, setThreeEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const prefersReducedMotion = reduceMotionQuery.matches;
      const saveData = navigator.connection?.saveData;
      const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
      setThreeEnabled(!prefersReducedMotion && !saveData && !lowMemory);
    };
    update();
    reduceMotionQuery.addEventListener('change', update);
    return () => {
      reduceMotionQuery.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
        // Always prevent page scroll if interacting with the canvas container
        // This is more robust than relying on state in the event listener
        if (!threeEnabled) return;
        e.preventDefault();
        e.stopPropagation();
    };

    // Add passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [threeEnabled]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".skill-category", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".skills-wrapper",
          start: "top 80%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper id="skills" className="bg-secondary/30 transition-colors duration-300">
      <div className="container mx-auto px-6" ref={sectionRef}>
        <h2 className="flex items-center text-2xl md:text-3xl font-bold text-text mb-12 md:mb-16 gradient-text">
          <span className="text-accent font-mono text-xl mr-2">02.</span> Skills & Technologies
          <span className="h-px bg-secondary flex-grow ml-4 opacity-50"></span>
        </h2>

        <div className="flex flex-col lg:flex-row gap-16 items-start skills-wrapper">
          {/* Left Column: Categorized Skills */}
          <div className="w-full lg:w-3/5 space-y-12">
            {skillCategories.map((category, idx) => (
              <div key={idx} className="skill-category">
                <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  {category.title}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {category.skills.map((skill) => (
                    <TiltCard key={skill.name}>
                      <div className="group bg-primary/50 p-4 rounded-lg border border-secondary hover:border-accent/50 transition-colors h-full">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-text">{skill.name}</span>
                          <span className="text-xs font-mono px-2 py-1 bg-secondary rounded text-accent">
                            {skill.proficiency}
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-accent rounded-full transform origin-left transition-transform duration-1000"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-text-muted">{skill.rationale}</p>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: 3D Laptop */}
          <div className="w-full lg:w-2/5 h-[300px] lg:h-[600px] sticky top-24">
             <div 
                ref={containerRef}
                className="relative w-full h-full cursor-move bg-secondary/20 rounded-2xl border border-secondary/50 backdrop-blur-sm overflow-hidden"
                onMouseEnter={() => setZoomEnabled(true)}
                onMouseLeave={() => setZoomEnabled(false)}
             >
               {/* Decorative background gradient */}
               <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
               
               {threeEnabled ? (
                 <Canvas
                   shadows
                   camera={{ position: [0, 2, 6], fov: 45 }}
                   dpr={[1, 1.5]}
                   gl={{ antialias: false, powerPreference: 'low-power' }}
                 >
                   <ambientLight intensity={0.6} />
                   <directionalLight
                     position={[6, 8, 5]}
                     intensity={1.4}
                     castShadow
                     shadow-mapSize-width={1024}
                     shadow-mapSize-height={1024}
                     shadow-bias={-0.0001}
                   />
                   <pointLight position={[-6, 2, -4]} intensity={0.6} color="#93c5fd" />
                   <pointLight position={[6, 3, 4]} intensity={0.8} />
                   
                   <Laptop3D />
                   
                   <Sparkles count={30} scale={8} size={4} speed={0.4} opacity={0.5} color="#0ea5e9" />
                   <OrbitControls enableZoom={zoomEnabled} autoRotate={!zoomEnabled} autoRotateSpeed={0.5} minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/2} />
                 </Canvas>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm font-mono">
                   Interactive preview disabled for performance
                 </div>
               )}
               
               <div className="absolute bottom-4 right-4 text-xs text-text-muted font-mono pointer-events-none bg-secondary/80 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
                 Interactive Workspace
               </div>
             </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Skills;
