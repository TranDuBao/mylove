import React, { useEffect, useCallback, useRef } from 'react';
import type { ScratchLayerConfig, BrushConfig } from '../../types/scratchcard.js';
import { useScratchEngine } from './hooks/useScratchEngine.js';

// ─── Preset Texture Generators ──────────────────────────────────────────

const PRESET_STYLES: Record<
  string,
  { bg: string; pattern?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }
> = {
  'pink-paper': {
    bg: 'linear-gradient(145deg, #FFD1DC 0%, #FFB6C1 50%, #FFC0CB 100%)',
    pattern: (ctx, w, h) => {
      // Paper grain noise
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 20;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
  'cloud-sticker': {
    bg: 'linear-gradient(135deg, #FFFFFF 0%, #F0F4FF 40%, #E8ECF8 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 6; i++) {
        const cx = w * (0.2 + Math.random() * 0.6);
        const cy = h * (0.3 + Math.random() * 0.4);
        const r = 30 + Math.random() * 50;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#B0C4DE';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  },
  'frosted-glass': {
    bg: 'linear-gradient(135deg, #ffffff 0%, #dce6f5 50%, #c8d7f0 100%)',
    pattern: (ctx, w, h) => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 12;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
  'washi-tape': {
    bg: 'linear-gradient(90deg, #FFF0F5 0%, #FFE4EC 25%, #FFF0F5 50%, #FFE4EC 75%, #FFF0F5 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.1;
      for (let y = 0; y < h; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + (Math.random() - 0.5) * 3);
        ctx.strokeStyle = '#FFB6C1';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  },
  'watercolor': {
    bg: 'linear-gradient(135deg, #FFE4F0 0%, #E8D5F5 30%, #D4E5FF 60%, #FFE8E0 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.15;
      const colors = ['#FFB6C1', '#DDA0DD', '#87CEEB', '#FFDAB9'];
      for (let i = 0; i < 8; i++) {
        const grd = ctx.createRadialGradient(
          Math.random() * w, Math.random() * h, 0,
          Math.random() * w, Math.random() * h, 60 + Math.random() * 80
        );
        const color = colors[Math.floor(Math.random() * colors.length)];
        grd.addColorStop(0, color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalAlpha = 1;
    },
  },
  'glitter': {
    bg: 'linear-gradient(135deg, #FFE4EC 0%, #FFD4E5 50%, #FFEEF5 100%)',
    pattern: (ctx, w, h) => {
      const sparkles = ['#FFD700', '#FFF8DC', '#FFFFFF', '#FFB6C1', '#E6E6FA'];
      for (let i = 0; i < 200; i++) {
        ctx.globalAlpha = 0.3 + Math.random() * 0.7;
        ctx.fillStyle = sparkles[Math.floor(Math.random() * sparkles.length)];
        const size = 1 + Math.random() * 2.5;
        ctx.fillRect(Math.random() * w, Math.random() * h, size, size);
      }
      ctx.globalAlpha = 1;
    },
  },
  'metallic-foil': {
    bg: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 20%, #A8A8A8 40%, #D0D0D0 60%, #B8B8B8 80%, #E0E0E0 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.06;
      for (let y = 0; y < h; y += 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = y % 4 === 0 ? '#FFFFFF' : '#808080';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  },
  'golden-paper': {
    bg: 'linear-gradient(135deg, #FFD700 0%, #FFC125 25%, #FFB90F 50%, #DAA520 75%, #FFD700 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#FFF8DC' : '#B8860B';
        ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
      ctx.globalAlpha = 1;
    },
  },
  'heart-sticker': {
    bg: 'linear-gradient(145deg, #FF69B4 0%, #FF1493 50%, #FF69B4 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.12;
      ctx.font = '20px serif';
      for (let i = 0; i < 15; i++) {
        ctx.fillText('♥', Math.random() * w, Math.random() * h);
      }
      ctx.globalAlpha = 1;
    },
  },
  'gift-wrap': {
    bg: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      // Horizontal ribbon
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      // Vertical ribbon
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      // Bow
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  },
  'pastel-paint': {
    bg: 'linear-gradient(135deg, #FFDEE2 0%, #E0BBE4 25%, #BDE0FE 50%, #FFDEE2 75%, #D4F0C0 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * w, Math.random() * h);
        ctx.quadraticCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h);
        ctx.strokeStyle = ['#FFB6C1', '#DDA0DD', '#87CEEB', '#98FB98'][i % 4];
        ctx.lineWidth = 3 + Math.random() * 5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  },
  'magic-dust': {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    pattern: (ctx, w, h) => {
      const starColors = ['#FFD700', '#FFFFFF', '#E6E6FA', '#FF69B4', '#87CEEB'];
      for (let i = 0; i < 150; i++) {
        ctx.globalAlpha = 0.3 + Math.random() * 0.7;
        ctx.fillStyle = starColors[Math.floor(Math.random() * starColors.length)];
        const size = 0.5 + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  },
  'sakura-petals': {
    bg: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E4 100%)',
    pattern: (ctx, w, h) => {
      ctx.globalAlpha = 0.2;
      ctx.font = '16px serif';
      const petals = ['🌸', '🩷', '✿'];
      for (let i = 0; i < 20; i++) {
        ctx.save();
        ctx.translate(Math.random() * w, Math.random() * h);
        ctx.rotate(Math.random() * Math.PI * 2);
        ctx.fillText(petals[i % petals.length], 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
  },
  'silver-scratch': {
    bg: 'linear-gradient(135deg, #C0C0C0 0%, #D8D8D8 30%, #A9A9A9 60%, #C8C8C8 100%)',
    pattern: (ctx, w, h) => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);
    },
  },
};

// Parse CSS linear-gradient string and fill canvas
function fillGradient(ctx: CanvasRenderingContext2D, w: number, h: number, gradientStr: string, _color?: string) {
  // Extract color stops from gradient string
  const stops = gradientStr.match(/(#[A-Fa-f0-9]{6}|rgba?\([^)]+\))\s+(\d+)%/g);
  if (!stops || stops.length < 2) {
    ctx.fillStyle = _color || '#FFB6C1';
    ctx.fillRect(0, 0, w, h);
    return;
  }

  const grad = ctx.createLinearGradient(0, 0, w, h);
  for (const stop of stops) {
    const match = stop.match(/(#[A-Fa-f0-9]{6}|rgba?\([^)]+\))\s+(\d+)%/);
    if (match) {
      grad.addColorStop(parseFloat(match[2]) / 100, match[1]);
    }
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ─── Main Component ─────────────────────────────────────────────────────

interface ScratchCanvasProps {
  width: number;
  height: number;
  layer: ScratchLayerConfig;
  brush: BrushConfig;
  onPercentageChange: (pct: number) => void;
  onRevealed: () => void;
  revealPercentage: number;
  autoReveal: boolean;
  isRevealed: boolean;
  className?: string;
}

const ScratchCanvas: React.FC<ScratchCanvasProps> = ({
  width,
  height,
  layer,
  brush,
  onPercentageChange,
  onRevealed,
  revealPercentage,
  autoReveal,
  isRevealed,
  className = '',
}) => {
  const autoRevealFiredRef = useRef(false);

  const handlePercentageChange = useCallback(
    (pct: number) => {
      onPercentageChange(pct);
      if (autoReveal && pct >= revealPercentage && !autoRevealFiredRef.current) {
        autoRevealFiredRef.current = true;
        onRevealed();
      }
    },
    [onPercentageChange, autoReveal, revealPercentage, onRevealed]
  );

  const engine = useScratchEngine({
    width,
    height,
    brush,
    onPercentageChange: handlePercentageChange,
  });

  // Initialize canvas with texture
  useEffect(() => {
    engine.initCanvas((ctx) => {
      const preset = PRESET_STYLES[layer.preset];
      if (layer.preset === 'custom' && layer.customImageUrl) {
        // Load custom image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          ctx.globalAlpha = layer.opacity;
        };
        img.src = layer.customImageUrl;
        // Fallback fill while loading
        ctx.fillStyle = layer.color || '#FFB6C1';
        ctx.fillRect(0, 0, width, height);
      } else if (preset) {
        fillGradient(ctx, width, height, preset.bg, layer.color);
        if (preset.pattern) {
          preset.pattern(ctx, width, height);
        }
      } else {
        ctx.fillStyle = layer.color || '#FFB6C1';
        ctx.fillRect(0, 0, width, height);
      }

      // Apply opacity
      if (layer.opacity < 1) {
        ctx.globalAlpha = layer.opacity;
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = width;
        tmpCanvas.height = height;
        const tmpCtx = tmpCanvas.getContext('2d');
        if (tmpCtx) {
          tmpCtx.drawImage(ctx.canvas, 0, 0);
          ctx.clearRect(0, 0, width, height);
          ctx.globalAlpha = layer.opacity;
          ctx.drawImage(tmpCanvas, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
    });
    autoRevealFiredRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer.preset, layer.color, layer.opacity, width, height]);

  return (
    <canvas
      ref={engine.canvasRef}
      width={width}
      height={height}
      className={`sc-canvas ${isRevealed ? 'sc-canvas--revealed' : ''} ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: isRevealed ? 'default' : 'grab',
        zIndex: 2,
      }}
    />
  );
};

export default ScratchCanvas;
