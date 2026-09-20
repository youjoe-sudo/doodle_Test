import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase/client';

type ProductCardProps = {
  product: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    original_price: number;
    sale_price?: number;
    stock: number;
    is_published: boolean;
    category_id?: string;
    cover_image?: string | null;
    product_images?: Array<{ path: string; alt_text: string }>;
  };
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const hasDiscount = product.sale_price && product.sale_price < product.original_price;
  const displayPrice = product.sale_price || product.original_price;
  const discountPercent = hasDiscount
    ? Math.round((1 - (product.sale_price || 0) / product.original_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      id: product.id,
      name: product.name_en,
      originalPrice: product.original_price,
      salePrice: product.sale_price || product.original_price,
      stock: product.stock,
      imageUrl: product.product_images?.[0]?.path || product.cover_image || undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (inWishlist) {
      await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', product.id);
      setInWishlist(false);
    } else {
      await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
      setInWishlist(true);
    }
  };

  return (
    <div
      className="sticker-card overflow-hidden group cursor-pointer"
      onClick={() => navigate(`/products/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-cream to-blush/20 overflow-hidden">
        {(product.product_images && product.product_images.length > 0) || product.cover_image ? (
          <img
            src={product.product_images?.[0]?.path || product.cover_image || ''}
            alt={product.product_images?.[0]?.alt_text || product.name_en}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-terracotta/10 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-terracotta/40" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />

        {/* Discount badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-terracotta text-white text-xs font-bold
            px-2.5 py-1 rounded-full shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist button */}
        <button
          className={`absolute top-3 left-3 w-9 h-9 backdrop-blur-sm rounded-full
            flex items-center justify-center opacity-0 group-hover:opacity-100
            transition-all duration-300
            translate-y-2 group-hover:translate-y-0 shadow-card
            ${inWishlist ? 'bg-terracotta text-white opacity-100' : 'bg-white/90 text-ink hover:bg-terracotta hover:text-white'}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick add to cart */}
        <button
          className={`absolute bottom-3 left-3 right-3 backdrop-blur-sm rounded-xl
            py-2.5 text-sm font-bold opacity-0 group-hover:opacity-100
            transition-all duration-300 translate-y-2 group-hover:translate-y-0
            shadow-card flex items-center justify-center gap-2
            ${addedToCart
              ? 'bg-sage text-white'
              : 'bg-white/90 text-ink hover:bg-terracotta hover:text-white'
            }`}
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {addedToCart ? (
            <><Check className="w-4 h-4" /> تمت الإضافة</>
          ) : (
            <><ShoppingCart className="w-4 h-4" /> أضف للسلة</>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-body font-medium text-ink text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name_en}
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="text-terracotta font-bold text-lg">{displayPrice} EGP</span>
          {hasDiscount && (
            <span className="text-muted text-sm line-through">{product.original_price} EGP</span>
          )}
        </div>
        {product.stock > 0 ? (
          <span className="inline-block mt-2 text-xs font-body text-sage-dark bg-sage/10 px-2 py-0.5 rounded-full">
            متوفر
          </span>
        ) : (
          <span className="inline-block mt-2 text-xs font-body text-muted bg-line/50 px-2 py-0.5 rounded-full">
            نفدت الكمية
          </span>
        )}
      </div>
    </div>
  );
};
