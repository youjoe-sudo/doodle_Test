import { useState, useEffect, useRef } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { Modal } from '@components/admin/Modal';
import { ConfirmDialog } from '@components/admin/ConfirmDialog';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { Plus, Pencil, Trash2, Tags, Loader2 } from 'lucide-react';

const emptyCategory = { name_en: '', name_ar: '', slug: '', description: '', image_url: '', is_active: true, sort_order: 0 };

export const AdminCategories = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user?.id) fetchCategories(); }, [user?.id]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data || []);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(emptyCategory); setImageFile(null); setModalOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name_en: c.name_en, name_ar: c.name_ar, slug: c.slug, description: c.description || '', image_url: c.image_url || '', is_active: c.is_active, sort_order: c.sort_order || 0 }); setImageFile(null); setModalOpen(true); };

  const autoSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '');

  const uploadCategoryImage = async (categoryId: string): Promise<string | null> => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `${categoryId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('categories').upload(path, imageFile, { contentType: imageFile.type });
      if (error) throw error;
      const { data } = supabase.storage.from('categories').getPublicUrl(path);
      return data?.publicUrl || null;
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.name_ar.trim()) { addToast('أدخل اسم التصنيف بالإنجليزية والعربية', 'error'); return; }
    setSaving(true);
    try {
      const slug = form.slug || autoSlug(form.name_en);
      const payload = { ...form, slug };

      let categoryId: string;
      if (editing) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
        if (error) throw error;
        categoryId = editing.id;
        addToast('تم تحديث التصنيف');
      } else {
        const { data, error } = await supabase.from('categories').insert(payload).select('id').single();
        if (error) throw error;
        categoryId = data.id;
        addToast('تم إنشاء التصنيف');
      }

      if (imageFile) {
        try {
          const publicUrl = await uploadCategoryImage(categoryId);
          if (publicUrl) {
            await supabase.from('categories').update({ image_url: publicUrl }).eq('id', categoryId);
          }
        } catch { addToast('تم الحفظ لكن فشل رفع الصورة', 'error'); }
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      addToast(err.message || 'حدث خطأ', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    const { error } = await supabase.from('categories').delete().eq('id', deleting.id);
    if (error) { addToast(error.message, 'error'); } else { addToast('تم حذف التصنيف'); setConfirmOpen(false); fetchCategories(); }
    setSaving(false);
  };

  const columns = [
    { key: 'image', label: '', className: 'w-14', render: (c: any) => c.image_url ? <img src={c.image_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-line" /> : <div className="w-10 h-10 rounded-xl bg-cream border-2 border-line flex items-center justify-center"><Tags className="w-5 h-5 text-muted" /></div> },
    { key: 'name_en', label: 'الاسم (EN)', render: (c: any) => <span className="font-medium text-ink">{c.name_en}</span> },
    { key: 'name_ar', label: 'الاسم (AR)', render: (c: any) => <span className="font-medium text-ink" dir="rtl">{c.name_ar}</span> },
    { key: 'slug', label: 'Slug', render: (c: any) => <code className="text-xs bg-cream px-2 py-1 rounded-lg text-muted">{c.slug}</code> },
    { key: 'is_active', label: 'الحالة', render: (c: any) => <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${c.is_active ? 'bg-sage/15 text-sage' : 'bg-cream text-muted'}`}>{c.is_active ? 'نشط' : 'معطل'}</span> },
    { key: 'actions', label: '', className: 'w-24', render: (c: any) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-cream"><Pencil className="w-4 h-4 text-ink" /></button>
        <button onClick={() => { setDeleting(c); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>التصنيفات</h2>
          <p className="text-muted mt-1">إدارة تصنيفات المنتجات</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 transition-all">
          <Plus className="w-5 h-5" /> تصنيف جديد
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={categories} searchPlaceholder="بحث في التصنيفات..." searchKeys={['name_en', 'name_ar', 'slug']} emptyMessage="لا توجد تصنيفات" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل التصنيف' : 'تصنيف جديد'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الاسم بالإنجليزية</label>
            <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الاسم بالعربية</label>
            <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="rtl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الوصف</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">صورة التصنيف</label>
            {editing?.image_url && !imageFile && (
              <div className="mb-2"><img src={editing.image_url} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-line" /></div>
            )}
            {imageFile && (
              <div className="mb-2"><img src={URL.createObjectURL(imageFile)} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-line" /></div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm file:ml-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-cream file:text-ink file:font-medium file:text-sm" />
            {uploading && <p className="text-xs text-muted mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> جاري رفع الصورة...</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الترتيب</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-terracotta" /><span className="text-sm font-medium text-ink">نشط</span></label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || uploading} className="flex-1 py-3 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] transition-all disabled:opacity-50">
              {saving ? 'جاري الحفظ...' : editing ? 'تحديث' : 'إنشاء'}
            </button>
            <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-full border-2 border-line text-ink font-medium hover:bg-cream transition-colors">إلغاء</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="حذف التصنيف" message={`هل أنت متأكد من حذف "${deleting?.name_en}"؟`} loading={saving} />
    </div>
  );
};
