import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { Ban, Clock, ShieldOff, LogOut, ExternalLink } from 'lucide-react';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateTimeLeft(bannedUntil: string): TimeLeft {
  const diff = new Date(bannedUntil).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const TimeBlock = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-cream border-2 border-line rounded-xl px-4 py-3 min-w-[72px] shadow-[2px_2px_0px_0px_#E2E8F0]">
    <div className="text-2xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {value}
    </div>
    <div className="text-[10px] text-muted uppercase tracking-wider mt-1">{label}</div>
  </div>
);

export const BannedScreen = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const banReason = profile?.ban_reason;
  const bannedUntil = profile?.banned_until;
  const isPermanent = !bannedUntil;

  useEffect(() => {
    if (!bannedUntil) return;

    const tick = () => setTimeLeft(calculateTimeLeft(bannedUntil));
    tick();
    const interval = setInterval(tick, 1000);

    const expiry = new Date(bannedUntil).getTime();
    const checkExpiry = setInterval(() => {
      if (Date.now() >= expiry) {
        clearInterval(checkExpiry);
        window.location.reload();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(checkExpiry);
    };
  }, [bannedUntil]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const hasTime = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-blush/10 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white border-2 border-line rounded-2xl shadow-[8px_8px_0px_0px_#E2E8F0] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-terracotta to-red-400" />

          <div className="w-24 h-24 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#FEE2E2]">
            {isPermanent ? (
              <ShieldOff className="w-12 h-12 text-red-500" />
            ) : (
              <Ban className="w-12 h-12 text-red-500" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-ink mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {isPermanent ? 'حسابك مُقيّد' : 'تم تعليق حسابك مؤقتاً'}
          </h1>

          <p className="text-muted text-sm mb-6">
            {isPermanent
              ? 'تم حظر هذا الحساب بشكل دائم ولا يمكنه الوصول للمتجر.'
              : 'لا يمكنك حالياً استخدام هذا الحساب. يمكنك المحاولة مرة أخرى بعد انتهاء المدة.'}
          </p>

          {banReason && (
            <div className="bg-cream border-2 border-line rounded-xl px-5 py-4 mb-6 text-right shadow-[2px_2px_0px_0px_#E2E8F0]">
              <p className="text-xs text-muted mb-1.5 font-bold uppercase tracking-wider">سبب التعليق</p>
              <p className="text-sm text-ink font-medium leading-relaxed">{banReason}</p>
            </div>
          )}

          {!isPermanent && hasTime && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 text-muted mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">المدة المتبقية</span>
              </div>
              <div className="flex justify-center gap-3">
                {timeLeft.days > 0 && <TimeBlock value={String(timeLeft.days)} label="يوم" />}
                <TimeBlock value={timeLeft.hours.toString().padStart(2, '0')} label="ساعة" />
                <TimeBlock value={timeLeft.minutes.toString().padStart(2, '0')} label="دقيقة" />
                <TimeBlock value={timeLeft.seconds.toString().padStart(2, '0')} label="ثانية" />
              </div>
            </div>
          )}

          {isPermanent && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
              <p className="text-sm text-red-700">
                للإستفسار عن حالة حسابك، يرجى التواصل مع فريق الدعم.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-terracotta text-white font-bold rounded-full border-2 border-ink shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[6px_6px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1E293B] transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
            <a
              href="/contact"
              className="w-full py-3.5 bg-white text-ink font-bold rounded-full border-2 border-line hover:border-terracotta transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              تواصل مع الدعم
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          يمكنك تسجيل الدخول بحساب آخر أو التواصل مع الدعم للمساعدة.
        </p>
      </div>
    </div>
  );
};
