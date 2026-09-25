import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Flower2, ChevronRight } from 'lucide-react';
import { supabase } from '@lib/supabase/client';
import { useCart } from '@hooks/useCart';
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

export const NewArrivalsSection = () => {
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        .limit(4);
      if (error) {
        console.error('NewArrivalsSection fetch error:', error.message, error);
        setProducts([]);
        return;
      }
      setProducts(data || []);
    } catch (err) {
      console.error('NewArrivalsSection unexpected error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: '#F9F6F0' }}>
        <div className="container-wide">
          <div className="h-8 w-40 bg-card rounded-lg mb-8 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-sm animate-pulse">
                <div className="aspect-square bg-card rounded-xl mb-3" />
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
      <section className="py-16" style={{ backgroundColor: '#F9F6F0' }}>
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-8">
            <Flower2 className="w-6 h-6" style={{ color: '#C25350' }} />
            <h3 className="text-2xl md:text-3xl font-display font-bold" style={{ color: '#2C1E1B' }}>
              {t('وصولات جديدة', 'New Arrivals')}
            </h3>
          </div>
          <div className="bg-white rounded-2xl border-2 border-line p-10 text-center">
            <p className="font-medium" style={{ color: '#5A4A42' }}>
              {t('لا توجد وصولات جديدة حالياً', 'No new arrivals right now')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" style={{ backgroundColor: '#F9F6F0' }}>
      <div className="container-wide">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flower2 className="w-6 h-6" style={{ color: '#C25350' }} />
            <h3 className="text-2xl md:text-3xl font-display font-bold" style={{ color: '#2C1E1B' }}>
              {t('وصولات جديدة', 'New Arrivals')}
            </h3>
          </div>
          <Link to="/shop" className="text-sm font-bold flex items-center gap-1 hover:underline" style={{ color: '#C25350' }}>
            {t('عرض الكل', 'View All')} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => {
            const name = lang === 'ar' ? p.name_ar : p.name_en;
            const price = p.sale_price || p.original_price;
            const hasDiscount = p.sale_price && p.sale_price < p.original_price;
            const img = p.product_images?.[0]?.path || p.cover_image;

            return (
              <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm cursor-pointer group"
                onClick={() => navigate(`/products/${p.slug}`)}>
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3" style={{ backgroundColor: '#F9F6F0' }}>
                  {img ? (
                    <img src={img} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10" style={{ color: '#C25350', opacity: 0.3 }} />
                    </div>
                  )}

                  <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t('إضافة للمفضلة', 'Add to wishlist')}>
                    <Heart className="w-4 h-4" style={{ color: '#5A4A42' }} />
                  </button>

                  {hasDiscount && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: '#C25350' }}>
                      {t('خصم', 'SALE')}
                    </div>
                  )}
                </div>

                <div className="px-1 pb-1">
                  <h4 className="font-body font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]" style={{ color: '#2C1E1B' }}>{name}</h4>
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
