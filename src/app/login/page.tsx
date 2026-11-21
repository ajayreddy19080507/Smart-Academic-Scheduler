"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, Lock, Mail, Eye, EyeOff, Sparkles, Shield, UserCheck, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";

const DEMO_ACCOUNTS = [
    {
        role: "Principal (Admin)",
        email: "admin@college.edu",
        password: "admin123",
        description: "Full access to generate timetables, manage all faculty, rooms & sections",
        icon: Shield,
        badge: "Super Admin",
        color: "blue",
    },
    {
        role: "HOD (CSE)",
        email: "hod@college.edu",
        password: "admin123",
        description: "Department administrator access for CSE department & faculty",
        icon: UserCheck,
        badge: "Dept Head",
        color: "purple",
    },
    {
        role: "Faculty Member",
        email: "faculty@college.edu",
        password: "admin123",
        description: "View department schedules, teaching assignments & workload",
        icon: GraduationCap,
        badge: "Faculty",
        color: "pink",
    },
];

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [autoFilledRole, setAutoFilledRole] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err?.code === "auth/invalid-credential" || err?.code === "auth/user-not-found" || err?.code === "auth/wrong-password") {
                setError("Invalid email or password. Please use the demo credentials below or register.");
            } else if (err?.code === "auth/too-many-requests") {
                setError("Too many failed attempts. Please wait a moment and try again.");
            } else {
                setError(err?.message || "Failed to sign in. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFillDemo = (demo: typeof DEMO_ACCOUNTS[0]) => {
        setEmail(demo.email);
        setPassword(demo.password);
        setAutoFilledRole(demo.role);
        setError("");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative z-10">
            <div className="w-full max-w-xl space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-blue-700 uppercase bg-blue-100/60 rounded-full border border-blue-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        Live Deployment Preview
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to TimetableGen</h1>
                    <p className="text-sm text-gray-600">
                        Use sample credentials below for instant evaluation, or enter your own account.
                    </p>
                </div>

                {/* Login Form */}
                <GlassCard className="p-8 space-y-6 shadow-xl border border-white/60">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-3 h-10 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="admin@college.edu"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setAutoFilledRole(null);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                                >
                                    {showPassword ? (
                                        <>
                                            <EyeOff className="h-3.5 w-3.5" /> Hide
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="h-3.5 w-3.5" /> Show
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-10 pr-10 h-10 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setAutoFilledRole(null);
                                    }}
                                />
                            </div>
                        </div>

                        {autoFilledRole && (
                            <div className="flex items-center justify-between text-xs text-blue-700 bg-blue-50/80 border border-blue-200 rounded-lg px-3 py-2">
                                <span>Filled with <strong>{autoFilledRole}</strong> credentials</span>
                                <span className="font-semibold text-blue-800">Ready to sign in</span>
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base font-medium rounded-xl shadow-lg" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Need a new account?</span>
                        <Link
                            href="/register"
                            className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                        >
                            Register here <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </GlassCard>

                {/* Sample / Demo Credentials Showcase */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            Sample Accounts (Click to Auto-Fill)
                        </h2>
                        <span className="text-xs text-gray-500">Quick Login</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {DEMO_ACCOUNTS.map((demo) => {
                            const IconComponent = demo.icon;
                            const isSelected = email === demo.email;
                            return (
                                <button
                                    key={demo.email}
                                    type="button"
                                    onClick={() => handleFillDemo(demo)}
                                    className={`text-left p-3.5 rounded-xl border transition-all duration-200 bg-white/60 hover:bg-white/90 backdrop-blur-sm ${
                                        isSelected
                                            ? "ring-2 ring-blue-600 border-blue-400 shadow-md bg-blue-50/50"
                                            : "border-gray-200 hover:border-gray-300 shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                                            <IconComponent className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                            {demo.badge}
                                        </span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900 truncate">{demo.role}</div>
                                    <div className="mt-1 text-xs text-gray-600 space-y-0.5 font-mono">
                                        <div className="truncate"><span className="text-gray-400">ID:</span> {demo.email}</div>
                                        <div><span className="text-gray-400">Pass:</span> {demo.password}</div>
                                    </div>
                                    <div className="mt-2 text-[11px] font-medium text-blue-600 flex items-center gap-1">
                                        {isSelected ? "✓ Selected" : "Click to use →"}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center pt-2">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        ← Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
}
