"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, Lock, Mail, Eye, EyeOff, Shield, UserCheck, GraduationCap, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const ROLES = [
    {
        id: "PRINCIPAL",
        name: "Principal / Admin",
        description: "Full access across all departments, rooms, faculty & generation",
        icon: Shield,
    },
    {
        id: "HOD",
        name: "Head of Dept (HOD)",
        description: "Manage specific department faculty, sections & view timetables",
        icon: UserCheck,
    },
    {
        id: "FACULTY",
        name: "Faculty Member",
        description: "View department schedules, teaching slots & workloads",
        icon: GraduationCap,
    },
];

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AI & ML"];

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("PRINCIPAL");
    const [department, setDepartment] = useState("CSE");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please verify.");
            return;
        }

        setLoading(true);

        try {
            // 1. Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const userEmail = userCredential.user.email || email.trim();

            // 2. Register user record and role in database
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    role,
                    department: role === "HOD" ? department : null,
                }),
            });

            if (!res.ok) {
                console.warn("Could not sync role to DB, fallback will apply on login");
            }

            // 3. Redirect to dashboard
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Registration Error:", err);
            if (err?.code === "auth/email-already-in-use") {
                setError("An account with this email already exists. Please sign in instead.");
            } else if (err?.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else if (err?.code === "auth/weak-password") {
                setError("The password is too weak. Please use at least 6 characters.");
            } else {
                setError(err?.message || "Failed to create account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative z-10">
            <div className="w-full max-w-xl space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-purple-700 uppercase bg-purple-100/60 rounded-full border border-purple-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Account Creation
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an Account</h1>
                    <p className="text-sm text-gray-600">
                        Register a new user with your preferred role to test or manage timetables.
                    </p>
                </div>

                {/* Registration Card */}
                <GlassCard className="p-8 space-y-6 shadow-xl border border-white/60">
                    <form onSubmit={handleRegister} className="space-y-4">
                        
                        {/* Email */}
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
                                    className="w-full pl-10 pr-3 h-10 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="yourname@college.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Select Your Role
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {ROLES.map((r) => {
                                    const IconComponent = r.icon;
                                    const isSelected = role === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setRole(r.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                isSelected
                                                    ? "ring-2 ring-purple-600 border-purple-400 bg-purple-50/70 shadow-sm"
                                                    : "border-gray-200 bg-white/50 hover:bg-white/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`p-1 rounded-lg ${isSelected ? "bg-purple-200 text-purple-800" : "bg-gray-100 text-gray-600"}`}>
                                                    <IconComponent className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-900">{r.name}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight">
                                                {r.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Department (if HOD) */}
                        {role === "HOD" && (
                            <div className="space-y-2 p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl animate-in fade-in">
                                <label className="text-xs font-semibold text-purple-900" htmlFor="department">
                                    Assigned Department
                                </label>
                                <select
                                    id="department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full h-10 rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept} Department
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                                    Password (min. 6 characters)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium"
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
                                    className="w-full pl-10 pr-10 h-10 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-10 pr-10 h-10 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base font-medium rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                                </>
                            ) : (
                                "Complete Registration"
                            )}
                        </Button>
                    </form>

                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Already have an account?</span>
                        <Link
                            href="/login"
                            className="font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Sign In
                        </Link>
                    </div>
                </GlassCard>

                <div className="text-center pt-2">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        ← Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
}

