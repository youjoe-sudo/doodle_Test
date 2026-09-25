import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, Flower2, Sparkles } from 'lucide-react';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useLanguage } from '@components/layout/LanguageSwitcher';
import { supabase } from '@lib/supabase/client';

type AboutBlock = {
  id: string;
  type: 'heading' | 'text' | 'image' | 'sticker' | 'button' | 'accent';
  content_ar?: string;
  content_en?: string;
  font_size?: number;
  color?: string;
  bg_color?: string;
  font_family?: 'display' | 'body' | 'decorative';
  align?: 'left' | 'center' | 'right';
  font_style?: 'normal' | 'bold' | 'italic';
  image_url?: string;
  frame?: 'none' | 'rounded' | 'pastel' | 'tilt';
  tilt?: number;
  sticker?: 'star' | 'heart' | 'flower' | 'sparkle';
  href?: string;
  button_style?: 'primary' | 'outline';
  width?: 'full' | 'half';
  padding?: number;
  margin_y?: number;
};

const STICKERS = {
  star: Star,
  heart: Heart,
  flower: Flower2,
  sparkle: Sparkles,
};

const FALLBACK_BLOCKS: AboutBlock[] = [
  {
    id: 'fb-heading',
    type: 'heading',
    content_ar: 'عن دودل روم',
    content_en: 'About Doodle Room',
    font_size: 40,
    color: '#C25350',
    bg_color: '#FBE3E5',
    align: 'center',
    width: 'full',
  },
  {
    id: 'fb-text',
    type: 'text',
    content_ar:
      'تأسست دودل روم عام 2020 كمنطقة صغيرة للابداع والتلوين. نؤمن أن الإبداع يبدأ من قلم بسيط ويزدهر في بيئة محفزة.',
    content_en:
      'Doodle Room was founded in 2020 as a tiny corner for creativity and coloring. We believe creativity starts with a simple pen and flourishes in a nurturing space.',
    align: 'center',
    color: '#5A4A42',
    font_size: 18,
    width: 'full',
  },
  {
    id: 'fb-sticker',
    type: 'sticker',
    content_ar: '✦ إبداع لطيف',
    content_en: '✦ Sweet creativity',
    sticker: 'flower',
    color: '#C25350',
    align: 'center',
    width: 'full',
  },
  {
    id: 'fb-button',
    type: 'button',
    content_ar: 'تسوق الآن',
    content_en: 'Shop Now',
    href: '/shop',
    button_style: 'primary',
    bg_color: '#C25350',
    color: '#FFFFFF',
    align: 'center',
    width: 'full',
  },
];

const parseLayout = (value: unknown): AboutBlock[] => {
  if (Array.isArray(value)) return value as AboutBlock[];
  if (value && typeof value === 'object' && Array.isArray((value as any).blocks)) {
    return (value as any).blocks as AboutBlock[];
  }
  return [];
};

export const AboutPage = () => {
  useDocumentTitle('قصتنا');
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const [blocks, setBlocks] = useState<AboutBlock[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'about_blocks')
          .single();
        if (cancelled) return;
        if (error) {
          console.warn('About layout load skipped:', error.message);
          setBlocks(FALLBACK_BLOCKS);
          return;
        }
        const list = parseLayout(data?.value);
        setBlocks(list.length ? list : FALLBACK_BLOCKS);
      } catch (err) {
        console.warn('About layout unexpected error:', err);
        if (!cancelled) setBlocks(FALLBACK_BLOCKS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pickText = (b: AboutBlock) =>
    (lang === 'ar' ? b.content_ar : b.content_en) || b.content_ar || b.content_en || '';

  const fontFamily = (b: AboutBlock) =>
    b.font_family === 'display'
      ? 'var(--font-display)'
      : b.font_family === 'decorative'
        ? 'var(--font-decorative)'
        : 'var(--font-body)';

  const alignCss = (b: AboutBlock): React.CSSProperties['textAlign'] =>
    b.align === 'center' ? 'center' : b.align === 'right' ? 'right' : 'left';

  const renderBlock = (block: AboutBlock): React.ReactNode => {
    const text = pickText(block);
    const shell: React.CSSProperties = {
      width: block.width === 'half' ? 'calc(50% - 8px)' : '100%',
      paddingTop: block.padding ?? 8,
      paddingBottom: block.padding ?? 8,
      marginTop: block.margin_y ?? 12,
      textAlign: alignCss(block),
      flexShrink: 0,
    };

    let inner: React.ReactNode = null;

    switch (block.type) {
      case 'heading':
        inner = (
          <h2
            className="font-bold leading-tight"
            data-testid="about-heading"
            style={{
              fontSize: `${block.font_size ?? 36}px`,
              color: block.color || '#C25350',
              backgroundColor: block.bg_color || 'transparent',
              fontFamily: fontFamily(block),
              display: 'inline-block',
              padding: block.bg_color && block.bg_color !== 'transparent' ? '0.35em 0.7em' : 0,
              borderRadius: 16,
              margin: 0,
            }}
          >
            {text}
          </h2>
        );
        break;
      case 'text':
        inner = (
          <p
            className="leading-relaxed"
            data-testid="about-text"
            style={{
              fontSize: `${block.font_size ?? 18}px`,
              color: block.color || '#5A4A42',
              fontFamily: fontFamily(block),
              fontWeight: block.font_style === 'bold' ? 700 : 400,
              fontStyle: block.font_style === 'italic' ? 'italic' : 'normal',
              backgroundColor: block.bg_color && block.bg_color !== 'transparent' ? block.bg_color : undefined,
              padding: block.bg_color && block.bg_color !== 'transparent' ? 12 : 0,
              borderRadius: 12,
              margin: 0,
            }}
          >
            {text}
          </p>
        );
        break;
      case 'image':
        if (!block.image_url) break;
        inner = (
          <div
            data-testid="about-image"
            className="overflow-hidden"
            style={{
              borderRadius: block.frame === 'none' ? 0 : 20,
              border:
                block.frame === 'pastel'
                  ? '4px solid #FBE3E5'
                  : block.frame === 'rounded'
                    ? '2px solid #E2E8F0'
                    : 'none',
              transform: block.frame === 'tilt' ? `rotate(${block.tilt ?? -3}deg)` : undefined,
              boxShadow: block.frame === 'tilt' ? '8px 8px 0 0 #ECE5F5' : '0 4px 20px rgba(0,0,0,0.06)',
              display: 'inline-block',
              maxWidth: '100%',
            }}
          >
            <img
              src={block.image_url}
              alt={block.content_en || t('صورة من نحن', 'About us')}
              className="w-full h-auto object-cover"
              style={{ maxHeight: 420 }}
            />
          </div>
        );
        break;
      case 'sticker':
      case 'accent': {
        const key = (block.sticker || 'sparkle') as keyof typeof STICKERS;
        const StickerIcon = STICKERS[key] || Sparkles;
        inner = (
          <div className="inline-flex items-center gap-2" data-testid="about-sticker">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2"
              style={{ backgroundColor: '#FBE3E5', borderColor: '#2C1E1B', color: block.color || '#C25350' }}
            >
              <StickerIcon className="w-6 h-6" />
            </span>
            <span
              className="px-4 py-1.5 rounded-full font-bold text-sm border-2"
              style={{
                backgroundColor: block.bg_color && block.bg_color !== 'transparent' ? block.bg_color : '#FFFDF5',
                borderColor: '#2C1E1B',
                color: block.color || '#C25350',
                boxShadow: '3px 3px 0 0 #2C1E1B',
              }}
            >
              {text || '✦'}
            </span>
          </div>
        );
        break;
      }
      case 'button': {
        const href = (block.href || '/shop').trim() || '/shop';
        const isExternal = /^https?:\/\//i.test(href);
        const outline = block.button_style === 'outline';
        const style: React.CSSProperties = outline
          ? {
              border: '2px solid #2C1E1B',
              color: block.color || '#2C1E1B',
              backgroundColor: 'transparent',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }
          : {
              backgroundColor: block.bg_color || '#C25350',
              color: block.color || '#FFFFFF',
              boxShadow: '4px 4px 0 0 #2C1E1B',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            };
        inner = isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={style} data-testid="about-button">
            {text}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </a>
        ) : (
          <Link to={href} style={style} data-testid="about-button" data-href={href}>
            {text}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        );
        break;
      }
      default:
        inner = null;
    }

    if (!inner) return null;
    return (
      <div key={block.id} style={shell} data-testid={`about-wrap-${block.type}`}>
        {inner}
      </div>
    );
  };

  if (blocks === null) {
    return (
      <section className="py-24 bg-cream">
        <div className="max-w-3xl mx-auto px-6 text-center text-muted">Loading…</div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-wrap items-start justify-start gap-x-4">
          {blocks.map(renderBlock)}
        </div>
        {!blocks.some((b) => b.type === 'button') && (
          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: '#C25350', boxShadow: '4px 4px 0 0 #2C1E1B' }}
            >
              {t('تسوق الآن', 'Shop Now')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
