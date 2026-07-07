import mongoose from 'mongoose';

const TimelineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD or readable string
    photoUrl: { type: String, default: '' },
    photoPublicId: { type: String, default: '' },
    description: { type: String, required: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Timeline = mongoose.model('Timeline', TimelineSchema);
export default Timeline;
