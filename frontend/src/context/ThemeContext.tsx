import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SiteData, Theme, Effects, Settings, Content } from '../types/index.js';
import { api } from '../utils/api.js';

const translations: { [key: string]: { [key: string]: string } } = {
  vi: {
    home: 'Trang Chủ',
    archive: 'Lưu Trữ',
    cms: 'Quản Trị',
    loveCounterTitle: 'Hành Trình Yêu Thương',
    loveCounterSub: 'Mỗi giây bên em đều là một món quà',
    years: 'Năm',
    months: 'Tháng',
    days: 'Ngày',
    hours: 'Giờ',
    minutes: 'Phút',
    seconds: 'Giây',
    bdayTitle: 'Đếm Ngược Sinh Nhật',
    bdaySub: 'Đếm ngược đến ngày đặc biệt nhất trong năm',
    makeWish: 'Ước Một Điều Ước',
    blowCandles: 'Thổi Nến',
    useMic: 'Sử Dụng Mic',
    listeningBlow: 'Đang nghe tiếng thổi...',
    wishGranted: 'Điều Ước Đã Được Ghi Nhận!',
    thankYou: 'Cảm Ơn Anh ❤️',
    loveLetters: 'Thư Tình',
    loveLettersSub: 'Viết từ tận đáy lòng anh',
    clickOpenEnv: 'Nhấn để mở thư',
    closeLetter: 'Đóng thư',
    surpriseTitle: 'Một Món Quà Bất Ngờ',
    surpriseSub: 'Nhấp vào hộp quà để mở điều bất ngờ',
    yourGift: 'Món Quà Của Em',
    closeBox: 'Đóng Hộp',
    loveMap: 'Bản Đồ Tình Yêu',
    loveMapSub: 'Những nơi chúng ta đã cùng nhau đi qua',
    memoryAlbum: 'Album Kỷ Niệm',
    memoryAlbumSub: 'Lưu giữ những khoảnh khắc đẹp đẽ mãi mãi',
    starredHighlights: 'Điểm Nhấn Nổi Bật',
    favoritesOnly: 'Chỉ Yêu Thích',
    loveStory: 'Câu Chuyện Tình Yêu',
    loveStorySub: 'Những cột mốc trên hành trình của chúng ta',
    secretTitle: 'Góc Nhỏ Bí Mật',
    secretSub: 'Nhập mật mã 6 số để vào tủ khóa riêng tư',
    unlockArchive: 'Mở Khóa',
    clear: 'Xóa Hết',
    delete: 'Xóa',
    incorrectPasscode: 'Mật mã không chính xác!',
    vaultUnlocked: 'Tủ Khóa Riêng Tư Đã Được Mở 🔒💖',
    secretStars: 'Những Kỷ Niệm Ngọt Ngào',
    lockVault: 'Khóa Tủ',
    enterStory: 'Bước Vào Câu Chuyện',
    // CMS Sidebar & Overview
    cmsDashboard: 'Bảng Điều Khiển',
    cmsPhotos: 'Thư Viện Ảnh',
    cmsMilestones: 'Mốc Kỷ Niệm',
    cmsLetters: 'Thư Tình',
    cmsArchive: 'Quản lý Archive 🔒',
    cmsMusic: 'Nhạc Nền',
    cmsMap: 'Bản Đồ',
    cmsTheme: 'Giao Diện',
    cmsSettings: 'Hiệu Ứng & Cài Đặt',
    cmsLogout: 'Đăng Xuất',
    cmsOverview: 'Tổng Quan Hệ Thống',
    cmsVisits: 'Lượt Truy Cập',
    cmsTotalPhotos: 'Số Lượng Ảnh',
    cmsTotalEvents: 'Mốc Kỷ Niệm',
    cmsStorage: 'Dung Lượng Tệp',
    cmsDbProfile: 'Cơ Sở Dữ Liệu',
    cmsDbMode: 'Chế độ hoạt động',
    cmsDbInfo: 'Nếu kết nối MongoDB bị ngắt, hệ thống sẽ tự động chuyển sang lưu trữ nội bộ file local_db.json.',
    // CMS Photos Form
    cmsUploadPhotos: 'Tải Lên Ảnh Kỷ Niệm',
    cmsFileInput: 'Chọn Tệp Ảnh',
    cmsCategory: 'Danh Mục',
    cmsCaption: 'Mô Tả Ảnh',
    cmsPinHighlight: 'Ghim vào danh mục nổi bật (Favorites)',
    cmsUploadBtn: 'Tải Lên',
    cmsExistingPhotos: 'Danh Sách Ảnh Hiện Tại',
    // CMS Milestones Form
    cmsAddMilestone: 'Thêm Cột Mốc Kỷ Niệm',
    cmsEventTitle: 'Tiêu Đề Sự Kiện',
    cmsEventDate: 'Ngày Diễn Ra',
    cmsEventDesc: 'Mô Tả Sự Kiện',
    cmsEventFile: 'Ảnh Sự Kiện',
    cmsExistingEvents: 'Danh Sách Cột Mốc Hiện Tại',
    // CMS Love Letters Form
    cmsComposeLetter: 'Soạn Thư Tình',
    cmsLetterTitle: 'Tiêu Đề Thư',
    cmsLetterFont: 'Phông Chữ Viết Tay',
    cmsLetterBg: 'Màu Nền Giấy',
    cmsLetterColor: 'Màu Chữ Viết Tay',
    cmsLetterBody: 'Nội Dung Thư',
    cmsSaveLetterBtn: 'Lưu Thư Tình',
    cmsExistingLetters: 'Danh Sách Thư Tình Hiện Tại',
    archiveVaultTitle: 'Quản Lý Kho Lưu Trữ (Archive Vault)',
    archiveVaultDesc: 'Đây là nơi bạn quản lý các hình ảnh và thư tình bí mật. Những nội dung ở đây sẽ ẩn hoàn toàn khỏi trang chủ và chỉ xuất hiện trong trang bảo mật Secret Page (/secret) sau khi mở khóa.',
    secretLettersTitle: 'Thư Tình Bí Mật',
    secretPhotosTitle: 'Hình Ảnh Bí Mật',
    releaseToHome: 'Cho ra Trang Chủ 🔓',
    noSecretLetters: 'Không có thư tình bí mật nào trong kho lưu trữ.',
    composeNewSecretLetter: 'Soạn thư bí mật mới ✍️',
    noSecretPhotos: 'Không có hình ảnh bí mật nào trong kho lưu trữ.',
    uploadNewSecretPhoto: 'Upload ảnh bí mật mới 📸',
    // CMS Settings & Visual Particles Form
    settingsVisualSwitches: 'Kích Hoạt Hiệu Ứng Bay Lượn (Visual Effects)',
    settingsAnniversaryTitle: 'Thông Tin Ngày Kỷ Niệm & Đếm Ngược',
    settingsAnniversaryStart: 'Ngày Bắt Đầu Yêu Nhau (Anniversary Start Date)',
    settingsBirthdayDate: 'Ngày Sinh Nhật Bạn Gái (Girlfriend\'s Birthday)',
    settingsEnableCountdown: 'Bật Đồng Hồ Đếm Ngược Sinh Nhật',
    settingsEnableSecretPage: 'Bật Trang Bảo Mật Khóa (Secret Lock Page)',
    settingsSecretPasscode: 'Mật Mã Mở Khóa Tủ Mật (6 chữ số)',
    settingsCakeBlowMsg: 'Lời Nhắn Nhở Khi Thổi Nến Bánh Kem',
    settingsGiftBoxMsg: 'Lời Chúc Khi Mở Hộp Quà Bất Ngờ',
    settingsSaveBtn: 'Lưu Cấu Hình Cài Đặt ⚙️',
    effect_flowers: '🌸 Cánh hoa anh đào rơi',
    effect_stars: '✨ Bầu trời sao lấp lánh',
    effect_snow: '❄️ Hiệu ứng tuyết rơi',
    effect_rain: '🌧️ Hiệu ứng mưa rơi',
    effect_cursorHearts: '💖 Vệt trái tim theo chuột',
    effect_particles: '🧚 Đom đóm bay nền',
    scratchTitle: 'Cào Để Khám Phá',
    scratchSub: 'Cào nhẹ nhàng để khám phá những điều bất ngờ ẩn giấu',
    cmsScratchCards: 'Scratch Cards',
    // Scratch Cards Admin
    scAdminTitle: 'Quản lý Thẻ Cào',
    scAdminAddCard: 'Thêm Thẻ Cào',
    scSectionGeneral: 'Thông tin chung',
    scSectionLayout: 'Kích thước & Bố cục',
    scSectionFrame: 'Khung viền & Nhãn dán',
    scSectionLayer: 'Lớp phủ cào',
    scSectionBrush: 'Cọ vẽ cào',
    scSectionReveal: 'Cài đặt lật mở',
    scSectionContent: 'Nội dung ẩn giấu',
    scSectionEffects: 'Hiệu ứng ăn mừng',
    scSectionSound: 'Âm thanh cào',
    scSectionMilestones: 'Mốc tiến trình cào',
    scLabelTitleVi: 'Tiêu đề (Tiếng Việt)',
    scLabelTitleEn: 'Tiêu đề (Tiếng Anh)',
    scLabelDescVi: 'Mô tả (Tiếng Việt)',
    scLabelDescEn: 'Mô tả (Tiếng Anh)',
    scLabelVisible: 'Hiển thị',
    scLabelWidth: 'Chiều rộng (px)',
    scLabelHeight: 'Chiều cao (px)',
    scLabelRadius: 'Bo góc (Radius)',
    scLabelRotation: 'Góc xoay (°)',
    scLabelOpacity: 'Độ mờ (Opacity)',
    scLabelPreset: 'Mẫu lớp phủ',
    scLabelLayerColor: 'Màu sắc lớp phủ',
    scLabelLayerOpacity: 'Độ mờ lớp phủ',
    scLabelTextureIntensity: 'Cường độ hoa văn',
    scLabelCustomOverlay: 'Ảnh phủ tùy chỉnh',
    scLabelBrushSize: 'Kích thước cọ',
    scLabelBrushHardness: 'Độ cứng đầu cọ',
    scLabelBrushFeather: 'Độ mềm rìa cọ',
    scLabelBrushOpacity: 'Độ đậm nét cọ',
    scLabelBrushSmoothing: 'Độ mượt nét vẽ',
    scLabelRevealPercent: 'Phần trăm cào xong để mở',
    scLabelAutoReveal: 'Tự động mở khi cào đủ',
    scLabelFadeDuration: 'Thời gian mờ dần (ms)',
    scLabelScaleAnim: 'Hiệu ứng co giãn',
    scLabelBounceAnim: 'Hiệu ứng nhún nhảy',
    scLabelContentType: 'Loại nội dung ẩn',
    scLabelBgColor: 'Màu nền nội dung',
    scLabelMessageVi: 'Lời nhắn (Tiếng Việt)',
    scLabelMessageEn: 'Lời nhắn (Tiếng Anh)',
    scLabelFont: 'Phông chữ viết tay',
    scLabelTextColor: 'Màu sắc chữ',
    scLabelFontSize: 'Kích thước chữ',
    scLabelImageUrl: 'Đường dẫn ảnh (URL)',
    scLabelImageUpload: 'Hoặc tải ảnh lên',
    scLabelImageCover: 'Hình phủ tràn viền (Cover)',
    scLabelVideoUrl: 'Đường dẫn video (.mp4)',
    scLabelYoutubeUrl: 'Đường dẫn YouTube',
    scLabelTargetDate: 'Ngày kỷ niệm đếm ngược',
    scLabelCountdownLabelVi: 'Nhãn đếm ngược (Tiếng Việt)',
    scLabelCountdownLabelEn: 'Nhãn đếm ngược (Tiếng Anh)',
    scLabelAudioUrl: 'Đường dẫn nhạc (.mp3)',
    scLabelAudioLabelVi: 'Tên bài hát (Tiếng Việt)',
    scLabelAudioLabelEn: 'Tên bài hát (Tiếng Anh)',
    scLabelHtml: 'Mã HTML tùy biến',
    scLabelQrData: 'Dữ liệu mã QR / URL',
    scLabelQrSize: 'Kích thước mã QR',
    scLabelBtnTextVi: 'Chữ trên nút (Tiếng Việt)',
    scLabelBtnTextEn: 'Chữ trên nút (Tiếng Anh)',
    scLabelBtnUrl: 'Đường dẫn nút (URL)',
    scLabelBtnColor: 'Màu sắc nút',
  },
  en: {
    home: 'Home',
    archive: 'Archive',
    cms: 'CMS',
    loveCounterTitle: 'Our Love Journey',
    loveCounterSub: 'Every second with you is a blessing',
    years: 'Years',
    months: 'Months',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    bdayTitle: 'Birthday Countdown',
    bdaySub: 'Counting down to the most special day of the year',
    makeWish: 'Make a Wish',
    blowCandles: 'Blow Candles',
    useMic: 'Use Microphone',
    listeningBlow: 'Listening for blow...',
    wishGranted: 'Wish Granted!',
    thankYou: 'Thank You ❤️',
    loveLetters: 'Love Letters',
    loveLettersSub: 'Composed from the bottom of my heart',
    clickOpenEnv: 'Click to Open Envelope',
    closeLetter: 'Close Letter',
    surpriseTitle: 'A Surprise For You',
    surpriseSub: 'Click the gift box to open your present',
    yourGift: 'Your Gift',
    closeBox: 'Close Box',
    loveMap: 'Our Love Map',
    loveMapSub: 'Every place we made a memory together',
    memoryAlbum: 'Our Memory Album',
    memoryAlbumSub: 'Capturing our beautiful moments forever',
    starredHighlights: 'Starred Highlights',
    favoritesOnly: 'Favorites Only',
    loveStory: 'Our Love Story',
    loveStorySub: 'Milestones of our beautiful journey',
    secretTitle: 'Secret Archive',
    secretSub: 'Enter the 6-digit passcode to unlock private vault',
    unlockArchive: 'Unlock Archive',
    clear: 'Clear',
    delete: 'Delete',
    incorrectPasscode: 'Incorrect passcode key!',
    vaultUnlocked: 'Private Vault Unlocked 🔒💖',
    secretStars: 'Our Sweet Memories',
    lockVault: 'Lock Vault',
    enterStory: 'Enter Our Story',
    // CMS Sidebar & Overview
    cmsDashboard: 'Dashboard',
    cmsPhotos: 'Album Gallery',
    cmsMilestones: 'Milestones',
    cmsLetters: 'Love Letters',
    cmsArchive: 'Archive Vault 🔒',
    cmsMusic: 'Playlists & Audio',
    cmsMap: 'Memory Map',
    cmsTheme: 'Theme Builder',
    cmsSettings: 'Effects & SEO',
    cmsLogout: 'Log Out',
    cmsOverview: 'Dashboard Overview',
    cmsVisits: 'Visits Count',
    cmsTotalPhotos: 'Saved Photos',
    cmsTotalEvents: 'Timeline Milestones',
    cmsStorage: 'Local Files Volume',
    cmsDbProfile: 'Database Profile',
    cmsDbMode: 'Database mode',
    cmsDbInfo: 'If connection to MongoDB is down, the system transparently persists updates to local_db.json.',
    // CMS Photos Form
    cmsUploadPhotos: 'Upload Memory Photos',
    cmsFileInput: 'File Input',
    cmsCategory: 'Category',
    cmsCaption: 'Caption Description',
    cmsPinHighlight: 'Pin to Highlight Starred Slides (Favorites)',
    cmsUploadBtn: 'Upload',
    cmsExistingPhotos: 'Existing Album Photos',
    // CMS Milestones Form
    cmsAddMilestone: 'Add Memory Milestone',
    cmsEventTitle: 'Event Title',
    cmsEventDate: 'Date of Event',
    cmsEventDesc: 'Event Description',
    cmsEventFile: 'Event Image File',
    cmsExistingEvents: 'Existing Milestones List',
    // CMS Love Letters Form
    cmsComposeLetter: 'Compose Love Letter',
    cmsLetterTitle: 'Letter Title',
    cmsLetterFont: 'Cursive Handwriting Font',
    cmsLetterBg: 'Letter Paper Background Color',
    cmsLetterColor: 'Letter Text Handwriting Color',
    cmsLetterBody: 'Letter Body Content',
    cmsSaveLetterBtn: 'Save Letter',
    cmsExistingLetters: 'Existing Letters List',
    archiveVaultTitle: 'Manage Archive Vault',
    archiveVaultDesc: 'This is where you manage your secret photos and love letters. Content here is completely hidden from the home page and only appears in the Secret Page (/secret) after unlocking.',
    secretLettersTitle: 'Secret Love Letters',
    secretPhotosTitle: 'Secret Memory Photos',
    releaseToHome: 'Release to Home 🔓',
    noSecretLetters: 'No secret love letters in the archive.',
    composeNewSecretLetter: 'Compose New Secret Letter ✍️',
    noSecretPhotos: 'No secret photos in the archive.',
    uploadNewSecretPhoto: 'Upload New Secret Photo 📸',
    // CMS Settings & Visual Particles Form
    settingsVisualSwitches: 'Visual Particles Switches',
    settingsAnniversaryTitle: 'Relationship Anniversary Start Date & Countdown Settings',
    settingsAnniversaryStart: 'Relationship Anniversary Start Date',
    settingsBirthdayDate: 'Girlfriend\'s Birthday Date',
    settingsEnableCountdown: 'Enable Birthday Countdown',
    settingsEnableSecretPage: 'Enable Secret Lock Page',
    settingsSecretPasscode: 'Secret Page Unlock Passcode (6 digits)',
    settingsCakeBlowMsg: 'Cake Blow Message',
    settingsGiftBoxMsg: 'Gift Surprise Box Reveal Card Text',
    settingsSaveBtn: 'Save Settings & Effects ⚙️',
    effect_flowers: '🌸 Sakura Petals',
    effect_stars: '✨ Stars Backdrop',
    effect_snow: '❄️ Snowflakes',
    effect_rain: '🌧️ Raindrops',
    effect_cursorHearts: '💖 Mouse Hearts Trail',
    effect_particles: '🧚 Background Fireflies',
    scratchTitle: 'Scratch to Reveal',
    scratchSub: 'Scratch gently to uncover hidden surprises',
    cmsScratchCards: 'Scratch Cards',
    // Scratch Cards Admin
    scAdminTitle: 'Scratch Card Manager',
    scAdminAddCard: 'Add Card',
    scSectionGeneral: 'General Info',
    scSectionLayout: 'Layout & Size',
    scSectionFrame: 'Scrapbook Frame & Stickers',
    scSectionLayer: 'Scratch Layer',
    scSectionBrush: 'Brush Settings',
    scSectionReveal: 'Reveal Settings',
    scSectionContent: 'Hidden Content',
    scSectionEffects: 'Celebration Effects',
    scSectionSound: 'Scratch Sound',
    scSectionMilestones: 'Progress Milestones',
    scLabelTitleVi: 'Title (Vietnamese)',
    scLabelTitleEn: 'Title (English)',
    scLabelDescVi: 'Description (Vietnamese)',
    scLabelDescEn: 'Description (English)',
    scLabelVisible: 'Visible',
    scLabelWidth: 'Width (px)',
    scLabelHeight: 'Height (px)',
    scLabelRadius: 'Border Radius',
    scLabelRotation: 'Rotation (°)',
    scLabelOpacity: 'Opacity',
    scLabelPreset: 'Layer Preset',
    scLabelLayerColor: 'Layer Color',
    scLabelLayerOpacity: 'Layer Opacity',
    scLabelTextureIntensity: 'Texture Intensity',
    scLabelCustomOverlay: 'Custom Overlay Image',
    scLabelBrushSize: 'Brush Size',
    scLabelBrushHardness: 'Hardness',
    scLabelBrushFeather: 'Feather',
    scLabelBrushOpacity: 'Opacity',
    scLabelBrushSmoothing: 'Smoothing',
    scLabelRevealPercent: 'Reveal Percentage',
    scLabelAutoReveal: 'Auto Reveal',
    scLabelFadeDuration: 'Fade Duration',
    scLabelScaleAnim: 'Scale Animation',
    scLabelBounceAnim: 'Bounce Animation',
    scLabelContentType: 'Content Type',
    scLabelBgColor: 'Background Color',
    scLabelMessageVi: 'Message (Vietnamese)',
    scLabelMessageEn: 'Message (English)',
    scLabelFont: 'Font Family',
    scLabelTextColor: 'Text Color',
    scLabelFontSize: 'Font Size',
    scLabelImageUrl: 'Image URL',
    scLabelImageUpload: 'Or Upload Image',
    scLabelImageCover: 'Tràn viền / Full Frame (Cover)',
    scLabelVideoUrl: 'Video URL (mp4)',
    scLabelYoutubeUrl: 'YouTube URL',
    scLabelTargetDate: 'Target Date',
    scLabelCountdownLabelVi: 'Label (Vietnamese)',
    scLabelCountdownLabelEn: 'Label (English)',
    scLabelAudioUrl: 'Audio URL',
    scLabelAudioLabelVi: 'Label (Vietnamese)',
    scLabelAudioLabelEn: 'Label (English)',
    scLabelHtml: 'HTML Content',
    scLabelQrData: 'QR Data / URL',
    scLabelQrSize: 'QR Size',
    scLabelBtnTextVi: 'Button Text (Vietnamese)',
    scLabelBtnTextEn: 'Button Text (English)',
    scLabelBtnUrl: 'Button URL',
    scLabelBtnColor: 'Button Color',
  }
};

interface ThemeContextProps {
  settings: Settings | null;
  theme: Theme | null;
  effects: Effects | null;
  content: Content | null;
  isLoading: boolean;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  t: (key: string) => string;
  refreshData: () => Promise<void>;
  updateLiveTheme: (tempTheme: Partial<Theme>) => void;
  updateLiveEffects: (tempEffects: Partial<Effects>) => void;
  updateLiveContent: (tempContent: Partial<Content>) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [effects, setEffects] = useState<Effects | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<'vi' | 'en'>((localStorage.getItem('love_lang') as 'vi' | 'en') || 'vi');

  const setLanguage = (lang: 'vi' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('love_lang', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations['en'];
    return dict[key] || key;
  };

  // Load site config from backend
  const loadData = async (isFirstLoad = false) => {
    try {
      const data = await api.getSiteData();
      setSettings(data.settings);
      setTheme(data.theme);
      setEffects(data.effects);
      setContent(data.content);

      // Inject CSS variables
      applyThemeVariables(data.theme);

      // Increment visits if it's first load in this browser session
      if (isFirstLoad && !sessionStorage.getItem('love_visited')) {
        sessionStorage.setItem('love_visited', 'true');
        await api.logVisit();
      }
    } catch (e) {
      console.error('Failed to load theme configuration:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeVariables = (t: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', t.primaryColor);
    root.style.setProperty('--secondary-color', t.secondaryColor);
    root.style.setProperty('--accent-color', t.accentColor);
    root.style.setProperty('--background-color', t.backgroundColor);
    root.style.setProperty('--gradient-background', t.gradientBackground);
    root.style.setProperty('--handwriting-font', t.handwritingFont);
    root.style.setProperty('--glass-blur', `${t.glassBlur}px`);
    root.style.setProperty('--border-radius', `${t.borderRadius}px`);
    root.style.setProperty('--animation-speed', `${t.animationSpeed}s`);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 117, 151';
    };
    root.style.setProperty('--shadow-color', `rgba(${hexToRgb(t.primaryColor)}, 0.15)`);
  };

  // Instant local overrides for Admin Builder live previews
  const updateLiveTheme = (tempTheme: Partial<Theme>) => {
    setTheme(prev => {
      if (!prev) return null;
      const merged = { ...prev, ...tempTheme };
      applyThemeVariables(merged);
      return merged;
    });
  };

  const updateLiveEffects = (tempEffects: Partial<Effects>) => {
    setEffects(prev => (prev ? { ...prev, ...tempEffects } : null));
  };

  const updateLiveContent = (tempContent: Partial<Content>) => {
    setContent(prev => (prev ? { ...prev, ...tempContent } : null));
  };

  useEffect(() => {
    loadData(true);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        theme,
        effects,
        content,
        isLoading,
        language,
        setLanguage,
        t,
        refreshData: () => loadData(false),
        updateLiveTheme,
        updateLiveEffects,
        updateLiveContent
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
