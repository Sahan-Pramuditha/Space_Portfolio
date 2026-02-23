import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';
import { shouldDisableHeavyVisuals } from '../utils/runtimeGuards';

const PaperPlane = ({ theme }) => {
  const ref = useRef();
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    // Fly in a figure 8
    ref.current.position.x = Math.cos(t) * 2;
    ref.current.position.y = Math.sin(t * 2) * 0.5;
    ref.current.position.z = Math.sin(t) * 1.5;
    
    // Bank into turns
    ref.current.rotation.z = -Math.cos(t) * 0.5;
    ref.current.rotation.x = -Math.sin(t * 2) * 0.2;
    ref.current.rotation.y = Math.PI / 2 + t; // Face forward direction approx
  });

  const color = theme === 'dark' ? '#38bdf8' : '#0284c7';

  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.8, 4]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
};

const AbstractMailbox = () => {
  const { theme } = useTheme();
  const sphereColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
  const accentColor = theme === 'dark' ? '#38bdf8' : '#0284c7';

  return (
    <group>
      {/* Central "World" of connections */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere args={[1.5, 64, 64]}>
          <MeshDistortMaterial
            color={sphereColor}
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.4}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Orbiting Plane */}
      <PaperPlane theme={theme} />
      
      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={2} floatIntensity={2} position={[
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        ]}>
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const Contact3D = () => {
  const [enabled, setEnabled] = useState(() => !shouldDisableHeavyVisuals());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setEnabled(!shouldDisableHeavyVisuals());
    };
    update();
    reduceMotionQuery.addEventListener('change', update);
    return () => {
      reduceMotionQuery.removeEventListener('change', update);
    };
  }, []);

  if (!enabled) {
    return <div className="w-full h-full min-h-[400px] rounded-2xl bg-gradient-to-br from-accent/20 via-secondary to-primary" />;
  }

  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'low-power' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#38bdf8" />
        
        <AbstractMailbox />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export default Contact3D;
