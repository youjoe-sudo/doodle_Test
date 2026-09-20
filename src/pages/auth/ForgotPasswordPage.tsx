import { useAuth } from '@contexts/AuthContext';
import { useState } from 'react';

export const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    }
  };

  return (
    <div className="min-h-screen bg-cream p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="h-12 w-12 bg-terracotta rounded-md flex items-center justify-center mx-auto">DR</div>
        <h1 className="text-2xl font-bold ink">Doodle Room</h1>
        <p className="text-muted">A cozy little corner for books, gifts & lovely little things</p>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold ink">استعادة كلمة المرور</h2>
          {error && <p className="text-terracotta">{error}</p>}
          {sent && <p className="text-terracotta">تم إرسال رسالة لإعادة تعيين كلمة المرور إلى بريدك الإلكتروني</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line rounded-xl px-4 py-2" required />
            <button type="submit" className="w-full py-3 bg-terracotta text-white font-bold rounded-full hover:bg-terracotta-dark transition-colors">إرسال</button>
          </form>
        </div>
      </div>
    </div>
  );
};
