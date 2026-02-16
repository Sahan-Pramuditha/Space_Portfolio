import React, {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const ISS_MODEL_PATH = '/models/iss/ISS_stationary.glb';

const PreloaderISSFallback = () => (
  <group>
    <mesh castShadow>
      <boxGeometry args={[1, 0.35, 0.35]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
    </mesh>
    <mesh position={[1, 0, 0]} castShadow>
      <boxGeometry args={[1.4, 0.12, 0.04]} />
      <meshStandardMaterial color="#38bdf8" emissive="#1d4ed8" emissiveIntensity={0.35} />
    </mesh>
    <mesh position={[-1, 0, 0]} castShadow>
      <boxGeometry args={[1.4, 0.12, 0.04]} />
      <meshStandardMaterial color="#38bdf8" emissive="#1d4ed8" emissiveIntensity={0.35} />
    </mesh>
  </group>
);

const PreloaderISSModel = ({ onReady }) => {
  const groupRef = useRef();
  const { scene } = useGLTF(ISS_MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const readyNotifiedRef = useRef(false);

  useLayoutEffect(() => {
    if (!clonedScene || !groupRef.current) return;

    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if ('roughness' in material && material.roughness == null) material.roughness = 0.6;
          if ('metalness' in material && material.metalness == null) material.metalness = 0.2;
        });
      }
    });

    const bounds = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    clonedScene.position.set(-center.x, -center.y, -center.z);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 2.7;
    const fitScale = targetSize / maxDimension;
    groupRef.current.scale.setScalar(fitScale);

    if (!readyNotifiedRef.current) {
      readyNotifiedRef.current = true;
      onReady();
    }
  }, [clonedScene, onReady]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = -0.85 + Math.sin(t * 0.08) * 0.12;
    groupRef.current.rotation.z = Math.sin(t * 0.05) * 0.04;
    groupRef.current.position.y = Math.sin(t * 0.42) * 0.09;
  });

  return (
    <group ref={groupRef} rotation={[0.15, -0.85, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
};

const Preloader = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  useEffect(() => {
    const duration = 2200;
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimerDone(true);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!timerDone || !modelReady) return;
    const completeTimeout = setTimeout(onComplete, 350);
    return () => clearTimeout(completeTimeout);
  }, [timerDone, modelReady, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-accent font-mono overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),transparent_60%)]" />
        <div className="absolute inset-0 opacity-35 mix-blend-screen bg-[radial-gradient(circle,_rgba(148,163,184,0.45)_1px,transparent_1px)] bg-[length:26px_26px]" />
      </div>

      <div className="relative flex flex-col items-center w-full max-w-xl px-6">
        <motion.div
          className="mb-8 w-52 h-52 md:w-64 md:h-64 rounded-2xl border border-accent/25 bg-slate-950/45 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Canvas
            shadows
            camera={{ position: [0, 0, 6], fov: 42 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={0.85} />
            <directionalLight position={[5, 6, 4]} intensity={1.4} castShadow />
            <pointLight position={[-4, 2, -3]} intensity={0.5} color="#93c5fd" />
            <Suspense fallback={<PreloaderISSFallback />}>
              <PreloaderISSModel onReady={handleModelReady} />
              <Sparkles count={40} scale={6} size={1.7} speed={0.35} opacity={0.5} color="#60a5fa" />
            </Suspense>
          </Canvas>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl lg:text-9xl font-bold relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-accent to-white drop-shadow-[0_0_18px_rgba(56,189,248,0.45)]"
          animate={{ rotate: [-2, 0, 2, 0, -2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          {Math.round(count)}%
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-slate-300/80 text-xs md:text-sm tracking-[0.28em] uppercase"
      >
        {modelReady ? 'Preparing Mission Systems' : 'Loading ISS Model'}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 0.7, y: 10 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-3 text-[0.65rem] md:text-xs text-slate-400 tracking-[0.18em] uppercase"
      >
        Rendering Orbit - Calibrating Thrusters - Aligning UI
      </motion.div>
    </motion.div>
  );
};

useGLTF.preload(ISS_MODEL_PATH);

export default Preloader;
