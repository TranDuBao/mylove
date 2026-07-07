import mongoose from 'mongoose';

const EffectsSchema = new mongoose.Schema(
  {
    fireworks: { type: Boolean, default: true },
    confetti: { type: Boolean, default: true },
    snow: { type: Boolean, default: false },
    rain: { type: Boolean, default: false },
    stars: { type: Boolean, default: true },
    butterflies: { type: Boolean, default: true },
    flowers: { type: Boolean, default: true }, // Sakura cherry blossoms
    cursorHearts: { type: Boolean, default: true },
    particles: { type: Boolean, default: true }, // Background glowing dots
    glow: { type: Boolean, default: true },
    parallax: { type: Boolean, default: true },
    mouseTrail: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Effects = mongoose.model('Effects', EffectsSchema);
export default Effects;
