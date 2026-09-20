import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { Modal } from '@components/admin/Modal';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';

type Coupon = { id: string; code: string; discount_percent: number; discount_amount: number; min_order_amount: number; max_uses: number | null; times_used: number; is_active: boolean; expires_at: string | null };

const emptyCoupon: Omit<Coupon, 'id' | 'times_used'> = { code: '', discount_percent: 0, discount_amount: 0, min_order_amount: 0, max_uses: null, is_active: true, expires_at: null };

export const AdminCoupons = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user?.id) fetchCoupons(); }, [user?.id]);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(emptyCoupon); setModalOpen(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, discount_percent: c.discount_percent, discount_amount: c.discount_amount, min_order_amount: c.min_order_amount, max_uses: c.max_uses, is_active: c.is_active, expires_at: c.expires_at }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.code.trim()) { addToast('أدخل كود الكوبون', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, code: form.code.toUpperCase().trim(), discount_percent: Number(form.discount_percent), discount_amount: Number(form.discount_amount), min_order_amount: Number(form.min_order_amount), max_uses: form.max_uses ? Number(form.max_uses) : null };
      if (editing) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
        if (error) throw error;
        addToast('تم تحديث الكوبون');
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
        addToast('تم إنشاء الكوبون');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      addToast(err.message || 'حدث خطأ', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`حذف كوبون "${c.code}"؟`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', c.id);
    if (error) addToast(error.message, 'error'); else { addToast('تم الحذف'); fetchCoupons(); }
  };

  const columns = [
    { key: 'code', label: 'الكود', render: (c: Coupon) => <code className="bg-cream px-3 py-1.5 rounded-lg text-sm font-bold text-ink border border-line">{c.code}</code> },
    { key: 'discount', label: 'الخصم', render: (c: Coupon) => c.discount_percent > 0 ? <span className="font-bold text-terracotta">{c.discount_percent}%</span> : c.discount_amount > 0 ? <span className="font-bold text-terracotta">{c.discount_amount} EGP</span> : <span className="text-muted">—</span> },
    { key: 'min', label: 'الحد الأدنى', render: (c: Coupon) => c.min_order_amount > 0 ? <span className="text-sm">{c.min_order_amount} EGP</span> : <span className="text-muted">—</span> },
    { key: 'uses', label: 'الاستخدام', render: (c: Coupon) => <span className="text-sm">{c.times_used}{c.max_uses ? ` / ${c.max_uses}` : ''}</span> },
    { key: 'is_active', label: 'الحالة', render: (c: Coupon) => <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${c.is_active ? 'bg-sage/15 text-sage' : 'bg-cream text-muted'}`}>{c.is_active ? 'نشط' : 'معطل'}</span> },
    { key: 'expires_at', label: 'الانتهاء', render: (c: Coupon) => c.expires_at ? new Date(c.expires_at).toLocaleDateString('ar-EG') : <span className="text-muted">أبدي</span> },
    { key: 'actions', label: '', className: 'w-24', render: (c: Coupon) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-cream"><Pencil className="w-4 h-4 text-ink" /></button>
        <button onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>الكوبونات</h2>
          <p className="text-muted mt-1">إنشاء وإدارة كوبونات الخصم</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 transition-all">
          <Plus className="w-5 h-5" /> كوبون جديد
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={coupons} searchPlaceholder="بحث في الكوبونات..." searchKeys={['code']} emptyMessage="لا توجد كوبونات" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الكوبون' : 'كوبون جديد'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">كود الكوبون</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm font-bold focus:border-terracotta focus:outline-none uppercase tracking-wider" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">خصم نسبة (%)</label>
              <input type="number" min={0} max={100} value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: +e.target.value, discount_amount: +e.target.value > 0 ? 0 : form.discount_amount })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">خصم مبلغ (EGP)</label>
              <input type="number" min={0} value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: +e.target.value, discount_percent: +e.target.value > 0 ? 0 : form.discount_percent })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الحد الأدنى للطلب (EGP)</label>
              <input type="number" min={0} value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: +e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">حد الاستخدام</label>
              <input type="number" min={0} value={form.max_uses ?? ''} onChange={(e) => setForm({ ...form, max_uses: e.target.value ? +e.target.value : null })} placeholder="بلا حد" className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">تاريخ الانتهاء</label>
            <input type="date" value={form.expires_at?.split('T')[0] || ''} onChange={(e) => setForm({ ...form, expires_at: e.target.value || null })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-terracotta" /><span className="text-sm font-medium text-ink">نشط</span></label>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] transition-all disabled:opacity-50">
              {saving ? 'جاري الحفظ...' : editing ? 'تحديث' : 'إنشاء'}
            </button>
            <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-full border-2 border-line text-ink font-medium hover:bg-cream transition-colors">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
