import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { useCart } from '@hooks/useCart';
import { useDocumentTitle } from '@hooks/useDocumentTitle';

export const ProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<Array<{ path: string; alt_text: string }>>([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);

  useDocumentTitle(product?.name_ar || product?.name_en);

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error: prodError } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('slug', slug)
        .single();

      if (prodError) throw prodError;
      setProduct(data);
      setImages(data.product_images || []);

      if ((!data.product_images || data.product_images.length === 0) && data.cover_image) {
        setImages([{ path: data.cover_image, alt_text: data.name_en || '' }]);
      }

      if (user && data) {
        const { data: wishlistData } = await supabase
          .from('wishlist_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', data.id)
          .single();

        setInWishlist(!!wishlistData);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user || !product) return;

    if (inWishlist) {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);

      if (!error) setInWishlist(false);
    } else {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: user.id, product_id: product.id });

      if (!error) setInWishlist(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="h-64 w-32 bg-cream rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold ink">منتج غير موجود</h2>
        <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2 border border-line rounded-full">
          العودة للمتجر
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-terracotta font-medium mb-4">معرض الصور</h3>
          <div className="space-y-4">
            {images.length > 0 ? (
              images.map((img, index) => (
                <img key={index} src={img.path} alt={img.alt_text || product.name_en} className="w-full h-64 object-contain rounded-md" />
              ))
            ) : (
              <div className="w-full h-64 bg-cream rounded-md flex items-center justify-center">
                <span className="text-muted">لا توجد صور</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-display ink mb-4">{product.name_en}</h2>
          {product.name_ar && <p className="text-muted text-lg mb-6">{product.name_ar}</p>}

          <div className="mb-6">
            <p className="text-terracotta font-bold text-3xl">{product.original_price} EGP</p>
            {product.sale_price && product.sale_price < product.original_price && (
              <>
                <p className="text-line-through text-muted line-through">{product.original_price} EGP</p>
                <span className="text-terracotta">خصم {Math.round((1 - product.sale_price / product.original_price) * 100)}%</span>
              </>
            )}
          </div>

          <div className="mb-6 p-4 border border-line rounded-xl">
            {product.stock > 0 ? (
              <>
                <span className="text-terracotta font-medium">متوفر</span>
                <p className="text-muted mt-1">الباقي من المخزون: {product.stock}</p>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-2 w-full px-3 py-2 border border-line rounded-xl"
                />
                <button
                  onClick={() => addItem({
                    id: product.id,
                    name: product.name_en,
                    originalPrice: product.original_price,
                    salePrice: product.sale_price || product.original_price,
                    stock: product.stock,
                    imageUrl: images[0]?.path || product.cover_image,
                  }, quantity)}
                  className="mt-4 w-full py-3 bg-terracotta text-white font-bold rounded-full hover:bg-terracotta-dark transition-colors"
                >
                  إضافة للسلة
                </button>
              </>
            ) : (
              <p className="text-terracotta">نفدت الكمية</p>
            )}
          </div>

          {product.description_en && (
            <div>
              <h4 className="text-terracotta font-medium mb-3">الوصف</h4>
              <p className="text-muted">{product.description_en}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
