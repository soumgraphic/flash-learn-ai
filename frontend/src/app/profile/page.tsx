"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { api } from "@/lib/api";
import { User as UserType } from "@/types";
import { Trophy, Flame, BookOpen, Star, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        setUser(data as UserType);
      } catch {
        // Fallback demo user for guest inspection
        setUser({
          id: "demo-user",
          email: "student@university.edu",
          full_name: "Alex Morgan",
          is_active: true,
          xp_points: 350,
          level: 4,
          streak_days: 7,
          created_at: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const nextLevelXp = user.level * 100;
  const progressPercent = Math.min(100, Math.round((user.xp_points / nextLevelXp) * 100));

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col transition-colors">
      <Navbar userStreak={user.streak_days} userXp={user.xp_points} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {/* 1. Profile Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border border-outline/10 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center font-headline font-extrabold text-2xl shadow-lg shadow-primary/25">
                  {user.full_name ? user.full_name.charAt(0) : "S"}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-secondary text-white text-xs font-bold shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1">
                <h1 className="font-headline font-extrabold text-2xl text-on-surface">
                  {user.full_name || "Active Student"}
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant">
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold border border-primary/20">
                    Level {user.level} Scholar
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold border border-amber-500/20 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {user.streak_days} Day Streak
                  </span>
                </div>
              </div>

              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
              >
                <span>Study Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
              <p className="text-xs text-on-surface-variant mt-1">7 study days completed in a row</p>
              <span className="mt-3 text-[11px] font-bold text-secondary flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Unlocked
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">Quiz Master</h3>
              <p className="text-xs text-on-surface-variant mt-1">Score 100% on any AI lecture quiz</p>
              <span className="mt-3 text-[11px] font-bold text-secondary flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Unlocked
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">Memory Engine</h3>
              <p className="text-xs text-on-surface-variant mt-1">Master 50 flashcards across decks</p>
              <span className="mt-3 text-[11px] font-bold text-on-surface-variant">
                32 / 50 Mastered
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
