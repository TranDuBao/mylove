import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useThemeContext } from '../context/ThemeContext.js';

// Custom component to handle mouse cursor heart trails
const CursorHearts: React.FC = () => {
  const { effects, theme } = useThemeContext();

  useEffect(() => {
    if (!effects || !effects.cursorHearts || !theme) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Limit cursor trail density by throttling creation
      if (Math.random() > 0.4) return;

      const heart = document.createElement('div');
      heart.className = 'cursor-heart';
      heart.innerHTML = '❤️';
      heart.style.left = `${e.clientX}px`;
      heart.style.top = `${e.clientY}px`;
      
      const size = Math.random() * 12 + 8;
      heart.style.fontSize = `${size}px`;
      
      // Tint heart or default red/pink
      const colors = [theme.primaryColor, theme.secondaryColor, '#FF3366', '#FF99AA'];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      heart.style.color = chosenColor;

      const rotation = Math.random() * 360;
      heart.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      
      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 800);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [effects, theme]);

  return null;
};

export const ParticleLayer: React.FC = () => {
  const { effects, theme } = useThemeContext();
  const [init, setInit] = useState(false);

  // Initialize tsParticles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init || !effects || !theme) return null;

  // Build tsParticles Options based on active states
  const getParticleOptions = () => {
    // Basic settings
    const options: any = {
      fullScreen: { enable: true, zIndex: -1 },
      fpsLimit: 60,
      detectRetina: true,
      background: {
        color: { value: "transparent" }
      },
      particles: {
        number: { value: 0 },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 3 } },
        move: { enable: false }
      }
    };

    // We can define multiple particle definitions using tsParticles emitter structures
    // For simplicity, we merge the active effects into the main particles definition
    const activeParticles: any[] = [];

    // Sakura cherry blossoms config
    if (effects.flowers) {
      activeParticles.push({
        group: "sakura",
        number: { value: 20, limit: 40 },
        color: { value: [theme.primaryColor, "#FFB7C5", "#FFAAAA"] },
        shape: {
          type: "polygon",
          options: {
            polygon: { sides: 5 } // Mimics flower petal
          }
        },
        opacity: { value: { min: 0.4, max: 0.8 } },
        size: { value: { min: 4, max: 8 } },
        move: {
          enable: true,
          speed: { min: 1, max: 3 },
          direction: "bottom-right",
          random: true,
          straight: false,
          outModes: "out"
        },
        rotate: {
          value: { min: 0, max: 360 },
          animation: { enable: true, speed: 5 }
        },
        wobble: {
          enable: true,
          distance: 10,
          speed: 10
        }
      });
    }

    // Snow config
    if (effects.snow) {
      activeParticles.push({
        group: "snow",
        number: { value: 30, limit: 60 },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: { min: 0.3, max: 0.7 } },
        size: { value: { min: 2, max: 5 } },
        move: {
          enable: true,
          speed: { min: 0.5, max: 2 },
          direction: "bottom",
          random: true,
          straight: false,
          outModes: "out"
        },
        wobble: {
          enable: true,
          distance: 5,
          speed: 5
        }
      });
    }

    // Rain config
    if (effects.rain) {
      activeParticles.push({
        group: "rain",
        number: { value: 50, limit: 100 },
        color: { value: "#AEC6CF" },
        shape: {
          type: "line",
        },
        opacity: { value: 0.3 },
        size: { value: { min: 1, max: 2 } },
        move: {
          enable: true,
          speed: { min: 10, max: 20 },
          direction: "bottom",
          straight: true,
          outModes: "out"
        }
      });
    }

    // Floating Hearts config
    if (effects.cursorHearts || effects.glow) { // If floating hearts or glow is enabled
      const heartCount = effects.cursorHearts ? 10 : 0;
      if (heartCount > 0) {
        activeParticles.push({
          group: "hearts",
          number: { value: heartCount, limit: 20 },
          color: { value: ["#FF3366", theme.primaryColor, "#FF99AA"] },
          shape: {
            type: "char",
            options: {
              char: {
                value: ["❤️"],
                font: "Outfit",
                style: "",
                weight: "400",
                fill: true
              }
            }
          },
          opacity: { value: { min: 0.3, max: 0.6 } },
          size: { value: { min: 8, max: 16 } },
          move: {
            enable: true,
            speed: { min: 0.5, max: 1.5 },
            direction: "top",
            random: true,
            straight: false,
            outModes: "out"
          }
        });
      }
    }

    // Glow Background Particles / Fireflies config
    if (effects.particles) {
      activeParticles.push({
        group: "fireflies",
        number: { value: 25, limit: 50 },
        color: { value: ["#FDE047", theme.secondaryColor] }, // Soft gold/yellow
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.2, max: 0.7 },
          animation: { enable: true, speed: 1, sync: false }
        },
        size: { value: { min: 1.5, max: 4 } },
        move: {
          enable: true,
          speed: { min: 0.2, max: 0.8 },
          direction: "none",
          random: true,
          straight: false,
          outModes: "bounce"
        }
      });
    }

    // Stars background config
    if (effects.stars) {
      activeParticles.push({
        group: "stars",
        number: { value: 40, limit: 80 },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.1, max: 0.8 },
          animation: { enable: true, speed: 0.5, sync: false }
        },
        size: { value: { min: 0.5, max: 1.5 } },
        move: {
          enable: false
        }
      });
    }

    // If we have active particle structures, merge them into the config
    if (activeParticles.length > 0) {
      // In tsParticles, we can pass an array of particle settings to support multiple styles!
      options.particles = activeParticles.map(p => ({
        ...p,
        // Make sure standard behaviors are set
        stroke: { width: 0 },
        lineLinked: { enable: false },
      }));
    }

    return options;
  };

  return (
    <>
      <Particles id="romantic-particles" options={getParticleOptions()} />
      <CursorHearts />
    </>
  );
};

export default ParticleLayer;
