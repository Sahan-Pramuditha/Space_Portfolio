import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float, Icosahedron } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { shouldDisableHeavyVisuals } from '../utils/runtimeGuards';

gsap.registerPlugin(ScrollTrigger);

const FloatingShapes = () => {
  const { theme } = useTheme();
  const color = theme === 'dark' ? "#38bdf8" : "#0284c7";
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: 15 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 2
      ],
      scale: Math.random() * 0.05 + 0.02,
      speed: Math.random() * 2 + 1,
    }));
    setShapes(arr);
  }, []);

  return (
    <group>
      {shapes.map((shape, i) => (
        <Float key={i} speed={shape.speed} rotationIntensity={2} floatIntensity={2} position={shape.position}>
          <Icosahedron args={[1, 0]} scale={shape.scale}>
            <meshBasicMaterial color={color} transparent opacity={0.3} wireframe />
          </Icosahedron>
        </Float>
      ))}
    </group>
  );
};

const Stars = (props) => {
  const ref = useRef();
  const [sphere] = useState(() => {
    return random.inSphere(new Float32Array(5000 * 3), { radius: 1.5 });
  });
  
  const { theme } = useTheme();
  const { mouse } = useThree();

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;

    // Interactive mouse movement
    const x = (mouse.x * 0.2 - ref.current.rotation.y) * 0.1;
    const y = (mouse.y * 0.2 - ref.current.rotation.x) * 0.1;
    
    ref.current.rotation.x += y;
    ref.current.rotation.y += x;
  });

  useEffect(() => {
    if (!ref.current) return undefined;
    const tween = gsap.to(ref.current.rotation, {
      y: Math.PI * 2,
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
      ease: "none"
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color={theme === 'dark' ? "#38bdf8" : "#0284c7"}
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={theme === 'dark' ? 1 : 0.8}
        />
      </Points>
    </group>
  );
};

const ThreeBackground = () => {
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

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'low-power' }}
      >
        <Stars />
        <FloatingShapes />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
