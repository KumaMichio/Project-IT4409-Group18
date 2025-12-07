"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Vui lòng nhập email và mật khẩu.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.error || "Đăng nhập thất bại");
                return;
            }
            router.push("/");
        } catch (err) {
            setError("Đã có lỗi trong quá trình đăng nhập.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_60%),radial-gradient(circle_at_bottom,_#4f46e533,_transparent_55%)]" />
            </div>

            <div className="relative w-full max-w-5xl grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
                {/* Cột giới thiệu bên trái */}
                <div className="space-y-5">
                    <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-slate-700/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Nền tảng khóa học trực tuyến
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
                        Học cùng{" "}
                        <span className="text-emerald-400">giảng viên chất lượng</span>,
                        theo dõi tiến độ của bạn mỗi ngày.
                    </h1>
                    <p className="text-sm text-slate-300 max-w-md">
                        Đăng nhập để xem lớp học, bài tập, điểm số và chứng chỉ của bạn
                        trong một bảng điều khiển thống nhất.
                    </p>
                </div>

                {/* Card đăng nhập bên phải */}
                <div className="w-full">
                    <AuthCard
                        title="Đăng nhập"
                        subtitle="Sử dụng email và mật khẩu đã đăng ký để tiếp tục."
                        footer={
                            <p>
                                Chưa có tài khoản?{" "}
                                <Link
                                    href="/signup"
                                    className="text-indigo-400 font-medium hover:underline"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        }
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-3 py-2 rounded-md text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent"
                                    placeholder="ban@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                                    Mật khẩu
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white font-semibold py-2.5 text-sm tracking-wide shadow-lg shadow-indigo-500/40 transition"
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>
                    </AuthCard>
                </div>
            </div>
        </div>
    );
}
