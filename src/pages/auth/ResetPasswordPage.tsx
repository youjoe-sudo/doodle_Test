import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect } from 'react';

export const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('رابط إعادة تعيين كلمة المرور غير صالح');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await resetPassword(password);
      setSuccess(true);
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
          <h2 className="text-2xl font-bold ink">تعيين كلمة مرور جديدة</h2>
          {error && <p className="text-terracotta">{error}</p>}
          {success && <p className="text-terracotta">تم تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" placeholder="كلمة المرور الجديدة" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-line rounded-xl px-4 py-2" required />
            <button type="submit" className="w-full py-3 bg-terracotta text-white font-bold rounded-full hover:bg-terracotta-dark transition-colors">تحديث كلمة المرور</button>
          </form>
        </div>
      </div>
    </div>
  );
};
