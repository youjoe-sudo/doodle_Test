import { useLanguage } from '@components/layout/LanguageSwitcher';

export const AnnouncementBar = () => {
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  return (
    <div className="overflow-hidden" style={{ backgroundColor: '#C25350' }}>
      <div className="animate-marquee whitespace-nowrap py-2.5 flex items-center text-white">
        <span className="mx-8 text-sm font-body tracking-wide">
          ✦ {t('شحن مجاني للطلبات فوق 500 ج.م', 'Free shipping on orders over 500 EGP')}
        </span>
        <span className="mx-8 text-sm font-body tracking-wide">
          ✦ Doodle Room - {t('كتب صغيرة أحلام كبيرة', 'Small Books Big Dreams')}
        </span>
        <span className="mx-8 text-sm font-body tracking-wide">
          ✦ {t('ركن دافئ للكتب والهدايا والأشياء اللطيفة', 'A tiny corner for books, gifts & lovely little things')}
        </span>
        <span className="mx-8 text-sm font-body tracking-wide">
          ✦ {t('شحن مجاني للطلبات فوق 500 ج.م', 'Free shipping on orders over 500 EGP')}
        </span>
        <span className="mx-8 text-sm font-body tracking-wide">
          ✦ Doodle Room - {t('كتب صغيرة أحلام كبيرة', 'Small Books Big Dreams')}
        </span>
        <span className="mx-8 text-sm font-body tracking-wide">
          ✦ {t('ركن دافئ للكتب والهدايا والأشياء اللطيفة', 'A tiny corner for books, gifts & lovely little things')}
        </span>
      </div>
    </div>
  );
};
