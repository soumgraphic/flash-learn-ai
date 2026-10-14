"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { api } from "@/lib/api";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit password reset request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col transition-colors">
      <Navbar isAuthenticated={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 border border-outline/10 shadow-xl">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-secondary/15 text-secondary flex items-center justify-center mx-auto mb-4 border border-secondary/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
                Check Your Inbox
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                {message}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm transition-all shadow-md shadow-primary/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="font-headline font-extrabold text-2xl text-on-surface">
                  Forgot Password?
                </h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  Enter your registered email address and we will send you a secure link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Account Email
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
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center pt-4 border-t border-outline/10">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
