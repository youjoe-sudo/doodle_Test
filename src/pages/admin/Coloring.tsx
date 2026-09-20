import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { Upload, Trash2, DollarSign, Users, Eye, Lock, Unlock, Loader2, Image } from 'lucide-react';

type ColoringPage = {
  id: string; title: string; file_url: string; price: number;
  is_free_tier: boolean; sort_order: number; created_at: string;
};

type UserProfile = { id: string; full_name: string; email: string; };

type UnlockRecord = { id: string; user_id: string; page_id: string; unlocked_at: string; };

export const AdminColoring = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState(20);
  const [newFree, setNewFree] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  // User unlock management
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [unlocks, setUnlocks] = useState<UnlockRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => { if (user?.id) fetchPages(); }, [user?.id]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coloring_pages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error(err);
      addToast('خطأ في تحميل صفحات التلوين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!newFile || !newTitle.trim()) {
      addToast('يرجى إدخال العنوان واختيار ملف', 'error');
      return;
    }
    setUploading(true);
    try {
      const ext = newFile.name.split('.').pop() || 'png';
      const filePath = `coloring/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('coloring_files')
        .upload(filePath, newFile, { upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('coloring_files').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('coloring_pages').insert({
        title: newTitle.trim(),
        file_url: urlData.publicUrl,
        price: newPrice,
        is_free_tier: newFree,
        sort_order: pages.length,
      });
      if (dbError) throw dbError;

      addToast('تم رفع صفحة التلوين بنجاح', 'success');
      setNewTitle('');
      setNewPrice(20);
      setNewFree(false);
      setNewFile(null);
      fetchPages();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'خطأ في الرفع', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return;
    try {
      // Extract storage path from URL
      const urlParts = fileUrl.split('/coloring_files/');
      if (urlParts[1]) {
        await supabase.storage.from('coloring_files').remove([`coloring/${urlParts[1]}`]);
      }
      const { error } = await supabase.from('coloring_pages').delete().eq('id', id);
      if (error) throw error;
      addToast('تم الحذف بنجاح', 'success');
      fetchPages();
    } catch (err: any) {
      addToast(err.message || 'خطأ في الحذف', 'error');
    }
  };

  const handleUpdatePrice = async (id: string, price: number) => {
    const { error } = await supabase.from('coloring_pages').update({ price }).eq('id', id);
    if (error) {
      addToast('خطأ في تحديث السعر', 'error');
    } else {
      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, price } : p)));
    }
  };

  const handleToggleFree = async (id: string, is_free_tier: boolean) => {
    const { error } = await supabase.from('coloring_pages').update({ is_free_tier }).eq('id', id);
    if (error) {
      addToast('خطأ في التحديث', 'error');
    } else {
      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, is_free_tier } : p)));
    }
  };

  const openUnlockModal = async (pageId: string) => {
    setSelectedPageId(pageId);
    setShowUnlockModal(true);
    setUsersLoading(true);
    setUserSearch('');
    try {
      const [usersRes, unlocksRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').order('full_name'),
        supabase.from('user_unlocked_pages').select('*').eq('page_id', pageId),
      ]);
      setUsers(usersRes.data || []);
      setUnlocks(unlocksRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleGrantUnlock = async (userId: string) => {
    if (!selectedPageId) return;
    try {
      const { error } = await supabase.from('user_unlocked_pages').insert({
        user_id: userId,
        page_id: selectedPageId,
      });
      if (error) throw error;
      addToast('تم فتح الصفحة للمستخدم', 'success');
      setUnlocks((prev) => [...prev, { id: '', user_id: userId, page_id: selectedPageId!, unlocked_at: new Date().toISOString() }]);
    } catch (err: any) {
      addToast(err.message || 'خطأ', 'error');
    }
  };

  const handleRevokeUnlock = async (userId: string) => {
    if (!selectedPageId) return;
    try {
      const { error } = await supabase.from('user_unlocked_pages')
        .delete()
        .eq('page_id', selectedPageId)
        .eq('user_id', userId);
      if (error) throw error;
      addToast('تم إلغاء فتح الصفحة', 'success');
      setUnlocks((prev) => prev.filter((u) => !(u.user_id === userId && u.page_id === selectedPageId)));
    } catch (err: any) {
      addToast(err.message || 'خطأ', 'error');
    }
  };

  const isUnlocked = (userId: string) => unlocks.some((u) => u.user_id === userId);

  const filteredUsers = users.filter((u) =>
    !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedPage = pages.find((p) => p.id === selectedPageId);

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>إدارة صفحات التلوين</h2>
          <p className="text-muted mt-1">رفع وإدارة صفحات التلوين الرقمية</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0] mb-8">
        <h3 className="font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>رفع صفحة جديدة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">العنوان</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="مثال: زهرة ملونة"
              className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="rtl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">السعر (ج.م)</label>
            <input type="number" min={0} value={newPrice} onChange={(e) => setNewPrice(+e.target.value)}
              className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newFree} onChange={(e) => setNewFree(e.target.checked)}
              className="w-4 h-4 rounded border-line text-terracotta focus:ring-terracotta" />
            <span className="text-sm font-medium text-ink">مجاني (Free Tier)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-cream border-2 border-dashed border-line rounded-xl hover:border-terracotta transition-colors">
            <Upload className="w-4 h-4 text-muted" />
            <span className="text-sm text-muted">{newFile ? newFile.name : 'اختر ملف (PNG/JPG/PDF)'}</span>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <button onClick={handleUpload} disabled={uploading || !newTitle.trim() || !newFile}
          className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 transition-all disabled:opacity-50">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {uploading ? 'جاري الرفع...' : 'رفع الصفحة'}
        </button>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white border-2 border-line rounded-2xl animate-pulse" />)}
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-line rounded-2xl">
          <Image className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">لا توجد صفحات تلوين بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div key={page.id} className="bg-white border-2 border-line rounded-2xl p-4 flex items-center gap-4 shadow-[2px_2px_0px_0px_#E2E8F0]">
              <img src={page.file_url} alt={page.title} className="w-16 h-16 rounded-xl object-cover border border-line" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-ink truncate">{page.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  {page.is_free_tier && (
                    <span className="text-[10px] font-bold uppercase bg-sage text-white px-2 py-0.5 rounded-full">مجاني</span>
                  )}
                  <span className="text-xs text-muted">{new Date(page.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-cream rounded-lg px-2 py-1">
                  <DollarSign className="w-3.5 h-3.5 text-muted" />
                  <input type="number" min={0} value={page.price} onChange={(e) => handleUpdatePrice(page.id, +e.target.value)}
                    className="w-16 text-sm text-center bg-transparent border-none focus:outline-none" dir="ltr" />
                  <span className="text-xs text-muted">ج.م</span>
                </div>
                <label className="flex items-center gap-1 cursor-pointer bg-cream rounded-lg px-2 py-1">
                  <input type="checkbox" checked={page.is_free_tier} onChange={(e) => handleToggleFree(page.id, e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-line text-sage focus:ring-sage" />
                  <span className="text-xs text-muted">مجاني</span>
                </label>
                <button onClick={() => openUnlockModal(page.id)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="إدارة الأذونات">
                  <Users className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(page.id, page.file_url)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unlock Management Modal */}
      {showUnlockModal && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowUnlockModal(false)} />
          <div className="relative bg-white border-2 border-line rounded-2xl shadow-[8px_8px_0px_0px_#E2E8F0] w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b-2 border-line">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>إدارة أذونات التلوين</h3>
                  <p className="text-sm text-muted mt-1">صفحة: {selectedPage.title}</p>
                </div>
                <button onClick={() => setShowUnlockModal(false)} className="p-2 rounded-lg hover:bg-cream">✕</button>
              </div>
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="بحث عن مستخدم..."
                className="w-full mt-3 border-2 border-line rounded-xl px-4 py-2 text-sm focus:border-terracotta focus:outline-none" dir="rtl" />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {usersLoading ? (
                <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-terracotta mx-auto" /></div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-muted py-8">لا يوجد مستخدمين</p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((u) => {
                    const unlocked = isUnlocked(u.id);
                    return (
                      <div key={u.id} className="flex items-center gap-3 p-3 bg-cream/50 rounded-xl">
                        <div className="w-9 h-9 bg-terracotta/10 rounded-full flex items-center justify-center text-terracotta font-bold text-sm">
                          {(u.full_name || u.email || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{u.full_name || 'مستخدم'}</p>
                          <p className="text-xs text-muted truncate">{u.email}</p>
                        </div>
                        {unlocked ? (
                          <button onClick={() => handleRevokeUnlock(u.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                            <Lock className="w-3.5 h-3.5" /> إلغاء
                          </button>
                        ) : (
                          <button onClick={() => handleGrantUnlock(u.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-sage/10 text-sage rounded-lg text-xs font-bold hover:bg-sage/20 transition-colors">
                            <Unlock className="w-3.5 h-3.5" /> فتح
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
