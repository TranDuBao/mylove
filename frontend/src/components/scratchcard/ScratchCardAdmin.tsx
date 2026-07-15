import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useScratchCards } from './hooks/useScratchCards.js';
import { useThemeContext } from '../../context/ThemeContext.js';
import type {
  ScratchCard,
  ScratchLayerPreset,
  HiddenContentType,
  MilestoneEffect,
  ProgressMilestone,
} from '../../types/scratchcard.js';
import {
  createDefaultCard,
  createDefaultScratchLayer,
  createDefaultBrush,
  createDefaultReveal,
  createDefaultContent,
  createDefaultEffects,
  createDefaultSound,
  createDefaultMilestones,
} from '../../types/scratchcard.js';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown, Eye, EyeOff, Edit3, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal.js';
import { FrameDesignerEditor } from './FrameDesignerEditor.js';

// ─── Constants ──────────────────────────────────────────────────────────

const LAYER_PRESETS: { value: ScratchLayerPreset; label: string; icon: string }[] = [
  { value: 'pink-paper', label: 'Pink Paper', icon: '📄' },
  { value: 'cloud-sticker', label: 'Cloud Sticker', icon: '☁️' },
  { value: 'frosted-glass', label: 'Frosted Glass', icon: '🧊' },
  { value: 'washi-tape', label: 'Washi Tape', icon: '🎀' },
  { value: 'watercolor', label: 'Watercolor', icon: '🎨' },
  { value: 'glitter', label: 'Glitter', icon: '✨' },
  { value: 'metallic-foil', label: 'Metallic Foil', icon: '🪩' },
  { value: 'golden-paper', label: 'Golden Paper', icon: '🌟' },
  { value: 'heart-sticker', label: 'Heart Sticker', icon: '💖' },
  { value: 'gift-wrap', label: 'Gift Wrap', icon: '🎁' },
  { value: 'pastel-paint', label: 'Pastel Paint', icon: '🖌️' },
  { value: 'magic-dust', label: 'Magic Dust', icon: '🪄' },
  { value: 'sakura-petals', label: 'Sakura Petals', icon: '🌸' },
  { value: 'silver-scratch', label: 'Silver Scratch', icon: '🥈' },
  { value: 'custom', label: 'Custom Image', icon: '📷' },
];

const CONTENT_TYPES: { value: HiddenContentType; label: string; icon: string }[] = [
  { value: 'text', label: 'Love Text', icon: '💬' },
  { value: 'image', label: 'Image', icon: '📷' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'gallery', label: 'Gallery', icon: '🖼️' },
  { value: 'countdown', label: 'Countdown', icon: '⏰' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'custom-html', label: 'Custom HTML', icon: '🧩' },
  { value: 'qrcode', label: 'QR Code', icon: '📱' },
  { value: 'button', label: 'Button/Link', icon: '🔗' },
  { value: 'link', label: 'External Link', icon: '🌐' },
];

const MILESTONE_EFFECTS: { value: MilestoneEffect; label: string }[] = [
  { value: 'sparkle', label: '✨ Sparkles' },
  { value: 'glow', label: '🔆 Glow' },
  { value: 'hearts', label: '💕 Hearts' },
  { value: 'confetti', label: '🎊 Confetti' },
  { value: 'autoReveal', label: '🎯 Auto Reveal' },
  { value: 'celebration', label: '🎉 Full Celebration' },
];

const EMOJIS = ['💌', '📷', '🎁', '🎂', '❤️', '🌸', '🎥', '💕', '🦋', '⭐', '🎀', '🎵', '🔮', '🌙', '🧸', '💐', '🍰', '🎊', '🩷', '🪄'];

// ─── Admin Panel Component ──────────────────────────────────────────────

export const ScratchCardAdmin: React.FC = () => {
  const { cards, addCard, updateCard, deleteCard, duplicateCard, moveCard } = useScratchCards();
  const { t } = useThemeContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ScratchCard | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['general', 'content']));
  const [showAlert, setShowAlert] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isFrameDesignerOpen, setIsFrameDesignerOpen] = useState(false);
  const [cropper, setCropper] = useState<{
    isOpen: boolean;
    imageSrc: string;
    field: 'customImageUrl' | 'imageUrl' | null;
    width: number;
    height: number;
  }>({
    isOpen: false,
    imageSrc: '',
    field: null,
    width: 320,
    height: 400,
  });

  const editingCard = editDraft;

  // Start editing a card
  const startEdit = useCallback((card: ScratchCard) => {
    setEditingId(card.id);
    setEditDraft({ ...card });
    setOpenSections(new Set(['general', 'content']));
  }, []);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft(null);
  }, []);

  // Save current edit
  const saveEdit = useCallback(() => {
    if (!editDraft || !editingId) return;
    updateCard(editingId, editDraft);
    setEditingId(null);
    setEditDraft(null);
    flash('Card saved! ✅', 'success');
  }, [editDraft, editingId, updateCard]);

  // Update draft field with nested path support
  const updateDraft = useCallback(<K extends keyof ScratchCard>(key: K, value: ScratchCard[K]) => {
    setEditDraft(prev => prev ? { ...prev, [key]: value } : null);
  }, []);

  // Toggle collapsible section
  const toggleSection = useCallback((section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  }, []);

  // Flash alert
  const flash = useCallback((msg: string, type: 'success' | 'error' | 'info') => {
    setShowAlert({ msg, type });
    setTimeout(() => setShowAlert(null), 2500);
  }, []);

  // Handle custom image upload via FileReader
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: 'customImageUrl' | 'imageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCropper({
        isOpen: true,
        imageSrc: dataUrl,
        field,
        width: editDraft?.width || 320,
        height: editDraft?.height || 400,
      });
      // Clear input so same file can be uploaded again
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  }, [editDraft]);

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Alert */}
      {showAlert && (
        <div
          className={`p-3 rounded-xl text-sm font-semibold text-center ${
            showAlert.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
            showAlert.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
            'bg-blue-100 text-blue-700 border border-blue-200'
          }`}
        >
          {showAlert.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-text font-bold text-lg uppercase tracking-wide border-b border-primary/10 pb-3 flex items-center gap-2">
          ✨ {t('scAdminTitle') || 'Scratch Card Manager'}
        </h3>
        <button
          onClick={() => { addCard(); flash(t('language') === 'vi' ? 'Đã tạo thẻ mới! 🎉' : 'New card created! 🎉', 'success'); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/80 transition-colors cursor-pointer"
        >
          <Plus size={14} /> {t('scAdminAddCard') || 'Add Card'}
        </button>
      </div>

      {/* Card List or Editor */}
      {editingId && editingCard ? (
        <CardEditor
          card={editingCard}
          updateDraft={updateDraft}
          openSections={openSections}
          toggleSection={toggleSection}
          onSave={saveEdit}
          onCancel={cancelEdit}
          handleImageUpload={handleImageUpload}
          onOpenFrameDesigner={() => setIsFrameDesignerOpen(true)}
        />
      ) : (
        <CardList
          cards={cards}
          onEdit={startEdit}
          onDelete={(id) => { deleteCard(id); flash('Card deleted 🗑️', 'info'); }}
          onDuplicate={(id) => { duplicateCard(id); flash('Card duplicated! 📋', 'success'); }}
          onMove={moveCard}
          onToggleVisibility={(card) => updateCard(card.id, { isVisible: !card.isVisible })}
        />
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropper.isOpen}
        imageSrc={cropper.imageSrc}
        cardWidth={cropper.width}
        cardHeight={cropper.height}
        onClose={() => setCropper(prev => ({ ...prev, isOpen: false }))}
        onCrop={(croppedDataUrl) => {
          if (!cropper.field) return;
          if (cropper.field === 'customImageUrl') {
            updateDraft('scratchLayer', { ...editDraft!.scratchLayer, customImageUrl: croppedDataUrl });
          } else {
            updateDraft('content', { ...editDraft!.content, imageUrl: croppedDataUrl });
          }
        }}
      />

      {/* Frame Designer Modal */}
      {editDraft && (
        <FrameDesignerEditor
          isOpen={isFrameDesignerOpen}
          onClose={() => setIsFrameDesignerOpen(false)}
          card={editDraft}
          onSave={(updatedFrameConfig) => {
            updateDraft('frameConfig', updatedFrameConfig);
            setIsFrameDesignerOpen(false);
            flash('Thiết kế viền đã được cập nhật! 🎨', 'success');
          }}
        />
      )}
    </div>
  );
};

// ─── Card List Component ────────────────────────────────────────────────

interface CardListProps {
  cards: ScratchCard[];
  onEdit: (card: ScratchCard) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onToggleVisibility: (card: ScratchCard) => void;
}

const CardList: React.FC<CardListProps> = ({ cards, onEdit, onDelete, onDuplicate, onMove, onToggleVisibility }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-text/40">
        <span className="text-5xl block mb-4">🃏</span>
        <p className="text-sm font-semibold">No scratch cards yet</p>
        <p className="text-xs mt-1">Click "Add Card" to create your first one</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
            card.isVisible
              ? 'bg-primary/5 border-primary/10 hover:border-primary/25'
              : 'bg-gray-50 border-gray-200 opacity-60'
          }`}
        >
          {/* Order */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onMove(card.id, 'up')}
              disabled={index === 0}
              className="p-0.5 rounded hover:bg-primary/10 disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
            >
              <ArrowUp size={12} className="text-text/50" />
            </button>
            <button
              onClick={() => onMove(card.id, 'down')}
              disabled={index === cards.length - 1}
              className="p-0.5 rounded hover:bg-primary/10 disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
            >
              <ArrowDown size={12} className="text-text/50" />
            </button>
          </div>

          {/* Card info */}
          <span className="text-2xl">{card.emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-text truncate">{card.title}</h4>
            <p className="text-[10px] text-text/40 font-mono uppercase">
              {card.scratchLayer?.preset || 'unknown'} • {card.content?.type || 'unknown'} • {card.isVisible ? 'Visible' : 'Hidden'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleVisibility(card)}
              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
              title={card.isVisible ? 'Hide' : 'Show'}
            >
              {card.isVisible ? <Eye size={14} className="text-primary" /> : <EyeOff size={14} className="text-text/30" />}
            </button>
            <button
              onClick={() => onEdit(card)}
              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit3 size={14} className="text-text/60" />
            </button>
            <button
              onClick={() => onDuplicate(card.id)}
              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
              title="Duplicate"
            >
              <Copy size={14} className="text-text/60" />
            </button>
            <button
              onClick={() => { if (confirm(`Delete "${card.title}"?`)) onDelete(card.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Card Editor Component ──────────────────────────────────────────────

interface CardEditorProps {
  card: ScratchCard;
  updateDraft: <K extends keyof ScratchCard>(key: K, value: ScratchCard[K]) => void;
  openSections: Set<string>;
  toggleSection: (s: string) => void;
  onSave: () => void;
  onCancel: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: 'customImageUrl' | 'imageUrl') => void;
  onOpenFrameDesigner: () => void;
}

const CardEditor: React.FC<CardEditorProps> = ({
  card,
  updateDraft,
  openSections,
  toggleSection,
  onSave,
  onCancel,
  handleImageUpload,
  onOpenFrameDesigner,
}) => {
  const { t } = useThemeContext();
  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{card.emoji}</span>
          <div>
            <h4 className="text-sm font-bold text-text">Editing: {card.title}</h4>
            <p className="text-[10px] text-text/40 font-mono uppercase">ID: {card.id.slice(0, 12)}…</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/80 transition-colors cursor-pointer"
          >
            <Save size={12} /> Save
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-text/60 border border-primary/15 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>

      {/* ─── General ─────────────────────────────────────────── */}
      <CollapsibleSection title={t('scSectionGeneral') || 'General'} id="general" open={openSections.has('general')} toggle={toggleSection}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>{t('scLabelTitleVi') || 'Title (Vietnamese)'}</Label>
            <input
              type="text"
              value={card.title}
              onChange={e => updateDraft('title', e.target.value)}
              className="sc-admin-input"
            />
          </div>
          <div className="col-span-2">
            <Label>{t('scLabelTitleEn') || 'Title (English)'}</Label>
            <input
              type="text"
              value={card.titleEn || ''}
              onChange={e => updateDraft('titleEn', e.target.value)}
              className="sc-admin-input"
              placeholder={t('language') === 'vi' ? 'Để trống nếu muốn dùng tiêu đề Tiếng Việt...' : 'Leave blank to use Vietnamese title...'}
            />
          </div>
          <div>
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {EMOJIS.map(em => (
                <button
                  key={em}
                  onClick={() => updateDraft('emoji', em)}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center cursor-pointer transition-all ${
                    card.emoji === em ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-white hover:bg-primary/5 border border-primary/10'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>{t('scLabelDescVi') || 'Description (Vietnamese)'}</Label>
            <input
              type="text"
              value={card.description}
              onChange={e => updateDraft('description', e.target.value)}
              className="sc-admin-input"
              placeholder={t('language') === 'vi' ? 'Cào để khám phá...' : 'Scratch to reveal...'}
            />
          </div>
          <div>
            <Label>{t('scLabelDescEn') || 'Description (English)'}</Label>
            <input
              type="text"
              value={card.descriptionEn || ''}
              onChange={e => updateDraft('descriptionEn', e.target.value)}
              className="sc-admin-input"
              placeholder={t('language') === 'vi' ? 'Cào để khám phá...' : 'Scratch to reveal...'}
            />
          </div>
          <div>
            <Label>{t('scLabelVisible') || 'Visible'}</Label>
            <ToggleSwitch
              checked={card.isVisible}
              onChange={v => updateDraft('isVisible', v)}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* ─── Layout ──────────────────────────────────────────── */}
      <CollapsibleSection title={t('scSectionLayout') || 'Layout & Size'} id="layout" open={openSections.has('layout')} toggle={toggleSection}>
        <div className="grid grid-cols-2 gap-4">
          <SliderField label="Width (px)" value={card.width} min={200} max={800} step={10}
            onChange={v => updateDraft('width', v)} />
          <SliderField label="Height (px)" value={card.height} min={200} max={800} step={10}
            onChange={v => updateDraft('height', v)} />
          <SliderField label="Border Radius" value={card.borderRadius} min={0} max={40} step={1}
            onChange={v => updateDraft('borderRadius', v)} />
          <SliderField label="Rotation (°)" value={card.rotation} min={-15} max={15} step={1}
            onChange={v => updateDraft('rotation', v)} />
          <SliderField label="Opacity" value={card.opacity} min={0.3} max={1} step={0.05}
            onChange={v => updateDraft('opacity', v)} />
        </div>
      </CollapsibleSection>

      {/* ─── Scrapbook Frame Designer ───────────────────────── */}
      <CollapsibleSection title={t('scSectionFrame') || 'Scrapbook Frame & Stickers'} id="scrapbookFrame" open={openSections.has('scrapbookFrame')} toggle={toggleSection}>
        <div className="space-y-4">
          <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 text-center">
            <span className="text-4xl block mb-2">🎨</span>
            <h5 className="text-sm font-bold text-text mb-1">Visual Scrapbook Frame Designer</h5>
            <p className="text-[11px] text-text/50 max-w-sm mx-auto mb-4 leading-normal">
              Custom design the scrapbook paper borders, gradients, textures, corner ribbon wraps, and place unlimited animated love stickers around the card.
            </p>
            <button
              type="button"
              onClick={onOpenFrameDesigner}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/80 transition-all cursor-pointer shadow-md shadow-primary/15"
            >
              Mở trình thiết kế viền trực quan
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* ─── Scratch Layer ───────────────────────────────────── */}
      <CollapsibleSection title={t('scSectionLayer') || 'Scratch Layer'} id="layer" open={openSections.has('layer')} toggle={toggleSection}>
        <div className="space-y-4">
          <div>
            <Label>Layer Preset</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {LAYER_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => updateDraft('scratchLayer', { ...card.scratchLayer, preset: p.value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    card.scratchLayer.preset === p.value
                      ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                      : 'bg-white border border-primary/10 text-text/70 hover:border-primary/25'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Layer Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={card.scratchLayer.color}
                  onChange={e => updateDraft('scratchLayer', { ...card.scratchLayer, color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-primary/10"
                />
                <input
                  type="text"
                  value={card.scratchLayer.color}
                  onChange={e => updateDraft('scratchLayer', { ...card.scratchLayer, color: e.target.value })}
                  className="sc-admin-input flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <SliderField label="Layer Opacity" value={card.scratchLayer.opacity} min={0.3} max={1} step={0.05}
              onChange={v => updateDraft('scratchLayer', { ...card.scratchLayer, opacity: v })} />
            <SliderField label="Texture Intensity" value={card.scratchLayer.textureIntensity} min={0} max={1} step={0.1}
              onChange={v => updateDraft('scratchLayer', { ...card.scratchLayer, textureIntensity: v })} />
          </div>

          {card.scratchLayer.preset === 'custom' && (
            <div>
              <Label>Custom Overlay Image</Label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(e, 'customImageUrl')}
                className="sc-admin-input text-xs"
              />
              {card.scratchLayer.customImageUrl && (
                <img src={card.scratchLayer.customImageUrl} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* ─── Brush ───────────────────────────────────────────── */}
      <CollapsibleSection title={t('scSectionBrush') || 'Brush Settings'} id="brush" open={openSections.has('brush')} toggle={toggleSection}>
        <div className="grid grid-cols-2 gap-4">
          <SliderField label="Brush Size" value={card.brush.size} min={10} max={80} step={1}
            onChange={v => updateDraft('brush', { ...card.brush, size: v })} />
          <SliderField label="Hardness" value={card.brush.hardness} min={0} max={1} step={0.05}
            onChange={v => updateDraft('brush', { ...card.brush, hardness: v })} />
          <SliderField label="Feather" value={card.brush.feather} min={0} max={1} step={0.05}
            onChange={v => updateDraft('brush', { ...card.brush, feather: v })} />
          <SliderField label="Opacity" value={card.brush.opacity} min={0.3} max={1} step={0.05}
            onChange={v => updateDraft('brush', { ...card.brush, opacity: v })} />
          <SliderField label="Smoothing" value={card.brush.smoothing} min={0} max={1} step={0.05}
            onChange={v => updateDraft('brush', { ...card.brush, smoothing: v })} />
        </div>
      </CollapsibleSection>

      {/* ─── Reveal ──────────────────────────────────────────── */}
      <CollapsibleSection title={t('scSectionReveal') || 'Reveal Settings'} id="reveal" open={openSections.has('reveal')} toggle={toggleSection}>
        <div className="grid grid-cols-2 gap-4">
          <SliderField label="Reveal Percentage" value={card.reveal.percentageRequired} min={20} max={95} step={5}
            onChange={v => updateDraft('reveal', { ...card.reveal, percentageRequired: v })}
            suffix="%" />
          <div>
            <Label>Auto Reveal</Label>
            <ToggleSwitch checked={card.reveal.autoReveal} onChange={v => updateDraft('reveal', { ...card.reveal, autoReveal: v })} />
          </div>
          <SliderField label="Fade Duration" value={card.reveal.fadeOutDuration} min={200} max={2000} step={100}
            onChange={v => updateDraft('reveal', { ...card.reveal, fadeOutDuration: v })}
            suffix="ms" />
          <div>
            <Label>Scale Animation</Label>
            <ToggleSwitch checked={card.reveal.scaleAnimation} onChange={v => updateDraft('reveal', { ...card.reveal, scaleAnimation: v })} />
          </div>
          <div>
            <Label>Bounce Animation</Label>
            <ToggleSwitch checked={card.reveal.bounceAnimation} onChange={v => updateDraft('reveal', { ...card.reveal, bounceAnimation: v })} />
          </div>
        </div>
      </CollapsibleSection>

      {/* ─── Hidden Content ──────────────────────────────────── */}
      <CollapsibleSection title={t('scSectionContent') || 'Hidden Content'} id="content" open={openSections.has('content')} toggle={toggleSection}>
        <div className="space-y-4">
          {/* Content Type Selector */}
          <div>
            <Label>Content Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {CONTENT_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => updateDraft('content', { ...card.content, type: ct.value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    card.content.type === ct.value
                      ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                      : 'bg-white border border-primary/10 text-text/70 hover:border-primary/25'
                  }`}
                >
                  <span>{ct.icon}</span>
                  <span className="truncate">{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="flex items-center gap-2">
            <Label>Background</Label>
            <input type="color" value={card.content.backgroundColor}
              onChange={e => updateDraft('content', { ...card.content, backgroundColor: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-primary/10" />
          </div>

          {/* Type-specific fields */}
          {(card.content.type === 'text') && (
            <div className="space-y-3">
              <div>
                <Label>Message (Vietnamese)</Label>
                <textarea
                  value={card.content.textContent}
                  onChange={e => updateDraft('content', { ...card.content, textContent: e.target.value })}
                  className="sc-admin-input min-h-[80px] resize-y"
                  placeholder="Write your love message in Vietnamese..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Message (English)</Label>
                <textarea
                  value={card.content.textContentEn || ''}
                  onChange={e => updateDraft('content', { ...card.content, textContentEn: e.target.value })}
                  className="sc-admin-input min-h-[80px] resize-y"
                  placeholder="Write your love message in English (optional)..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Font</Label>
                  <select
                    value={card.content.fontFamily}
                    onChange={e => updateDraft('content', { ...card.content, fontFamily: e.target.value })}
                    className="sc-admin-input"
                  >
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Sacramento">Sacramento</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
                <div>
                  <Label>Text Color</Label>
                  <input type="color" value={card.content.textColor}
                    onChange={e => updateDraft('content', { ...card.content, textColor: e.target.value })}
                    className="w-full h-9 rounded-lg cursor-pointer" />
                </div>
                <SliderField label="Font Size" value={card.content.fontSize} min={12} max={40} step={1}
                  onChange={v => updateDraft('content', { ...card.content, fontSize: v })} suffix="px" />
              </div>
            </div>
          )}

          {card.content.type === 'image' && (
            <div className="space-y-3">
              <div>
                <Label>Image URL</Label>
                <input type="text" value={card.content.imageUrl}
                  onChange={e => updateDraft('content', { ...card.content, imageUrl: e.target.value })}
                  className="sc-admin-input" placeholder="https://... or upload below" />
              </div>
              <div>
                <Label>Or Upload Image</Label>
                <input type="file" accept="image/*"
                  onChange={e => handleImageUpload(e, 'imageUrl')}
                  className="sc-admin-input text-xs" />
              </div>
              <div className="flex items-center justify-between bg-primary/[0.04] p-3 rounded-lg border border-primary/10 mt-1">
                <div>
                  <Label>Tràn viền / Full Frame (Cover)</Label>
                  <p className="text-[9px] text-text/40 lowercase leading-normal">Tấm hình sẽ phủ kín toàn bộ khung thẻ cào</p>
                </div>
                <ToggleSwitch
                  checked={card.content.imageMode === 'cover'}
                  onChange={v => updateDraft('content', { ...card.content, imageMode: v ? 'cover' : 'fit' })}
                />
              </div>
              {card.content.imageUrl && (
                <img src={card.content.imageUrl} alt="Preview" className="h-24 rounded-lg object-cover border border-primary/10 mt-2" />
              )}
            </div>
          )}

          {card.content.type === 'video' && (
            <div>
              <Label>Video URL (mp4)</Label>
              <input type="text" value={card.content.videoUrl}
                onChange={e => updateDraft('content', { ...card.content, videoUrl: e.target.value })}
                className="sc-admin-input" placeholder="https://example.com/video.mp4" />
            </div>
          )}

          {card.content.type === 'youtube' && (
            <div>
              <Label>YouTube URL</Label>
              <input type="text" value={card.content.youtubeUrl}
                onChange={e => updateDraft('content', { ...card.content, youtubeUrl: e.target.value })}
                className="sc-admin-input" placeholder="https://www.youtube.com/watch?v=..." />
            </div>
          )}

          {card.content.type === 'countdown' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Target Date</Label>
                <input type="datetime-local" value={card.content.countdownDate}
                  onChange={e => updateDraft('content', { ...card.content, countdownDate: e.target.value })}
                  className="sc-admin-input" />
              </div>
              <div>
                <Label>Label (Vietnamese)</Label>
                <input type="text" value={card.content.countdownLabel}
                  onChange={e => updateDraft('content', { ...card.content, countdownLabel: e.target.value })}
                  className="sc-admin-input" placeholder="Đếm ngược đến..." />
              </div>
              <div>
                <Label>Label (English)</Label>
                <input type="text" value={card.content.countdownLabelEn || ''}
                  onChange={e => updateDraft('content', { ...card.content, countdownLabelEn: e.target.value })}
                  className="sc-admin-input" placeholder="Until our day..." />
              </div>
            </div>
          )}

          {card.content.type === 'audio' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Audio URL</Label>
                <input type="text" value={card.content.audioUrl}
                  onChange={e => updateDraft('content', { ...card.content, audioUrl: e.target.value })}
                  className="sc-admin-input" placeholder="https://example.com/song.mp3" />
              </div>
              <div>
                <Label>Label (Vietnamese)</Label>
                <input type="text" value={card.content.audioLabel}
                  onChange={e => updateDraft('content', { ...card.content, audioLabel: e.target.value })}
                  className="sc-admin-input" placeholder="Bài hát cho em..." />
              </div>
              <div>
                <Label>Label (English)</Label>
                <input type="text" value={card.content.audioLabelEn || ''}
                  onChange={e => updateDraft('content', { ...card.content, audioLabelEn: e.target.value })}
                  className="sc-admin-input" placeholder="A song for you..." />
              </div>
            </div>
          )}

          {card.content.type === 'custom-html' && (
            <div>
              <Label>HTML Content</Label>
              <textarea
                value={card.content.htmlContent}
                onChange={e => updateDraft('content', { ...card.content, htmlContent: e.target.value })}
                className="sc-admin-input min-h-[100px] font-mono text-xs resize-y"
                placeholder="<div>Your custom HTML...</div>"
                rows={5}
              />
            </div>
          )}

          {card.content.type === 'qrcode' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>QR Data / URL</Label>
                <input type="text" value={card.content.qrData}
                  onChange={e => updateDraft('content', { ...card.content, qrData: e.target.value })}
                  className="sc-admin-input" placeholder="https://your-link.com" />
              </div>
              <SliderField label="QR Size" value={card.content.qrSize} min={100} max={300} step={10}
                onChange={v => updateDraft('content', { ...card.content, qrSize: v })} suffix="px" />
            </div>
          )}

          {(card.content.type === 'button' || card.content.type === 'link') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Button Text (Vietnamese)</Label>
                <input type="text" value={card.content.buttonText}
                  onChange={e => updateDraft('content', { ...card.content, buttonText: e.target.value })}
                  className="sc-admin-input" />
              </div>
              <div>
                <Label>Button Text (English)</Label>
                <input type="text" value={card.content.buttonTextEn || ''}
                  onChange={e => updateDraft('content', { ...card.content, buttonTextEn: e.target.value })}
                  className="sc-admin-input" placeholder="English text..." />
              </div>
              <div className="col-span-2">
                <Label>URL</Label>
                <input type="text" value={card.content.buttonUrl}
                  onChange={e => updateDraft('content', { ...card.content, buttonUrl: e.target.value })}
                  className="sc-admin-input" placeholder="https://..." />
              </div>
              <div>
                <Label>Button Color</Label>
                <input type="color" value={card.content.buttonColor}
                  onChange={e => updateDraft('content', { ...card.content, buttonColor: e.target.value })}
                  className="w-full h-9 rounded-lg cursor-pointer" />
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* ─── Effects ─────────────────────────────────────────── */}
      <CollapsibleSection title={t('scSectionEffects') || 'Celebration Effects'} id="effects" open={openSections.has('effects')} toggle={toggleSection}>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(card.effects) as (keyof typeof card.effects)[]).map(key => (
            <div key={key} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-primary/8">
              <span className="text-xs font-semibold text-text/70 capitalize">
                {key === 'cameraShake' ? '📸 Camera Shake' :
                 key === 'auroraLight' ? '🌌 Aurora Light' :
                 key === 'lightSweep' ? '💫 Light Sweep' :
                 key === 'hearts' ? '💕 Hearts' :
                 key === 'sparkles' ? '✨ Sparkles' :
                 key === 'butterflies' ? '🦋 Butterflies' :
                 key === 'sakura' ? '🌸 Sakura' :
                 key === 'confetti' ? '🎊 Confetti' :
                 key === 'fireworks' ? '🎆 Fireworks' :
                 key === 'balloons' ? '🎈 Balloons' :
                 key === 'glow' ? '🔆 Glow' : key}
              </span>
              <ToggleSwitch
                checked={card.effects[key]}
                onChange={v => updateDraft('effects', { ...card.effects, [key]: v })}
              />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ─── Sound ───────────────────────────────────────────── */}
      <CollapsibleSection title={t('scSectionSound') || 'Sound Settings'} id="sound" open={openSections.has('sound')} toggle={toggleSection}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Scratch Sound</Label>
            <ToggleSwitch checked={card.sound.enableScratchSound}
              onChange={v => updateDraft('sound', { ...card.sound, enableScratchSound: v })} />
          </div>
          <div>
            <Label>Reveal Sound</Label>
            <ToggleSwitch checked={card.sound.enableRevealSound}
              onChange={v => updateDraft('sound', { ...card.sound, enableRevealSound: v })} />
          </div>
          <div>
            <Label>Celebration Sound</Label>
            <ToggleSwitch checked={card.sound.enableCelebrationSound}
              onChange={v => updateDraft('sound', { ...card.sound, enableCelebrationSound: v })} />
          </div>
          <SliderField label="Volume" value={card.sound.volume} min={0} max={1} step={0.1}
            onChange={v => updateDraft('sound', { ...card.sound, volume: v })} />
        </div>
      </CollapsibleSection>

      {/* ─── Progress Milestones ─────────────────────────────── */}
      <CollapsibleSection title={t('scSectionMilestones') || 'Progress Milestones'} id="milestones" open={openSections.has('milestones')} toggle={toggleSection}>
        <div className="space-y-3">
          {card.milestones.map((ms, i) => (
            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-primary/8">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] uppercase text-text/40 font-bold tracking-wider">Percentage</span>
                  <input
                    type="number"
                    value={ms.percentage}
                    onChange={e => {
                      const updated = [...card.milestones];
                      updated[i] = { ...ms, percentage: parseInt(e.target.value) || 0 };
                      updateDraft('milestones', updated);
                    }}
                    className="sc-admin-input text-xs"
                    min={0} max={100}
                  />
                </div>
                <div>
                  <span className="text-[9px] uppercase text-text/40 font-bold tracking-wider">Effect</span>
                  <select
                    value={ms.effect}
                    onChange={e => {
                      const updated = [...card.milestones];
                      updated[i] = { ...ms, effect: e.target.value as MilestoneEffect };
                      updateDraft('milestones', updated);
                    }}
                    className="sc-admin-input text-xs"
                  >
                    {MILESTONE_EFFECTS.map(eff => (
                      <option key={eff.value} value={eff.value}>{eff.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  const updated = card.milestones.filter((_, j) => j !== i);
                  updateDraft('milestones', updated);
                }}
                className="p-1 rounded hover:bg-red-50 cursor-pointer"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              updateDraft('milestones', [
                ...card.milestones,
                { percentage: 50, effect: 'sparkle' as MilestoneEffect },
              ]);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-xs font-semibold hover:bg-primary/10 cursor-pointer transition-colors"
          >
            <Plus size={12} /> Add Milestone
          </button>
        </div>
      </CollapsibleSection>

      {/* Bottom Save Bar */}
      <div className="flex justify-end gap-2 pt-4 border-t border-primary/10">
        <button onClick={onCancel}
          className="px-4 py-2 bg-white border border-primary/15 text-text/60 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-50 cursor-pointer transition-colors">
          Cancel
        </button>
        <button onClick={onSave}
          className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/80 cursor-pointer transition-colors">
          Save Card ✨
        </button>
      </div>
    </div>
  );
};

// ─── Shared UI Components ───────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] text-text/60 font-bold uppercase tracking-wider mb-1">{children}</label>
);

interface ToggleSwitchProps { checked: boolean; onChange: (v: boolean) => void }
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary' : 'bg-gray-200'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
  </button>
);

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}
const SliderField: React.FC<SliderFieldProps> = ({ label, value, min, max, step, onChange, suffix }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] text-text/60 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-[10px] text-primary font-mono font-bold">{value}{suffix}</span>
    </div>
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary/80"
      style={{ accentColor: 'var(--primary-color)' }}
    />
  </div>
);

interface CollapsibleSectionProps {
  title: string;
  id: string;
  open: boolean;
  toggle: (id: string) => void;
  children: React.ReactNode;
}
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, id, open, toggle, children }) => (
  <div className="bg-primary/[0.03] rounded-xl border border-primary/8 overflow-hidden">
    <button
      onClick={() => toggle(id)}
      className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-primary/5 transition-colors"
    >
      <span className="text-xs font-bold text-text/80 uppercase tracking-wide">{title}</span>
      {open ? <ChevronDown size={14} className="text-text/40" /> : <ChevronRight size={14} className="text-text/40" />}
    </button>
    {open && <div className="px-4 pb-4 pt-1">{children}</div>}
  </div>
);

export default ScratchCardAdmin;
