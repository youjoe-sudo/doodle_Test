import { useState, useEffect } from 'react';
import { supabase, getSignedUrl } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const fmtOrderNumber = (id: string) => `ORD-${id.slice(0, 8).toUpperCase()}`;

function ReceiptLink({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getSignedUrl('receipts', path).then((u) => { if (!cancelled) setUrl(u); });
    return () => { cancelled = true; };
  }, [path]);
  if (!url) return <span className="text-muted text-sm">—</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-terracotta text-sm hover:underline font-medium">
      <ExternalLink className="w-3 h-3" /> عرض
    </a>
  );
}

export const AdminPayments = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.id) fetchData(); }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders')
      .select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const handleApprove = async (orderId: string) => {
    const { error } = await supabase.rpc('approve_order_payment', { p_order_id: orderId });
    if (error) addToast(error.message, 'error'); else { addToast('تمت الموافقة'); fetchData(); }
  };

  const handleReject = async (orderId: string) => {
    const { error } = await supabase.from('orders').update({ payment_status: 'REJECTED', status: 'PAYMENT_REJECTED' }).eq('id', orderId);
    if (error) addToast(error.message, 'error'); else { addToast('تم الرفض'); fetchData(); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'معلق' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'مدفوع' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' },
    };
    const m = map[s] || map.PENDING;
    return <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${m.bg} ${m.text}`}>{m.label}</span>;
  };

  const columns = [
    { key: 'id', label: 'رقم الطلب', render: (o: any) => <span className="font-mono text-xs text-ink font-bold">#{fmtOrderNumber(o.id)}</span> },
    { key: 'customer', label: 'العميل', render: (o: any) => <div><p className="font-medium text-ink">{o.full_name || 'غير معروف'}</p><p className="text-xs text-muted">{o.email}</p></div> },
    { key: 'total', label: 'المبلغ', render: (o: any) => <span className="font-bold text-ink">{o.total?.toLocaleString()} EGP</span> },
    { key: 'method', label: 'الطريقة', render: (o: any) => <span className="text-sm">{o.payment_method || '—'}</span> },
    { key: 'payment_status', label: 'الحالة', render: (o: any) => statusBadge(o.payment_status) },
    { key: 'receipt', label: 'الإيصال', render: (o: any) => o.receipt_url ? <ReceiptLink path={o.receipt_url} /> : <span className="text-muted text-sm">—</span> },
    { key: 'created_at', label: 'التاريخ', render: (o: any) => new Date(o.created_at).toLocaleDateString('ar-EG') },
    { key: 'actions', label: '', className: 'w-28', render: (o: any) => o.payment_status === 'PENDING' ? (
      <div className="flex gap-1">
        <button onClick={() => handleApprove(o.id)} className="p-2 rounded-lg hover:bg-green-50" title="موافقة"><CheckCircle className="w-4 h-4 text-green-600" /></button>
        <button onClick={() => handleReject(o.id)} className="p-2 rounded-lg hover:bg-red-50" title="رفض"><XCircle className="w-4 h-4 text-red-500" /></button>
      </div>
    ) : null },
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>المدفوعات</h2>
        <p className="text-muted mt-1">إدارة ومراجعة المدفوعات</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={orders} searchPlaceholder="بحث..." searchKeys={['full_name', 'email']} emptyMessage="لا توجد مدفوعات" />
      )}
    </div>
  );
};
