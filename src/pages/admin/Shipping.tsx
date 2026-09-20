import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { Truck } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'PROCESSING', label: 'قيد المعالجة' },
  { value: 'SHIPPED', label: 'تم الشحن' },
  { value: 'DELIVERED', label: 'تم التوصيل' },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT_VERIFICATION: 'بانتظار الدفع', PROCESSING: 'قيد المعالجة',
  SHIPPED: 'تم الشحن', DELIVERED: 'تم التوصيل', CANCELLED: 'ملغي',
  PAYMENT_REJECTED: 'مرفوض',
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    PROCESSING: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
  };
  return map[s] || 'bg-gray-100 text-gray-700';
};

export const AdminShipping = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.id) fetchOrders(); }, [user?.id]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders')
      .select('*, user:profiles(full_name, email)')
      .not('status', 'in', '("CANCELLED","PAYMENT_REJECTED")')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) addToast(error.message, 'error'); else { addToast('تم تحديث حالة الشحن'); fetchOrders(); }
  };

  const columns = [
    { key: 'id', label: 'رقم الطلب', render: (o: any) => <span className="font-mono text-xs text-muted">{o.id.slice(0, 8)}...</span> },
    { key: 'customer', label: 'العميل', render: (o: any) => <div><p className="font-medium text-ink">{o.full_name || 'غير معروف'}</p><p className="text-xs text-muted">{o.email}</p></div> },
    { key: 'address', label: 'العنوان', render: (o: any) => <span className="text-sm">{o.address_line1 ? `${o.address_line1}, ${o.city}` : '—'}</span> },
    { key: 'shipping_method', label: 'طريقة الشحن', render: (o: any) => <span className="text-sm">{o.shipping_method || '—'}</span> },
    { key: 'status', label: 'الحالة', render: (o: any) => <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${statusColor(o.status)}`}>{STATUS_LABELS[o.status] || o.status}</span> },
    { key: 'created_at', label: 'التاريخ', render: (o: any) => new Date(o.created_at).toLocaleDateString('ar-EG') },
    { key: 'actions', label: '', className: 'w-48', render: (o: any) => (
      <div className="flex gap-1">
        {STATUS_OPTIONS.filter((opt) => opt.value !== o.status).map((opt) => (
          <button key={opt.value} onClick={() => handleStatusChange(o.id, opt.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 border-line text-ink hover:border-terracotta hover:text-terracotta transition-all">
            {opt.label}
          </button>
        ))}
      </div>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>الشحن</h2>
        <p className="text-muted mt-1">تتبع وإدارة شحنات الطلبات</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={orders} searchPlaceholder="بحث..." searchKeys={['full_name', 'email']} emptyMessage="لا توجد طلبات شحن" />
      )}
    </div>
  );
};
