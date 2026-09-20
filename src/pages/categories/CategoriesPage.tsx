import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { ProductCard } from '@components/products/ProductCard';
import { useDocumentTitle } from '@hooks/useDocumentTitle';

const PAGE_SIZE = 12;

const SkeletonCard = () => (
  <div className="bg-white border-2 border-line rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-cream" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-cream rounded-full w-3/4" />
      <div className="h-3 bg-cream rounded-full w-1/2" />
      <div className="h-8 bg-cream rounded-full w-full" />
    </div>
  </div>
);

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Array<any>>([]);
  const [products, setProducts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  useDocumentTitle('التصنيفات');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentCategoryId) {
      setPage(1);
      fetchProducts();
    }
  }, [currentCategoryId]);

  useEffect(() => {
    if (currentCategoryId) {
      fetchProducts();
    }
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (catError) throw catError;
      setCategories(categoriesData || []);

      if (categoriesData && categoriesData.length > 0) {
        setCurrentCategoryId(categoriesData[0].id);
      }

      await fetchProducts();
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let queryBuilder = supabase
        .from('products')
        .select('*, product_images(*)', { count: 'exact' })
        .eq('is_published', true);

      if (currentCategoryId) {
        queryBuilder = queryBuilder.eq('category_id', currentCategoryId);
      }

      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const currentCategory = categories.find((c) => c.id === currentCategoryId);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display ink text-terracotta mb-4">
          {currentCategory ? currentCategory.name_ar || currentCategory.name_en : 'جميع التصنيفات'}
        </h2>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <span className="animate-pulse inline-block h-64 w-32 bg-cream rounded-md" />
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCurrentCategoryId(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  currentCategoryId === cat.id
                    ? 'bg-terracotta text-white'
                    : 'bg-cream text-foreground border border-line hover:border-terracotta'
                }`}
              >
                {cat.image_url && (
                  <img src={cat.image_url} alt={cat.name_en} className="w-6 h-6 rounded-full object-cover" />
                )}
                {cat.name_ar || cat.name_en}
              </button>
            ))}
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-10 h-10 rounded-full border-2 font-bold text-sm transition-all ${
                        p === page
                          ? 'bg-terracotta text-white border-ink shadow-[2px_2px_0px_0px_#1E293B]'
                          : 'bg-white text-ink border-line hover:border-terracotta'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
