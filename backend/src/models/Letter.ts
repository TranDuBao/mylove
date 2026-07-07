import mongoose from 'mongoose';

const LetterSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'My Love Letter' },
    content: { type: String, required: true },
    font: { type: String, default: 'Sacramento, cursive' },
    color: { type: String, default: '#4A3B32' }, // Soft charcoal/brown handwriting look
    background: { type: String, default: '#FCF8F2' }, // Warm paper shade
    order: { type: Number, default: 0 },
    isSecret: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Letter = mongoose.model('Letter', LetterSchema);
export default Letter;
