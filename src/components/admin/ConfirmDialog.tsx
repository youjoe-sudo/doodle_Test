import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }: ConfirmDialogProps) => (
  <Modal open={open} onClose={onClose} title={title}>
    <div className="text-center">
      <div className="w-14 h-14 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <p className="text-muted mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-6 py-2.5 rounded-full border-2 border-line text-ink font-medium hover:bg-cream transition-colors disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-red-500 text-white font-bold border-2 border-ink shadow-[3px_3px_0px_0px_#1E293B] hover:shadow-[5px_5px_0px_0px_#1E293B] hover:-translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all disabled:opacity-50"
        >
          {loading ? 'جاري الحذف...' : 'تأكيد الحذف'}
        </button>
      </div>
    </div>
  </Modal>
);
