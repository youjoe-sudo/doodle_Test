import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@components/layout/LanguageSwitcher';

export const NewsletterSection = () => {
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  return (
    <section className="py-16" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="container-wide">
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: '#C25350' }}>
          <div className="relative px-6 py-14 md:px-16 md:py-18">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* Left: Headline + social */}
              <div>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                  {t('لنبقَ على تواصل', "Let's Stay in Touch")}
                </h3>
                <p className="text-white/70 font-body mb-6 max-w-md">
                  {t(
                    'اشترك في نشرتنا الإخبارية واحصل على العروض الحصرية أولاً.',
                    'Subscribe to our newsletter and get exclusive offers first.'
                  )}
                </p>

                {/* Social links */}
                <div className="flex gap-3">
                  {[
                    { icon: 'Ig', label: 'Instagram' },
                    { icon: 'Fb', label: 'Facebook' },
                    { icon: 'P', label: 'Pinterest' },
                  ].map((s) => (
                    <a key={s.label} href="#" aria-label={s.label}
                      className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white hover:text-terracotta transition-colors">
                      <span className="font-bold text-sm">{s.icon}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Right: Contact info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">{t('البريد الإلكتروني', 'Email')}</p>
                    <p className="font-medium">hello@doodleroom.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white" dir="ltr">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">{t('الهاتف', 'Phone')}</p>
                    <p className="font-medium">+20 123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">{t('الموقع', 'Location')}</p>
                    <p className="font-medium">{t('القاهرة، مصر', 'Cairo, Egypt')}</p>
                  </div>
                </div>

                {/* Decorative badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 mt-4">
                  <span className="font-display font-bold text-white text-sm">
                    {t('لوّن عالمك ♡', 'Color your world ♡')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
