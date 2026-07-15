import React, { useState, useEffect } from 'react';
import type { HiddenContentConfig } from '../../types/scratchcard.js';
import { useThemeContext } from '../../context/ThemeContext.js';

interface HiddenContentProps {
  config: HiddenContentConfig;
  width: number;
  height: number;
}

/**
 * Renders the hidden content underneath the scratch canvas.
 * Supports text, image, video, YouTube, gallery, countdown, audio, QR, button, link, custom HTML.
 */
const HiddenContent: React.FC<HiddenContentProps> = ({ config, width, height }) => {
  const { language } = useThemeContext();

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: config.backgroundColor || '#FFF4F8',
    overflow: 'hidden',
    position: 'relative',
  };

  switch (config.type) {
    case 'text': {
      const text = language === 'en' && config.textContentEn ? config.textContentEn : config.textContent;
      return (
        <div style={containerStyle}>
          <p
            className="sc-hidden-text"
            style={{
              fontFamily: `'${config.fontFamily || 'Dancing Script'}', cursive`,
              fontSize: `${config.fontSize || 24}px`,
              color: config.textColor || '#c0396b',
              textAlign: 'center',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              maxWidth: '90%',
            }}
          >
            {text}
          </p>
        </div>
      );
    }

    case 'image': {
      const isCover = config.imageMode === 'cover';
      const altText = language === 'en' && config.imageAltEn ? config.imageAltEn : config.imageAlt;
      return (
        <div style={isCover ? { ...containerStyle, padding: 0 } : containerStyle}>
          {config.imageUrl ? (
            <img
              src={config.imageUrl}
              alt={altText || 'Hidden surprise'}
              className="sc-hidden-image"
              style={
                isCover
                  ? {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }
                  : {
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 8px 30px rgba(255,92,147,0.15)',
                    }
              }
            />
          ) : (
            <div className="text-center text-text/40 text-sm">
              <span className="text-4xl block mb-2">📷</span>
              <span>Upload an image in admin</span>
            </div>
          )}
        </div>
      );
    }

    case 'video':
      return (
        <div style={containerStyle}>
          {config.videoUrl ? (
            <video
              src={config.videoUrl}
              controls
              className="sc-hidden-video"
              style={{
                maxWidth: '95%',
                maxHeight: '90%',
                borderRadius: '12px',
              }}
            />
          ) : (
            <div className="text-center text-text/40 text-sm">
              <span className="text-4xl block mb-2">🎥</span>
              <span>Add a video URL in admin</span>
            </div>
          )}
        </div>
      );

    case 'youtube':
      return (
        <div style={containerStyle}>
          {config.youtubeUrl ? (
            <iframe
              src={config.youtubeUrl.replace('watch?v=', 'embed/')}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
              style={{
                width: '95%',
                height: '85%',
                borderRadius: '12px',
                border: 'none',
              }}
            />
          ) : (
            <div className="text-center text-text/40 text-sm">
              <span className="text-4xl block mb-2">▶️</span>
              <span>Add a YouTube URL in admin</span>
            </div>
          )}
        </div>
      );

    case 'gallery':
      return (
        <div style={{ ...containerStyle, flexDirection: 'row', gap: '8px', flexWrap: 'wrap', padding: '12px' }}>
          {config.galleryImages.length > 0 ? (
            config.galleryImages.slice(0, 6).map((img, i) => (
              <div
                key={i}
                className="sc-gallery-item"
                style={{
                  width: 'calc(33% - 6px)',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: `rotate(${(Math.random() - 0.5) * 6}deg)`,
                  border: '3px solid white',
                }}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-text/40 text-sm w-full">
              <span className="text-4xl block mb-2">🖼️</span>
              <span>Add gallery images in admin</span>
            </div>
          )}
        </div>
      );

    case 'countdown':
      return <CountdownContent config={config} />;

    case 'audio': {
      const audioText = language === 'en' && config.audioLabelEn ? config.audioLabelEn : config.audioLabel;
      return (
        <div style={containerStyle}>
          <span className="text-5xl mb-4">🎵</span>
          <p
            style={{
              fontFamily: `'${config.fontFamily || 'Dancing Script'}', cursive`,
              color: config.textColor || '#c0396b',
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            {audioText || (language === 'en' ? 'A song for you' : 'Bài hát dành cho em')}
          </p>
          {config.audioUrl ? (
            <audio controls src={config.audioUrl} className="sc-audio-player" style={{ width: '80%' }} />
          ) : (
            <span className="text-text/40 text-xs">Add audio URL in admin</span>
          )}
        </div>
      );
    }

    case 'custom-html':
      return (
        <div
          style={containerStyle}
          dangerouslySetInnerHTML={{ __html: config.htmlContent || '<p>Custom content here</p>' }}
        />
      );

    case 'qrcode': {
      const qrUrl = config.qrData || window.location.href;
      const qrSize = Math.min(config.qrSize || 200, width - 40, height - 80);
      const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrUrl)}&color=c0396b&bgcolor=FFF4F8&margin=10`;
      return (
        <div style={containerStyle}>
          <img
            src={qrSrc}
            alt="QR Code"
            style={{ width: qrSize, height: qrSize, borderRadius: '12px' }}
          />
          <span className="text-xs text-text/50 mt-3 font-mono">Scan me!</span>
        </div>
      );
    }

    case 'button':
    case 'link': {
      const btnText = language === 'en' && config.buttonTextEn ? config.buttonTextEn : config.buttonText;
      return (
        <div style={containerStyle}>
          <span className="text-4xl mb-4">🎁</span>
          <a
            href={config.buttonUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="sc-hidden-button"
            style={{
              padding: '12px 32px',
              background: `linear-gradient(135deg, ${config.buttonColor || '#FF5C93'}, ${config.buttonColor || '#FF5C93'}dd)`,
              color: 'white',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '16px',
              boxShadow: `0 8px 25px ${config.buttonColor || '#FF5C93'}40`,
              transition: 'transform 0.2s',
              display: 'inline-block',
            }}
          >
            {btnText || 'Click Me'}
          </a>
        </div>
      );
    }

    default:
      return (
        <div style={containerStyle}>
          <span className="text-text/40 text-sm">Content type not configured</span>
        </div>
      );
  }
};

// ─── Countdown Sub-Component ────────────────────────────────────────────

const CountdownContent: React.FC<{ config: HiddenContentConfig }> = ({ config }) => {
  const { language } = useThemeContext();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = config.countdownDate ? new Date(config.countdownDate).getTime() : 0;
    if (!target) return;

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [config.countdownDate]);

  const displayLabel = language === 'en' && config.countdownLabelEn ? config.countdownLabelEn : config.countdownLabel;
  const units = [
    { val: timeLeft.days, label: language === 'vi' ? 'Ngày' : 'Days' },
    { val: timeLeft.hours, label: language === 'vi' ? 'Giờ' : 'Hrs' },
    { val: timeLeft.minutes, label: language === 'vi' ? 'Phút' : 'Min' },
    { val: timeLeft.seconds, label: language === 'vi' ? 'Giây' : 'Sec' },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full"
      style={{ backgroundColor: config.backgroundColor || '#FFF4F8', padding: '20px' }}
    >
      <p
        className="text-center mb-4"
        style={{
          fontFamily: `'${config.fontFamily || 'Dancing Script'}', cursive`,
          color: config.textColor || '#c0396b',
          fontSize: '18px',
        }}
      >
        {displayLabel || (language === 'en' ? 'Counting down to our day...' : 'Đếm ngược đến ngày của chúng ta...')}
      </p>
      <div className="flex gap-3 text-center">
        {units.map((unit, i) => (
          <div
            key={i}
            className="flex flex-col items-center"
            style={{
              background: 'rgba(255,92,147,0.08)',
              borderRadius: '12px',
              padding: '8px 12px',
              minWidth: '48px',
            }}
          >
            <span
              className="font-bold text-2xl"
              style={{ color: config.textColor || '#c0396b' }}
            >
              {String(unit.val).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-text/50 font-semibold mt-1">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiddenContent;
