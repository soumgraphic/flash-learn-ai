"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Zap, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        // Register new student account
        await api.register({
          email: email.trim(),
          password,
          full_name: fullName.trim() || undefined,
        });
      }

      // Login to obtain JWT token
      const tokens = await api.login({
        email: email.trim(),
        password,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("flashlearn_token", tokens.access_token);
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex items-center justify-center p-4 sm:p-6 transition-colors relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-tertiary/20 blur-3xl" />

      {/* Top Controls */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-md mx-auto relative z-10">
        <div className="w-full rounded-3xl bg-surface-container-lowest p-8 sm:p-10 shadow-2xl border border-outline/10 backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="mb-4 group">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
                <Zap className="h-8 w-8 fill-current" />
              </div>
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 mb-2 border border-secondary/20">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold text-secondary">Smart Study Platform</span>
            </div>

            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
              FlashLearn<span className="text-primary font-bold">.AI</span>
            </h1>
            <p className="font-body text-sm text-on-surface-variant mt-1 max-w-xs">
              {isRegister
                ? "Create your account and start earning study XP"
                : "Welcome back! Revise your lecture notes in minutes"}
            </p>
          </div>

          {/* Switch Tab (Login vs Register) */}
          <div className="w-full rounded-2xl bg-surface-container-low p-1.5 flex items-center gap-1 mb-6 border border-outline/5">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-headline font-bold text-xs transition-all",
                !isRegister
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-headline font-bold text-xs transition-all",
                isRegister
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-low border border-outline/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-low border border-outline/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-low border border-outline/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface text-sm transition-all"
                />
              </div>
              {isRegister && (
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Must be at least 8 characters long.
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-error-container text-on-error-container text-xs font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-headline font-bold text-sm transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRegister ? "Creating Account..." : "Signing in..."}
                </>
              ) : (
                <>
                  <span>{isRegister ? "Start Studying" : "Continue"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Link to return */}
          <div className="mt-8 pt-6 border-t border-outline/10 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              ← Back to Study Deck Creator
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
