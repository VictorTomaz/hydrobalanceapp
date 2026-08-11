import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#2BC4BB] via-[#3B82F6] to-[#7C3AED]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/95 dark:bg-white/90 shadow-lg mb-4">
            <Icon className="w-8 h-8 text-[#2BC4BB]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-white drop-shadow-sm">{title}</h1>
          {subtitle && <p className="text-white/85 mt-2 font-body">{subtitle}</p>}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-white/30 p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-white/85 mt-6 font-body">{footer}</p>
        )}
      </div>
    </div>
  );
}