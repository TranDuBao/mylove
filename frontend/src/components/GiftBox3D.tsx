import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { useThemeContext } from '../context/ThemeContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';

export const GiftBox3D: React.FC = () => {
  const { theme, content, t } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  
  // Refs for GSAP animation targets
  const boxRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const ribbonVRef = useRef<HTMLDivElement>(null);
  const ribbonHRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const openBox = () => {
    if (isOpen) return;
    setIsOpen(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setShowCard(true);
        triggerExplosion();
      }
    });

    // 1. Untie ribbon (fade & contract)
    tl.to([ribbonVRef.current, ribbonHRef.current], {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    });

    // 2. Lid flies up, spins, and fades out
    tl.to(lidRef.current, {
      y: -150,
      rotateX: 45,
      rotateY: 90,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.5)'
    }, '-=0.2');

    // 3. Sides fall down flat
    // Front falls forward
    tl.to(frontRef.current, {
      transformOrigin: 'bottom center',
      rotateX: -90,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4');

    // Back falls backward
    tl.to(backRef.current, {
      transformOrigin: 'bottom center',
      rotateX: 90,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.6');

    // Left falls left
    tl.to(leftRef.current, {
      transformOrigin: 'bottom left',
      rotateZ: -90,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.6');

    // Right falls right
    tl.to(rightRef.current, {
      transformOrigin: 'bottom right',
      rotateZ: 90,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.6');

    // 4. Shrink the bottom plate slightly
    tl.to(boxRef.current, {
      scale: 0.8,
      opacity: 0.5,
      duration: 0.4
    }, '-=0.2');
  };

  const triggerExplosion = () => {
    const colors = [theme?.primaryColor || '#FF7597', theme?.secondaryColor || '#E0A96D', '#FF3366', '#8B5CF6'];
    
    // Confetti explosion
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: colors
    });

    // Floating heart details
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 120,
        origin: { y: 0.5 },
        colors: colors,
        shapes: ['heart'] as any[]
      });
    }, 300);
  };

  if (!theme || !content) return null;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 w-full relative min-h-[550px]">
      <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide text-glow mb-2 uppercase text-center">
        {t('surpriseTitle')}
      </h2>
      <p className="text-primary text-sm md:text-base font-handwriting text-glow-gold text-center mb-16">
        {t('surpriseSub')}
      </p>

      {/* 3D Gift Box Container */}
      {!showCard && (
        <div 
          onClick={openBox}
          className="relative w-64 h-64 cursor-pointer group active:scale-95 transition-transform duration-200"
          style={{ perspective: '1000px' }}
        >
          {/* Box Wrapper (3D Rotation) */}
          <div 
            ref={boxRef}
            className="w-full h-full relative transition-transform duration-500 group-hover:rotate-y-12"
            style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(-20deg)' }}
          >
            {/* SIDES OF THE BOX */}
            {/* Front */}
            <div 
              ref={frontRef} 
              className="absolute inset-0 border border-primary/20 flex items-center justify-center"
              style={{
                background: `linear-gradient(to bottom, ${theme.primaryColor} 0%, rgba(255,117,151,0.85) 100%)`,
                transform: 'translateZ(128px)',
                backfaceVisibility: 'hidden'
              }}
            >
              <Gift size={48} className="text-white opacity-40 animate-pulse" />
            </div>

            {/* Back */}
            <div 
              ref={backRef} 
              className="absolute inset-0 border border-primary/20"
              style={{
                background: `linear-gradient(to bottom, ${theme.primaryColor} 0%, rgba(255,117,151,0.85) 100%)`,
                transform: 'rotateY(180deg) translateZ(128px)',
                backfaceVisibility: 'hidden'
              }}
            />

            {/* Left */}
            <div 
              ref={leftRef} 
              className="absolute inset-0 border border-primary/20"
              style={{
                background: `linear-gradient(to bottom, ${theme.primaryColor} 0%, rgba(255,117,151,0.85) 100%)`,
                transform: 'rotateY(-90deg) translateZ(128px)',
                backfaceVisibility: 'hidden'
              }}
            />

            {/* Right */}
            <div 
              ref={rightRef} 
              className="absolute inset-0 border border-primary/20"
              style={{
                background: `linear-gradient(to bottom, ${theme.primaryColor} 0%, rgba(255,117,151,0.85) 100%)`,
                transform: 'rotateY(90deg) translateZ(128px)',
                backfaceVisibility: 'hidden'
              }}
            />

            {/* Top (Lid) */}
            <div 
              ref={lidRef} 
              className="absolute w-[272px] h-[272px] left-[-4px] top-[-4px] border border-primary/40 shadow-2xl"
              style={{
                background: theme.primaryColor,
                transform: 'rotateX(90deg) translateZ(132px)',
                transformOrigin: 'center center',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.2)'
              }}
            />

            {/* Bottom */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'rgba(0,0,0,0.3)',
                transform: 'rotateX(-90deg) translateZ(128px)'
              }}
            />

            {/* RIBBONS */}
            {/* Vertical Ribbon */}
            <div 
              ref={ribbonVRef}
              className="absolute w-8 top-0 bottom-0 left-28 bg-yellow-400 z-10 shadow-lg"
              style={{
                transform: 'translateZ(129px)',
                background: `linear-gradient(to right, ${theme.secondaryColor}, #FDE047)`
              }}
            />

            {/* Horizontal Ribbon */}
            <div 
              ref={ribbonHRef}
              className="absolute h-8 left-0 right-0 top-28 bg-yellow-400 z-10 shadow-lg"
              style={{
                transform: 'translateZ(129px)',
                background: `linear-gradient(to bottom, ${theme.secondaryColor}, #FDE047)`
              }}
            />
          </div>
        </div>
      )}

      {/* Gift Card Reveal */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ scale: 0.7, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="glassmorphism p-8 md:p-12 rounded-2xl glow-border max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
          >
            {/* Subtle floating heart icons inside container */}
            <div className="absolute top-4 right-4 text-3xl animate-bounce">💖</div>
            <div className="absolute bottom-4 left-4 text-3xl animate-bounce delay-200">🎁</div>

            <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center mx-auto mb-6">
              <Gift size={32} className="text-secondary" />
            </div>

            <h3 className="text-primary text-2xl font-bold font-sans uppercase mb-4 tracking-wider text-glow">
              {t('yourGift')}
            </h3>
            
            <p className="text-secondary text-xl font-handwriting leading-relaxed mb-8 text-glow-gold">
              {content.giftBoxMessage || 'Surprise! Here is a little virtual token of my appreciation. You deserve all the happiness in the world! 🎁💖'}
            </p>

            <button
              onClick={() => {
                setShowCard(false);
                setIsOpen(false);
              }}
              className="px-6 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-white font-semibold text-sm transition-all hover:shadow-[0_0_15px_var(--secondary-color)] cursor-pointer"
            >
              {t('closeBox')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftBox3D;
