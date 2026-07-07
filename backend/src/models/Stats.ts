import mongoose from 'mongoose';

const StatsSchema = new mongoose.Schema(
  {
    visitsCount: { type: Number, default: 0 },
    lastVisitedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Stats = mongoose.model('Stats', StatsSchema);
export default Stats;
