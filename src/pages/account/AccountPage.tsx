import { supabase, getSignedUrl } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { User, MapPin, Lock, Shield, Camera, Loader2, Plus, Trash2, Star, Save, X, CheckCircle, Palette } from 'lucide-react';
import { useDocumentTitle } from '@hooks/useDocumentTitle';

const TABS = [
  { id: 'profile', label: 'الملف الشخصي', icon: User },
  { id: 'addresses', label: 'العناوين', icon: MapPin },
  { id: 'password', label: 'كلمة المرور', icon: Lock },
  { id: 'sessions', label: 'الجلسات', icon: Shield },
  { id: 'artworks', label: 'رسوماتي', icon: Palette },
];

const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة', 'المنوفية',
  'القليوبية', 'الشرقية', 'كفر الشيخ', 'غربية', 'الفيوم', 'بني سويف',
  'المنيａ', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر',
  'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء', 'البورسعيدية',
  'الإسماعيلية', 'السويس',
];

export const AccountPage = () => {
  useDocumentTitle('حسابي');
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) loadAll();
  }, [user?.id]);

  const loadAll = async () => {
    setLoading(true);
    const [profRes, addrRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user!.id).single(),
      supabase.from('user_addresses').select('*').eq('user_id', user!.id).order('is_default', { ascending: false }),
    ]);
    setProfile(profRes.data);
    setAddresses(addrRes.data || []);
    setLoading(false);
  };

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Profile Tab ───
  const [profForm, setProfForm] = useState({ full_name: '', phone_number: '', gender: '' });

  useEffect(() => {
    if (profile) setProfForm({
      full_name: profile.full_name || '',
      phone_number: profile.phone_number || '',
      gender: profile.gender || '',
    });
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setSaving(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) { showToast('فشل رفع الصورة', 'err'); setSaving(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = urlData?.publicUrl || '';
    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
    setProfile((p: any) => ({ ...p, avatar_url: avatarUrl }));
    showToast('تم تحديث الصورة');
    setSaving(false);
  };

  const handleProfileSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profForm.full_name,
      phone_number: profForm.phone_number,
      gender: profForm.gender,
    }).eq('id', user!.id);
    if (error) showToast(error.message, 'err');
    else { setProfile((p: any) => ({ ...p, ...profForm })); showToast('تم حفظ البيانات'); }
    setSaving(false);
  };

  // ─── Addresses Tab ───
  const [addrForm, setAddrForm] = useState({ label: 'المنزل', governorate: '', city: '', address_line: '' });
  const [editingAddr, setEditingAddr] = useState<string | null>(null);

  const handleSaveAddress = async () => {
    if (!addrForm.governorate || !addrForm.city || !addrForm.address_line) return;
    setSaving(true);
    if (editingAddr) {
      const { error } = await supabase.from('user_addresses').update({ ...addrForm, updated_at: new Date().toISOString() }).eq('id', editingAddr);
      if (error) showToast(error.message, 'err');
      else { showToast('تم تحديث العنوان'); setEditingAddr(null); }
    } else {
      const { error } = await supabase.from('user_addresses').insert({ user_id: user!.id, ...addrForm });
      if (error) showToast(error.message, 'err');
      else showToast('تم إضافة العنوان');
    }
    setAddrForm({ label: 'المنزل', governorate: '', city: '', address_line: '' });
    const { data } = await supabase.from('user_addresses').select('*').eq('user_id', user!.id).order('is_default', { ascending: false });
    setAddresses(data || []);
    setSaving(false);
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from('user_addresses').delete().eq('id', id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('تم حذف العنوان');
  };

  const handleSetDefault = async (id: string) => {
    await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user!.id);
    await supabase.from('user_addresses').update({ is_default: true }).eq('id', id);
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    showToast('تم تعيين العنوان الافتراضي');
  };

  const startEditAddress = (addr: any) => {
    setEditingAddr(addr.id);
    setAddrForm({ label: addr.label, governorate: addr.governorate, city: addr.city, address_line: addr.address_line });
  };

  // ─── Password Tab ───
  const [pwForm, setPwForm] = useState({ new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (pwForm.new_password.length < 6) { showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'err'); return; }
    if (pwForm.new_password !== pwForm.confirm_password) { showToast('كلمتا المرور غير متطابقتين', 'err'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.new_password });
    if (error) showToast(error.message, 'err');
    else { showToast('تم تغيير كلمة المرور بنجاح'); setPwForm({ new_password: '', confirm_password: '' }); }
    setPwLoading(false);
  };

  // ─── Sessions Tab ───
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (tab === 'sessions') loadSessions();
  }, [tab]);

  // ─── Artworks Tab ───
  const [artworks, setArtworks] = useState<any[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(false);

  useEffect(() => {
    if (tab === 'artworks') loadArtworks();
  }, [tab]);

  const loadArtworks = async () => {
    setArtworksLoading(true);
    try {
      const { data } = await supabase
        .from('user_artworks')
        .select('*, page:coloring_pages(title, file_url)')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });
      setArtworks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setArtworksLoading(false);
    }
  };

  const deleteArtwork = async (artworkId: string, previewUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسمة؟')) return;
    try {
      if (previewUrl) {
        const path = previewUrl.split('/user_artworks/')[1];
        if (path) await supabase.storage.from('user_artworks').remove([path]);
      }
      await supabase.from('user_artworks').delete().eq('id', artworkId);
      setArtworks((prev) => prev.filter((a) => a.id !== artworkId));
      showToast('تم الحذف بنجاح');
    } catch (err) {
      console.error(err);
    }
  };

  const getArtworkImage = (art: any): string => {
    if (art.preview_url) return art.preview_url;
    if (art.page?.file_url) return art.page.file_url;
    return '/logo.jpg';
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    const { data } = await supabase.auth.getSession();
    const s = data.session;
    setSessions(s ? [{
      id: s.access_token.slice(-8),
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser',
      os: navigator.platform || 'Unknown',
      lastSignIn: s.user.last_sign_in_at || s.user.created_at,
      current: true,
    }] : []);
    setSessionsLoading(false);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-terracotta mx-auto" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl border-2 font-bold text-sm shadow-lg flex items-center gap-2 ${
          toast.type === 'ok' ? 'bg-sage/10 border-sage text-sage' : 'bg-red-50 border-red-300 text-red-600'
        }`}>
          {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-ink mb-2">الحساب</h2>
        <p className="text-muted">إدارة ملفك الشخصي وإعداداتك</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm font-bold whitespace-nowrap transition-all ${
                tab === t.id ? 'border-terracotta bg-terracotta text-white shadow-[3px_3px_0px_0px_#1E293B]' : 'border-line text-ink hover:border-terracotta/50'
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Profile ── */}
      {tab === 'profile' && (
        <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-line" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-terracotta/10 flex items-center justify-center border-2 border-line">
                  <User className="w-8 h-8 text-terracotta" />
                </div>
              )}
              <button onClick={() => avatarRef.current?.click()} disabled={saving}
                className="absolute -bottom-1 -left-1 w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center border-2 border-paper shadow-sm hover:bg-terracotta-dark transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-lg">{profile?.full_name || 'مستخدم'}</h3>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الاسم الكامل</label>
              <input type="text" value={profForm.full_name} onChange={(e) => setProfForm({ ...profForm, full_name: e.target.value })}
                className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">رقم الهاتف</label>
                <input type="tel" value={profForm.phone_number} onChange={(e) => setProfForm({ ...profForm, phone_number: e.target.value })}
                  className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الجنس</label>
                <select value={profForm.gender} onChange={(e) => setProfForm({ ...profForm, gender: e.target.value })}
                  className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none bg-white">
                  <option value="">غير محدد</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">البريد الإلكتروني</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm bg-cream text-muted cursor-not-allowed" />
            </div>
            <button onClick={handleProfileSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] transition-all text-sm disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ البيانات
            </button>
          </div>
        </div>
      )}

      {/* ── Addresses ── */}
      {tab === 'addresses' && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white border-2 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#E2E8F0] ${addr.is_default ? 'border-terracotta' : 'border-line'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-ink">{addr.label}</span>
                    {addr.is_default && <span className="px-2 py-0.5 bg-terracotta/10 text-terracotta text-xs font-bold rounded-full">افتراضي</span>}
                  </div>
                  <p className="text-sm text-muted">{addr.governorate}، {addr.city}</p>
                  <p className="text-sm text-muted">{addr.address_line}</p>
                </div>
                <div className="flex gap-1">
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.id)} className="p-2 rounded-lg hover:bg-cream" title="تعيين كافتراضي">
                      <Star className="w-4 h-4 text-muted" />
                    </button>
                  )}
                  <button onClick={() => startEditAddress(addr)} className="p-2 rounded-lg hover:bg-cream text-xs text-terracotta font-bold">تعديل</button>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 rounded-lg hover:bg-red-50" title="حذف">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white border-2 border-dashed border-line rounded-2xl p-5">
            <h4 className="font-bold text-ink text-sm mb-3">{editingAddr ? 'تعديل العنوان' : 'إضافة عنوان جديد'}</h4>
            <div className="space-y-3">
              <input type="text" placeholder="تسمية العنوان (منزل، عمل...)" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" />
              <div className="grid grid-cols-3 gap-3">
                <select value={addrForm.governorate} onChange={(e) => setAddrForm({ ...addrForm, governorate: e.target.value })}
                  className="border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none bg-white">
                  <option value="">المحافظة</option>
                  {EGYPT_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <input type="text" placeholder="المدينة" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  className="border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" />
                <input type="text" placeholder="العنوان التفصيلي" value={addrForm.address_line} onChange={(e) => setAddrForm({ ...addrForm, address_line: e.target.value })}
                  className="border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveAddress} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {editingAddr ? 'تحديث' : 'إضافة'}
                </button>
                {editingAddr && (
                  <button onClick={() => { setEditingAddr(null); setAddrForm({ label: 'المنزل', governorate: '', city: '', address_line: '' }); }}
                    className="px-5 py-2.5 border-2 border-line rounded-full text-sm font-bold text-ink hover:bg-cream">إلغاء</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Password ── */}
      {tab === 'password' && (
        <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0] max-w-md">
          <h3 className="font-bold text-ink mb-4">تغيير كلمة المرور</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">كلمة المرور الجديدة</label>
              <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" minLength={6} />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">تأكيد كلمة المرور</label>
              <input type="password" value={pwForm.confirm_password} onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" minLength={6} />
            </div>
            <button onClick={handlePasswordChange} disabled={pwLoading}
              className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] text-sm disabled:opacity-50">
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} تغيير كلمة المرور
            </button>
          </div>
        </div>
      )}

      {/* ── Sessions ── */}
      {tab === 'sessions' && (
        <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
          <h3 className="font-bold text-ink mb-4">الجلسات النشطة</h3>
          {sessionsLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
          ) : sessions.length === 0 ? (
            <p className="text-muted text-sm">لا توجد جلسات نشطة</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-cream/50 rounded-xl border border-line">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-terracotta" />
                    </div>
                    <div>
                      <p className="font-medium text-ink text-sm">{s.browser} on {s.os}</p>
                      <p className="text-xs text-muted">آخر دخول: {new Date(s.lastSignIn).toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                  {s.current && <span className="px-3 py-1 bg-sage/10 text-sage text-xs font-bold rounded-full">الجلسة الحالية</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── My Artworks ── */}
      {tab === 'artworks' && (
        <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
          <h3 className="font-bold text-ink mb-4">رسوماتي المحفوظة</h3>
          {artworksLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="aspect-square bg-cream rounded-2xl animate-pulse" />)}
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="w-12 h-12 text-muted/30 mx-auto mb-3" />
              <p className="text-muted">لم تحفظ أي رسومات بعد.</p>
              <a href="/coloring-online" className="text-terracotta text-sm font-bold mt-2 inline-block hover:underline">ابدأ التلوين الآن</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {artworks.map((art) => (
                <div key={art.id} className="bg-cream border-2 border-line rounded-2xl overflow-hidden group">
                  <div className="aspect-square relative">
                    <img src={getArtworkImage(art)} alt={art.page?.title || 'رسمة'}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
                    <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={`/coloring/${art.page_id}`}
                        className="px-3 py-2 bg-terracotta text-white text-xs font-bold rounded-xl shadow hover:shadow-lg transition-all">
                        متابعة التلوين
                      </a>
                      <a href={getArtworkImage(art)} download
                        className="px-3 py-2 bg-white text-ink text-xs font-bold rounded-xl shadow hover:shadow-lg transition-all">
                        تحميل
                      </a>
                      <button onClick={() => deleteArtwork(art.id, art.preview_url)}
                        className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-xl shadow hover:shadow-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-ink truncate">{art.page?.title || 'رسمة'}</p>
                    <p className="text-xs text-muted">{new Date(art.updated_at).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
