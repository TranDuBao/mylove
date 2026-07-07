import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useThemeContext } from '../context/ThemeContext.js';

// Default fallback photos (used when no photos are added in Admin CMS)
// To use Admin CMS photos, go to Admin → Birthday Gallery and upload photos there.
const DEFAULT_GALLERY = [
  { image: "images/photo1.jpg", caption: "The day we first met ❤️" },
  { image: "images/photo2.jpg", caption: "Our first trip together ✨" },
  { image: "images/photo3.jpg", caption: "The happiest moment 💕" },
  { image: "images/photo4.jpg", caption: "Sweet memories together 🌹" },
  { image: "images/photo5.jpg", caption: "Forever and always 💖" },
];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// ─── Types & Interfaces ─────────────────────────────────────────────
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }
interface Firework { x: number; y: number; particles: Particle[]; color: string; phase: 'rising' | 'exploded'; vy: number; }
interface Petal { id: number; x: number; y: number; rotation: number; speed: number; sway: number; opacity: number; size: number; }
interface HeartParticle { id: number; x: number; y: number; size: number; color: string; delay: number; duration: number; rotate: number; }
interface Balloon { id: number; x: number; color: string; delay: number; scale: number; sway: number; }

interface FlyingPhoto {
  id: number;
  image: string;
  caption: string;
  targetX: number; // relative to center
  targetY: number; // relative to center
  targetRotate: number;
  isLanded: boolean;
}

const getUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // If it's a frontend static asset (starts with 'images/'), return it directly relative to root
  if (url.startsWith('images/') || url.startsWith('/images/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }
  const baseUrl = (import.meta.env.VITE_API_URL as string)?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getNextBirthday = (dateStr: string) => {
  const bday = new Date(dateStr);
  const now = new Date();
  const next = new Date(now.getFullYear(), bday.getMonth(), bday.getDate(), 0, 0, 0);
  if (next.getTime() < now.getTime()) next.setFullYear(now.getFullYear() + 1);
  return next;
};

// ─── Sub-components ──────────────────────────────────────────────────

/** Animated candle with click-to-blow */
const Candle: React.FC<{ color?: string; height?: number; glowIntensity?: number }> = ({ color = '#FFB6C1', height = 40, glowIntensity = 1 }) => {
  const [blown, setBlown] = useState(false);
  const [smoke, setSmoke] = useState(false);

  const blow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (blown) return;
    setSmoke(true);
    setTimeout(() => { setBlown(true); setSmoke(false); }, 700);
  };

  return (
    <div className="flex flex-col items-center select-none" style={{ gap: 0 }}>
      {/* Flame */}
      <div className="relative" style={{ height: 28, width: 16 }}>
        {!blown && (
          <div onClick={blow} className="cursor-pointer absolute bottom-0 left-1/2 -translate-x-1/2" title="Click to blow!">
            <div style={{
              width: 10, height: 20, background: 'radial-gradient(ellipse at 50% 80%, #FF6B00, #FFB300 50%, #FFE87C 100%)',
              borderRadius: '50% 50% 35% 35% / 60% 60% 40% 40%',
              filter: 'blur(0.5px)',
              animation: 'flicker 0.4s ease-in-out infinite alternate',
              boxShadow: `0 0 ${8 * glowIntensity}px ${4 * glowIntensity}px rgba(255, 140, 0, 0.5)`,
            }} />
          </div>
        )}
        {smoke && (
          <div style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 4, height: 20, background: 'rgba(150,150,150,0.6)',
            borderRadius: '50%',
            animation: 'smokeUp 0.7s ease-out forwards',
            filter: 'blur(2px)',
          }} />
        )}
      </div>
      {/* Wick */}
      <div style={{ width: 1.5, height: 4, background: '#333' }} />
      {/* Candle body */}
      <div style={{
        width: 10, height,
        background: `linear-gradient(180deg, ${color}, ${color}dd)`,
        borderRadius: '3px 3px 2px 2px',
        boxShadow: `inset -2px 0 4px rgba(0,0,0,0.15), 0 ${blown ? 0 : 4}px ${blown ? 0 : 12}px rgba(255,150,0,${blown ? 0 : 0.3})`,
        transition: 'box-shadow 0.5s',
      }}>
        <div style={{ width: 4, height: 8, background: color, borderRadius: '0 0 4px 4px', marginLeft: 1, opacity: 0.7 }} />
      </div>
    </div>
  );
};

/** 3D Birthday Cake Component */
const BirthdayCake: React.FC<{ celebrate: boolean; shake: boolean; aura: boolean; glowIntensity: number }> = ({ celebrate, shake, aura, glowIntensity }) => {
  const cakeStyle: React.CSSProperties = {
    animation: shake ? 'cakeShake 0.4s ease-in-out infinite' : (celebrate ? 'cakeBounce 0.5s ease-in-out 2' : 'cakeFloat 3s ease-in-out infinite'),
    filter: aura ? `drop-shadow(0 0 25px rgba(255, 215, 0, 0.6))` : undefined,
    transition: 'filter 1s ease',
  };

  return (
    <div className="relative flex flex-col items-center select-none" style={cakeStyle}>
      {/* Candles */}
      <div className="flex gap-3 mb-1 z-10">
        <Candle color="#FFB6C1" height={35} glowIntensity={glowIntensity} />
        <Candle color="#FFFACD" height={40} glowIntensity={glowIntensity} />
        <Candle color="#FFE4E1" height={32} glowIntensity={glowIntensity} />
        <Candle color="#E6E6FA" height={38} glowIntensity={glowIntensity} />
        <Candle color="#F0FFF0" height={34} glowIntensity={glowIntensity} />
      </div>

      {/* TOP tier */}
      <div className="relative" style={{ zIndex: 3 }}>
        <div style={{
          width: 120, height: 55,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF0F5 50%, #FFD6E7 100%)',
          borderRadius: '8px 8px 4px 4px',
          boxShadow: '0 4px 20px rgba(255,92,147,0.25), inset 0 2px 8px rgba(255,255,255,0.8)',
          border: '1.5px solid rgba(255,182,193,0.5)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Cream swirls */}
          {[15, 45, 75, 105].map(x => (
            <div key={x} style={{
              position: 'absolute', top: -6, left: x - 10, width: 20, height: 14,
              background: 'radial-gradient(ellipse, #fff 60%, #FFD6E7 100%)',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(255,92,147,0.3)',
            }} />
          ))}
          {/* Macarons */}
          {[20, 60, 100].map(x => (
            <div key={x} style={{
              position: 'absolute', bottom: 6, left: x - 8, width: 16, height: 10,
              background: 'linear-gradient(180deg, #FF9EAC, #FF7597)',
              borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }} />
          ))}
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#FF5C93', fontFamily: 'serif', letterSpacing: 1 }}>
            ✨ Happy ✨
          </div>
        </div>
        <div style={{ width: 120, height: 8, background: 'linear-gradient(180deg, #FFD6E7, #FFAFC7)', borderRadius: '0 0 4px 4px' }} />
      </div>

      {/* MIDDLE tier */}
      <div className="relative" style={{ zIndex: 2, marginTop: -2 }}>
        <div style={{
          width: 160, height: 65,
          background: 'linear-gradient(180deg, #FFF0F5 0%, #FFE4EF 60%, #FFCCE0 100%)',
          borderRadius: '6px 6px 3px 3px',
          boxShadow: '0 4px 20px rgba(255,92,147,0.2), inset 0 2px 6px rgba(255,255,255,0.6)',
          border: '1.5px solid rgba(255,182,193,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Cream top */}
          {[10, 35, 60, 90, 120, 148].map(x => (
            <div key={x} style={{
              position: 'absolute', top: -8, left: x - 10, width: 22, height: 16,
              background: 'radial-gradient(ellipse, #fff 60%, #FFD6E7 100%)',
              borderRadius: '50%', boxShadow: '0 2px 4px rgba(255,92,147,0.2)',
            }} />
          ))}
          {/* Strawberries */}
          {[25, 80, 130].map(x => (
            <div key={x} style={{ position: 'absolute', bottom: 8, left: x }}>
              <div style={{ width: 14, height: 15, background: 'linear-gradient(180deg, #FF2244, #CC0033)', borderRadius: '50% 50% 45% 45%', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)', borderRadius: 'inherit' }} />
              </div>
              <div style={{ width: 6, height: 5, background: '#22AA44', borderRadius: '50%', marginTop: -2, marginLeft: 4 }} />
            </div>
          ))}
          {/* Flowers */}
          {[50, 110].map(x => (
            <div key={x} style={{ position: 'absolute', top: 18, left: x, fontSize: 12 }}>🌸</div>
          ))}
        </div>
        <div style={{ width: 160, height: 10, background: 'linear-gradient(180deg, #FFAFC7, #FF94B4)', borderRadius: '0 0 4px 4px' }} />
      </div>

      {/* BOTTOM tier */}
      <div className="relative" style={{ zIndex: 1, marginTop: -2 }}>
        <div style={{
          width: 210, height: 75,
          background: 'linear-gradient(180deg, #FFE4EF 0%, #FFD0E8 60%, #FFBBD8 100%)',
          borderRadius: '6px 6px 2px 2px',
          boxShadow: '0 8px 32px rgba(255,92,147,0.3), inset 0 2px 8px rgba(255,255,255,0.5)',
          border: '1.5px solid rgba(255,150,190,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top cream */}
          {[5, 30, 55, 80, 105, 130, 155, 180, 205].map(x => (
            <div key={x} style={{
              position: 'absolute', top: -9, left: x - 10, width: 24, height: 18,
              background: 'radial-gradient(ellipse, #fff 55%, #FFD6E7 100%)',
              borderRadius: '50%', boxShadow: '0 2px 5px rgba(255,92,147,0.2)',
            }} />
          ))}
          <div style={{
            position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
            fontFamily: 'serif', fontSize: 11, fontWeight: 'bold',
            background: 'linear-gradient(90deg, #C8A951, #FFD700, #C8A951)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: 1,
          }}>
            🎂 Birthday 🎂
          </div>
        </div>
        <div style={{ width: 210, height: 14, background: 'linear-gradient(180deg, #FF94B4, #FF7597)', borderRadius: '0 0 6px 6px', boxShadow: '0 4px 12px rgba(255,92,147,0.25)' }} />
      </div>

      {/* Stand */}
      <div style={{ width: 240, height: 8, background: 'linear-gradient(180deg, #E8E8E8, #D0D0D0)', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
      <div style={{ width: 80, height: 14, background: 'linear-gradient(180deg, #D0D0D0, #B8B8B8)', borderRadius: '2px 2px 8px 8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
    </div>
  );
};

/** Giant magical gift box component */
const GiantGiftBox: React.FC<{ status: 'dropping' | 'untieing' | 'opened' }> = ({ status }) => {
  return (
    <div className={`relative select-none ${status === 'dropping' ? 'animate-giftDrop' : ''}`} style={{ width: 140, height: 130 }}>
      {/* Sparkles / Aura */}
      {status !== 'dropping' && (
        <div className="absolute inset-0 bg-yellow-200/20 blur-xl rounded-full scale-150 animate-pulse pointer-events-none" />
      )}

      {/* Lid & ribbon bow */}
      <div className={`absolute top-0 left-0 right-0 z-20 transition-all duration-700 ${status === 'opened' ? '-translate-y-12 rotate-[-12deg] opacity-70' : ''}`}>
        {/* Bow */}
        <div className={`absolute top-[-24px] left-1/2 -translate-x-1/2 transition-transform duration-500 ${status === 'untieing' ? 'scale-0' : ''}`} style={{ width: 80, height: 30 }}>
          <div className="absolute left-0 top-0 w-10 h-8 bg-amber-400 rounded-full border-2 border-amber-300" style={{ transform: 'rotate(-20deg)', transformOrigin: 'right bottom' }} />
          <div className="absolute right-0 top-0 w-10 h-8 bg-amber-400 rounded-full border-2 border-amber-300" style={{ transform: 'rotate(20deg)', transformOrigin: 'left bottom' }} />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-500 rounded-full border-2 border-amber-300 shadow-md" />
        </div>

        {/* Lid body */}
        <div className="w-full h-8 bg-gradient-to-r from-rose-500 to-rose-600 rounded-t-lg border-b-4 border-rose-700 shadow-md relative">
          {/* Horizontal gold ribbon */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-amber-400" />
        </div>
      </div>

      {/* Box body */}
      <div className="absolute top-7 left-1 right-1 bottom-0 bg-gradient-to-br from-rose-600 to-rose-700 rounded-b-lg border border-rose-800 shadow-xl overflow-hidden" style={{ zIndex: 10 }}>
        {/* Golden ribbon wrap */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-amber-400 border-x border-amber-500" />
        {/* Sparkly particle dots */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:10px_10px]" />

        {/* Inside glowing light (only visible when opened) */}
        {status === 'opened' && (
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-300/80 via-amber-400/50 to-transparent animate-pulse" />
        )}
      </div>
    </div>
  );
};

/** Flower petal */
const FlowerPetal: React.FC<{ id: number }> = ({ id }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    top: -20,
    left: `${(id * 73) % 100}%`,
    width: rand(8, 18),
    height: rand(8, 18),
    background: `hsl(${330 + (id * 17) % 40}, 80%, ${70 + (id * 11) % 20}%)`,
    borderRadius: '0 50% 50% 50%',
    opacity: rand(0.5, 0.9),
    animation: `petalFall ${rand(4, 9)}s linear infinite`,
    animationDelay: `${rand(0, 6)}s`,
    transform: `rotate(${rand(0, 360)}deg)`,
    pointerEvents: 'none',
  };
  return <div style={style} />;
};

// ─── Canvas Fireworks ────────────────────────────────────────────────
const FireworksCanvas: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  const COLORS = ['#FF5C93', '#FFD700', '#00E5FF', '#FF69B4', '#FF4500', '#7B68EE', '#00FF7F', '#FF6347'];

  const spawnFirework = useCallback((canvas: HTMLCanvasElement) => {
    const x = rand(canvas.width * 0.1, canvas.width * 0.9);
    const y = canvas.height;
    const color = COLORS[Math.floor(rand(0, COLORS.length))];
    fireworksRef.current.push({ x, y, color, phase: 'rising', vy: -rand(10, 18), particles: [] });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let spawnTimer = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (activeRef.current) {
        spawnTimer++;
        if (spawnTimer % 20 === 0) spawnFirework(canvas);
      }

      fireworksRef.current = fireworksRef.current.filter(fw => {
        if (fw.phase === 'rising') {
          fw.y += fw.vy;
          fw.vy += 0.4;
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = fw.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = fw.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (fw.vy >= -2) {
            fw.phase = 'exploded';
            const isHeart = Math.random() < 0.35;
            if (isHeart) {
              for (let t = 0; t < Math.PI * 2; t += 0.25) {
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                const speed = rand(2.2, 5.5);
                fw.particles.push({
                  x: fw.x, y: fw.y,
                  vx: (hx / 16) * speed, vy: (hy / 16) * speed,
                  life: 1, color: '#FF1493', size: rand(2.5, 4.5),
                });
              }
            } else {
              const count = Math.floor(rand(70, 110));
              for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const speed = rand(1.5, 7.5);
                fw.particles.push({
                  x: fw.x, y: fw.y,
                  vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                  life: 1, color: fw.color, size: rand(1.8, 4),
                });
              }
            }
          }
          return true;
        }

        fw.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.015;
          p.vx *= 0.98; p.vy *= 0.98;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.round(p.life * 255).toString(16).padStart(2, '0');
          ctx.shadowBlur = 6; ctx.shadowColor = p.color;
          ctx.fill(); ctx.shadowBlur = 0;
        });
        fw.particles = fw.particles.filter(p => p.life > 0);
        return fw.particles.length > 0;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [spawnFirework]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 20 }}
    />
  );
};

// ─── Countdown Card ──────────────────────────────────────────────────
const CountdownCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <motion.div
    key={value}
    initial={{ scale: 1.2, opacity: 0.7 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center"
    style={{
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(255,92,147,0.4)',
      borderRadius: 16, padding: '16px 20px',
      boxShadow: '0 4px 24px rgba(255,92,147,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
      minWidth: 72,
    }}
  >
    <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', textShadow: '0 0 20px rgba(255,117,151,0.8)', lineHeight: 1 }}>
      {String(value).padStart(2, '0')}
    </span>
    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,200,220,0.9)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>
      {label}
    </span>
  </motion.div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
export const BirthdayCelebration: React.FC = () => {
  const { content, settings } = useThemeContext();

  const birthdayDate: string = content?.birthdayDate || '';
  const birthdayName: string = (settings as any)?.birthdayPersonName || 'Em Yêu';

  // Timers and states
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isBirthday, setIsBirthday] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [petals] = useState(() => Array.from({ length: 22 }, (_, i) => i));

  // Cinematic sequence phases: 'idle' | 'zooming' | 'shaking' | 'gift-drop' | 'gift-untieing' | 'gift-opened' | 'flying-photos' | 'celebrating'
  const [cinematicPhase, setCinematicPhase] = useState<'idle' | 'zooming' | 'shaking' | 'gift-drop' | 'gift-untieing' | 'gift-opened' | 'flying-photos' | 'celebrating'>('idle');
  const [candleGlow, setCandleGlow] = useState(1);
  const [cakeAura, setCakeAura] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [flashScreen, setFlashScreen] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [soundVolumeBoost, setSoundVolumeBoost] = useState(false);

  // Photos State
  const [photos, setPhotos] = useState<FlyingPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<FlyingPhoto | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confettiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Compute circular photo positions around the cake ───────────────
  // PHOTO_W is the rendered photo width in px (keep in sync with style below)
  const PHOTO_W = 110;
  const PHOTO_H = Math.round(PHOTO_W * 0.75) + 29; // 4:3 image + caption bar

  const initFlyingPhotos = useCallback((source: { url?: string; image?: string; caption: string }[]) => {
    const numPhotos = source.length;
    if (numPhotos === 0) return;
    const items: FlyingPhoto[] = [];

    // KEY FIX: Spread photos in a much wider ellipse (RADIUS_X=320, RADIUS_Y=230) AROUND the cake.
    // This stops photos from overlapping or blocking the cake.
    const RADIUS_X = 320; 
    const RADIUS_Y = 230; 

    for (let i = 0; i < numPhotos; i++) {
      const angle = (i / numPhotos) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * RADIUS_X;
      const y = Math.sin(angle) * RADIUS_Y;
      const rawImg = (source[i] as any).url || (source[i] as any).image || '';
      const img = getUrl(rawImg); // Resolve absolute URL for backend paths

      items.push({
        id: i,
        image: img,
        caption: source[i].caption,
        targetX: x,
        targetY: y,
        targetRotate: rand(-20, 20),
        isLanded: false
      });
    }

    setPhotos(items);
  }, []);

  // ── Countdown Tick ──────────────────────────────────────────────
  useEffect(() => {
    if (!birthdayDate) return;
    const target = getNextBirthday(birthdayDate);

    const tick = () => {
      const now = Date.now();
      const diff = target.getTime() - now;
      if (diff <= 0) {
        setIsBirthday(true);
        setTimeLeft(null);
        startCinematicSequence();
      } else {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };

    tick();
    countdownIntervalRef.current = setInterval(tick, 1000);
    return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, [birthdayDate]);

  // ESC key to close photo zoom view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Cinematic Surprise Sequence ───────────────────────────────────
  const startCinematicSequence = useCallback(() => {
    if (cinematicPhase !== 'idle') return;

    // Reset photos — use CMS gallery if available, else fallback to defaults
    const cmsGallery = (content?.birthdayGallery || []).filter(g => g.url);
    const source = cmsGallery.length > 0
      ? cmsGallery
      : DEFAULT_GALLERY;
    initFlyingPhotos(source);

    // 0s: Zooming, Gold Flash, Aura active, volume boost
    setCinematicPhase('zooming');
    setFlashScreen(true);
    setTimeout(() => setFlashScreen(false), 800);
    setCakeAura(true);
    setSoundVolumeBoost(true);

    // 2s: Cake Shaking, Candles brightness increases
    setTimeout(() => {
      setCinematicPhase('shaking');
      setCandleGlow(2.2);
    }, 2000);

    // 3s: Magical Gift drops down above the cake
    setTimeout(() => {
      setCinematicPhase('gift-drop');
    }, 3000);

    // 4.5s: Box starts untieing ribbon
    setTimeout(() => {
      setCinematicPhase('gift-untieing');
    }, 4500);

    // 5s: Gift Box opens, flashes gold light, smoke, sparkles, initial confetti burst
    setTimeout(() => {
      setCinematicPhase('gift-opened');
      setFlashScreen(true);
      setTimeout(() => setFlashScreen(false), 600);
      setCameraShake(true);
      setTimeout(() => setCameraShake(false), 800);

      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#FFD700', '#FF5C93', '#00E5FF'] });
    }, 5000);

    // 6s: Photos start flying out of the box one by one
    setTimeout(() => {
      setCinematicPhase('flying-photos');
    }, 6000);

  }, [cinematicPhase, initFlyingPhotos]);

  // ── Launch ALL photos simultaneously when gift box opens ───────────
  useEffect(() => {
    if (cinematicPhase !== 'flying-photos') return;
    if (photos.length === 0) return;

    // Mark every photo as landed at once — framer-motion handles stagger via delay prop
    setPhotos(prev => prev.map(p => ({ ...p, isLanded: true })));

    // Big burst of confetti when box explodes with photos
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.45 }, colors: ['#FF5C93', '#FFD700', '#FFB6C1', '#00E5FF'] });
    setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors: ['#FF5C93', '#fff', '#FFD700'] }), 400);

    // After photos settle (~2s), start full celebration
    const t = setTimeout(() => {
      setCinematicPhase('celebrating');
      setCelebrate(true);
      setShowFireworks(true);
      triggerBackgroundCelebrationLoop();
    }, 2200);

    return () => clearTimeout(t);
  }, [cinematicPhase, photos.length]);

  // Loop final celebration background elements (balloons, hearts, sparkles)
  const triggerBackgroundCelebrationLoop = () => {
    const colors = ['#FF5C93', '#FFD700', '#FF69B4', '#FF4500', '#00E5FF'];
    confettiIntervalRef.current = setInterval(() => {
      confetti({ particleCount: 30, angle: 60, spread: 45, origin: { x: 0 }, colors });
      confetti({ particleCount: 30, angle: 120, spread: 45, origin: { x: 1 }, colors });
    }, 2000);

    // Spawn hearts
    setHearts(Array.from({ length: 45 }, (_, i) => ({
      id: i, x: rand(5, 95), y: rand(15, 85),
      size: rand(12, 28), delay: rand(0, 4), duration: rand(5, 9),
      color: ['#FF5C93', '#FF1493', '#FF7597', '#FFB6C1', '#fff'][Math.floor(rand(0, 5))],
      rotate: rand(-25, 25),
    })));

    // Spawn balloons
    setBalloons(Array.from({ length: 15 }, (_, i) => ({
      id: i, x: rand(5, 95),
      color: ['#FF5C93', '#FFD700', '#00E5FF', '#FF6B6B', '#A8E6CF', '#FF8C94'][Math.floor(rand(0, 6))],
      delay: rand(0, 5), scale: rand(0.9, 1.2), sway: rand(-15, 15),
    })));
  };

  const resetAll = () => {
    if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
    setCelebrate(false);
    setShowFireworks(false);
    setCinematicPhase('idle');
    setCandleGlow(1);
    setCakeAura(false);
    setPhotos([]);
  };

  return (
    <>
      {/* ── Keyframes & Styled Classes ────────────────────────────────── */}
      <style>{`
        @keyframes flicker { 0%{transform:scaleX(1) scaleY(1) rotate(-2deg)} 50%{transform:scaleX(0.8) scaleY(1.1) rotate(2deg)} 100%{transform:scaleX(1.1) scaleY(0.9) rotate(-1deg)} }
        @keyframes cakeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes cakeBounce { 0%,100%{transform:translateY(0) scale(1)} 30%{transform:translateY(-20px) scale(1.03)} 60%{transform:translateY(-8px) scale(1.01)} }
        @keyframes cakeShake { 0%,100%{transform:translate(0, 0) rotate(0deg)} 25%{transform:translate(-3px, 2px) rotate(-1deg)} 50%{transform:translate(3px, -2px) rotate(1deg)} 75%{transform:translate(-2px, -2px) rotate(0deg)} }
        @keyframes petalFall { 0%{transform:translateY(-20px) rotate(0deg) translateX(0);opacity:0.8} 100%{transform:translateY(110vh) rotate(720deg) translateX(40px);opacity:0} }
        @keyframes smokeUp { 0%{transform:translateX(-50%) scaleX(1);opacity:0.6} 100%{transform:translateX(-50%) scaleX(3) translateY(-20px);opacity:0} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes bgShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes bokeh { 0%,100%{transform:scale(1) translate(0,0);opacity:0.4} 50%{transform:scale(1.2) translate(8px,-12px);opacity:0.6} }
        @keyframes giftDrop { 0% { transform: translateY(-300px) scale(0.6); opacity: 0; } 60% { transform: translateY(20px) scale(1.05); } 80% { transform: translateY(-10px) scale(0.98); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes pulseBorder { 0%, 100% { border-color: rgba(255, 92, 147, 0.4); box-shadow: 0 0 10px rgba(255, 92, 147, 0.2); } 50% { border-color: rgba(255, 215, 0, 0.8); box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); } }
      `}</style>

      {/* ── Soft Golden Flash ─────────────────────────────── */}
      <AnimatePresence>
        {flashScreen && (
          <motion.div initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 bg-amber-100 z-[999] pointer-events-none" />
        )}
      </AnimatePresence>

      {/* ── Lightbox Zoom View ─────────────────────────────── */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white p-4 pb-10 rounded-lg shadow-2xl max-w-lg w-full relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                ✕
              </button>

              {/* Memory Image */}
              <div className="w-full aspect-[4/3] rounded-md overflow-hidden bg-rose-50 border border-rose-100">
                <img
                  src={selectedPhoto.image}
                  alt={selectedPhoto.caption}
                  className="w-full h-full object-cover select-none"
                />
              </div>

              {/* Caption */}
              <p className="text-center font-handwriting text-[#5C3A47] text-lg md:text-xl mt-4 px-2">
                {selectedPhoto.caption}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Background Floating Hearts & Balloons ─────────── */}
      <AnimatePresence>
        {celebrate && hearts.map(h => (
          <motion.div key={h.id} className="fixed pointer-events-none"
            style={{ left: `${h.x}%`, top: `${h.y}%`, zIndex: 50, fontSize: h.size, color: h.color, rotate: h.rotate }}
            initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 0.9, 0], y: -140 }}
            transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: 'easeOut' }}>
            ♥
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {celebrate && balloons.map(b => (
          <motion.div key={b.id} className="fixed pointer-events-none"
            style={{ left: `${b.x}%`, bottom: -80, zIndex: 40 }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -window.innerHeight * 1.3, opacity: [0, 1, 1, 0], x: [0, b.sway, -b.sway, 0] }}
            transition={{ duration: 11 + b.delay, delay: b.delay, ease: 'easeOut', repeat: Infinity }}>
            <div style={{
              width: 36 * b.scale, height: 46 * b.scale,
              background: `radial-gradient(circle at 35% 35%, ${b.color}CC, ${b.color})`,
              borderRadius: '50%',
              boxShadow: `inset -4px -4px 12px rgba(0,0,0,0.2), 0 0 8px ${b.color}88`,
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: '20%', left: '25%', width: '25%', height: '35%', background: 'rgba(255,255,255,0.45)', borderRadius: '50%', transform: 'rotate(-20deg)' }} />
            </div>
            <div style={{ width: 1, height: 50 * b.scale, background: 'rgba(255,255,255,0.5)', margin: '0 auto' }} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Main Canvas/Outer Container ─────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-3xl transition-transform duration-1000"
        style={{
          minHeight: 680,
          background: 'linear-gradient(135deg, #FF9ABF, #FFB6C1, #FF7597, #FFC0CB, #FFAFC7, #FF85A1)',
          backgroundSize: '300% 300%',
          animation: 'bgShift 8s ease infinite',
          boxShadow: '0 8px 40px rgba(255,92,147,0.35)',
          transform: (cinematicPhase === 'zooming' || cinematicPhase === 'shaking' || cinematicPhase === 'gift-drop' || cinematicPhase === 'gift-untieing' || cinematicPhase === 'gift-opened' || cinematicPhase === 'flying-photos') ? 'scale(1.08)' : 'scale(1)',
          transformOrigin: 'center center',
        }}
      >
        {/* Fireworks Layer */}
        <FireworksCanvas active={showFireworks} />

        {/* Bokeh Overlay */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: rand(70, 150), height: rand(70, 150),
            background: `radial-gradient(circle, rgba(255,255,255,${rand(0.12, 0.28)}) 0%, transparent 70%)`,
            top: `${rand(5, 80)}%`, left: `${rand(5, 85)}%`,
            animation: `bokeh ${rand(5, 10)}s ease-in-out infinite`,
            animationDelay: `${i * 0.9}s`,
            pointerEvents: 'none', zIndex: 1,
          }} />
        ))}

        {/* Floating petals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
          {petals.map(id => <FlowerPetal key={id} id={id} />)}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center py-12 px-4 w-full" style={{ minHeight: 680, animation: cameraShake ? 'cakeShake 0.4s ease-in-out infinite' : undefined }}>

          {/* Glowing Title Block */}
          <div className="text-center mb-8">
            <p className="text-white/80 font-bold uppercase tracking-wider text-xs mb-1">🎂 Happy Birthday 🎂</p>
            <h2 style={{
              fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 900,
              background: 'linear-gradient(90deg, #fff, #FFD6E7, #fff, #FFD700, #fff)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
              textShadow: '0 0 20px rgba(255,255,255,0.4)',
            }}>
              {isBirthday ? '🎉 Happy Birthday! 🎂' : `Đếm Ngược Sinh Nhật ${birthdayName}`}
            </h2>
          </div>

          {/* Countdown Card view */}
          {!isBirthday && timeLeft && (
            <div className="flex gap-3 flex-wrap justify-center mb-12">
              <CountdownCard value={timeLeft.days} label="Ngày" />
              <CountdownCard value={timeLeft.hours} label="Giờ" />
              <CountdownCard value={timeLeft.minutes} label="Phút" />
              <CountdownCard value={timeLeft.seconds} label="Giây" />
            </div>
          )}

          {/* ── Cake & Gift Center stage ──────────────────────────────── */}
          {/* overflow:visible so photos spread outside this box */}
          <div className="relative flex flex-col items-center justify-center my-10" style={{ minHeight: 420, width: '100%', maxWidth: 700, overflow: 'visible' }}>

            {/* Render flying polaroid photos */}
            {photos.map((photo) => {
              if (!photo.isLanded) return null;

              return (
                <motion.div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  // ANCHOR at center of stage: left:50% top:50% + negative margin
                  // Then framer-motion x/y offset spreads outward from center
                  initial={{ scale: 0, x: 0, y: 0, rotate: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    x: photo.targetX,
                    y: photo.targetY,
                    rotate: photo.targetRotate,
                    opacity: 1
                  }}
                  whileHover={{ scale: 1.22, zIndex: 60, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 13,
                    stiffness: 65,
                    delay: photo.id * 0.1,
                  }}
                  className="absolute cursor-zoom-in select-none"
                  style={{
                    // KEY FIX: anchor photo center at container center
                    // so that x/y offset spreads outward from the cake's position
                    left: '50%',
                    top: '50%',
                    marginLeft: -PHOTO_W / 2,
                    marginTop: -PHOTO_H / 2,
                    width: PHOTO_W,
                    zIndex: 30 + photo.id,
                    background: '#fff',
                    padding: '7px 7px 22px 7px',
                    borderRadius: 6,
                    boxShadow: '0 10px 30px rgba(255,92,147,0.25), 0 2px 8px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(255,182,193,0.4)',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      animation: photo.isLanded ? 'cakeFloat 4.5s ease-in-out infinite' : undefined,
                      animationDelay: `${photo.id * 0.55}s`,
                    }}
                  >
                    {/* Photo */}
                    <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#FFF0F5', borderRadius: 3 }}>
                      <img
                        src={photo.image}
                        alt={photo.caption}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', display: 'block' }}
                      />
                    </div>
                    {/* Caption */}
                    <div style={{ fontSize: 8, color: '#7C4060', fontWeight: 600, textAlign: 'center', marginTop: 5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      {photo.caption}
                    </div>
                    {/* Glass sheen */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.22), transparent)', borderRadius: '6px 6px 0 0', pointerEvents: 'none' }} />
                  </div>
                </motion.div>
              );
            })}


            {/* Central Stage Layer */}
            <div className="relative flex flex-col items-center">
              {/* Giant Drop Box (if state active) */}
              {(cinematicPhase === 'gift-drop' || cinematicPhase === 'gift-untieing' || cinematicPhase === 'gift-opened' || cinematicPhase === 'flying-photos') && (
                <div className="absolute z-40 top-[-60px]">
                  <GiantGiftBox
                    status={
                      cinematicPhase === 'gift-drop'
                        ? 'dropping'
                        : cinematicPhase === 'gift-untieing'
                          ? 'untieing'
                          : 'opened'
                    }
                  />
                </div>
              )}

              {/* Main Birthday Cake */}
              <BirthdayCake
                celebrate={celebrate}
                shake={cinematicPhase === 'shaking'}
                aura={cakeAura}
                glowIntensity={candleGlow}
              />
            </div>
          </div>

          {/* Title and cursive texts after photo gallery landed */}
          {(cinematicPhase === 'celebrating' || cinematicPhase === 'flying-photos') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center max-w-lg mx-auto mb-6"
            >
              <h3 style={{
                fontSize: 32,
                fontWeight: 'bold',
                fontFamily: 'serif',
                color: '#fff',
                textShadow: '0 0 15px rgba(255,255,255,0.6)',
                marginBottom: 6
              }}>
                Chúc mừng Sinh nhật của Bà chả hơmmm ❤️
              </h3>
              <p style={{
                fontSize: 18,
                fontFamily: 'cursive',
                color: '#FFE4E1',
                textShadow: '0 0 10px rgba(255,92,147,0.8)'
              }}>
                Happy Birthday, My Love
              </p>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <button
              onClick={startCinematicSequence}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              🎬 Bắt Đầu Lễ Kỷ Niệm
            </button>
            <button
              onClick={resetAll}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase transition-all border border-white/20 cursor-pointer"
            >
              🔄 Đặt Lại
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default BirthdayCelebration;
