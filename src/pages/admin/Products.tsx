import { useState, useEffect, useRef } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { Modal } from '@components/admin/Modal';
import { ConfirmDialog } from '@components/admin/ConfirmDialog';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { Plus, Pencil, Trash2, Image } from 'lucide-react';

const emptyProduct = {
  name_en: '', name_ar: '', slug: '', description_en: '', description_ar: '',
  original_price: 0, sale_price: 0, stock: 0, is_published: true, is_featured: false,
  is_digital: false, digital_file_url: '', category_id: '',
};

export const AdminProducts = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        supabase.from('products').select('*, categories:categories(id, name_en, name_ar)').order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name_en, name_ar').order('name_en'),
      ]);
      setProducts(p.data || []);
      setCategories(c.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyProduct); setImageFile(null); setModalOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name_en: p.name_en || '', name_ar: p.name_ar || '', slug: p.slug || '',
      description_en: p.description_en || '', description_ar: p.description_ar || '',
      original_price: p.original_price || 0, sale_price: p.sale_price || 0,
      stock: p.stock || 0, is_published: p.is_published ?? true,
      is_featured: p.is_featured ?? false, is_digital: p.is_digital ?? false,
      digital_file_url: p.digital_file_url || '', category_id: p.category_id || '',
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const uploadImage = async (productId: string): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${productId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('products').upload(path, imageFile, { contentType: imageFile.type });
    if (error) throw error;
    const { data } = supabase.storage.from('products').getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slug = form.slug || form.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const payload = { ...form, slug, original_price: Number(form.original_price), sale_price: Number(form.sale_price) || null, stock: Number(form.stock), category_id: form.category_id || null };

      let productId: string;
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
        if (error) throw error;
        productId = editing.id;
        addToast('تم تحديث المنتج بنجاح');
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('id').single();
        if (error) throw error;
        productId = data.id;
        addToast('تم إنشاء المنتج بنجاح');
      }

      if (imageFile) {
        try {
          const publicUrl = await uploadImage(productId);
          if (publicUrl) {
            await supabase.from('products').update({ cover_image: publicUrl }).eq('id', productId);
            // Also populate product_images for frontend display
            await supabase.from('product_images').delete().eq('product_id', productId);
            await supabase.from('product_images').insert({
              product_id: productId,
              path: publicUrl,
              alt_text: form.name_en || form.name_ar,
              sort_order: 0,
            });
          }
        } catch { addToast('تم الحفظ لكن فشل رفع الصورة', 'error'); }
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'حدث خطأ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', deleting.id);
      if (error) throw error;
      addToast('تم حذف المنتج');
      setConfirmOpen(false);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'حدث خطأ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name_en', label: 'المنتج', render: (p: any) => (
      <div className="flex items-center gap-3">
        {p.cover_image ? <img src={p.cover_image} alt="" className="w-10 h-10 rounded-lg object-cover border" /> : <div className="w-10 h-10 rounded-lg bg-cream border flex items-center justify-center"><Image className="w-5 h-5 text-muted" /></div>}
        <div><p className="font-medium text-ink">{p.name_en}</p><p className="text-xs text-muted">{p.name_ar}</p></div>
      </div>
    )},
    { key: 'price', label: 'السعر', render: (p: any) => (
      <div><span className="font-bold text-ink">{p.original_price}</span>{p.sale_price ? <span className="text-xs text-muted line-through mr-1">{p.sale_price}</span> : null}<span className="text-xs text-muted"> EGP</span></div>
    )},
    { key: 'stock', label: 'المخزون', render: (p: any) => <span className={`font-bold ${p.stock <= 3 ? 'text-red-500' : 'text-ink'}`}>{p.stock}</span> },
    { key: 'category', label: 'التصنيف', render: (p: any) => p.categories?.name_en || 'غير مصنف' },
    { key: 'status', label: 'الحالة', render: (p: any) => (
      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${p.is_published ? 'bg-sage/15 text-sage' : 'bg-cream text-muted'}`}>
        {p.is_published ? 'منشور' : 'مسودة'}
      </span>
    )},
    { key: 'actions', label: '', className: 'w-24', render: (p: any) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-cream transition-colors"><Pencil className="w-4 h-4 text-ink" /></button>
        <button onClick={() => { setDeleting(p); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>المنتجات</h2>
          <p className="text-muted mt-1">إدارة جميع المنتجات والكتب</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 transition-all">
          <Plus className="w-5 h-5" /> منتج جديد
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={products} searchPlaceholder="بحث في المنتجات..." searchKeys={['name_en', 'name_ar', 'slug']} emptyMessage="لا توجد منتجات" />
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل المنتج' : 'منتج جديد'} wide>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الاسم بالإنجليزية</label>
              <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الاسم بالعربية</label>
              <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" required dir="rtl" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الوصف بالإنجليزية</label>
              <textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={3} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الوصف بالعربية</label>
              <textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} rows={3} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none resize-none" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">السعر (EGP)</label>
              <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: +e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">سعر التخفيض</label>
              <input type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: +e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">المخزون</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">التصنيف</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none appearance-none bg-white">
              <option value="">بدون تصنيف</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en} — {c.name_ar}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">صورة المنتج</label>
            {editing?.cover_image && !imageFile && (
              <div className="mb-2"><img src={editing.cover_image} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-line" /></div>
            )}
            {imageFile && (
              <div className="mb-2"><img src={URL.createObjectURL(imageFile)} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-line" /></div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm file:ml-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-cream file:text-ink file:font-medium file:text-sm" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-terracotta" /><span className="text-sm font-medium text-ink">منشور</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 accent-terracotta" /><span className="text-sm font-medium text-ink">مميز</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_digital} onChange={(e) => setForm({ ...form, is_digital: e.target.checked })} className="w-4 h-4 accent-terracotta" /><span className="text-sm font-medium text-ink">رقمي</span></label>
          </div>
          {form.is_digital && (
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">رابط الملف الرقمي</label>
              <input value={form.digital_file_url} onChange={(e) => setForm({ ...form, digital_file_url: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] transition-all disabled:opacity-50">
              {saving ? 'جاري الحفظ...' : editing ? 'تحديث' : 'إنشاء'}
            </button>
            <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-full border-2 border-line text-ink font-medium hover:bg-cream transition-colors">إلغاء</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="حذف المنتج" message={`هل أنت متأكد من حذف "${deleting?.name_en}"؟ لا يمكن التراجع عن هذا الإجراء.`} loading={saving} />
    </div>
  );
};
