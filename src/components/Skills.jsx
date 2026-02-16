import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionWrapper from './SectionWrapper';
import TiltCard from './TiltCard';
import ISS3D from './ISS3D';

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

const ISSLoadingFallback = () => (
  <group>
    <mesh castShadow>
      <boxGeometry args={[1, 0.35, 0.35]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[1, 0, 0]} castShadow>
      <boxGeometry args={[1.4, 0.12, 0.04]} />
      <meshStandardMaterial color="#38bdf8" emissive="#1d4ed8" emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[-1, 0, 0]} castShadow>
      <boxGeometry args={[1.4, 0.12, 0.04]} />
      <meshStandardMaterial color="#38bdf8" emissive="#1d4ed8" emissiveIntensity={0.4} />
    </mesh>
    <Sparkles count={24} scale={4} size={1.8} speed={0.45} opacity={0.5} color="#93c5fd" />
  </group>
);

const Skills = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [threeEnabled, setThreeEnabled] = useState(true);
  const [highlightCategory, setHighlightCategory] = useState(null);
  const [issInfo, setIssInfo] = useState(null);
  const [issError, setIssError] = useState(false);

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

  // Live ISS location (for realism)
  useEffect(() => {
    let cancelled = false;

    const fetchISS = () => {
      fetch('https://api.wheretheiss.at/v1/satellites/25544')
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (cancelled) return;
          setIssInfo({
            latitude: data.latitude,
            longitude: data.longitude,
            altitude: data.altitude, // km
            velocity: data.velocity, // km/h
          });
          setIssError(false);
        })
        .catch(() => {
          if (cancelled) return;
          setIssError(true);
        });
    };

    fetchISS();
    const id = setInterval(fetchISS, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

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
        <p className="text-text-muted text-sm md:text-base mb-10 max-w-2xl">
          This section maps my core skills onto a mission-style visualization. Each module in the interface
          represents a capability — from frontend systems to backend services — all working together like an
          orbiting station.
        </p>

        <div className="flex flex-col lg:flex-row gap-16 items-start skills-wrapper">
          {/* Left Column: Categorized Skills */}
          <div className="w-full lg:w-3/5 space-y-12">
            {skillCategories.map((category, idx) => (
              <div
                key={idx}
                className="skill-category"
                onMouseEnter={() => setHighlightCategory(category.title)}
                onMouseLeave={() => setHighlightCategory(null)}
              >
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

          {/* Right Column: ISS (Local GLB) */}
          <div className="w-full lg:w-2/5 h-[300px] lg:h-[600px] sticky top-24">
             <div 
                ref={containerRef}
                className="relative w-full h-full cursor-move bg-secondary/20 rounded-2xl border border-secondary/50 backdrop-blur-sm overflow-hidden"
                onMouseEnter={() => setZoomEnabled(true)}
                onMouseLeave={() => setZoomEnabled(false)}
             >
               {/* Decorative background gradient */}
               <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />

               {/* Live ISS telemetry HUD */}
               {issInfo && (
                 <div className="absolute top-4 left-4 bg-slate-950/80 border border-accent/30 rounded-lg px-3 py-2 text-[0.65rem] md:text-xs text-slate-200/90 font-mono backdrop-blur-md shadow-lg">
                   <div className="flex items-center justify-between gap-4 mb-1">
                     <span className="tracking-[0.18em] uppercase text-slate-400 text-[0.55rem] md:text-[0.6rem]">
                       Live ISS Telemetry
                     </span>
                     {issError && (
                       <span className="text-red-400 text-[0.55rem] uppercase">
                         Offline
                       </span>
                     )}
                   </div>
                   <div className="flex flex-col gap-0.5 text-[0.7rem] md:text-[0.75rem]">
                     <span>
                       Lat {issInfo.latitude.toFixed(1)}° · Lon {issInfo.longitude.toFixed(1)}°
                     </span>
                     <span>
                       Alt {issInfo.altitude.toFixed(0)} km · Vel {Math.round(issInfo.velocity)} km/h
                     </span>
                   </div>
                 </div>
               )}

               {threeEnabled ? (
                 <Canvas
                   shadows
                   camera={{ position: [0, 0, 8], fov: 45 }}
                   dpr={[1, 1.5]}
                   gl={{ antialias: false, powerPreference: 'low-power' }}
                 >
                   <ambientLight intensity={0.8} />
                   <directionalLight
                     position={[6, 8, 5]}
                     intensity={1.8}
                     castShadow
                     shadow-mapSize-width={1024}
                     shadow-mapSize-height={1024}
                     shadow-bias={-0.0001}
                   />
                   <pointLight position={[-6, 2, -4]} intensity={0.6} color="#93c5fd" />
                   <pointLight position={[6, 3, 4]} intensity={0.8} />

                   <Suspense
                     fallback={<ISSLoadingFallback />}
                   >
                     <ISS3D highlightCategory={highlightCategory} />
                     <Sparkles
                       count={50}
                       scale={10}
                       size={2}
                       speed={0.3}
                       opacity={0.4}
                       color="#60a5fa"
                     />
                   </Suspense>

                   <OrbitControls
                     ref={controlsRef}
                     enableZoom={zoomEnabled}
                     autoRotate={!zoomEnabled}
                     autoRotateSpeed={0.5}
                     minPolarAngle={Math.PI / 6}
                     maxPolarAngle={Math.PI - Math.PI / 6}
                     minDistance={3}
                     maxDistance={15}
                   />
                 </Canvas>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted text-sm font-mono gap-3 px-6 text-center">
                   <div>Interactive preview disabled for performance</div>
                 </div>
               )}
               
               <div className="absolute bottom-4 right-4 text-xs text-text-muted font-mono pointer-events-none bg-secondary/80 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
                 International Space Station (Local)
               </div>
               {threeEnabled && (
                 <div className="absolute bottom-4 left-4 text-[0.65rem] md:text-xs text-text-muted/80 font-mono bg-secondary/80 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                   Rotate: drag · Zoom: scroll
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Skills;
