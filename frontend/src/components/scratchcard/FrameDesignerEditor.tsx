import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Plus, Trash2, Copy, Move, RotateCw, ZoomIn, Lock, Unlock, Eye, EyeOff, 
  FlipHorizontal, FlipVertical, Undo, Redo, Sparkles, Layers, Paintbrush, Sliders, 
  ChevronRight, Smile, Settings, Image as ImageIcon, Heart, Gift
} from 'lucide-react';
import type { 
  ScratchCard, ScrapbookFrameConfig, StickerConfig, PaperTextureType, CornerDecoration 
} from '../../types/scratchcard.js';

interface FrameDesignerEditorProps {
  isOpen: boolean;
  onClose: () => void;
  card: ScratchCard;
  onSave: (updatedFrameConfig: ScrapbookFrameConfig) => void;
}

// ─── STICKER LIBRARY DATA ───────────────────────────────────────────────

const STICKER_LIBRARY_EMOJIS = [
  {
    category: 'Love 💖',
    stickers: ['❤️', '💖', '💕', '💗', '💘', '💝', '💟', '💌', '💑', '💏', '🌹', '🎈']
  },
  {
    category: 'Ribbons & Bows 🎀',
    stickers: ['🎀', '🎗️', '🎀', '🎗️'] // Using emojis for bows, we can duplicate cute styles
  },
  {
    category: 'Flowers & Nature 🌸',
    stickers: ['🌸', '🌷', '🌹', '🌼', '🌺', '💐', '🍀', '🍁', '🍃', '🌻', '💮', '🌴', '🌲']
  },
  {
    category: 'Stars & Sparkles ⭐',
    stickers: ['⭐', '✨', '🌟', '💫', '🌠', '☄️', '🌙', '🌞', '🌈']
  },
  {
    category: 'Cute Objects 🧸',
    stickers: ['🧸', '🐰', '🐱', '🦋', '🐣', '🐶', '🦄', '🐣', '🐙', '🦖', '☁️', '🍓', '🍒', '🍑', '🧁', '🍰', '🎂', '🎁', '🎈', '🕯️', '📷', '📮', '🧷', '📎', '📌']
  },
  {
    category: 'Stationery 📎',
    stickers: ['🧷', '📎', '📌', '✏️', '🖍️', '🖌️', '✂️', '🎟️', '🏷️', '🔖', '💮', '📮']
  },
  {
    category: 'Decorative Borders ✨',
    stickers: ['💠', '🍥', '🍡', '🍭', '🍬', '🍩', '🍪', '🍨', '🍿', '🍧', '🍦', '🍫']
  }
];

// ─── PRESET TEMPLATES ───────────────────────────────────────────────────

const TEMPLATES: { name: string; icon: string; config: Partial<ScrapbookFrameConfig> }[] = [
  {
    name: 'Romantic Scrapbook',
    icon: '💖',
    config: {
      borderWidth: 8,
      borderStyle: 'solid',
      borderColor: '#ffccd5',
      paperTexture: 'pastel',
      backgroundColor: '#fff0f3',
      shadow: '0 8px 32px rgba(255, 92, 147, 0.15)',
      innerPadding: 4,
      outerMargin: 0,
      topLeftCorner: { type: 'emoji', content: '🎀', size: 30 },
      topRightCorner: { type: 'emoji', content: '🎀', size: 30 },
      stickers: [
        { id: 't1_1', type: 'emoji', content: '❤️', x: 20, y: 15, width: 14, rotation: -15, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'heartbeat', glowColor: '#ff5c93' },
        { id: 't1_2', type: 'emoji', content: '💕', x: 80, y: 80, width: 15, rotation: 12, opacity: 0.8, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'floating' },
        { id: 't1_3', type: 'emoji', content: '🌹', x: 15, y: 85, width: 16, rotation: -20, opacity: 0.95, zIndex: 6, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'swing' }
      ]
    }
  },
  {
    name: 'Polaroid Album',
    icon: '📷',
    config: {
      borderWidth: 12,
      borderStyle: 'solid',
      borderColor: '#ffffff',
      paperTexture: 'notebook',
      backgroundColor: '#fcfcfc',
      shadow: '0 6px 20px rgba(0,0,0,0.1)',
      innerPadding: 8,
      outerMargin: 10,
      topLeftCorner: { type: 'emoji', content: '📌', size: 25 },
      stickers: [
        { id: 't2_1', type: 'emoji', content: '📎', x: 85, y: 8, width: 12, rotation: 30, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false },
        { id: 't2_2', type: 'emoji', content: '📷', x: 15, y: 15, width: 14, rotation: -12, opacity: 0.95, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'bounce' }
      ]
    }
  },
  {
    name: 'Vintage Kraft',
    icon: '📜',
    config: {
      borderWidth: 6,
      borderStyle: 'dashed',
      borderColor: '#795548',
      paperTexture: 'kraft',
      backgroundColor: '#d7ccc8',
      shadow: '0 8px 16px rgba(0,0,0,0.15)',
      innerPadding: 0,
      outerMargin: 0,
      stickers: [
        { id: 't3_1', type: 'emoji', content: '🍂', x: 80, y: 15, width: 12, rotation: 45, opacity: 0.8, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'floating' },
        { id: 't3_2', type: 'emoji', content: '🧷', x: 20, y: 82, width: 15, rotation: -40, opacity: 0.9, zIndex: 6, flipX: false, flipY: false, isLocked: false, isHidden: false }
      ]
    }
  },
  {
    name: 'Glitter Princess',
    icon: '✨',
    config: {
      borderWidth: 10,
      borderStyle: 'double',
      borderColor: '#ffd700',
      paperTexture: 'glitter',
      backgroundColor: '#fff9fa',
      shadow: '0 0 20px rgba(255, 215, 0, 0.4)',
      innerPadding: 5,
      outerMargin: 5,
      topRightCorner: { type: 'emoji', content: '👑', size: 35 },
      stickers: [
        { id: 't4_1', type: 'emoji', content: '✨', x: 80, y: 20, width: 15, rotation: 0, opacity: 1, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'sparkle' },
        { id: 't4_2', type: 'emoji', content: '⭐', x: 20, y: 75, width: 12, rotation: 15, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'floating' }
      ]
    }
  },
  {
    name: 'Frosted Cloud Dream',
    icon: '☁️',
    config: {
      borderWidth: 8,
      borderStyle: 'solid',
      borderColor: 'rgba(255,255,255,0.4)',
      paperTexture: 'frosted',
      backgroundColor: 'rgba(240, 248, 255, 0.3)',
      shadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
      innerPadding: 6,
      outerMargin: 0,
      stickers: [
        { id: 't5_1', type: 'emoji', content: '☁️', x: 30, y: 15, width: 22, rotation: 0, opacity: 0.8, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'floating' },
        { id: 't5_2', type: 'emoji', content: '🌈', x: 50, y: 80, width: 25, rotation: -5, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'bounce' }
      ]
    }
  },
  {
    name: 'Sakura Garden',
    icon: '🌸',
    config: {
      borderWidth: 8,
      borderStyle: 'solid',
      borderColor: '#ffe5ec',
      paperTexture: 'watercolor',
      backgroundColor: '#fff0f3',
      shadow: '0 6px 25px rgba(255, 133, 162, 0.18)',
      innerPadding: 4,
      outerMargin: 0,
      topLeftCorner: { type: 'emoji', content: '🌸', size: 30 },
      topRightCorner: { type: 'emoji', content: '🌸', size: 30 },
      stickers: [
        { id: 't6_1', type: 'emoji', content: '🌸', x: 15, y: 80, width: 14, rotation: 10, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'swing' },
        { id: 't6_2', type: 'emoji', content: '🌸', x: 80, y: 20, width: 16, rotation: -15, opacity: 0.85, zIndex: 5, flipX: true, flipY: false, isLocked: false, isHidden: false, animation: 'floating' },
        { id: 't6_3', type: 'emoji', content: '🌷', x: 85, y: 85, width: 14, rotation: 5, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'bounce' }
      ]
    }
  },
  {
    name: 'Teddy Picnic',
    icon: '🧸',
    config: {
      borderWidth: 6,
      borderStyle: 'dashed',
      borderColor: '#ffab91',
      paperTexture: 'linen',
      backgroundColor: '#fff3e0',
      shadow: '0 8px 24px rgba(230, 81, 0, 0.12)',
      innerPadding: 8,
      outerMargin: 5,
      topLeftCorner: { type: 'emoji', content: '🍀', size: 25 },
      stickers: [
        { id: 't7_1', type: 'emoji', content: '🧸', x: 15, y: 15, width: 16, rotation: -8, opacity: 0.95, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'bounce' },
        { id: 't7_2', type: 'emoji', content: '🍓', x: 80, y: 78, width: 14, rotation: 12, opacity: 0.9, zIndex: 6, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'floating' },
        { id: 't7_3', type: 'emoji', content: '🌼', x: 82, y: 18, width: 12, rotation: 25, opacity: 0.8, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false }
      ]
    }
  },
  {
    name: 'Birthday Party',
    icon: '🎂',
    config: {
      borderWidth: 8,
      borderStyle: 'solid',
      borderColor: '#e8f5e9',
      paperTexture: 'glitter',
      backgroundColor: '#f1f8e9',
      shadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
      innerPadding: 0,
      outerMargin: 5,
      topLeftCorner: { type: 'emoji', content: '🎈', size: 30 },
      topRightCorner: { type: 'emoji', content: '🎈', size: 30 },
      stickers: [
        { id: 't8_1', type: 'emoji', content: '🎂', x: 50, y: 88, width: 18, rotation: 0, opacity: 1, zIndex: 6, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'heartbeat' },
        { id: 't8_2', type: 'emoji', content: '🎁', x: 15, y: 80, width: 14, rotation: -12, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'bounce' },
        { id: 't8_3', type: 'emoji', content: '🎉', x: 82, y: 15, width: 15, rotation: 15, opacity: 0.95, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'swing' }
      ]
    }
  },
  {
    name: 'Magical Wizard',
    icon: '🔮',
    config: {
      borderWidth: 10,
      borderStyle: 'solid',
      borderColor: '#b39ddb',
      paperTexture: 'metallic',
      backgroundColor: '#311b92',
      shadow: '0 0 25px rgba(103, 58, 183, 0.5)',
      innerPadding: 4,
      outerMargin: 0,
      topLeftCorner: { type: 'emoji', content: '🔮', size: 28 },
      topRightCorner: { type: 'emoji', content: '🌟', size: 28 },
      stickers: [
        { id: 't9_1', type: 'emoji', content: '✨', x: 80, y: 80, width: 14, rotation: 0, opacity: 0.95, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'sparkle', glowColor: '#b39ddb' },
        { id: 't9_2', type: 'emoji', content: '🌙', x: 20, y: 15, width: 15, rotation: -25, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'floating' },
        { id: 't9_3', type: 'emoji', content: '🪄', x: 75, y: 18, width: 16, rotation: 40, opacity: 0.95, zIndex: 6, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'swing' }
      ]
    }
  },
  {
    name: 'Love Letter Book',
    icon: '💌',
    config: {
      borderWidth: 10,
      borderStyle: 'solid',
      borderColor: '#d7ccc8',
      paperTexture: 'vintage',
      backgroundColor: '#efebe9',
      shadow: '0 10px 30px rgba(0,0,0,0.18)',
      innerPadding: 6,
      outerMargin: 8,
      topLeftCorner: { type: 'emoji', content: '📮', size: 25 },
      stickers: [
        { id: 't10_1', type: 'emoji', content: '💌', x: 50, y: 12, width: 16, rotation: 10, opacity: 0.95, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'bounce' },
        { id: 't10_2', type: 'emoji', content: '📌', x: 80, y: 82, width: 12, rotation: -30, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false },
        { id: 't10_3', type: 'emoji', content: '🌹', x: 15, y: 85, width: 15, rotation: 20, opacity: 0.95, zIndex: 6, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'floating' }
      ]
    }
  },
  {
    name: 'Pastel Rainbow',
    icon: '🌈',
    config: {
      borderWidth: 8,
      borderStyle: 'dashed',
      borderColor: '#f8bbd0',
      paperTexture: 'pastel',
      backgroundColor: '#fff9fc',
      shadow: '0 6px 20px rgba(244, 143, 177, 0.15)',
      innerPadding: 4,
      outerMargin: 0,
      topLeftCorner: { type: 'emoji', content: '🐰', size: 28 },
      topRightCorner: { type: 'emoji', content: '🐣', size: 28 },
      stickers: [
        { id: 't11_1', type: 'emoji', content: '🌈', x: 50, y: 15, width: 22, rotation: 0, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'floating' },
        { id: 't11_2', type: 'emoji', content: '🧁', x: 18, y: 82, width: 14, rotation: -10, opacity: 0.95, zIndex: 6, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'bounce' },
        { id: 't11_3', type: 'emoji', content: '💖', x: 80, y: 80, width: 14, rotation: 15, opacity: 0.9, zIndex: 5, flipX: false, flipY: false, isLocked: false, isHidden: false, animation: 'heartbeat' }
      ]
    }
  }
];

// ─── STICKER ANIMATIONS LIST ─────────────────────────────────────────────

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'Tĩnh (None)' },
  { value: 'floating', label: 'Lơ lửng (Floating)' },
  { value: 'bounce', label: 'Nhún nhảy (Bounce)' },
  { value: 'swing', label: 'Đung đưa (Swing)' },
  { value: 'rotate', label: 'Xoay tròn (Rotate)' },
  { value: 'heartbeat', label: 'Nhịp đập (Heartbeat)' },
  { value: 'breathing', label: 'Thở chậm (Breathing)' },
  { value: 'sparkle', label: 'Lấp lánh (Sparkle)' },
  { value: 'shaking', label: 'Rung lắc (Shaking)' },
  { value: 'pulse', label: 'Phát sóng (Pulse)' }
];

export const FrameDesignerEditor: React.FC<FrameDesignerEditorProps> = ({
  isOpen,
  onClose,
  card,
  onSave
}) => {
  // Main Config State
  const [frameConfig, setFrameConfig] = useState<ScrapbookFrameConfig>({
    borderWidth: 8,
    borderStyle: 'solid',
    borderColor: '#ffffff',
    paperTexture: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    shadow: '0 8px 32px rgba(255, 92, 147, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
    innerPadding: 0,
    outerMargin: 0,
    stickers: []
  });

  // Active UI States
  const [activeTab, setActiveTab] = useState<'stickers' | 'frame' | 'presets'>('presets');
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [customStickers, setCustomStickers] = useState<string[]>([]);
  
  // History State for Undo/Redo
  const [history, setHistory] = useState<ScrapbookFrameConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const previewRef = useRef<HTMLDivElement | null>(null);

  // Initialize frame config from card
  useEffect(() => {
    if (isOpen) {
      const initialConfig = card.frameConfig || {
        borderWidth: 8,
        borderStyle: 'solid',
        borderColor: '#ffffff',
        paperTexture: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        shadow: '0 8px 32px rgba(255, 92, 147, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
        innerPadding: 0,
        outerMargin: 0,
        stickers: []
      };
      setFrameConfig(JSON.parse(JSON.stringify(initialConfig)));
      setHistory([JSON.parse(JSON.stringify(initialConfig))]);
      setHistoryIndex(0);
      setActiveStickerId(null);
    }
  }, [card, isOpen]);

  // Push new state onto history stack
  const pushHistory = (newConfig: ScrapbookFrameConfig) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(JSON.parse(JSON.stringify(newConfig)));
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setFrameConfig(JSON.parse(JSON.stringify(history[prevIdx])));
      setActiveStickerId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setFrameConfig(JSON.parse(JSON.stringify(history[nextIdx])));
      setActiveStickerId(null);
    }
  };

  const updateConfig = (updater: (prev: ScrapbookFrameConfig) => ScrapbookFrameConfig) => {
    setFrameConfig(prev => {
      const next = updater(prev);
      pushHistory(next);
      return next;
    });
  };

  // ─── STICKER CRUD OPERATIONS ───────────────────────────────────────────

  const addSticker = (type: 'emoji' | 'custom', content: string) => {
    const newSticker: StickerConfig = {
      id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      content,
      x: 50,
      y: 50,
      width: 15,
      rotation: 0,
      opacity: 1,
      zIndex: frameConfig.stickers.length + 1,
      flipX: false,
      flipY: false,
      isLocked: false,
      isHidden: false,
      animation: 'none'
    };

    updateConfig(prev => ({
      ...prev,
      stickers: [...prev.stickers, newSticker]
    }));
    setActiveStickerId(newSticker.id);
  };

  const deleteSticker = (id: string) => {
    updateConfig(prev => ({
      ...prev,
      stickers: prev.stickers.filter(s => s.id !== id)
    }));
    if (activeStickerId === id) setActiveStickerId(null);
  };

  const duplicateSticker = (id: string) => {
    const source = frameConfig.stickers.find(s => s.id === id);
    if (!source) return;
    const clone: StickerConfig = {
      ...source,
      id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      x: Math.min(source.x + 5, 100),
      y: Math.min(source.y + 5, 100),
      zIndex: frameConfig.stickers.length + 1,
      isLocked: false
    };

    updateConfig(prev => ({
      ...prev,
      stickers: [...prev.stickers, clone]
    }));
    setActiveStickerId(clone.id);
  };

  const updateSticker = (id: string, fields: Partial<StickerConfig>) => {
    setFrameConfig(prev => {
      const next = {
        ...prev,
        stickers: prev.stickers.map(s => s.id === id ? { ...s, ...fields } : s)
      };
      // For quick mouse-drag triggers, we write to state first and persist history in bulk
      return next;
    });
  };

  // Helper to trigger save to history after drag releases
  const commitStickerChanges = () => {
    pushHistory(frameConfig);
  };

  // ─── DRAG & DROP INTERACTION LOGIC ──────────────────────────────────────

  const handleStickerDragStart = (e: React.MouseEvent, stickerId: string) => {
    e.stopPropagation();
    const sticker = frameConfig.stickers.find(s => s.id === stickerId)!;
    if (sticker.isLocked) return;

    setActiveStickerId(stickerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = sticker.x;
    const initialY = sticker.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const containerRect = previewRef.current!.getBoundingClientRect();
      const pctX = (dx / containerRect.width) * 100;
      const pctY = (dy / containerRect.height) * 100;

      let nextX = initialX + pctX;
      let nextY = initialY + pctY;

      // Snapping to center horizontal/vertical
      if (Math.abs(nextX - 50) < 2) nextX = 50;
      if (Math.abs(nextY - 50) < 2) nextY = 50;

      nextX = Math.min(Math.max(nextX, -10), 110);
      nextY = Math.min(Math.max(nextY, -10), 110);

      updateSticker(stickerId, { x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      commitStickerChanges();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeDragStart = (e: React.MouseEvent, stickerId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const sticker = frameConfig.stickers.find(s => s.id === stickerId)!;
    const startX = e.clientX;
    const initialWidth = sticker.width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const containerRect = previewRef.current!.getBoundingClientRect();
      const percentDx = (dx / containerRect.width) * 100;

      // Resize from center
      const nextWidth = Math.min(Math.max(initialWidth + percentDx * 2, 5), 100);
      updateSticker(stickerId, { width: nextWidth });
    };

    const handleMouseUp = () => {
      commitStickerChanges();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleRotateDragStart = (e: React.MouseEvent, stickerId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const containerRect = previewRef.current!.getBoundingClientRect();
    const sticker = frameConfig.stickers.find(s => s.id === stickerId)!;
    const centerX = containerRect.left + (sticker.x / 100) * containerRect.width;
    const centerY = containerRect.top + (sticker.y / 100) * containerRect.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const vx = moveEvent.clientX - centerX;
      const vy = moveEvent.clientY - centerY;
      const radians = Math.atan2(vy, vx);
      let degrees = (radians * 180) / Math.PI - 90; // offset rotate handle position which sits on top

      degrees = (degrees + 360) % 360;

      // Snap to multiple of 15 deg if close
      const snapInterval = 15;
      const snapped = Math.round(degrees / snapInterval) * snapInterval;
      if (Math.abs(degrees - snapped) < 4) {
        degrees = snapped;
      }

      updateSticker(stickerId, { rotation: degrees });
    };

    const handleMouseUp = () => {
      commitStickerChanges();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Keyboard controls
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!activeStickerId) return;
    const active = frameConfig.stickers.find(s => s.id === activeStickerId);
    if (!active || active.isLocked) return;

    const delta = e.shiftKey ? 5 : 1;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateSticker(activeStickerId, { y: Math.max(active.y - delta, -10) });
      commitStickerChanges();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateSticker(activeStickerId, { y: Math.min(active.y + delta, 110) });
      commitStickerChanges();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updateSticker(activeStickerId, { x: Math.max(active.x - delta, -10) });
      commitStickerChanges();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      updateSticker(activeStickerId, { x: Math.min(active.x + delta, 110) });
      commitStickerChanges();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSticker(activeStickerId);
    } else if (e.key === 'Escape') {
      setActiveStickerId(null);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStickerId, frameConfig]);

  // Load custom uploads
  const handleCustomStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomStickers(prev => [...prev, dataUrl]);
    };
    reader.readAsDataURL(file);
    // clear input
    e.target.value = '';
  };

  const loadTemplate = (tmplConfig: Partial<ScrapbookFrameConfig>) => {
    updateConfig(prev => ({
      ...prev,
      ...tmplConfig,
      topLeftCorner: tmplConfig.topLeftCorner || { type: 'none', content: '', size: 20 },
      topRightCorner: tmplConfig.topRightCorner || { type: 'none', content: '', size: 20 },
      bottomLeftCorner: tmplConfig.bottomLeftCorner || { type: 'none', content: '', size: 20 },
      bottomRightCorner: tmplConfig.bottomRightCorner || { type: 'none', content: '', size: 20 },
      stickers: tmplConfig.stickers ? [...tmplConfig.stickers] : []
    }));
    setActiveStickerId(null);
  };

  // ─── RENDER HELPER STYLES ──────────────────────────────────────────────

  if (!isOpen) return null;

  const activeSticker = frameConfig.stickers.find(s => s.id === activeStickerId);
  const aspectRatio = card.width / card.height;
  const PREVIEW_WIDTH = 280;
  const PREVIEW_HEIGHT = PREVIEW_WIDTH / aspectRatio;

  const previewFrameStyle: React.CSSProperties = {
    width: `${PREVIEW_WIDTH}px`,
    height: `${PREVIEW_HEIGHT}px`,
    borderWidth: `${frameConfig.borderWidth}px`,
    borderStyle: frameConfig.borderStyle || 'solid',
    borderColor: frameConfig.borderColor || '#ffffff',
    borderRadius: `${card.borderRadius}px`,
    backgroundColor: frameConfig.backgroundColor || 'rgba(255, 255, 255, 0.65)',
    boxShadow: frameConfig.shadow || undefined,
    padding: `${frameConfig.innerPadding}px`,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (frameConfig.gradient) {
    previewFrameStyle.background = frameConfig.gradient;
  }
  if (frameConfig.blur) {
    previewFrameStyle.filter = `blur(${frameConfig.blur}px)`;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl h-[90vh] overflow-hidden border border-primary/10">
        
        {/* LEFT PANEL: Live Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gray-50 border-r border-primary/10 select-none">
          
          {/* Top Info Bar */}
          <div className="w-full flex justify-between items-center text-xs font-semibold text-text/50">
            <span>Thiết kế khung Scrapbook: {card.title}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 bg-white border border-primary/10 rounded-lg hover:bg-primary/5 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                title="Undo"
              >
                <Undo size={14} className="text-text/70" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 bg-white border border-primary/10 rounded-lg hover:bg-primary/5 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                title="Redo"
              >
                <Redo size={14} className="text-text/70" />
              </button>
            </div>
          </div>

          {/* Sandbox Render Container */}
          <div 
            className="flex items-center justify-center relative p-8 w-full h-[60%] overflow-visible"
            onClick={() => setActiveStickerId(null)}
          >
            <div 
              style={{ 
                position: 'relative', 
                width: `${PREVIEW_WIDTH}px`, 
                height: `${PREVIEW_HEIGHT}px`,
                margin: `${frameConfig.outerMargin}px`
              }}
            >
              {/* Card Frame Preview */}
              <div 
                ref={previewRef}
                style={previewFrameStyle}
              >
                {/* Paper Texture */}
                {frameConfig.paperTexture && frameConfig.paperTexture !== 'none' && (
                  <div 
                    className={`paper-texture-${frameConfig.paperTexture}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      zIndex: 10,
                      mixBlendMode: frameConfig.paperTexture === 'frosted' || frameConfig.paperTexture === 'acrylic' ? 'normal' : 'multiply',
                      opacity: frameConfig.paperTexture === 'frosted' ? 1 : 0.4
                    }}
                  />
                )}

                {/* Corners rendering */}
                {frameConfig.topLeftCorner && (
                  <CornerRender pos="tl" size={frameConfig.topLeftCorner.size} corner={frameConfig.topLeftCorner} />
                )}
                {frameConfig.topRightCorner && (
                  <CornerRender pos="tr" size={frameConfig.topRightCorner.size} corner={frameConfig.topRightCorner} />
                )}
                {frameConfig.bottomLeftCorner && (
                  <CornerRender pos="bl" size={frameConfig.bottomLeftCorner.size} corner={frameConfig.bottomLeftCorner} />
                )}
                {frameConfig.bottomRightCorner && (
                  <CornerRender pos="br" size={frameConfig.bottomRightCorner.size} corner={frameConfig.bottomRightCorner} />
                )}

                {/* Mock Card Scratch Layout Background */}
                <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center z-[1] p-3 text-center border-dashed border border-primary/20">
                  <span className="text-3xl mb-1">🃏</span>
                  <span className="text-[10px] uppercase font-bold text-primary/40 tracking-wider">Scratch Canvas Area</span>
                  <span className="text-[9px] text-text/40">{card.width} x {card.height} px</span>
                </div>
              </div>

              {/* Stickers Overlapping Layer */}
              {frameConfig.stickers.map(sticker => {
                if (sticker.isHidden) return null;
                const isSelected = activeStickerId === sticker.id;

                const stickerStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  width: `${sticker.width}%`,
                  zIndex: sticker.zIndex || 5,
                  opacity: sticker.opacity,
                  cursor: isSelected ? 'move' : 'pointer'
                };

                const filterParts: string[] = [];
                if (sticker.brightness !== undefined) filterParts.push(`brightness(${sticker.brightness}%)`);
                if (sticker.contrast !== undefined) filterParts.push(`contrast(${sticker.contrast}%)`);
                if (sticker.saturation !== undefined) filterParts.push(`saturate(${sticker.saturation}%)`);
                if (sticker.hueRotate !== undefined) filterParts.push(`hue-rotate(${sticker.hueRotate}deg)`);
                if (sticker.blur) filterParts.push(`blur(${sticker.blur}px)`);
                
                if (sticker.glowColor) {
                  filterParts.push(`drop-shadow(0 0 8px ${sticker.glowColor})`);
                } else if (sticker.shadow) {
                  filterParts.push(`drop-shadow(${sticker.shadow})`);
                }

                const contentStyle: React.CSSProperties = {
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scaleX(${sticker.flipX ? -1 : 1}) scaleY(${sticker.flipY ? -1 : 1})`,
                  filter: filterParts.length > 0 ? filterParts.join(' ') : undefined,
                  border: isSelected ? '1.5px dashed #ff5c93' : 'none',
                  padding: isSelected ? '4px' : '0px'
                };

                const animClass = sticker.animation && sticker.animation !== 'none' ? `anim-sticker-${sticker.animation}` : '';

                return (
                  <div
                    key={sticker.id}
                    style={stickerStyle}
                    className={animClass}
                    onMouseDown={(e) => handleStickerDragStart(e, sticker.id)}
                    onClick={(e) => { e.stopPropagation(); setActiveStickerId(sticker.id); }}
                  >
                    {sticker.type === 'emoji' ? (
                      <span style={{ ...contentStyle, fontSize: '3rem', display: 'block', textAlign: 'center', lineHeight: 1 }}>
                        {sticker.content}
                      </span>
                    ) : (
                      <img src={sticker.content} alt="sticker" style={contentStyle} className="pointer-events-none" />
                    )}

                    {/* Resize/Rotate/Delete Handles when selected */}
                    {isSelected && !sticker.isLocked && (
                      <>
                        {/* Rotate Handle */}
                        <div
                          className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center cursor-alias shadow-md hover:scale-110 transition-transform"
                          onMouseDown={(e) => handleRotateDragStart(e, sticker.id)}
                          title="Xoay"
                        >
                          <RotateCw size={10} />
                        </div>
                        {/* Resize Handle */}
                        <div
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full cursor-se-resize shadow-md hover:scale-110 transition-transform"
                          onMouseDown={(e) => handleResizeDragStart(e, sticker.id)}
                          title="Co giãn"
                        />
                        {/* Quick Delete Handle */}
                        <button
                          className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-red-600 transition-colors"
                          onClick={(e) => { e.stopPropagation(); deleteSticker(sticker.id); }}
                          title="Xóa"
                        >
                          <X size={10} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips footer */}
          <div className="text-[10px] text-text/40 font-semibold uppercase tracking-wider text-center max-w-sm">
            💡 Sử dụng phím mũi tên để dịch chuyển, phím Delete để xóa nhãn dán đang chọn.
          </div>
        </div>

        {/* RIGHT PANEL: Settings sidebar */}
        <div className="w-full md:w-96 flex flex-col bg-white border-t md:border-t-0 border-primary/10">
          {/* Header */}
          <div className="p-4 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
            <h3 className="font-bold text-text uppercase tracking-wide text-sm flex items-center gap-2">
              🎨 Thiết kế Scrapbook Frame
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-text/50 hover:text-text cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-primary/5 text-xs font-bold uppercase tracking-wider bg-gray-50">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${activeTab === 'presets' ? 'border-primary text-primary bg-white' : 'border-transparent text-text/50 hover:text-text/80'}`}
            >
              📐 Mẫu sẵn có
            </button>
            <button
              onClick={() => setActiveTab('frame')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${activeTab === 'frame' ? 'border-primary text-primary bg-white' : 'border-transparent text-text/50 hover:text-text/80'}`}
            >
              🖼️ Khung viền
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${activeTab === 'stickers' ? 'border-primary text-primary bg-white' : 'border-transparent text-text/50 hover:text-text/80'}`}
            >
              🧸 Nhãn dán
            </button>
          </div>

          {/* Content scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* ──────── TAB: PRESETS ──────── */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <span className="text-[10px] text-text/40 font-bold uppercase tracking-wider block mb-1">Chọn mẫu viền Scrapbook</span>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.name}
                      onClick={() => loadTemplate(t.config)}
                      className="flex flex-col items-center justify-center p-4 bg-white border border-primary/10 hover:border-primary/30 rounded-2xl text-center transition-all hover:shadow-md cursor-pointer hover:bg-primary/[0.02]"
                    >
                      <span className="text-3xl mb-2">{t.icon}</span>
                      <span className="text-[11px] font-bold text-text truncate w-full">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ──────── TAB: FRAME SETTINGS ──────── */}
            {activeTab === 'frame' && (
              <div className="space-y-4 text-xs">
                {/* Borders */}
                <div className="space-y-3 border-b border-primary/5 pb-4">
                  <span className="text-[10px] text-text/50 font-bold uppercase tracking-wider block">Viền Khung Hình</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-text/60 mb-1">Độ dày viền (px)</label>
                      <input
                        type="number" min="0" max="40"
                        value={frameConfig.borderWidth}
                        onChange={e => updateConfig(p => ({ ...p, borderWidth: parseInt(e.target.value) || 0 }))}
                        className="sc-admin-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text/60 mb-1">Kiểu viền</label>
                      <select
                        value={frameConfig.borderStyle}
                        onChange={e => updateConfig(p => ({ ...p, borderStyle: e.target.value }))}
                        className="sc-admin-input"
                      >
                        <option value="solid">Nét liền (Solid)</option>
                        <option value="dashed">Nét đứt (Dashed)</option>
                        <option value="dotted">Chấm bi (Dotted)</option>
                        <option value="double">Viền kép (Double)</option>
                        <option value="none">Không viền (None)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text/60 mb-1">Màu sắc viền</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={frameConfig.borderColor}
                        onChange={e => updateConfig(p => ({ ...p, borderColor: e.target.value }))}
                        className="w-8 h-8 rounded border border-primary/10 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={frameConfig.borderColor}
                        onChange={e => updateConfig(p => ({ ...p, borderColor: e.target.value }))}
                        className="sc-admin-input flex-1 font-mono uppercase text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Backdrops */}
                <div className="space-y-3 border-b border-primary/5 pb-4">
                  <span className="text-[10px] text-text/50 font-bold uppercase tracking-wider block">Màu Nền & Chất Liệu</span>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-text/60 mb-1">Chất liệu giấy (Paper Texture)</label>
                    <select
                      value={frameConfig.paperTexture}
                      onChange={e => updateConfig(p => ({ ...p, paperTexture: e.target.value as PaperTextureType }))}
                      className="sc-admin-input"
                    >
                      <option value="none">Mặc định (Smooth)</option>
                      <option value="handmade">Giấy thủ công (Handmade)</option>
                      <option value="watercolor">Giấy màu nước (Watercolor)</option>
                      <option value="kraft">Giấy xi măng nâu (Kraft)</option>
                      <option value="vintage">Giấy ố vàng (Vintage)</option>
                      <option value="notebook">Vở học sinh kẻ dòng (Notebook)</option>
                      <option value="glitter">Nhũ kim tuyến lấp lánh (Glitter)</option>
                      <option value="metallic">Kim loại chrome bạc (Metallic)</option>
                      <option value="fabric">Vải bố thô (Fabric Weave)</option>
                      <option value="linen">Vải lanh mềm (Linen)</option>
                      <option value="frosted">Kính mờ đục (Frosted Glass)</option>
                      <option value="acrylic">Acrylic trong suốt (Acrylic)</option>
                      <option value="pastel">Giấy pastel trái tim (Cute Pastel)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-text/60 mb-1">Màu nền chính</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={frameConfig.backgroundColor.startsWith('rgba') ? '#ffffff' : frameConfig.backgroundColor}
                          onChange={e => updateConfig(p => ({ ...p, backgroundColor: e.target.value }))}
                          className="w-7 h-7 rounded border border-primary/10 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={frameConfig.backgroundColor}
                          onChange={e => updateConfig(p => ({ ...p, backgroundColor: e.target.value }))}
                          className="sc-admin-input flex-1 font-mono text-[10px] p-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text/60 mb-1">Bo góc viền (Radius)</label>
                      <input
                        type="number" min="0" max="40"
                        value={card.borderRadius} // borderRadius is editDraft global field, but we can display and edit it
                        onChange={e => {
                          // Note: we can edit it in Admin, let's keep it read-only here or set inner padding instead
                        }}
                        disabled
                        className="sc-admin-input bg-gray-100 opacity-60"
                        title="Thiết lập ở mục Layout & Size ngoài admin panel"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text/60 mb-1">Dải màu Gradient (CSS)</label>
                    <input
                      type="text"
                      value={frameConfig.gradient || ''}
                      onChange={e => updateConfig(p => ({ ...p, gradient: e.target.value || undefined }))}
                      className="sc-admin-input font-mono text-[11px]"
                      placeholder="linear-gradient(to right, #ff9a9e, #fecfef)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-text/60 mb-1">Độ lệch lề (Margin)</label>
                      <input
                        type="number" min="-20" max="40"
                        value={frameConfig.outerMargin}
                        onChange={e => updateConfig(p => ({ ...p, outerMargin: parseInt(e.target.value) || 0 }))}
                        className="sc-admin-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text/60 mb-1">Đệm trong (Padding)</label>
                      <input
                        type="number" min="0" max="30"
                        value={frameConfig.innerPadding}
                        onChange={e => updateConfig(p => ({ ...p, innerPadding: parseInt(e.target.value) || 0 }))}
                        className="sc-admin-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Corner Decorations settings */}
                <div className="space-y-3">
                  <span className="text-[10px] text-text/50 font-bold uppercase tracking-wider block">Trang trí 4 Góc</span>
                  <div className="grid grid-cols-2 gap-3">
                    <CornerConfigSelector label="Góc trên-trái" pos="tl" corner={frameConfig.topLeftCorner} update={(c) => updateConfig(p => ({ ...p, topLeftCorner: c }))} />
                    <CornerConfigSelector label="Góc trên-phải" pos="tr" corner={frameConfig.topRightCorner} update={(c) => updateConfig(p => ({ ...p, topRightCorner: c }))} />
                    <CornerConfigSelector label="Góc dưới-trái" pos="bl" corner={frameConfig.bottomLeftCorner} update={(c) => updateConfig(p => ({ ...p, bottomLeftCorner: c }))} />
                    <CornerConfigSelector label="Góc dưới-phải" pos="br" corner={frameConfig.bottomRightCorner} update={(c) => updateConfig(p => ({ ...p, bottomRightCorner: c }))} />
                  </div>
                </div>
              </div>
            )}

            {/* ──────── TAB: STICKER LIBRARY & OPTIONS ──────── */}
            {activeTab === 'stickers' && (
              <div className="space-y-4">
                
                {/* 1. Selected Sticker Config panel */}
                {activeSticker && (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3.5 space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-primary/10">
                      <span className="font-bold text-primary uppercase text-[10px] tracking-wider">Cấu hình nhãn dán</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateSticker(activeSticker.id, { isLocked: !activeSticker.isLocked })}
                          className="p-1 rounded bg-white border border-primary/10 text-text/60 hover:text-text cursor-pointer"
                          title={activeSticker.isLocked ? "Unlock" : "Lock"}
                        >
                          {activeSticker.isLocked ? <Lock size={12} className="text-red-400" /> : <Unlock size={12} />}
                        </button>
                        <button
                          onClick={() => updateSticker(activeSticker.id, { isHidden: !activeSticker.isHidden })}
                          className="p-1 rounded bg-white border border-primary/10 text-text/60 hover:text-text cursor-pointer"
                          title={activeSticker.isHidden ? "Show" : "Hide"}
                        >
                          {activeSticker.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button
                          onClick={() => duplicateSticker(activeSticker.id)}
                          className="p-1 rounded bg-white border border-primary/10 text-text/60 hover:text-text cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => deleteSticker(activeSticker.id)}
                          className="p-1 rounded bg-red-50 border border-red-200 text-red-400 hover:bg-red-100 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {!activeSticker.isLocked && (
                      <div className="space-y-3">
                        {/* Layer order & Opacity */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-text/60 mb-0.5">Thứ tự đè (Z-Index)</label>
                            <input
                              type="number" min="1" max="100"
                              value={activeSticker.zIndex}
                              onChange={e => updateSticker(activeSticker.id, { zIndex: parseInt(e.target.value) || 1 })}
                              className="sc-admin-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-text/60 mb-0.5">Độ trong suốt (Opacity)</label>
                            <input
                              type="range" min="0.1" max="1" step="0.05"
                              value={activeSticker.opacity}
                              onChange={e => updateSticker(activeSticker.id, { opacity: parseFloat(e.target.value) })}
                              className="w-full h-1 mt-2.5 cursor-pointer accent-primary"
                            />
                          </div>
                        </div>

                        {/* Flips */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateSticker(activeSticker.id, { flipX: !activeSticker.flipX })}
                            className={`flex-1 py-1.5 border rounded-lg flex items-center justify-center gap-1.5 font-semibold text-[10px] cursor-pointer ${activeSticker.flipX ? 'bg-primary/15 border-primary text-primary' : 'bg-white border-primary/15 text-text/60'}`}
                          >
                            <FlipHorizontal size={10} /> Lật ngang (X)
                          </button>
                          <button
                            onClick={() => updateSticker(activeSticker.id, { flipY: !activeSticker.flipY })}
                            className={`flex-1 py-1.5 border rounded-lg flex items-center justify-center gap-1.5 font-semibold text-[10px] cursor-pointer ${activeSticker.flipY ? 'bg-primary/15 border-primary text-primary' : 'bg-white border-primary/15 text-text/60'}`}
                          >
                            <FlipVertical size={10} /> Lật dọc (Y)
                          </button>
                        </div>

                        {/* Animations */}
                        <div>
                          <label className="block text-[10px] font-bold text-text/60 mb-1">Hiệu ứng chuyển động (Animation)</label>
                          <select
                            value={activeSticker.animation || 'none'}
                            onChange={e => updateSticker(activeSticker.id, { animation: e.target.value })}
                            className="sc-admin-input"
                          >
                            {ANIMATION_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Visual Filters Accordion */}
                        <div className="border border-primary/8 rounded-lg p-2 bg-white space-y-2">
                          <span className="font-bold text-[9px] text-text/40 uppercase tracking-wider block">Bộ lọc màu & Hiệu ứng</span>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-[9px] text-text/50">Glow Color (Màu phát sáng)</span>
                              <input
                                type="text"
                                value={activeSticker.glowColor || ''}
                                onChange={e => updateSticker(activeSticker.id, { glowColor: e.target.value || undefined })}
                                className="sc-admin-input text-[10px] py-1 px-2 font-mono"
                                placeholder="#ff5c93"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-text/50">Hue-rotate (Đổi tông màu)</span>
                              <input
                                type="number" min="0" max="360"
                                value={activeSticker.hueRotate || 0}
                                onChange={e => updateSticker(activeSticker.id, { hueRotate: parseInt(e.target.value) || 0 })}
                                className="sc-admin-input text-[10px] py-1 px-2"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-text/50">Độ sáng (Bright)</span>
                              <input
                                type="range" min="30" max="200" step="5"
                                value={activeSticker.brightness ?? 100}
                                onChange={e => updateSticker(activeSticker.id, { brightness: parseInt(e.target.value) })}
                                className="w-full accent-primary mt-1"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-text/50">Độ tương phản (Contrast)</span>
                              <input
                                type="range" min="30" max="200" step="5"
                                value={activeSticker.contrast ?? 100}
                                onChange={e => updateSticker(activeSticker.id, { contrast: parseInt(e.target.value) })}
                                className="w-full accent-primary mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Upload custom stickers */}
                <div className="border border-primary/10 rounded-2xl p-3 bg-primary/[0.02]">
                  <span className="text-[10px] text-text/50 font-bold uppercase tracking-wider block mb-1">Tải nhãn dán tùy chỉnh (.PNG / .SVG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomStickerUpload}
                    className="sc-admin-input text-xs cursor-pointer"
                  />
                </div>

                {/* 3. Sticker Selector Panel */}
                <div className="space-y-4">
                  {customStickers.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-text/40 font-bold uppercase tracking-wider block">Custom Uploads 📷</span>
                      <div className="flex flex-wrap gap-2">
                        {customStickers.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => addSticker('custom', src)}
                            className="w-12 h-12 p-1 border border-primary/10 hover:border-primary bg-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                          >
                            <img src={src} alt="custom-sticker" className="max-w-full max-h-full object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {STICKER_LIBRARY_EMOJIS.map(cat => (
                    <div key={cat.category} className="space-y-1.5">
                      <span className="text-[10px] text-text/40 font-bold uppercase tracking-wider block">{cat.category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.stickers.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => addSticker('emoji', emoji)}
                            className="w-9 h-9 text-2xl bg-white border border-primary/5 hover:border-primary/20 rounded-lg flex items-center justify-center hover:scale-105 transition-all hover:shadow-sm cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

          {/* Bottom Save bar */}
          <div className="p-4 border-t border-primary/10 bg-gray-50 flex gap-2">
            <button
              onClick={() => onSave(frameConfig)}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/80 transition-colors shadow-md shadow-primary/15 cursor-pointer text-center"
            >
              Lưu thiết kế viền ✨
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white text-text/60 border border-primary/15 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

// ─── HELPER COMPONENT: CornerRender ─────────────────────────────────────

interface CornerRenderProps {
  pos: 'tl' | 'tr' | 'bl' | 'br';
  size: number;
  corner: CornerDecoration;
}

const CornerRender: React.FC<CornerRenderProps> = ({ pos, size, corner }) => {
  if (corner.type === 'none' || !corner.content) return null;
  const halfSize = size / 2;

  const style: React.CSSProperties = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    zIndex: 25,
    pointerEvents: 'none'
  };

  if (pos === 'tl') { style.top = -halfSize; style.left = -halfSize; }
  if (pos === 'tr') { style.top = -halfSize; style.right = -halfSize; }
  if (pos === 'bl') { style.bottom = -halfSize; style.left = -halfSize; }
  if (pos === 'br') { style.bottom = -halfSize; style.right = -halfSize; }

  return (
    <div style={style}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {corner.type === 'emoji' ? (
          <span style={{ fontSize: `${size * 0.7}px`, lineHeight: 1 }}>{corner.content}</span>
        ) : (
          <img src={corner.content} alt="corner-icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}
      </div>
    </div>
  );
};

// ─── HELPER COMPONENT: CornerConfigSelector ─────────────────────────────

interface CornerConfigSelectorProps {
  label: string;
  pos: 'tl' | 'tr' | 'bl' | 'br';
  corner?: CornerDecoration;
  update: (c: CornerDecoration) => void;
}

const CornerConfigSelector: React.FC<CornerConfigSelectorProps> = ({
  label,
  pos,
  corner,
  update
}) => {
  const activeCorner = corner || { type: 'none', content: '', size: 20 };

  return (
    <div className="border border-primary/5 p-2 bg-gray-50/50 rounded-xl space-y-1.5">
      <span className="font-bold text-[9px] text-text/60 block">{label}</span>
      <div className="grid grid-cols-2 gap-1.5">
        <select
          value={activeCorner.type}
          onChange={e => update({ ...activeCorner, type: e.target.value as any })}
          className="sc-admin-input py-1 text-[10px]"
        >
          <option value="none">Trống</option>
          <option value="emoji">Emoji</option>
          <option value="custom">Upload</option>
        </select>
        <input
          type="number" min="10" max="60"
          value={activeCorner.size}
          onChange={e => update({ ...activeCorner, size: parseInt(e.target.value) || 20 })}
          className="sc-admin-input py-1 text-[10px]"
          title="Kích thước góc trang trí"
          placeholder="Size px"
        />
      </div>
      {activeCorner.type !== 'none' && (
        <div>
          {activeCorner.type === 'emoji' ? (
            <input
              type="text" maxLength={2}
              value={activeCorner.content}
              onChange={e => update({ ...activeCorner, content: e.target.value })}
              className="sc-admin-input py-1 text-center text-xs"
              placeholder="Nhập emoji"
            />
          ) : (
            <input
              type="file" accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const r = new FileReader();
                r.onload = () => update({ ...activeCorner, content: r.result as string });
                r.readAsDataURL(file);
              }}
              className="sc-admin-input py-1 text-[9px]"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FrameDesignerEditor;
