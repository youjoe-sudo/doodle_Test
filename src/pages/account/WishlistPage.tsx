import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useDocumentTitle } from '@hooks/useDocumentTitle';

export const WishlistPage = () => {
  useDocumentTitle('المفضلة');
  const { user } = useAuth();
  const [items, setItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchItems();
  }, [user?.id]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*, product:products(*)')
        .eq('user_id', user?.id);

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display ink text-terracotta mb-4">المفضلة</h2>
        <p className="text-muted">المنتجات التي قمت بحفظها</p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <span className="animate-pulse inline-block h-64 w-32 bg-cream rounded-md"></span>
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-muted py-8">لا توجد منتجات في القائمة المفضلة</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-xl overflow-hidden">
              {(item.product?.product_images?.[0] || item.product?.cover_image) && (
                <img src={item.product.product_images?.[0]?.path || item.product.cover_image} alt={item.product.name_en} className="w-full h-48 object-cover" />
              )}
              <div className="p-3">
                <h4 className="font-medium line-clamp-2">{item.product?.name_en}</h4>
                <p className="text-terracotta font-medium">{item.product?.original_price?.toLocaleString()} EGP</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
