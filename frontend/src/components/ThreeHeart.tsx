import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeContext } from '../context/ThemeContext.js';
import confetti from 'canvas-confetti';

interface HeartPointsProps {
  isHovered: boolean;
  setIsHovered: (h: boolean) => void;
  onClick: () => void;
}

const HeartPoints: React.FC<HeartPointsProps> = ({ isHovered, setIsHovered, onClick }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200;

  // Twinkle texture created dynamically (offline fallback)
  const dotTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  // Compute heart shape coordinates in 3D using parametric math
  const [positions, colors, randoms] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const rnds = new Float32Array(count);

    // Cute pinkish-red palette matching the user's request
    const colorsPalette = [
      new THREE.Color('#FF2E63'), // Pinkish-red
      new THREE.Color('#FF5C93'), // Primary Pink
      new THREE.Color('#FF8FB1'), // Rose Pink
      new THREE.Color('#FFFFFF'), // Sparkling white
    ];

    for (let i = 0; i < count; i++) {
      // Pick random point along the parametric heart loop
      const t = Math.random() * Math.PI * 2;
      
      // Parametric formulas
      const sinT = Math.sin(t);
      const x = 16 * Math.pow(sinT, 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      // Scaling down to sit beautifully in the canvas
      const scaleFactor = 0.085;
      
      // Add slight noise to give the line volumetric thickness
      const noise = 0.08;
      const dx = (Math.random() - 0.5) * noise;
      const dy = (Math.random() - 0.5) * noise;
      const dz = (Math.random() - 0.5) * noise;

      pos[i * 3] = x * scaleFactor + dx;
      pos[i * 3 + 1] = y * scaleFactor + dy;
      pos[i * 3 + 2] = dz;

      rnds[i] = Math.random();

      // Pick a random color from the palette
      const col = colorsPalette[Math.floor(Math.random() * colorsPalette.length)];
      cols[i * 3] = col.r;
      cols[i * 3 + 1] = col.g;
      cols[i * 3 + 2] = col.b;
    }
    return [pos, cols, rnds];
  }, []);

  // Handle beating scale & cursor parallax look-at
  useFrame((state) => {
    if (!pointsRef.current) return;

    // Twinkle particles by animating rotation & minor wave offset
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.02;

    // Cursor mouse parallax
    const targetX = state.pointer.x * 0.35;
    const targetY = state.pointer.y * 0.35;
    pointsRef.current.rotation.y += THREE.MathUtils.lerp(0, targetX, 0.05);
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, -targetY, 0.05);

    // Beating heart rhythm (breathe animation)
    const baseBeat = isHovered ? 1.15 : 1.0;
    const beatSpeed = isHovered ? 4.5 : 3.0; // faster beat when hovered
    const beat = baseBeat + Math.sin(time * beatSpeed) * 0.04;
    pointsRef.current.scale.set(beat, beat, beat);
  });

  return (
    <points
      ref={pointsRef}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isHovered ? 0.08 : 0.06}
        vertexColors
        transparent
        opacity={0.85}
        map={dotTexture}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export const ThreeHeart: React.FC = () => {
  const { theme, content } = useThemeContext();
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
    audioRef.current.volume = 0.4;
  }, []);

  const handleClick = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0.5,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['heart'] as any[],
      colors: ['#FF2E63', '#FF5C93', '#FF8FB1', '#FFFFFF'],
    };

    confetti({ ...defaults, particleCount: 50, scalar: 2 });
    confetti({ ...defaults, particleCount: 25, scalar: 3 });
    confetti({ ...defaults, particleCount: 15, scalar: 4 });
  };

  if (!theme) return null;

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <HeartPoints
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            onClick={handleClick}
          />
        </Float>

        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>

      {/* Floating Center text (I Love You) */}
      <div 
        className={`absolute pointer-events-none select-none transition-all duration-700 flex flex-col items-center justify-center text-center ${
          isHovered ? 'opacity-100 scale-105' : 'opacity-80 scale-95'
        }`}
      >
        <h1 className="text-primary text-3xl md:text-5xl font-bold tracking-wider text-glow font-sans uppercase">
          I Love You
        </h1>
        <p className="text-secondary text-sm md:text-lg font-handwriting mt-2">
          {content?.relationshipLabel || 'Forever & Always'}
        </p>
      </div>
    </div>
  );
};

export default ThreeHeart;
