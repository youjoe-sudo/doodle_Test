import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase/client';
import { ToastManager, useToasts } from '@components/admin/Toast';
import {
  Type, Image as ImageIcon, Heading1, Sparkles, Trash2, Save,
  GripVertical, Upload, ArrowUp, ArrowDown, Plus, MousePointerClick,
  Heart, Star, Flower2, Eye, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';

export type BlockType = 'heading' | 'text' | 'image' | 'sticker' | 'button';
/** Legacy alias used by older rows */
export type LegacyBlockType = 'accent';

export type TextAlign = 'left' | 'center' | 'right';
export type FrameStyle = 'none' | 'rounded' | 'pastel' | 'tilt';
export type WidthMode = 'full' | 'half';

export type AboutBlock = {
  id: string;
  type: BlockType | LegacyBlockType;
  content_ar: string;
  content_en: string;
  /* heading */
  font_size?: number;
  color?: string;
  bg_color?: string;
  font_family?: 'display' | 'body' | 'decorative';
  align?: TextAlign;
  /* text */
  font_style?: 'normal' | 'bold' | 'italic';
  /* image */
  image_url?: string;
  frame?: FrameStyle;
  tilt?: number;
  /* sticker */
  sticker?: 'star' | 'heart' | 'flower' | 'sparkle';
  /* button */
  href?: string;
  button_style?: 'primary' | 'outline';
  /* layout */
  width?: WidthMode;
  padding?: number;
  margin_y?: number;
};

const STICKER_ICONS = {
  star: Star,
  heart: Heart,
  flower: Flower2,
  sparkle: Sparkles,
};

const typeMeta: Record<string, { label: string; icon: typeof Type }> = {
  heading: { label: 'Heading', icon: Heading1 },
  text: { label: 'Paragraph / Rich Text', icon: Type },
  image: { label: 'Image Card', icon: ImageIcon },
  sticker: { label: 'Decorative Sticker', icon: Sparkles },
  button: { label: 'Action Button / CTA', icon: MousePointerClick },
  accent: { label: 'Accent (legacy)', icon: Sparkles },
};

const PASTELS = ['#FBE3E5', '#E4EFE7', '#ECE5F5', '#F9EAE1', '#FBBF24', '#FFFFFF', 'transparent'];
const TEXT_COLORS = ['#2C1E1B', '#C25350', '#5A4A42', '#8B5CF6', '#F472B6', '#5B8A6A', '#FFFFFF'];

const normalize = (raw: any): AboutBlock => {
  const type = (raw?.type || 'text') as AboutBlock['type'];
  return {
    id: raw?.id || crypto.randomUUID(),
    type,
    content_ar: raw?.content_ar ?? '',
    content_en: raw?.content_en ?? '',
    font_size: raw?.font_size ?? (type === 'heading' ? 36 : 16),
    color: raw?.color ?? (type === 'heading' ? '#C25350' : '#2C1E1B'),
    bg_color: raw?.bg_color ?? 'transparent',
    font_family: raw?.font_family ?? (type === 'heading' ? 'display' : 'body'),
    align: raw?.align ?? 'left',
    font_style: raw?.font_style ?? 'normal',
    image_url: raw?.image_url ?? '',
    frame: raw?.frame ?? 'rounded',
    tilt: raw?.tilt ?? 0,
    sticker: raw?.sticker ?? (type === 'accent' ? 'sparkle' : 'star'),
    href: raw?.href ?? '/shop',
    button_style: raw?.button_style ?? 'primary',
    width: raw?.width ?? 'full',
    padding: raw?.padding ?? 8,
    margin_y: raw?.margin_y ?? 12,
  };
};

const newBlock = (type: BlockType): AboutBlock =>
  normalize({
    id: crypto.randomUUID(),
    type,
    content_ar:
      type === 'heading'
        ? 'عنوان جديد'
        : type === 'text'
          ? 'اكتب فقرتك هنا…'
          : type === 'button'
            ? 'تسوق الآن'
            : type === 'sticker'
              ? '✦'
              : '',
    content_en:
      type === 'heading'
        ? 'New heading'
        : type === 'text'
          ? 'Write your paragraph here…'
          : type === 'button'
            ? 'Shop Now'
            : type === 'sticker'
              ? '✦'
              : '',
    font_size: type === 'heading' ? 36 : type === 'button' ? 16 : 16,
    color: type === 'heading' ? '#C25350' : type === 'button' ? '#FFFFFF' : '#2C1E1B',
    bg_color: type === 'heading' ? '#FBE3E5' : type === 'button' ? '#C25350' : 'transparent',
    sticker: 'star',
    href: '/shop',
  });

export const AdminAboutBuilder = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [blocks, setBlocks] = useState<AboutBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_blocks')
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('About blocks fetch error:', error.message);
      }
      let list: any[] = [];
      if (Array.isArray(data?.value)) list = data.value;
      else if (data?.value && typeof data.value === 'object' && Array.isArray((data.value as any).blocks)) {
        list = (data.value as any).blocks;
      }
      setBlocks(list.map(normalize));
    } catch (err) {
      console.error('About blocks unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBlock = (type: BlockType) => setBlocks((prev) => [...prev, newBlock(type)]);

  const updateBlock = (id: string, patch: Partial<AboutBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));

  const moveBlock = (index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDropId(null);
      return;
    }
    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === dragId);
      const to = prev.findIndex((b) => b.id === targetId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setDragId(null);
    setDropId(null);
  };

  const handleImageUpload = async (file: File | undefined, blockId: string) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please choose an image file', 'error');
      return;
    }
    setUploadingId(blockId);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `about/${blockId}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('site_assets').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('site_assets').getPublicUrl(path);
      updateBlock(blockId, { image_url: data.publicUrl });
      addToast('Image uploaded');
    } catch (err: any) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const schema = {
        version: 2,
        blocks,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key: 'about_blocks', value: schema, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (error) throw error;
      addToast('About page layout saved — live at /about');
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderMiniPreview = (block: AboutBlock) => {
    const ar = block.content_ar || block.content_en;
    const alignCss = block.align === 'center' ? 'center' : block.align === 'right' ? 'right' : 'left';
    const family =
      block.font_family === 'display'
        ? 'var(--font-display)'
        : block.font_family === 'decorative'
          ? 'var(--font-decorative)'
          : 'var(--font-body)';

    switch (block.type) {
      case 'heading':
      case 'accent':
        return (
          <div
            className="rounded-xl px-4 py-3 font-bold"
            style={{
              fontSize: Math.min(block.font_size || 36, 42),
              color: block.color || '#C25350',
              backgroundColor: block.bg_color || 'transparent',
              textAlign: alignCss,
              fontFamily: family,
            }}
          >
            {ar}
          </div>
        );
      case 'text':
        return (
          <p
            className="text-sm leading-relaxed"
            style={{
              fontSize: block.font_size || 16,
              color: block.color || '#5A4A42',
              textAlign: alignCss,
              fontFamily: family,
              fontWeight: block.font_style === 'bold' ? 700 : 400,
              fontStyle: block.font_style === 'italic' ? 'italic' : 'normal',
              backgroundColor: block.bg_color || 'transparent',
              padding: block.bg_color && block.bg_color !== 'transparent' ? 8 : 0,
              borderRadius: 8,
            }}
          >
            {ar}
          </p>
        );
      case 'image':
        if (!block.image_url) {
          return (
            <div className="rounded-xl border-2 border-dashed border-line bg-cream aspect-video flex items-center justify-center text-muted text-xs">
              <ImageIcon className="w-5 h-5 mr-2" /> Upload image
            </div>
          );
        }
        return (
          <div
            className="overflow-hidden max-h-40"
            style={{
              borderRadius: block.frame === 'none' ? 0 : 16,
              border: block.frame === 'pastel' ? '4px solid #FBE3E5' : block.frame === 'rounded' ? '2px solid #E2E8F0' : 'none',
              transform: block.frame === 'tilt' ? `rotate(${block.tilt || -3}deg)` : 'none',
              boxShadow: block.frame === 'tilt' ? '6px 6px 0 #ECE5F5' : undefined,
            }}
          >
            <img src={block.image_url} alt="" className="w-full h-40 object-cover" />
          </div>
        );
      case 'sticker': {
        const Icon = STICKER_ICONS[block.sticker || 'star'] || Star;
        return (
          <div className="flex items-center gap-2 py-1">
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: '#FBE3E5', color: block.color || '#C25350' }}
            >
              <Icon className="w-5 h-5" />
            </span>
            <span className="text-lg font-bold" style={{ color: block.color || '#C25350' }}>
              {ar || '✦'}
            </span>
          </div>
        );
      }
      case 'button':
        return (
          <span
            className="inline-flex items-center px-6 py-2.5 rounded-full font-bold text-sm"
            style={
              block.button_style === 'outline'
                ? { border: '2px solid #2C1E1B', color: block.color || '#2C1E1B', backgroundColor: 'transparent' }
                : {
                    backgroundColor: block.bg_color || '#C25350',
                    color: block.color || '#FFFFFF',
                    boxShadow: '3px 3px 0 0 #2C1E1B',
                  }
            }
          >
            {ar || block.content_en}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-muted py-10 text-center">Loading About builder…</div>;
  }

  const addable: BlockType[] = ['heading', 'text', 'image', 'sticker', 'button'];

  return (
    <div className="max-w-5xl mx-auto">
      <ToastManager toasts={toasts} removeToast={removeToast} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">About Us — Canva-like Visual Builder</h1>
          <p className="text-sm text-muted mt-1">
            Drag blocks to reorder, toggle half/full width for horizontal layout, live-preview before publish.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="btn-outline text-sm min-h-[48px] py-3 px-4"
            data-testid="about-preview-toggle"
          >
            <Eye className="w-4 h-4" /> {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm min-h-[48px] py-3 px-5">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {addable.map((type) => {
          const meta = typeMeta[type];
          const Icon = meta.icon;
          return (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="flex items-center gap-2 px-4 min-h-[48px] py-3 rounded-full border-2 border-line text-sm font-bold hover:bg-cream transition-colors"
              data-testid={`add-${type}`}
            >
              <Icon className="w-4 h-4 text-terracotta" />
              <Plus className="w-3 h-3" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {preview ? (
        <div className="bg-white border-2 border-line rounded-2xl p-6" data-testid="about-live-preview">
          <p className="text-xs font-bold uppercase tracking-wide text-muted mb-4">Live preview (AR sample)</p>
          <div className="flex flex-wrap gap-4">
            {blocks.map((b) => (
              <div
                key={b.id}
                style={{
                  width: b.width === 'half' ? 'calc(50% - 8px)' : '100%',
                  paddingTop: b.padding,
                  paddingBottom: b.padding,
                  marginTop: b.margin_y,
                }}
              >
                {renderMiniPreview(b)}
              </div>
            ))}
          </div>
          {blocks.length === 0 && (
            <p className="text-muted text-sm text-center py-8">No blocks yet — add some from the toolbar.</p>
          )}
        </div>
      ) : blocks.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-line rounded-2xl p-10 text-center text-muted">
          Canvas is empty. Add Heading, Text, Image, Sticker, or Button blocks.
        </div>
      ) : (
        <div className="space-y-4" data-testid="about-canvas">
          {blocks.map((block, i) => {
            const meta = typeMeta[block.type] || typeMeta.text;
            const Icon = meta.icon;
            return (
              <div
                key={block.id}
                draggable
                onDragStart={() => setDragId(block.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropId(block.id);
                }}
                onDragLeave={() => setDropId((prev) => (prev === block.id ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(block.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDropId(null);
                }}
                className={`bg-white border-2 rounded-2xl p-4 transition-all ${
                  dragId === block.id
                    ? 'opacity-50 border-terracotta'
                    : dropId === block.id
                      ? 'border-sage shadow-[0_0_0_3px_rgba(91,138,106,0.35)]'
                      : 'border-line'
                }`}
                data-testid={`about-block-${block.type}`}
                data-block-id={block.id}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-ink">
                    <GripVertical className="w-5 h-5 text-muted cursor-grab min-w-[48px] min-h-[48px] p-2 box-content -m-2" aria-label="Drag to reorder" />
                    <Icon className="w-4 h-4 text-terracotta" />
                    {meta.label}
                    <span className="text-muted font-normal">#{i + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream text-muted border border-line">
                      {block.width === 'half' ? 'half · horizontal' : 'full · stack'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveBlock(i, -1)}
                      className="w-11 h-11 md:w-8 md:h-8 rounded-lg hover:bg-cream flex items-center justify-center"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveBlock(i, 1)}
                      className="w-11 h-11 md:w-8 md:h-8 rounded-lg hover:bg-cream flex items-center justify-center"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeBlock(block.id)}
                      className="w-11 h-11 md:w-8 md:h-8 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"
                      aria-label="Delete block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Layout controls */}
                <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-line">
                  <label className="flex items-center gap-1 text-xs text-muted">
                    Width
                    <select
                      className="border-2 border-line rounded-lg px-2 py-1 text-xs bg-white"
                      value={block.width || 'full'}
                      onChange={(e) => updateBlock(block.id, { width: e.target.value as WidthMode })}
                    >
                      <option value="full">Full (stack)</option>
                      <option value="half">Half (side-by-side)</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-1 text-xs text-muted">
                    Align
                    <select
                      className="border-2 border-line rounded-lg px-2 py-1 text-xs bg-white"
                      value={block.align || 'left'}
                      onChange={(e) => updateBlock(block.id, { align: e.target.value as TextAlign })}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-1 text-xs text-muted">
                    Pad
                    <input
                      type="range"
                      min={0}
                      max={48}
                      value={block.padding ?? 8}
                      onChange={(e) => updateBlock(block.id, { padding: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span>{block.padding ?? 8}px</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs text-muted">
                    Gap
                    <input
                      type="range"
                      min={0}
                      max={64}
                      value={block.margin_y ?? 12}
                      onChange={(e) => updateBlock(block.id, { margin_y: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span>{block.margin_y ?? 12}px</span>
                  </label>
                </div>

                {/* Type-specific editors */}
                {(block.type === 'heading' || block.type === 'accent') && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">العربية (AR)</label>
                      <input
                        className="w-full border-2 border-line rounded-xl px-3 py-2 text-sm"
                        value={block.content_ar}
                        onChange={(e) => updateBlock(block.id, { content_ar: e.target.value })}
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">English (EN)</label>
                      <input
                        className="w-full border-2 border-line rounded-xl px-3 py-2 text-sm"
                        value={block.content_en}
                        onChange={(e) => updateBlock(block.id, { content_en: e.target.value })}
                        dir="ltr"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 items-end">
                      <label className="text-xs text-muted">
                        Size
                        <input
                          type="number"
                          min={14}
                          max={80}
                          className="ml-2 w-20 border-2 border-line rounded-lg px-2 py-1"
                          value={block.font_size ?? 36}
                          onChange={(e) => updateBlock(block.id, { font_size: Number(e.target.value) })}
                        />
                      </label>
                      <label className="text-xs text-muted flex items-center gap-1">
                        Font
                        <select
                          className="border-2 border-line rounded-lg px-2 py-1 bg-white"
                          value={block.font_family || 'display'}
                          onChange={(e) =>
                            updateBlock(block.id, { font_family: e.target.value as AboutBlock['font_family'] })
                          }
                        >
                          <option value="display">Display</option>
                          <option value="body">Body</option>
                          <option value="decorative">Decorative</option>
                        </select>
                      </label>
                      <label className="text-xs text-muted flex items-center gap-1">
                        Text
                        <input
                          type="color"
                          value={block.color || '#C25350'}
                          onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                      </label>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        Pastel bg
                        {PASTELS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => updateBlock(block.id, { bg_color: c })}
                            className="w-6 h-6 rounded-full border-2 border-line"
                            style={{ backgroundColor: c === 'transparent' ? '#fff' : c }}
                            aria-label={`bg ${c}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex gap-2 text-muted text-xs mb-1">
                        <AlignLeft className="w-4 h-4" />
                        <AlignCenter className="w-4 h-4" />
                        <AlignRight className="w-4 h-4" />
                      </div>
                      <div className="text-xs text-muted">Live: use Align dropdown above.</div>
                    </div>
                  </div>
                )}

                {block.type === 'text' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">العربية (AR)</label>
                      <textarea
                        className="w-full border-2 border-line rounded-xl px-3 py-2 text-sm min-h-[110px]"
                        value={block.content_ar}
                        onChange={(e) => updateBlock(block.id, { content_ar: e.target.value })}
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">English (EN)</label>
                      <textarea
                        className="w-full border-2 border-line rounded-xl px-3 py-2 text-sm min-h-[110px]"
                        value={block.content_en}
                        onChange={(e) => updateBlock(block.id, { content_en: e.target.value })}
                        dir="ltr"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="text-xs text-muted flex items-center gap-1">
                        Style
                        <select
                          className="border-2 border-line rounded-lg px-2 py-1 bg-white"
                          value={block.font_style || 'normal'}
                          onChange={(e) =>
                            updateBlock(block.id, { font_style: e.target.value as AboutBlock['font_style'] })
                          }
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="italic">Italic</option>
                        </select>
                      </label>
                      <label className="text-xs text-muted">
                        Size
                        <input
                          type="number"
                          min={12}
                          max={28}
                          className="ml-2 w-16 border-2 border-line rounded-lg px-2 py-1"
                          value={block.font_size ?? 16}
                          onChange={(e) => updateBlock(block.id, { font_size: Number(e.target.value) })}
                        />
                      </label>
                      <label className="text-xs text-muted flex items-center gap-1">
                        Color
                        <input
                          type="color"
                          value={block.color || '#5A4A42'}
                          onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {block.type === 'image' && (
                  <div className="grid md:grid-cols-[200px_1fr] gap-4 items-start">
                    <div
                      className="rounded-xl border-2 border-dashed border-line bg-cream aspect-video flex items-center justify-center overflow-hidden"
                      style={
                        block.frame === 'tilt'
                          ? { transform: `rotate(${block.tilt || -3}deg)` }
                          : undefined
                      }
                    >
                      {block.image_url ? (
                        <img src={block.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted" />
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={(e) => handleImageUpload(e.target.files?.[0], block.id)}
                          disabled={uploadingId === block.id}
                        />
                        <span className="btn-outline text-xs py-2 px-4">
                          <Upload className="w-3.5 h-3.5" />
                          {uploadingId === block.id ? 'Uploading…' : 'Upload image'}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['none', 'rounded', 'pastel', 'tilt'] as FrameStyle[]).map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => updateBlock(block.id, { frame: f })}
                            className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                              (block.frame || 'rounded') === f
                                ? 'border-terracotta bg-terracotta text-white'
                                : 'border-line'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      {block.frame === 'tilt' && (
                        <label className="text-xs text-muted flex items-center gap-2">
                          Tilt
                          <input
                            type="range"
                            min={-12}
                            max={12}
                            value={block.tilt ?? -3}
                            onChange={(e) => updateBlock(block.id, { tilt: Number(e.target.value) })}
                            className="w-32"
                          />
                          {block.tilt ?? -3}°
                        </label>
                      )}
                      <input
                        className="w-full border-2 border-line rounded-xl px-3 py-2 text-sm"
                        placeholder="Alt text (EN)"
                        value={block.content_en}
                        onChange={(e) => updateBlock(block.id, { content_en: e.target.value })}
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}

                {block.type === 'sticker' && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                      {(Object.keys(STICKER_ICONS) as Array<keyof typeof STICKER_ICONS>).map((key) => {
                        const StickerIcon = STICKER_ICONS[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => updateBlock(block.id, { sticker: key })}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                              (block.sticker || 'star') === key ? 'border-terracotta bg-blush' : 'border-line'
                            }`}
                            aria-label={key}
                          >
                            <StickerIcon className="w-5 h-5 text-terracotta" />
                          </button>
                        );
                      })}
                    </div>
                    <input
                      className="border-2 border-line rounded-xl px-3 py-2 text-sm w-40"
                      value={block.content_ar}
                      onChange={(e) => updateBlock(block.id, { content_ar: e.target.value })}
                      placeholder="Badge text AR"
                      dir="rtl"
                    />
                    <input
                      className="border-2 border-line rounded-xl px-3 py-2 text-sm w-40"
                      value={block.content_en}
                      onChange={(e) => updateBlock(block.id, { content_en: e.target.value })}
                      placeholder="Badge text EN"
                      dir="ltr"
                    />
                    <label className="text-xs text-muted flex items-center gap-1">
                      Color
                      <input
                        type="color"
                        value={block.color || '#C25350'}
                        onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </label>
                    <div className="flex gap-1">
                      {TEXT_COLORS.slice(0, 4).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className="w-5 h-5 rounded-full border border-line"
                          style={{ backgroundColor: c }}
                          onClick={() => updateBlock(block.id, { color: c })}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {block.type === 'button' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">Label (AR)</label>
                      <input
                        className="w-full border-2 border-line rounded-xl px-3 py-2 text-sm"
                        value={block.content_ar}
                        onChange={(e) => updateBlock(block.id, { content_ar: e.target.value })}
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">Label (EN)</label>
                      <input
                        className="w-full border-2 border-line rounded-xl px-3 py-2 text-sm"
                        value={block.content_en}
                        onChange={(e) => updateBlock(block.id, { content_en: e.target.value })}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">Destination URL</label>
                      <input
                        className="w-full border-2 border-line rounded-xl px-3 py-2 text-sm"
                        value={block.href || ''}
                        onChange={(e) => updateBlock(block.id, { href: e.target.value })}
                        placeholder="/shop or https://…"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(block.id, {
                            button_style: block.button_style === 'outline' ? 'primary' : 'outline',
                          })
                        }
                        className="btn-outline text-xs py-2 px-4"
                      >
                        Style: {block.button_style || 'primary'}
                      </button>
                      <input
                        type="color"
                        value={block.bg_color || '#C25350'}
                        onChange={(e) => updateBlock(block.id, { bg_color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer"
                        aria-label="Button color"
                      />
                    </div>
                  </div>
                )}

                {/* Mini live preview strip */}
                <div className="mt-3 pt-3 border-t border-line">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Block preview</p>
                  <div
                    style={{
                      width: block.width === 'half' ? '50%' : '100%',
                      marginTop: Math.min(block.margin_y ?? 12, 24),
                      paddingTop: Math.min(block.padding ?? 8, 24),
                      paddingBottom: Math.min(block.padding ?? 8, 24),
                    }}
                  >
                    {renderMiniPreview(block)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
