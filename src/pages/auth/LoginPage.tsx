import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';

export const LoginPage = () => {
  const { login, user, profile, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirectTo') || (location.state as any)?.from?.pathname || null;

  // After login + profile loaded, redirect based on role
  useEffect(() => {
    if (user && !profileLoading && profile) {
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (profile.role === 'admin' || profile.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, profileLoading, redirectTo, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // Redirect handled by useEffect above after profile loads
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (msg.includes('Email not confirmed')) {
        setError('لم يتم تأكيد البريد الإلكتروني بعد');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('تحقق من اتصال الإنترنت وحاول مرة أخرى');
      } else {
        setError(msg || 'حدث خطأ أثناء تسجيل الدخول');
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
          <div className="w-4 h-4 rounded-full bg-terracotta opacity-60" />
          <div className="w-4 h-4 rounded-full bg-sage opacity-60" />
          <div className="w-4 h-4 rounded-full bg-blush opacity-60" />
        </div>

        <div className="bg-white border-2 border-ink rounded-2xl shadow-[6px_6px_0px_0px_#1E293B] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-terracotta rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_#1E293B]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>
              تسجيل الدخول
            </h1>
            <p className="text-muted mt-2 text-sm">مرحباً بعودتك! أدخل بياناتك للمتابعة</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 mb-6 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full border-2 border-line rounded-xl px-4 py-3 text-ink bg-white focus:border-terracotta focus:shadow-[3px_3px_0px_0px_#bd745d] focus:outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1E293B] active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_#1E293B] disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'دخول'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center">
            <Link
              to="/forgot-password"
              className="block text-sm text-muted hover:text-terracotta transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
            <p className="text-sm text-muted">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-terracotta font-bold hover:underline">
                أنشئ حساباً جديداً
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative bottom */}
        <div className="flex justify-center mt-6 gap-2">
          <div className="w-2 h-2 rounded-full bg-terracotta opacity-40" />
          <div className="w-2 h-2 rounded-full bg-sage opacity-40" />
          <div className="w-2 h-2 rounded-full bg-blush opacity-40" />
        </div>
      </div>
    </div>
  );
};
