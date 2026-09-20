import { useState, useEffect } from 'react';
import { supabase, getSignedUrl } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { Modal } from '@components/admin/Modal';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { DataTable } from '@components/admin/DataTable';
import { Eye, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';

const fmtOrderNumber = (id: string) => `ORD-${id.slice(0, 8).toUpperCase()}`;

function ReceiptViewer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSignedUrl('receipts', path).then((signed) => {
      if (!cancelled) { setUrl(signed); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [path]);

  if (loading) return (
    <div>
      <h4 className="text-xs font-bold text-ink uppercase tracking-wide mb-2">إيصال الدفع</h4>
      <div className="flex items-center gap-2 text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...</div>
    </div>
  );

  if (!url) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
  const isPdf = /\.pdf$/i.test(path);

  return (
    <div>
      <h4 className="text-xs font-bold text-ink uppercase tracking-wide mb-2">إيصال الدفع</h4>
      {isImage ? (
        <img src={url} alt="إيصال الدفع" className="max-w-xs max-h-48 rounded-xl border-2 border-line object-contain" />
      ) : isPdf ? (
        <iframe src={url} className="w-full max-w-md h-64 rounded-xl border-2 border-line" title="إيصال الدفع" />
      ) : null}
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-cream border-2 border-line rounded-xl text-sm font-medium text-ink hover:bg-cream/80 transition-colors">
        <ExternalLink className="w-4 h-4" /> فتح في نافذة جديدة
      </a>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT_VERIFICATION', label: 'بانتظار الدفع' },
  { value: 'PROCESSING', label: 'قيد المعالجة' },
  { value: 'SHIPPED', label: 'تم الشحن' },
  { value: 'DELIVERED', label: 'تم التوصيل' },
  { value: 'CANCELLED', label: 'ملغي' },
];

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلق', APPROVED: 'مدفوع', REJECTED: 'مرفوض',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT_VERIFICATION: 'بانتظار الدفع', PROCESSING: 'قيد المعالجة',
  SHIPPED: 'تم الشحن', DELIVERED: 'تم التوصيل', CANCELLED: 'ملغي',
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700',
    PENDING_PAYMENT_VERIFICATION: 'bg-amber-100 text-amber-700', PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
  };
  return map[s] || 'bg-gray-100 text-gray-700';
};

export const AdminOrders = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { if (user?.id) fetchOrders(); }, [user?.id]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders')
      .select('*, user:profiles(full_name, email), order_items(*, product:products(name_en, name_ar))')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const handleApprove = async (orderId: string) => {
    const { error } = await supabase.rpc('approve_order_payment', { p_order_id: orderId });
    if (error) { addToast(error.message, 'error'); } else { addToast('تمت الموافقة على الدفع'); fetchOrders(); }
  };

  const handleReject = async (orderId: string) => {
    const { error } = await supabase.from('orders').update({ payment_status: 'REJECTED', status: 'PAYMENT_REJECTED' }).eq('id', orderId);
    if (error) { addToast(error.message, 'error'); } else { addToast('تم رفض الدفع'); fetchOrders(); }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { addToast(error.message, 'error'); } else { addToast('تم تحديث الحالة'); fetchOrders(); }
    setUpdating(false);
  };

  const columns = [
    { key: 'id', label: 'رقم الطلب', render: (o: any) => <span className="font-mono text-xs text-ink font-bold">#{fmtOrderNumber(o.id)}</span> },
    { key: 'full_name', label: 'العميل', render: (o: any) => <div><p className="font-medium text-ink">{o.full_name || 'غير معروف'}</p><p className="text-xs text-muted">{o.email}</p></div> },
    { key: 'total', label: 'المبلغ', render: (o: any) => <span className="font-bold text-ink">{o.total?.toLocaleString()} EGP</span> },
    { key: 'payment_status', label: 'الدفع', render: (o: any) => <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${statusColor(o.payment_status)}`}>{PAYMENT_STATUS_LABELS[o.payment_status] || o.payment_status}</span> },
    { key: 'status', label: 'حالة الطلب', render: (o: any) => <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${statusColor(o.status)}`}>{ORDER_STATUS_LABELS[o.status] || o.status}</span> },
    { key: 'created_at', label: 'التاريخ', render: (o: any) => new Date(o.created_at).toLocaleDateString('ar-EG') },
    { key: 'actions', label: '', className: 'w-40', render: (o: any) => (
      <div className="flex gap-1">
        {o.payment_status === 'PENDING' && (
          <>
            <button onClick={() => handleApprove(o.id)} className="p-2 rounded-lg hover:bg-green-50" title="موافقة"><CheckCircle className="w-4 h-4 text-green-600" /></button>
            <button onClick={() => handleReject(o.id)} className="p-2 rounded-lg hover:bg-red-50" title="رفض"><XCircle className="w-4 h-4 text-red-500" /></button>
          </>
        )}
        <button onClick={() => { setSelected(o); setDetailOpen(true); }} className="p-2 rounded-lg hover:bg-cream" title="التفاصيل"><Eye className="w-4 h-4 text-ink" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>الطلبات</h2>
        <p className="text-muted mt-1">إدارة جميع الطلبات والمدفوعات</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>
      ) : (
        <DataTable columns={columns} data={orders} searchPlaceholder="بحث في الطلبات..." searchKeys={['full_name', 'email', 'id']} emptyMessage="لا توجد طلبات" />
      )}

      {/* Order Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="تفاصيل الطلب" wide>
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-ink uppercase tracking-wide mb-2">الطلب</h4>
                <p className="font-bold text-ink text-lg">#{fmtOrderNumber(selected.id)}</p>
                <p className="text-xs text-muted mt-1">{selected.id}</p>
                <h4 className="text-xs font-bold text-ink uppercase tracking-wide mb-2 mt-4">العميل</h4>
                <p className="text-ink">{selected.full_name || 'غير معروف'}</p>
                <p className="text-sm text-muted">{selected.email}</p>
                <p className="text-sm text-muted">{selected.phone}</p>
                <p className="text-sm text-muted">{selected.city}, {selected.address_line1}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink uppercase tracking-wide mb-2">الدفع</h4>
                <p className="text-sm text-muted">طريقة الدفع: {selected.payment_method}</p>
                <p className="text-sm text-muted">طريقة الشحن: {selected.shipping_method}</p>
                <p className="text-sm text-muted">المجموع الفرعي: {selected.subtotal?.toLocaleString()} EGP</p>
                <p className="text-sm text-muted">الشحن: {selected.shipping_cost?.toLocaleString()} EGP</p>
                <p className="text-sm text-muted">الخصم: {selected.discount?.toLocaleString()} EGP</p>
                <p className="font-bold text-ink mt-1">الإجمالي: {selected.total?.toLocaleString()} EGP</p>
              </div>
            </div>

            {/* Receipt */}
            {selected.receipt_url && (
              <ReceiptViewer path={selected.receipt_url} />
            )}

            {/* Order Items */}
            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-wide mb-2">المنتجات</h4>
              <div className="space-y-2">
                {selected.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-xl">
                    <div>
                      <p className="font-medium text-ink text-sm">{item.product?.name_en || item.product_name}</p>
                      <p className="text-xs text-muted">{item.quantity} × {item.unit_price?.toLocaleString()} EGP</p>
                    </div>
                    <span className="font-bold text-ink text-sm">{item.subtotal?.toLocaleString()} EGP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update */}
            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-wide mb-2">تحديث حالة الطلب</h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button key={opt.value} disabled={updating || selected.status === opt.value}
                    onClick={() => handleStatusChange(selected.id, opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all disabled:opacity-40 ${
                      selected.status === opt.value ? 'border-terracotta bg-terracotta text-white' : 'border-line text-ink hover:border-terracotta hover:text-terracotta'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
