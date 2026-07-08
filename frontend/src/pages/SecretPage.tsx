import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../context/ThemeContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, AlertCircle, Eye, EyeOff, Heart, Mail, ChevronDown, X, Sparkles } from 'lucide-react';
import { api } from '../utils/api.js';
import type { Photo, Letter } from '../types/index.js';
import confetti from 'canvas-confetti';
import { BirthdayCelebration } from '../components/BirthdayCelebration.js';
import { CustomLightbox } from '../components/GalleryCarousel.js';

// --- Typewriter Effect Component ---
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 30 }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      setDisplayed(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      <span className="inline-block w-0.5 h-5 bg-current ml-0.5 animate-pulse align-middle" />
    </span>
  );
};

// --- Secret Letter Card ---
const SecretLetterCard: React.FC<{ letter: Letter }> = ({ letter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => setShowContent(true), 600);
  };

  const handleClose = () => {
    setShowContent(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      {/* Envelope Card (closed state) */}
      {!isOpen && (
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpen}
          className="relative cursor-pointer select-none"
        >
          {/* Envelope outer */}
          <div className="w-[320px] h-[200px] bg-[#FFF0F5] rounded-lg shadow-[0_8px_30px_rgba(255,92,147,0.15)] border border-[#FFD6E7] relative overflow-hidden">
            
            {/* Back side triangles */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom right, #FFE4EF 50%, transparent 50%)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom left, #FFE4EF 50%, transparent 50%)' }} />
            
            {/* Bottom triangle (front fold) */}
            <div className="absolute bottom-0 left-0 right-0 h-full"
              style={{ background: '#FFF0F5', clipPath: 'polygon(0 55%, 50% 100%, 100% 55%)' }} />
            
            {/* Top flap */}
            <div className="absolute top-0 left-0 right-0 h-full"
              style={{ 
                background: 'linear-gradient(135deg, #FFD6E7, #FFF0F5)',
                clipPath: 'polygon(0 0, 50% 45%, 100% 0)' 
              }} />

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Mail size={20} className="text-primary animate-bounce" />
              </div>
              <p className="text-[#C4687A] font-bold text-xs uppercase tracking-widest">{letter.title}</p>
              <p className="text-[#D4889A] text-[10px]">Nhấn để mở • Click to open</p>
            </div>

            {/* Wax seal */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-rose-500 border-2 border-white/50 shadow-md flex items-center justify-center z-20">
              <Heart size={12} className="text-white fill-white" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Letter Full Screen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(255, 200, 220, 0.4)', backdropFilter: 'blur(12px)' }}
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.7, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 180 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{
                backgroundColor: letter.background || '#FCF8F2',
                color: letter.color || '#4A3B32',
                fontFamily: letter.font || 'Sacramento, cursive',
              }}
            >
              {/* Paper texture lines */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{ background: 'repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,1) 28px)', backgroundSize: '100% 28px' }} />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-current flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>

              {/* Letter content */}
              <div className="p-8 md:p-12 relative z-10">
                {/* Letter header */}
                <div className="border-b border-current/10 pb-5 mb-6 flex justify-between items-end">
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight">{letter.title}</h3>
                  <span className="text-xs opacity-50" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                  </span>
                </div>

                {/* Letter body — typewriter on first reveal */}
                <div className="text-xl md:text-2xl leading-loose">
                  {showContent && <TypewriterText text={letter.content} speed={25} />}
                </div>

                {/* Decorative signature */}
                <div className="mt-8 text-right text-2xl opacity-60">
                  — Anh yêu em mãi mãi ❤️
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main Secret Page ---
export const SecretPage: React.FC = () => {
  const { settings, t } = useThemeContext();
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [secretPhotos, setSecretPhotos] = useState<Photo[]>([]);
  const [secretLetters, setSecretLetters] = useState<Letter[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Custom alerts configuration
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showAlert = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Toggle Favorite
  const handleFavoriteToggle = async (e: React.MouseEvent, photoId: string, currentFav: boolean) => {
    e.stopPropagation();
    try {
      await api.updatePhoto(photoId, { isFavorite: !currentFav });
      setSecretPhotos(prev => prev.map(p => p._id === photoId ? { ...p, isFavorite: !currentFav } : p));
      
      if (!currentFav) {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF7597', '#FF3366', '#FF99AA']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF7597', '#FF3366', '#FF99AA']
        });
        showAlert('Đã lưu bài viết vào mục yêu thích! 💖');
      } else {
        showAlert('Đã bỏ yêu thích. 💔', 'info');
      }
    } catch {
      showAlert('Không thể cập nhật trạng thái yêu thích.', 'error');
    }
  };

  const fireConfetti = () => {
    const colors = ['#FF2E63', '#FF5C93', '#FF8FB1', '#FFFFFF', '#FFD6E7'];
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors });
    setTimeout(() => {
      confetti({ particleCount: 50, spread: 130, origin: { y: 0.5 }, colors, shapes: ['heart'] as any[] });
    }, 300);
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 60, origin: { x: 0.1, y: 0.5 }, angle: 60, colors });
      confetti({ particleCount: 60, spread: 60, origin: { x: 0.9, y: 0.5 }, angle: 120, colors });
    }, 600);
  };

  useEffect(() => {
    if (isUnlocked) {
      fireConfetti();
      const load = async () => {
        try {
          const [photos, letters] = await Promise.all([api.getPhotos(), api.getLetters()]);
          setSecretPhotos(photos.filter(p => p.isSecret));
          setSecretLetters(letters.filter(l => l.isSecret));
        } catch (e) { console.error(e); }
      };
      load();
    }
  }, [isUnlocked]);

  const handleKeyClick = (num: string) => {
    if (passcode.length >= 6) return;
    setErrorMsg(false);
    const next = passcode + num;
    setPasscode(next);
    if (next.length === 6) {
      const correct = settings?.secretPagePasscode || '520131';
      if (next === correct) {
        setTimeout(() => setIsUnlocked(true), 200);
      } else {
        setTimeout(() => {
          setErrorMsg(true);
          setPasscode('');
          setTimeout(() => setErrorMsg(false), 900);
        }, 200);
      }
    }
  };

  const handleBackspace = () => setPasscode(prev => prev.slice(0, -1));
  const handleClear = () => { setPasscode(''); setErrorMsg(false); };

  const getUrl = (url: string) => url.startsWith('/') ? `http://localhost:5000${url}` : url;

  if (!settings?.isSecretPageEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-text text-xl font-bold uppercase tracking-wider mb-2">Secret Page Disabled</h2>
        <p className="text-primary text-sm">The secret archive is currently hidden by the administrator.</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 w-full min-h-[600px] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">

        {/* === LOCK SCREEN === */}
        {!isUnlocked && (
          <motion.div
            key="lock"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24 }}
            className={`glassmorphism p-8 rounded-3xl max-w-xs w-full flex flex-col items-center relative overflow-hidden transition-all ${
              errorMsg ? 'animate-shake border-red-400/40 shadow-[0_0_25px_rgba(239,68,68,0.15)]' : 'border-primary/15'
            }`}
          >
            {/* Decorative background hearts */}
            <div className="absolute top-4 right-4 text-3xl opacity-10 select-none">💖</div>
            <div className="absolute bottom-4 left-4 text-2xl opacity-10 select-none">🌸</div>

            {/* Lock icon */}
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-5">
              <Lock size={22} className="text-primary animate-pulse" />
            </div>

            <h3 className="text-text font-bold text-base uppercase tracking-widest text-center mb-1">{t('secretTitle')}</h3>
            <p className="text-primary/70 text-xs text-center mb-7 leading-relaxed">{t('secretSub')}</p>

            {/* 6 Dot display */}
            <div className="flex items-center gap-2.5 justify-center mb-7 w-full relative">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={i < passcode.length ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                    i < passcode.length
                      ? 'bg-primary border-primary shadow-[0_0_8px_var(--primary-color)]'
                      : 'border-primary/25 bg-transparent'
                  }`}
                />
              ))}
              <button
                onClick={() => setShowCode(!showCode)}
                className="absolute right-0 text-primary/50 hover:text-primary transition-colors cursor-pointer"
              >
                {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Show code text */}
            {showCode && passcode.length > 0 && (
              <p className="text-text font-mono text-sm tracking-widest mb-4 px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">{passcode}</p>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2.5 w-full mb-5">
              {['1','2','3','4','5','6','7','8','9'].map(n => (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleKeyClick(n)}
                  className="h-12 rounded-2xl bg-primary/5 border border-primary/15 hover:bg-primary/10 hover:border-primary/30 text-text font-bold text-lg transition-all cursor-pointer"
                >
                  {n}
                </motion.button>
              ))}
              <motion.button whileTap={{ scale: 0.88 }}
                onClick={handleClear}
                className="h-12 rounded-2xl bg-red-50 border border-red-200/50 hover:bg-red-100/50 text-red-400 font-semibold text-xs transition-all cursor-pointer"
              >
                {t('clear')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.88 }}
                onClick={() => handleKeyClick('0')}
                className="h-12 rounded-2xl bg-primary/5 border border-primary/15 hover:bg-primary/10 hover:border-primary/30 text-text font-bold text-lg transition-all cursor-pointer"
              >
                0
              </motion.button>
              <motion.button whileTap={{ scale: 0.88 }}
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-primary/5 border border-primary/15 hover:bg-primary/10 text-text font-semibold text-xs transition-all cursor-pointer"
              >
                {t('delete')}
              </motion.button>
            </div>

            {/* Unlock button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (passcode.length === 6) handleKeyClick('');
              }}
              disabled={passcode.length === 0}
              className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-rose-400 disabled:opacity-40 text-white font-bold text-sm tracking-wider uppercase transition-all hover:shadow-[0_0_20px_var(--primary-color)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock size={14} />
              {t('unlockArchive')}
            </motion.button>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-red-500 text-xs mt-4"
              >
                <AlertCircle size={12} />
                <span>{t('incorrectPasscode')}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* === UNLOCKED VAULT === */}
        {isUnlocked && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-4xl flex flex-col items-center gap-16"
          >

            {/* Header banner */}
            <div className="glassmorphism px-8 py-8 rounded-3xl w-full max-w-xl text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                {['💕','✨','🌸','💖','⭐'].map((e, i) => (
                  <span key={i} className="absolute text-lg opacity-20 animate-pulse"
                    style={{ top: `${10 + i * 16}%`, left: `${5 + i * 20}%`, animationDelay: `${i * 0.4}s` }}>{e}</span>
                ))}
              </div>

              {/* Candles + Heart row */}
              <div className="flex justify-center items-end gap-10 mb-5">
                {/* Left candle */}
                <div className="flex flex-col items-center gap-0" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <div className="w-1.5 h-4 rounded-full bg-gradient-to-t from-orange-500 via-yellow-300 to-transparent animate-pulse shadow-[0_0_8px_#FFA500]" />
                  <div className="w-4 h-10 rounded-t-sm bg-gradient-to-b from-pink-100 to-pink-200 border border-primary/20 shadow-sm" />
                </div>

                {/* Heart */}
                <Heart
                  size={56}
                  className="text-primary fill-primary animate-beat drop-shadow-[0_0_16px_rgba(255,92,147,0.6)]"
                />

                {/* Right candle */}
                <div className="flex flex-col items-center gap-0" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }}>
                  <div className="w-1.5 h-4 rounded-full bg-gradient-to-t from-orange-500 via-yellow-300 to-transparent animate-pulse shadow-[0_0_8px_#FFA500]" />
                  <div className="w-4 h-10 rounded-t-sm bg-gradient-to-b from-pink-100 to-pink-200 border border-primary/20 shadow-sm" />
                </div>
              </div>

              <h3 className="text-primary text-xl md:text-2xl font-bold uppercase tracking-wide animate-pulse mb-3">
                {t('vaultUnlocked')}
              </h3>
              <p className="text-text text-base font-handwriting leading-relaxed">
                {settings?.secretPageMessage || 'Đây là góc bí mật dành riêng cho em 💕'}
              </p>
            </div>

            {/* === BIRTHDAY CELEBRATION SECTION === */}
            <section className="w-full">
              <BirthdayCelebration />
            </section>

            {/* === SECRET LETTER SECTION === */}
            {secretLetters.length > 0 && (
              <section className="w-full flex flex-col items-center">
                <div className="flex items-center gap-2 mb-8">
                  <div className="h-px w-12 bg-primary/20" />
                  <h4 className="text-text font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <Mail size={14} className="text-primary" />
                    Thư Dành Riêng Cho Em
                  </h4>
                  <div className="h-px w-12 bg-primary/20" />
                </div>

                {/* Letters grid */}
                <div className="flex flex-wrap gap-6 justify-center">
                  {secretLetters.map(letter => (
                    <SecretLetterCard key={letter._id} letter={letter} />
                  ))}
                </div>
              </section>
            )}

            {/* === SECRET PHOTOS SECTION === */}
            {secretPhotos.length > 0 && (
              <section className="w-full flex flex-col items-center">
                <div className="flex items-center gap-2 mb-8">
                  <div className="h-px w-12 bg-primary/20" />
                  <h4 className="text-text font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <Heart size={14} className="text-primary fill-primary" />
                    {t('secretStars')}
                  </h4>
                  <div className="h-px w-12 bg-primary/20" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full px-2 justify-items-center">
                  {secretPhotos.map((photo, idx) => {
                    const skews = ['-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-1'];
                    const sk = skews[idx % skews.length];
                    return (
                      <motion.div
                        key={photo._id}
                        onClick={() => setLightboxIndex(idx)}
                        whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                        className={`bg-white p-3 pb-8 rounded-sm shadow-[0_8px_24px_rgba(255,92,147,0.12)] border border-rose-100 cursor-zoom-in relative ${sk} transition-transform duration-300 max-w-[260px] w-full`}
                      >
                        {/* Paper tape */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-pink-100/70 border border-dashed border-primary/20 rounded-sm -rotate-3 shadow-sm" />

                        {/* Photo */}
                        <div className="w-full aspect-[4/3] overflow-hidden bg-rose-50">
                          <img
                            src={getUrl(photo.url)}
                            alt={photo.description}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Caption */}
                        <p className="text-center text-[#5C3A47] font-handwriting text-base mt-3 px-1 truncate">
                          {photo.description || '💕'}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* custom immersive Lightbox Modal render */}
                <AnimatePresence>
                  {lightboxIndex !== null && (
                    <CustomLightbox
                      photos={secretPhotos}
                      currentIndex={lightboxIndex}
                      onClose={() => setLightboxIndex(null)}
                      onPrev={() => setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : secretPhotos.length - 1))}
                      onNext={() => setLightboxIndex(prev => (prev !== null && prev < secretPhotos.length - 1 ? prev + 1 : 0))}
                      onFavoriteToggle={handleFavoriteToggle}
                      getFullUrl={getUrl}
                      showAlert={showAlert}
                    />
                  )}
                </AnimatePresence>
              </section>
            )}

            {/* Empty state */}
            {secretLetters.length === 0 && secretPhotos.length === 0 && (
              <div className="glassmorphism text-center py-12 px-8 rounded-2xl max-w-sm w-full">
                <p className="text-primary text-4xl mb-4">🌸</p>
                <p className="text-text text-sm">Vault còn trống. Admin hãy đánh dấu thư (🔒 Bí mật) hoặc ảnh (⭐ Favorite) để hiển thị tại đây.</p>
              </div>
            )}

            {/* Lock button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsUnlocked(false); setPasscode(''); }}
              className="px-8 py-2.5 rounded-full bg-primary/8 border border-primary/20 text-text/70 hover:text-text hover:bg-primary/15 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
            >
              🔒 {t('lockVault')}
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Notification banner */}
      <AnimatePresence>
        {alert && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] px-6 py-3.5 rounded-2xl shadow-xl backdrop-blur-md border text-sm font-semibold tracking-wide flex items-center gap-2 select-none ${
              alert.type === 'error' 
                ? 'bg-red-500/90 text-white border-red-400' 
                : alert.type === 'info'
                ? 'bg-rose-100/90 text-rose-700 border-rose-200'
                : 'bg-white/90 text-primary border-primary/20'
            }`}
          >
            <Sparkles size={16} className="text-primary fill-primary animate-pulse" />
            {alert.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecretPage;
