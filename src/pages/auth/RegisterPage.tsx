import { useAuth } from '@contexts/AuthContext';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentTitle } from '@hooks/useDocumentTitle';

export const RegisterPage = () => {
  useDocumentTitle('إنشاء حساب');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await register(email, password, fullName, phone, gender);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already registered')) {
        setError('هذا البريد الإلكتروني مسجّل بالفعل');
      } else if (msg.includes('at least 6')) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      } else if (msg.includes('valid email')) {
        setError('يرجى إدخال بريد إلكتروني صحيح');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('تحقق من اتصال الإنترنت وحاول مرة أخرى');
      } else {
        setError(msg || 'حدث خطأ أثناء التسجيل');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Decorative top shapes */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="w-4 h-4 rounded-full bg-sage opacity-60" />
          <div className="w-4 h-4 rounded-full bg-terracotta opacity-60" />
          <div className="w-4 h-4 rounded-full bg-blush opacity-60" />
        </div>

        <div className="bg-white border-2 border-ink rounded-2xl shadow-[6px_6px_0px_0px_#1E293B] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sage rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_#1E293B]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>
              إنشاء حساب
            </h1>
            <p className="text-muted mt-2 text-sm">انضم إلينا واستمتع بعالم الكتب والهدايا</p>
          </div>

          {/* Success */}
          {success && (
            <div className="bg-sage/10 border-2 border-sage rounded-xl px-4 py-3 mb-6 text-sage text-sm text-center font-medium">
              تم التسجيل بنجاح! جاري التوجيه...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 mb-6 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="محمد أحمد"
                className="w-full border-2 border-line rounded-xl px-4 py-3 text-ink bg-white focus:border-terracotta focus:shadow-[3px_3px_0px_0px_#bd745d] focus:outline-none transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                dir="ltr"
                className="w-full border-2 border-line rounded-xl px-4 py-3 text-ink bg-white focus:border-terracotta focus:shadow-[3px_3px_0px_0px_#bd745d] focus:outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                dir="ltr"
                className="w-full border-2 border-line rounded-xl px-4 py-3 text-ink bg-white focus:border-terracotta focus:shadow-[3px_3px_0px_0px_#bd745d] focus:outline-none transition-all"
                required
                minLength={6}
              />
            </div>

            {/* Phone + Gender row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="w-full border-2 border-line rounded-xl px-4 py-3 text-ink bg-white focus:border-terracotta focus:shadow-[3px_3px_0px_0px_#bd745d] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">
                  الجنس
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border-2 border-line rounded-xl px-4 py-3 text-ink bg-white focus:border-terracotta focus:shadow-[3px_3px_0px_0px_#bd745d] focus:outline-none transition-all appearance-none"
                >
                  <option value="">اختر</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 bg-sage text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1E293B] active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_#1E293B] disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري إنشاء الحساب...
                </span>
              ) : success ? (
                <span className="flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  تم بنجاح!
                </span>
              ) : (
                'إنشاء حساب'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-terracotta font-bold hover:underline">
                سجّل دخولك
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative bottom */}
        <div className="flex justify-center mt-6 gap-2">
          <div className="w-2 h-2 rounded-full bg-sage opacity-40" />
          <div className="w-2 h-2 rounded-full bg-terracotta opacity-40" />
          <div className="w-2 h-2 rounded-full bg-blush opacity-40" />
        </div>
      </div>
    </div>
  );
};
