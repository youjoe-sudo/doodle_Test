import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { useCart } from '@hooks/useCart';
import { MapPin, Upload, Loader2, Tag, CheckCircle } from 'lucide-react';
import { useDocumentTitle } from '@hooks/useDocumentTitle';

const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة', 'المنوفية',
  'القليوبية', 'الشرقية', 'كفر الشيخ', 'غربية', 'الفيوم', 'بني سويف',
  'المنيａ', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر',
  'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء', 'البورسعيدية',
  'الإسماعيلية', 'السويس',
];

export const CheckoutPage = () => {
  useDocumentTitle('إتمام الطلب');
  const { user } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: '',
    email: user?.email || '',
    governorate: '',
    city: '',
    address: '',
    paymentMethod: '',
  });
  const [shippingFees, setShippingFees] = useState<Record<string, number>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{ type: 'percent' | 'amount'; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load shipping fees from site_settings + default address
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'store').single();
      if (data?.value?.shipping_fees) setShippingFees(data.value.shipping_fees);
    };
    const loadDefaultAddress = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from('user_addresses').select('*').eq('user_id', user.id).eq('is_default', true).single();
      if (data) {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || user?.user_metadata?.full_name || '',
          phone: prev.phone || '',
          governorate: data.governorate || prev.governorate,
          city: data.city || prev.city,
          address: data.address_line || prev.address,
        }));
      }
    };
    loadSettings();
    loadDefaultAddress();
  }, [user?.id]);

  const shippingCost = formData.governorate ? (shippingFees[formData.governorate] || 50) : 0;
  const discountAmount = couponDiscount
    ? couponDiscount.type === 'percent' ? Math.round(cartTotal * couponDiscount.value / 100) : couponDiscount.value
    : 0;
  const finalTotal = cartTotal - discountAmount + shippingCost;

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setReceiptFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع. يرجى إدخال العنوان يدويًا.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`);
          const data = await resp.json();
          const addr = data.address || {};
          const state = addr.state || addr.region || '';
          const match = EGYPT_GOVERNORATES.find((g) => state.includes(g) || g.includes(state));
          if (match) setFormData((prev) => ({ ...prev, governorate: match }));
          const city = addr.city || addr.town || addr.village || addr.county || '';
          if (city) setFormData((prev) => ({ ...prev, city }));
          const road = addr.road || addr.neighbourhood || addr.suburb || '';
          const detail = [road, addr.house_number].filter(Boolean).join(' ');
          if (detail) setFormData((prev) => ({ ...prev, address: detail }));
        } catch {
          setError('فشل تحديد العنوان. يرجى إدخال العنوان يدويًا.');
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('تم رفض إذن تحديد الموقع. يرجى تفعيل إذن الموقع من إعدادات المتصفح أو إدخال العنوان يدويًا.');
        } else if (err.code === err.TIMEOUT) {
          setError('انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى أو إدخال العنوان يدويًا.');
        } else {
          setError('تعذر تحديد الموقع. يرجى إدخال العنوان يدويًا.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponDiscount(null);
    try {
      const { data, error } = await supabase.from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();
      if (error || !data) { setCouponError('كود الخصم غير صالح'); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setCouponError('انتهت صلاحية الكود'); return; }
      if (data.max_uses && data.times_used >= data.max_uses) { setCouponError('تم استخدام الكود بالفعل'); return; }
      if (data.min_order_amount && cartTotal < data.min_order_amount) { setCouponError(`الحد الأدنى للطلب ${data.min_order_amount} EGP`); return; }
      if (data.discount_percent > 0) {
        setCouponDiscount({ type: 'percent', value: data.discount_percent });
      } else if (data.discount_amount > 0) {
        setCouponDiscount({ type: 'amount', value: data.discount_amount });
      } else {
        setCouponError('الكود لا يحتوي على خصم');
      }
    } catch {
      setCouponError('حدث خطأ أثناء التحقق');
    } finally { setCouponLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (items.length === 0) throw new Error('العربة فارغة');
      if (!formData.paymentMethod) throw new Error('حدد طريقة دفع');
      if (!formData.governorate) throw new Error('حدد المحافظة');
      if (!receiptFile) throw new Error('يجب رفع إيصال التحويل');

      for (const item of items) {
        const { data: product, error: stockError } = await supabase
          .from('products').select('stock').eq('id', item.productId).single();
        if (stockError) throw stockError;
        if ((product?.stock || 0) < item.quantity) {
          throw new Error(`المنتج ${item.name} غير متوفر بالكمية المطلوبة`);
        }
      }

      // Upload receipt
      let receiptPath = '';
      if (receiptFile && user?.id) {
        const ext = receiptFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts').upload(path, receiptFile, { contentType: receiptFile.type });
        if (uploadError) throw new Error('فشل رفع الإيصال');
        receiptPath = path;
      }

      // Apply coupon
      if (couponDiscount && couponCode.trim()) {
        await supabase.from('coupons')
          .update({ times_used: (await supabase.from('coupons').select('times_used').eq('code', couponCode.toUpperCase().trim()).single()).data?.times_used + 1 || 1 })
          .eq('code', couponCode.toUpperCase().trim());
      }

      const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        user_id: user?.id,
        status: 'PENDING_PAYMENT_VERIFICATION',
        payment_status: 'PENDING',
        subtotal: cartTotal,
        shipping_cost: shippingCost,
        discount: discountAmount,
        total: finalTotal,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        city: `${formData.governorate}, ${formData.city}`,
        address_line1: formData.address,
        payment_method: formData.paymentMethod,
        shipping_method: 'Standard Delivery',
        receipt_url: receiptPath,
      }).select('id').single();

      if (orderError) throw orderError;

      // Create payment record linked to the order
      const { error: paymentError } = await supabase.from('payments').insert({
        order_id: newOrder.id,
        amount: finalTotal,
        status: 'PENDING',
        receipt_url: receiptPath,
      });
      if (paymentError) console.error('Payment record creation failed:', paymentError);

      for (const item of items) {
        await supabase.from('order_items').insert({
          order_id: newOrder.id,
          product_id: item.productId,
          product_name: item.name,
          unit_price: item.salePrice || item.originalPrice,
          original_price: item.originalPrice,
          quantity: item.quantity,
          subtotal: (item.salePrice || item.originalPrice) * item.quantity,
        });
      }

      clearCart();
      navigate('/orders/success', {
        state: {
          orderId: newOrder.id,
          total: finalTotal,
          subtotal: cartTotal,
          shippingCost,
          discount: discountAmount,
        },
      });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الطلب');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-ink mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>طلبية جديدة</h2>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 mb-6 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta mx-auto mb-3" />
          <p className="text-muted">جاري معالجة الطلب...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white border-2 border-line rounded-2xl p-5 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <h3 className="font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>معلومات العميل</h3>
            <div className="space-y-3">
              <input type="text" placeholder="الاسم الكامل" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" placeholder="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" required />
                <input type="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" dir="ltr" required />
              </div>

              {/* Governorate */}
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">المحافظة</label>
                <select value={formData.governorate} onChange={(e) => setFormData({ ...formData, governorate: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none bg-white appearance-none" required>
                  <option value="">اختر المحافظة</option>
                  {EGYPT_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* City */}
              <input type="text" placeholder="المدينة / المنطقة" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" />

              {/* Address + Location */}
              <input type="text" placeholder="العنوان التفصيلي" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" />

              <button type="button" onClick={handleUseLocation} disabled={locating}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-sage/10 border-2 border-sage rounded-xl text-sage font-bold text-sm hover:bg-sage/20 hover:border-sage/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {locating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> جاري تحديد الموقع...</>
                ) : (
                  <><MapPin className="w-5 h-5" /> استخدام موقعي الحالي</>
                )}
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border-2 border-line rounded-2xl p-5 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <h3 className="font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>طريقة الدفع</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'Vodafone Cash' ? 'border-terracotta bg-terracotta/5' : 'border-line hover:border-terracotta/50'}`}>
                <input type="radio" name="payment" value="Vodafone Cash" checked={formData.paymentMethod === 'Vodafone Cash'} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="accent-terracotta" />
                <div>
                  <p className="font-medium text-ink text-sm">Vodafone Cash</p>
                  <p className="text-xs text-muted">تحويل إلى فودافون كاش</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'InstaPay' ? 'border-terracotta bg-terracotta/5' : 'border-line hover:border-terracotta/50'}`}>
                <input type="radio" name="payment" value="InstaPay" checked={formData.paymentMethod === 'InstaPay'} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="accent-terracotta" />
                <div>
                  <p className="font-medium text-ink text-sm">InstaPay</p>
                  <p className="text-xs text-muted">تحويل إنستا باي</p>
                </div>
              </label>
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="bg-white border-2 border-line rounded-2xl p-5 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <h3 className="font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>إيصال التحويل <span className="text-red-500">*</span></h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleReceiptChange} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm file:ml-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-cream file:text-ink file:font-medium file:text-sm" required />
                <p className="text-xs text-muted mt-1">ارفع صورة إيصال التحويل (صورة أو PDF)</p>
              </div>
              {receiptPreview && (
                <img src={receiptPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-line" />
              )}
            </div>
          </div>

          {/* Coupon Code */}
          <div className="bg-white border-2 border-line rounded-2xl p-5 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <h3 className="font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>كود الخصم</h3>
            <div className="flex gap-2">
              <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="أدخل كود الخصم" className="flex-1 border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none uppercase tracking-wider" dir="ltr" />
              <button type="button" onClick={handleValidateCoupon} disabled={couponLoading || !couponCode.trim()}
                className="px-5 py-2.5 bg-sage text-white font-bold rounded-xl border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] transition-all disabled:opacity-50">
                {couponLoading ? '...' : 'تطبيق'}
              </button>
            </div>
            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
            {couponDiscount && (
              <div className="flex items-center gap-2 mt-2 text-sage text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>تم تطبيق الخصم: {couponDiscount.type === 'percent' ? `${couponDiscount.value}%` : `${couponDiscount.value} EGP`}</span>
                <button type="button" onClick={() => { setCouponDiscount(null); setCouponCode(''); setCouponError(''); }} className="text-xs text-muted hover:text-ink mr-auto">إزالة</button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white border-2 border-line rounded-2xl p-5 shadow-[4px_4px_0px_0px_#E2E8F0]">
            <h3 className="font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">المجموع الفرعي ({items.length} منتج)</span><span className="font-medium text-ink">{cartTotal.toLocaleString()} EGP</span></div>
              {formData.governorate && (
                <div className="flex justify-between"><span className="text-muted">الشحن ({formData.governorate})</span><span className="font-medium text-ink">{shippingCost} EGP</span></div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-sage"><span>الخصم</span><span className="font-medium">-{discountAmount.toLocaleString()} EGP</span></div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-line">
                <span className="font-bold text-ink text-base">الإجمالي</span>
                <span className="font-bold text-terracotta text-lg">{finalTotal.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={items.length === 0 || loading}
            className="w-full py-4 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1E293B] active:translate-y-0.5 transition-all disabled:opacity-50 text-lg">
            تأكيد الطلب
          </button>
        </form>
      )}
    </div>
  );
};
