import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Flower2, Heart } from 'lucide-react';
import { useLanguage } from '@components/layout/LanguageSwitcher';
import { supabase } from '@lib/supabase/client';

type HeroSlide = {
  id: string;
  image_url?: string | null;
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  description_ar?: string;
  description_en?: string;
  cta_label_ar?: string;
  cta_label_en?: string;
  /* legacy fields */
  cta_ar?: string;
  cta_en?: string;
  cta_target?: string;
  cta_href?: string;
  cta_url?: string;
  active?: boolean;
};

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'default-1',
    image_url: null,
    title_ar: 'كتب تلوين صغيرة',
    title_en: 'Small Books',
    subtitle_ar: 'أحلام كبيرة ♡',
    subtitle_en: 'Big Dreams ♡',
    description_ar:
      'كتب تلوين ملونة ومرحة للأطفال والكبار — جودة عالية، تصاميم فريدة، وتوصيل سريع.',
    description_en:
      'Playful coloring books for kids and grown-ups — high quality, unique designs, fast delivery.',
    cta_label_ar: 'تسوق الآن',
    cta_label_en: 'Shop Now',
    cta_target: 'shop',
    active: true,
  },
  {
    id: 'default-2',
    image_url: null,
    title_ar: 'لوّن عالمك',
    title_en: 'Color Your World',
    subtitle_ar: 'مستلزمات التلوين لعشاق الفن',
    subtitle_en: 'Coloring supplies for art lovers',
    description_ar: 'اكتشف أحدث صفحات التلوين المجانية والمحتوى الإبداعي.',
    description_en: 'Discover the latest free coloring pages and creative content.',
    cta_label_ar: 'صفحات التلوين',
    cta_label_en: 'Coloring Pages',
    cta_target: 'coloring',
    active: true,
  },
  {
    id: 'default-3',
    image_url: null,
    title_ar: 'ستيكرز وأقلام لطيفة',
    title_en: 'Stickers & Pens',
    subtitle_ar: 'تفاصيل صغيرة تسعد يومك',
    subtitle_en: 'Little details that brighten your day',
    description_ar: 'تصفح التصنيفات واعثر على هدايا لطيفة لكل مناسبة.',
    description_en: 'Browse categories and find lovely gifts for every occasion.',
    cta_label_ar: 'تصفح التصنيفات',
    cta_label_en: 'Browse Categories',
    cta_target: 'category',
    active: true,
  },
];

const resolveHref = (s: HeroSlide): string => {
  const target = (s.cta_target || 'shop').toLowerCase();
  if (target === 'custom') {
    return (s.cta_href || s.cta_url || '/shop').trim() || '/shop';
  }
  switch (target) {
    case 'coloring':
      return '/coloring-online';
    case 'category':
      return '/categories';
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    case 'new_product':
    case 'shop':
    default:
      return '/shop';
  }
};

export const HeroSection = () => {
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_banners')
          .single();
        if (cancelled) return;
        if (error) {
          console.warn('Hero banners load skipped:', error.message);
          return;
        }
        const list = Array.isArray(data?.value) ? (data.value as HeroSlide[]) : [];
        const active = list.filter((s) => s && s.active !== false);
        if (active.length > 0) setSlides(active);
      } catch (err) {
        console.warn('Hero banners unexpected error:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const safeIndex = slides.length ? index % slides.length : 0;
  const current = slides[safeIndex] ?? FALLBACK_SLIDES[0];
  const fb = FALLBACK_SLIDES[0];

  const pick = (ar?: string, en?: string, fbAr?: string, fbEn?: string) =>
    lang === 'ar' ? ar || fbAr || '' : en || fbEn || '';

  const title = pick(current.title_ar, current.title_en, fb.title_ar, fb.title_en);
  const subtitle = pick(current.subtitle_ar, current.subtitle_en, fb.subtitle_ar, fb.subtitle_en);
  const description = pick(
    current.description_ar,
    current.description_en,
    fb.description_ar,
    fb.description_en
  );
  const ctaLabel = pick(
    current.cta_label_ar || current.cta_ar,
    current.cta_label_en || current.cta_en,
    fb.cta_label_ar,
    fb.cta_label_en
  );
  const ctaHref = resolveHref(current);
  const isExternal = /^https?:\/\//i.test(ctaHref);

  const ctaClass =
    'group inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white transition-all hover:-translate-y-1';
  const ctaStyle: React.CSSProperties = {
    backgroundColor: '#C25350',
    boxShadow: '4px 4px 0px 0px #2C1E1B',
  };
  const ctaInner = (
    <>
      {ctaLabel}
      <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
        <Arrow className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: '#C25350' }} />
      </span>
    </>
  );

  return (
    <section className="relative overflow-hidden py-16 md:py-24" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-60" style={{ backgroundColor: '#FBBF24' }} />
      <div className="absolute top-1/3 -right-20 w-56 h-56 rounded-full opacity-50" style={{ backgroundColor: '#FBE3E5' }} />
      <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-50" style={{ backgroundColor: '#E4EFE7' }} />
      <div className="absolute inset-0 dot-pattern opacity-15 pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 text-center lg:text-start">
            <span
              className="inline-block px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
              style={{ backgroundColor: '#C25350', color: '#FFFFFF' }}
            >
              Coloring Books
            </span>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5"
              style={{ color: '#2C1E1B' }}
            >
              {title} <span style={{ color: '#C25350' }}>✦</span>
              <br />
              {subtitle}
            </h1>

            <p className="text-base md:text-lg font-body max-w-lg mx-auto lg:mx-0 mb-8" style={{ color: '#5A4A42' }}>
              {description ||
                t(
                  'كتب تلوين ملونة ومرحة للأطفال والكبار — جودة عالية، تصاميم فريدة، وتوصيل سريع.',
                  'Playful coloring books for kids and grown-ups — high quality, unique designs, fast delivery.'
                )}
            </p>

            {isExternal ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaClass}
                style={ctaStyle}
                data-testid="hero-cta"
              >
                {ctaInner}
              </a>
            ) : (
              <Link to={ctaHref} className={ctaClass} style={ctaStyle} data-testid="hero-cta" data-href={ctaHref}>
                {ctaInner}
              </Link>
            )}

            <div
              className="mt-8 flex items-center justify-center lg:justify-start gap-2"
              aria-label={t('شرائح البانر', 'Hero slides')}
            >
              {slides.map((s, i) => (
                <button
                  key={s.id || i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={t(`شريحة ${i + 1}`, `Slide ${i + 1}`)}
                  aria-current={i === safeIndex ? 'true' : undefined}
                  className="rounded-full transition-all"
                  style={{
                    width: i === safeIndex ? 28 : 10,
                    height: 10,
                    backgroundColor: i === safeIndex ? '#C25350' : '#E2E8F0',
                    border: '2px solid #2C1E1B',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 relative flex justify-center items-center min-h-[320px]">
            {current.image_url ? (
              <div
                className="w-full max-w-lg rounded-3xl overflow-hidden border-[3px]"
                style={{ borderColor: '#2C1E1B', boxShadow: '8px 8px 0 0 #F472B6', aspectRatio: '1200 / 500' }}
              >
                <img
                  src={current.image_url}
                  alt={t('بانر الصفحة الرئيسية', 'Homepage banner')}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <>
                <div
                  className="w-56 h-56 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center text-center p-6"
                  style={{ backgroundColor: '#FBBF24', border: '3px solid #2C1E1B' }}
                >
                  <Flower2 className="w-12 h-12 mb-3" style={{ color: '#C25350' }} />
                  <span className="font-display font-bold text-lg leading-snug" style={{ color: '#2C1E1B' }}>
                    {t('لوّن عالمك', 'Color Your World')}
                  </span>
                </div>
                <div
                  className="absolute top-4 left-4 md:top-2 md:left-0 bg-white rounded-2xl p-4 shadow-md border border-[#E2E8F0] animate-float"
                  style={{ animationDelay: '0.4s' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#C25350' }}>
                    {t('الأكثر مبيعاً', 'Bestseller')}
                  </span>
                </div>
                <div
                  className="absolute bottom-6 right-4 md:bottom-4 md:right-0 bg-white rounded-2xl p-4 shadow-md border border-[#E2E8F0] flex items-center gap-2 animate-float"
                  style={{ animationDelay: '1s' }}
                >
                  <Heart className="w-4 h-4" style={{ color: '#C25350' }} fill="#C25350" />
                  <span className="text-xs font-bold" style={{ color: '#2C1E1B' }}>
                    {t('10,000+ تقييم', '10,000+ Reviews')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
