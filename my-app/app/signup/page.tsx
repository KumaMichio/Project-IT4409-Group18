"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"student" | "teacher">("student");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name || !email || !password) {
            setError("Vui lòng điền đủ thông tin.");
            return;
        }
        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data?.error || "Đăng ký thất bại");
                return;
            }

            router.push("/");
        } catch (err) {
            setError("Đã có lỗi khi đăng ký.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4">
            {/* nền glow nhẹ */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_60%),radial-gradient(circle_at_bottom,_#4f46e533,_transparent_55%)]" />
            </div>

            <div className="relative w-full max-w-5xl grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
                {/* Cột giới thiệu bên trái */}
                <div className="space-y-5">
                    <p className="inline-flex items-center gap-2 rounded-full bg-emerald-900/40 border border-emerald-500/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-100">
                        Bắt đầu hành trình học tập
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
                        Tạo tài khoản{" "}
                        <span className="text-emerald-400">học viên hoặc giảng viên</span>.
                    </h1>
                    <p className="text-sm text-slate-300 max-w-md">
                        Sau khi đăng ký, bạn có thể tham gia lớp học, theo dõi tiến độ,
                        nhận bài tập và chứng chỉ hoàn thành tùy theo vai trò của mình.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-200">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                            <div className="font-semibold mb-1 text-emerald-300">
                                Dành cho học viên
                            </div>
                            <p>Theo dõi khóa học, điểm số và lịch nộp bài.</p>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                            <div className="font-semibold mb-1 text-indigo-300">
                                Dành cho giảng viên
                            </div>
                            <p>Tạo khóa học, bài tập, đánh giá và quản lý lớp.</p>
                        </div>
                    </div>
                </div>

                {/* Card đăng ký bên phải */}
                <div className="w-full">
                    <AuthCard
                        title="Đăng ký tài khoản"
                        subtitle="Điền thông tin bên dưới để tham gia hệ thống."
                        footer={
                            <p>
                                Đã có tài khoản?{" "}
                                <Link
                                    href="/signin"
                                    className="text-emerald-400 font-medium hover:underline"
                                >
                                    Đăng nhập
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
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
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
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                                    placeholder="Tối thiểu 6 ký tự"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                                    Vai trò
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) =>
                                        setRole(e.target.value as "student" | "teacher")
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent"
                                >
                                    <option value="student">Học viên / Sinh viên</option>
                                    <option value="teacher">Giảng viên</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-semibold py-2.5 text-sm tracking-wide shadow-lg shadow-emerald-500/40 transition"
                            >
                                {loading ? "Đang đăng ký..." : "Đăng ký"}
                            </button>
                        </form>
                    </AuthCard>
                </div>
            </div>
        </div>
    );
}
