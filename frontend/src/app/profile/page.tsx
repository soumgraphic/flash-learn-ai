"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { api } from "@/lib/api";
import { CourseSummary, User as UserType } from "@/types";
import {
  Trophy,
  Flame,
  BookOpen,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Lock,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfileAndCourses() {
      const token = typeof window !== "undefined" ? localStorage.getItem("flashlearn_token") : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [profileData, coursesData] = await Promise.all([
          api.getProfile(),
          api.getMyCourses(),
        ]);
        setUser(profileData as UserType);
        setCourses((coursesData || []) as CourseSummary[]);
      } catch (err: any) {
        console.error("Profile load error:", err);
        setError(err.message || "Failed to load authenticated profile.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfileAndCourses();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("flashlearn_token");
    }
    setUser(null);
    router.push("/login");
  };

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

  // Level & XP math
  const nextLevelXp = user.level * 100;
  const progressPercent = Math.min(100, Math.round((user.xp_points / nextLevelXp) * 100));

  const completedCoursesCount = courses.filter((c) => c.is_completed).length;
  const totalCoursesCount = courses.length;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col transition-colors">
      <Navbar
        isAuthenticated={true}
        userName={user.full_name || "Student"}
        userStreak={user.streak_days}
        userXp={user.xp_points}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {error && (
            <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-xs font-medium">
              ⚠️ {error}
            </div>
          )}
          {/* 1. Profile Header Card */}
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
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Deck</span>
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
                <span className="text-primary font-mono">
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

          {/* 2. Gamified Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-md flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-headline font-extrabold text-xl text-on-surface">
                {totalCoursesCount}
              </span>
              <span className="text-xs text-on-surface-variant mt-0.5">Decks Created</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-md flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="font-headline font-extrabold text-xl text-on-surface">
                {completedCoursesCount}
              </span>
              <span className="text-xs text-on-surface-variant mt-0.5">Completed</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-md flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-headline font-extrabold text-xl text-on-surface">
                {user.streak_days}
              </span>
              <span className="text-xs text-on-surface-variant mt-0.5">Day Streak</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-md flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="font-headline font-extrabold text-xl text-on-surface">
                {user.xp_points}
              </span>
              <span className="text-xs text-on-surface-variant mt-0.5">Total XP</span>
            </div>
          </div>

          {/* 3. My Study Decks & Progress Section */}
          <div className="rounded-3xl bg-surface-container-lowest border border-outline/10 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline/10">
              <div>
                <h2 className="font-headline font-extrabold text-xl text-on-surface">
                  My Study Decks & Completed Courses
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Review your AI-generated flashcards, retake quizzes, and level up your knowledge.
                </p>
              </div>

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>+ Create New Deck</span>
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-3xl bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto mb-4 border border-outline/10">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface mb-1">
                  No Study Decks Yet
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-6">
                  Paste your first lecture note on the homepage to generate 3D flashcards and quizzes!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Your First Deck (+50 XP)</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline/5 gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-headline font-bold text-base text-on-surface">
                          {course.title}
                        </h3>
                        {course.is_completed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold border border-secondary/20">
                            <CheckCircle className="w-3 h-3" />
                            Completed (+150 XP)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
                            <Clock className="w-3 h-3" />
                            In Progress (+50 XP)
                          </span>
                        )}
                        {course.quiz_score !== undefined && course.quiz_score !== null && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            Score: {course.quiz_score}/{course.quiz_questions_count}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(course.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {course.flashcards_count} Cards
                        </span>
                        <span>•</span>
                        <span>{course.quiz_questions_count} MCQs</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/courses/${course.id}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <span>{course.is_completed ? "Review Deck" : "Continue Studying"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
