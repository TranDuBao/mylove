import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { ScratchEffectsConfig } from '../../types/scratchcard.js';

interface CelebrationOverlayProps {
  isActive: boolean;
  effects: ScratchEffectsConfig;
  onComplete?: () => void;
}

/**
 * Full celebration overlay triggered when scratch card is revealed.
 * Renders confetti, hearts, sparkles, sakura, fireworks, balloons, glow, etc.
 */
const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isActive,
  effects,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPlayedRef = useRef(false);

  // Confetti via canvas-confetti library
  const fireConfetti = useCallback(() => {
    const colors = ['#FF5C93', '#FFB6C1', '#FF69B4', '#FFD700', '#DDA0DD', '#87CEEB'];
    
    // Main burst
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.7, x: 0.5 },
      colors,
    });

    // Delayed side bursts
    setTimeout(() => {
      confetti({ particleCount: 30, angle: 60, spread: 55, origin: { x: 0.1, y: 0.7 }, colors });
      confetti({ particleCount: 30, angle: 120, spread: 55, origin: { x: 0.9, y: 0.7 }, colors });
    }, 300);
  }, []);

  // Fireworks via canvas-confetti
  const fireFireworks = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#FF5C93', '#FFD700', '#FF69B4', '#87CEEB'];
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60 + Math.random() * 60,
        spread: 55,
        startVelocity: 30 + Math.random() * 20,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors,
        gravity: 1.2,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  useEffect(() => {
    if (!isActive || hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    // Fire confetti
    if (effects.confetti) {
      fireConfetti();
    }

    // Fire fireworks
    if (effects.fireworks) {
      setTimeout(fireFireworks, 500);
    }

    // Camera shake
    if (effects.cameraShake) {
      const container = containerRef.current?.parentElement;
      if (container) {
        container.classList.add('sc-camera-shake');
        setTimeout(() => container.classList.remove('sc-camera-shake'), 600);
      }
    }

    // Completion callback
    setTimeout(() => onComplete?.(), 3000);
  }, [isActive, effects, fireConfetti, fireFireworks, onComplete]);

  // Reset when deactivated
  useEffect(() => {
    if (!isActive) {
      hasPlayedRef.current = false;
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="sc-celebration-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 10,
            overflow: 'hidden',
            borderRadius: 'inherit',
          }}
        >
          {/* Ambient Glow */}
          {effects.glow && (
            <motion.div
              className="sc-ambient-glow"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.4, scale: 1.5 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '120%',
                background: 'radial-gradient(circle, rgba(255,92,147,0.2) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
          )}

          {/* Light Sweep */}
          {effects.lightSweep && (
            <motion.div
              className="sc-light-sweep"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                transform: 'skewX(-15deg)',
              }}
            />
          )}

          {/* Floating Hearts */}
          {effects.hearts && (
            <div className="sc-floating-hearts">
              {Array.from({ length: 8 }, (_, i) => (
                <motion.span
                  key={`heart-${i}`}
                  className="sc-float-heart"
                  initial={{ y: '100%', x: `${10 + (i * 11)}%`, opacity: 0, scale: 0.5 }}
                  animate={{
                    y: [null, '-20%', '-80%'],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.8],
                    rotate: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.8,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    fontSize: `${16 + Math.random() * 14}px`,
                    bottom: 0,
                  }}
                >
                  {['💕', '💖', '💗', '💝', '❤️', '🩷', '💘', '💞'][i]}
                </motion.span>
              ))}
            </div>
          )}

          {/* Sparkles */}
          {effects.sparkles && (
            <div className="sc-sparkles">
              {Array.from({ length: 10 }, (_, i) => (
                <motion.span
                  key={`spark-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1 + Math.random() * 1.5,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`,
                    fontSize: `${10 + Math.random() * 10}px`,
                  }}
                >
                  ✨
                </motion.span>
              ))}
            </div>
          )}

          {/* Sakura Petals */}
          {effects.sakura && (
            <div className="sc-sakura-petals">
              {Array.from({ length: 10 }, (_, i) => (
                <motion.span
                  key={`sakura-${i}`}
                  initial={{ y: '-10%', x: `${Math.random() * 100}%`, opacity: 0 }}
                  animate={{
                    y: '120%',
                    x: `${Math.random() * 100}%`,
                    opacity: [0, 0.8, 0.6, 0],
                    rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 1.5,
                    delay: Math.random() * 2,
                    ease: 'linear',
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    fontSize: '16px',
                  }}
                >
                  🌸
                </motion.span>
              ))}
            </div>
          )}

          {/* Butterflies */}
          {effects.butterflies && (
            <div className="sc-butterflies">
              {Array.from({ length: 4 }, (_, i) => (
                <motion.span
                  key={`butterfly-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1.1, 0.8],
                    x: [0, 30, -20, 50],
                    y: [0, -40, -80, -120],
                  }}
                  transition={{
                    duration: 3 + Math.random(),
                    delay: 0.5 + Math.random() * 1,
                    ease: 'easeInOut',
                  }}
                  style={{
                    position: 'absolute',
                    left: `${20 + i * 20}%`,
                    bottom: '20%',
                    fontSize: '20px',
                  }}
                >
                  🦋
                </motion.span>
              ))}
            </div>
          )}

          {/* Balloons */}
          {effects.balloons && (
            <div className="sc-balloons">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.span
                  key={`balloon-${i}`}
                  initial={{ y: '120%', opacity: 0 }}
                  animate={{
                    y: '-20%',
                    opacity: [0, 1, 1, 0.5],
                    x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 1,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    left: `${10 + i * 18}%`,
                    bottom: 0,
                    fontSize: '28px',
                  }}
                >
                  🎈
                </motion.span>
              ))}
            </div>
          )}

          {/* Aurora Light */}
          {effects.auroraLight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 2 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #FF69B4 0%, #DDA0DD 25%, #87CEEB 50%, #98FB98 75%, #FFD700 100%)',
                backgroundSize: '400% 400%',
                animation: 'aurora 4s ease infinite',
                borderRadius: 'inherit',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationOverlay;
