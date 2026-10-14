"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { FlashcardDeck } from "@/components/flashcards/FlashcardDeck";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { api } from "@/lib/api";
import { CourseDetail, User as UserType } from "@/types";
import {
  BookOpen,
  Layers,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"concepts" | "flashcards" | "quiz">("concepts");

  useEffect(() => {
    async function loadData() {
      const token = typeof window !== "undefined" ? localStorage.getItem("flashlearn_token") : null;
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [profileData, courseData] = await Promise.all([
          api.getProfile(),
          api.getCourse(courseId),
        ]);
        setCurrentUser(profileData as UserType);
        setCourse(courseData as CourseDetail);
      } catch (err: any) {
        console.error("Failed to load course details:", err);
        setError(err.message || "Failed to load study deck.");
      } finally {
        setIsLoading(false);
      }
    }

    if (courseId) {
      loadData();
    }
  }, [courseId, router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("flashlearn_token");
    }
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col">
        <Navbar isAuthenticated={true} />
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <h2 className="font-headline font-bold text-xl text-on-surface mb-2">Study Deck Not Found</h2>
          <p className="text-sm text-on-surface-variant mb-6">{error || "This course may have been removed or belongs to another account."}</p>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Profile</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface transition-colors">
      <Navbar
        isAuthenticated={true}
        userName={currentUser?.full_name || "Student"}
        userStreak={currentUser?.streak_days || 1}
        userXp={currentUser?.xp_points || 50}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Courses</span>
          </Link>

          <div className="flex items-center gap-2">
            {course.is_completed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold border border-secondary/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed (+150 XP)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>In Progress (+50 XP)</span>
              </span>
            )}
          </div>
        </div>

        {/* Title and stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-outline/10">
          <div>
            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
              {course.title}
            </h1>
            <div className="mt-1 flex items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(course.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>{course.key_concepts.length} Concepts</span>
              <span>•</span>
              <span>{course.flashcards.length} Flashcards</span>
              <span>•</span>
              <span>{course.quiz_questions.length} MCQs</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-2xl border border-outline/10">
            <button
              onClick={() => setActiveTab("concepts")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeTab === "concepts"
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Concepts
            </button>
            <button
              onClick={() => setActiveTab("flashcards")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeTab === "flashcards"
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Layers className="w-4 h-4" />
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeTab === "quiz"
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              Quiz
            </button>
          </div>
        </div>

        {/* Tab 1: Key Concepts */}
        {activeTab === "concepts" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {course.key_concepts.map((concept, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-6 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-headline font-extrabold text-sm flex items-center justify-center mb-4">
                    0{concept.order_index || idx + 1}
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                    {concept.title}
                  </h3>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
                    {concept.summary}
                  </p>
                </div>

                {concept.example && (
                  <div className="p-3.5 rounded-2xl bg-surface-container-low text-xs text-on-surface-variant border border-outline/5">
                    <strong className="text-secondary block mb-1">Analogy / Example:</strong>
                    {concept.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: 3D Flashcards */}
        {activeTab === "flashcards" && (
          <FlashcardDeck flashcards={course.flashcards} />
        )}

        {/* Tab 3: Interactive Quiz */}
        {activeTab === "quiz" && (
          <QuizRunner
            questions={course.quiz_questions}
            courseId={course.id}
            onCourseCompleted={(_awarded, totalXp, level) => {
              setCurrentUser((prev) =>
                prev ? { ...prev, xp_points: totalXp, level: level } : null
              );
              setCourse((prev) =>
                prev ? { ...prev, is_completed: true, xp_earned: (prev.xp_earned || 50) + 100 } : null
              );
            }}
          />
        )}
      </main>
    </div>
  );
}
