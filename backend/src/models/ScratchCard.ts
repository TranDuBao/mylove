import mongoose from 'mongoose';

// Sub-schemas (using Schema.Types.Mixed for flexibility)
const StickerConfigSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['emoji', 'custom'], default: 'emoji' },
  content: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  rotation: Number,
  opacity: Number,
  zIndex: Number,
  flipX: Boolean,
  flipY: Boolean,
  isLocked: Boolean,
  isHidden: Boolean,
  animation: String,
  shadow: String,
  glowColor: String,
  blur: Number,
  tintColor: String,
  brightness: Number,
  contrast: Number,
  saturation: Number,
  hueRotate: Number,
}, { _id: false });

const CornerDecorationSchema = new mongoose.Schema({
  type: { type: String, enum: ['none', 'emoji', 'custom'], default: 'none' },
  content: { type: String, default: '' },
  size: { type: Number, default: 24 },
}, { _id: false });

const FrameConfigSchema = new mongoose.Schema({
  borderWidth: { type: Number, default: 8 },
  borderStyle: { type: String, default: 'solid' },
  borderColor: { type: String, default: '#ffffff' },
  paperTexture: { type: String, default: 'none' },
  backgroundColor: { type: String, default: 'rgba(255, 255, 255, 0.65)' },
  gradient: String,
  shadow: String,
  glowColor: String,
  blur: Number,
  scale: Number,
  innerPadding: { type: Number, default: 0 },
  outerMargin: { type: Number, default: 0 },
  topLeftCorner: CornerDecorationSchema,
  topRightCorner: CornerDecorationSchema,
  bottomLeftCorner: CornerDecorationSchema,
  bottomRightCorner: CornerDecorationSchema,
  stickers: [StickerConfigSchema],
}, { _id: false });

const ScratchLayerSchema = new mongoose.Schema({
  preset: { type: String, default: 'pink-paper' },
  color: { type: String, default: '#FFB6C1' },
  opacity: { type: Number, default: 1 },
  textureIntensity: { type: Number, default: 0.6 },
  customImageUrl: { type: String, default: '' },
}, { _id: false });

const BrushSchema = new mongoose.Schema({
  size: { type: Number, default: 35 },
  hardness: { type: Number, default: 0.3 },
  feather: { type: Number, default: 0.7 },
  opacity: { type: Number, default: 1 },
  smoothing: { type: Number, default: 0.5 },
}, { _id: false });

const RevealSchema = new mongoose.Schema({
  percentageRequired: { type: Number, default: 60 },
  autoReveal: { type: Boolean, default: false },
  fadeOutDuration: { type: Number, default: 800 },
  scaleAnimation: { type: Boolean, default: true },
  bounceAnimation: { type: Boolean, default: true },
}, { _id: false });

const GalleryImageSchema = new mongoose.Schema({
  url: String,
  caption: String,
}, { _id: false });

const HiddenContentSchema = new mongoose.Schema({
  type: { type: String, default: 'text' },
  textContent: { type: String, default: 'I love you! 💖' },
  textContentEn: String,
  textColor: { type: String, default: '#c0396b' },
  fontFamily: { type: String, default: 'Dancing Script' },
  fontSize: { type: Number, default: 24 },
  imageUrl: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  imageAltEn: String,
  imageMode: { type: String, default: 'fit' },
  videoUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  galleryImages: [GalleryImageSchema],
  countdownDate: { type: String, default: '' },
  countdownLabel: { type: String, default: '' },
  countdownLabelEn: String,
  audioUrl: { type: String, default: '' },
  audioLabel: { type: String, default: '' },
  audioLabelEn: String,
  htmlContent: { type: String, default: '' },
  qrData: { type: String, default: '' },
  qrSize: { type: Number, default: 200 },
  buttonText: { type: String, default: 'Click Me' },
  buttonTextEn: String,
  buttonUrl: { type: String, default: '' },
  buttonColor: { type: String, default: '#FF5C93' },
  backgroundColor: { type: String, default: '#FFF4F8' },
}, { _id: false });

const EffectsSchema = new mongoose.Schema({
  hearts: { type: Boolean, default: true },
  sparkles: { type: Boolean, default: true },
  butterflies: { type: Boolean, default: false },
  sakura: { type: Boolean, default: false },
  confetti: { type: Boolean, default: true },
  fireworks: { type: Boolean, default: false },
  balloons: { type: Boolean, default: false },
  glow: { type: Boolean, default: true },
  cameraShake: { type: Boolean, default: false },
  auroraLight: { type: Boolean, default: false },
  lightSweep: { type: Boolean, default: true },
}, { _id: false });

const SoundSchema = new mongoose.Schema({
  enableScratchSound: { type: Boolean, default: false },
  enableRevealSound: { type: Boolean, default: true },
  enableCelebrationSound: { type: Boolean, default: true },
  volume: { type: Number, default: 0.5 },
}, { _id: false });

const MilestoneSchema = new mongoose.Schema({
  percentage: { type: Number, required: true },
  effect: { type: String, required: true },
}, { _id: false });

// ─── Main ScratchCard Schema ────────────────────────────────────────────

const ScratchCardSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Thẻ Cào Mới' },
    titleEn: { type: String, default: '' },
    emoji: { type: String, default: '💌' },
    description: { type: String, default: 'Cào nhẹ nhàng để khám phá...' },
    descriptionEn: { type: String, default: '' },
    width: { type: Number, default: 320 },
    height: { type: Number, default: 400 },
    borderRadius: { type: Number, default: 20 },
    rotation: { type: Number, default: 0 },
    opacity: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    scratchLayer: { type: ScratchLayerSchema, default: () => ({}) },
    brush: { type: BrushSchema, default: () => ({}) },
    reveal: { type: RevealSchema, default: () => ({}) },
    content: { type: HiddenContentSchema, default: () => ({}) },
    effects: { type: EffectsSchema, default: () => ({}) },
    sound: { type: SoundSchema, default: () => ({}) },
    milestones: { type: [MilestoneSchema], default: () => ([
      { percentage: 10, effect: 'sparkle' },
      { percentage: 25, effect: 'glow' },
      { percentage: 40, effect: 'hearts' },
      { percentage: 60, effect: 'autoReveal' },
      { percentage: 80, effect: 'confetti' },
      { percentage: 100, effect: 'celebration' },
    ]) },
    frameConfig: { type: FrameConfigSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const ScratchCardModel = mongoose.model('ScratchCard', ScratchCardSchema);
export default ScratchCardModel;
