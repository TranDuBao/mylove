import mongoose from 'mongoose';

const MapMarkerSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    title: { type: String, required: true },
    date: { type: String, default: '' },
    description: { type: String, required: true },
    photoUrl: { type: String, default: '' },
    photoPublicId: { type: String, default: '' }
  },
  { timestamps: true }
);

export const MapMarker = mongoose.model('MapMarker', MapMarkerSchema);
export default MapMarker;
