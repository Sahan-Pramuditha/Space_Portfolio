import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const SmokePuff = React.forwardRef(({ position, scale, opacity, color = '#94a3b8' }, ref) => (
  <mesh ref={ref} position={position} scale={scale}>
    <sphereGeometry args={[0.3, 12, 12]} />
    <meshStandardMaterial
      color={color}
      transparent
      opacity={opacity}
      roughness={1}
      metalness={0}
    />
  </mesh>
));
SmokePuff.displayName = 'SmokePuff';

const Rocket = ({ t }) => {
  const rocketRef = useRef();
  const flameRef = useRef();
  const lightRef = useRef();
  const glowRef = useRef();

  useFrame(() => {
    if (!rocketRef.current) return;
    rocketRef.current.position.y = t * 6.5;
    rocketRef.current.rotation.z = Math.sin(t * 1.5) * 0.02;
    if (flameRef.current) {
      flameRef.current.scale.y = 0.6 + Math.sin(t * 20) * 0.2;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(t * 18) * 0.6;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(0.9 + Math.sin(t * 16) * 0.05);
    }
  });

  return (
    <group ref={rocketRef} position={[0, -1.6, 0]}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.26, 0.26, 1.75, 32]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.55} roughness={0.18} />
      </mesh>
      {/* Body bands */}
      {[-0.5, 0.0, 0.5].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.265, 0.01, 8, 32]} />
          <meshStandardMaterial color="#cbd5f5" metalness={0.6} roughness={0.2} />
        </mesh>
      ))}
      {/* Nose */}
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.27, 0.55, 32]} />
        <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.25} />
      </mesh>
      {/* Window */}
      <mesh position={[0, 0.45, 0.23]}>
        <circleGeometry args={[0.085, 20]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} metalness={0.2} roughness={0.1} />
      </mesh>
      {/* Fins */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.2 * s, -0.6, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.08, 0.45, 0.22]} />
          <meshStandardMaterial color="#f97316" metalness={0.3} roughness={0.35} />
        </mesh>
      ))}
      {/* Engine */}
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 0.25, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, -1.25, 0]}>
        <coneGeometry args={[0.18, 0.5, 18]} />
        <meshStandardMaterial color="#facc15" emissive="#f97316" emissiveIntensity={1.4} />
      </mesh>
      <mesh ref={glowRef} position={[0, -1.35, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.6} transparent opacity={0.65} />
      </mesh>
      <pointLight ref={lightRef} position={[0, -1.3, 0]} color="#f97316" intensity={2.2} distance={6} />
    </group>
  );
};

const LaunchPad = () => (
  <group position={[0, -1.8, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.3, 1.55, 0.14, 40]} />
      <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.2} />
    </mesh>
    <mesh position={[0.55, 0.7, -0.2]}>
      <boxGeometry args={[0.15, 1.4, 0.15]} />
      <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.35} />
    </mesh>
    <mesh position={[0.55, 1.4, -0.2]}>
      <boxGeometry args={[0.6, 0.06, 0.06]} />
      <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.3} />
    </mesh>
  </group>
);

const RocketLaunch3D = () => {
  const smokeRef = useRef([]);
  const clockRef = useRef(0);
  const duration = 16;

  const smokePuffs = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        offset: i * 0.08,
        baseX: (Math.random() - 0.5) * 1.2,
        baseZ: (Math.random() - 0.5) * 1.2,
      })),
    []
  );

  useFrame((state, delta) => {
    clockRef.current = (clockRef.current + delta) % duration;
    const t = clockRef.current / duration;
    smokeRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = smokePuffs[i];
      const life = (t + p.offset) % 1;
      const rise = life * 2.4;
      mesh.position.set(p.baseX, -1.8 + rise, p.baseZ);
      mesh.scale.setScalar(0.6 + life * 1.6);
      if (mesh.material) {
        mesh.material.opacity = Math.max(0, 0.4 - life * 0.35);
      }
    });
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 7, 5]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-4, 2, -3]} intensity={1.0} color="#38bdf8" />
      <pointLight position={[2, 1, 2]} intensity={0.6} color="#f97316" />

      <LaunchPad />
      <Rocket t={easeInOutCubic((clockRef.current % duration) / duration)} />

      {smokePuffs.map((_, i) => (
        <SmokePuff
          key={i}
          ref={(el) => (smokeRef.current[i] = el)}
          position={[0, -1.8, 0]}
          scale={[0.6, 0.6, 0.6]}
          opacity={0.35}
        />
      ))}
      {/* Ground disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#0b1220" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
};

export default RocketLaunch3D;
