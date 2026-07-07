import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema(
  {
    relationshipStartDate: { type: String, default: '2023-05-20T00:00:00' }, // Anniversary date
    relationshipLabel: { type: String, default: 'Time We Have Been Together' },
    relationshipTitle: { type: String, default: 'Our Love Counter' },
    birthdayDate: { type: String, default: '2000-09-09T00:00:00' }, // Birthday date
    birthdayMessage: { type: String, default: 'Happy Birthday My Queen! You make the world a better place just by being in it. ❤️' },
    birthdayMusicUrl: { type: String, default: '' },
    birthdayMusicPublicId: { type: String, default: '' },
    giftBoxMessage: { type: String, default: 'Surprise! Here is a little virtual token of my appreciation. You deserve all the happiness in the world! 🎁💖' },
    cakeMessage: { type: String, default: 'Make a wish! Blow out the candles and see what happens...' },
    birthdayGallery: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        caption: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

export const Content = mongoose.model('Content', ContentSchema);
export default Content;
