import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <span className="text-[120px] md:text-[160px] font-display font-bold text-terracotta/15 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-terracotta rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#1E293B] rotate-6">
              <span className="text-white font-display font-bold text-3xl">?</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-4">
          الصفحة غير موجودة
        </h1>
        <p className="text-muted font-body mb-8 leading-relaxed">
          عذرًا، لا يمكننا العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-8 py-3.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1E293B] active:translate-y-0.5 transition-all text-sm"
          >
            العودة للرئيسية
          </Link>
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-white text-ink font-bold rounded-full border-2 border-ink hover:bg-cream transition-colors text-sm"
          >
            تصفح المتجر
          </Link>
        </div>
      </div>
    </div>
  );
};
