import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;

  attribute vec3 aRandom;

  varying vec3 vColor;
  varying float vDepth;

  // Modulo 289
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  // Stefan Gustavson's 3D Perlin Noise
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy * 0.5;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.14285714285;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec3 pos = position;

    // Smooth spherical rotation over time
    float angle = uTime * 0.04;
    float s = sin(angle);
    float c = cos(angle);
    pos.xz = mat2(c, -s, s, c) * pos.xz;
    pos.xy = mat2(c, -s, s, c) * pos.xy;

    // Organic fluid Perlin noise trails
    vec3 noiseInput = pos * 1.0 + vec3(0.0, 0.0, uTime * 0.12);
    vec3 noiseDisplacement = vec3(
      snoise(noiseInput),
      snoise(noiseInput + vec3(12.0, 34.0, 56.0)),
      snoise(noiseInput + vec3(78.0, 90.0, 23.0))
    );

    // Multi-directional burst layout
    vec3 targetPos = pos + (aRandom * 3.8) + (noiseDisplacement * 2.8);

    // Eased blending between sphere and flowing dispersed streams based on scroll progress
    vec3 finalPos = mix(pos, targetPos, uScroll);

    // Depth-based forward shift on scroll
    finalPos.z += uScroll * 1.8;

    // Smooth mouse-reactive camera parallax (stronger in initial sphere state)
    finalPos.x += uMouse.x * 0.35 * (1.0 - uScroll);
    finalPos.y += uMouse.y * 0.35 * (1.0 - uScroll);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuation of glowing size based on depth
    float baseSize = mix(24.0, 36.0, uScroll);
    gl_PointSize = baseSize / -mvPosition.z;

    // Dynamic color shifting from alert crimson-red to warnings gold-orange hot embers
    vec3 startColor = vec3(0.95, 0.12, 0.12);
    vec3 endColor = vec3(1.0, 0.42, 0.1);
    vColor = mix(startColor, endColor, uScroll * abs(noiseDisplacement.x));

    vDepth = -mvPosition.z;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    // Perfect circular glowing embers
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    // Exponential soft center glow
    float glow = exp(-dist * 5.2);
    
    // Additive fading smooth edges
    float alpha = smoothstep(0.5, 0.1, dist) * 0.78;

    gl_FragColor = vec4(vColor, glow * alpha);
  }
`;

const SphereParticles = ({ scrollObj }) => {
  const pointsRef = useRef();
  const materialRef = useRef();
  
  // Track mouse movements smoothly
  const mouseRef = useRef([0, 0]);
  const lerpedMouseRef = useRef([0, 0]);

  // Graceful degradation: lower count on mobile devices to preserve battery and maintain 60fps
  const count = useMemo(() => {
    return window.innerWidth < 768 ? 4000 : 12000;
  }, []);

  // Compute spherical position and randomized vector paths
  const [positions, randoms] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 1. Initial coordinates distributed on a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Radius of the sphere in the center
      const r = 1.0 + Math.random() * 0.15;
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // 2. Random explosion vectors for dispersion direction
      const thetaR = Math.random() * 2.0 * Math.PI;
      const phiR = Math.acos(Math.random() * 2.0 - 1.0);
      const speed = 0.6 + Math.random() * 1.4;
      
      rand[i * 3] = speed * Math.sin(phiR) * Math.cos(thetaR);
      rand[i * 3 + 1] = speed * Math.sin(phiR) * Math.sin(thetaR);
      rand[i * 3 + 2] = speed * Math.cos(phiR);
    }

    return [pos, rand];
  }, [count]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = [x, y];
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Frame animation loop
  useFrame((state) => {
    // Lerp mouse coordinate values smoothly
    lerpedMouseRef.current[0] += (mouseRef.current[0] - lerpedMouseRef.current[0]) * 0.05;
    lerpedMouseRef.current[1] += (mouseRef.current[1] - lerpedMouseRef.current[1]) * 0.05;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      // Directly assign scrubbed GSAP scroll progress
      materialRef.current.uniforms.uScroll.value = scrollObj.progress;
      materialRef.current.uniforms.uMouse.value.set(lerpedMouseRef.current[0], lerpedMouseRef.current[1]);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[randoms, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) }
        }}
      />
    </points>
  );
};

export default function ThreeBackground() {
  const scrollObj = useMemo(() => ({ progress: 0 }), []);

  useEffect(() => {
    // Setup GSAP ScrollTrigger to track overall viewport scroll progress smoothly
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2, // Smooth scrubbing to create elegant easing transitions
      onUpdate: (self) => {
        scrollObj.progress = self.progress;
      }
    });

    return () => {
      trigger.kill();
      // Ensure ScrollTrigger cache is cleared on unmount
      ScrollTrigger.clearMatchMedia();
    };
  }, [scrollObj]);

  return (
    <div className="fixed inset-0 z-0 opacity-55 pointer-events-none w-full h-screen">
      <Canvas camera={{ position: [0, 0, 3.8] }} dpr={[1, 2]}>
        <SphereParticles scrollObj={scrollObj} />
      </Canvas>
    </div>
  );
}
