import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase/client';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { Lock, Unlock, Download, Palette, ExternalLink, Loader2, Eye, Paintbrush } from 'lucide-react';

type ColoringPage = {
  id: string; title: string; file_url: string; price: number;
  is_free_tier: boolean; sort_order: number; created_at: string;
};

export const ColoringOnlinePage = () => {
  useDocumentTitle('مكتبة التلوين');
  const { user, profile } = useAuth();
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [previewPage, setPreviewPage] = useState<ColoringPage | null>(null);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagesRes, settingsRes] = await Promise.all([
        supabase.from('coloring_pages').select('*').order('sort_order', { ascending: true }),
        supabase.from('site_settings').select('value').eq('key', 'store').single(),
      ]);

      setPages(pagesRes.data || []);

      // Get whatsapp number from settings
      const storeVal = settingsRes.data?.value;
      if (storeVal?.whatsapp_number) {
        setWhatsappNumber(storeVal.whatsapp_number);
      }

      // Fetch unlocked pages for current user
      if (user?.id) {
        const { data: unlocked } = await supabase
          .from('user_unlocked_pages')
          .select('page_id')
          .eq('user_id', user.id);
        setUnlockedIds(new Set((unlocked || []).map((u) => u.page_id)));
      }
    } catch (err) {
      console.error('Error fetching coloring data:', err);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (page: ColoringPage) => {
    if (page.is_free_tier) return true;
    if (unlockedIds.has(page.id)) return true;
    return false;
  };

  const getWhatsAppLink = (page: ColoringPage) => {
    const userIdentifier = user?.email || user?.user_metadata?.phone_number || 'مستخدم';
    const message = `مرحباً، أود تفعيل رسمة التلوين (${page.title}) لحسابي: ${userIdentifier}`;
    const encoded = encodeURIComponent(message);
    const phone = whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encoded}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border-2 border-line rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-cream" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-cream rounded-full w-3/4" />
                <div className="h-3 bg-cream rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-2 rounded-full text-sm font-bold mb-4">
          <Palette className="w-4 h-4" />
          مكتبة التلوين الرقمية
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          اكتشف عالم التلوين
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          صفحات تلوين رقمية متنوعة. بعضها مجاني وبعضها متاح بسعر رمزي. اختر رسمتك وابدأ الإبداع!
        </p>
      </div>

      {/* Gallery */}
      {pages.length === 0 ? (
        <div className="text-center py-20 bg-white border-2 border-line rounded-2xl">
          <Palette className="w-16 h-16 text-terracotta/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-ink mb-2">قريباً</h3>
          <p className="text-muted">سنضيف صفحات تلوين مميزة قريباً. تابعونا!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => {
            const hasAccess = canAccess(page);
            return (
              <div key={page.id}
                className={`group bg-white border-2 border-line rounded-2xl overflow-hidden transition-all hover:shadow-[6px_6px_0px_0px_#E2E8F0] hover:-translate-y-1 ${!hasAccess ? 'relative' : ''}`}>
                {/* Image */}
                <div className="relative aspect-square bg-cream">
                  <img src={page.file_url} alt={page.title}
                    className={`w-full h-full object-cover ${!hasAccess ? 'blur-sm' : ''}`} />

                  {/* Lock overlay */}
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-ink/40 flex flex-col items-center justify-center">
                      <div className="bg-white border-2 border-line rounded-2xl p-6 text-center shadow-[4px_4px_0px_0px_#1E293B]">
                        <Lock className="w-10 h-10 text-terracotta mx-auto mb-2" />
                        <p className="text-2xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {page.price} ج.م
                        </p>
                        <p className="text-xs text-muted mt-1">للفتح</p>
                      </div>
                    </div>
                  )}

                  {/* Free badge */}
                  {page.is_free_tier && (
                    <div className="absolute top-3 right-3 bg-sage text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow">
                      مجاني
                    </div>
                  )}

                  {/* Unlocked badge */}
                  {hasAccess && !page.is_free_tier && (
                    <div className="absolute top-3 right-3 bg-terracotta text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> مفتوح
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-ink mb-3">{page.title}</h3>
                  <div className="flex gap-2">
                    {hasAccess ? (
                      <>
                        <Link to={`/coloring/${page.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-terracotta text-white font-bold rounded-xl text-sm border-2 border-ink shadow-[2px_2px_0px_0px_#1E293B] hover:shadow-[3px_3px_0px_0px_#1E293B] transition-all">
                          <Paintbrush className="w-4 h-4" /> تلوين
                        </Link>
                        <button onClick={() => setPreviewPage(page)}
                          className="px-3 py-2.5 bg-cream text-ink font-bold rounded-xl text-sm border border-line hover:border-terracotta transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <a href={page.file_url} download={page.title}
                          className="px-3 py-2.5 bg-cream text-ink font-bold rounded-xl text-sm border border-line hover:border-terracotta transition-colors">
                          <Download className="w-4 h-4" />
                        </a>
                      </>
                    ) : (
                      <a href={getWhatsAppLink(page)} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] text-white font-bold rounded-xl text-sm shadow-[2px_2px_0px_0px_#1E293B] hover:shadow-[3px_3px_0px_0px_#1E293B] transition-all">
                        <ExternalLink className="w-4 h-4" /> طلب فتح عبر واتساب
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/80" onClick={() => setPreviewPage(null)} />
          <div className="relative bg-white border-2 border-line rounded-2xl shadow-[8px_8px_0px_0px_#E2E8F0] max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-line">
              <h3 className="font-bold text-ink">{previewPage.title}</h3>
              <button onClick={() => setPreviewPage(null)} className="p-2 rounded-lg hover:bg-cream text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-cream">
              <img src={previewPage.file_url} alt={previewPage.title} className="w-full h-auto rounded-xl" />
            </div>
            <div className="p-4 border-t-2 border-line flex gap-2">
              <a href={previewPage.file_url} download={previewPage.title}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-terracotta text-white font-bold rounded-xl text-sm border-2 border-ink shadow-[2px_2px_0px_0px_#1E293B] transition-all">
                <Download className="w-4 h-4" /> تحميل
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
