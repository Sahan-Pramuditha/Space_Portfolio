import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Float, Sphere, Stars, Trail, OrbitControls, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const AtmosphereShaderMaterial = {
  uniforms: {
    viewVector: { value: new THREE.Vector3(0, 0, 1) },
    color: { value: new THREE.Color(0x60a5fa) },
    coef: { value: 0.9 },
    power: { value: 2.6 },
  },
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float coef;
    uniform float power;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(coef - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
      gl_FragColor = vec4(color, 1.0) * intensity * 1.85;
    }
  `,
  transparent: true,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
};

const TerminatorShaderMaterial = {
  uniforms: {
    lightDir: { value: new THREE.Vector3(1, 0, 0) },
    darkness: { value: 0.35 },
  },
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 lightDir;
    uniform float darkness;
    varying vec3 vNormal;
    void main() {
      float d = dot(vNormal, normalize(lightDir));
      float shadow = smoothstep(-0.2, 0.25, d);
      float night = 1.0 - shadow;
      vec3 color = vec3(0.04, 0.07, 0.12) * night * darkness;
      gl_FragColor = vec4(color, night * darkness);
    }
  `,
  transparent: true,
  blending: THREE.MultiplyBlending,
  depthWrite: false,
};

const Satellite = ({ color }) => {
  const panelLeftRef = useRef();
  const panelRightRef = useRef();
  const beaconRef = useRef();
  const lightRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 0.3 + Math.sin(t * 3.2) * 0.2;
    if (panelLeftRef.current) panelLeftRef.current.emissiveIntensity = 0.15 + pulse * 0.5;
    if (panelRightRef.current) panelRightRef.current.emissiveIntensity = 0.15 + pulse * 0.5;
    if (beaconRef.current) beaconRef.current.emissiveIntensity = 0.6 + pulse;
    if (lightRef.current) lightRef.current.intensity = 1.2 + pulse * 1.5;
  });

  return (
    <group rotation={[0, Math.PI / 4, 0]} scale={0.6}>
       {/* Main Bus - Gold Foil / Thermal Insulation */}
       <mesh>
         <boxGeometry args={[0.3, 0.4, 0.3]} />
         <meshStandardMaterial 
            color="#d4af37" // Gold
            roughness={0.3}
            metalness={0.8}
            bumpScale={0.02}
         />
       </mesh>
       
       {/* Solar Arrays - Detailed */}
       {/* Left Wing */}
       <group position={[0.45, 0, 0]}>
            <mesh rotation={[0, 0, 0]}>
                <boxGeometry args={[0.6, 0.3, 0.02]} />
                <meshStandardMaterial 
                    color="#1e293b" // Dark blue-grey
                    roughness={0.1}
                    metalness={0.9}
                    emissive="#0f172a"
                    emissiveIntensity={0.2}
                    ref={panelLeftRef}
                />
            </mesh>
            {/* Hinge */}
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.02, 0.02, 0.1]} />
                 <meshStandardMaterial color="#94a3b8" />
            </mesh>
       </group>

       {/* Right Wing */}
       <group position={[-0.45, 0, 0]}>
            <mesh rotation={[0, 0, 0]}>
                <boxGeometry args={[0.6, 0.3, 0.02]} />
                <meshStandardMaterial 
                    color="#1e293b" 
                    roughness={0.1}
                    metalness={0.9}
                    emissive="#0f172a"
                    emissiveIntensity={0.2}
                    ref={panelRightRef}
                />
            </mesh>
            {/* Hinge */}
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.02, 0.02, 0.1]} />
                 <meshStandardMaterial color="#94a3b8" />
            </mesh>
       </group>

       {/* Comms Dish */}
       <group position={[0, 0.25, 0]} rotation={[0.2, 0, 0]}>
            <mesh>
                <sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, 0, 1]} />
                <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
                 <cylinderGeometry args={[0.005, 0.005, 0.2]} />
                 <meshStandardMaterial color="#cbd5e1" />
            </mesh>
       </group>

       {/* Tech Indicator Light (Blinking) */}
        <mesh position={[0, 0, 0.16]}>
             <sphereGeometry args={[0.05, 16, 16]} />
             <meshBasicMaterial color={color} toneMapped={false} ref={beaconRef} />
        </mesh>
         <pointLight ref={lightRef} color={color} intensity={1.5} distance={1.5} />
    </group>
  )
}

const TechIcon = ({ color, position, explode, onExplosionComplete, onFlash }) => {
    const groupRef = useRef();
    const [hovered, setHover] = useState(false);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
             // Slowly rotate the satellite itself
            groupRef.current.rotation.y += delta * 0.5;
            // Add a slight wobble
             groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    if (explode) {
        return (
            <group position={position}>
                 <SatelliteExplosion onComplete={onExplosionComplete} onFlash={onFlash} />
            </group>
        );
    }

    return (
        <group position={position}>
            <Float speed={3.2} rotationIntensity={1.2} floatIntensity={1.2}>
                <group 
                    ref={groupRef}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                    scale={hovered ? 1.2 : 1}
                >
                    <Trail
                        width={2}
                        length={9}
                        color={new THREE.Color(color).multiplyScalar(2.2)}
                        attenuation={(t) => t * t * t}
                    >
                        <Satellite color={color} />
                    </Trail>
                </group>
            </Float>
        </group>
    );
};

const OrbitingSatellite = ({ color, radius = 2.5, speed = 0.35, phase = 0, tilt = [0, 0, 0], explode, onExplosionComplete, onFlash }) => {
  const groupRef = useRef();
  const { scene } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * speed + phase;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 1.3) * 0.15;
    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.y = -t + Math.PI / 2;

    if (explode && scene.userData) {
      const pos = new THREE.Vector3();
      groupRef.current.getWorldPosition(pos);
      scene.userData.explodePos = pos;
    }
  });

  return (
    <group rotation={tilt}>
      <group ref={groupRef}>
        <TechIcon color={color} explode={explode} onExplosionComplete={onExplosionComplete} onFlash={onFlash} />
      </group>
    </group>
  );
};

const OrbitTrail = ({ radius = 2.5, tilt = [0, 0, 0], color = '#38bdf8', opacity = 0.22 }) => {
  const lineRef = useRef();
  const geometry = useMemo(() => {
    const segments = 128;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
    }
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [radius]);

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances();
    }
  }, []);

  useFrame((state) => {
    if (!lineRef.current) return;
    lineRef.current.material.dashOffset = -state.clock.elapsedTime * 0.25;
  });

  return (
    <group rotation={tilt}>
      <line ref={lineRef} geometry={geometry}>
        <lineDashedMaterial
          color={color}
          transparent
          opacity={opacity}
          dashSize={0.4}
          gapSize={0.25}
        />
      </line>
    </group>
  );
};

const StarWarp = ({ count = 2000, paused = false, dim = 0 }) => {
    const mesh = useRef();
    const light = useRef();
    
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (paused) return;
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);
            
            particle.zFactor += 0.1;
            if (particle.zFactor > 50) particle.zFactor = -50;

            dummy.position.set(
                (particle.xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10),
                (particle.yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10),
                particle.zFactor
            );
            
            const sScale = Math.max(0.1, (particle.zFactor + 50) / 100);
            dummy.scale.set(sScale, sScale, sScale);
            
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current && mesh.current.material) {
          mesh.current.material.opacity = 0.6 * (1 - dim);
        }
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </instancedMesh>
    );
};

const EarthSystem = ({ explode, onExplosionComplete, focused, cinematic, destructing, blackout }) => {
  const earthRef = useRef();
  const earthWireframeRef = useRef();
  const earthShadowRef = useRef();
  const terminatorRef = useRef();
  const { scene } = useThree();
  const moonGroupRef = useRef();
  const moonRef = useRef();
  const techRingRef = useRef();
  const innerRingRef = useRef();
  const auroraRef = useRef();
  const auroraRef2 = useRef();
  const particleRef = useRef();
  const flashLightRef = useRef();
  const flashRef = useRef(0);

  // Load Earth Textures
  const [colorMap, normalMap, specularMap, cloudsMap, emissiveMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png'
  ]);
  
  // Load Moon Texture
  const [moonColorMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
  ]);

  useFrame((state, delta) => {
    // ... (Earth & Moon rotation - keep them moving)
    if (earthRef.current && !focused) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    if (earthWireframeRef.current && !focused) {
        earthWireframeRef.current.rotation.y += delta * 0.07;
    }
    if (earthShadowRef.current && !focused) {
        earthShadowRef.current.rotation.y += delta * 0.09;
    }
    if (moonGroupRef.current && !focused) {
        moonGroupRef.current.rotation.y += delta * 0.1;
    }
    if (moonRef.current) {
        moonRef.current.rotation.y += delta * 0.02;
    }

    // Tech Ring Rotation - Pause if focused
    if (techRingRef.current && !focused) {
        techRingRef.current.rotation.z += delta * 0.06;
        techRingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    } else if (techRingRef.current && focused) {
        // Optional: Slowly align the target satellite to view?
        // For now, just stopping is enough to "focus" on the impending doom.
        // Or dampen the rotation to zero.
        techRingRef.current.rotation.z = THREE.MathUtils.lerp(techRingRef.current.rotation.z, techRingRef.current.rotation.z, 0.1);
    }
    if (innerRingRef.current && !focused) {
        innerRingRef.current.rotation.z -= delta * 0.08;
        innerRingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
    }

    if (auroraRef.current && !focused) {
      auroraRef.current.rotation.y += delta * 0.04;
      const base = cinematic || destructing ? 0.2 : 0.12;
      auroraRef.current.material.opacity = base + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    }
    if (auroraRef2.current && !focused) {
      auroraRef2.current.rotation.y -= delta * 0.03;
      const base = cinematic || destructing ? 0.14 : 0.08;
      auroraRef2.current.material.opacity = base + Math.cos(state.clock.elapsedTime * 1.1) * 0.04;
    }

    if (particleRef.current && !focused) {
      particleRef.current.rotation.y += delta * 0.03;
      particleRef.current.rotation.x -= delta * 0.015;
    }

    const baseDir = scene.userData?.lightDir || new THREE.Vector3(1, 0, 0);
    if (terminatorRef.current) {
      terminatorRef.current.material.uniforms.lightDir.value.copy(baseDir);
    }
    if (flashLightRef.current) {
      flashRef.current = Math.max(0, flashRef.current - delta * 2.2);
      flashLightRef.current.intensity = flashRef.current * 2.5;
      const flashed = baseDir.clone().multiplyScalar(3.5);
      flashLightRef.current.position.copy(flashed);
    }
  });

  useEffect(() => {
    if (!earthRef.current || !earthRef.current.material) return;
    gsap.to(earthRef.current.material, {
      emissiveIntensity: blackout ? 0.4 : 2.4,
      duration: 1.2,
      ease: 'power2.out'
    });
    if (earthWireframeRef.current && earthWireframeRef.current.material) {
      gsap.to(earthWireframeRef.current.material, {
        opacity: blackout ? 0.4 : 0.85,
        duration: 1.2,
        ease: 'power2.out'
      });
    }
    if (particleRef.current && particleRef.current.material) {
      gsap.to(particleRef.current.material, {
        opacity: blackout ? 0.08 : 0.25,
        duration: 1.2,
        ease: 'power2.out'
      });
    }
  }, [blackout]);

  useEffect(() => {
    const peel = () => {
      if (earthWireframeRef.current) gsap.to(earthWireframeRef.current.material, { opacity: 0, duration: 1.2, ease: 'power2.out' });
    };
    const day = () => {
      if (earthRef.current && earthRef.current.material) gsap.to(earthRef.current.material, { emissiveIntensity: 0.5, duration: 1.2, ease: 'power2.out' });
    };
    const rotateEarth = () => {
      if (earthRef.current) gsap.to(earthRef.current.rotation, { x: 0.12, y: 1.4, z: 0, duration: 2.5, ease: 'power3.inOut' });
    };
    const rotateToSatellite = () => {
      if (techRingRef.current) gsap.to(techRingRef.current.rotation, { y: -Math.PI / 2, duration: 1.2, ease: 'power3.out' });
    };
    window.addEventListener('cinematic-clouds-peel', peel);
    window.addEventListener('cinematic-night-to-day', day);
    window.addEventListener('cinematic-rotate-earth', rotateEarth);
    window.addEventListener('satellite-rotate-to-front', rotateToSatellite);
    return () => {
      window.removeEventListener('cinematic-clouds-peel', peel);
      window.removeEventListener('cinematic-night-to-day', day);
      window.removeEventListener('cinematic-rotate-earth', rotateEarth);
      window.removeEventListener('satellite-rotate-to-front', rotateToSatellite);
    };
  }, []);

  return (
    <group scale={1.2} rotation={[0.41, 0, 0]}>
      {/* --- Earth --- */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <group>
            {/* Base Earth Sphere */}
            <Sphere ref={earthRef} args={[1.65, 64, 64]} position={[0, 0, 0]}>
                <meshPhongMaterial 
                    map={colorMap}
                    normalMap={normalMap}
                    normalScale={[2, 2]} // Enhanced normal effect
                    specularMap={specularMap}
                    shininess={15}
                    emissiveMap={emissiveMap}
                    emissive="#ffcc88"
                    emissiveIntensity={2.4}
                    specular="#22d3ee"
                />
            </Sphere>
            
            {/* Clouds / Atmosphere Layer */}
            <Sphere ref={earthWireframeRef} args={[1.67, 64, 64]} position={[0, 0, 0]}>
                <meshPhongMaterial 
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.85}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    depthWrite={false} // Prevent z-fighting
                />
            </Sphere>

            {/* Cloud Shadowing Layer */}
            <Sphere ref={earthShadowRef} args={[1.675, 64, 64]} position={[0, 0, 0]}>
                <meshPhongMaterial 
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.22}
                    color="#0b1220"
                    blending={THREE.MultiplyBlending}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </Sphere>

            {/* Atmosphere Glow (Custom Shader) */}
            <mesh scale={[1.8, 1.8, 1.8]}> 
                 <sphereGeometry args={[1, 64, 64]} />
                 <shaderMaterial args={[AtmosphereShaderMaterial]} side={THREE.BackSide} transparent depthWrite={false} />
            </mesh>

            {/* Subtle particle glow shell */}
            <points ref={particleRef}>
              <sphereGeometry args={[1.92, 32, 32]} />
              <pointsMaterial
                size={0.012}
                color="#7dd3fc"
                transparent
                opacity={0.25}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </points>

            {/* Terminator shading (day/night transition) */}
            <mesh ref={terminatorRef} scale={[1.705, 1.705, 1.705]}>
              <sphereGeometry args={[1, 64, 64]} />
              <shaderMaterial args={[TerminatorShaderMaterial]} />
            </mesh>

            {/* Explosion flash light reflection */}
            <pointLight ref={flashLightRef} color="#ffe7b3" intensity={0} distance={6} decay={2} />

            {/* Aurora Bands */}
            <mesh ref={auroraRef} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.78, 0.03, 8, 128]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={auroraRef2} rotation={[Math.PI / 2.2, 0, 0]}>
              <torusGeometry args={[1.74, 0.02, 8, 128]} />
              <meshBasicMaterial color="#a855f7" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
      </Float>

      {/* --- Moon --- */}
      <group ref={moonGroupRef} rotation={[0.5, 0, 0]}>
         <group position={[3.5, 0, 0]}>
            <Sphere ref={moonRef} args={[0.4, 32, 32]}>
                <meshStandardMaterial map={moonColorMap} roughness={0.8} />
            </Sphere>
         </group>
      </group>

      {/* --- Tech Stack Orbit Ring --- */}
      <group ref={techRingRef} rotation={[Math.PI / 3, 0, 0]}>
        <OrbitTrail radius={2.55} tilt={[0, 0, 0]} color="#38bdf8" opacity={0.2} />
        <OrbitTrail radius={2.45} tilt={[0, 0, 0.2]} color="#f7df1e" opacity={0.16} />
        <OrbitingSatellite 
            color="#61dafb" 
            radius={2.55}
            speed={0.35}
            phase={0}
            tilt={[0, 0, 0]}
            explode={explode} 
            onExplosionComplete={onExplosionComplete} 
            onFlash={() => { flashRef.current = 1; }}
        />
        <OrbitingSatellite color="#f7df1e" radius={2.45} speed={0.4} phase={1.7} tilt={[0, 0, 0.2]} />
        <OrbitingSatellite color="#68a063" radius={2.6} speed={0.32} phase={3.1} tilt={[0.2, 0, 0]} />
        <OrbitingSatellite color="#ffffff" radius={2.35} speed={0.45} phase={4.2} tilt={[0.1, 0.1, 0]} />
        
        {/* Ring Visual */}
        <mesh rotation={[Math.PI/2, 0, 0]}>
            <ringGeometry args={[2.4, 2.5, 64]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={innerRingRef} rotation={[Math.PI / 2.8, 0, 0]}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <ringGeometry args={[1.75, 1.82, 64]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.04} side={THREE.DoubleSide} />
        </mesh>
      </group>

    </group>
  );
};

const SatelliteExplosion = ({ onComplete, onFlash }) => {
  const [debrisRender, setDebrisRender] = useState([]);
  const debrisRef = useRef([]);
  useEffect(() => {
    const arr = Array.from({ length: 160 }, () => {
      const t = Math.random();
      const type = t < 0.4 ? 'box' : t < 0.8 ? 'tetra' : 'panel';
      const speed = 6 + Math.random() * 8;
      const dir = new THREE.Vector3(
        (Math.random() - 0.5),
        (Math.random() - 0.5),
        (Math.random() - 0.5)
      ).normalize().multiplyScalar(speed);
      const entry = {
        velocity: dir,
        angular: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(2),
        scale: 0.25 + Math.random() * 0.35,
        life: 1,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
        metal: Math.random() > 0.7,
        type
      };
      return entry;
    });
    debrisRef.current = arr;
    setDebrisRender(arr.map(p => ({ type: p.type, color: p.color, metal: p.metal, scale: p.scale })));
  }, []);

  const group = useRef();
  const shockwaveRef = useRef();
  const glowRef = useRef();
  const flashRef = useRef();
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const d = Math.min(delta, 0.033);

    if (group.current && debrisRef.current.length) {
      let idx = 0;
      for (const child of group.current.children) {
        if (child === shockwaveRef.current || child === glowRef.current || child === flashRef.current) continue;
        const p = debrisRef.current[idx++];
        child.position.addScaledVector(p.velocity, d);
        child.rotation.x += p.angular.x * d;
        child.rotation.y += p.angular.y * d;
        child.rotation.z += p.angular.z * d;
        p.velocity.multiplyScalar(0.96);
        p.life -= d * 0.35;
        child.scale.setScalar(Math.max(0.001, p.scale * p.life));
        const mat = child.material;
        if (mat && mat.transparent) {
          mat.opacity = Math.max(0, p.life);
        }
      }
    }

    if (shockwaveRef.current) {
      const s = 1 + timeRef.current * 6;
      shockwaveRef.current.scale.set(s, s, s);
      const mat = shockwaveRef.current.material;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, d * 2);
    }

    if (glowRef.current) {
      const g = 1 + timeRef.current * 2;
      glowRef.current.scale.setScalar(g);
      const mat = glowRef.current.material;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, d * 1.5);
    }

    if (flashRef.current) {
      flashRef.current.intensity = Math.max(0, flashRef.current.intensity - d * 20);
    }
  });

  useEffect(() => {
    const tl = gsap.timeline();
    tl.to(flashRef.current, { intensity: 22, duration: 0.08, ease: 'power3.out' })
      .to(flashRef.current, { intensity: 0, duration: 0.6, ease: 'power3.in' }, '<');
    if (onFlash) onFlash();
    if (shockwaveRef.current) {
      shockwaveRef.current.material.opacity = 0.9;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.7;
    }
    const timeout = setTimeout(onComplete, 2400);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <group ref={group} position={[0, 0, 0]}>
      {debrisRender.map((p, i) => (
        <mesh key={i}>
          {p.type === 'box' && <boxGeometry args={[0.18, 0.18, 0.18]} />}
          {p.type === 'tetra' && <tetrahedronGeometry args={[0.2, 0]} />}
          {p.type === 'panel' && <boxGeometry args={[0.36, 0.02, 0.24]} />}
          <meshStandardMaterial
            color={p.color}
            metalness={p.metal ? 0.8 : 0.2}
            roughness={p.metal ? 0.3 : 0.7}
            emissive={p.color}
            emissiveIntensity={0.4}
            transparent
          />
        </mesh>
      ))}
      <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.42, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.0} blending={THREE.AdditiveBlending} />
      </mesh>
      <Icosahedron ref={glowRef} args={[0.35, 0]}>
        <meshBasicMaterial color="#ffedd5" transparent opacity={0.0} blending={THREE.AdditiveBlending} />
      </Icosahedron>
      <pointLight ref={flashRef} intensity={0} distance={8} color="#ffd7a3" />
    </group>
  );
};

const CameraRig = ({ controlsRef, focused, cinematic, destructing, trackLat = 7.0, trackLon = 80.0 }) => {
  const { camera, scene } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    
    if (destructing) {
      const target = scene.userData?.explodePos || new THREE.Vector3(2.5, 0, 0);
      const normal = target.clone().normalize();
      const camPos = target.clone().add(normal.multiplyScalar(1.2));
      gsap.to(camera.position, { x: camPos.x, y: camPos.y + 0.25, z: camPos.z, duration: 1.2, ease: 'power2.out' });
      gsap.to(controlsRef.current.target, {
        x: target.x, y: target.y, z: target.z, duration: 1.2, ease: 'power2.out',
        onUpdate: () => controlsRef.current.update()
      });
    } else if (cinematic) {
      gsap.to(camera.position, { x: 0, y: 0, z: 5.5, duration: 1.8, ease: 'power2.inOut' });
      gsap.to(controlsRef.current.target, {
        x: 0, y: 0, z: 0, duration: 1.8, ease: 'power2.inOut',
        onUpdate: () => controlsRef.current.update()
      });
    } else if (focused) {
      gsap.to(camera.position, { x: 2.5, y: 0.6, z: 4.5, duration: 1.2, ease: 'power2.out' });
      gsap.to(controlsRef.current.target, {
        x: 2.5, y: 0, z: 0, duration: 1.2, ease: 'power2.out',
        onUpdate: () => controlsRef.current.update()
      });
    } else {
      gsap.to(camera.position, { x: 0, y: 0, z: 8, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(controlsRef.current.target, {
        x: 0, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut',
        onUpdate: () => controlsRef.current.update()
      });
    }
  }, [focused, cinematic, destructing, camera, controlsRef]);

  useEffect(() => {
    const desired = cinematic || destructing ? 40 : 45;
    gsap.to(camera, { fov: desired, duration: 0.8, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() });
  }, [cinematic, destructing, camera]);

  useEffect(() => {
    const handler = () => {
      const R = 1.5;
      const latRad = THREE.MathUtils.degToRad(trackLat);
      const lonRad = THREE.MathUtils.degToRad(trackLon);
      const x = R * Math.cos(latRad) * Math.cos(lonRad);
      const y = R * Math.sin(latRad);
      const z = R * Math.cos(latRad) * Math.sin(lonRad);
      const target = new THREE.Vector3(x, y, z);
      const normal = target.clone().normalize();
      const camPos = target.clone().add(normal.multiplyScalar(1.0));
      const start = camera.position.clone();
      const mid = start.clone().lerp(camPos, 0.5).add(new THREE.Vector3(0.2, 0.15, -0.4));
      const end = camPos.clone();
      const curve = new THREE.CatmullRomCurve3([start, mid, end], false, 'centripetal', 0.5);
      const state = { t: 0 };
      gsap.to(state, {
        t: 1,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          const p = curve.getPoint(state.t);
          camera.position.copy(p);
          if (controlsRef.current) controlsRef.current.update();
        }
      });
      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, { x: target.x, y: target.y, z: target.z, duration: 2.2, ease: 'power2.inOut', onUpdate: () => controlsRef.current.update() });
      }
    };
    window.addEventListener('cinematic-zoom-city', handler);
    return () => window.removeEventListener('cinematic-zoom-city', handler);
  }, [camera, controlsRef, trackLat, trackLon]);

  useEffect(() => {
    const handler = () => {
      const target = new THREE.Vector3(2.5, 0, 0);
      const normal = target.clone().normalize();
      const camPos = target.clone().add(normal.multiplyScalar(1.1));
      const start = camera.position.clone();
      const mid = start.clone().lerp(camPos, 0.5).add(new THREE.Vector3(0.3, 0.2, -0.5));
      const end = camPos.clone();
      const curve = new THREE.CatmullRomCurve3([start, mid, end], false, 'centripetal', 0.5);
      const state = { t: 0 };
      gsap.to(state, {
        t: 1,
        duration: 2.4,
        ease: 'power2.inOut',
        onUpdate: () => {
          const p = curve.getPoint(state.t);
          camera.position.copy(p);
          if (controlsRef.current) controlsRef.current.update();
        }
      });
      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, { x: target.x, y: target.y, z: target.z, duration: 2.4, ease: 'power2.inOut', onUpdate: () => controlsRef.current.update() });
      }
    };
    window.addEventListener('satellite-zoom', handler);
    return () => window.removeEventListener('satellite-zoom', handler);
  }, [camera, controlsRef]);

  return null;
};

const TechAnimation3D = () => {
  const containerRef = useRef(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [explode, setExplode] = useState(false);
  const [focused, setFocused] = useState(false);
  const [cinematic, setCinematic] = useState(false);
  const [destructing, setDestructing] = useState(false);
  const [trackLat, setTrackLat] = useState(7.0);
  const [trackLon, setTrackLon] = useState(80.0);
  const [blackoutLevel, setBlackoutLevel] = useState(0);

  useEffect(() => {
      const handleFocus = () => {
          setFocused(true);
          // Scroll to top/hero section smoothly
          window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      const handleCinematic = (e) => {
          setCinematic(true);
          setFocused(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (e && e.detail) {
              const { lat, lon } = e.detail;
              if (typeof lat === 'number') setTrackLat(lat);
              if (typeof lon === 'number') setTrackLon(lon);
          }
          
          // Trigger Sequence
          
          setTimeout(() => {
             window.dispatchEvent(new Event('cinematic-clouds-peel'));
          }, 1200);
          
          setTimeout(() => {
             window.dispatchEvent(new Event('cinematic-night-to-day'));
          }, 2000);
          
          setTimeout(() => {
             window.dispatchEvent(new Event('cinematic-zoom-city'));
          }, 2500);
      };

      const handleDestruct = () => {
          setExplode(true);
          setDestructing(true);
          setCinematic(false);
          setFocused(true);
      };

      window.addEventListener('satellite-focus', handleFocus);
      window.addEventListener('tracking-cinematic', handleCinematic);
      window.addEventListener('satellite-destruct', handleDestruct);
      const handleBlackoutOn = () => {
        gsap.to({ t: blackoutLevel }, {
          t: 1,
          duration: 1.0,
          ease: 'power2.out',
          onUpdate: function() { setBlackoutLevel(this.targets()[0].t); }
        });
      };
      const handleBlackoutOff = () => {
        gsap.to({ t: blackoutLevel }, {
          t: 0,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: function() { setBlackoutLevel(this.targets()[0].t); }
        });
      };
      window.addEventListener('blackout-on', handleBlackoutOn);
      window.addEventListener('blackout-off', handleBlackoutOff);
      
      return () => {
          window.removeEventListener('satellite-focus', handleFocus);
          window.removeEventListener('tracking-cinematic', handleCinematic);
          window.removeEventListener('satellite-destruct', handleDestruct);
          window.removeEventListener('blackout-on', handleBlackoutOn);
          window.removeEventListener('blackout-off', handleBlackoutOff);
      };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
// ... existing wheel listener code ...
    const handleWheel = (e) => {
        if (zoomEnabled) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoomEnabled]);

  const controlsRef = useRef();
  const mainLightRef = useRef();
  const lightDirRef = useRef(new THREE.Vector3(1, 0, 0));

  const LightSync = () => {
    const { scene } = useThree();
    useFrame(() => {
      if (!mainLightRef.current) return;
      const worldPos = new THREE.Vector3();
      mainLightRef.current.getWorldPosition(worldPos);
      lightDirRef.current.copy(worldPos).normalize();
      if (scene.userData && scene.userData.lightDir) {
        scene.userData.lightDir.copy(lightDirRef.current);
      }
    });
    return null;
  };

  const LightBridge = () => {
    const { scene } = useThree();
    useEffect(() => {
      scene.userData.lightDir = lightDirRef.current;
      return () => {
        scene.userData.lightDir = null;
      };
    }, [scene]);
    return null;
  };

  return (
    <div 
        ref={containerRef}
        className="w-full h-full cursor-move"
        onMouseEnter={() => setZoomEnabled(true)}
        onMouseLeave={() => setZoomEnabled(false)}
    >
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
            <ambientLight intensity={0.7} />
            <hemisphereLight skyColor="#60a5fa" groundColor="#0f172a" intensity={0.6} />
            <directionalLight ref={mainLightRef} position={[5, 3, 5]} intensity={2.3} color="#ffffff" />
            <pointLight position={[-5, -3, -5]} intensity={1.2} color="#3b82f6" />
            <spotLight position={[5, 0, 5]} intensity={2.2} angle={0.55} penumbra={1} color="#a855f7" />

            <LightBridge />
            <LightSync />

            <React.Suspense fallback={null}>
               <EarthSystem 
                  explode={explode} 
                  onExplosionComplete={() => { setExplode(false); setDestructing(false); setFocused(false); }} 
                  focused={focused} 
                  cinematic={cinematic}
                  destructing={destructing}
                  blackout={blackoutLevel > 0.4}
               />
            </React.Suspense>
            
            <CameraRig controlsRef={controlsRef} focused={focused} cinematic={cinematic} destructing={destructing} trackLat={trackLat} trackLon={trackLon} />
            <OrbitControls 
                ref={controlsRef}
                enableZoom={false} 
                enableRotate={!cinematic && !destructing}
                minDistance={0.8}
                maxDistance={20}
                enablePan={false} 
                autoRotate={!zoomEnabled && !focused && !cinematic && !destructing}
                autoRotateSpeed={0.5}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI - Math.PI / 4}
            />
            
            {/* Moving Star Warp Effect */}
            <StarWarp count={cinematic || destructing ? 800 : 1400} paused={cinematic || destructing} dim={blackoutLevel} />
            {/* Background static stars for depth */}
            <Stars radius={150} depth={50} count={cinematic || destructing ? 600 : 1000} factor={4} saturation={0} fade speed={0} />
            {blackoutLevel > 0 && (
              <mesh>
                <sphereGeometry args={[20, 16, 16]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.35 * blackoutLevel} />
              </mesh>
            )}
        </Canvas>
    </div>
  );
};

export default TechAnimation3D;
