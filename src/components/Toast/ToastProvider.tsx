'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type Toast = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

type ToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
  success: (message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) => void;
  error: (message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) => void;
  info: (message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) => void;
  warning: (message: string, opts?: Omit<ToastInput, 'message' | 'variant'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function randomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function Icon({ variant }: { variant: ToastVariant }) {
  const common = 'h-5 w-5';
  switch (variant) {
    case 'success':
      return <CheckCircle2 className={`${common} text-emerald-600`} strokeWidth={2.25} />;
    case 'error':
      return <AlertTriangle className={`${common} text-red-600`} strokeWidth={2.25} />;
    case 'warning':
      return <AlertTriangle className={`${common} text-amber-600`} strokeWidth={2.25} />;
    case 'info':
    default:
      return <Info className={`${common} text-blue-600`} strokeWidth={2.25} />;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeouts.current.get(id);
    if (timeout) clearTimeout(timeout);
    timeouts.current.delete(id);
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const toast: Toast = {
      id: randomId(),
      title: input.title,
      message: input.message,
      variant: input.variant ?? 'info',
      durationMs: input.durationMs ?? 3500,
    };

    setToasts((prev) => [toast, ...prev].slice(0, 4));

    const timeout = setTimeout(() => remove(toast.id), toast.durationMs);
    timeouts.current.set(toast.id, timeout);
  }, [remove]);

  const value = useMemo<ToastContextValue>(() => {
    return {
      showToast,
      success: (message, opts) => showToast({ ...opts, message, variant: 'success' }),
      error: (message, opts) => showToast({ ...opts, message, variant: 'error' }),
      info: (message, opts) => showToast({ ...opts, message, variant: 'info' }),
      warning: (message, opts) => showToast({ ...opts, message, variant: 'warning' }),
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-[100] w-[360px] max-w-[calc(100vw-2rem)] space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-neutral-100 bg-white shadow-lg px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <Icon variant={t.variant} />
              </div>
              <div className="min-w-0 flex-1">
                {t.title && (
                  <p className="text-2 font-semibold text-neutral-800 leading-snug">
                    {t.title}
                  </p>
                )}
                <p className="text-1 text-neutral-500 font-medium leading-relaxed break-words">
                  {t.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="shrink-0 rounded-lg p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-50 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

