import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedDataUrl: string) => void;
  imageSrc: string;
  cardWidth: number;
  cardHeight: number;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  onCrop,
  imageSrc,
  cardWidth,
  cardHeight,
}) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ naturalWidth: 0, naturalHeight: 0 });

  const VIEWPORT_WIDTH = 300;
  const aspectRatio = cardWidth / cardHeight;
  const VIEWPORT_HEIGHT = VIEWPORT_WIDTH / aspectRatio;

  // Reset scale and offset, and preload image to get dimensions
  useEffect(() => {
    if (isOpen && imageSrc) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setDimensions({ naturalWidth: 0, naturalHeight: 0 });

      // Preload image to get dimensions (crucial for base64 which loads synchronously)
      const img = new Image();
      img.onload = () => {
        setDimensions({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      };
      img.src = imageSrc;
    }
  }, [imageSrc, isOpen]);

  if (!isOpen || !imageSrc) return null;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    });
  };

  // Calculate base size to fit the cover strategy
  let baseWidth = VIEWPORT_WIDTH;
  let baseHeight = VIEWPORT_HEIGHT;
  if (dimensions.naturalWidth && dimensions.naturalHeight) {
    const imgRatio = dimensions.naturalWidth / dimensions.naturalHeight;
    const vpRatio = VIEWPORT_WIDTH / VIEWPORT_HEIGHT;
    if (imgRatio > vpRatio) {
      baseHeight = VIEWPORT_HEIGHT;
      baseWidth = VIEWPORT_HEIGHT * imgRatio;
    } else {
      baseWidth = VIEWPORT_WIDTH;
      baseHeight = VIEWPORT_WIDTH / imgRatio;
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const nextX = e.clientX - dragStart.current.x;
    const nextY = e.clientY - dragStart.current.y;
    setOffset({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const nextX = touch.clientX - dragStart.current.x;
    const nextY = touch.clientY - dragStart.current.y;
    setOffset({ x: nextX, y: nextY });
  };

  const handleSave = () => {
    if (!imageRef.current || !dimensions.naturalWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = cardWidth;
    canvas.height = cardHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const factor = cardWidth / VIEWPORT_WIDTH;
    const baseWidthCanvas = baseWidth * factor;
    const baseHeightCanvas = baseHeight * factor;
    const xCanvas = offset.x * factor;
    const yCanvas = offset.y * factor;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    ctx.save();
    ctx.translate(cardWidth / 2 + xCanvas, cardHeight / 2 + yCanvas);
    ctx.scale(scale, scale);
    ctx.drawImage(
      imageRef.current,
      -baseWidthCanvas / 2,
      -baseHeightCanvas / 2,
      baseWidthCanvas,
      baseHeightCanvas
    );
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-primary/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5">
          <h3 className="font-bold text-text uppercase tracking-wide text-sm flex items-center gap-2">
            ✂️ Cắt hình ảnh
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-text/50 hover:text-text cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border-b border-primary/5">
          <div
            className="relative border-2 border-primary/30 rounded-lg shadow-md overflow-hidden bg-gray-200 select-none cursor-move touch-none"
            style={{
              width: `${VIEWPORT_WIDTH}px`,
              height: `${VIEWPORT_HEIGHT}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Source"
              onLoad={handleImageLoad}
              className="absolute pointer-events-none"
              style={{
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                maxWidth: 'none',
                maxHeight: 'none',
              }}
            />
            {/* Aspect ratio guide overlay */}
            <div className="absolute inset-0 pointer-events-none border border-white/40 flex items-center justify-center">
              <div className="w-full h-[0.5px] bg-white/20 absolute" />
              <div className="h-full w-[0.5px] bg-white/20 absolute" />
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-text/40 font-semibold uppercase tracking-wider">
            <Move size={10} /> kéo để di chuyển ảnh
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-text/60">
              <span className="flex items-center gap-1"><ZoomOut size={12} /> Thu nhỏ</span>
              <span className="flex items-center gap-1">Phóng to <ZoomIn size={12} /></span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-primary/10 accent-primary rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/80 transition-colors shadow-md shadow-primary/20 cursor-pointer"
            >
              Cắt & Lưu
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-white text-text/60 border border-primary/15 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ImageCropperModal;
