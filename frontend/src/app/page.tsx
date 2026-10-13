"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { FlashcardDeck } from "@/components/flashcards/FlashcardDeck";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { api } from "@/lib/api";
import { CourseDetail } from "@/types";
import { Sparkles, BookOpen, Layers, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [lectureText, setLectureText] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"concepts" | "flashcards" | "quiz">("concepts");
  const [generatedCourse, setGeneratedCourse] = useState<CourseDetail | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lectureText.trim().length < 50) {
      setError("Please paste at least 50 characters of lecture content for accurate AI extraction.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In guest mode, auto-register or use sample course generation
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
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Student Learning
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            Turn Raw Lectures into <br />
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              Interactive Flashcards & Quizzes
            </span>
          </h1>
          <p className="font-body text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto">
            Paste your lecture notes. Our AI tutor extracts the 3 key concepts, builds smart 3D flashcards, and generates an instant-feedback quiz.
          </p>
        </div>

        {/* Input Form Card */}
        {!generatedCourse && (
          <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-outline/10">
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Subject or Topic Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems & Concurrency"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Paste Lecture Notes / Course Excerpt
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste lecture text here (minimum 50 characters)..."
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
                    Extracting Concepts with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Study Deck (+50 XP)
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Study Deck Views (Concepts, Flashcards, Quiz) */}
        {generatedCourse && (
          <div className="w-full max-w-4xl mx-auto">
            {/* Session Header & Tab Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-headline font-bold text-2xl text-on-surface">
                  {generatedCourse.title}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {generatedCourse.key_concepts.length} Concepts • {generatedCourse.flashcards.length} Flashcards • {generatedCourse.quiz_questions.length} Quiz Questions
                </p>
              </div>

              {/* Navigation Tabs */}
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
                  Key Concepts
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
                  Quiz Mode
                </button>
              </div>
            </div>

            {/* TAB 1: 3 Key Concepts */}
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

            {/* TAB 2: Interactive Flashcards */}
            {activeTab === "flashcards" && (
              <FlashcardDeck flashcards={generatedCourse.flashcards} />
            )}

            {/* TAB 3: Gamified Quiz */}
            {activeTab === "quiz" && (
              <QuizRunner questions={generatedCourse.quiz_questions} />
            )}

            {/* Reset / Create Another Button */}
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
    </div>
  );
}
