import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    logo: { type: String, default: 'Love Story' },
    loadingText: { type: [String], default: ['Collecting memories...', 'Polishing stars...', 'Catching cherry blossoms...', 'Connecting hearts...'] },
    bgMusicUrl: { type: String, default: '' },
    bgMusicPublicId: { type: String, default: '' },
    isPwaEnabled: { type: Boolean, default: false },
    isDarkModeEnabled: { type: Boolean, default: true },
    isBirthdayCountdownEnabled: { type: Boolean, default: true },
    isFireworksEnabled: { type: Boolean, default: true },
    isSecretPageEnabled: { type: Boolean, default: true },
    secretPagePasscode: { type: String, default: '520131' }, // default 6-digit passcode
    secretPageMessage: { type: String, default: 'You found my secret archive! Here are some of our most personal moments.' },
    copyrightText: { type: String, default: 'Made with ❤️ for you forever' },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    seoTitle: { type: String, default: 'For My Love ❤️' },
    seoDescription: { type: String, default: 'A digital treasury of our love and memories.' },
    seoKeywords: { type: String, default: 'love, relationship, memories, gift, birthday' },
    seoFavicon: { type: String, default: '' },
    seoOgImage: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;
