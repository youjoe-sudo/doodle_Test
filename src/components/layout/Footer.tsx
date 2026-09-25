import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@components/layout/LanguageSwitcher';

export const Footer = () => {
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer style={{ backgroundColor: '#2C1E1B' }} className="text-white relative overflow-hidden">
      <div className="container-wide py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative">
                <img src="/logo.jpg" alt="Doodle Room" className="w-11 h-11 object-contain rounded-lg" />
                <span className="absolute -top-1 -right-1 text-xs" style={{ color: '#C25350' }}>✦</span>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold leading-none" style={{ color: '#C25350' }}>Doodle Room</h3>
                <p className="text-[10px] tracking-wider" style={{ color: '#F1F5F9' }}>Small Books Big Dreams ♡</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#F1F5F9' }}>
              {t(
                'ركن دافئ للكتب والهدايا والأشياء اللطيفة. نؤمن أن الإبداع يبدأ من قلم بسيط.',
                'A cozy little corner for books, gifts & lovely little things. We believe creativity starts with a simple pen.'
              )}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display font-bold mb-4 text-white text-base">{t('استكشف', 'Explore')}</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/shop', label: t('المتجر', 'Shop') },
                { to: '/categories', label: t('التصنيفات', 'Categories') },
                { to: '/coloring-online', label: t('التلوين المجاني', 'Free Coloring') },
                { to: '/about', label: t('قصتنا', 'Our Story') },
                { to: '/contact', label: t('اتصل بنا', 'Contact') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm transition-colors hover:text-white" style={{ color: '#5A4A42' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-display font-bold mb-4 text-white text-base">{t('خدمة العملاء', 'Customer Care')}</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/support', label: t('الشحن والاسترجاع', 'Shipping & Returns') },
                { to: '/support', label: t('سياسة الخصوصية', 'Privacy Policy') },
                { to: '/support', label: t('الشروط والأحكام', 'Terms & Conditions') },
                { to: '/support', label: t('الدعم الفني', 'Support') },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm transition-colors hover:text-white" style={{ color: '#5A4A42' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Stay in Touch */}
          <div>
            <h4 className="font-display font-bold mb-4 text-white text-base">{t('لنبقَ على تواصل', "Let's Stay in Touch")}</h4>
            <div className="space-y-3">
              <p className="text-sm" style={{ color: '#F1F5F9' }}>hello@doodleroom.com</p>
              <p className="text-sm" style={{ color: '#F1F5F9' }} dir="ltr">+20 123 456 7890</p>
              <p className="text-sm" style={{ color: '#F1F5F9' }}>{t('القاهرة، مصر', 'Cairo, Egypt')}</p>
            </div>
            <div className="flex gap-2 mt-5">
              {['Instagram', 'Facebook', 'Pinterest'].map((name) => (
                <a key={name} href="#" aria-label={name}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{ backgroundColor: '#C25350', color: '#FFFFFF' }}>
                  {name[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-sm" style={{ color: '#5A4A42' }}>
            &copy; {new Date().getFullYear()} Doodle Room. {t('جميع الحقوق محفوظة', 'All rights reserved')}.
          </p>
          <button onClick={scrollToTop}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#C25350' }}
            aria-label={t('العودة للأعلى', 'Back to top')}>
            <ArrowUp className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
};
