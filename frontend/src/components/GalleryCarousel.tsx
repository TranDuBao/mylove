import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PhotoProvider } from 'react-photo-view';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { api } from '../utils/api.js';
import type { Photo } from '../types/index.js';
import { 
  Heart, Calendar, MapPin, Download, Share2, ChevronLeft, ChevronRight, X, Sparkles, Loader2, ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext.js';
import canvasConfetti from 'canvas-confetti';

// --- CUSTOM INLINE CSS STYLES ---
const customStyles = `
  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(253, 244, 245, 0.3);
    border-radius: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #F9A8D4, #FF7597);
    border-radius: 8px;
    box-shadow: 0 0 6px rgba(255, 117, 151, 0.4);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #FF7597;
    box-shadow: 0 0 10px rgba(255, 117, 151, 0.8);
  }

  /* Shimmer Loading Animation */
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer-placeholder {
    background: linear-gradient(90deg, rgba(251,207,232,0.2) 25%, rgba(252,231,243,0.4) 50%, rgba(251,207,232,0.2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }

  /* Sheen sweep animation */
  @keyframes sweep {
    0% { left: -100%; }
    100% { left: 200%; }
  }
  .sheen-sweep {
    position: absolute;
    top: 0;
    width: 80%;
    height: 100%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
    transform: skewX(-25deg);
    animation: sweep 2s infinite ease-in-out;
  }

  /* Aurora Gradient Background */
  @keyframes aurora {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .aurora-gallery-bg {
    background: linear-gradient(-45deg, rgba(252,231,243,0.2) 0%, rgba(253,244,245,0.35) 25%, rgba(232,225,255,0.15) 50%, rgba(252,231,243,0.2) 100%);
    background-size: 400% 400%;
    animation: aurora 15s ease infinite;
  }
`;

// --- INTERACTIVE AMBIENT CANVAS BACKGROUND ---
const AmbientCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Particle Classes
    class SakuraPetal {
      x = Math.random() * width;
      y = Math.random() * height - height;
      r = Math.random() * 8 + 4; // size
      d = Math.random() * 40 + 10;
      speed = Math.random() * 1.0 + 0.5;
      angle = Math.random() * 20;
      rotate = Math.random() * 360;
      rotateSpeed = Math.random() * 1.0 - 0.5;

      update() {
        this.y += this.speed;
        this.x += Math.sin(this.angle * 0.04) * 0.4;
        this.angle += 0.3;
        this.rotate += this.rotateSpeed;

        if (this.y > height) {
          this.y = -20;
          this.x = Math.random() * width;
          this.speed = Math.random() * 1.0 + 0.5;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate((this.rotate * Math.PI) / 180);
        c.beginPath();
        c.ellipse(0, 0, this.r, this.r / 1.7, 0, 0, 2 * Math.PI);
        c.fillStyle = 'rgba(251, 107, 182, 0.25)'; // Pink Sakura shade
        c.fill();
        c.strokeStyle = 'rgba(249, 168, 212, 0.1)';
        c.stroke();
        c.restore();
      }
    }

    class Bubble {
      x = Math.random() * width;
      y = Math.random() * height + height;
      r = Math.random() * 12 + 4;
      speed = Math.random() * 0.4 + 0.2;
      alpha = Math.random() * 0.25 + 0.1;

      update() {
        this.y -= this.speed;
        this.x += Math.sin(this.y * 0.015) * 0.15;
        if (this.y < -20) {
          this.y = height + 20;
          this.x = Math.random() * width;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        c.fillStyle = `rgba(252, 231, 243, ${this.alpha})`;
        c.fill();
        c.strokeStyle = `rgba(251, 207, 232, ${this.alpha * 1.2})`;
        c.stroke();
      }
    }

    class Butterfly {
      x = Math.random() * width;
      y = Math.random() * height;
      size = Math.random() * 5 + 3.5;
      vx = Math.random() * 0.6 - 0.3;
      vy = Math.random() * 0.4 - 0.2;
      wingPhase = Math.random() * 10;
      wingSpeed = Math.random() * 0.12 + 0.08;
      color = ['rgba(249,168,212,0.3)', 'rgba(251,207,232,0.25)', 'rgba(255,182,193,0.35)'][Math.floor(Math.random() * 3)];

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.wingPhase += this.wingSpeed;

        if (Math.random() < 0.01) this.vx = Math.random() * 0.6 - 0.3;
        if (Math.random() < 0.01) this.vy = Math.random() * 0.4 - 0.2;

        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        const wingScale = Math.sin(this.wingPhase);

        c.beginPath();
        c.ellipse(-this.size, 0, this.size, this.size * 1.5 * Math.abs(wingScale), Math.PI / 4, 0, 2 * Math.PI);
        c.ellipse(this.size, 0, this.size, this.size * 1.5 * Math.abs(wingScale), -Math.PI / 4, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
      }
    }

    const petals: SakuraPetal[] = Array.from({ length: 20 }, () => new SakuraPetal());
    const bubbles: Bubble[] = Array.from({ length: 12 }, () => new Bubble());
    const butterflies: Butterfly[] = Array.from({ length: 4 }, () => new Butterfly());

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      bubbles.forEach((b) => {
        b.update();
        b.draw(ctx);
      });
      petals.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      butterflies.forEach((bf) => {
        bf.update();
        bf.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80" />;
};

// --- INTERACTIVE TILT PHOTO CARD COMPONENT ---
interface PhotoCardProps {
  photo: Photo;
  index: number;
  getFullUrl: (url: string) => string;
  onCardClick: () => void;
  onFavoriteToggle: (e: React.MouseEvent, photoId: string, currentFav: boolean) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ 
  photo, index, getFullUrl, onCardClick, onFavoriteToggle 
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth 3D tilt calculation
    const rotateX = -(y / (rect.height / 2)) * 7; // Max tilt: 7 degrees
    const rotateY = (x / (rect.width / 2)) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Clicking Ripple Trigger
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    onCardClick();
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className="relative rounded-[22px] overflow-hidden glassmorphism border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-zoom-in group select-none aspect-square"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      animate={{
        y: [0, -10, 0],
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{
        y: {
          duration: 5 + (index % 3) * 1.5, // 5s, 6.5s, 8s
          repeat: Infinity,
          ease: 'easeInOut',
          delay: (index % 4) * 0.4,
        },
        rotateX: { type: 'spring', stiffness: 300, damping: 20 },
        rotateY: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      whileHover={{
        scale: 1.04,
        boxShadow: '0 20px 40px rgba(255, 117, 151, 0.2)',
        borderColor: 'rgba(255, 117, 151, 0.45)',
        zIndex: 10,
      }}
    >
      {/* Animated pink light sheen sweep effect on hover */}
      <div className="sheen-sweep opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Clicking ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ping z-20"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}

      {/* Shimmer Image Placeholder */}
      {!isLoaded && <div className="absolute inset-0 w-full h-full shimmer-placeholder" />}

      {/* Image body */}
      <img
        src={getFullUrl(photo.url)}
        alt={photo.description}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-750 ease-out group-hover:scale-[1.06] ${
          isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
        }`}
        loading="lazy"
      />

      {/* Favorite badge in top corner */}
      {photo.isFavorite && (
        <button
          onClick={(e) => onFavoriteToggle(e, photo._id, true)}
          className="absolute top-3 right-3 p-2 bg-white/70 backdrop-blur-md hover:bg-white text-rose-500 rounded-full shadow-md z-20 scale-95 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Heart size={14} className="fill-rose-500 text-rose-500" />
        </button>
      )}

      {/* IMMERSIVE HOVER OVERLAY DISPLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-5 select-none z-10">
        
        {/* Category Pill Tag */}
        <div className="mb-2">
          <span className="px-2.5 py-1 bg-primary/25 text-primary border border-primary/30 rounded-full text-[10px] uppercase font-bold tracking-widest backdrop-blur-sm">
            {photo.category || 'General'}
          </span>
        </div>

        {/* Date and Location pills */}
        <div className="flex gap-2 flex-wrap mb-2 text-[10px] text-white/90">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-md font-mono">
            <Calendar size={10} />
            {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : 'Anniversary'}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-md">
            <MapPin size={10} />
            {photo.category === 'birthday-gallery' ? 'Birthday Event' : 'Love Story'}
          </span>
        </div>

        {/* Caption */}
        <p className="text-white text-sm font-handwriting leading-relaxed line-clamp-2">
          {photo.description || 'Happy memory together... ❤️'}
        </p>

        {/* Action Trigger Overlays */}
        {!photo.isFavorite && (
          <button
            onClick={(e) => onFavoriteToggle(e, photo._id, false)}
            className="absolute bottom-4 right-4 p-2 bg-white/20 hover:bg-primary text-white rounded-full backdrop-blur-md shadow-md scale-0 group-hover:scale-100 transition-all duration-300 cursor-pointer"
          >
            <Heart size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// --- MEMORY TIMELINE CARD COMPONENT ---
interface MilestoneCardProps {
  index: number;
  title: string;
  icon: string;
  date: string;
  desc: string;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ 
  index, title, icon, date, desc 
}) => {
  return (
    <motion.div
      className="p-5 rounded-[22px] border border-white/20 glassmorphism shadow-md flex flex-col justify-between text-left select-none relative overflow-hidden group aspect-square"
      animate={{
        y: [0, -10, 0]
      }}
      transition={{
        duration: 5.5 + (index % 2) * 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.2
      }}
      whileHover={{
        scale: 1.03,
        boxShadow: '0 15px 30px rgba(249, 168, 212, 0.15)',
        borderColor: 'rgba(249, 168, 212, 0.35)'
      }}
    >
      {/* Background Soft Glow Circular blobs */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

      <div>
        {/* Icon Container */}
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-2xl shadow-inner mb-4 animate-[bounce_3s_infinite]">
          {icon}
        </div>
        
        {/* Title */}
        <h4 className="text-text font-bold text-base tracking-wide flex items-center gap-1.5 mb-1">
          {title}
        </h4>
        
        {/* Date */}
        <span className="text-[10px] text-primary/75 font-mono font-semibold flex items-center gap-1 mb-3">
          <Calendar size={10} />
          {date}
        </span>

        {/* Description */}
        <p className="text-text/70 text-xs font-handwriting leading-relaxed">
          {desc}
        </p>
      </div>

      {/* Actionable swipe indicators */}
      <div className="mt-5 pt-3 border-t border-primary/10 flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-primary/60">
        <span>Story Milestone</span>
        <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};

// --- CUSTOM IMMERSIVE LIGHTBOX COMPONENT ---
export interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFavoriteToggle: (e: React.MouseEvent, photoId: string, currentFav: boolean) => void;
  getFullUrl: (url: string) => string;
  showAlert: (msg: string, type?: 'success'|'error') => void;
}

export const CustomLightbox: React.FC<LightboxProps> = ({
  photos, currentIndex, onClose, onPrev, onNext, onFavoriteToggle, getFullUrl, showAlert
}) => {
  const photo = photos[currentIndex];
  const [zoomScale, setZoomScale] = useState(1);
  const touchStartX = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') { onPrev(); setZoomScale(1); }
      if (e.key === 'ArrowRight') { onNext(); setZoomScale(1); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      onNext();
      setZoomScale(1);
    } else if (diff < -50) {
      onPrev();
      setZoomScale(1);
    }
  };

  const handleDownload = async () => {
    try {
      const src = getFullUrl(photo.url);
      const res = await fetch(src);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `love-story-${photo._id}.jpg`;
      a.click();
      showAlert('Tải ảnh xuống thành công! 💾');
    } catch {
      showAlert('Không thể tải ảnh. Hãy nhấp chuột phải để lưu!', 'error');
    }
  };

  const handleShare = () => {
    const shareUrl = getFullUrl(photo.url);
    navigator.clipboard.writeText(shareUrl);
    showAlert('Đã sao chép link ảnh vào bộ nhớ tạm! 💌');
  };

  if (!photo) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-4 md:p-6 backdrop-blur-2xl bg-black/85 select-none"
    >
      {/* 1. Header Toolbar */}
      <div className="w-full flex justify-between items-center z-55 max-w-7xl">
        <div className="text-white/60 text-xs font-mono">
          {currentIndex + 1} / {photos.length}
        </div>
        {/* Floating Glass Toolbar */}
        <div className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl">
          <button 
            onClick={handleDownload}
            className="p-2 text-white hover:text-primary transition-colors cursor-pointer"
            title="Download Photo"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={handleShare}
            className="p-2 text-white hover:text-primary transition-colors cursor-pointer"
            title="Copy Share Link"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={(e) => onFavoriteToggle(e, photo._id, photo.isFavorite)}
            className={`p-2 text-white hover:text-rose-500 transition-colors cursor-pointer ${
              photo.isFavorite ? 'text-rose-500' : ''
            }`}
            title="Toggle Favorite"
          >
            <Heart size={16} className={photo.isFavorite ? 'fill-rose-500' : ''} />
          </button>
          <div className="w-[1px] h-4 bg-white/20 mx-1" />
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close Lightbox"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. Primary Image Viewport */}
      <div 
        className="flex-grow w-full max-w-5xl flex items-center justify-between relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button 
          onClick={() => { onPrev(); setZoomScale(1); }}
          className="absolute left-0 md:-left-16 z-55 p-3.5 bg-white/5 hover:bg-white/15 text-white/80 rounded-full transition-all border border-white/5 cursor-pointer hidden sm:flex"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="w-full h-[65vh] flex items-center justify-center overflow-hidden relative">
          <motion.img
            key={photo._id}
            src={getFullUrl(photo.url)}
            alt={photo.description}
            initial={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: zoomScale, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={() => setZoomScale(prev => prev === 1 ? 1.4 : 1)}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-zoom-in"
          />
        </div>

        <button 
          onClick={() => { onNext(); setZoomScale(1); }}
          className="absolute right-0 md:-right-16 z-55 p-3.5 bg-white/5 hover:bg-white/15 text-white/80 rounded-full transition-all border border-white/5 cursor-pointer hidden sm:flex"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 3. Bottom Information Panel */}
      <div className="w-full text-center max-w-3xl pb-6 z-55">
        {photo.category && (
          <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {photo.category}
          </span>
        )}
        <h4 className="text-white text-base font-handwriting mt-3 max-w-2xl mx-auto leading-relaxed px-4">
          {photo.description || 'Captured moments of our lovely story... ❤️'}
        </h4>
        {photo.createdAt && (
          <div className="text-[10px] text-white/40 mt-1 font-mono">
            {new Date(photo.createdAt).toLocaleString()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const getMilestoneIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('gặp') || t.includes('meet') || t.includes('thấy') || t.includes('quen')) return '🌸';
  if (t.includes('date') || t.includes('hẹn') || t.includes('yêu') || t.includes('tỏ tình')) return '☕';
  if (t.includes('sinh nhật') || t.includes('birthday') || t.includes('tuổi')) return '🎂';
  if (t.includes('noel') || t.includes('giáng sinh') || t.includes('christmas')) return '🎄';
  if (t.includes('năm mới') || t.includes('tết') || t.includes('new year')) return '🎆';
  if (t.includes('chơi') || t.includes('du lịch') || t.includes('trip') || t.includes('bay')) return '✈️';
  if (t.includes('phim') || t.includes('movie')) return '🎬';
  return '💖'; // Default sweet heart
};

// --- PRIMARY COMPONENT WITH CURSOR GLOW AND HEART TRAIL ---
export const GalleryCarousel: React.FC = () => {
  const { theme } = useThemeContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Custom alerts configuration
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showAlert = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // State definitions
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Mouse Glow & Trail Hearts state
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [trailHearts, setTrailHearts] = useState<Array<{ id: number; x: number; y: number; size: number; rot: number }>>([]);
  const lastTrailTime = useRef(0);

  // Parallax Scroll logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0px", "-40px"]);

  // Mouse move inside gallery container
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Smooth cursor follow
    setCursorPos({ x: e.clientX, y: e.clientY });

    // Spawn trailing heart particles (throttled to once every 80ms)
    const now = Date.now();
    if (now - lastTrailTime.current > 80) {
      const newHeart = {
        id: now,
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 8),
        size: Math.random() * 12 + 6,
        rot: Math.random() * 45 - 22.5
      };
      setTrailHearts(prev => [...prev.slice(-15), newHeart]); // Keep last 15 hearts
      lastTrailTime.current = now;
    }
  };

  // Periodically decay trail hearts
  useEffect(() => {
    const interval = setInterval(() => {
      setTrailHearts(prev => prev.filter(h => Date.now() - h.id < 800));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Timeline events from database state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Fetch albums and timeline data
  const fetchData = async () => {
    try {
      // Fetch photos
      const photoList = await api.getPhotos();
      setPhotos(photoList);

      // Extract unique categories
      const cats = new Set<string>();
      photoList.forEach(p => {
        if (p.category) cats.add(p.category);
      });
      setCategories(['All', ...Array.from(cats)]);

      // Fetch timeline events
      const timelineList = await api.getTimelineEvents();
      const sortedTimeline = timelineList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTimelineEvents(sortedTimeline);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to format local URLs
  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL as string)?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Toggle Favorite
  const handleFavoriteToggle = async (e: React.MouseEvent, photoId: string, currentFav: boolean) => {
    e.stopPropagation();
    try {
      await api.updatePhoto(photoId, { isFavorite: !currentFav });
      
      setPhotos(prev => prev.map(p => p._id === photoId ? { ...p, isFavorite: !currentFav } : p));
      
      if (!currentFav) {
        canvasConfetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF7597', '#FF3366', '#FF99AA']
        });
        canvasConfetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF7597', '#FF3366', '#FF99AA']
        });
        showAlert('Đã lưu bài viết vào mục yêu thích! 💖');
      } else {
        showAlert('Đã bỏ yêu thích. 💔', 'info');
      }
    } catch {
      showAlert('Không thể cập nhật trạng thái yêu thích.', 'error');
    }
  };

  // Filter items
  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const isPublic = !p.isSecret;
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesFavorite = !favoritesOnly || p.isFavorite;
      return isPublic && matchesCategory && matchesFavorite;
    });
  }, [photos, activeCategory, favoritesOnly]);

  // Insert Milestones into Photo Grid organically (e.g. index % 3 === 0)
  const gridItems = useMemo(() => {
    const items: Array<{ type: 'photo'; data: Photo } | { type: 'milestone'; data: TimelineEvent }> = [];
    let milestoneIndex = 0;
    
    filteredPhotos.forEach((photo, idx) => {
      items.push({ type: 'photo', data: photo });
      if ((idx + 1) % 3 === 0 && milestoneIndex < timelineEvents.length) {
        items.push({ type: 'milestone', data: timelineEvents[milestoneIndex] });
        milestoneIndex++;
      }
    });

    while (items.length < 5 && milestoneIndex < timelineEvents.length) {
      items.push({ type: 'milestone', data: timelineEvents[milestoneIndex] });
      milestoneIndex++;
    }

    return items;
  }, [filteredPhotos, timelineEvents]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide mb-2 uppercase text-center text-glow">
          Our Memories
        </h2>
        <div className="glassmorphism p-8 rounded-xl max-w-md w-full text-center mt-6 border border-white/20">
          <ImageIcon size={40} className="text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-secondary text-sm">No photos uploaded yet. Open the CMS to create your album! 📸</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-20 px-4 max-w-7xl mx-auto w-full relative min-h-[600px] overflow-hidden custom-scrollbar aurora-gallery-bg rounded-[32px] my-10 border border-white/15 shadow-2xl"
    >
      {/* Inject custom inline styles */}
      <style>{customStyles}</style>

      {/* Floating interactive background canvas */}
      <AmbientCanvas />

      {/* Soft Glowing Cursor (Hidden on touch screens) */}
      <div 
        className="fixed pointer-events-none w-10 h-10 rounded-full border border-primary/30 bg-primary/5 blur-[2px] z-50 transition-transform duration-100 ease-out hidden lg:block"
        style={{ left: cursorPos.x - 20, top: cursorPos.y - 20 }}
      />

      {/* Trailing Heart particles */}
      {trailHearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ opacity: 0.8, y: heart.y, scale: 1 }}
          animate={{ opacity: 0, y: heart.y - 60, scale: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute text-primary pointer-events-none z-20"
          style={{
            left: heart.x - heart.size / 2,
            fontSize: `${heart.size}px`,
            transform: `rotate(${heart.rot}deg)`,
          }}
        >
          ❤️
        </motion.div>
      ))}

      {/* Header Info (Parallax moving) */}
      <motion.div style={{ y: titleY }} className="relative z-10 text-center mb-12 select-none">
        <h2 className="text-text text-3xl md:text-5xl font-bold tracking-wide text-glow mb-3 uppercase">
          Our Love Gallery
        </h2>
        <p className="text-primary text-sm md:text-lg font-handwriting text-glow-gold">
          Scroll through the sweet pages of our polaroid book
        </p>
      </motion.div>

      {/* Category Pill Filters Tab & Favorites Checkbox */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-primary/10 pb-6">
        
        {/* Left: glassy pill selection */}
        <div className="flex gap-3 flex-wrap justify-center bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20 shadow-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(255,117,151,0.4)]'
                  : 'text-text hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: Toggle Favorites Only */}
        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border transform hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
            favoritesOnly
              ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white border-none shadow-[0_4px_15px_rgba(244,63,94,0.4)]'
              : 'bg-white/10 backdrop-blur-md border-white/20 text-text hover:bg-white/20'
          }`}
        >
          <Heart size={12} className={favoritesOnly ? 'fill-white' : ''} />
          Favorites Only
        </button>
      </div>

      {/* Horizontal rows grid container */}
      <div className="relative z-10 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gridItems.map((item, index) => {
            if (item.type === 'photo') {
              const photoIndex = filteredPhotos.findIndex(p => p._id === item.data._id);
              return (
                <PhotoCard
                  key={item.data._id}
                  photo={item.data}
                  index={index}
                  getFullUrl={getFullUrl}
                  onCardClick={() => setLightboxIndex(photoIndex)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              );
            } else {
              return (
                <MilestoneCard
                  key={`milestone-${index}`}
                  index={index}
                  title={item.data.title}
                  icon={getMilestoneIcon(item.data.title)}
                  date={item.data.date}
                  desc={item.data.description}
                />
              );
            }
          })}
        </div>

        {/* Empty matching filters fallback */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-20 text-secondary text-sm glassmorphism max-w-md mx-auto rounded-xl border border-white/10 select-none">
            No memories matched the selected search filters. ✨
          </div>
        )}
      </div>

      {/* custom immersive Lightbox Modal render */}
      <AnimatePresence>
        {lightboxIndex !== null && createPortal(
          <CustomLightbox
            photos={filteredPhotos}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1))}
            onNext={() => setLightboxIndex(prev => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0))}
            onFavoriteToggle={handleFavoriteToggle}
            getFullUrl={getFullUrl}
            showAlert={showAlert}
          />,
          document.body
        )}
      </AnimatePresence>

      {/* Notification banner */}
      <AnimatePresence>
        {alert && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3.5 rounded-2xl shadow-xl backdrop-blur-md border text-sm font-semibold tracking-wide flex items-center gap-2 select-none ${
              alert.type === 'error' 
                ? 'bg-red-500/90 text-white border-red-400' 
                : alert.type === 'info'
                ? 'bg-rose-100/90 text-rose-700 border-rose-200'
                : 'bg-white/90 text-primary border-primary/20'
            }`}
          >
            <Sparkles size={16} className="text-primary fill-primary animate-pulse" />
            {alert.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GalleryCarousel;
