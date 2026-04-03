"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// ─── TOAST NOTIFICATION SYSTEM ───────────────────────────────────

type Toast = { id: string; message: string; type: "success" | "error" | "info"; expiresAt: number };
type ToastContextType = { toasts: Toast[]; addToast: (message: string, type?: Toast["type"]) => void };

const ToastContext = createContext<ToastContextType>({ toasts: [], addToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, expiresAt: Date.now() + 4000 }]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prev) => prev.filter((t) => t.expiresAt > Date.now()));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up rounded-lg px-4 py-3 text-[13px] font-medium shadow-lg backdrop-blur transition-all ${
              t.type === "success" ? "bg-emerald-500/90 text-white" :
              t.type === "error" ? "bg-red-500/90 text-white" :
              "bg-zinc-800/90 text-zinc-100"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }

// ─── LOADING SKELETON ────────────────────────────────────────────

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800/50 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── BUTTON VARIANTS ─────────────────────────────────────────────

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  type?: "button" | "submit";
};

export function Button({ children, onClick, disabled, variant = "primary", size = "md", loading, className = "", type = "button" }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-white text-zinc-950 hover:bg-zinc-200",
    secondary: "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white",
    danger: "bg-red-500/20 text-red-300 hover:bg-red-500/30",
    ghost: "text-zinc-500 hover:text-white hover:bg-zinc-800/50",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-4 py-2 text-[13px]",
    lg: "px-6 py-3 text-[14px]",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
  const variants = {
    default: "bg-zinc-800 text-zinc-400",
    success: "bg-emerald-500/20 text-emerald-300",
    warning: "bg-amber-500/20 text-amber-300",
    danger: "bg-red-500/20 text-red-300",
    info: "bg-cyan-500/20 text-cyan-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${variants[variant]}`}>{children}</span>;
}

// ─── EMPTY STATE ─────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="mt-3 text-[15px] font-medium text-zinc-400">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-zinc-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────────

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────

export function StatCard({ label, value, change, icon }: { label: string; value: string; change?: string; icon?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {change && <p className={`mt-1 text-[11px] ${change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{change}</p>}
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────

export function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string; count?: number }[]; activeTab: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
            activeTab === tab.id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 rounded-full bg-zinc-700/50 px-1.5 py-0.5 text-[10px]">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
