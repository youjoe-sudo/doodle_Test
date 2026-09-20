import { useState } from 'react';

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-display ink text-terracotta mb-6">تواصل معنا</h2>
            <p className="text-muted text-lg mb-6">
              نحب أن نسمع منكم! سواء كان لديكم استفسار حول منتجاتنا، أو طلب bulk order، أو مجرد سؤال حول التلوين، فريقنا هنا للمساعدة.
            </p>
            <div className="space-y-4 mb-8">
              <div>
                <h4 className="text-terracotta font-medium mb-2">العنوان</h4>
                <p className="text-muted">شارع المثال، القاهرة، مصر</p>
              </div>
              <div>
                <h4 className="text-terracotta font-medium mb-2">الهاتف</h4>
                <p className="text-muted">+20 2 1234 5678</p>
              </div>
              <div>
                <h4 className="text-terracotta font-medium mb-2">البريد الإلكتروني</h4>
                <p className="text-muted">info@doodleroom.com</p>
              </div>
            </div>
            <div>
              <h4 className="text-terracotta font-medium mb-2">مواعيد العمل</h4>
              <p className="text-muted">الأحد - الخميس: 9:00 ص - 6:00 م</p>
            </div>
          </div>
          <div>
            <h3 className="text-terracotta font-medium mb-4">إرسال رسالة</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('تم إرسال الرسالة'); }}>
              <input type="text" placeholder="اسمك الكامل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-line rounded-xl px-4 py-2" required />
              <input type="email" placeholder="بريدك الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-line rounded-xl px-4 py-2" required />
              <input type="text" placeholder="الموضوع" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-line rounded-xl px-4 py-2" />
              <textarea rows={4} placeholder="رسالتك" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-2 border border-line rounded-xl resize-none" />
              <button type="submit" className="w-full py-3 bg-terracotta text-white font-bold rounded-full hover:bg-terracotta-dark transition-colors">
                إرسال الرسالة
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
