import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Simplified outline border of India using real latitude and longitude coordinates
const indiaBorder = [
  [34.5, 74.5], // Kashmir North
  [32.5, 76.0], // Himachal
  [30.0, 78.0], // Uttarakhand
  [28.0, 81.0], // Nepal border west
  [27.0, 85.0], // Nepal border east
  [27.5, 88.5], // Sikkim
  [27.5, 92.0], // Bhutan
  [28.5, 96.0], // Arunachal East
  [25.0, 94.0], // Nagaland/Manipur
  [23.0, 92.5], // Mizoram
  [24.0, 91.5], // Tripura
  [25.5, 90.0], // Meghalaya
  [22.5, 89.0], // West Bengal / Bangladesh border
  [20.0, 86.0], // Odisha coast
  [16.0, 81.0], // Andhra coast
  [13.0, 80.0], // Chennai coast
  [10.0, 79.8], // Jaffna strait
  [8.0, 77.5],  // Kanyakumari
  [10.0, 76.0], // Kerala coast
  [13.0, 74.8], // Karnataka coast
  [16.0, 73.5], // Goa / Maharashtra coast
  [19.0, 72.8], // Mumbai coast
  [21.0, 72.0], // Gujarat South
  [22.5, 69.0], // Gujarat West
  [24.5, 71.0], // Kutch
  [26.0, 70.0], // Rajasthan West
  [28.0, 73.0], // Bikaner
  [30.0, 74.0], // Punjab
  [32.5, 74.0]  // Jammu
];

// Major Indian cities representing critical disaster hotspots
const criticalCities = [
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Dehradun', lat: 30.3165, lng: 78.0322 }
];

// Ray-casting point-in-polygon algorithm
const isPointInPolygon = (lat, lng, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Map real lat/lng to 3D normalized coordinates centered around India's geographic center
const mapLatLngTo3D = (lat, lng, randomizeZ = false) => {
  const scaleX = 0.12;
  const scaleY = 0.14;
  const x = (lng - 78.9629) * scaleX;
  const y = (lat - 22.5937) * scaleY;
  const z = randomizeZ ? (Math.random() - 0.5) * 0.05 : 0;
  return [x, y, z];
};

const PulsingCriticalDot = ({ position }) => {
  const coreRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Core pulsing scale and intensity
    if (coreRef.current) {
      const coreScale = 1 + Math.sin(time * 6) * 0.15;
      coreRef.current.scale.set(coreScale, coreScale, coreScale);
    }
    
    // Ring pulsing expansion and fading opacity
    if (ringRef.current) {
      const ringScale = 1 + (time * 1.5) % 2.5;
      const opacity = Math.max(0, 1 - (ringScale - 1) / 2.5);
      ringRef.current.scale.set(ringScale, ringScale, ringScale);
      ringRef.current.material.opacity = opacity * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Outer glowing pulsing ring */}
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.03, 0.04, 32]} />
        <meshBasicMaterial color="#ff2a2a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Inner solid hot core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ff2a2a" />
      </mesh>
    </group>
  );
};

const IndiaMapParticles = () => {
  const groupRef = useRef();

  // Generate particles inside the shape of India once
  const positions = useMemo(() => {
    const count = 3500;
    const pts = new Float32Array(count * 3);
    let generated = 0;
    
    while (generated < count) {
      // Generate coordinates around bounding box of India
      const lat = 8.0 + Math.random() * 27.0;
      const lng = 68.0 + Math.random() * 29.0;
      
      if (isPointInPolygon(lat, lng, indiaBorder)) {
        const [x, y, z] = mapLatLngTo3D(lat, lng, true);
        pts[generated * 3] = x;
        pts[generated * 3 + 1] = y;
        pts[generated * 3 + 2] = z;
        generated++;
      }
    }
    return pts;
  }, []);

  // Soft mouse parallax tilt
  useFrame((state) => {
    if (groupRef.current) {
      const targetX = state.mouse.y * 0.12;
      const targetY = state.mouse.x * 0.12;
      
      // Smooth interpolation (lerp)
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    }
  });

  // Map the static critical cities coordinates to 3D positions
  const criticalPositions = useMemo(() => {
    return criticalCities.map(city => mapLatLngTo3D(city.lat, city.lng, false));
  }, []);

  return (
    <group ref={groupRef}>
      {/* Base Point Cloud mapping India */}
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ff4a4a"
          size={0.018}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </Points>

      {/* Static Pulsing Hotspot indicators inside India */}
      {criticalPositions.map((pos, idx) => (
        <PulsingCriticalDot key={idx} position={pos} />
      ))}
    </group>
  );
};

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 3.8] }}>
        <IndiaMapParticles />
      </Canvas>
    </div>
  );
}
