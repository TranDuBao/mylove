import { useRef, useCallback, useState, useEffect } from 'react';
import type { BrushConfig } from '../../../types/scratchcard.js';

interface Point {
  x: number;
  y: number;
  time: number;
}

interface UseScratchEngineOptions {
  width: number;
  height: number;
  brush: BrushConfig;
  onPercentageChange?: (pct: number) => void;
}

/**
 * Canvas scratch engine hook.
 * Uses OffscreenCanvas (or fallback) with destination-out compositing
 * and Catmull-Rom spline interpolation for smooth strokes.
 */
export function useScratchEngine(options: UseScratchEngineOptions) {
  const { width, height, brush, onPercentageChange } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const rafRef = useRef<number>(0);
  const lastCalcRef = useRef(0);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Create soft circular brush as radial gradient
  const createBrushGradient = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      const radius = brush.size;
      const innerRadius = radius * brush.hardness;
      const grad = ctx.createRadialGradient(x, y, innerRadius, x, y, radius);
      grad.addColorStop(0, `rgba(0,0,0,${brush.opacity})`);
      grad.addColorStop(1 - brush.feather, `rgba(0,0,0,${brush.opacity * 0.5})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      return grad;
    },
    [brush.size, brush.hardness, brush.feather, brush.opacity]
  );

  // Draw a soft circle at position
  const drawBrush = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = createBrushGradient(ctx, x, y);
      ctx.beginPath();
      ctx.arc(x, y, brush.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    [createBrushGradient, brush.size]
  );

  // Catmull-Rom spline interpolation for smooth curves
  const catmullRom = useCallback(
    (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
      const t2 = t * t;
      const t3 = t2 * t;
      return {
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        time: p1.time + (p2.time - p1.time) * t,
      };
    },
    []
  );

  // Draw interpolated stroke between points
  const drawStroke = useCallback(
    (ctx: CanvasRenderingContext2D, points: Point[]) => {
      if (points.length < 2) {
        if (points.length === 1) drawBrush(ctx, points[0].x, points[0].y);
        return;
      }

      const smoothing = Math.max(0.1, brush.smoothing);
      const steps = Math.max(2, Math.ceil(8 * smoothing));

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[Math.min(points.length - 1, i + 1)];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const pt = catmullRom(p0, p1, p2, p3, t);
          drawBrush(ctx, pt.x, pt.y);
        }
      }
      // Draw final point
      const last = points[points.length - 1];
      drawBrush(ctx, last.x, last.y);
    },
    [drawBrush, catmullRom, brush.smoothing]
  );

  // Calculate scratch percentage by sampling pixel data
  const calculatePercentage = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return 0;

    const now = performance.now();
    if (now - lastCalcRef.current < 200) return scratchPercentage; // Throttle to 5 Hz
    lastCalcRef.current = now;

    // Sample a grid of pixels rather than reading all for performance
    const sampleSize = 40; // 40x40 grid
    const stepX = width / sampleSize;
    const stepY = height / sampleSize;
    let transparent = 0;
    const total = sampleSize * sampleSize;

    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let sy = 0; sy < sampleSize; sy++) {
        for (let sx = 0; sx < sampleSize; sx++) {
          const px = Math.floor(sx * stepX);
          const py = Math.floor(sy * stepY);
          const idx = (py * width + px) * 4;
          // Check alpha channel — if mostly transparent, it's been scratched
          if (data[idx + 3] < 128) {
            transparent++;
          }
        }
      }
    } catch {
      return scratchPercentage;
    }

    const pct = Math.round((transparent / total) * 100);
    return pct;
  }, [width, height, scratchPercentage]);

  // Get canvas-relative coordinates from pointer event
  const getCoords = useCallback(
    (e: PointerEvent | React.PointerEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, time: performance.now() };
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        time: performance.now(),
      };
    },
    [width, height]
  );

  // ─── Pointer Event Handlers ────────────────────────────────────

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (isRevealed) return;
      e.preventDefault();

      isDrawingRef.current = true;
      setIsScratching(true);
      const pt = getCoords(e);
      pointsRef.current = [pt];

      const canvas = canvasRef.current;
      if (canvas) {
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (err) {
          console.warn('[ScratchEngine] Failed to set pointer capture:', err);
        }
      }

      const ctx = ctxRef.current;
      if (ctx) drawBrush(ctx, pt.x, pt.y);
    },
    [getCoords, drawBrush, isRevealed]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current || isRevealed) return;
      e.preventDefault();

      const pt = getCoords(e);
      const points = pointsRef.current;
      points.push(pt);

      // Keep last 6 points for smooth interpolation
      if (points.length > 6) points.splice(0, points.length - 6);

      const ctx = ctxRef.current;
      if (ctx) {
        drawStroke(ctx, points.slice(-4));

        // Calculate percentage in rAF
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const pct = calculatePercentage();
          setScratchPercentage(pct);
          onPercentageChange?.(pct);
        });
      }
    },
    [getCoords, drawStroke, calculatePercentage, onPercentageChange, isRevealed]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      setIsScratching(false);
      pointsRef.current = [];

      const canvas = canvasRef.current;
      if (canvas) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (err) {
          // Ignore: pointer capture might have released automatically
        }
      }

      // Final percentage calculation
      const pct = calculatePercentage();
      setScratchPercentage(pct);
      onPercentageChange?.(pct);
    },
    [calculatePercentage, onPercentageChange]
  );

  // ─── Setup & Cleanup ──────────────────────────────────────────

  const initCanvas = useCallback(
    (fillCallback?: (ctx: CanvasRenderingContext2D) => void) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctxRef.current = ctx;

      // Fill the canvas with the scratch layer (will be erased by scratching)
      if (fillCallback) {
        fillCallback(ctx);
      } else {
        ctx.fillStyle = '#FFB6C1';
        ctx.fillRect(0, 0, width, height);
      }

      // Prevent touch scrolling on canvas
      canvas.style.touchAction = 'none';
    },
    [width, height]
  );

  const resetScratch = useCallback(() => {
    setScratchPercentage(0);
    setIsRevealed(false);
    setIsScratching(false);
    lastCalcRef.current = 0;
    pointsRef.current = [];
    isDrawingRef.current = false;
  }, []);

  const triggerReveal = useCallback(() => {
    setIsRevealed(true);
    setScratchPercentage(100);
  }, []);

  // Bind/unbind event listeners dynamically using useEffect to avoid stale closures
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    canvasRef,
    ctxRef,
    scratchPercentage,
    isScratching,
    isRevealed,
    initCanvas,
    resetScratch,
    triggerReveal,
  };
}
