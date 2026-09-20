import { useParams, Link } from 'react-router-dom';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowRight, Loader2 } from 'lucide-react';

const fmtOrderNumber = (id: string) => `ORD-${id.slice(0, 8).toUpperCase()}`;

const STEPS = [
  { key: 'PENDING_PAYMENT_VERIFICATION', label: 'تم الطلب', labelEn: 'Order Placed', icon: Clock },
  { key: 'PROCESSING', label: 'قيد المعالجة', labelEn: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'تم الشحن', labelEn: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'تم التوصيل', labelEn: 'Delivered', icon: CheckCircle },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT_VERIFICATION: { label: 'بانتظار الدفع', color: 'text-amber-700', bg: 'bg-amber-100' },
  PAYMENT_REJECTED: { label: 'الدفع مرفوض', color: 'text-red-700', bg: 'bg-red-100' },
  PROCESSING: { label: 'قيد المعالجة', color: 'text-blue-700', bg: 'bg-blue-100' },
  SHIPPED: { label: 'تم الشحن', color: 'text-purple-700', bg: 'bg-purple-100' },
  DELIVERED: { label: 'تم التوصيل', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELLED: { label: 'ملغي', color: 'text-red-700', bg: 'bg-red-100' },
};

const PAYMENT_STATUS: Record<string, string> = {
  PENDING: 'معلق', APPROVED: 'مدفوع', REJECTED: 'مرفوض',
};

export const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id && user?.id) fetchOrder();
  }, [id, user?.id]);

  const fetchOrder = async () => {
    setLoading(true);
    const { data: ord, error: ordErr } = await supabase
      .from('orders').select('*').eq('id', id).eq('user_id', user!.id).single();
    if (ordErr || !ord) { setError('الطلب غير موجود أو ليس لديك صلاحية لعرضه'); setLoading(false); return; }
    setOrder(ord);
    const { data: ordItems } = await supabase.from('order_items').select('*, product:products(name_en, name_ar, cover_image)').eq('order_id', id);
    setItems(ordItems || []);
    setLoading(false);
  };

  const getStepIndex = (status: string) => {
    if (status === 'CANCELLED' || status === 'PAYMENT_REJECTED') return -1;
    const idx = STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-terracotta mx-auto" />
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-bold">{error}</p>
        <Link to="/account/orders" className="inline-block mt-4 text-terracotta font-bold text-sm hover:underline">العودة للطلبات</Link>
      </div>
    </div>
  );

  const currentStep = getStepIndex(order.status);
  const isFailed = order.status === 'CANCELLED' || order.status === 'PAYMENT_REJECTED';
  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_PAYMENT_VERIFICATION;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-terracotta font-bold text-sm mb-6 hover:underline">
        <ArrowRight className="w-4 h-4" /> العودة للطلبات
      </Link>

      {/* Header */}
      <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0] mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">#{fmtOrderNumber(order.id)}</h1>
            <p className="text-sm text-muted mt-1">{new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${st.bg} ${st.color}`}>{st.label}</span>
        </div>

        {/* Progress Timeline */}
        {!isFailed ? (
          <div className="mt-6">
            <div className="flex items-center justify-between relative">
              {/* Background line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-line" />
              {/* Active line */}
              <div className="absolute top-5 left-0 h-0.5 bg-terracotta transition-all duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />

              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const completed = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.key} className="relative flex flex-col items-center z-10" style={{ flex: 1 }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      completed ? 'bg-terracotta border-terracotta text-white' : 'bg-paper border-line text-muted'
                    } ${active ? 'shadow-[3px_3px_0px_0px_#1E293B] scale-110' : ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold mt-2 text-center ${completed ? 'text-ink' : 'text-muted'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 font-bold text-sm">{st.label}</p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0] mb-6">
        <h3 className="font-bold text-ink mb-4">المنتجات</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-cream/50 rounded-xl">
              {item.product?.cover_image && (
                <img src={item.product.cover_image} alt={item.product_name} className="w-14 h-14 rounded-lg object-cover border border-line" />
              )}
              <div className="flex-1">
                <p className="font-medium text-ink text-sm">{item.product?.name_ar || item.product_name}</p>
                <p className="text-xs text-muted">{item.quantity} × {item.unit_price?.toLocaleString()} EGP</p>
              </div>
              <span className="font-bold text-ink text-sm">{item.subtotal?.toLocaleString()} EGP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
          <h3 className="font-bold text-ink mb-3">ملخص الدفع</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">المجموع الفرعي</span><span className="text-ink">{order.subtotal?.toLocaleString()} EGP</span></div>
            <div className="flex justify-between"><span className="text-muted">الشحن</span><span className="text-ink">{order.shipping_cost?.toLocaleString()} EGP</span></div>
            {order.discount > 0 && <div className="flex justify-between text-sage"><span>الخصم</span><span>-{order.discount?.toLocaleString()} EGP</span></div>}
            <div className="flex justify-between pt-2 border-t-2 border-line font-bold"><span>الإجمالي</span><span className="text-terracotta">{order.total?.toLocaleString()} EGP</span></div>
            <div className="flex justify-between pt-2"><span className="text-muted">طريقة الدفع</span><span className="text-ink font-medium">{order.payment_method}</span></div>
            <div className="flex justify-between"><span className="text-muted">حالة الدفع</span><span className="text-ink font-medium">{PAYMENT_STATUS[order.payment_status]}</span></div>
          </div>
          {order.tracking_number && (
            <div className="mt-4 p-3 bg-cream rounded-xl">
              <p className="text-xs text-muted">رقم التتبع</p>
              <p className="font-bold text-ink text-sm">{order.tracking_number}</p>
              {order.carrier && <p className="text-xs text-muted mt-1">شركة الشحن: {order.carrier}</p>}
            </div>
          )}
        </div>

        <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
          <h3 className="font-bold text-ink mb-3">عنوان التوصيل</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-ink">{order.full_name}</p>
            <p className="text-muted">{order.phone}</p>
            <p className="text-muted">{order.email}</p>
            <p className="text-muted mt-2">{order.city}</p>
            <p className="text-muted">{order.address_line1}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
