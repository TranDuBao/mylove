import React, { useState, useEffect, useRef } from 'react';
import { useThemeContext } from '../context/ThemeContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface BalloonItem {
  id: number;
  x: number;
  color: string;
  delay: number;
  scale: number;
}

export const BirthdayCountdown: React.FC = () => {
  const { content, theme, settings, t } = useThemeContext();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isBirthday, setIsBirthday] = useState(false);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [shake, setShake] = useState(false);
  const bdayAudioRef = useRef<HTMLAudioElement | null>(null);
  const celebrationInterval = useRef<any>(null);

  // Parse next birthday date occurrence
  const getNextBirthday = (dateStr: string) => {
    const bday = new Date(dateStr);
    const now = new Date();
    let targetYear = now.getFullYear();
    const nextBday = new Date(targetYear, bday.getMonth(), bday.getDate(), 0, 0, 0);

    if (nextBday.getTime() < now.getTime()) {
      nextBday.setFullYear(targetYear + 1);
    }
    return nextBday;
  };

  useEffect(() => {
    if (!settings?.enableBirthdayCountdown || !content?.birthdayDate) return;

    const targetDate = getNextBirthday(content.birthdayDate);
    bdayAudioRef.current = new Audio(
      content.birthdayMusicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    );
    bdayAudioRef.current.loop = true;
    bdayAudioRef.current.volume = 0.5;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        setIsBirthday(true);
        setTimeLeft(null);
        triggerCelebration();
      } else {
        setIsBirthday(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
      if (celebrationInterval.current) clearInterval(celebrationInterval.current);
      if (bdayAudioRef.current) bdayAudioRef.current.pause();
    };
  }, [content, settings]);

  const triggerCelebration = () => {
    // 1. Play music
    if (bdayAudioRef.current) {
      bdayAudioRef.current.play().catch(() => {});
    }

    // 2. Camera shake
    setShake(true);
    setTimeout(() => setShake(false), 2000);

    // 3. Repeat confetti & fireworks blasts
    const colors = [theme?.primaryColor || '#FF7597', theme?.secondaryColor || '#E0A96D', '#FF3366', '#5CE1E6'];
    
    celebrationInterval.current = setInterval(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
    }, 1500);

    // 4. Generate floating balloons
    const generatedBalloons: BalloonItem[] = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5, // percentage left
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 8,
      scale: Math.random() * 0.4 + 0.8
    }));
    setBalloons(generatedBalloons);
  };

  if (!settings?.enableBirthdayCountdown || !timeLeft && !isBirthday) return null;

  return (
    <div className={`py-12 md:py-20 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden relative w-full ${shake ? 'animate-bounce' : ''}`}>
      
      {/* Background balloons floating when birthday matches */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <AnimatePresence>
          {isBirthday && balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              className="absolute bottom-[-100px] flex flex-col items-center"
              style={{ left: `${balloon.x}%` }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: -1200,
                opacity: [0, 1, 1, 0],
                rotate: [0, balloon.id % 2 === 0 ? 15 : -15, 0]
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                delay: balloon.delay,
                ease: 'easeInOut',
                repeat: Infinity
              }}
            >
              {/* Balloon Body */}
              <div
                className="w-12 h-16 rounded-full relative"
                style={{
                  backgroundColor: balloon.color,
                  boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.2), 3px 3px 10px rgba(0,0,0,0.15)',
                  transform: `scale(${balloon.scale})`
                }}
              >
                {/* Highlight Shine */}
                <div className="absolute top-2 left-2 w-3 h-4 bg-white opacity-40 rounded-full rotate-[-20deg]" />
                {/* Knot */}
                <div 
                  className="absolute bottom-[-3px] left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
                  style={{ borderBottom: `5px solid ${balloon.color}`, borderRight: `5px solid ${balloon.color}` }}
                />
              </div>
              {/* Balloon String */}
              <div className="w-[1px] h-20 bg-white opacity-40" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full px-4 text-center z-20">
        {!isBirthday ? (
          <>
            <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide text-glow mb-2 uppercase">
              {t('bdayTitle')}
            </h2>
            <p className="text-secondary text-sm md:text-base font-handwriting text-glow-gold mb-8">
              {t('bdaySub')}
            </p>

            <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
              {[
                { label: t('days'), value: timeLeft?.days },
                { label: t('hours'), value: timeLeft?.hours },
                { label: t('minutes'), value: timeLeft?.minutes },
                { label: t('seconds'), value: timeLeft?.seconds }
              ].map((item, idx) => (
                <div key={idx} className="glassmorphism p-3 md:p-5 rounded-lg flex flex-col items-center glow-border">
                  <span className="text-2xl md:text-4xl font-bold text-primary text-glow mb-1">
                    {item.value?.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs uppercase tracking-wider text-secondary">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="glassmorphism p-8 md:p-12 rounded-2xl glow-border max-w-2xl mx-auto relative overflow-hidden backdrop-blur-md"
          >
            {/* Sakura overlay */}
            <div className="absolute top-2 right-2 text-3xl">🌸</div>
            <div className="absolute bottom-2 left-2 text-3xl">🎉</div>

            <h1 className="text-4xl md:text-6xl font-bold text-text text-glow font-handwriting mb-4">
              Happy Birthday, My Queen! 👑
            </h1>
            
            <p className="text-lg md:text-xl text-text font-sans leading-relaxed mb-6">
              {content?.birthdayMessage || 'I love you with all my heart. You deserve the best day!'}
            </p>

            <div className="flex justify-center gap-4">
              <span className="text-3xl animate-bounce">🎂</span>
              <span className="text-3xl animate-bounce delay-100">💖</span>
              <span className="text-3xl animate-bounce delay-200">🌹</span>
              <span className="text-3xl animate-bounce delay-300">🎈</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BirthdayCountdown;
