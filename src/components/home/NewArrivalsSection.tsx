import { Heart, ShoppingCart } from 'lucide-react';

const newArrivals = [
  { id: '5', name: 'دفتر ملاحظات جلد', price: 95, originalPrice: null, image: null, isNew: true },
  { id: '6', name: 'طقم أقلام فرش', price: 180, originalPrice: null, image: null, isNew: true },
  { id: '7', name: 'ملصقات إبداعية', price: 45, originalPrice: 60, image: null, isNew: true },
  { id: '8', name: 'علبة هدايا مميزة', price: 320, originalPrice: null, image: null, isNew: true },
];

export const NewArrivalsSection = () => {
  return (
    <section className="section-padding bg-cream/50">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-block text-sm font-body text-terracotta font-medium tracking-wider uppercase mb-3">
              Just Arrived
            </span>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-ink">
              وصولات <span className="text-terracotta">جديدة</span>
            </h3>
          </div>
          <a href="/shop" className="btn-outline text-sm py-2.5 px-6">
            عرض الكل
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.map((product, i) => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;

            return (
              <div
                key={product.id}
                className="sticker-card overflow-hidden group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-square bg-gradient-to-br from-sage/10 to-cream overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-sage/20 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-sage/40" />
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />

                  {product.isNew && (
                    <div className="absolute top-3 right-3 bg-sage text-white text-xs font-bold
                      px-2.5 py-1 rounded-full">
                      NEW
                    </div>
                  )}

                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-terracotta text-white text-xs font-bold
                      px-2.5 py-1 rounded-full">
                      خصم
                    </div>
                  )}

                  <button
                    className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full
                      flex items-center justify-center opacity-0 group-hover:opacity-100
                      transition-all duration-300 hover:bg-terracotta hover:text-white
                      translate-y-2 group-hover:translate-y-0 shadow-card"
                    aria-label="إضافة للمفضلة"
                  >
                    <Heart className="w-4 h-4" />
                  </button>

                  <button
                    className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl
                      py-2.5 text-sm font-bold text-ink opacity-0 group-hover:opacity-100
                      transition-all duration-300 translate-y-2 group-hover:translate-y-0
                      hover:bg-terracotta hover:text-white shadow-card
                      flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    أضف للسلة
                  </button>
                </div>

                <div className="p-4">
                  <h4 className="font-body font-medium text-ink text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-terracotta font-bold text-lg">{product.price} EGP</span>
                    {hasDiscount && (
                      <span className="text-muted text-sm line-through">{product.originalPrice} EGP</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
