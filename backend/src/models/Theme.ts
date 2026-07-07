import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#FF5C93' }, // Primary Pink
    secondaryColor: { type: String, default: '#FF8FB1' }, // Rose Pink
    accentColor: { type: String, default: '#FF4D88' }, // Accent
    backgroundColor: { type: String, default: '#FFF4F8' }, // Light Blush background
    gradientBackground: { type: String, default: 'linear-gradient(135deg, #FFF4F8 0%, #FFEAF3 50%, #FFD6E7 100%)' },
    fontFamily: { type: String, default: 'Nunito, sans-serif' },
    handwritingFont: { type: String, default: 'Dancing Script, cursive' },
    letterColor: { type: String, default: '#5C3A47' }, // Cursive letter text color
    letterStyle: { type: String, default: 'glassmorphism' },
    buttonStyle: { type: String, default: 'glow' },
    glassBlur: { type: Number, default: 20 }, // px
    borderRadius: { type: Number, default: 24 }, // px
    shadow: { type: String, default: '0 10px 30px 0 rgba(255, 92, 147, 0.08)' },
    animationSpeed: { type: Number, default: 1.0 } // multiplier
  },
  { timestamps: true }
);

export const Theme = mongoose.model('Theme', ThemeSchema);
export default Theme;
