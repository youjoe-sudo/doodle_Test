import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowUp } from 'lucide-react';

export const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-ink text-white relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-terracotta via-blush to-sage" />

      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="Doodle Room" className="w-12 h-12" />
              <div>
                <h3 className="text-xl font-display font-bold text-white leading-none">Doodle Room</h3>
                <p className="text-xs text-white/50 font-body tracking-wider">Small Books Big Dreams</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              A cozy little corner for books, gifts & lovely little things.
              نؤمن أن الإبداع يبدأ من قلم بسيط.
            </p>
            {/* Social icons as circles */}
            <div className="flex gap-3">
              {['Instagram', 'Facebook', 'TikTok'].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                    hover:bg-terracotta transition-colors text-sm font-bold"
                  aria-label={name}
                >
                  {name[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white mb-6 text-lg">Explore</h4>
            <ul className="space-y-3">
              {[
                { to: '/shop', label: 'المتجر' },
                { to: '/categories', label: 'التصنيفات' },
                { to: '/coloring-online', label: 'التلوين المجاني' },
                { to: '/about', label: 'قصتنا' },
                { to: '/contact', label: 'اتصل بنا' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-terracotta-light transition-colors text-sm
                      flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta/50 group-hover:bg-terracotta transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-display font-bold text-white mb-6 text-lg">Customer Care</h4>
            <ul className="space-y-3">
              {[
                { to: '/support', label: 'الشحن والاسترجاع' },
                { to: '/support', label: 'سياسة الخصوصية' },
                { to: '/support', label: 'الشروط والأحكام' },
                { to: '/support', label: 'الدعم الفني' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-terracotta-light transition-colors text-sm
                      flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta/50 group-hover:bg-terracotta transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Payment */}
          <div>
            <h4 className="font-display font-bold text-white mb-6 text-lg">تواصل معنا</h4>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-terracotta mt-0.5 shrink-0" />
                <span>شارع المثال، القاهرة، مصر</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 text-terracotta shrink-0" />
                <span>+20 2 1234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 text-terracotta shrink-0" />
                <span>info@doodleroom.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Clock className="w-4 h-4 text-terracotta shrink-0" />
                <span>الأحد - الخميس: 9 ص - 6 م</span>
              </div>
            </div>

            <h4 className="font-display font-bold text-white mb-3 text-sm">Payment Methods</h4>
            <div className="flex gap-2 flex-wrap">
              {['Vodafone Cash', 'InstaPay'].map((method) => (
                <span
                  key={method}
                  className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white/70 font-medium"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Doodle Room. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center
              hover:bg-terracotta-dark transition-colors shadow-btn"
            aria-label="العودة للأعلى"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
};
