import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { Modal } from '@components/admin/Modal';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { Star, Eye } from 'lucide-react';

export const AdminReviews = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { if (user?.id) fetchReviews(); }, [user?.id]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews')
      .select('*, user:profiles(full_name, email), product:products(name_en, name_ar)')
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const toggleApproval = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reviews').update({ is_approved: !current }).eq('id', id);
    if (error) addToast(error.message, 'error'); else { addToast('تم التحديث'); fetchReviews(); }
  };

  const columns = [
    { key: 'product', label: 'المنتج', render: (r: any) => <span className="font-medium text-ink">{r.product?.name_en || '—'}</span> },
    { key: 'user', label: 'العميل', render: (r: any) => <div><p className="text-sm text-ink">{r.user?.full_name || 'غير معروف'}</p><p className="text-xs text-muted">{r.user?.email}</p></div> },
    { key: 'rating', label: 'التقييم', render: (r: any) => (
      <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-terracotta text-terracotta' : 'text-line'}`} />)}</div>
    )},
    { key: 'is_approved', label: 'الحالة', render: (r: any) => <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${r.is_approved ? 'bg-sage/15 text-sage' : 'bg-amber-100 text-amber-700'}`}>{r.is_approved ? 'موافق' : 'معلق'}</span> },
    { key: 'created_at', label: 'التاريخ', render: (r: any) => new Date(r.created_at).toLocaleDateString('ar-EG') },
    { key: 'actions', label: '', className: 'w-32', render: (r: any) => (
      <div className="flex gap-1">
        <button onClick={() => setSelected(r)} className="p-2 rounded-lg hover:bg-cream"><Eye className="w-4 h-4 text-ink" /></button>
        <button onClick={() => toggleApproval(r.id, r.is_approved)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${r.is_approved ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-sage text-sage hover:bg-sage/5'}`}>
          {r.is_approved ? 'إلغاء' : 'موافقة'}
        </button>
      </div>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>التقييمات</h2>
        <p className="text-muted mt-1">إدارة تقييمات وتعليقات العملاء</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={reviews} searchPlaceholder="بحث..." searchKeys={['comment']} emptyMessage="لا توجد تقييمات" />
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="تفاصيل التقييم">
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-6 h-6 ${s <= selected.rating ? 'fill-terracotta text-terracotta' : 'text-line'}`} />)}</div>
            <p className="text-ink">{selected.comment || 'لا يوجد تعليق'}</p>
            <div className="text-sm text-muted">
              <p>المنتج: {selected.product?.name_en}</p>
              <p>العميل: {selected.user?.full_name} — {selected.user?.email}</p>
              <p>{new Date(selected.created_at).toLocaleDateString('ar-EG')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
