import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeContext } from '../context/ThemeContext.js';
import confetti from 'canvas-confetti';
import { Mic, Wind, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CandleProps {
  position: [number, number, number];
  isBlown: boolean;
}

// Single Candle component with flickering flame mesh
const Candle: React.FC<CandleProps> = ({ position, isBlown }) => {
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!flameRef.current || isBlown) return;
    // Flickering candle flame math
    const scale = 1 + Math.sin(state.clock.getElapsedTime() * 20) * 0.15;
    const wiggle = Math.cos(state.clock.getElapsedTime() * 15) * 0.03;
    flameRef.current.scale.set(scale, scale * 1.3, scale);
    flameRef.current.position.x = position[0] + wiggle;
  });

  return (
    <group position={position}>
      {/* Candle stick */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <meshStandardMaterial color="#FF7597" roughness={0.3} />
      </mesh>
      
      {/* Candle Wick */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Flame */}
      {!isBlown && (
        <mesh ref={flameRef} position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#FFA500" />
        </mesh>
      )}
    </group>
  );
};

// 3D Cake layers component
const CakeModel: React.FC<{ isBlown: boolean; primaryColor: string; secondaryColor: string }> = ({
  isBlown,
  primaryColor,
  secondaryColor
}) => {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Tier 1 (Base) */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.2, 1.25, 0.8, 32]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.4} />
      </mesh>

      {/* Tier 2 (Top Layer) */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.8, 0.85, 0.6, 32]} />
        <meshStandardMaterial color={primaryColor} roughness={0.4} />
      </mesh>

      {/* Cake Plate */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.4, 1.45, 0.1, 32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Frosting / Cream drops */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.7;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh key={i} position={[x, 1.3, z]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
        );
      })}

      {/* Candles */}
      <Candle position={[0, 1.3, 0]} isBlown={isBlown} />
      <Candle position={[-0.35, 1.3, 0.25]} isBlown={isBlown} />
      <Candle position={[0.35, 1.3, -0.25]} isBlown={isBlown} />
    </group>
  );
};

export const Cake3D: React.FC = () => {
  const { theme, content, t } = useThemeContext();
  const [isBlown, setIsBlown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [wishVisible, setWishVisible] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Audio elements
  const blowSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav'), []);
  const applauseSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-200.wav'), []);

  const handleBlow = () => {
    if (isBlown) return;
    setIsBlown(true);
    blowSound.play().catch(() => {});

    // Launch celebratory fireworks
    setTimeout(() => {
      applauseSound.play().catch(() => {});
      setWishVisible(true);
      
      // Infinite fireworks blast for 5 seconds
      const end = Date.now() + 5000;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }, 200);
    }, 500);

    // Stop mic stream
    stopListening();
  };

  const startListening = async () => {
    if (isListening || isBlown) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setIsListening(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 512;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkBlowVolume = () => {
        if (!audioContextRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        // Sum high frequencies (hissing/blowing is high-freq noise)
        let highFreqSum = 0;
        for (let i = 100; i < bufferLength; i++) {
          highFreqSum += dataArray[i];
        }
        const average = highFreqSum / (bufferLength - 100);

        if (average > 55) { // Breath threshold
          handleBlow();
        } else {
          requestAnimationFrame(checkBlowVolume);
        }
      };

      checkBlowVolume();
    } catch (err) {
      console.warn('Microphone access denied or unsupported:', err);
      // Let user know they can click manually
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  if (!theme || !content) return null;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 relative w-full">
      <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide text-glow mb-2 uppercase text-center">
        {t('makeWish')}
      </h2>
      <p className="text-primary text-sm md:text-base font-handwriting text-glow-gold text-center mb-8">
        {content.cakeMessage || 'Blow out the candles and see what happens...'}
      </p>

      {/* 3D Canvas wrapper */}
      <div className="relative w-full max-w-lg h-[400px] glassmorphism rounded-2xl glow-border overflow-hidden">
        <Canvas camera={{ position: [0, 1.5, 4.5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 10, 5]} intensity={1.5} color={theme.primaryColor} />
          <pointLight position={[-5, 5, -5]} intensity={0.8} color={theme.secondaryColor} />
          <directionalLight position={[0, 5, 0]} intensity={1.0} />

          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
            <CakeModel
              isBlown={isBlown}
              primaryColor={theme.primaryColor}
              secondaryColor={theme.secondaryColor}
            />
          </Float>

          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
        </Canvas>

        {/* Live Mic Indicator */}
        {isListening && !isBlown && (
          <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-md border border-primary/40 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Mic size={14} className="text-primary" />
            <span>{t('listeningBlow')}</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-8 z-20">
        {!isBlown ? (
          <>
            <button
              onClick={startListening}
              disabled={isListening}
              className={`px-6 py-3 rounded-full flex items-center gap-2 font-semibold text-sm transition-all duration-300 transform active:scale-95 ${
                isListening 
                  ? 'bg-secondary/40 text-secondary border border-secondary/20 cursor-default'
                  : 'bg-primary/20 hover:bg-primary/40 border border-primary text-white cursor-pointer hover:shadow-[0_0_15px_var(--primary-color)]'
              }`}
            >
              <Mic size={16} />
              {isListening ? t('listeningBlow') : t('useMic')}
            </button>

            <button
              onClick={handleBlow}
              className="px-6 py-3 rounded-full bg-secondary/20 hover:bg-secondary/40 border border-secondary text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_15px_var(--secondary-color)] transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Wind size={16} />
              {t('blowCandles')}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-secondary text-sm font-handwriting mb-2">Candles extinguished successfully! 💨</span>
          </div>
        )}
      </div>

      {/* Wish Reveal Overlay Card */}
      <AnimatePresence>
        {wishVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
          >
            <div className="glassmorphism p-8 md:p-12 rounded-2xl glow-border max-w-md w-full text-center relative">
              <div className="absolute top-4 right-4 text-2xl animate-spin-slow">✨</div>
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary flex items-center justify-center mx-auto mb-6">
                <Award size={32} className="text-primary animate-pulse" />
              </div>
              <h3 className="text-primary text-2xl font-bold font-sans uppercase mb-4 tracking-wide text-glow">
                {t('wishGranted')}
              </h3>
              <p className="text-secondary text-lg font-handwriting mb-8 text-glow-gold">
                "May all your dreams and wishes come true today and always. I love you."
              </p>
              <button
                onClick={() => setWishVisible(false)}
                className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/80 text-white font-semibold text-sm transition-all hover:shadow-[0_0_15px_var(--primary-color)]"
              >
                {t('thankYou')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cake3D;
