import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    thumbnailPublicId: { type: String, default: '' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Video = mongoose.model('Video', VideoSchema);
export default Video;
