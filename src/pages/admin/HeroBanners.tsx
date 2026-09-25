import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase/client';
import { ToastManager, useToasts } from '@components/admin/Toast';
import {
  Upload, Trash2, Save, Image as ImageIcon, AlertCircle,
  ArrowUp, ArrowDown, Link2, ExternalLink, Layers, Sparkles, Plus,
} from 'lucide-react';

const REQUIRED_W = 1200;
const REQUIRED_H = 500;
const TARGET_RATIO = REQUIRED_W / REQUIRED_H; // 2.4
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

export type BannerType = 'interactive' | 'image_only';

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
  banner_type?: BannerType;
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
  banner_type: 'interactive',
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
        banner_type: (b.banner_type as BannerType) || 'interactive',
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
        msg = `${DIMENSION_ERROR} (got ${check.w}x${check.h}, ratio ${(check.w / check.h).toFixed(2)}:1 — required 2.40:1)`;
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
        if (b.banner_type !== 'image_only' && b.cta_target === 'custom' && !b.cta_href.trim()) {
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
          className="w-full border-2 border-line rounded-xl px-3 py-3 text-sm min-h-[72px] focus:border-terracotta focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
        />
      ) : (
        <input
          className="w-full border-2 border-line rounded-xl px-3 py-3 text-sm min-h-[48px] focus:border-terracotta focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-56 bg-white border-2 border-line rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ToastManager toasts={toasts} removeToast={removeToast} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-blush border-2 border-ink flex items-center justify-center shadow-[3px_3px_0px_0px_#1E293B]">
            <Layers className="w-6 h-6 text-terracotta" />
          </span>
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">بانرات الرئيسية</h1>
            <p className="text-sm text-muted mt-0.5">
              المقاس المطلوب <strong>{REQUIRED_W}×{REQUIRED_H}</strong> (نسبة 2.4:1) — أي مقاس آخر يُرفض.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={addBanner} className="btn-outline text-sm min-h-[48px] py-3 px-5" data-testid="add-banner">
            <Plus className="w-4 h-4" /> بانر جديد
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm min-h-[48px] py-3 px-5" data-testid="save-banners">
            <Save className="w-4 h-4" /> {saving ? 'جاري الحفظ…' : 'حفظ'}
          </button>
        </div>
      </div>

      {dimensionError && (
        <div
          className="mb-4 flex items-start gap-2 p-4 rounded-2xl border-2 border-red-400 bg-red-50 text-red-700 text-sm"
          role="alert"
          data-testid="hero-dimension-error"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{dimensionError}</span>
        </div>
      )}

      <div className="space-y-6">
        {banners.map((banner, i) => {
          const isImageOnly = banner.banner_type === 'image_only';
          const presetRoute =
            banner.cta_target === 'custom'
              ? banner.cta_href
              : CTA_PRESETS.find((p) => p.value === banner.cta_target)?.route || '/shop';

          return (
            <div
              key={banner.id}
              className="bg-white border-2 border-ink rounded-3xl p-5 shadow-[6px_6px_0px_0px_#E2E8F0]"
              data-testid={`hero-banner-${i}`}
            >
              {/* Card header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-full bg-lavender border-2 border-ink flex items-center justify-center text-sm font-bold text-ink">
                    {i + 1}
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                      isImageOnly ? 'bg-sage/40 border-ink text-ink' : 'bg-peach border-ink text-ink'
                    }`}
                  >
                    {isImageOnly ? 'صورة فقط' : 'بانر تفاعلي'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button onClick={() => moveBanner(i, -1)} className="w-11 h-11 md:w-9 md:h-9 rounded-xl hover:bg-cream flex items-center justify-center border-2 border-line" aria-label="Move up">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveBanner(i, 1)} className="w-11 h-11 md:w-9 md:h-9 rounded-xl hover:bg-cream flex items-center justify-center border-2 border-line" aria-label="Move down">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <label className="flex items-center gap-2 text-xs font-bold text-ink ml-1 min-h-[48px] px-3 rounded-xl border-2 border-line hover:bg-cream cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-[#C25350]"
                      checked={banner.active}
                      onChange={(e) => updateBanner(banner.id, { active: e.target.checked })}
                    />
                    نشط
                  </label>
                  <button
                    onClick={() => removeBanner(banner.id)}
                    className="w-11 h-11 md:w-9 md:h-9 rounded-xl hover:bg-red-50 text-red-500 flex items-center justify-center border-2 border-line"
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
                    className="rounded-2xl border-2 border-dashed border-line bg-cream flex items-center justify-center overflow-hidden mb-3"
                    style={{ aspectRatio: '1200 / 500' }}
                  >
                    {banner.image_url ? (
                      <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted text-xs p-3">
                        <ImageIcon className="w-7 h-7 mx-auto mb-1" />
                        معاينة — {REQUIRED_W}×{REQUIRED_H}
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
                    <span className="btn-outline w-full text-sm min-h-[48px] py-3 flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadingId === banner.id ? 'جاري الرفع…' : `ارفع صورة ${REQUIRED_W}×${REQUIRED_H}`}
                    </span>
                  </label>
                  <p className="text-[11px] text-muted mt-1.5">
                    يُرفض أي مقاس غير صحيح (النسبة 2.40:1 ±2%).
                  </p>

                  {/* Banner type toggle */}
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-2">نوع البانر</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        data-testid="banner-type-interactive"
                        onClick={() => updateBanner(banner.id, { banner_type: 'interactive' })}
                        className={`min-h-[48px] px-3 py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          !isImageOnly
                            ? 'border-ink bg-terracotta text-white shadow-[3px_3px_0px_0px_#1E293B]'
                            : 'border-line bg-white text-ink hover:bg-cream'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        تفاعلي
                      </button>
                      <button
                        type="button"
                        data-testid="banner-type-image-only"
                        onClick={() => updateBanner(banner.id, { banner_type: 'image_only' })}
                        className={`min-h-[48px] px-3 py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          isImageOnly
                            ? 'border-ink bg-sage text-ink shadow-[3px_3px_0px_0px_#1E293B]'
                            : 'border-line bg-white text-ink hover:bg-cream'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        صورة فقط
                      </button>
                    </div>
                    <p className="text-[11px] text-muted mt-1.5">
                      {isImageOnly
                        ? 'يعرض الصورة مباشرة بدون نصوص أو زر CTA.'
                        : 'يعرض النصوص وزر CTA فوق/بجانب الصورة.'}
                    </p>
                  </div>
                </div>

                {/* Content — hidden for image-only banners */}
                {!isImageOnly ? (
                  <div className="space-y-3" data-testid="banner-interactive-fields">
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
                    <div className="border-2 border-line rounded-2xl p-4 bg-blush/40" data-testid="cta-link-builder">
                      <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                        <Link2 className="w-4 h-4" /> CTA Link Builder
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {field('CTA Label (AR)', banner.cta_label_ar, (v) => updateBanner(banner.id, { cta_label_ar: v }), 'rtl')}
                        {field('CTA Label (EN)', banner.cta_label_en, (v) => updateBanner(banner.id, { cta_label_en: v }), 'ltr')}
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-bold uppercase tracking-wide text-muted mb-1">Target route</label>
                        <select
                          className="w-full border-2 border-line rounded-xl px-3 py-3 text-sm min-h-[48px] bg-white focus:border-terracotta focus:outline-none"
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
                            className="w-full border-2 border-line rounded-xl px-3 py-3 text-sm min-h-[48px] focus:border-terracotta focus:outline-none"
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
                ) : (
                  <div
                    className="rounded-2xl border-2 border-dashed border-sage-dark/40 bg-sage/30 p-5 flex flex-col items-center justify-center text-center min-h-[220px]"
                    data-testid="banner-image-only-info"
                  >
                    <ImageIcon className="w-9 h-9 text-sage-dark mb-2" />
                    <p className="font-bold text-ink text-sm">بانر صورة فقط</p>
                    <p className="text-xs text-muted mt-1 max-w-[26ch]">
                      ستُعرض الصورة كما هي في السلايدر — بدون عنوان، وصف أو زر CTA.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
