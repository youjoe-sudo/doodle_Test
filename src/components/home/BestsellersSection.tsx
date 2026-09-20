import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { useInView } from '@hooks/useInView';

const bestsellers = [
  { id: '1', title: 'الأمير الصغير', author: 'أنطوان دو سانت', price: 120, originalPrice: 150, rating: 4.9, reviews: 234, image: null, badge: 'الأكثر مبيعاً' },
  { id: '2', title: 'الخيميائي', author: 'باولو كويلو', price: 95, originalPrice: null, rating: 4.8, reviews: 189, image: null, badge: null },
  { id: '3', title: 'Matilda', author: 'Roald Dahl', price: 85, originalPrice: 110, rating: 4.9, reviews: 312, image: null, badge: 'New' },
  { id: '4', title: 'فن اللامبالاة', author: 'مارك مانسون', price: 110, originalPrice: null, rating: 4.7, reviews: 156, image: null, badge: null },
  { id: '5', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 75, originalPrice: 95, rating: 4.8, reviews: 278, image: null, badge: 'خصم 20%' },
  { id: '6', title: 'أبجديات السعادة', author: 'ياسمين عبد الرحيم', price: 88, originalPrice: null, rating: 4.6, reviews: 98, image: null, badge: null },
];

const BookCover = ({ title, color }: { title: string; color: string }) => (
  <div className={`w-full aspect-[3/4] ${color} rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
    {/* Decorative spine line */}
    <div className="absolute left-3 top-0 bottom-0 w-px bg-white/20" />
    {/* Title */}
    <p className="font-display font-bold text-white text-center text-sm md:text-base leading-tight drop-shadow-sm">{title}</p>
    {/* Decorative dots */}
    <div className="absolute bottom-3 right-3 flex gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
    </div>
  </div>
);

const coverColors = [
  'bg-gradient-to-br from-terracotta to-terracotta-dark',
  'bg-gradient-to-br from-sage-dark to-sage',
  'bg-gradient-to-br from-[#5B7B8A] to-[#3D5A68]',
  'bg-gradient-to-br from-[#8B6B8A] to-[#6A4D6B]',
  'bg-gradient-to-br from-terracotta-dark to-[#6E3A2D]',
  'bg-gradient-to-br from-[#7B8B6A] to-sage-dark',
];

export const BestsellersSection = () => {
  const { ref, isInView } = useInView(0.05);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const handleCartAdd = (id: string) => {
    setAddedIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setAddedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }, 1500);
  };

  const handleWishlistToggle = (id: string) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
          <div>
            <span className={`inline-block text-sm font-body text-terracotta font-medium tracking-wider uppercase mb-3 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Bestsellers
            </span>
            <h3 className={`text-3xl md:text-4xl font-display font-bold text-ink transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              الأكثر <span className="text-terracotta">مبيعاً</span>
            </h3>
          </div>
          <Link to="/shop" className="btn-outline text-sm py-2.5 px-6 transition-all duration-700 delay-200"
            style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'none' : 'translateY(16px)' }}>
            عرض الكل
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 md:gap-8">
          {bestsellers.map((book, i) => {
            const hasDiscount = book.originalPrice && book.originalPrice > book.price;
            const discount = hasDiscount ? Math.round((1 - book.price / book.originalPrice!) * 100) : 0;

            return (
              <div
                key={book.id}
                className={`group bg-white border-2 border-line rounded-2xl overflow-hidden shadow-card
                  transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2
                  ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100 + 300}ms` }}
              >
                {/* Book Cover */}
                <div className="relative p-4 pb-0">
                  {/* Badge */}
                  {book.badge && (
                    <div className="absolute top-6 right-6 z-10 bg-terracotta text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {book.badge}
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    className={`absolute top-6 left-6 z-10 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center
                      opacity-0 group-hover:opacity-100 transition-all duration-300
                      translate-y-2 group-hover:translate-y-0 shadow-card
                      ${wishlistIds.has(book.id) ? 'bg-terracotta text-white opacity-100' : 'bg-white/90 text-ink hover:bg-terracotta hover:text-white'}`}
                    onClick={() => handleWishlistToggle(book.id)}
                    aria-label={wishlistIds.has(book.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  >
                    <Heart className={`w-4 h-4 ${wishlistIds.has(book.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Book cover with 3D perspective on hover */}
                  <div className="transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2 [perspective:800px]">
                    <BookCover title={book.title} color={coverColors[i % coverColors.length]} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 md:p-5">
                  <p className="text-xs text-muted font-body mb-1">{book.author}</p>
                  <h4 className="font-display font-bold text-ink text-sm md:text-base mb-2 line-clamp-1">{book.title}</h4>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 text-terracotta fill-terracotta" />
                    <span className="text-xs font-bold text-ink">{book.rating}</span>
                    <span className="text-xs text-muted">({book.reviews})</span>
                  </div>

                  {/* Price + Cart */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-terracotta font-bold text-lg">{book.price} EGP</span>
                      {hasDiscount && (
                        <span className="text-muted text-xs line-through">{book.originalPrice} EGP</span>
                      )}
                    </div>
                    <button
                      className={`w-9 h-9 rounded-xl flex items-center justify-center
                        transition-all duration-300
                        hover:shadow-btn active:shadow-btn-active active:translate-x-0.5 active:translate-y-0.5
                        ${addedIds.has(book.id)
                          ? 'bg-sage text-white'
                          : 'bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-white'
                        }`}
                      onClick={() => handleCartAdd(book.id)}
                      aria-label={addedIds.has(book.id) ? 'تمت الإضافة' : 'أضف للسلة'}
                    >
                      {addedIds.has(book.id) ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
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
