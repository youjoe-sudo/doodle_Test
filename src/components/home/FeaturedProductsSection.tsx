import { Heart, ShoppingCart } from 'lucide-react';

const placeholderProducts = [
  { id: '1', name: 'كتاب التلوين الاحترافي', price: 150, originalPrice: 200, image: null, rating: 4.8 },
  { id: '2', name: 'طلية ألوان مائية', price: 85, originalPrice: null, image: null, rating: 4.9 },
  { id: '3', name: 'قلم تلوين رسم', price: 120, originalPrice: 160, image: null, rating: 4.7 },
  { id: '4', name: 'حقيبة إبداعية', price: 250, originalPrice: 300, image: null, rating: 5.0 },
];

export const FeaturedProductsSection = () => {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-block text-sm font-body text-terracotta font-medium tracking-wider uppercase mb-3">
              Featured Products
            </span>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-ink">
              أحدث <span className="text-terracotta">المنتجات</span>
            </h3>
          </div>
          <a href="/shop" className="btn-outline text-sm py-2.5 px-6">
            عرض الكل
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {placeholderProducts.map((product, i) => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            const discount = hasDiscount ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0;

            return (
              <div
                key={product.id}
                className={`sticker-card overflow-hidden group opacity-0 animate-slide-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-cream to-blush/20 overflow-hidden">
                  {/* Placeholder visual */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-terracotta/10 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-terracotta/40" />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />

                  {/* Discount badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 right-3 bg-terracotta text-white text-xs font-bold
                      px-2.5 py-1 rounded-full">
                      -{discount}%
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full
                      flex items-center justify-center opacity-0 group-hover:opacity-100
                      transition-all duration-300 hover:bg-terracotta hover:text-white
                      translate-y-2 group-hover:translate-y-0 shadow-card"
                    aria-label="إضافة للمفضلة"
                  >
                    <Heart className="w-4 h-4" />
                  </button>

                  {/* Quick add */}
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

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-body font-medium text-ink text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className={`w-3 h-3 ${j < Math.floor(product.rating) ? 'text-terracotta' : 'text-line'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-muted font-body mr-1">{product.rating}</span>
                  </div>
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
