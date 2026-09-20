import { useLocation, Link } from 'react-router-dom';

interface OrderState {
  orderId: string;
  total: number;
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
}

const fmtOrderNumber = (id: string) => `ORD-${id.slice(0, 8).toUpperCase()}`;

export const OrderSuccessPage = () => {
  const location = useLocation();
  const order = (location.state as OrderState) || null;

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="inline-block bg-terracotta text-white p-6 rounded-2xl mb-6">
        <svg className="h-12 w-12 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h2 className="text-2xl font-bold">شكراً لك!</h2>
        <p className="text-white/80">تم استلام طلبك بنجاح</p>
      </div>

      <div className="bg-cream p-6 rounded-xl mb-8">
        <h3 className="text-terracotta font-bold mb-4">تفاصيل الطلب</h3>
        {order ? (
          <div className="space-y-2">
            <p className="text-muted mb-2">رقم الطلب: <span className="font-bold text-ink">#{fmtOrderNumber(order.orderId)}</span></p>
            {order.subtotal != null && (
              <p className="text-muted mb-1 text-sm">المجموع الفرعي: {order.subtotal.toLocaleString()} EGP</p>
            )}
            {order.shippingCost != null && order.shippingCost > 0 && (
              <p className="text-muted mb-1 text-sm">الشحن: {order.shippingCost.toLocaleString()} EGP</p>
            )}
            {order.discount != null && order.discount > 0 && (
              <p className="text-sage mb-1 text-sm">الخصم: -{order.discount.toLocaleString()} EGP</p>
            )}
            <p className="text-muted mb-2 font-bold">إجمالي الدفعة: {order.total.toLocaleString()} EGP</p>
            <p className="text-muted">حالة الدفع: في انتظار التحقق</p>
          </div>
        ) : (
          <p className="text-muted">جاري تحميل تفاصيل الطلب...</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/account/orders"
          className="px-6 py-3 bg-ink text-white font-bold rounded-full hover:bg-ink/90 transition-colors"
        >
          عرض طلباتي
        </Link>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-terracotta text-white font-bold rounded-full hover:bg-terracotta-dark transition-colors"
        >
          مواصلة التسوق
        </button>
      </div>
    </div>
  );
};
