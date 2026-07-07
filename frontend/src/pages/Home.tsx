import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../context/ThemeContext.js';
import { ThreeHeart } from '../components/ThreeHeart.js';
import { LoveCounter } from '../components/LoveCounter.js';
import { BirthdayCountdown } from '../components/BirthdayCountdown.js';
import { GalleryCarousel } from '../components/GalleryCarousel.js';
import { TimelineVisual } from '../components/TimelineVisual.js';
import { LetterContainer } from '../components/LetterContainer.js';
import { InteractiveMap } from '../components/InteractiveMap.js';
import { GiftBox3D } from '../components/GiftBox3D.js';
import { Cake3D } from '../components/Cake3D.js';
import { Heart, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Home: React.FC = () => {
  const { settings, theme } = useThemeContext();
  
  // Loading Screen States
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showEnterBtn, setShowEnterBtn] = useState(false);
  const enterSoundRef = useRef<HTMLAudioElement | null>(null);

  // Default loading texts
  const loadingTexts = settings?.loadingText || [
    'Collecting memories...',
    'Polishing stars...',
    'Catching cherry blossoms...',
    'Connecting hearts...'
  ];
  
  const currentMsgIdx = Math.min(
    Math.floor((progress / 100) * loadingTexts.length),
    loadingTexts.length - 1
  );

  // Initialize pop sound
  useEffect(() => {
    enterSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
    enterSoundRef.current.volume = 0.5;
  }, []);

  // Loading Ticker Progress Simulator
  useEffect(() => {
    if (progress >= 100) {
      setShowEnterBtn(true);
      return;
    }
    const delay = Math.random() * 200 + 100;
    const timer = setTimeout(() => {
      setProgress(prev => Math.min(prev + Math.floor(Math.random() * 12 + 6), 100));
    }, delay);
    return () => clearTimeout(timer);
  }, [progress]);

  // Lenis Smooth Scroll Setup
  useEffect(() => {
    if (!isLoaded) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isLoaded]);

  const handleEnterApp = () => {
    if (enterSoundRef.current) {
      enterSoundRef.current.play().catch(() => {});
    }
    setIsLoaded(true);

    // Initial confetti burst on landing
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [theme?.primaryColor || '#FF7597', '#FF3366', '#FF99AA']
      });
    }, 500);
  };

  if (!theme) return null;

  return (
    <div className="w-full relative min-h-screen">
      
      {/* 1. LUXURY GLASS LOADER SCREEN */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#0F0C1B] z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Soft background glow */}
            <div className="absolute w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

            {/* Glowing heartbeat icon */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="text-primary mb-8 filter drop-shadow-[0_0_15px_var(--primary-color)]"
            >
              <Heart size={64} className="fill-current" />
            </motion.div>

            {/* Loading text messages */}
            <h3 className="text-white text-lg font-medium tracking-widest uppercase mb-2 h-6">
              {loadingTexts[currentMsgIdx]}
            </h3>
            
            {/* Progress Percentage */}
            <span className="text-secondary text-sm font-mono mb-6">{progress}%</span>

            {/* Progress Bar slider */}
            <div className="w-48 h-[2px] bg-white/10 rounded-full relative mb-10 overflow-hidden">
              <motion.div 
                className="h-full bg-primary absolute left-0 top-0"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Enter Button */}
            <AnimatePresence>
              {showEnterBtn && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleEnterApp}
                  className="px-8 py-3 rounded-full bg-primary hover:bg-primary/80 text-white font-bold text-sm tracking-wider uppercase cursor-pointer hover:shadow-[0_0_20px_var(--primary-color)] transition-all transform active:scale-95 z-10"
                >
                  Enter Our Story
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN APPLICATION CONTENT */}
      {isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0 }}
          className="w-full"
        >
          {/* Hero Landing banner */}
          <section className="min-h-screen flex flex-col items-center justify-center relative pt-20">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 blur-[150px] rounded-full" />

            <div className="text-center z-10 max-w-2xl px-4 flex flex-col items-center">
              <h1 className="text-text text-4xl md:text-6xl font-bold uppercase tracking-wider font-sans text-glow">
                My Universe
              </h1>
              <p className="text-primary text-base md:text-xl font-handwriting mt-3 text-glow-gold">
                Made for the most precious person in my life
              </p>
            </div>

            {/* 3D Heart R3F Container */}
            <ThreeHeart />

            {/* Floating arrow spacer */}
            <div className="absolute bottom-10 animate-bounce flex flex-col items-center text-primary/60 text-xs">
              <span className="mb-1 tracking-wider uppercase font-semibold">Scroll Down</span>
              <ChevronDown size={16} />
            </div>
          </section>

          {/* Love Anniversary Counter */}
          <section className="relative z-10">
            <LoveCounter />
          </section>

          {/* Birthday countdown */}
          <section className="relative z-10">
            <BirthdayCountdown />
          </section>

          {/* 3D Cake blowout candles */}
          <section className="relative z-10 bg-black/10">
            <Cake3D />
          </section>

          {/* Love Letters envelopes */}
          <section className="relative z-10">
            <LetterContainer />
          </section>

          {/* Surprise Box opening */}
          <section className="relative z-10 bg-black/10">
            <GiftBox3D />
          </section>

          {/* Memory Timeline milestones */}
          <section className="relative z-10">
            <TimelineVisual />
          </section>

          {/* Swiper Lightbox album gallery */}
          <section className="relative z-10 bg-black/10">
            <GalleryCarousel />
          </section>

          {/* Leaflet Custom Marker map */}
          <section className="relative z-10">
            <InteractiveMap />
          </section>

          {/* ENDING SCREEN BANNER */}
          <section className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-black/5 relative overflow-hidden">
            {/* Rose petal/Confetti generator triggered on scroll enter */}
            <motion.div
              onViewportEnter={() => {
                const colors = [theme.primaryColor, theme.secondaryColor, '#FF3366'];
                // Confetti shower
                confetti({
                  particleCount: 100,
                  spread: 90,
                  origin: { y: 0.6 },
                  colors: colors
                });
              }}
              className="max-w-2xl px-4 z-10"
            >
              <Heart size={48} className="text-primary fill-primary mx-auto animate-beat mb-8 filter drop-shadow-[0_0_10px_var(--primary-color)]" />
              
              <h2 className="text-text text-3xl md:text-5xl font-bold uppercase tracking-wider text-glow font-sans mb-6">
                Forever With You
              </h2>
              
              <p className="text-primary text-2xl md:text-4xl font-handwriting leading-relaxed text-glow-gold mb-12">
                "You are the best thing that has ever happened to me. I love you forever." ❤️
              </p>
              
              <span className="text-text/40 font-mono text-[10px] uppercase tracking-widest block">
                {settings?.copyrightText || 'Made with ❤️ for you forever'}
              </span>
            </motion.div>
          </section>

        </motion.div>
      )}

    </div>
  );
};

export default Home;
