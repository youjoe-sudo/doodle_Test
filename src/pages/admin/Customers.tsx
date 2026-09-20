import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { DataTable } from '@components/admin/DataTable';
import { User } from 'lucide-react';

export const AdminCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.id) fetchCustomers(); }, [user?.id]);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  const columns = [
    { key: 'avatar', label: '', className: 'w-14', render: (c: any) => c.avatar_url ? <img src={c.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-line" /> : <div className="w-10 h-10 rounded-xl bg-cream border-2 border-line flex items-center justify-center"><User className="w-5 h-5 text-muted" /></div> },
    { key: 'full_name', label: 'الاسم', render: (c: any) => <span className="font-medium text-ink">{c.full_name || 'غير معروف'}</span> },
    { key: 'email', label: 'البريد الإلكتروني', render: (c: any) => <span className="text-sm text-muted" dir="ltr">{c.email}</span> },
    { key: 'phone_number', label: 'الهاتف', render: (c: any) => <span className="text-sm">{c.phone_number || '—'}</span> },
    { key: 'gender', label: 'الجنس', render: (c: any) => <span className="text-sm">{c.gender === 'male' ? 'ذكر' : c.gender === 'female' ? 'أنثى' : '—'}</span> },
    { key: 'city', label: 'المدينة', render: (c: any) => <span className="text-sm">{c.city || '—'}</span> },
    { key: 'created_at', label: 'تاريخ التسجيل', render: (c: any) => new Date(c.created_at).toLocaleDateString('ar-EG') },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>العملاء</h2>
        <p className="text-muted mt-1">جميع العملاء المسجلين ({customers.length})</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={customers} searchPlaceholder="بحث في العملاء..." searchKeys={['full_name', 'email', 'phone_number', 'city']} emptyMessage="لا يوجد عملاء" />
      )}
    </div>
  );
};
