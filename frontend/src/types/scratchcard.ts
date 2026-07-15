// ─── Scratch Card Type System ───────────────────────────────────────────

export type ScratchLayerPreset =
  | 'pink-paper'
  | 'cloud-sticker'
  | 'frosted-glass'
  | 'washi-tape'
  | 'watercolor'
  | 'glitter'
  | 'metallic-foil'
  | 'golden-paper'
  | 'heart-sticker'
  | 'gift-wrap'
  | 'pastel-paint'
  | 'magic-dust'
  | 'sakura-petals'
  | 'silver-scratch'
  | 'custom';

export type HiddenContentType =
  | 'text'
  | 'image'
  | 'video'
  | 'gallery'
  | 'countdown'
  | 'audio'
  | 'custom-html'
  | 'youtube'
  | 'qrcode'
  | 'button'
  | 'link';

export type MilestoneEffect =
  | 'sparkle'
  | 'glow'
  | 'hearts'
  | 'confetti'
  | 'autoReveal'
  | 'celebration';

// ─── Sub-Configs ────────────────────────────────────────────────────────

export type PaperTextureType =
  | 'none'
  | 'handmade'
  | 'watercolor'
  | 'kraft'
  | 'vintage'
  | 'notebook'
  | 'glitter'
  | 'metallic'
  | 'fabric'
  | 'linen'
  | 'frosted'
  | 'acrylic'
  | 'pastel';

export interface StickerConfig {
  id: string;
  type: 'emoji' | 'custom';
  content: string; // Emoji character or base64 / external URL
  x: number; // percentage (0-100) relative to frame width
  y: number; // percentage (0-100) relative to frame height
  width: number; // percentage (0-100) relative to frame width
  height?: number; // percentage (optional)
  rotation: number; // degrees
  opacity: number; // 0-1
  zIndex: number;
  flipX: boolean;
  flipY: boolean;
  isLocked: boolean;
  isHidden: boolean;
  animation?: string; // e.g., 'floating', 'bounce', 'swing', 'heartbeat', etc.
  // Filters & Shadows
  shadow?: string;
  glowColor?: string;
  blur?: number;
  tintColor?: string;
  brightness?: number; // e.g. 100
  contrast?: number; // e.g. 100
  saturation?: number; // e.g. 100
  hueRotate?: number; // degrees
}

export interface CornerDecoration {
  type: 'none' | 'emoji' | 'custom';
  content: string;
  size: number;
}

export interface ScrapbookFrameConfig {
  borderWidth: number;
  borderStyle: string; // solid, dashed, dotted, double, groove, ridge, inset, outset, none
  borderColor: string;
  paperTexture: PaperTextureType;
  backgroundColor: string;
  gradient?: string; // custom linear-gradient or radial-gradient
  shadow?: string;
  glowColor?: string;
  blur?: number;
  scale?: number;
  innerPadding: number;
  outerMargin: number;
  
  // Corners
  topLeftCorner?: CornerDecoration;
  topRightCorner?: CornerDecoration;
  bottomLeftCorner?: CornerDecoration;
  bottomRightCorner?: CornerDecoration;

  // Stickers
  stickers: StickerConfig[];
}


export interface ScratchLayerConfig {
  preset: ScratchLayerPreset;
  color: string;
  opacity: number;           // 0–1
  textureIntensity: number;  // 0–1
  customImageUrl: string;    // Data URL or external URL when preset='custom'
}

export interface BrushConfig {
  size: number;       // px radius, 10–80
  hardness: number;   // 0–1 (0=very soft, 1=hard edge)
  feather: number;    // 0–1 feather amount
  opacity: number;    // 0–1
  smoothing: number;  // 0–1 interpolation smoothing factor
}

export interface RevealConfig {
  percentageRequired: number;  // 0–100
  autoReveal: boolean;
  fadeOutDuration: number;     // ms
  scaleAnimation: boolean;
  bounceAnimation: boolean;
}

export interface HiddenContentConfig {
  type: HiddenContentType;
  // Text
  textContent: string;
  textContentEn?: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  // Image
  imageUrl: string;
  imageAlt: string;
  imageAltEn?: string;
  imageMode?: 'fit' | 'cover';
  // Video / YouTube
  videoUrl: string;
  youtubeUrl: string;
  // Gallery
  galleryImages: { url: string; caption: string }[];
  // Countdown
  countdownDate: string;
  countdownLabel: string;
  countdownLabelEn?: string;
  // Audio
  audioUrl: string;
  audioLabel: string;
  audioLabelEn?: string;
  // Custom HTML
  htmlContent: string;
  // QR Code
  qrData: string;
  qrSize: number;
  // Button / Link
  buttonText: string;
  buttonTextEn?: string;
  buttonUrl: string;
  buttonColor: string;
  // Shared style
  backgroundColor: string;
}

export interface ScratchEffectsConfig {
  hearts: boolean;
  sparkles: boolean;
  butterflies: boolean;
  sakura: boolean;
  confetti: boolean;
  fireworks: boolean;
  balloons: boolean;
  glow: boolean;
  cameraShake: boolean;
  auroraLight: boolean;
  lightSweep: boolean;
}

export interface ScratchSoundConfig {
  enableScratchSound: boolean;
  enableRevealSound: boolean;
  enableCelebrationSound: boolean;
  volume: number; // 0–1
}

export interface ProgressMilestone {
  percentage: number;
  effect: MilestoneEffect;
}

// ─── Main Scratch Card Interface ────────────────────────────────────────

export interface ScratchCard {
  id: string;
  title: string;
  titleEn?: string;
  emoji: string;
  description: string;
  descriptionEn?: string;

  // Layout
  width: number;
  height: number;
  borderRadius: number;
  rotation: number;
  opacity: number;
  order: number;
  isVisible: boolean;

  // Configs
  scratchLayer: ScratchLayerConfig;
  brush: BrushConfig;
  reveal: RevealConfig;
  content: HiddenContentConfig;
  effects: ScratchEffectsConfig;
  sound: ScratchSoundConfig;
  milestones: ProgressMilestone[];
  frameConfig?: ScrapbookFrameConfig;
}

// ─── Defaults Factory ───────────────────────────────────────────────────

export const createDefaultScratchLayer = (): ScratchLayerConfig => ({
  preset: 'pink-paper',
  color: '#FFB6C1',
  opacity: 1,
  textureIntensity: 0.6,
  customImageUrl: '',
});

export const createDefaultBrush = (): BrushConfig => ({
  size: 35,
  hardness: 0.3,
  feather: 0.7,
  opacity: 1,
  smoothing: 0.5,
});

export const createDefaultReveal = (): RevealConfig => ({
  percentageRequired: 60,
  autoReveal: false,
  fadeOutDuration: 800,
  scaleAnimation: true,
  bounceAnimation: true,
});

export const createDefaultContent = (): HiddenContentConfig => ({
  type: 'text',
  textContent: 'I love you! 💖',
  textContentEn: 'I love you! 💖',
  textColor: '#c0396b',
  fontFamily: 'Dancing Script',
  fontSize: 24,
  imageUrl: '',
  imageAlt: '',
  imageAltEn: '',
  imageMode: 'fit',
  videoUrl: '',
  youtubeUrl: '',
  galleryImages: [],
  countdownDate: '',
  countdownLabel: '',
  countdownLabelEn: '',
  audioUrl: '',
  audioLabel: '',
  audioLabelEn: '',
  htmlContent: '',
  qrData: '',
  qrSize: 200,
  buttonText: 'Click Me',
  buttonTextEn: 'Click Me',
  buttonUrl: '',
  buttonColor: '#FF5C93',
  backgroundColor: '#FFF4F8',
});

export const createDefaultEffects = (): ScratchEffectsConfig => ({
  hearts: true,
  sparkles: true,
  butterflies: false,
  sakura: false,
  confetti: true,
  fireworks: false,
  balloons: false,
  glow: true,
  cameraShake: false,
  auroraLight: false,
  lightSweep: true,
});

export const createDefaultSound = (): ScratchSoundConfig => ({
  enableScratchSound: false,
  enableRevealSound: true,
  enableCelebrationSound: true,
  volume: 0.5,
});

export const createDefaultMilestones = (): ProgressMilestone[] => [
  { percentage: 10, effect: 'sparkle' },
  { percentage: 25, effect: 'glow' },
  { percentage: 40, effect: 'hearts' },
  { percentage: 60, effect: 'autoReveal' },
  { percentage: 80, effect: 'confetti' },
  { percentage: 100, effect: 'celebration' },
];

export const createDefaultCard = (overrides?: Partial<ScratchCard>): ScratchCard => ({
  id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  title: 'Thẻ Cào Mới',
  titleEn: 'New Scratch Card',
  emoji: '💌',
  description: 'Cào nhẹ nhàng để khám phá...',
  descriptionEn: 'Scratch gently to reveal...',
  width: 320,
  height: 400,
  borderRadius: 20,
  rotation: 0,
  opacity: 1,
  order: 0,
  isVisible: true,
  scratchLayer: createDefaultScratchLayer(),
  brush: createDefaultBrush(),
  reveal: createDefaultReveal(),
  content: createDefaultContent(),
  effects: createDefaultEffects(),
  sound: createDefaultSound(),
  milestones: createDefaultMilestones(),
  frameConfig: createDefaultFrameConfig(),
  ...overrides,
});

export const createDefaultFrameConfig = (): ScrapbookFrameConfig => ({
  borderWidth: 8,
  borderStyle: 'solid',
  borderColor: '#ffffff',
  paperTexture: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  shadow: '0 8px 32px rgba(255, 92, 147, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
  innerPadding: 0,
  outerMargin: 0,
  stickers: [],
});

// ─── Preset Starter Cards ───────────────────────────────────────────────

export const STARTER_CARDS: ScratchCard[] = [
  createDefaultCard({
    id: 'starter_letter',
    title: 'Thư Tình Bí Mật',
    titleEn: 'Secret Love Letter',
    emoji: '💌',
    description: 'Một thông điệp ngọt ngào dành riêng cho em...',
    descriptionEn: 'A sweet message just for you...',
    order: 0,
    scratchLayer: { ...createDefaultScratchLayer(), preset: 'pink-paper', color: '#FFD1DC' },
    content: {
      ...createDefaultContent(),
      type: 'text',
      textContent: 'Mỗi khoảnh khắc bên em đều là một báu vật anh trân trọng sâu sắc. Em làm cho thế giới của anh tươi sáng hơn chỉ bằng cách hiện diện. Anh yêu em nhiều hơn những gì từ ngữ có thể diễn tả. 💕',
      textContentEn: 'Every moment with you is a treasure I hold close to my heart. You make my world brighter just by being in it. I love you more than words can say. 💕',
      fontFamily: 'Dancing Script',
      fontSize: 20,
    },
  }),
  createDefaultCard({
    id: 'starter_photo',
    title: 'Ảnh Kỷ Niệm',
    titleEn: 'Memory Photo',
    emoji: '📷',
    description: 'Một khoảnh khắc đặc biệt đang chờ đón...',
    descriptionEn: 'A special memory awaits...',
    order: 1,
    scratchLayer: { ...createDefaultScratchLayer(), preset: 'frosted-glass', color: '#E8D5E0' },
    content: {
      ...createDefaultContent(),
      type: 'text',
      textContent: '📸 Hãy đăng tải bức ảnh yêu thích của bạn trong trang Admin!',
      textContentEn: '📸 Upload your favorite photo in the admin panel!',
      backgroundColor: '#FFF0F5',
    },
  }),
  createDefaultCard({
    id: 'starter_gift',
    title: 'Món Quà Bí Mật',
    titleEn: 'Surprise Gift',
    emoji: '🎁',
    description: 'Nhận quà của em nào!',
    descriptionEn: 'Open your present!',
    order: 2,
    scratchLayer: { ...createDefaultScratchLayer(), preset: 'golden-paper', color: '#FFD700' },
    content: {
      ...createDefaultContent(),
      type: 'text',
      textContent: 'Chúc mừng sinh nhật tình yêu của anh! 🎂🎉\nEm xứng đáng nhận được tất cả niềm hạnh phúc trên thế gian này!',
      textContentEn: 'Happy Birthday my love! 🎂🎉\nYou deserve all the happiness in the world!',
      fontSize: 22,
    },
    effects: { ...createDefaultEffects(), fireworks: true, balloons: true },
  }),
];
