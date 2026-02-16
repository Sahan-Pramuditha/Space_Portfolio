import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * International Space Station 3D Model
 * Uses local GLB asset:
 *   public/models/iss/ISS_stationary.glb
 */

const DEFAULT_MODEL_PATH = '/models/iss/ISS_stationary.glb';

const ISSModel = ({ modelPath }) => {
  const groupRef = useRef();
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    if (!clonedScene || !groupRef.current) return;

    // Ensure reasonable material/shadow defaults.
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

    // Center and auto-fit model so it is always visible.
    const bounds = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    clonedScene.position.set(-center.x, -center.y, -center.z);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 2.6;
    const fitScale = targetSize / maxDimension;
    groupRef.current.scale.setScalar(fitScale);
  }, [clonedScene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = -0.6 + Math.sin(t * 0.08) * 0.12;
    groupRef.current.rotation.z = Math.sin(t * 0.05) * 0.04;
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.09;
  });

  return (
    <group ref={groupRef} rotation={[0.15, -0.85, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
};

const ISS3D = ({ modelPath = DEFAULT_MODEL_PATH, highlightCategory }) => {
  return (
    <group>
      <Float rotationIntensity={0.1} floatIntensity={0.1} speed={0.4}>
        <ISSModel modelPath={modelPath} />
      </Float>

      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#020617" transparent opacity={0.4} />
      </mesh>

      <Sparkles
        count={60}
        scale={12}
        size={2}
        speed={0.35}
        opacity={0.45}
        color={
          highlightCategory === 'Languages'
            ? '#f97316'
            : highlightCategory === 'Frameworks'
            ? '#22c55e'
            : highlightCategory === 'Tools & Backend'
            ? '#38bdf8'
            : '#60a5fa'
        }
      />
    </group>
  );
};

useGLTF.preload(DEFAULT_MODEL_PATH);

export default ISS3D;
