import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Check, ChevronLeft, ChevronRight, Flower2 } from 'lucide-react';
import { supabase } from '@lib/supabase/client';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@components/layout/LanguageSwitcher';

type Product = {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  original_price: number;
  sale_price?: number | null;
  stock: number;
  cover_image?: string | null;
  product_images?: Array<{ path: string; alt_text: string }>;
};

export const BestsellersSection = () => {
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_en, name_ar, slug, original_price, sale_price, stock, cover_image, product_images(path, alt_text)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) {
        console.error('BestsellersSection fetch error:', error.message, error);
        setProducts([]);
        return;
      }
      setProducts(data || []);
    } catch (err) {
      console.error('BestsellersSection unexpected error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleCartAdd = (p: Product) => {
    if (p.stock <= 0) return;
    addItem({
      id: p.id,
      name: lang === 'ar' ? p.name_ar : p.name_en,
      originalPrice: p.original_price,
      salePrice: p.sale_price || p.original_price,
      stock: p.stock,
      imageUrl: p.product_images?.[0]?.path || p.cover_image || undefined,
    });
    setAddedIds((prev) => new Set(prev).add(p.id));
    setTimeout(() => {
      setAddedIds((prev) => { const next = new Set(prev); next.delete(p.id); return next; });
    }, 1500);
  };

  const handleWishlistToggle = async (p: Product) => {
    if (!user) { navigate('/login'); return; }
    if (wishlistIds.has(p.id)) {
      await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', p.id);
      setWishlistIds((prev) => { const next = new Set(prev); next.delete(p.id); return next; });
    } else {
      await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: p.id });
      setWishlistIds((prev) => new Set(prev).add(p.id));
    }
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="container-wide">
          <div className="h-8 w-48 bg-card rounded-lg mb-8 animate-pulse" />
          <div className="flex gap-5 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-none w-56 md:w-64 bg-white rounded-2xl p-3 shadow-sm animate-pulse">
                <div className="aspect-[3/4] bg-card rounded-xl mb-3" />
                <div className="h-4 bg-card rounded w-3/4 mb-2" />
                <div className="h-4 bg-card rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <Flower2 className="w-6 h-6" style={{ color: '#C25350' }} />
            <h3 className="text-2xl md:text-3xl font-display font-bold" style={{ color: '#2C1E1B' }}>
              {t('كتب التلوين', 'Coloring Books')}
            </h3>
          </div>
          <div className="bg-white rounded-2xl border-2 border-line p-10 text-center">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3" style={{ color: '#C25350', opacity: 0.4 }} />
            <p className="font-medium" style={{ color: '#5A4A42' }}>
              {t('لا توجد منتجات حالياً', 'No products available right now')}
            </p>
            <Link to="/shop" className="inline-block mt-4 btn-primary text-sm py-2.5 px-6">
              {t('تصفح المتجر', 'Browse shop')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flower2 className="w-6 h-6" style={{ color: '#C25350' }} />
            <h3 className="text-2xl md:text-3xl font-display font-bold" style={{ color: '#2C1E1B' }}>
              {t('كتب التلوين', 'Coloring Books')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/shop" className="text-sm font-bold flex items-center gap-1 hover:underline" style={{ color: '#C25350' }}>
              {t('عرض الكل', 'View All')} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <div className="hidden md:flex gap-2">
              <button onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors hover:bg-card"
                style={{ borderColor: '#E2E8F0', color: '#2C1E1B' }}
                aria-label={t('السابق', 'Previous')}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors hover:bg-card"
                style={{ borderColor: '#E2E8F0', color: '#2C1E1B' }}
                aria-label={t('التالي', 'Next')}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {products.map((p) => {
            const name = lang === 'ar' ? p.name_ar : p.name_en;
            const price = p.sale_price || p.original_price;
            const hasDiscount = p.sale_price && p.sale_price < p.original_price;
            const img = p.product_images?.[0]?.path || p.cover_image;

            return (
              <div key={p.id}
                className="flex-none w-56 md:w-64 bg-white rounded-2xl p-3 shadow-sm snap-start cursor-pointer group"
                onClick={() => navigate(`/products/${p.slug}`)}>
                {/* Image */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3" style={{ backgroundColor: '#F9F6F0' }}>
                  {img ? (
                    <img src={img} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10" style={{ color: '#C25350', opacity: 0.3 }} />
                    </div>
                  )}

                  {/* Wishlist heart */}
                  <button
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleWishlistToggle(p); }}
                    aria-label={wishlistIds.has(p.id) ? t('إزالة من المفضلة', 'Remove from wishlist') : t('إضافة للمفضلة', 'Add to wishlist')}>
                    <Heart className={`w-4 h-4 ${wishlistIds.has(p.id) ? 'fill-current' : ''}`}
                      style={{ color: wishlistIds.has(p.id) ? '#C25350' : '#5A4A42' }} />
                  </button>

                  {/* Discount badge */}
                  {hasDiscount && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: '#C25350' }}>
                      -{Math.round((1 - p.sale_price! / p.original_price) * 100)}%
                    </div>
                  )}

                  {/* Quick add */}
                  <button
                    className="absolute bottom-2 left-2 right-2 py-2 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                    style={{ backgroundColor: addedIds.has(p.id) ? '#5B8A6A' : '#C25350' }}
                    onClick={(e) => { e.stopPropagation(); handleCartAdd(p); }}
                    disabled={p.stock <= 0}>
                    {addedIds.has(p.id) ? (
                      <><Check className="w-3.5 h-3.5" /> {t('تمت الإضافة', 'Added')}</>
                    ) : (
                      <><ShoppingCart className="w-3.5 h-3.5" /> {t('أضف', 'Add')}</>
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="px-1 pb-1">
                  <h4 className="font-body font-medium text-sm line-clamp-1 mb-1" style={{ color: '#2C1E1B' }}>{name}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold" style={{ color: '#C25350' }}>{price} EGP</span>
                    {hasDiscount && (
                      <span className="text-xs line-through" style={{ color: '#5A4A42' }}>{p.original_price} EGP</span>
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
