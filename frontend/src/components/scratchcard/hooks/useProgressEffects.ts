import { useRef, useCallback } from 'react';
import type { ProgressMilestone, MilestoneEffect } from '../../../types/scratchcard.js';

interface UseProgressEffectsOptions {
  milestones: ProgressMilestone[];
  containerRef: React.RefObject<HTMLElement | null>;
  onAutoReveal?: () => void;
}

/**
 * Watches scratch percentage and fires visual effects at configured milestones.
 * Uses pooled DOM elements for performance.
 */
export function useProgressEffects(options: UseProgressEffectsOptions) {
  const { milestones, containerRef, onAutoReveal } = options;
  const firedRef = useRef<Set<number>>(new Set());
  const particlePoolRef = useRef<HTMLElement[]>([]);

  // Get or create a particle element from pool
  const getParticle = useCallback((): HTMLElement => {
    const el = particlePoolRef.current.pop() || document.createElement('div');
    el.className = '';
    el.style.cssText = '';
    return el;
  }, []);

  // Return particle to pool after animation
  const returnParticle = useCallback((el: HTMLElement, delay: number) => {
    setTimeout(() => {
      el.remove();
      particlePoolRef.current.push(el);
    }, delay);
  }, []);

  // ─── Effect Spawners ──────────────────────────────────────────

  const spawnSparkles = useCallback(
    (count = 8) => {
      const container = containerRef.current;
      if (!container) return;

      for (let i = 0; i < count; i++) {
        const el = getParticle();
        el.className = 'sc-sparkle-particle';
        el.textContent = '✨';
        el.style.left = `${Math.random() * 100}%`;
        el.style.top = `${Math.random() * 100}%`;
        el.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(el);
        returnParticle(el, 1500);
      }
    },
    [containerRef, getParticle, returnParticle]
  );

  const spawnGlow = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.classList.add('sc-glow-active');
    setTimeout(() => container.classList.remove('sc-glow-active'), 2000);
  }, [containerRef]);

  const spawnHearts = useCallback(
    (count = 6) => {
      const container = containerRef.current;
      if (!container) return;

      const heartEmojis = ['💕', '💖', '💗', '💝', '❤️', '🩷'];
      for (let i = 0; i < count; i++) {
        const el = getParticle();
        el.className = 'sc-heart-particle';
        el.textContent = heartEmojis[i % heartEmojis.length];
        el.style.left = `${10 + Math.random() * 80}%`;
        el.style.bottom = '0';
        el.style.animationDelay = `${Math.random() * 0.8}s`;
        el.style.fontSize = `${14 + Math.random() * 12}px`;
        container.appendChild(el);
        returnParticle(el, 2500);
      }
    },
    [containerRef, getParticle, returnParticle]
  );

  const spawnConfetti = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = ['#FF5C93', '#FFB6C1', '#FF69B4', '#FFD700', '#87CEEB', '#DDA0DD'];
    for (let i = 0; i < 20; i++) {
      const el = getParticle();
      el.className = 'sc-confetti-particle';
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = '-10px';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.width = `${4 + Math.random() * 6}px`;
      el.style.height = `${4 + Math.random() * 6}px`;
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.animationDelay = `${Math.random() * 0.6}s`;
      el.style.animationDuration = `${1 + Math.random() * 1}s`;
      container.appendChild(el);
      returnParticle(el, 2500);
    }
  }, [containerRef, getParticle, returnParticle]);

  const spawnCelebration = useCallback(() => {
    spawnConfetti();
    spawnHearts(10);
    spawnSparkles(12);
    spawnGlow();
  }, [spawnConfetti, spawnHearts, spawnSparkles, spawnGlow]);

  // ─── Effect Dispatcher ────────────────────────────────────────

  const fireEffect = useCallback(
    (effect: MilestoneEffect) => {
      switch (effect) {
        case 'sparkle':
          spawnSparkles();
          break;
        case 'glow':
          spawnGlow();
          break;
        case 'hearts':
          spawnHearts();
          break;
        case 'confetti':
          spawnConfetti();
          break;
        case 'autoReveal':
          onAutoReveal?.();
          break;
        case 'celebration':
          spawnCelebration();
          break;
      }
    },
    [spawnSparkles, spawnGlow, spawnHearts, spawnConfetti, spawnCelebration, onAutoReveal]
  );

  // ─── Check & Fire Milestones ──────────────────────────────────

  const checkMilestones = useCallback(
    (percentage: number) => {
      for (const milestone of milestones) {
        if (
          percentage >= milestone.percentage &&
          !firedRef.current.has(milestone.percentage)
        ) {
          firedRef.current.add(milestone.percentage);
          fireEffect(milestone.effect);
        }
      }
    },
    [milestones, fireEffect]
  );

  const resetMilestones = useCallback(() => {
    firedRef.current.clear();
  }, []);

  return {
    checkMilestones,
    resetMilestones,
    spawnCelebration,
  };
}
