export interface Settings {
  _id?: string;
  logo: string;
  loadingText: string[];
  bgMusicUrl: string;
  bgMusicPublicId: string;
  isPwaEnabled: boolean;
  isDarkModeEnabled: boolean;
  isBirthdayCountdownEnabled: boolean;
  isFireworksEnabled: boolean;
  isSecretPageEnabled: boolean;
  secretPagePasscode: string;
  secretPageMessage: string;
  copyrightText: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoFavicon: string;
  seoOgImage: string;
}

export interface Theme {
  _id?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  gradientBackground: string;
  fontFamily: string;
  handwritingFont: string;
  letterColor: string;
  letterStyle: string;
  buttonStyle: string;
  glassBlur: number;
  borderRadius: number;
  shadow: string;
  animationSpeed: number;
}

export interface Effects {
  _id?: string;
  fireworks: boolean;
  confetti: boolean;
  snow: boolean;
  rain: boolean;
  stars: boolean;
  butterflies: boolean;
  flowers: boolean;
  cursorHearts: boolean;
  particles: boolean;
  glow: boolean;
  parallax: boolean;
  mouseTrail: boolean;
}

export interface BirthdayGalleryItem {
  url: string;
  publicId: string;
  caption: string;
}

export interface Content {
  _id?: string;
  relationshipStartDate: string;
  relationshipLabel: string;
  relationshipTitle: string;
  birthdayDate: string;
  birthdayMessage: string;
  birthdayMusicUrl: string;
  birthdayMusicPublicId: string;
  giftBoxMessage: string;
  cakeMessage: string;
  birthdayGallery: BirthdayGalleryItem[];
}


export interface Photo {
  _id: string;
  url: string;
  publicId: string;
  category: string;
  description: string;
  isFavorite: boolean;
  isSecret: boolean;
  order: number;
  createdAt?: string;
}

export interface TimelineEvent {
  _id: string;
  title: string;
  date: string;
  photoUrl: string;
  photoPublicId: string;
  description: string;
  order: number;
  createdAt?: string;
}

export interface Letter {
  _id: string;
  title: string;
  content: string;
  font: string;
  color: string;
  background: string;
  order: number;
  isSecret: boolean;
  createdAt?: string;
}

export interface Song {
  _id: string;
  title: string;
  artist: string;
  url: string;
  publicId: string;
  coverUrl: string;
  coverPublicId: string;
  order: number;
}

export interface Video {
  _id: string;
  title: string;
  url: string;
  publicId: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  order: number;
}

export interface MapMarker {
  _id: string;
  lat: number;
  lng: number;
  title: string;
  date: string;
  description: string;
  photoUrl: string;
  photoPublicId: string;
}

export interface SiteData {
  settings: Settings;
  theme: Theme;
  effects: Effects;
  content: Content;
}

export interface AdminStats {
  visitsCount: number;
  lastVisitedAt: string | null;
  totalPhotos: number;
  totalTimelineEvents: number;
  totalSongs: number;
  totalVideos: number;
  storageUsed: string;
  dbType: string;
}

export interface AdminSession {
  token: string;
  admin: {
    id: string;
    username: string;
  };
}
