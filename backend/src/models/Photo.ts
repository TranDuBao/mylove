import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    category: { type: String, default: 'General' },
    description: { type: String, default: '' },
    isFavorite: { type: Boolean, default: false },
    isSecret: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Photo = mongoose.model('Photo', PhotoSchema);
export default Photo;
