import { useDocumentTitle } from '@hooks/useDocumentTitle';

export const AboutPage = () => {
  useDocumentTitle('قصتنا');
  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-display ink text-terracotta mb-6">عن دودل روم</h2>
            <p className="text-muted text-lg mb-6">
              تأسست دودل روم عام 2020 كمنطقة صغيرة للابداع والتلوين. نؤمن أن الإبداع يبدأ من قلم بسيط ويزدهر في بيئة محفزة. هدفنا هو توفير أفضل مستلزمات التلوين والابداع لعشاق الفن من كل الأعمار.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <div className="h-4 w-4 bg-terracotta rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white">01</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium"> منتجات ذات جودة عالية</p>
                  <p className="text-muted text-sm">نختار بعناية كل منتج نقدمه</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="h-4 w-4 bg-terracotta rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white">02</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium"> شحن Worldwide</p>
                  <p className="text-muted text-sm">نحن نشحن إلى معظم الدول</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="h-4 w-4 bg-terracotta rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white">03</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium"> دعم فني متميز</p>
                  <p className="text-muted text-sm">فريقنا هنا للمساعدة</p>
                </div>
              </li>
            </ul>
            <div className="pt-6 border-t border-line">
              <p className="text-muted">
                تأسست عام 2020
              </p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-primary">
            <img
              src="/images/about-us.jpg"
              alt="About Us"
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-terracotta/10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};