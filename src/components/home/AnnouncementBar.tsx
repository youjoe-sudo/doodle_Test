import { useEffect, useState } from 'react';
import { useLanguage } from '@components/layout/LanguageSwitcher';
import { supabase } from '@lib/supabase/client';

export type AnnouncementConfig = {
  enabled: boolean;
  text_ar: string;
  text_en: string;
  bg_color: string;
  text_color: string;
};

export const DEFAULT_ANNOUNCEMENT: AnnouncementConfig = {
  enabled: true,
  text_ar: 'شحن مجاني للطلبات فوق 500 ج.م 🎨',
  text_en: 'Free shipping on orders over 500 EGP 🎨',
  bg_color: '#C25350',
  text_color: '#FFFFFF',
};

export const AnnouncementBar = () => {
  const lang = useLanguage();
  const [cfg, setCfg] = useState<AnnouncementConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'store')
          .single();
        if (cancelled || !data?.value) return;
        const v = data.value as any;
        const a = v.announcement;
        if (a && typeof a === 'object') {
          setCfg({ ...DEFAULT_ANNOUNCEMENT, ...a });
        } else {
          setCfg(DEFAULT_ANNOUNCEMENT);
        }
      } catch {
        if (!cancelled) setCfg(DEFAULT_ANNOUNCEMENT);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const announcement = cfg ?? DEFAULT_ANNOUNCEMENT;
  if (announcement.enabled === false) return null;

  const custom = lang === 'ar' ? announcement.text_ar : announcement.text_en;
  const bg = announcement.bg_color || DEFAULT_ANNOUNCEMENT.bg_color;
  const fg = announcement.text_color || DEFAULT_ANNOUNCEMENT.text_color;

  const fallback: Record<string, string> = {
    ar: 'شحن مجاني للطلبات فوق 500 ج.م',
    en: 'Free shipping on orders over 500 EGP',
  };

  const marqueeText = (custom && custom.trim())
    ? custom.trim()
    : fallback[lang] || fallback.en;

  const items = [
    `✦ ${marqueeText}`,
    `✦ Doodle Room - ${lang === 'ar' ? 'كتب صغيرة أحلام كبيرة' : 'Small Books Big Dreams'}`,
    `✦ ${lang === 'ar' ? 'ركن دافئ للكتب والهدايا والأشياء اللطيفة' : 'A tiny corner for books, gifts & lovely little things'}`,
    `✦ ${marqueeText}`,
    `✦ Doodle Room - ${lang === 'ar' ? 'كتب صغيرة أحلام كبيرة' : 'Small Books Big Dreams'}`,
    `✦ ${lang === 'ar' ? 'ركن دافئ للكتب والهدايا والأشياء اللطيفة' : 'A tiny corner for books, gifts & lovely little things'}`,
  ];

  return (
    <div className="overflow-hidden" style={{ backgroundColor: bg }} data-testid="announcement-bar">
      <div className="animate-marquee whitespace-nowrap py-2.5 flex items-center" style={{ color: fg }}>
        {items.map((item, i) => (
          <span key={i} className="mx-8 text-sm font-body tracking-wide" style={{ color: fg }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
