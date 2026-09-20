import { Send } from 'lucide-react';

export const NewsletterSection = () => {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="relative bg-terracotta rounded-3xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-white/20 rounded-full animate-float" />
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-float animation-delay-300" />

          <div className="relative px-6 py-16 md:px-16 md:py-20 text-center">
            <span className="inline-block text-sm font-body text-white/70 tracking-wider uppercase mb-4">
              Stay Connected
            </span>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              اشترك في نشرتنا الإخبارية
            </h3>
            <p className="text-white/70 font-body max-w-md mx-auto mb-8">
              احصل على العروض الحصرية والتحديثات الجديدة أولاً
            </p>

            <form
              className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => { e.preventDefault(); alert('شكراً لاشتراكك!'); }}
            >
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                required
                className="flex-1 px-6 py-4 bg-white/15 backdrop-blur-sm border-2 border-white/20
                  rounded-full text-white placeholder:text-white/50
                  focus:outline-none focus:border-white/50 focus:bg-white/20
                  transition-all font-body"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-terracotta font-bold rounded-full
                  hover:bg-cream transition-colors
                  flex items-center justify-center gap-2
                  border-2 border-transparent hover:border-ink shadow-btn
                  hover:shadow-btn-hover hover:-translate-x-0.5 hover:-translate-y-0.5
                  active:translate-x-0.5 active:translate-y-0.5 active:shadow-btn-active
                  transition-all duration-200"
              >
                <Send className="w-4 h-4" />
                اشتراك
              </button>
            </form>

            <p className="text-white/40 text-xs font-body mt-4">
              لن نشارك بريدك مع أي طرف ثالث. يمكنك إلغاء الاشتراك في أي وقت.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
