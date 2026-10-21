"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ToastType = "success" | "error" | "info" | "loading";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (type: ToastType, message: string, title?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  loading: (message: string, title?: string) => string;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

let globalAddToast: ((type: ToastType, message: string, title?: string, duration?: number) => string) | null = null;
let globalRemoveToast: ((id: string) => void) | null = null;

export const toast = {
  success: (message: string, title?: string, duration?: number) => {
    return globalAddToast?.("success", message, title, duration) || "";
  },
  error: (message: string, title?: string, duration?: number) => {
    return globalAddToast?.("error", message, title, duration) || "";
  },
  info: (message: string, title?: string, duration?: number) => {
    return globalAddToast?.("info", message, title, duration) || "";
  },
  loading: (message: string, title?: string) => {
    return globalAddToast?.("loading", message, title, 999999) || "";
  },
  dismiss: (id: string) => {
    globalRemoveToast?.(id);
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration && duration < 900000) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  React.useEffect(() => {
    globalAddToast = addToast;
    globalRemoveToast = removeToast;
    return () => {
      globalAddToast = null;
      globalRemoveToast = null;
    };
  }, [addToast, removeToast]);

  const success = React.useCallback(
    (message: string, title?: string, duration?: number) => addToast("success", message, title, duration),
    [addToast]
  );
  const error = React.useCallback(
    (message: string, title?: string, duration?: number) => addToast("error", message, title, duration || 5000),
    [addToast]
  );
  const info = React.useCallback(
    (message: string, title?: string, duration?: number) => addToast("info", message, title, duration),
    [addToast]
  );
  const loading = React.useCallback(
    (message: string, title?: string) => addToast("loading", message, title, 999999),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, loading }}>
      {children}
      {/* Toast Render Viewport (Top-Right Fixed Container) */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in",
              t.type === "success" && "bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100",
              t.type === "error" && "bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100",
              t.type === "info" && "bg-blue-50/95 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
              t.type === "loading" && "bg-slate-50/95 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
              {t.type === "info" && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              {t.type === "loading" && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
            </div>

            <div className="flex-1 text-xs">
              {t.title && <h5 className="font-semibold text-sm leading-tight mb-0.5">{t.title}</h5>}
              <p className="leading-relaxed opacity-95">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
