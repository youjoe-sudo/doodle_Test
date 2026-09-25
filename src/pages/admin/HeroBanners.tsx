import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase/client';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { Upload, Trash2, Save, Image as ImageIcon, AlertCircle, ArrowUp, ArrowDown, Link2, ExternalLink } from 'lucide-react';

const REQUIRED_W = 1200;
const REQUIRED_H = 500;
const TARGET_RATIO = REQUIRED_W / REQUIRED_H; // 2.4 (16:6.67 ≈ near 16:9 family)
const RATIO_TOLERANCE = 0.02;
const DIMENSION_ERROR = 'Image must meet the exact dimensions: 1200x500px';

export type CtaPreset =
  | 'shop'
  | 'new_product'
  | 'category'
  | 'coloring'
  | 'about'
  | 'contact'
  | 'custom';

export const CTA_PRESETS: Array<{ value: CtaPreset; label: string; route: string }> = [
  { value: 'shop', label: 'Shop / New Product Launch', route: '/shop' },
  { value: 'new_product', label: 'New Product Launch', route: '/shop' },
  { value: 'category', label: 'Category Page', route: '/categories' },
  { value: 'coloring', label: 'Coloring Pages', route: '/coloring-online' },
  { value: 'about', label: 'About Us', route: '/about' },
  { value: 'contact', label: 'Contact', route: '/contact' },
  { value: 'custom', label: 'Custom URL…', route: '' },
];

export type HeroBanner = {
  id: string;
  image_url: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  description_ar: string;
  description_en: string;
  cta_label_ar: string;
  cta_label_en: string;
  cta_target: CtaPreset;
  cta_href: string;
  active: boolean;
};

const emptyBanner = (): HeroBanner => ({
  id: crypto.randomUUID(),
  image_url: '',
  title_ar: '',
  title_en: '',
  subtitle_ar: '',
  subtitle_en: '',
  description_ar: '',
  description_en: '',
  cta_label_ar: 'تسوق الآن',
  cta_label_en: 'Shop Now',
  cta_target: 'shop',
  cta_href: '',
  active: true,
});

export const resolveCtaHref = (b: {
  cta_target?: string;
  cta_href?: string;
  cta_url?: string;
  href?: string;
}): string => {
  const target = (b.cta_target || 'shop') as CtaPreset;
  if (target === 'custom') return (b.cta_href || b.cta_url || b.href || '/shop').trim() || '/shop';
  const preset = CTA_PRESETS.find((p) => p.value === target);
  return preset?.route || '/shop';
};

export const AdminHeroBanners = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [dimensionError, setDimensionError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_banners')
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Hero banners fetch error:', error.message);
      }
      const raw = Array.isArray(data?.value) ? (data.value as any[]) : [];
      const list: HeroBanner[] = raw.map((b) => ({
        ...emptyBanner(),
        ...b,
        id: b.id || crypto.randomUUID(),
        description_ar: b.description_ar ?? b.desc_ar ?? '',
        description_en: b.description_en ?? b.desc_en ?? '',
        cta_label_ar: b.cta_label_ar ?? b.cta_ar ?? 'تسوق الآن',
        cta_label_en: b.cta_label_en ?? b.cta_en ?? 'Shop Now',
        cta_target: (b.cta_target as CtaPreset) || 'shop',
        cta_href: b.cta_href || b.cta_url || '',
      }));
      setBanners(list.length ? list : [emptyBanner()]);
    } catch (err) {
      console.error('Hero banners unexpected error:', err);
      setBanners([emptyBanner()]);
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = (id: string, patch: Partial<HeroBanner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const addBanner = () => setBanners((prev) => [...prev, emptyBanner()]);
  const removeBanner = (id: string) => setBanners((prev) => prev.filter((b) => b.id !== id));

  const moveBanner = (index: number, dir: -1 | 1) => {
    setBanners((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const validateImageDimensions = (file: File): Promise<{ ok: boolean; w: number; h: number; ratioOk: boolean }> =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        URL.revokeObjectURL(url);
        const exact = w === REQUIRED_W && h === REQUIRED_H;
        const ratio = h > 0 ? w / h : 0;
        const ratioOk = Math.abs(ratio - TARGET_RATIO) <= RATIO_TOLERANCE;
        resolve({ ok: exact, ratioOk, w, h });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ ok: false, ratioOk: false, w: 0, h: 0 });
      };
      img.src = url;
    });

  const handleUpload = async (file: File | undefined, bannerId: string) => {
    if (!file) return;
    setDimensionError(null);

    if (!file.type.startsWith('image/')) {
      setDimensionError(DIMENSION_ERROR);
      addToast(DIMENSION_ERROR, 'error');
      return;
    }

    const check = await validateImageDimensions(file);
    if (!check.ok) {
      let msg = DIMENSION_ERROR;
      if (check.w && check.h) {
        msg = `${DIMENSION_ERROR} (got ${check.w}x${check.h}, ratio ${(check.w / check.h).toFixed(2)}:1 — required 2.40:1 / 16:9 family)`;
      }
      setDimensionError(msg);
      addToast(msg, 'error');
      return;
    }

    setUploadingId(bannerId);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `hero/${bannerId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('site_assets').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('site_assets').getPublicUrl(path);
      updateBanner(bannerId, { image_url: data.publicUrl });
      addToast('Banner image accepted (1200×500)');
    } catch (err: any) {
      const msg = err?.message || 'Upload failed';
      setDimensionError(msg);
      addToast(msg, 'error');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const b of banners) {
        if (b.active && !b.image_url) {
          addToast('Active banners must have a 1200×500 image', 'error');
          setSaving(false);
          return;
        }
        if (b.cta_target === 'custom' && !b.cta_href.trim()) {
          addToast('Custom CTA requires a target URL', 'error');
          setSaving(false);
          return;
        }
      }
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key: 'hero_banners', value: banners, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (error) throw error;
      addToast('Hero banners saved');
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    dir: 'rtl' | 'ltr' = 'ltr',
    multiline = false
  ) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">{label}</label>
      {multiline ? (
        <textarea
          className="w-full border-2 border-line rounded-xl px-3 py-3 text-sm min-h-[48px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
        />
      ) : (
        <input
          className="w-full border-2 border-line rounded-xl px-3 py-3 text-sm min-h-[48px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
        />
      )}
    </div>
  );

  if (loading) {
    return <div className="text-muted py-10 text-center">Loading hero banners…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Advanced Hero Banner Management</h1>
          <p className="text-sm text-muted mt-1">
            Strict size: <strong>{REQUIRED_W}×{REQUIRED_H}px</strong> (ratio 2.4:1 / 16:9 family). Mismatched uploads are rejected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={addBanner} className="btn-outline text-sm min-h-[48px] py-3 px-4">+ Add Banner</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm min-h-[48px] py-3 px-5">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {dimensionError && (
        <div
          className="mb-4 flex items-start gap-2 p-4 rounded-xl border-2 border-red-400 bg-red-50 text-red-700 text-sm"
          role="alert"
          data-testid="hero-dimension-error"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{dimensionError}</span>
        </div>
      )}

      <div className="space-y-6">
        {banners.map((banner, i) => {
          const presetRoute =
            banner.cta_target === 'custom'
              ? banner.cta_href
              : CTA_PRESETS.find((p) => p.value === banner.cta_target)?.route || '/shop';
          return (
            <div key={banner.id} className="bg-white border-2 border-line rounded-2xl p-5 shadow-sm" data-testid={`hero-banner-${i}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-ink text-sm">Banner {i + 1}</span>
                <div className="flex flex-wrap items-center gap-1">
                  <button onClick={() => moveBanner(i, -1)} className="w-11 h-11 md:w-8 md:h-8 rounded-lg hover:bg-cream flex items-center justify-center" aria-label="Move up">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveBanner(i, 1)} className="w-11 h-11 md:w-8 md:h-8 rounded-lg hover:bg-cream flex items-center justify-center" aria-label="Move down">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted ml-2 min-h-[48px] px-2">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={banner.active}
                      onChange={(e) => updateBanner(banner.id, { active: e.target.checked })}
                    />
                    Active
                  </label>
                  <button
                    onClick={() => removeBanner(banner.id)}
                    className="w-11 h-11 md:w-8 md:h-8 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"
                    aria-label="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Image + validation */}
                <div>
                  <div
                    className="rounded-xl border-2 border-dashed border-line bg-cream flex items-center justify-center overflow-hidden mb-2"
                    style={{ aspectRatio: '1200 / 500' }}
                  >
                    {banner.image_url ? (
                      <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted text-xs p-3">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                        Preview — {REQUIRED_W}×{REQUIRED_H} (2.4:1)
                      </div>
                    )}
                  </div>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(e) => handleUpload(e.target.files?.[0], banner.id)}
                      disabled={uploadingId === banner.id}
                    />
                    <span className="btn-outline w-full text-xs py-2">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingId === banner.id ? 'Uploading…' : `Upload exactly ${REQUIRED_W}×${REQUIRED_H}`}
                    </span>
                  </label>
                  <p className="text-[11px] text-muted mt-1">
                    Rejects wrong dimensions or aspect ratio (must be 2.40:1 ±2%).
                  </p>
                </div>

                {/* Dynamic content */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {field('Title (AR)', banner.title_ar, (v) => updateBanner(banner.id, { title_ar: v }), 'rtl')}
                    {field('Title (EN)', banner.title_en, (v) => updateBanner(banner.id, { title_en: v }), 'ltr')}
                    {field('Subtitle (AR)', banner.subtitle_ar, (v) => updateBanner(banner.id, { subtitle_ar: v }), 'rtl')}
                    {field('Subtitle (EN)', banner.subtitle_en, (v) => updateBanner(banner.id, { subtitle_en: v }), 'ltr')}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {field('Description (AR)', banner.description_ar, (v) => updateBanner(banner.id, { description_ar: v }), 'rtl', true)}
                    {field('Description (EN)', banner.description_en, (v) => updateBanner(banner.id, { description_en: v }), 'ltr', true)}
                  </div>

                  {/* CTA Link Builder */}
                  <div className="border-2 border-line rounded-xl p-3 bg-cream/50" data-testid="cta-link-builder">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                      <Link2 className="w-3.5 h-3.5" /> CTA Link Builder
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {field('CTA Label (AR)', banner.cta_label_ar, (v) => updateBanner(banner.id, { cta_label_ar: v }), 'rtl')}
                      {field('CTA Label (EN)', banner.cta_label_en, (v) => updateBanner(banner.id, { cta_label_en: v }), 'ltr')}
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">Target route</label>
                      <select
                        className="w-full border-2 border-line rounded-xl px-3 py-3 text-sm min-h-[48px] bg-white"
                        value={banner.cta_target}
                        onChange={(e) => updateBanner(banner.id, { cta_target: e.target.value as CtaPreset })}
                      >
                        {CTA_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                            {p.route ? ` → ${p.route}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {banner.cta_target === 'custom' ? (
                      <div className="mt-3">
                        <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">
                          Custom URL
                        </label>
                        <input
                          className="w-full border-2 border-line rounded-xl px-3 py-3 text-sm min-h-[48px]"
                          placeholder="/products/cute-and-cozy or https://…"
                          value={banner.cta_href}
                          onChange={(e) => updateBanner(banner.id, { cta_href: e.target.value })}
                          dir="ltr"
                          data-testid="cta-custom-url"
                        />
                      </div>
                    ) : null}
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Resolves to: <code className="text-terracotta font-bold">{presetRoute || '—'}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
