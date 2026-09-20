import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

type ToastProps = {
  message: string;
  type: ToastType;
  duration?: number;
  onDismiss: () => void;
};

export const Toast = ({ message, type, duration = 3500, onDismiss }: ToastProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  const Icon = type === 'success' ? CheckCircle : XCircle;
  const colors = type === 'success'
    ? 'bg-sage/10 border-sage text-sage'
    : 'bg-red-50 border-red-300 text-red-700';

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 shadow-[4px_4px_0px_0px_#1E293B] ${colors}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} className="mr-2 p-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

type ToastManagerProps = {
  toasts: Array<{ id: string; message: string; type: ToastType; duration?: number }>;
  removeToast: (id: string) => void;
};

export const ToastManager = ({ toasts, removeToast }: ToastManagerProps) => (
  <>
    {toasts.map((t) => (
      <Toast key={t.id} message={t.message} type={t.type} duration={t.duration} onDismiss={() => removeToast(t.id)} />
    ))}
  </>
);

export const useToasts = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType; duration?: number }>>([]);

  const addToast = (message: string, type: ToastType = 'success', duration?: number) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};
