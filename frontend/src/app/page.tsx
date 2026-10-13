"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { FlashcardDeck } from "@/components/flashcards/FlashcardDeck";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { api } from "@/lib/api";
import { CourseDetail, User as UserType } from "@/types";
import {
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  BrainCircuit,
  Trophy,
  ArrowRight,
  Flame,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [lectureText, setLectureText] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"concepts" | "flashcards" | "quiz">("concepts");
  const [generatedCourse, setGeneratedCourse] = useState<CourseDetail | null>(null);

  useEffect(() => {
    // Check if user is authenticated via JWT in localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("flashlearn_token") : null;
    if (token) {
      setIsAuthenticated(true);
      api
        .getProfile()
        .then((data) => setCurrentUser(data as UserType))
        .catch(() => {
          // Fallback user defaults to Soumaila
          setCurrentUser({
            id: "user-soumaila",
            email: "soumaila@flashlearn.ai",
            full_name: "Soumaila Diarra",
            is_active: true,
            xp_points: 150,
            level: 2,
            streak_days: 3,
            created_at: new Date().toISOString(),
          });
        });
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("flashlearn_token");
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setGeneratedCourse(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lectureText.trim().length < 50) {
      setError("Please paste at least 50 characters of lecture content for accurate AI extraction.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.generateCourse({
        title: courseTitle.trim() || "My Study Session",
        lecture_text: lectureText.trim(),
      });
      setGeneratedCourse(result as CourseDetail);
      setActiveTab("concepts");
    } catch (err: any) {
      setError(err.message || "Failed to process lecture notes. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface transition-colors">
      <Navbar
        isAuthenticated={isAuthenticated}
        userName={currentUser?.full_name || "Soumaila"}
        userStreak={currentUser?.streak_days || 3}
        userXp={currentUser?.xp_points || 150}
        onLogout={handleLogout}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 1. PUBLIC LANDING PAGE VIEW (Default when NOT authenticated)        */}
      {/* ------------------------------------------------------------------ */}
      {!isAuthenticated ? (
        <main className="flex-1 w-full">
          {/* Hero Section with Ambient Glows */}
          <section className="relative overflow-hidden py-16 sm:py-24 text-center px-4 sm:px-6">
            <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/15 blur-[120px] rounded-full" />
            <div className="pointer-events-none absolute top-20 right-10 w-72 h-72 bg-secondary/15 blur-[90px] rounded-full" />
            <div className="pointer-events-none absolute top-20 left-10 w-72 h-72 bg-tertiary/15 blur-[90px] rounded-full" />

            <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Revision in 3 Minutes a Day</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-headline text-4xl sm:text-6xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
                Turn Lecture Notes into <br />
                <span className="bg-gradient-to-r from-primary via-primary-container to-secondary bg-clip-text text-transparent">
                  Interactive Flashcards & Quizzes
                </span>
              </h1>

              <p className="font-body text-base sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-8 leading-relaxed">
                Paste an excerpt of your course. Our AI tutor extracts the 3 key concepts, builds smart 3D flashcards, and generates an instant quiz with feedback.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-container text-white font-headline font-bold text-base transition-all shadow-xl shadow-primary/25 hover:-translate-y-0.5 active:scale-95"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>Start Learning for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-4 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-headline font-semibold text-sm transition-colors border border-outline/10"
                >
                  Sign In with Account
                </Link>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-outline/10">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Simple & Fun Process
              </span>
              <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
                How FlashLearn AI Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-headline font-bold text-lg mb-6">
                  1
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
                  Paste Notes
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Drop lecture excerpts, textbook summaries, or lecture slides directly into the platform.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-headline font-bold text-lg mb-6">
                  2
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
                  AI Key Synthesis
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Gemini extracts the 3 core notions, analogies, and turns facts into interactive 3D flashcards.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-surface-container-lowest border border-outline/10 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center font-headline font-bold text-lg mb-6">
                  3
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
                  Gamified Quizzing
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  Test your active recall with immediate explanations, confetti celebrations, and streak XP.
                </p>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* ------------------------------------------------------------------ */
        /* 2. AUTHENTICATED USER VIEW (Deck Creator, 3D Flashcards & Quizzes)  */
        /* ------------------------------------------------------------------ */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Authenticated Welcome Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-outline/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold mb-2">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Student Study Session</span>
              </div>
              <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
                Welcome back, {currentUser?.full_name?.split(" ")[0] || "Soumaila"}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Paste your lecture text below to generate your 3 key concepts, flashcards & quiz.
              </p>
            </div>

            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors border border-outline/10"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>View Profile & Achievements</span>
            </Link>
          </div>

          {/* Form to paste course notes */}
          {!generatedCourse && (
            <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-outline/10">
              <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Course / Lecture Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Consensus & Raft Protocol"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Paste Lecture Excerpt (Minimum 50 characters)
                  </label>
                  <textarea
                    rows={7}
                    placeholder="Paste lecture notes or textbook extract here..."
                    value={lectureText}
                    onChange={(e) => setLectureText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface text-sm transition-all resize-y"
                    required
                  />
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
                  className="mt-2 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary hover:bg-primary-container text-white font-headline font-bold text-base transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Synthesizing Learning Cards with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Interactive Deck (+50 XP)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Generated Deck Review Screen */}
          {generatedCourse && (
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-headline font-bold text-2xl text-on-surface">
                    {generatedCourse.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {generatedCourse.key_concepts.length} Key Concepts •{" "}
                    {generatedCourse.flashcards.length} Flashcards •{" "}
                    {generatedCourse.quiz_questions.length} MCQs
                  </p>
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
                    3 Concepts
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
                    3D Flashcards
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
                    Interactive Quiz
                  </button>
                </div>
              </div>

              {/* Tab 1: 3 Key Concepts */}
              {activeTab === "concepts" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {generatedCourse.key_concepts.map((concept, idx) => (
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
                <FlashcardDeck flashcards={generatedCourse.flashcards} />
              )}

              {/* Tab 3: Gamified Quiz */}
              {activeTab === "quiz" && (
                <QuizRunner questions={generatedCourse.quiz_questions} />
              )}

              <div className="mt-12 text-center">
                <button
                  onClick={() => setGeneratedCourse(null)}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors underline"
                >
                  ← Paste New Lecture Notes
                </button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
