import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { DataTable } from '@components/admin/DataTable';
import { Modal } from '@components/admin/Modal';
import { ConfirmDialog } from '@components/admin/ConfirmDialog';
import { useToasts, ToastManager } from '@components/admin/Toast';
import { Shield, Ban, Trash2, UserCheck, Clock, MoreVertical, UserX, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  is_banned: boolean;
  ban_reason: string | null;
  banned_until: string | null;
  created_at: string;
  phone_number: string | null;
};

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Form states
  const [newRole, setNewRole] = useState('customer');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('1');
  const [banUnit, setBanUnit] = useState<'hours' | 'days'>('days');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      addToast('خطأ في تحميل المستخدمين', 'error');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  // Auto-expire bans on fetch
  useEffect(() => {
    if (users.length === 0) return;
    const now = new Date();
    const expiredIds = users
      .filter(u => u.is_banned && u.banned_until && new Date(u.banned_until) <= now)
      .map(u => u.id);

    if (expiredIds.length > 0) {
      expiredIds.forEach(async (id) => {
        await supabase.from('profiles').update({
          is_banned: false,
          ban_reason: null,
          banned_until: null,
        }).eq('id', id);
      });
      setUsers(prev => prev.map(u =>
        expiredIds.includes(u.id)
          ? { ...u, is_banned: false, ban_reason: null, banned_until: null }
          : u
      ));
    }
  }, [users]);

  // ── Role Change ──
  const openRoleModal = (u: UserProfile) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setRoleModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || newRole === selectedUser.role) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', selectedUser.id);

    if (error) {
      addToast('خطأ في تغيير الدور', 'error');
    } else {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
      addToast(`تم تغيير دور ${selectedUser.full_name || selectedUser.email} بنجاح`);
      setRoleModalOpen(false);
    }
    setActionLoading(false);
  };

  // ── Ban User ──
  const openBanModal = (u: UserProfile) => {
    setSelectedUser(u);
    setBanReason(u.ban_reason || '');
    setBanDuration('1');
    setBanUnit('days');
    setBanModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const durationMs = banUnit === 'hours'
      ? parseInt(banDuration) * 60 * 60 * 1000
      : parseInt(banDuration) * 24 * 60 * 60 * 1000;

    const isPermanent = banDuration === 'permanent';
    const bannedUntil = isPermanent ? null : new Date(Date.now() + durationMs).toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        ban_reason: banReason || null,
        banned_until: bannedUntil,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedUser.id);

    if (error) {
      addToast('خطأ في حظر المستخدم', 'error');
    } else {
      setUsers(prev => prev.map(u => u.id === selectedUser.id
        ? { ...u, is_banned: true, ban_reason: banReason, banned_until: bannedUntil }
        : u
      ));
      addToast(`تم حظر ${selectedUser.full_name || selectedUser.email} بنجاح`);
      setBanModalOpen(false);
    }
    setActionLoading(false);
  };

  // ── Unban ──
  const handleUnban = async (u: UserProfile) => {
    setActionMenuOpen(null);
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false, ban_reason: null, banned_until: null, updated_at: new Date().toISOString() })
      .eq('id', u.id);

    if (error) {
      addToast('خطأ في إلغاء الحظر', 'error');
    } else {
      setUsers(prev => prev.map(usr => usr.id === u.id
        ? { ...usr, is_banned: false, ban_reason: null, banned_until: null }
        : usr
      ));
      addToast(`تم إلغاء حظر ${u.full_name || u.email}`);
    }
  };

  // ── Delete Account ──
  const openDeleteModal = (u: UserProfile) => {
    setSelectedUser(u);
    setDeleteModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    // Delete auth user via Edge Function or direct delete
    const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.id);
    // If admin SDK not available, delete profile only
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', selectedUser.id);

    if (authError && profileError) {
      addToast('خطأ في حذف المستخدم', 'error');
    } else {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      addToast(`تم حذف حساب ${selectedUser.full_name || selectedUser.email} بنجاح`);
      setDeleteModalOpen(false);
    }
    setActionLoading(false);
  };

  const formatBanExpiry = (bannedUntil: string | null) => {
    if (!bannedUntil) return 'دائم';
    const diff = new Date(bannedUntil).getTime() - Date.now();
    if (diff <= 0) return 'منتهي';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    const parts: string[] = [];
    if (days > 0) parts.push(`${days} يوم`);
    if (remainHours > 0) parts.push(`${remainHours} ساعة`);
    return parts.length > 0 ? `متبقي: ${parts.join(' و ')}` : 'متبقي أقل من ساعة';
  };

  const columns = [
    {
      key: 'avatar', label: '', className: 'w-14',
      render: (u: UserProfile) => u.avatar_url
        ? <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-line" />
        : <div className="w-10 h-10 rounded-xl bg-cream border-2 border-line flex items-center justify-center"><span className="text-sm font-bold text-terracotta">{(u.full_name || u.email || '?')[0]}</span></div>
    },
    {
      key: 'full_name', label: 'الاسم',
      render: (u: UserProfile) => (
        <div>
          <span className="font-medium text-ink">{u.full_name || 'غير معروف'}</span>
          <span className="block text-xs text-muted" dir="ltr">{u.email}</span>
        </div>
      )
    },
    {
      key: 'role', label: 'الدور',
      render: (u: UserProfile) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
          u.role === 'superadmin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
          u.role === 'moderator' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
          'bg-cream text-ink border border-line'
        }`}>
          {u.role === 'superadmin' ? <Shield className="w-3 h-3" /> : null}
          {u.role === 'superadmin' ? 'مدير' : u.role === 'moderator' ? 'مشرف' : 'عميل'}
        </span>
      )
    },
    {
      key: 'status', label: 'الحالة',
      render: (u: UserProfile) => {
        if (u.is_banned) {
          return (
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                <Ban className="w-3 h-3" /> محظور
              </span>
              {u.banned_until && (
                <span className="block text-[10px] text-red-400 mt-0.5">{formatBanExpiry(u.banned_until)}</span>
              )}
            </div>
          );
        }
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sage/10 text-sage border border-sage/20"><UserCheck className="w-3 h-3" /> نشط</span>;
      }
    },
    {
      key: 'created_at', label: 'تاريخ التسجيل',
      render: (u: UserProfile) => <span className="text-sm">{new Date(u.created_at).toLocaleDateString('ar-EG')}</span>
    },
    {
      key: 'actions', label: '', className: 'w-12',
      render: (u: UserProfile) => (
        <div className="relative">
          <button
            onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
            className="p-2 rounded-lg hover:bg-cream transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-muted" />
          </button>
          {actionMenuOpen === u.id && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
              <div className="absolute left-0 top-full mt-1 z-50 w-48 bg-white border-2 border-line rounded-xl shadow-[4px_4px_0px_0px_#E2E8F0] py-1">
                {u.id !== currentUser?.id && (
                  <>
                    <button onClick={() => openRoleModal(u)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cream transition-colors">
                      <ArrowUpCircle className="w-4 h-4 text-muted" />
                      تغيير الدور
                    </button>
                    {!u.is_banned ? (
                      <button onClick={() => openBanModal(u)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cream transition-colors text-red-600">
                        <Ban className="w-4 h-4" />
                        حظر المستخدم
                      </button>
                    ) : (
                      <button onClick={() => handleUnban(u)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cream transition-colors text-sage">
                        <UserCheck className="w-4 h-4" />
                        إلغاء الحظر
                      </button>
                    )}
                    <button onClick={() => openDeleteModal(u)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors text-red-600">
                      <Trash2 className="w-4 h-4" />
                      حذف الحساب
                    </button>
                  </>
                )}
                {u.id === currentUser?.id && (
                  <span className="block px-4 py-2.5 text-xs text-muted">هذا حسابك</span>
                )}
              </div>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>إدارة المستخدمين</h2>
        <p className="text-muted mt-1">عرض وإدارة جميع حسابات المستخدمين ({users.length})</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="بحث بالاسم أو البريد..."
          searchKeys={['full_name', 'email', 'phone_number']}
          emptyMessage="لا يوجد مستخدمين"
        />
      )}

      {/* ── Role Modal ── */}
      <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="تغيير الدور">
        <div>
          <p className="text-sm text-muted mb-4">
            تغيير دور <strong>{selectedUser?.full_name || selectedUser?.email}</strong>
          </p>
          <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">الدور الجديد</label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full px-4 py-3 border-2 border-line rounded-xl text-sm bg-white focus:border-terracotta focus:outline-none"
          >
            <option value="customer">عميل</option>
            <option value="moderator">مشرف</option>
            <option value="admin">مدير</option>
          </select>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setRoleModalOpen(false)} className="px-5 py-2.5 rounded-full border-2 border-line text-ink font-medium hover:bg-cream transition-colors">إلغاء</button>
            <button
              onClick={handleRoleChange}
              disabled={actionLoading || newRole === selectedUser?.role}
              className="px-5 py-2.5 rounded-full bg-terracotta text-white font-bold border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all disabled:opacity-50"
            >
              {actionLoading ? 'جاري...' : 'حفظ'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Ban Modal ── */}
      <Modal open={banModalOpen} onClose={() => setBanModalOpen(false)} title="حظر المستخدم">
        <div>
          <p className="text-sm text-muted mb-4">
            حظر <strong>{selectedUser?.full_name || selectedUser?.email}</strong>
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">المدة</label>
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full px-4 py-3 border-2 border-line rounded-xl text-sm bg-white focus:border-terracotta focus:outline-none"
              >
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="7">7</option>
                <option value="14">14</option>
                <option value="30">30</option>
                <option value="permanent">دائم</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">الوحدة</label>
              <select
                value={banUnit}
                onChange={(e) => setBanUnit(e.target.value as 'hours' | 'days')}
                disabled={banDuration === 'permanent'}
                className="w-full px-4 py-3 border-2 border-line rounded-xl text-sm bg-white focus:border-terracotta focus:outline-none disabled:opacity-50"
              >
                <option value="hours">ساعات</option>
                <option value="days">أيام</option>
              </select>
            </div>
          </div>

          <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">سبب الحظر</label>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="سبب الحظر (اختياري)"
            rows={3}
            className="w-full px-4 py-3 border-2 border-line rounded-xl text-sm bg-white focus:border-terracotta focus:outline-none resize-none"
          />

          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setBanModalOpen(false)} className="px-5 py-2.5 rounded-full border-2 border-line text-ink font-medium hover:bg-cream transition-colors">إلغاء</button>
            <button
              onClick={handleBan}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-full bg-red-500 text-white font-bold border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all disabled:opacity-50"
            >
              {actionLoading ? 'جاري الحظر...' : 'تأكيد الحظر'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="حذف الحساب"
        message={`هل أنت متأكد من حذف حساب ${selectedUser?.full_name || selectedUser?.email} نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`}
        loading={actionLoading}
      />
    </div>
  );
};
