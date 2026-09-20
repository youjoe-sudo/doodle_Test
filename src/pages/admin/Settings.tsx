import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { ToastManager, useToasts } from '@components/admin/Toast';
import { Save, Plus, Trash2 } from 'lucide-react';

const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة', 'المنوفية',
  'القليوبية', 'الشرقية', 'كفر الشيخ', 'غربية', 'الفيوم', 'بني سويف',
  'المني𝐚', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر',
  'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء', 'البورسعيدية',
  'الإسماعيلية', 'السويس',
];

type StoreSettings = {
  brand_name: string; tagline: string; description: string; logo_url: string;
  primary_color: string; hero_title: string; hero_subtitle: string; hero_image_url: string;
  contact_email: string; contact_phone: string; contact_address: string;
  vodafone_cash_number: string; instapay_id: string;
  working_hours: string; facebook_url: string; instagram_url: string; tiktok_url: string;
  shipping_fees: Record<string, number>;
};

const defaultSettings: StoreSettings = {
  brand_name: 'Doodle Room', tagline: 'Small Books Big Dreams',
  description: 'A cozy little corner for books, gifts & lovely little things',
  logo_url: '/logo.svg', primary_color: '#bd745d',
  hero_title: 'Small Books Big Dreams', hero_subtitle: 'A cozy little corner for books, gifts & lovely little things',
  hero_image_url: '', contact_email: '', contact_phone: '', contact_address: '',
  vodafone_cash_number: '', instapay_id: '',
  working_hours: '', facebook_url: '', instagram_url: '', tiktok_url: '',
  shipping_fees: {
    'القاهرة': 50, 'الجيزة': 50, 'الإسكندرية': 60, 'الدقهلية': 60,
    'البحيرة': 60, 'المنوفية': 60, 'القليوبية': 55, 'الشرقية': 65,
    'كفر الشيخ': 65, 'غربية': 60, 'الفيوم': 70, 'بني سويف': 75,
    'المنيａ': 80, 'أسيوط': 85, 'سوهاج': 90, 'قنا': 95,
    'الأقصر': 100, 'أسوان': 105, 'البحر الأحمر': 110, 'الوادي الجديد': 120,
    'مطروح': 110, 'شمال سيناء': 115, 'جنوب سيناء': 120,
    'البورسعيدية': 60, 'الإسماعيلية': 55, 'السويس': 65,
  },
};

export const AdminSettings = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user?.id) fetchSettings(); }, [user?.id]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'store').single();
      if (data?.value) {
        const loaded = { ...defaultSettings, ...data.value };
        if (!loaded.shipping_fees || typeof loaded.shipping_fees !== 'object') {
          loaded.shipping_fees = defaultSettings.shipping_fees;
        }
        setSettings(loaded);
      }
    } catch { /* use defaults */ } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings')
        .upsert({ key: 'store', value: settings, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      addToast('تم حفظ الإعدادات بنجاح');
    } catch (err: any) {
      addToast(err.message || 'حدث خطأ', 'error');
    } finally { setSaving(false); }
  };

  const update = (key: keyof StoreSettings, val: any) => setSettings({ ...settings, [key]: val });

  const updateShippingFee = (gov: string, fee: number) => {
    setSettings({ ...settings, shipping_fees: { ...settings.shipping_fees, [gov]: fee } });
  };

  const removeShippingFee = (gov: string) => {
    const fees = { ...settings.shipping_fees };
    delete fees[gov];
    setSettings({ ...settings, shipping_fees: fees });
  };

  const addShippingFee = (gov: string) => {
    if (gov && !settings.shipping_fees[gov]) {
      setSettings({ ...settings, shipping_fees: { ...settings.shipping_fees, [gov]: 50 } });
    }
  };

  const Field = ({ label, k, dir, placeholder }: { label: string; k: keyof StoreSettings; dir?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">{label}</label>
      <input value={settings[k] as string} onChange={(e) => update(k, e.target.value)} dir={dir || 'ltr'} placeholder={placeholder}
        className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none" />
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white border-2 border-line rounded-2xl p-6 shadow-[4px_4px_0px_0px_#E2E8F0]">
      <h3 className="font-bold text-ink mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white border-2 border-line rounded-2xl animate-pulse" />)}</div>;

  const availableGovernorates = EGYPT_GOVERNORATES.filter((g) => !settings.shipping_fees[g]);

  return (
    <div>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>الإعدادات</h2>
          <p className="text-muted mt-1">إعدادات المتجر والمعلومات العامة</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 transition-all disabled:opacity-50">
          <Save className="w-5 h-5" /> {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Section title="المعلومات الأساسية">
          <Field label="اسم المتجر" k="brand_name" dir="rtl" placeholder="Doodle Room" />
          <Field label="الشعار" k="tagline" dir="rtl" placeholder="Small Books Big Dreams" />
          <div><label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">الوصف</label><textarea value={settings.description} onChange={(e) => update('description', e.target.value)} rows={2} className="w-full border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none resize-none" dir="rtl" /></div>
          <Field label="رابط الشعار" k="logo_url" placeholder="/logo.svg" />
          <Field label="اللون الأساسي" k="primary_color" placeholder="#bd745d" />
        </Section>

        <Section title="الصفحة الرئيسية">
          <Field label="عنوان Hero" k="hero_title" dir="rtl" />
          <Field label="عنوان فرعي Hero" k="hero_subtitle" dir="rtl" />
          <Field label="صورة Hero" k="hero_image_url" placeholder="https://..." />
        </Section>

        <Section title="معلومات التواصل">
          <div className="grid grid-cols-2 gap-4">
            <Field label="البريد الإلكتروني" k="contact_email" placeholder="info@example.com" />
            <Field label="رقم الهاتف" k="contact_phone" placeholder="+20..." />
          </div>
          <Field label="العنوان" k="contact_address" dir="rtl" />
          <Field label="ساعات العمل" k="working_hours" dir="rtl" placeholder="الأحد - الخميس: 9 ص - 6 م" />
        </Section>

        <Section title="طرق الدفع">
          <Field label="رقم فودافون كاش" k="vodafone_cash_number" placeholder="01xxxxxxxxx" />
          <Field label="معرف InstaPay" k="instapay_id" placeholder="instapay-id" />
        </Section>

        <Section title="رسوم الشحن حسب المحافظة">
          <p className="text-sm text-muted mb-2">حدد رسوم الشحن لكل محافظة. ستُستخدم تلقائياً عند اختيار العميل لمحافظته.</p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {Object.entries(settings.shipping_fees).sort(([a], [b]) => a.localeCompare(b, 'ar')).map(([gov, fee]) => (
              <div key={gov} className="flex items-center gap-3 p-2 bg-cream/50 rounded-xl">
                <span className="text-sm font-medium text-ink min-w-[120px]">{gov}</span>
                <input type="number" min={0} value={fee} onChange={(e) => updateShippingFee(gov, +e.target.value)}
                  className="w-24 border-2 border-line rounded-lg px-3 py-1.5 text-sm text-center focus:border-terracotta focus:outline-none" dir="ltr" />
                <span className="text-xs text-muted">EGP</span>
                <button onClick={() => removeShippingFee(gov)} className="p-1.5 rounded-lg hover:bg-red-50 ml-auto"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            ))}
          </div>
          {availableGovernorates.length > 0 && (
            <div className="flex gap-2 mt-3">
              <select id="add-gov" className="flex-1 border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none bg-white appearance-none">
                <option value="">أضف محافظة...</option>
                {availableGovernorates.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <button onClick={() => { const sel = document.getElementById('add-gov') as HTMLSelectElement; if (sel.value) { addShippingFee(sel.value); sel.value = ''; } }}
                className="px-4 py-2.5 bg-sage text-white rounded-xl font-bold border-2 border-ink shadow-[2px_2px_0px_0px_#1E293B] hover:shadow-[3px_3px_0px_0px_#1E293B] transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </Section>

        <Section title="وسائل التواصل الاجتماعي">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Facebook" k="facebook_url" placeholder="https://facebook.com/..." />
            <Field label="Instagram" k="instagram_url" placeholder="https://instagram.com/..." />
            <Field label="TikTok" k="tiktok_url" placeholder="https://tiktok.com/..." />
          </div>
        </Section>
      </div>
    </div>
  );
};
