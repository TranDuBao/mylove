import mongoose from 'mongoose';

const MusicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, default: 'Unknown Artist' },
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    coverPublicId: { type: String, default: '' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Music = mongoose.model('Music', MusicSchema);
export default Music;
