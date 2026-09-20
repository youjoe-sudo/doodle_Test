import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ProductCard } from '@components/products/ProductCard';
import { supabase } from '@lib/supabase/client';
import { useDebounce } from '@hooks/useDebounce';
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

export const SearchPage = () => {
  const [products, setProducts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [params] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');

  const debouncedQuery = useDebounce(searchQuery, 400);

  useDocumentTitle(debouncedQuery ? `نتائج البحث عن "${debouncedQuery}"` : 'البحث');

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    const query = params.get('q') || '';
    setSearchQuery(query);
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedQuery, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let queryBuilder = supabase
        .from('products')
        .select('*, category:categories(*), product_images(*)', { count: 'exact' })
        .eq('is_published', true);

      if (debouncedQuery) {
        queryBuilder = queryBuilder.or(`name_en.ilike.%${debouncedQuery}%,name_ar.ilike.%${debouncedQuery}%`);
      }

      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display ink text-terracotta mb-4">
          {debouncedQuery ? `نتائج البحث عن "${debouncedQuery}"` : 'البحث عن المنتجات'}
        </h2>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منتجات..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-line rounded-full focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all text-ink placeholder:text-muted"
          />
          <p className="text-muted text-sm mt-2">{totalCount} نتيجة</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
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
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted text-lg">لم نجد أي نتائج مطابقة لبحثك.</p>
          <p className="text-terracotta mt-2">جرب كلمات مختلفة أو تصفح التصنيفات</p>
        </div>
      )}
    </div>
  );
};
