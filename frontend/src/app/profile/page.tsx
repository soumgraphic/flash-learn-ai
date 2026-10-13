"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { api } from "@/lib/api";
import { User as UserType } from "@/types";
import { Trophy, Flame, BookOpen, CheckCircle, ShieldCheck, ArrowRight, LogOut, Lock } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const token = typeof window !== "undefined" ? localStorage.getItem("flashlearn_token") : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getProfile();
        setUser(data as UserType);
      } catch (err: any) {
        console.error("Profile load error:", err);
        setError(err.message || "Failed to load authenticated profile.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("flashlearn_token");
    }
    setUser(null);
    router.push("/login");
  };

  // If page is still fetching profile data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar isAuthenticated={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // If user is NOT authenticated, prompt them directly to log in instead of displaying fake data
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col transition-colors">
        <Navbar isAuthenticated={false} />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-surface-container-high text-primary flex items-center justify-center mb-6 shadow-md border border-outline/10">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
            Authentication Required
          </h1>
          <p className="font-body text-sm text-on-surface-variant mb-8 max-w-xs">
            Please sign in to view your learning progress, XP points, and unlocked study achievements.
          </p>
          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-headline font-bold text-sm transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
      </div>
    );
  }

  // User is authenticated: compute real level thresholds
  const nextLevelXp = user.level * 100;
  const progressPercent = Math.min(100, Math.round((user.xp_points / nextLevelXp) * 100));

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col transition-colors">
      <Navbar
        isAuthenticated={true}
        userName={user.full_name || "Soumaila"}
        userStreak={user.streak_days}
        userXp={user.xp_points}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {/* 1. Real Profile Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border border-outline/10 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center font-headline font-extrabold text-2xl shadow-lg shadow-primary/25 border-2 border-white dark:border-surface">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "S"}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-secondary text-white text-xs font-bold shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1">
                <h1 className="font-headline font-extrabold text-2xl text-on-surface">
                  {user.full_name || "Student"}
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant font-mono">
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold border border-primary/20">
                    Level {user.level} Scholar
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold border border-amber-500/20 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {user.streak_days} Day Streak
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-bold border border-outline/10">
                    ⭐ {user.xp_points} XP
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <span>Study Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-error-container/20 hover:text-error text-xs font-bold text-on-surface-variant transition-colors border border-outline/10 flex items-center justify-center gap-1.5"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="mt-8 pt-6 border-t border-outline/10">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant mb-2">
                <span>XP Progress to Level {user.level + 1}</span>
                <span className="text-primary">
                  {user.xp_points} / {nextLevelXp} XP ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary-container h-full transition-all duration-700 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Gamified Badges & Milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">Consistent</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {user.streak_days} study days completed in a row
              </p>
              <span className="mt-3 text-[11px] font-bold text-secondary flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Active Streak
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">Level {user.level}</h3>
              <p className="text-xs text-on-surface-variant mt-1">Accumulated {user.xp_points} total study XP</p>
              <span className="mt-3 text-[11px] font-bold text-primary flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> In Progress
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">Member Since</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                })}
              </p>
              <span className="mt-3 text-[11px] font-bold text-secondary flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Verified Student
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
