import React from "react";

type Props = {
    title: string;
    subtitle?: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
};

export default function AuthCard({ title, subtitle, footer, children }: Props) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            {/* viền sáng mờ */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/5" />

            {/* glow góc trên */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative px-6 py-7 sm:px-8 sm:py-8 space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-[22px] font-semibold tracking-tight text-slate-50">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>
                    )}
                </div>

                <div className="space-y-5">{children}</div>

                {footer && (
                    <div className="pt-4 border-t border-slate-800/80 text-center text-sm text-slate-400">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
