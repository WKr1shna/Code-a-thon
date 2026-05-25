import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// 1. DUAL-COLOR DISASTER WAVE (ProblemsSolvedSection)
// ==========================================
const ProblemsSolvedScene = () => {
  const pointsRef = useRef();
  const count = 1200;

  const [positions, colors] = useMemo(() => {
    const pts = new Float32Array(count * 3);
    const cls = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 4;
      pts[i * 3] = x;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = z;

      // Transition from Threat (Red, Left) to Solution (Green, Right)
      if (x < 0) {
        cls[i * 3] = 0.84;     // R
        cls[i * 3 + 1] = 0.15; // G
        cls[i * 3 + 2] = 0.22; // B (#D72638)
      } else {
        cls[i * 3] = 0.18;     // R
        cls[i * 3 + 1] = 0.78; // G
        cls[i * 3 + 2] = 0.33; // B (#2DC653)
      }
    }
    return [pts, cls];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      const positionsAttr = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const x = positionsAttr.getX(i);
        const y = positionsAttr.getY(i);
        const z = Math.sin(x * 0.4 + time) * Math.cos(y * 0.4 + time) * 0.7;
        positionsAttr.setZ(i, z);
      }
      positionsAttr.needsUpdate = true;
      pointsRef.current.rotation.y = time * 0.015;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        size={0.035}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
      />
    </Points>
  );
};

export const ProblemsSolvedBackground = () => (
  <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ProblemsSolvedScene />
    </Canvas>
  </div>
);

// ==========================================
// 2. AI CONNECTIVITY NETWORK (FeaturesSection)
// ==========================================
const FeaturesScene = () => {
  const groupRef = useRef();
  const count = 35;

  const [points, connections] = useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2
        ),
        speed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003
        )
      });
    }

    const lines = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = pts[i].pos.distanceTo(pts[j].pos);
        if (dist < 1.2) {
          lines.push([i, j]);
        }
      }
    }
    return [pts, lines];
  }, []);

  const linePositions = useMemo(() => {
    return new Float32Array(connections.length * 6);
  }, [connections]);

  const lineRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    points.forEach((pt) => {
      pt.pos.add(pt.speed);
      if (Math.abs(pt.pos.x) > 2.5) pt.speed.x *= -1;
      if (Math.abs(pt.pos.y) > 1.5) pt.speed.y *= -1;
      if (Math.abs(pt.pos.z) > 1) pt.speed.z *= -1;
    });

    if (lineRef.current) {
      const posAttr = lineRef.current.geometry.attributes.position;
      connections.forEach(([i, j], idx) => {
        const p1 = points[i].pos;
        const p2 = points[j].pos;
        posAttr.setXYZ(idx * 2, p1.x, p1.y, p1.z);
        posAttr.setXYZ(idx * 2 + 1, p2.x, p2.y, p2.z);
      });
      posAttr.needsUpdate = true;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.04;
      groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <Points positions={new Float32Array(points.flatMap(p => [p.pos.x, p.pos.y, p.pos.z]))} stride={3}>
        <PointMaterial transparent color="#D72638" size={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
      </Points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
};

export const FeaturesBackground = () => (
  <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
    <Canvas camera={{ position: [0, 0, 3] }}>
      <FeaturesScene />
    </Canvas>
  </div>
);

// ==========================================
// 3. 3D PHONE MOCKUP (AppDownloadSection)
// ==========================================
const AppDownloadScene = () => {
  const phoneRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (phoneRef.current) {
      phoneRef.current.rotation.y = Math.sin(time * 0.4) * 0.25;
      phoneRef.current.rotation.x = 0.1 + Math.cos(time * 0.3) * 0.08;
      phoneRef.current.position.y = Math.sin(time * 1.2) * 0.04;
    }

    if (ring1Ref.current) {
      const scale = 1 + (time * 0.7) % 1.8;
      const opacity = Math.max(0, 1 - (scale - 1) / 1.8);
      ring1Ref.current.scale.set(scale, scale, 1);
      ring1Ref.current.material.opacity = opacity * 0.45;
    }

    if (ring2Ref.current) {
      const scale = 1 + ((time + 0.9) * 0.7) % 1.8;
      const opacity = Math.max(0, 1 - (scale - 1) / 1.8);
      ring2Ref.current.scale.set(scale, scale, 1);
      ring2Ref.current.material.opacity = opacity * 0.45;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.2} />
      
      {/* Pulsing signal rings in the background */}
      <mesh ref={ring1Ref} position={[0, 0, -0.4]} rotation={[0.1, 0, 0]}>
        <ringGeometry args={[0.55, 0.58, 64]} />
        <meshBasicMaterial color="#D72638" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0, -0.4]} rotation={[0.1, 0, 0]}>
        <ringGeometry args={[0.55, 0.58, 64]} />
        <meshBasicMaterial color="#D72638" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      <group ref={phoneRef}>
        {/* Phone Frame */}
        <mesh>
          <boxGeometry args={[0.85, 1.7, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Screen Panel */}
        <mesh position={[0, 0, 0.041]}>
          <planeGeometry args={[0.78, 1.62]} />
          <meshStandardMaterial color="#020617" roughness={0.1} emissive="#050b1a" />
        </mesh>

        {/* SOS Button inside screen */}
        <mesh position={[0, 0.1, 0.045]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshBasicMaterial color="#D72638" />
        </mesh>
        
        <mesh position={[0, 0.1, 0.043]}>
          <ringGeometry args={[0.15, 0.18, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      </group>
    </>
  );
};

export const AppDownload3D = () => (
  <div className="w-full h-[450px] pointer-events-none relative z-10">
    <Canvas camera={{ position: [0, 0, 2.5] }}>
      <AppDownloadScene />
    </Canvas>
  </div>
);

// ==========================================
// 4. RADAR AI SCANNER (LiveMapSection Title)
// ==========================================
const LiveMapScannerScene = () => {
  const sweepRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sweepRef.current) {
      sweepRef.current.rotation.z = -time * 2;
    }
  });

  return (
    <group>
      {/* Scanner Outline */}
      <mesh>
        <ringGeometry args={[0.42, 0.45, 64]} />
        <meshBasicMaterial color="#D72638" transparent opacity={0.5} />
      </mesh>

      {/* Rotating sweep hand */}
      <group ref={sweepRef}>
        <mesh position={[0, 0.2, 0]}>
          <planeGeometry args={[0.02, 0.4]} />
          <meshBasicMaterial color="#D72638" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Detected Hotspots */}
      <mesh position={[0.15, 0.12, 0]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#2DC653" />
      </mesh>
      <mesh position={[-0.18, -0.1, 0]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#D72638" />
      </mesh>
    </group>
  );
};

export const LiveMapScanner = () => (
  <div className="w-8 h-8 pointer-events-none shrink-0">
    <Canvas camera={{ position: [0, 0, 1] }}>
      <LiveMapScannerScene />
    </Canvas>
  </div>
);
