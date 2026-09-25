import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Flower2, ChevronRight, Quote } from 'lucide-react';
import { supabase } from '@lib/supabase/client';
import { useLanguage } from '@components/layout/LanguageSwitcher';

type ReviewUser = { full_name: string | null; avatar_url: string | null } | null;

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  user: ReviewUser[] | ReviewUser;
};

const unwrapUser = (user: Review['user']): ReviewUser => {
  if (Array.isArray(user)) return user[0] ?? null;
  return user;
};

export const ReviewsSection = () => {
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, is_approved, created_at, user:profiles(full_name, avatar_url)')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) {
        console.error('ReviewsSection fetch error:', error.message, error);
        setReviews([]);
        return;
      }
      setReviews((data as unknown as Review[]) || []);
    } catch (err) {
      console.error('ReviewsSection unexpected error:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: '#F9F6F0' }}>
        <div className="container-wide">
          <div className="h-8 w-32 bg-card rounded-lg mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="h-12 w-12 bg-card rounded-full mb-4" />
                <div className="h-4 bg-card rounded w-3/4 mb-2" />
                <div className="h-4 bg-card rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const sectionHeader = (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <Flower2 className="w-6 h-6" style={{ color: '#C25350' }} />
        <h3 className="text-2xl md:text-3xl font-display font-bold" style={{ color: '#2C1E1B' }}>
          {t('التقييمات', 'Reviews')}
        </h3>
      </div>
      <Link to="/shop" className="text-sm font-bold flex items-center gap-1 hover:underline" style={{ color: '#C25350' }}>
        {t('المزيد', 'See More')} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </Link>
    </div>
  );

  if (reviews.length === 0) {
    return (
      <section className="py-16" style={{ backgroundColor: '#F9F6F0' }}>
        <div className="container-wide">
          {sectionHeader}
          <div className="bg-white rounded-2xl border-2 border-line p-10 text-center">
            <Quote className="w-8 h-8 mx-auto mb-3" style={{ color: '#C25350', opacity: 0.4 }} />
            <p className="font-medium" style={{ color: '#5A4A42' }}>
              {t('لا توجد تقييمات بعد', 'No reviews yet')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" style={{ backgroundColor: '#F9F6F0' }}>
      <div className="container-wide">
        {sectionHeader}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.slice(0, 6).map((review) => {
            const user = unwrapUser(review.user);
            return (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: '#C25350' }}>
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user?.full_name || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#2C1E1B' }}>
                    {user?.full_name || t('عميل', 'Customer')}
                  </p>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5"
                        fill={s <= review.rating ? '#FBBF24' : 'none'}
                        style={{ color: s <= review.rating ? '#FBBF24' : '#E2E8F0' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="flex gap-2 flex-1">
                <Quote className="w-4 h-4 shrink-0 mt-1" style={{ color: '#C25350', opacity: 0.4 }} />
                <p className="text-sm leading-relaxed" style={{ color: '#5A4A42' }}>
                  {review.comment || t('منتج رائع، أنصح به!', 'Great product, highly recommend!')}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};