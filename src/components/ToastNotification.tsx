import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto p-3 rounded-xl shadow-xl border flex items-center justify-between gap-2 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${
        toast.type === 'error'
          ? 'bg-red-900 text-white border-red-800'
          : toast.type === 'info'
          ? 'bg-blue-900 text-white border-blue-800'
          : 'bg-gray-900 text-white border-gray-800'
      }`}
    >
      <div className="flex items-center gap-2">
        {toast.type === 'error' ? (
          <AlertCircle size={16} className="text-red-400 shrink-0" />
        ) : toast.type === 'info' ? (
          <Info size={16} className="text-blue-400 shrink-0" />
        ) : (
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
        )}
        <span>{toast.title}</span>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-white/20 rounded-md transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
};
