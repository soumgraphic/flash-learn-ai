"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { api } from "@/lib/api";
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-headline font-extrabold text-xl text-on-surface mb-2">
          Missing Reset Token
        </h1>
        <p className="text-xs text-on-surface-variant mb-6">
          The password reset link appears incomplete or corrupted. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-md"
        >
          <span>Request New Reset Link</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.resetPassword({ token, new_password: password });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-3xl bg-secondary/15 text-secondary flex items-center justify-center mx-auto mb-4 border border-secondary/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
          Password Reset Complete! 🎉
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mb-6">
          Your account credentials have been securely updated. Redirecting you to sign in...
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-md"
        >
          <span>Proceed to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-headline font-extrabold text-2xl text-on-surface">
          Create New Password
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Choose a strong password with at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
            New Password
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
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-low border border-outline/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface text-sm transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-headline font-bold text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col transition-colors">
      <Navbar isAuthenticated={false} />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 border border-outline/10 shadow-xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
