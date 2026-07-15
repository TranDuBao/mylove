import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScratchCard as ScratchCardType, StickerConfig, CornerDecoration } from '../../types/scratchcard.js';
import ScratchCanvas from './ScratchCanvas.js';
import HiddenContent from './HiddenContent.js';
import CelebrationOverlay from './CelebrationOverlay.js';
import { useProgressEffects } from './hooks/useProgressEffects.js';
import { useThemeContext } from '../../context/ThemeContext.js';

interface ScratchCardProps {
  card: ScratchCardType;
}

/**
 * Individual Scratch Card with scrapbook-style frame, scratch canvas overlay,
 * hidden content, progress milestones, and celebration animations.
 */
const ScratchCard: React.FC<ScratchCardProps> = ({ card }) => {
  const { language } = useThemeContext();
  const [percentage, setPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize nested objects defensively
  const scratchLayer = card.scratchLayer || { preset: 'pink-paper', color: '#FFB6C1', opacity: 1, textureIntensity: 0.6, customImageUrl: '' };
  const brush = card.brush || { size: 35, hardness: 0.3, feather: 0.7, opacity: 1, smoothing: 0.5 };
  const reveal = card.reveal || { percentageRequired: 60, autoReveal: false, fadeOutDuration: 800, scaleAnimation: true, bounceAnimation: true };
  const content = card.content || { type: 'text', textContent: 'I love you! 💖', textContentEn: 'I love you! 💖', textColor: '#c0396b', fontFamily: 'Dancing Script', fontSize: 24, imageUrl: '', imageAlt: '', imageAltEn: '', imageMode: 'fit', videoUrl: '', youtubeUrl: '', galleryImages: [], countdownDate: '', countdownLabel: '', countdownLabelEn: '', audioUrl: '', audioLabel: '', audioLabelEn: '', htmlContent: '', qrData: '', qrSize: 200, buttonText: 'Click Me', buttonTextEn: 'Click Me', buttonUrl: '', buttonColor: '#FF5C93', backgroundColor: '#FFF4F8' };
  const effects = card.effects || { hearts: true, sparkles: true, butterflies: false, sakura: false, confetti: true, fireworks: false, balloons: false, glow: true, cameraShake: false, auroraLight: false, lightSweep: true };
  const milestones = card.milestones || [
    { percentage: 10, effect: 'sparkle' },
    { percentage: 25, effect: 'glow' },
    { percentage: 40, effect: 'hearts' },
    { percentage: 60, effect: 'autoReveal' },
    { percentage: 80, effect: 'confetti' },
    { percentage: 100, effect: 'celebration' }
  ];

  const handleReveal = useCallback(() => {
    if (isRevealed) return;
    setIsRevealed(true);
    // Slight delay before celebration for drama
    setTimeout(() => setShowCelebration(true), reveal.fadeOutDuration * 0.3);
  }, [isRevealed, reveal.fadeOutDuration]);

  const { checkMilestones } = useProgressEffects({
    milestones: milestones,
    containerRef,
    onAutoReveal: reveal.autoReveal ? handleReveal : undefined,
  });

  const handlePercentageChange = useCallback(
    (pct: number) => {
      setPercentage(pct);
      checkMilestones(pct);
    },
    [checkMilestones]
  );

  // Scrapbook tape corner decorations
  const tapeCorners = useMemo(
    () => (
      <>
        <div className="sc-tape sc-tape-tl" />
        <div className="sc-tape sc-tape-tr" />
      </>
    ),
    []
  );

  const frameConfig = card.frameConfig;
  const showDefaultTape = !frameConfig;

  // Build custom frame styling
  const customFrameStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: `${card.width}px`,
    aspectRatio: `${card.width} / ${card.height}`,
    borderRadius: `${card.borderRadius}px`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  if (frameConfig) {
    customFrameStyle.borderWidth = `${frameConfig.borderWidth}px`;
    customFrameStyle.borderStyle = frameConfig.borderStyle || 'solid';
    customFrameStyle.borderColor = frameConfig.borderColor || '#ffffff';
    customFrameStyle.backgroundColor = frameConfig.backgroundColor || 'rgba(255, 255, 255, 0.65)';
    if (frameConfig.gradient) {
      customFrameStyle.background = frameConfig.gradient;
    }
    if (frameConfig.shadow) {
      customFrameStyle.boxShadow = frameConfig.shadow;
    }
    if (frameConfig.blur) {
      customFrameStyle.filter = `blur(${frameConfig.blur}px)`;
    }
    if (frameConfig.innerPadding) {
      customFrameStyle.padding = `${frameConfig.innerPadding}px`;
    }
  }

  const renderCornerDecoration = (position: 'tl' | 'tr' | 'bl' | 'br', corner?: CornerDecoration) => {
    if (!corner || corner.type === 'none' || !corner.content) return null;
    
    const halfSize = corner.size / 2;
    const style: React.CSSProperties = {
      position: 'absolute',
      width: `${corner.size}px`,
      height: `${corner.size}px`,
      zIndex: 25,
      pointerEvents: 'none',
    };
    
    if (position === 'tl') { style.top = -halfSize; style.left = -halfSize; }
    if (position === 'tr') { style.top = -halfSize; style.right = -halfSize; }
    if (position === 'bl') { style.bottom = -halfSize; style.left = -halfSize; }
    if (position === 'br') { style.bottom = -halfSize; style.right = -halfSize; }

    return (
      <div style={style}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {corner.type === 'emoji' ? (
            <span style={{ fontSize: `${corner.size * 0.7}px`, lineHeight: 1 }}>{corner.content}</span>
          ) : (
            <img src={corner.content} alt="Corner" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          )}
        </div>
      </div>
    );
  };

  const renderSticker = (sticker: StickerConfig) => {
    if (sticker.isHidden) return null;
    
    const stickerStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${sticker.x}%`,
      top: `${sticker.y}%`,
      width: `${sticker.width}%`,
      zIndex: sticker.zIndex || 5,
      opacity: sticker.opacity,
      pointerEvents: 'none',
      userSelect: 'none',
    };
    
    const filterParts: string[] = [];
    if (sticker.brightness !== undefined) filterParts.push(`brightness(${sticker.brightness}%)`);
    if (sticker.contrast !== undefined) filterParts.push(`contrast(${sticker.contrast}%)`);
    if (sticker.saturation !== undefined) filterParts.push(`saturate(${sticker.saturation}%)`);
    if (sticker.hueRotate !== undefined) filterParts.push(`hue-rotate(${sticker.hueRotate}deg)`);
    if (sticker.blur) filterParts.push(`blur(${sticker.blur}px)`);
    
    if (sticker.glowColor) {
      filterParts.push(`drop-shadow(0 0 8px ${sticker.glowColor})`);
    } else if (sticker.shadow) {
      filterParts.push(`drop-shadow(${sticker.shadow})`);
    }

    const contentStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      height: 'auto',
      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scaleX(${sticker.flipX ? -1 : 1}) scaleY(${sticker.flipY ? -1 : 1})`,
      filter: filterParts.length > 0 ? filterParts.join(' ') : undefined,
    };

    const animClass = sticker.animation && sticker.animation !== 'none' ? `anim-sticker-${sticker.animation}` : '';

    return (
      <div key={sticker.id} style={stickerStyle} className={animClass}>
        {sticker.type === 'emoji' ? (
          <span style={{ ...contentStyle, fontSize: '3rem', textAlign: 'center', lineHeight: 1 }}>
            {sticker.content}
          </span>
        ) : (
          <img src={sticker.content} alt="Sticker" style={contentStyle} />
        )}
      </div>
    );
  };

  return (
    <motion.div
      className="sc-card-wrapper"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        opacity: card.opacity,
        transform: card.rotation ? `rotate(${card.rotation}deg)` : undefined,
        margin: frameConfig?.outerMargin ? `${frameConfig.outerMargin}px` : undefined,
        maxWidth: `${card.width}px`,
        width: '100%',
      }}
    >
      {/* Card Title */}
      <div className="sc-card-title">
        <span className="sc-card-emoji">{card.emoji}</span>
        <h3 className="sc-card-name">
          {language === 'en' && card.titleEn ? card.titleEn : card.title}
        </h3>
      </div>

      {/* Frame and Stickers container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: `${card.width}px` }}>
        {/* Card Frame */}
        <div
          ref={containerRef}
          className={`sc-card-frame ${isRevealed ? 'sc-card-revealed' : ''}`}
          style={customFrameStyle}
        >
          {/* Paper Texture Overlay */}
          {frameConfig?.paperTexture && frameConfig.paperTexture !== 'none' && (
            <div
              className={`paper-texture-${frameConfig.paperTexture}`}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 10,
                mixBlendMode: frameConfig.paperTexture === 'frosted' || frameConfig.paperTexture === 'acrylic' ? 'normal' : 'multiply',
                opacity: frameConfig.paperTexture === 'frosted' ? 1 : 0.4,
              }}
            />
          )}

          {/* Tape decorations */}
          {showDefaultTape && tapeCorners}

          {/* Corner Decorations */}
          {frameConfig && (
            <>
              {renderCornerDecoration('tl', frameConfig.topLeftCorner)}
              {renderCornerDecoration('tr', frameConfig.topRightCorner)}
              {renderCornerDecoration('bl', frameConfig.bottomLeftCorner)}
              {renderCornerDecoration('br', frameConfig.bottomRightCorner)}
            </>
          )}

          {/* Hidden content layer (below) */}
          <div
            className="sc-hidden-layer"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
            }}
          >
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{
                    scale: reveal.scaleAnimation ? [0.85, 1.05, 1] : 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: reveal.fadeOutDuration / 1000,
                    ease: reveal.bounceAnimation ? 'backOut' : 'easeOut',
                  }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <HiddenContent
                    config={content}
                    width={card.width}
                    height={card.height}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show content statically underneath before reveal (partially visible through scratches) */}
            {!isRevealed && (
              <HiddenContent
                config={content}
                width={card.width}
                height={card.height}
              />
            )}
          </div>

          {/* Scratch canvas layer (above) */}
          <AnimatePresence>
            {!isRevealed && (
              <motion.div
                exit={{
                  opacity: 0,
                  scale: 1.05,
                }}
                transition={{ duration: reveal.fadeOutDuration / 1000, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                }}
              >
                <ScratchCanvas
                  width={card.width}
                  height={card.height}
                  layer={scratchLayer}
                  brush={brush}
                  onPercentageChange={handlePercentageChange}
                  onRevealed={handleReveal}
                  revealPercentage={reveal.percentageRequired}
                  autoReveal={reveal.autoReveal}
                  isRevealed={isRevealed}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Celebration overlay */}
          <CelebrationOverlay
            isActive={showCelebration}
            effects={effects}
          />
        </div>

        {/* Stickers Overlay */}
        {frameConfig?.stickers && frameConfig.stickers.map(sticker => renderSticker(sticker))}
      </div>

      {/* Progress bar */}
      {!isRevealed && percentage > 0 && (
        <motion.div
          className="sc-progress-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="sc-progress-track">
            <motion.div
              className="sc-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="sc-progress-text">{percentage}%</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScratchCard;
