import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../context/ThemeContext.js';
import { api } from '../utils/api.js';
import type { Photo, TimelineEvent, Letter, Song, Video, MapMarker, AdminStats } from '../types/index.js';
import { 
  LayoutDashboard, Image as ImageIcon, Calendar, BookOpen, Music, MapPin, 
  Paintbrush, Settings as SettingsIcon, LogOut, Loader2, ArrowUp, ArrowDown, Plus, Trash2, Edit3, Heart, Save, Eye, Info, Lock, RefreshCw
} from 'lucide-react';

// ── QR Code Generator Tab ──
const QrCodeTab: React.FC<{ showAlert: (msg: string, type?: 'success'|'error'|'info') => void }> = ({ showAlert }) => {
  const [qrUrl, setQrUrl] = useState(window.location.origin);
  const [qrSize, setQrSize] = useState(300);
  const [qrFg, setQrFg] = useState('#c0396b');
  const [qrBg, setQrBg] = useState('#ffffff');
  const [qrLabel, setQrLabel] = useState('Love Story 💕');
  const [qrFormat, setQrFormat] = useState<'png' | 'svg'>('png');

  const fgHex = qrFg.replace('#', '');
  const bgHex = qrBg.replace('#', '');
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrUrl)}&color=${fgHex}&bgcolor=${bgHex}&format=${qrFormat}&margin=15&qzone=1`;

  const handleDownload = async () => {
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-love-${Date.now()}.${qrFormat}`;
      a.click();
    } catch {
      showAlert('Không thể tải QR. Hãy nhấp chuột phải vào ảnh để lưu!', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
        📱 Tạo Mã QR Chia Sẻ Trang
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Controls */}
        <div className="space-y-5">

          {/* URL Input */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3">
            <h4 className="text-xs font-bold text-text/80 uppercase tracking-wide">🔗 Đường dẫn trang web</h4>
            <input
              type="url"
              value={qrUrl}
              onChange={e => setQrUrl(e.target.value)}
              placeholder="https://your-love-story.com"
              className="w-full px-3 py-2 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-sm outline-none font-mono"
            />
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => setQrUrl(window.location.origin)}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
                🏠 Trang chủ
              </button>
              <button type="button" onClick={() => setQrUrl(`${window.location.origin}/secret`)}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
                🔒 Archive bí mật
              </button>
              <button type="button" onClick={() => setQrUrl(window.location.href)}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
                📍 Trang hiện tại
              </button>
            </div>
          </div>

          {/* Size + Format */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3">
            <h4 className="text-xs font-bold text-text/80 uppercase tracking-wide">✂️ Kích thước & Định dạng</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Kích thước (px)</label>
                <select value={qrSize} onChange={e => setQrSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-primary/20 text-text text-xs outline-none">
                  <option value={150}>150 × 150 (Nhỏ)</option>
                  <option value={250}>250 × 250 (Trung bình)</option>
                  <option value={300}>300 × 300 (Lớn)</option>
                  <option value={500}>500 × 500 (Rất lớn)</option>
                  <option value={800}>800 × 800 (In ấn)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Định dạng file</label>
                <select value={qrFormat} onChange={e => setQrFormat(e.target.value as 'png' | 'svg')}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-primary/20 text-text text-xs outline-none">
                  <option value="png">PNG (ảnh thường)</option>
                  <option value="svg">SVG (vector, sắc nét)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3">
            <h4 className="text-xs font-bold text-text/80 uppercase tracking-wide">🎨 Màu sắc</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Màu QR (nội dung)</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={qrFg} onChange={e => setQrFg(e.target.value)}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-primary/20 p-0.5 bg-white flex-shrink-0" />
                  <input type="text" value={qrFg} onChange={e => setQrFg(e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-white border border-primary/20 text-text text-xs outline-none font-mono" />
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {['#c0396b','#000000','#1a1a2e','#2d6a4f','#e63946','#6c3483'].map(c => (
                    <button key={c} type="button" onClick={() => setQrFg(c)}
                      className="w-6 h-6 rounded-full border-2 transition-all cursor-pointer hover:scale-110"
                      style={{ backgroundColor: c, borderColor: qrFg === c ? '#FF5C93' : '#eee' }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Màu nền</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={qrBg} onChange={e => setQrBg(e.target.value)}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-primary/20 p-0.5 bg-white flex-shrink-0" />
                  <input type="text" value={qrBg} onChange={e => setQrBg(e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-white border border-primary/20 text-text text-xs outline-none font-mono" />
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {['#ffffff','#fdf6fb','#fce4ec','#fff8e1','#f3e5f5','#e8f5e9'].map(c => (
                    <button key={c} type="button" onClick={() => setQrBg(c)}
                      className="w-6 h-6 rounded-full border-2 transition-all cursor-pointer hover:scale-110"
                      style={{ backgroundColor: c, borderColor: qrBg === c ? '#FF5C93' : '#eee' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1.5">💬 Nhãn hiển thị dưới mã QR</label>
            <input type="text" value={qrLabel} onChange={e => setQrLabel(e.target.value)}
              placeholder="Love Story 💕"
              className="w-full px-3 py-2 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-sm outline-none" />
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 shadow-inner flex flex-col items-center gap-3 w-full">
            <p className="text-[10px] text-text/50 uppercase font-bold tracking-wider">Xem trước</p>
            <img
              key={qrSrc}
              src={qrSrc}
              alt="QR Code"
              width={Math.min(qrSize, 280)}
              height={Math.min(qrSize, 280)}
              className="rounded-xl shadow-lg border border-primary/10"
              style={{ background: qrBg }}
            />
            {qrLabel && (
              <p className="text-sm font-semibold text-text/80 text-center">{qrLabel}</p>
            )}
            <p className="text-[9px] text-text/40 font-mono text-center max-w-[220px] break-all">{qrUrl}</p>
          </div>

          {/* Download & Copy buttons */}
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            <button type="button" onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-full font-bold text-sm shadow-md transition-all cursor-pointer">
              <Save size={16} /> Tải xuống QR ({qrFormat.toUpperCase()})
            </button>
            <button type="button"
              onClick={() => { navigator.clipboard.writeText(qrUrl); showAlert('Đã sao chép đường dẫn! 📋'); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-primary/20 text-text rounded-full font-semibold text-sm hover:bg-primary/5 transition-all cursor-pointer">
              📋 Sao chép đường dẫn
            </button>
            <a href={qrSrc} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-primary/20 text-text rounded-full font-semibold text-sm hover:bg-primary/5 transition-all cursor-pointer text-center">
              🔗 Mở ảnh QR (full size)
            </a>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-[280px]">
            <p className="text-xs text-amber-700 font-semibold">💡 Mẹo sử dụng</p>
            <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">
              Chia sẻ mã QR cho người ấy quét bằng camera điện thoại để mở ngay trang Love Story của bạn. Có thể in ra giấy hoặc tạo thiệp kỷ niệm!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { settings, theme, effects, content, t, refreshData, updateLiveTheme, updateLiveEffects, updateLiveContent } = useThemeContext();
  const [token, setToken] = useState<string | null>(localStorage.getItem('love_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // CMS Tabs State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'photos' | 'timeline' | 'letters' | 'archive' | 'music' | 'videos' | 'map' | 'theme' | 'settings' | 'qr'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Content Lists
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  // Form states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCat, setPhotoCat] = useState('General');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoFav, setPhotoFav] = useState(false);
  const [photoSecret, setPhotoSecret] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  // Photo edit mode
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editPhotoDesc, setEditPhotoDesc] = useState('');
  const [editPhotoCat, setEditPhotoCat] = useState('');
  const [editPhotoFav, setEditPhotoFav] = useState(false);
  const [editPhotoSecret, setEditPhotoSecret] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const startEditPhoto = (photo: Photo) => {
    setEditingPhotoId(photo._id);
    setEditPhotoDesc(photo.description || '');
    setEditPhotoCat(photo.category || 'General');
    setEditPhotoFav(!!photo.isFavorite);
    setEditPhotoSecret(!!photo.isSecret);
  };
  const cancelEditPhoto = () => setEditingPhotoId(null);
  const handlePhotoUpdate = async (id: string) => {
    setIsSavingPhoto(true);
    try {
      await api.updatePhoto(id, { description: editPhotoDesc, category: editPhotoCat, isFavorite: editPhotoFav, isSecret: editPhotoSecret });
      cancelEditPhoto();
      loadAllContent();
      showAlert('Đã cập nhật ảnh thành công! ✨');
    } catch (e: any) {
      showAlert(`Lỗi: ${e.message}`, 'error');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Timeline Event Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventFile, setEventFile] = useState<File | null>(null);
  const [isUploadingEvent, setIsUploadingEvent] = useState(false);
  // Timeline edit mode
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventDesc, setEditEventDesc] = useState('');
  const [editEventFile, setEditEventFile] = useState<File | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const startEditEvent = (ev: TimelineEvent) => {
    setEditingEventId(ev._id);
    setEditEventTitle(ev.title);
    setEditEventDate(ev.date ? ev.date.substring(0, 10) : '');
    setEditEventDesc(ev.description || '');
    setEditEventFile(null);
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEditEventTitle('');
    setEditEventDate('');
    setEditEventDesc('');
    setEditEventFile(null);
  };

  const handleTimelineUpdate = async (id: string) => {
    if (!editEventTitle || !editEventDate || !editEventDesc) return;
    setIsSavingEvent(true);
    const fd = new FormData();
    fd.append('title', editEventTitle);
    fd.append('date', editEventDate);
    fd.append('description', editEventDesc);
    if (editEventFile) fd.append('photo', editEventFile);
    try {
      await api.updateTimelineEvent(id, fd);
      cancelEditEvent();
      loadAllContent();
      showAlert('Đã cập nhật mốc kỷ niệm thành công! ✨');
    } catch (e: any) {
      console.error(e);
      showAlert(`Lỗi khi cập nhật: ${e.message || 'Lỗi không xác định'}`, 'error');
    } finally {
      setIsSavingEvent(false);
    }
  };

  // Love Letter Form state
  const [letterTitle, setLetterTitle] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [letterFont, setLetterFont] = useState('Sacramento, cursive');
  const [letterColor, setLetterColor] = useState('#4A3B32');
  const [letterBg, setLetterBg] = useState('#FCF8F2');
  const [letterIsSecret, setLetterIsSecret] = useState(false);
  const [isSavingLetter, setIsSavingLetter] = useState(false);
  // Letter edit mode
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);
  const [editLetterTitle, setEditLetterTitle] = useState('');
  const [editLetterContent, setEditLetterContent] = useState('');
  const [editLetterFont, setEditLetterFont] = useState('Sacramento, cursive');
  const [editLetterColor, setEditLetterColor] = useState('#4A3B32');
  const [editLetterBg, setEditLetterBg] = useState('#FCF8F2');
  const [editLetterSecret, setEditLetterSecret] = useState(false);
  const [isSavingEditLetter, setIsSavingEditLetter] = useState(false);

  const startEditLetter = (l: Letter) => {
    setEditingLetterId(l._id);
    setEditLetterTitle(l.title || '');
    setEditLetterContent(l.content || '');
    setEditLetterFont(l.font || 'Sacramento, cursive');
    setEditLetterColor(l.color || '#4A3B32');
    setEditLetterBg(l.background || '#FCF8F2');
    setEditLetterSecret(!!l.isSecret);
  };
  const cancelEditLetter = () => setEditingLetterId(null);
  const handleLetterUpdate = async (id: string) => {
    if (!editLetterContent) return;
    setIsSavingEditLetter(true);
    try {
      await api.updateLetter(id, {
        title: editLetterTitle,
        content: editLetterContent,
        font: editLetterFont,
        color: editLetterColor,
        background: editLetterBg,
        isSecret: editLetterSecret
      });
      cancelEditLetter();
      loadAllContent();
      showAlert('Đã cập nhật thư tình thành công! 💌');
    } catch (e: any) {
      showAlert(`Lỗi: ${e.message}`, 'error');
    } finally {
      setIsSavingEditLetter(false);
    }
  };

  // Modal alerts & confirms states
  const [modalAlert, setModalAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'success', title = '') => {
    const defaultTitle = type === 'success' ? 'Thành công! 🎉' : type === 'error' ? 'Có lỗi xảy ra! ⚠️' : 'Thông báo ℹ️';
    setModalAlert({
      show: true,
      title: title || defaultTitle,
      message,
      type,
      onConfirm: () => setModalAlert(null)
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title = 'Xác nhận ❓') => {
    setModalAlert({
      show: true,
      title,
      message,
      type: 'confirm',
      onConfirm: () => {
        setModalAlert(null);
        onConfirm();
      },
      onCancel: () => setModalAlert(null)
    });
  };

  // Music Form state
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songFile, setSongFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploadingSong, setIsUploadingSong] = useState(false);
  // Song edit mode
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editSongTitle, setEditSongTitle] = useState('');
  const [editSongArtist, setEditSongArtist] = useState('');
  const [isSavingSong, setIsSavingSong] = useState(false);

  const startEditSong = (s: Song) => {
    setEditingSongId(s._id);
    setEditSongTitle(s.title || '');
    setEditSongArtist(s.artist || '');
  };
  const cancelEditSong = () => setEditingSongId(null);
  const handleSongUpdate = async (id: string) => {
    if (!editSongTitle) return;
    setIsSavingSong(true);
    try {
      // Songs API uses FormData for consistency
      const fd = new FormData();
      fd.append('title', editSongTitle);
      fd.append('artist', editSongArtist);
      await fetch(`${(import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api'}/music/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('love_token')}` },
        body: fd
      });
      cancelEditSong();
      loadAllContent();
      showAlert('Đã cập nhật bài hát thành công! 🎵');
    } catch (e: any) {
      showAlert(`Lỗi: ${e.message}`, 'error');
    } finally {
      setIsSavingSong(false);
    }
  };

  // Map Marker Form state
  const [markerLat, setMarkerLat] = useState('');
  const [markerLng, setMarkerLng] = useState('');
  const [markerTitle, setMarkerTitle] = useState('');
  const [markerDesc, setMarkerDesc] = useState('');
  const [markerDate, setMarkerDate] = useState('');
  const [markerFile, setMarkerFile] = useState<File | null>(null);
  const [isUploadingMarker, setIsUploadingMarker] = useState(false);
  // Marker edit mode
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [editMarkerTitle, setEditMarkerTitle] = useState('');
  const [editMarkerDesc, setEditMarkerDesc] = useState('');
  const [editMarkerDate, setEditMarkerDate] = useState('');
  const [editMarkerLat, setEditMarkerLat] = useState('');
  const [editMarkerLng, setEditMarkerLng] = useState('');
  const [isSavingMarker, setIsSavingMarker] = useState(false);

  const startEditMarker = (m: MapMarker) => {
    setEditingMarkerId(m._id);
    setEditMarkerTitle(m.title || '');
    setEditMarkerDesc(m.description || '');
    setEditMarkerDate(m.date ? m.date.substring(0, 10) : '');
    setEditMarkerLat(String(m.lat));
    setEditMarkerLng(String(m.lng));
  };
  const cancelEditMarker = () => setEditingMarkerId(null);
  const handleMarkerUpdate = async (id: string) => {
    if (!editMarkerTitle) return;
    setIsSavingMarker(true);
    const fd = new FormData();
    fd.append('title', editMarkerTitle);
    fd.append('description', editMarkerDesc);
    fd.append('date', editMarkerDate);
    fd.append('lat', editMarkerLat);
    fd.append('lng', editMarkerLng);
    try {
      await api.updateMarker(id, fd);
      cancelEditMarker();
      loadAllContent();
      showAlert('Đã cập nhật địa điểm thành công! 📍');
    } catch (e: any) {
      showAlert(`Lỗi: ${e.message}`, 'error');
    } finally {
      setIsSavingMarker(false);
    }
  };
  // Address search state for map
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<{ display_name: string; lat: string; lon: string; }[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSearchTimeout, setAddressSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const searchAddress = async (query: string) => {
    if (!query.trim() || query.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    setIsSearchingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=vi`);
      const data = await res.json();
      setAddressSuggestions(data || []);
    } catch (e) {
      console.error('Address search failed:', e);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleAddressInput = (value: string) => {
    setAddressQuery(value);
    if (addressSearchTimeout) clearTimeout(addressSearchTimeout);
    const t = setTimeout(() => searchAddress(value), 500);
    setAddressSearchTimeout(t);
  };

  const selectAddressSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    setMarkerLat(s.lat);
    setMarkerLng(s.lon);
    setAddressQuery(s.display_name);
    setAddressSuggestions([]);
    // Auto-fill title if empty
    if (!markerTitle) {
      const short = s.display_name.split(',').slice(0, 2).join(',').trim();
      setMarkerTitle(short);
    }
  };

  // Settings & Theme states (loaded from context, cloned for edits)
  const [editTheme, setEditTheme] = useState<any>(null);
  const [editEffects, setEditEffects] = useState<any>(null);
  const [editConfig, setEditConfig] = useState<any>(null);
  const [editContent, setEditContent] = useState<any>(null);

  // Background Music file state
  const [bgMusicFile, setBgMusicFile] = useState<File | null>(null);
  const [isUploadingBgMusic, setIsUploadingBgMusic] = useState(false);

  // Birthday Gallery upload state
  const [bdayGalleryFile, setBdayGalleryFile] = useState<File | null>(null);
  const [bdayGalleryCaption, setBdayGalleryCaption] = useState('');
  const [isUploadingBdayGallery, setIsUploadingBdayGallery] = useState(false);

  useEffect(() => {
    if (token) {
      loadStats();
      loadAllContent();
    }
  }, [token]);

  // Clone configurations for form inputs once loaded
  useEffect(() => {
    if (theme) setEditTheme({ ...theme });
    if (effects) setEditEffects({ ...effects });
    if (settings) setEditConfig({ ...settings });
    if (content) setEditContent({ ...content });
  }, [theme, effects, settings, content]);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const s = await api.getStats();
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadAllContent = async () => {
    try {
      const p = await api.getPhotos();
      setPhotos(p);
      const t = await api.getTimelineEvents();
      setEvents(t);
      const l = await api.getLetters();
      setLetters(l);
      const m = await api.getSongs();
      setSongs(m);
      const mk = await api.getMarkers();
      setMarkers(mk);
    } catch (e) {
      console.error(e);
    }
  };

  // --- ACTIONS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const session = await api.login({ username, password });
      setToken(session.token);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setToken(null);
  };

  // --- PHOTO MANAGEMENT ---
  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) return;

    setIsUploadingPhoto(true);
    const fd = new FormData();
    fd.append('photo', photoFile);
    fd.append('category', photoCat);
    fd.append('description', photoDesc);
    fd.append('isFavorite', String(photoFav));
    fd.append('isSecret', String(photoSecret));

    try {
      await api.uploadPhoto(fd);
      setPhotoFile(null);
      setPhotoDesc('');
      setPhotoFav(false);
      setPhotoSecret(false);
      loadAllContent();
      loadStats();
      showAlert('Tải hình ảnh lên thành công! 🎉');
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi khi tải ảnh lên: ${err.message || 'Lỗi không xác định'}. Vui lòng đăng xuất rồi đăng nhập lại!`, 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async (id: string) => {
    showConfirm('Bạn có chắc chắn muốn xóa hình ảnh này không?', async () => {
      try {
        await api.deletePhoto(id);
        loadAllContent();
        loadStats();
        showAlert('Đã xóa hình ảnh thành công! 🗑️');
      } catch (e: any) {
        console.error(e);
        showAlert(`Lỗi khi xóa hình ảnh: ${e.message || 'Lỗi không xác định'}`, 'error');
      }
    });
  };

  const movePhoto = async (index: number, direction: 'up' | 'down') => {
    const list = [...photos];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setPhotos(list);
    try {
      await api.reorderPhotos(list.map(p => p._id));
    } catch (e) {
      console.error(e);
    }
  };

  // --- TIMELINE MANAGEMENT ---
  const handleTimelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventDesc) return;

    setIsUploadingEvent(true);
    const fd = new FormData();
    fd.append('title', eventTitle);
    fd.append('date', eventDate);
    fd.append('description', eventDesc);
    if (eventFile) {
      fd.append('photo', eventFile);
    }

    try {
      await api.createTimelineEvent(fd);
      setEventTitle('');
      setEventDate('');
      setEventDesc('');
      setEventFile(null);
      loadAllContent();
      loadStats();
      showAlert('Thêm mốc kỷ niệm mới thành công! 🎉');
    } catch (err: any) {
      console.error(err);
      showAlert(`Lỗi khi thêm mốc kỷ niệm: ${err.message || 'Lỗi không xác định'}`, 'error');
    } finally {
      setIsUploadingEvent(false);
    }
  };

  const handleTimelineDelete = async (id: string) => {
    showConfirm('Bạn có chắc chắn muốn xóa mốc kỷ niệm này không?', async () => {
      try {
        await api.deleteTimelineEvent(id);
        loadAllContent();
        loadStats();
        showAlert('Đã xóa mốc kỷ niệm thành công! 🗑️');
      } catch (e: any) {
        console.error(e);
        showAlert(`Lỗi khi xóa mốc kỷ niệm: ${e.message || 'Lỗi không xác định'}`, 'error');
      }
    });
  };

  // --- LETTER MANAGEMENT ---
  const handleLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterContent) return;

    setIsSavingLetter(true);
    try {
      await api.createLetter({
        title: letterTitle || 'Love Letter',
        content: letterContent,
        font: letterFont,
        color: letterColor,
        background: letterBg,
        isSecret: letterIsSecret
      });
      setLetterTitle('');
      setLetterContent('');
      setLetterIsSecret(false);
      loadAllContent();
      showAlert('Lưu thư tình thành công! 💌');
    } catch (e: any) {
      console.error(e);
      showAlert(`Lỗi khi lưu thư tình: ${e.message || 'Lỗi không xác định'}. Vui lòng đăng xuất rồi đăng nhập lại!`, 'error');
    } finally {
      setIsSavingLetter(false);
    }
  };

  const handleLetterDelete = async (id: string) => {
    showConfirm('Bạn có chắc chắn muốn xóa bức thư tình này không?', async () => {
      try {
        await api.deleteLetter(id);
        loadAllContent();
        showAlert('Đã xóa thư tình thành công! 🗑️');
      } catch (e: any) {
        console.error(e);
        showAlert(`Lỗi khi xóa thư tình: ${e.message || 'Lỗi không xác định'}`, 'error');
      }
    });
  };

  // --- MUSIC MANAGEMENT ---
  const handleSongUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songFile || !songTitle) return;

    setIsUploadingSong(true);
    const fd = new FormData();
    fd.append('song', songFile);
    fd.append('title', songTitle);
    fd.append('artist', songArtist);
    if (coverFile) {
      fd.append('cover', coverFile);
    }

    try {
      await api.uploadSong(fd);
      setSongTitle('');
      setSongArtist('');
      setSongFile(null);
      setCoverFile(null);
      loadAllContent();
      loadStats();
      showAlert('Tải bài hát lên thành công! 🎵');
    } catch (e: any) {
      console.error(e);
      showAlert(`Lỗi khi tải bài hát: ${e.message || 'Lỗi không xác định'}`, 'error');
    } finally {
      setIsUploadingSong(false);
    }
  };

  const handleSongDelete = async (id: string) => {
    showConfirm('Bạn có muốn xóa bài hát này không?', async () => {
      try {
        await api.deleteSong(id);
        loadAllContent();
        loadStats();
        showAlert('Đã xóa bài hát thành công! 🗑️');
      } catch (e: any) {
        console.error(e);
        showAlert(`Lỗi khi xóa bài hát: ${e.message || 'Lỗi không xác định'}`, 'error');
      }
    });
  };

  // --- MAP MARKERS ---
  const handleMarkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerLat || !markerLng || !markerTitle || !markerDesc) return;

    setIsUploadingMarker(true);
    const fd = new FormData();
    fd.append('lat', markerLat);
    fd.append('lng', markerLng);
    fd.append('title', markerTitle);
    fd.append('description', markerDesc);
    fd.append('date', markerDate);
    if (markerFile) {
      fd.append('photo', markerFile);
    }

    try {
      await api.createMarker(fd);
      setMarkerLat('');
      setMarkerLng('');
      setMarkerTitle('');
      setMarkerDesc('');
      setMarkerDate('');
      setMarkerFile(null);
      loadAllContent();
      showAlert('Thêm vị trí bản đồ thành công! 📍');
    } catch (e: any) {
      console.error(e);
      showAlert(`Lỗi khi thêm vị trí: ${e.message || 'Lỗi không xác định'}`, 'error');
    } finally {
      setIsUploadingMarker(false);
    }
  };

  const handleMarkerDelete = async (id: string) => {
    showConfirm('Bạn có chắc chắn muốn xóa vị trí này không?', async () => {
      try {
        await api.deleteMarker(id);
        loadAllContent();
        showAlert('Đã xóa vị trí thành công! 🗑️');
      } catch (e: any) {
        console.error(e);
        showAlert(`Lỗi khi xóa vị trí: ${e.message || 'Lỗi không xác định'}`, 'error');
      }
    });
  };

  // --- CONFIG / CUSTOMIZATIONS ---
  
  // Custom theme colors pick triggers context update for instantaneous live previews
  const handleThemeColorChange = (key: string, val: string) => {
    setEditTheme((prev: any) => ({ ...prev, [key]: val }));
    updateLiveTheme({ [key]: val });
  };

  const handleEffectsToggle = (key: string, val: boolean) => {
    setEditEffects((prev: any) => ({ ...prev, [key]: val }));
    updateLiveEffects({ [key]: val });
  };

  const handleContentTextChange = (key: string, val: string) => {
    setEditContent((prev: any) => ({ ...prev, [key]: val }));
    updateLiveContent({ [key]: val });
  };

  const saveThemeBuilder = async () => {
    try {
      await api.updateTheme(editTheme);
      showAlert('Đã lưu cấu hình thiết kế giao diện thành công! ✨');
      refreshData();
    } catch (e: any) {
      showAlert('Không thể lưu cấu hình thiết kế giao diện.', 'error');
    }
  };

  const saveEffectsConfig = async () => {
    try {
      await api.updateEffects(editEffects);
      await api.updateConfig(editConfig);
      showAlert('Đã lưu cài đặt hiệu ứng & mật mã thành công! ⚙️');
      refreshData();
    } catch (e: any) {
      showAlert('Không thể lưu cài đặt hiệu ứng.', 'error');
    }
  };

  const saveRelationshipsContent = async () => {
    try {
      await api.updateContent(editContent);
      showAlert('Đã lưu thông tin ngày kỷ niệm thành công! 💖');
      refreshData();
    } catch (e: any) {
      showAlert('Không thể lưu thông tin ngày kỷ niệm.', 'error');
    }
  };

  // Birthday Gallery: Upload a photo file, get the URL, push to editContent.birthdayGallery
  const handleBdayGalleryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bdayGalleryFile) return;
    setIsUploadingBdayGallery(true);
    const fd = new FormData();
    fd.append('photo', bdayGalleryFile);
    fd.append('category', 'birthday-gallery');
    fd.append('description', bdayGalleryCaption || 'Birthday Memory');
    fd.append('isFavorite', 'false');
    fd.append('isSecret', 'false');
    try {
      const res = await api.uploadPhoto(fd);
      console.log('UPLOAD RES:', res); // Log to trace shape of API upload response
      const newItem = { url: res.url || res.photo?.url || '', publicId: res.publicId || res.photo?.publicId || '', caption: bdayGalleryCaption };
      setEditContent((prev: any) => ({
        ...prev,
        birthdayGallery: [...(prev.birthdayGallery || []), newItem]
      }));
      setBdayGalleryFile(null);
      setBdayGalleryCaption('');
      showAlert('Đã tải ảnh lên thành công! Nhớ nhấn Lưu để lưu thay đổi 📸');
    } catch (err: any) {
      showAlert(`Lỗi tải ảnh: ${err.message || 'Lỗi không xác định'}`, 'error');
    } finally {
      setIsUploadingBdayGallery(false);
    }
  };

  const handleBdayGalleryRemove = (idx: number) => {
    setEditContent((prev: any) => ({
      ...prev,
      birthdayGallery: (prev.birthdayGallery || []).filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleBdayGalleryCaptionChange = (idx: number, caption: string) => {
    setEditContent((prev: any) => {
      const arr = [...(prev.birthdayGallery || [])];
      arr[idx] = { ...arr[idx], caption };
      return { ...prev, birthdayGallery: arr };
    });
  };

  const handleBgMusicUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgMusicFile) return;

    setIsUploadingBgMusic(true);
    const fd = new FormData();
    fd.append('music', bgMusicFile);

    try {
      await api.uploadBgMusic(fd);
      setBgMusicFile(null);
      showAlert('Đã tải lên nhạc nền trang chủ thành công! 🎵');
      refreshData();
    } catch (e: any) {
      showAlert('Lỗi khi tải nhạc nền lên.', 'error');
    } finally {
      setIsUploadingBgMusic(false);
    }
  };

  const handleBgMusicDelete = async () => {
    showConfirm('Bạn có muốn gỡ bỏ nhạc nền của trang chủ không?', async () => {
      try {
        await api.deleteBgMusic();
        showAlert('Đã gỡ bỏ nhạc nền thành công! 🗑️');
        refreshData();
      } catch (e: any) {
        console.error(e);
        showAlert('Lỗi khi gỡ bỏ nhạc nền.', 'error');
      }
    });
  };

  const getFullUrl = (url: string) => {
    return url.startsWith('/') ? `http://localhost:5000${url}` : url;
  };

  // --- LOGIN LAYOUT ---
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <form 
          onSubmit={handleLogin}
          className="glassmorphism p-8 rounded-2xl glow-border max-w-sm w-full flex flex-col backdrop-blur-md"
        >
          <h2 className="text-text text-xl font-bold uppercase tracking-wider text-center mb-1 text-glow">
            CMS Login
          </h2>
          <p className="text-text/85 text-xs text-center mb-6">Enter credentials to access Admin Dashboard</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-text text-xs font-semibold uppercase mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-sm outline-none transition-colors"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-text text-xs font-semibold uppercase mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-sm outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-50 text-text font-bold text-sm tracking-wider uppercase transition-all hover:shadow-[0_0_15px_var(--primary-color)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoggingIn ? <Loader2 size={16} className="animate-spin" /> : 'Log In'}
          </button>

          {loginError && (
            <p className="text-red-400 text-xs text-center mt-4 animate-pulse">
              {loginError}
            </p>
          )}
        </form>
      </div>
    );
  }

  // --- DASHBOARD LAYOUT ---
  return (
    <div className="py-12 px-4 max-w-7xl mx-auto w-full min-h-[80vh] flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Tabs panel */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
        <div className="glassmorphism p-4 rounded-xl flex flex-col gap-1 w-full border-b border-white/10 md:border-b-0">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-primary/10 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-text font-bold text-sm">Admin CMS</span>
            </div>
            <button
              onClick={async () => {
                setIsLoadingStats(true);
                try {
                  await refreshData();
                  await loadStats();
                  await loadAllContent();
                  showAlert('Đã đồng bộ dữ liệu mới nhất từ Database! 🔄');
                } catch (err: any) {
                  showAlert('Đồng bộ thất bại.', 'error');
                } finally {
                  setIsLoadingStats(false);
                }
              }}
              title="Đồng bộ lại dữ liệu / Reload Data"
              className="text-text/60 hover:text-primary transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={isLoadingStats ? "animate-spin" : ""} />
            </button>
          </div>

          {[
            { id: 'dashboard', label: t('cmsDashboard'), icon: <LayoutDashboard size={16} /> },
            { id: 'photos', label: t('cmsPhotos'), icon: <ImageIcon size={16} /> },
            { id: 'timeline', label: t('cmsMilestones'), icon: <Calendar size={16} /> },
            { id: 'letters', label: t('cmsLetters'), icon: <BookOpen size={16} /> },
            { id: 'archive', label: t('cmsArchive'), icon: <Lock size={16} /> },
            { id: 'music', label: t('cmsMusic'), icon: <Music size={16} /> },
            { id: 'map', label: t('cmsMap'), icon: <MapPin size={16} /> },
            { id: 'qr', label: 'Mã QR 📱', icon: <span className="text-base leading-none">📱</span> },
            { id: 'theme', label: t('cmsTheme'), icon: <Paintbrush size={16} /> },
            { id: 'settings', label: t('cmsSettings'), icon: <SettingsIcon size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary font-semibold border-l-4 border-primary'
                  : 'text-text hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left text-red-400 hover:bg-red-500/10 transition-colors mt-4 border-t border-primary/10 pt-4 cursor-pointer"
          >
            <LogOut size={16} />
            {t('cmsLogout')}
          </button>
        </div>
      </div>

      {/* Main CMS window content */}
      <div className="flex-grow glassmorphism p-6 rounded-xl glow-border min-h-[500px]">
        
        {/* --- TABS RENDERING --- */}
        
        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
              {t('cmsOverview')}
            </h3>

            {isLoadingStats ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : (
              stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: t('cmsVisits'), value: stats.visitsCount },
                    { label: t('cmsTotalPhotos'), value: stats.totalPhotos },
                    { label: t('cmsTotalEvents'), value: stats.totalTimelineEvents },
                    { label: t('cmsStorage'), value: stats.storageUsed },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex flex-col">
                      <span className="text-xs text-text/80 mb-1 uppercase tracking-wider">{stat.label}</span>
                      <span className="text-2xl font-bold text-primary text-glow">{stat.value}</span>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* System Info card */}
            {stats && (
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex gap-3 items-start max-w-xl">
                <Info className="text-primary flex-shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-text/90 leading-relaxed">
                  <h4 className="font-bold text-text text-sm mb-1 uppercase">{t('cmsDbProfile')}</h4>
                  <p>{t('cmsDbMode')}: <strong className="text-primary">{stats.dbType}</strong></p>
                  <p className="mt-1">{t('cmsDbInfo')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ALBUM GALLERY */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
              {t('cmsUploadPhotos')}
            </h3>

            {/* Upload form */}
            <form onSubmit={handlePhotoUpload} className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4 max-w-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('cmsFileInput')}</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="text-xs text-text/80"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('cmsCategory')}</label>
                  <input
                    type="text"
                    value={photoCat}
                    onChange={(e) => setPhotoCat(e.target.value)}
                    placeholder="General, Travel, Dates"
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('cmsCaption')}</label>
                <textarea
                  value={photoDesc}
                  onChange={(e) => setPhotoDesc(e.target.value)}
                  placeholder="A lovely day at..."
                  rows={2}
                  className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="photoFav"
                    checked={photoFav}
                    onChange={(e) => setPhotoFav(e.target.checked)}
                    className="accent-primary cursor-pointer"
                  />
                  <label htmlFor="photoFav" className="text-xs text-text font-semibold cursor-pointer">
                    Ghim nổi bật trên Trang Chủ (Highlight)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="photoSecret"
                    checked={photoSecret}
                    onChange={(e) => setPhotoSecret(e.target.checked)}
                    className="accent-primary cursor-pointer"
                  />
                  <label htmlFor="photoSecret" className="text-xs text-text font-semibold cursor-pointer flex items-center gap-1">
                    🔒 Đặt làm ảnh bí mật (Chỉ hiện trong Secret Vault)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploadingPhoto || !photoFile}
                className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-full font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
              >
                {isUploadingPhoto ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Add Photo
              </button>
            </form>

            {/* List & Reorder grid */}
            <div className="border-t border-primary/10 pt-6">
              <h4 className="text-text text-sm font-semibold uppercase mb-4">Manage Photo Listings</h4>
              
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                {photos.map((photo, index) => (
                  <div key={photo._id} className="bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
                    {editingPhotoId === photo._id ? (
                      /* ── EDIT MODE ── */
                      <div className="p-4 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase mb-2">✏️ Chỉnh sửa ảnh</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Chú thích</label>
                            <input type="text" value={editPhotoDesc} onChange={e => setEditPhotoDesc(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Danh mục</label>
                            <input type="text" value={editPhotoCat} onChange={e => setEditPhotoCat(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none" />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs font-semibold text-text cursor-pointer">
                            <input type="checkbox" checked={editPhotoFav} onChange={e => setEditPhotoFav(e.target.checked)} className="accent-primary" />
                            ⭐ Nổi Bật
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold text-text cursor-pointer">
                            <input type="checkbox" checked={editPhotoSecret} onChange={e => setEditPhotoSecret(e.target.checked)} className="accent-primary" />
                            🔒 Bí Mật
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" disabled={isSavingPhoto} onClick={() => handlePhotoUpdate(photo._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/80 disabled:opacity-50 transition-colors cursor-pointer">
                            {isSavingPhoto ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Lưu
                          </button>
                          <button type="button" onClick={cancelEditPhoto}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/20 text-text/60 rounded-full text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer">
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                          <img src={getFullUrl(photo.url)} alt="" className="w-14 h-14 object-cover rounded-lg border border-primary/15 flex-shrink-0 shadow-sm" />
                          <div className="truncate text-xs min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-text truncate font-bold">{photo.description || 'No description'}</p>
                              {photo.isSecret && (<span className="bg-primary/10 text-primary border border-primary/20 px-1 py-0.5 rounded text-[9px] font-semibold">🔒 Secret</span>)}
                              {photo.isFavorite && (<span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-1 py-0.5 rounded text-[9px] font-semibold">⭐ Highlight</span>)}
                            </div>
                            <p className="text-text/60 truncate mt-0.5">{photo.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button type="button" onClick={() => startEditPhoto(photo)}
                            className="p-1.5 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer" title="Chỉnh sửa">
                            <Edit3 size={14} />
                          </button>
                          <button type="button" onClick={() => movePhoto(index, 'up')} disabled={index === 0}
                            className="p-1.5 text-text/40 hover:text-primary disabled:opacity-20 transition-colors cursor-pointer">
                            <ArrowUp size={14} />
                          </button>
                          <button type="button" onClick={() => movePhoto(index, 'down')} disabled={index === photos.length - 1}
                            className="p-1.5 text-text/40 hover:text-primary disabled:opacity-20 transition-colors cursor-pointer">
                            <ArrowDown size={14} />
                          </button>
                          <button type="button" onClick={async () => { try { await api.deletePhoto(photo._id); setPhotos(prev => prev.filter(p => p._id !== photo._id)); } catch(e){} }}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-400 rounded-lg transition-all ml-1 cursor-pointer" title="Xóa ảnh">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {photos.length === 0 && (
                  <p className="text-xs text-text/60 py-4 text-center">Chưa có ảnh nào. Upload ảnh đầu tiên! 📸</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. TIMELINE EVENTS */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
              Add Timeline Milestone
            </h3>

            <form onSubmit={handleTimelineSubmit} className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4 max-w-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Milestone Title</label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Our First Date"
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Anniversary Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Milestone Description</label>
                <textarea
                  required
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="We went to the beach and..."
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Milestone Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEventFile(e.target.files?.[0] || null)}
                  className="text-xs text-text/80"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadingEvent || !eventTitle || !eventDesc}
                className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-full font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
              >
                {isUploadingEvent ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Add Milestone
              </button>
            </form>

            {/* Timeline event listings */}
            <div className="border-t border-primary/10 pt-6">
              <h4 className="text-text text-sm font-semibold uppercase mb-4">📅 Mốc Kỷ Niệm Đã Lưu ({events.length})</h4>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {events.length === 0 && (
                  <p className="text-xs text-text/50 py-4 text-center">Chưa có mốc kỷ niệm nào. Hãy thêm mốc đầu tiên! 💕</p>
                )}
                {events.map((ev) => (
                  <div key={ev._id} className="bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
                    {editingEventId === ev._id ? (
                      /* ── EDIT MODE ── */
                      <div className="p-4 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase mb-2">✏️ Chỉnh sửa mốc kỷ niệm</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Tên Mốc</label>
                            <input
                              type="text"
                              value={editEventTitle}
                              onChange={(e) => setEditEventTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Ngày</label>
                            <input
                              type="date"
                              value={editEventDate}
                              onChange={(e) => setEditEventDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Mô Tả</label>
                          <textarea
                            value={editEventDesc}
                            onChange={(e) => setEditEventDesc(e.target.value)}
                            rows={3}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Đổi Ảnh (tùy chọn)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditEventFile(e.target.files?.[0] || null)}
                            className="text-[10px] text-text/70"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            disabled={isSavingEvent}
                            onClick={() => handleTimelineUpdate(ev._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/80 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {isSavingEvent ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditEvent}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/20 text-text/60 rounded-full text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="p-3 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3 truncate">
                          {ev.photoUrl && <img src={getFullUrl(ev.photoUrl)} alt="" className="w-12 h-12 object-cover rounded-lg border border-primary/10 flex-shrink-0" />}
                          <div className="truncate">
                            <p className="text-text font-bold text-sm truncate">{ev.title}</p>
                            <p className="text-primary/70 text-xs mt-0.5">{ev.date ? ev.date.substring(0,10).split('-').reverse().join('/') : ''}</p>
                            {ev.description && <p className="text-text/50 text-xs mt-0.5 truncate">{ev.description}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditEvent(ev)}
                            className="p-1.5 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTimelineDelete(ev._id)}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-400 rounded-lg transition-all cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. LOVE LETTERS */}
        {activeTab === 'letters' && (
          <div className="space-y-6">
            <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
              {t('cmsComposeLetter')}
            </h3>

            <form onSubmit={handleLetterSubmit} className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4 max-w-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('cmsLetterTitle')}</label>
                  <div className="flex gap-1.5 flex-col">
                    <input
                      type="text"
                      value={letterTitle}
                      onChange={(e) => setLetterTitle(e.target.value)}
                      placeholder="To My Dearest"
                      className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                    />
                    {/* Quick icon buttons */}
                    <div className="flex flex-wrap gap-1">
                      {['💕','🌸','✨','💖','🥀','🌙','⭐','🎀','🌹','💝','🍓','🌺','💗','🥂','🎵'].map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setLetterTitle(prev => prev + icon)}
                          className="text-sm w-7 h-7 rounded-md hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('cmsLetterFont')}</label>
                  <select
                    value={letterFont}
                    onChange={(e) => setLetterFont(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  >
                    <option value="Sacramento, cursive">Sacramento (Sweet)</option>
                    <option value="Great Vibes, cursive">Great Vibes (Luxurious)</option>
                    <option value="Pacifico, cursive">Pacifico (Casual Cursive)</option>
                    <option value="Playfair Display, serif">Playfair (Classic Serif)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('cmsLetterBg')}</label>
                <div className="flex gap-2 items-center">
                  {/* Native color picker */}
                  <input
                    type="color"
                    value={letterBg.startsWith('#') ? letterBg.slice(0, 7) : '#FCF8F2'}
                    onChange={(e) => setLetterBg(e.target.value)}
                    className="w-10 h-9 rounded cursor-pointer border border-primary/20 p-0.5 bg-white flex-shrink-0"
                  />
                  {/* Hex / rgba text */}
                  <input
                    type="text"
                    value={letterBg}
                    onChange={(e) => setLetterBg(e.target.value)}
                    placeholder="#FCF8F2"
                    className="flex-1 px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none font-mono"
                  />
                </div>
                {/* Quick palette */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {['#FCF8F2','#FFF0F5','#FFF5E4','#F0FFF4','#F0F4FF','#FFF9F0','#FFFFFF'].map(c => (
                    <button key={c} type="button" onClick={() => setLetterBg(c)}
                      className="w-6 h-6 rounded-full border-2 transition-all cursor-pointer hover:scale-110"
                      style={{ backgroundColor: c, borderColor: letterBg === c ? '#FF5C93' : '#FFD6E7' }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('cmsLetterColor')}</label>
                <div className="flex gap-2 items-center">
                  {/* Native color picker */}
                  <input
                    type="color"
                    value={letterColor.startsWith('#') ? letterColor.slice(0, 7) : '#4A3B32'}
                    onChange={(e) => setLetterColor(e.target.value)}
                    className="w-10 h-9 rounded cursor-pointer border border-primary/20 p-0.5 bg-white flex-shrink-0"
                  />
                  {/* Hex text */}
                  <input
                    type="text"
                    value={letterColor}
                    onChange={(e) => setLetterColor(e.target.value)}
                    placeholder="#4A3B32"
                    className="flex-1 px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none font-mono"
                  />
                </div>
                {/* Quick ink colors */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {['#4A3B32','#5C3A47','#2D3748','#1A1A2E','#3D2C2C','#7B3F00','#1B5E20'].map(c => (
                    <button key={c} type="button" onClick={() => setLetterColor(c)}
                      className="w-6 h-6 rounded-full border-2 transition-all cursor-pointer hover:scale-110"
                      style={{ backgroundColor: c, borderColor: letterColor === c ? '#FF5C93' : '#FFD6E7' }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('cmsLetterBody')}</label>
                <textarea
                  required
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  placeholder="My love, from the moment I met you..."
                  rows={6}
                  className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                />
              </div>

              {/* Secret Letter Toggle */}
              <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                <input
                  type="checkbox"
                  id="letterIsSecret"
                  checked={letterIsSecret}
                  onChange={(e) => setLetterIsSecret(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="letterIsSecret" className="text-xs text-text font-semibold cursor-pointer flex items-center gap-1.5">
                  🔒 Đặt làm thư bí mật (hiển thị trong Secret Vault)
                  <span className="text-primary/60 font-normal">• Set as Secret Letter (shows in Secret Vault)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSavingLetter || !letterContent}
                className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-full font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
              >
                {isSavingLetter ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {t('cmsSaveLetterBtn')}
              </button>
            </form>

            <div className="border-t border-primary/10 pt-6">
              <h4 className="text-text text-sm font-semibold uppercase mb-4">💌 {t('cmsExistingLetters')} ({letters.length})</h4>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {letters.length === 0 && (
                  <p className="text-xs text-text/50 py-4 text-center">Chưa có bức thư nào. Viết bức thư đầu tiên! 💕</p>
                )}
                {letters.map((lettr) => (
                  <div key={lettr._id} className="bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
                    {editingLetterId === lettr._id ? (
                      /* ── EDIT MODE ── */
                      <div className="p-4 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase mb-2">✏️ Chỉnh sửa thư tình</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Tiêu đề</label>
                            <input type="text" value={editLetterTitle} onChange={e => setEditLetterTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Font chữ</label>
                            <select value={editLetterFont} onChange={e => setEditLetterFont(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none">
                              <option value="Sacramento, cursive">Sacramento</option>
                              <option value="Great Vibes, cursive">Great Vibes</option>
                              <option value="Pacifico, cursive">Pacifico</option>
                              <option value="Playfair Display, serif">Playfair Display</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Màu nền</label>
                            <div className="flex gap-2 items-center">
                              <input type="color" value={editLetterBg.startsWith('#') ? editLetterBg.slice(0,7) : '#FCF8F2'}
                                onChange={e => setEditLetterBg(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-primary/20 p-0.5" />
                              <input type="text" value={editLetterBg} onChange={e => setEditLetterBg(e.target.value)}
                                className="flex-1 px-2 py-1 rounded bg-white border border-primary/20 text-text text-xs outline-none font-mono" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Màu mực</label>
                            <div className="flex gap-2 items-center">
                              <input type="color" value={editLetterColor.startsWith('#') ? editLetterColor.slice(0,7) : '#4A3B32'}
                                onChange={e => setEditLetterColor(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-primary/20 p-0.5" />
                              <input type="text" value={editLetterColor} onChange={e => setEditLetterColor(e.target.value)}
                                className="flex-1 px-2 py-1 rounded bg-white border border-primary/20 text-text text-xs outline-none font-mono" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Nội dung thư</label>
                          <textarea value={editLetterContent} onChange={e => setEditLetterContent(e.target.value)} rows={5}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none resize-none" />
                        </div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-text cursor-pointer">
                          <input type="checkbox" checked={editLetterSecret} onChange={e => setEditLetterSecret(e.target.checked)} className="accent-primary" />
                          🔒 Thư bí mật (chỉ hiện trong Secret Vault)
                        </label>
                        <div className="flex gap-2">
                          <button type="button" disabled={isSavingEditLetter} onClick={() => handleLetterUpdate(lettr._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/80 disabled:opacity-50 transition-colors cursor-pointer">
                            {isSavingEditLetter ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Lưu
                          </button>
                          <button type="button" onClick={cancelEditLetter}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/20 text-text/60 rounded-full text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer">
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="p-3 flex justify-between items-start gap-2">
                        <div className="text-xs flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-text font-bold truncate">{lettr.title}</p>
                            {lettr.isSecret && (<span className="flex-shrink-0 text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-semibold">🔒 Bí mật</span>)}
                          </div>
                          <p className="text-text/60 mt-0.5 truncate max-w-md">{lettr.content.substring(0, 80)}...</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button type="button" onClick={() => startEditLetter(lettr)}
                            className="p-1.5 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer" title="Chỉnh sửa">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleLetterDelete(lettr._id)}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-400 rounded-lg transition-all cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. PLAYLISTS & BACKGROUND MUSIC */}
        {activeTab === 'music' && (
          <div className="space-y-6">
            <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
              Manage Music Playlist
            </h3>

            {/* Song Upload Form */}
            <form onSubmit={handleSongUpload} className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4 max-w-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Song Title</label>
                  <input
                    type="text"
                    required
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Melody of Love"
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Artist name</label>
                  <input
                    type="text"
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    placeholder="Unknown"
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Song MP3 File</label>
                  <input
                    type="file"
                    required
                    accept="audio/*"
                    onChange={(e) => setSongFile(e.target.files?.[0] || null)}
                    className="text-xs text-text/80"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Album Cover image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="text-xs text-text/80"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploadingSong || !songFile || !songTitle}
                className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-full font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
              >
                {isUploadingSong ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Add Track
              </button>
            </form>

            {/* Song Listings */}
            <div className="border-t border-primary/10 pt-6">
              <h4 className="text-text text-sm font-semibold uppercase mb-4">🎵 Danh Sách Bài Hát ({songs.length})</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {songs.length === 0 && (
                  <p className="text-xs text-text/50 py-4 text-center">Chưa có bài hát nào. Thêm bài hát đầu tiên!</p>
                )}
                {songs.map((song) => (
                  <div key={song._id} className="bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
                    {editingSongId === song._id ? (
                      /* ── EDIT MODE ── */
                      <div className="p-4 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase mb-2">✏️ Chỉnh sửa bài hát</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Tên Bài</label>
                            <input type="text" value={editSongTitle} onChange={e => setEditSongTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Nghệ sĩ</label>
                            <input type="text" value={editSongArtist} onChange={e => setEditSongArtist(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" disabled={isSavingSong} onClick={() => handleSongUpdate(song._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/80 disabled:opacity-50 transition-colors cursor-pointer">
                            {isSavingSong ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Lưu
                          </button>
                          <button type="button" onClick={cancelEditSong}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/20 text-text/60 rounded-full text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer">
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="p-3 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 text-xs overflow-hidden flex-1 min-w-0">
                          {song.coverUrl && <img src={getFullUrl(song.coverUrl)} alt="" className="w-10 h-10 object-cover rounded-lg border border-primary/10 flex-shrink-0" />}
                          <div className="truncate">
                            <p className="text-text font-bold truncate">{song.title}</p>
                            <p className="text-text/60 truncate mt-0.5">{song.artist}</p>
                          </div>
                        </div>
                        {song._id !== 'default' && (
                          <div className="flex gap-1 flex-shrink-0">
                            <button type="button" onClick={() => startEditSong(song)}
                              className="p-1.5 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer" title="Chỉnh sửa">
                              <Edit3 size={14} />
                            </button>
                            <button type="button" onClick={() => handleSongDelete(song._id)}
                              className="p-1.5 text-red-400 hover:text-white hover:bg-red-400 rounded-lg transition-all cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. MEMORY MAP */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
              📍 Thêm Địa Điểm Kỷ Niệm
            </h3>

            <form onSubmit={handleMarkerSubmit} className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4 max-w-lg">
              {/* Address Search */}
              <div className="relative">
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">
                  🔍 Tìm Địa Điểm Theo Tên / Địa Chỉ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={addressQuery}
                    onChange={(e) => handleAddressInput(e.target.value)}
                    placeholder="VD: Nhà thờ Đức Bà Hà Nội, Cà phê Trung Nguyên..." 
                    className="w-full px-3 py-2 pr-8 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                  {isSearchingAddress && (
                    <Loader2 size={14} className="absolute right-2 top-2.5 text-primary/60 animate-spin" />
                  )}
                </div>
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-primary/20 rounded-lg shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                    {addressSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectAddressSuggestion(s)}
                        className="w-full text-left px-3 py-2 text-xs text-text hover:bg-primary/5 border-b border-primary/5 last:border-0 cursor-pointer transition-colors"
                      >
                        <MapPin size={10} className="inline mr-1 text-primary" />
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
                {/* Show coords if found */}
                {markerLat && markerLng && (
                  <p className="text-[10px] text-primary/70 mt-1 font-mono">
                    ✅ Tọa độ: {parseFloat(markerLat).toFixed(6)}, {parseFloat(markerLng).toFixed(6)}
                  </p>
                )}
                {!markerLat && addressQuery.length > 0 && !isSearchingAddress && (
                  <p className="text-[10px] text-text/50 mt-1">
                    ⌨️ Gõ ít nhất 3 ký tự để hiện gợi ý địa điểm...
                  </p>
                )}
              </div>

              {/* Hidden lat/lng if needed, can also be entered manually */}
              <details className="text-xs">
                <summary className="cursor-pointer text-text/50 hover:text-text/70 select-none">⚙️ Nhập tọa độ thủ công (tùy chọn)</summary>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Vĩ Độ (Latitude)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={markerLat}
                      onChange={(e) => setMarkerLat(e.target.value)}
                      placeholder="21.0285"
                      className="w-full px-2 py-1.5 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Kinh Độ (Longitude)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={markerLng}
                      onChange={(e) => setMarkerLng(e.target.value)}
                      placeholder="105.8542"
                      className="w-full px-2 py-1.5 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none font-mono"
                    />
                  </div>
                </div>
              </details>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Tên Địa Điểm 💬</label>
                  <input
                    type="text"
                    required
                    value={markerTitle}
                    onChange={(e) => setMarkerTitle(e.target.value)}
                    placeholder="Quán cà phê chúng ta gặp lần đầu"
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Ngày Kỷ Niệm 📅</label>
                  <input
                    type="date"
                    required
                    value={markerDate}
                    onChange={(e) => setMarkerDate(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Câu Chuyện Kỷ Niệm 📝</label>
                <textarea
                  required
                  value={markerDesc}
                  onChange={(e) => setMarkerDesc(e.target.value)}
                  placeholder="Đây là nơi chúng ta ngồi uống cà phê và..."
                  rows={2}
                  className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Ảnh Kỷ Niệm (Tùy Chọn) 📸</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMarkerFile(e.target.files?.[0] || null)}
                  className="text-xs text-text/80"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadingMarker || !markerLat || !markerLng || !markerTitle}
                className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-full font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
              >
                {isUploadingMarker ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                📍 Thêm Địa Điểm
              </button>
            </form>

            {/* Marker list */}
            <div className="border-t border-primary/10 pt-6">
              <h4 className="text-text text-sm font-semibold uppercase mb-4">🗺️ Danh Sách Địa Điểm Đã Lưu ({markers.length})</h4>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {markers.length === 0 && (
                  <p className="text-xs text-text/50 py-4 text-center">Chưa có địa điểm nào được lưu. Hãy thêm địa điểm kỷ niệm đầu tiên!</p>
                )}
                {markers.map((m) => (
                  <div key={m._id} className="bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
                    {editingMarkerId === m._id ? (
                      /* ── EDIT MODE ── */
                      <div className="p-4 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase mb-2">✏️ Chỉnh sửa địa điểm</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Tên Địa Điểm</label>
                            <input type="text" value={editMarkerTitle} onChange={e => setEditMarkerTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Ngày</label>
                            <input type="date" value={editMarkerDate} onChange={e => setEditMarkerDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Mô tả</label>
                          <textarea value={editMarkerDesc} onChange={e => setEditMarkerDesc(e.target.value)} rows={2}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Vĩ Độ (Lat)</label>
                            <input type="number" step="0.000001" value={editMarkerLat} onChange={e => setEditMarkerLat(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none font-mono" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-text/60 font-bold uppercase mb-1">Kinh Độ (Lng)</label>
                            <input type="number" step="0.000001" value={editMarkerLng} onChange={e => setEditMarkerLng(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none font-mono" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" disabled={isSavingMarker} onClick={() => handleMarkerUpdate(m._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/80 disabled:opacity-50 transition-colors cursor-pointer">
                            {isSavingMarker ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Lưu
                          </button>
                          <button type="button" onClick={cancelEditMarker}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/20 text-text/60 rounded-full text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer">
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="p-3 flex justify-between items-center gap-4">
                        <div className="text-xs flex-1 min-w-0">
                          <p className="text-text font-bold truncate">{m.title}</p>
                          <p className="text-text/50 mt-0.5 font-mono text-[10px]">{m.lat.toFixed(5)}, {m.lng.toFixed(5)} • {m.date}</p>
                          {m.description && <p className="text-text/60 mt-0.5 truncate">{m.description}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button type="button" onClick={() => startEditMarker(m)}
                            className="p-1.5 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer" title="Chỉnh sửa">
                            <Edit3 size={14} />
                          </button>
                          <button type="button" onClick={() => handleMarkerDelete(m._id)}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-400 rounded-lg transition-all cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. THEME BUILDER (LIVE PREVIEWS) */}
        {activeTab === 'theme' && editTheme && (
          <div className="space-y-6">
            <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
              Theme Customizer Builder
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Primary Color (Soft Pink)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={editTheme.primaryColor}
                      onChange={(e) => handleThemeColorChange('primaryColor', e.target.value)}
                      className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editTheme.primaryColor}
                      onChange={(e) => handleThemeColorChange('primaryColor', e.target.value)}
                      className="w-32 px-3 py-1 rounded bg-white/5 border border-white/15 focus:border-primary text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Secondary Color (Rose Gold)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={editTheme.secondaryColor}
                      onChange={(e) => handleThemeColorChange('secondaryColor', e.target.value)}
                      className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editTheme.secondaryColor}
                      onChange={(e) => handleThemeColorChange('secondaryColor', e.target.value)}
                      className="w-32 px-3 py-1 rounded bg-white/5 border border-white/15 focus:border-primary text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Accent Color (Purple)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={editTheme.accentColor}
                      onChange={(e) => handleThemeColorChange('accentColor', e.target.value)}
                      className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editTheme.accentColor}
                      onChange={(e) => handleThemeColorChange('accentColor', e.target.value)}
                      className="w-32 px-3 py-1 rounded bg-white/5 border border-white/15 focus:border-primary text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Glass Blur Intensity (px)</label>
                  <input
                    type="range"
                    min="4"
                    max="24"
                    value={editTheme.glassBlur}
                    onChange={(e) => handleThemeColorChange('glassBlur', e.target.value)}
                    className="w-full accent-primary"
                  />
                  <span className="text-[10px] text-secondary mt-1 block">{editTheme.glassBlur} px blur</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Border Radius (px)</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={editTheme.borderRadius}
                    onChange={(e) => handleThemeColorChange('borderRadius', e.target.value)}
                    className="w-full accent-primary"
                  />
                  <span className="text-[10px] text-secondary mt-1 block">{editTheme.borderRadius} px radius</span>
                </div>

                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">Background Gradient CSS</label>
                  <textarea
                    value={editTheme.gradientBackground}
                    onChange={(e) => handleThemeColorChange('gradientBackground', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-primary/10 pt-4 flex gap-3">
              <button
                onClick={saveThemeBuilder}
                className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/80 text-white font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
              >
                <Save size={14} />
                Save Design Changes
              </button>
            </div>
          </div>
        )}

        {/* 8. VISUAL EFFECTS & GENERAL CONFIGS */}
        {activeTab === 'settings' && editEffects && editConfig && editContent && (
          <div className="space-y-6">
            
            {/* Toggle Particle Panels */}
            <div>
              <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3">
                {t('settingsVisualSwitches')}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {[
                  { key: 'flowers', labelKey: 'effect_flowers' },
                  { key: 'stars', labelKey: 'effect_stars' },
                  { key: 'snow', labelKey: 'effect_snow' },
                  { key: 'rain', labelKey: 'effect_rain' },
                  { key: 'cursorHearts', labelKey: 'effect_cursorHearts' },
                  { key: 'particles', labelKey: 'effect_particles' },
                ].map(eff => (
                  <div key={eff.key} className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <span className="text-xs text-text font-semibold">{t(eff.labelKey)}</span>
                    <input
                      type="checkbox"
                      checked={editEffects[eff.key]}
                      onChange={(e) => handleEffectsToggle(eff.key, e.target.checked)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* General Site Switches & settings */}
            <div className="border-t border-primary/10 pt-6">
              <h3 className="text-text font-bold text-base uppercase mb-4">
                {t('settingsAnniversaryTitle')}
              </h3>
              
              <div className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('settingsAnniversaryStart')}</label>
                    <input
                      type="date"
                      value={editContent.relationshipStartDate ? editContent.relationshipStartDate.substring(0, 10) : ''}
                      onChange={(e) => handleContentTextChange('relationshipStartDate', e.target.value ? e.target.value + 'T00:00:00' : '')}
                      className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('settingsBirthdayDate')}</label>
                    <input
                      type="date"
                      value={editContent.birthdayDate ? editContent.birthdayDate.substring(0, 10) : ''}
                      onChange={(e) => handleContentTextChange('birthdayDate', e.target.value ? e.target.value + 'T00:00:00' : '')}
                      className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <span className="text-xs text-text font-semibold">{t('settingsEnableCountdown')}</span>
                    <input
                      type="checkbox"
                      checked={editConfig.enableBirthdayCountdown}
                      onChange={(e) => setEditConfig({ ...editConfig, enableBirthdayCountdown: e.target.checked })}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <span className="text-xs text-text font-semibold">{t('settingsEnableSecretPage')}</span>
                    <input
                      type="checkbox"
                      checked={editConfig.isSecretPageEnabled}
                      onChange={(e) => setEditConfig({ ...editConfig, isSecretPageEnabled: e.target.checked })}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">
                    {t('settingsSecretPasscode')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={editConfig.secretPagePasscode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setEditConfig({ ...editConfig, secretPagePasscode: v });
                    }}
                    placeholder="123456"
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none tracking-widest font-mono"
                  />
                  <p className="text-xs text-primary/60 mt-1">Chỉ nhập 6 chữ số • Enter exactly 6 digits</p>
                </div>

                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('settingsCakeBlowMsg')}</label>
                  <input
                    type="text"
                    value={editContent.cakeMessage}
                    onChange={(e) => handleContentTextChange('cakeMessage', e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text/85 font-bold uppercase mb-1.5">{t('settingsGiftBoxMsg')}</label>
                  <textarea
                    value={editContent.giftBoxMessage}
                    onChange={(e) => handleContentTextChange('giftBoxMessage', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded bg-white border border-primary/20 focus:border-primary text-text text-xs outline-none"
                  />
                </div>
              </div>

              {/* ══════════════════ BIRTHDAY GALLERY MANAGER ══════════════════ */}
              <div className="border border-primary/20 rounded-xl p-5 bg-primary/3" style={{ marginTop: 24 }}>
                <h4 className="text-text font-bold text-sm uppercase tracking-wide mb-1 flex items-center gap-2">
                  🎂 Birthday Gallery — Ảnh Trong Hộp Quà
                </h4>
                <p className="text-text/60 text-xs mb-4">
                  Những ảnh này sẽ bung ra từ hộp quà khi bộ đếm sinh nhật kết thúc. Nhấn <strong>Lưu</strong> sau khi thêm/sửa.
                </p>

                {/* Existing photos grid */}
                {(editContent?.birthdayGallery || []).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {(editContent.birthdayGallery as any[]).map((item: any, idx: number) => (
                      <div key={idx} className="relative bg-white rounded-lg p-2 border border-primary/15 shadow-sm">
                        {/* Thumbnail */}
                        <div className="w-full aspect-[4/3] overflow-hidden rounded bg-rose-50 mb-2">
                          <img
                            src={item.url}
                            alt={item.caption}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75"><rect fill="%23FFE4EF" width="100" height="75"/><text fill="%23FF7597" x="50" y="42" text-anchor="middle" font-size="20">📸</text></svg>'; }}
                          />
                        </div>
                        {/* Caption input */}
                        <input
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => handleBdayGalleryCaptionChange(idx, e.target.value)}
                          placeholder="Chú thích ảnh..."
                          className="w-full text-xs px-2 py-1 rounded border border-primary/20 focus:border-primary outline-none text-text"
                        />
                        {/* Remove button */}
                        <button
                          onClick={() => handleBdayGalleryRemove(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload new photo form */}
                <form onSubmit={handleBdayGalleryUpload} className="flex flex-col sm:flex-row gap-2 items-end w-full">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] text-text/60 font-semibold uppercase mb-1">Chọn ảnh / Select Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBdayGalleryFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-text/80 px-2 py-1 border border-primary/20 rounded bg-white outline-none"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] text-text/60 font-semibold uppercase mb-1">Chú thích / Caption</label>
                    <input
                      type="text"
                      value={bdayGalleryCaption}
                      onChange={(e) => setBdayGalleryCaption(e.target.value)}
                      placeholder="Chú thích ảnh (tuỳ chọn)"
                      className="w-full px-3 py-1 rounded border border-primary/20 focus:border-primary text-text text-xs outline-none"
                      style={{ height: 30 }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!bdayGalleryFile || isUploadingBdayGallery}
                    className="px-4 py-1 rounded bg-primary text-white font-bold text-xs uppercase disabled:opacity-50 cursor-pointer hover:bg-primary/80 transition-colors whitespace-nowrap flex items-center justify-center"
                    style={{ height: 30 }}
                  >
                    {isUploadingBdayGallery ? 'Đang tải...' : '+ Thêm Ảnh'}
                  </button>
                </form>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    saveEffectsConfig();
                    saveRelationshipsContent();
                  }}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/80 text-white font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Save size={14} />
                  {t('settingsSaveBtn')}
                </button>
              </div>
            </div>

            {/* Background Music file manager */}
            <div className="border-t border-primary/10 pt-6">
              <h3 className="text-text font-bold text-base uppercase mb-4">
                Site-Wide Background Music
              </h3>
              
              <div className="space-y-4 max-w-lg bg-primary/5 p-4 rounded-lg border border-primary/10">
                {editConfig.bgMusicUrl ? (
                  <div className="flex items-center justify-between text-xs">
                    <div className="truncate pr-4">
                      <p className="text-text font-semibold">Active Music File</p>
                      <a href={getFullUrl(editConfig.bgMusicUrl)} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate block max-w-xs mt-1">
                        {editConfig.bgMusicUrl}
                      </a>
                    </div>
                    <button
                      onClick={handleBgMusicDelete}
                      className="px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBgMusicUpload} className="space-y-2">
                    <label className="block text-xs text-text/80 font-bold uppercase">Upload background audio track</label>
                    <input
                      type="file"
                      required
                      accept="audio/*"
                      onChange={(e) => setBgMusicFile(e.target.files?.[0] || null)}
                      className="text-xs text-text/80 block"
                    />
                    <button
                      type="submit"
                      disabled={isUploadingBgMusic || !bgMusicFile}
                      className="px-4 py-1.5 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
                    >
                      {isUploadingBgMusic ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Upload track
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Archive Vault management section */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3 flex items-center gap-2">
              <Lock size={18} className="text-primary animate-pulse" />
              {t('archiveVaultTitle')}
            </h3>
            <p className="text-xs text-text/70 leading-relaxed">
              {t('archiveVaultDesc')}
            </p>

            {/* List of Secret Letters */}
            <div className="border-t border-primary/10 pt-6">
              <h4 className="text-text text-sm font-semibold uppercase mb-4 flex items-center gap-1.5">
                💌 {t('secretLettersTitle')} ({letters.filter(l => l.isSecret).length})
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {letters.filter(l => l.isSecret).map((lettr) => (
                  <div key={lettr._id} className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex justify-between items-start gap-2">
                    <div className="text-xs flex-1 min-w-0">
                      <p className="text-text font-bold truncate">{lettr.title}</p>
                      <p className="text-text/60 mt-0.5 truncate max-w-md">{lettr.content.substring(0, 80)}...</p>
                    </div>
                    <button
                      onClick={() => api.updateLetter(lettr._id, { isSecret: false }).then(() => api.getLetters().then(setLetters))}
                      className="px-3 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title={t('releaseToHome')}
                    >
                      {t('releaseToHome')}
                    </button>
                  </div>
                ))}
                {letters.filter(l => l.isSecret).length === 0 && (
                  <div className="text-xs text-text/60 py-4 bg-primary/5 rounded-lg border border-dashed border-primary/20 text-center">
                    <p className="mb-2">{t('noSecretLetters')}</p>
                    <button 
                      onClick={() => setActiveTab('letters')} 
                      className="px-3 py-1 rounded bg-primary text-white text-[11px] font-bold tracking-wider hover:bg-primary/80 transition-colors cursor-pointer"
                    >
                      {t('composeNewSecretLetter')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* List of Secret Photos */}
            <div className="border-t border-primary/10 pt-6">
              <h4 className="text-text text-sm font-semibold uppercase mb-4 flex items-center gap-1.5">
                📸 {t('secretPhotosTitle')} ({photos.filter(p => p.isSecret).length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.filter(p => p.isSecret).map((photo) => (
                  <div key={photo._id} className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex flex-col justify-between gap-3">
                    <div className="flex gap-3 items-center">
                      <img
                        src={getFullUrl(photo.url)}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg border border-primary/15 shadow-sm"
                      />
                      <div className="text-xs min-w-0 flex-1">
                        <p className="text-text truncate font-bold">{photo.description || 'No description'}</p>
                        <p className="text-text/60 truncate mt-0.5">{photo.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => api.updatePhoto(photo._id, { isSecret: false }).then(() => loadAllContent())}
                        className="flex-1 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-semibold text-center cursor-pointer transition-colors"
                        title={t('releaseToHome')}
                      >
                        {t('releaseToHome')}
                      </button>
                      <button
                        onClick={() => {
                          showConfirm('Bạn có chắc chắn muốn xóa ảnh này vĩnh viễn không?', async () => {
                            try {
                              await api.deletePhoto(photo._id);
                              setPhotos(prev => prev.filter(p => p._id !== photo._id));
                              showAlert('Đã xóa hình ảnh thành công! 🗑️');
                            } catch (e) {
                              console.error(e);
                              showAlert('Lỗi khi xóa hình ảnh.', 'error');
                            }
                          });
                        }}
                        className="p-1 text-red-400 hover:text-white hover:bg-red-400 rounded-lg transition-all cursor-pointer"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {photos.filter(p => p.isSecret).length === 0 && (
                <div className="text-xs text-text/60 py-4 bg-primary/5 rounded-lg border border-dashed border-primary/20 text-center">
                  <p className="mb-2">{t('noSecretPhotos')}</p>
                  <button 
                    onClick={() => setActiveTab('photos')} 
                    className="px-3 py-1 rounded bg-primary text-white text-[11px] font-bold tracking-wider hover:bg-primary/80 transition-colors cursor-pointer"
                  >
                    {t('uploadNewSecretPhoto')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR CODE GENERATOR */}
        {activeTab === 'qr' && <QrCodeTab showAlert={showAlert} />}
      </div>

      {/* Reusable Custom Dialog Modal */}
      {modalAlert && modalAlert.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-primary/20 text-left">
            <h4 className="text-text font-bold text-base mb-2 flex items-center gap-2">
              {modalAlert.type === 'success' && '🌸'}
              {modalAlert.type === 'error' && '⚠️'}
              {modalAlert.type === 'info' && 'ℹ️'}
              {modalAlert.type === 'confirm' && '❓'}
              {modalAlert.title}
            </h4>
            <p className="text-text/80 text-xs mb-6 leading-relaxed">
              {modalAlert.message}
            </p>
            <div className="flex justify-end gap-3">
              {modalAlert.type === 'confirm' && (
                <button
                  onClick={modalAlert.onCancel}
                  className="px-4 py-2 rounded-full border border-primary/20 text-text/75 hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                onClick={modalAlert.onConfirm}
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary/80 text-white text-xs font-semibold shadow-md cursor-pointer transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
