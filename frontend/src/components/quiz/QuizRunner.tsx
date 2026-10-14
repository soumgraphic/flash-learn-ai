"use client";

import { useState } from "react";
import { QuizQuestion } from "@/types";
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface QuizRunnerProps {
  questions: QuizQuestion[];
  courseId?: string;
  onFinish?: (score: number) => void;
  onCourseCompleted?: (awardedXp: number, totalXp: number, level: number) => void;
}

export function QuizRunner({
  questions,
  courseId,
  onFinish,
  onCourseCompleted,
}: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl">
        No quiz questions available.
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const hasAnswered = selectedOption !== null;

  const handleSelect = (index: number) => {
    if (hasAnswered) return; // Prevent double clicking
    setSelectedOption(index);

    if (index === currentQ.correct_option_index) {
      setScore((prev) => prev + 1);
    }
  };

  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (onFinish) onFinish(score);

      // If tied to a saved course, trigger backend completion and bonus XP with score
      if (courseId) {
        try {
          const res = await api.completeCourse(courseId, score);
          setCompletionMessage(res.message);
          if (onCourseCompleted) {
            onCourseCompleted(res.xp_awarded, res.total_xp, res.level);
          }
        } catch (e) {
          console.error("Failed to mark course complete:", e);
        }
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsCompleted(false);
    setCompletionMessage(null);
  };

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center text-center p-8 bg-surface-container-lowest rounded-3xl border border-outline/10 shadow-xl max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>
        <h3 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
          Quiz Completed! 🎉
        </h3>
        <p className="text-on-surface-variant text-sm mb-4">
          You scored <span className="font-extrabold text-primary">{score}</span> out of{" "}
          <span className="font-bold">{questions.length}</span> ({percentage}%)
        </p>

        {completionMessage && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/15 text-secondary text-xs font-bold border border-secondary/20 mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>{completionMessage}</span>
          </div>
        )}

        <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden mb-8">
          <div
            className="bg-secondary h-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-white font-bold transition-all shadow-md shadow-primary/20"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline/10 shadow-xl">
      {/* Quiz Progress & Score Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-bold text-on-surface-variant">
          Score: <strong className="text-primary">{score}</strong>
        </span>
      </div>

      {/* Question Headline */}
      <h3 className="font-headline font-bold text-lg sm:text-xl text-on-surface mb-6 leading-snug">
        {currentQ.question}
      </h3>

      {/* 4 Choices */}
      <div className="flex flex-col gap-3 mb-6">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correct_option_index;

          let optionStyle =
            "bg-surface-container-low hover:bg-surface-container text-on-surface border-outline/10";

          if (hasAnswered) {
            if (isCorrect) {
              optionStyle =
                "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
            } else if (isSelected) {
              optionStyle =
                "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-bold";
            } else {
              optionStyle = "opacity-50 border-outline/5";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={hasAnswered}
              className={cn(
                "flex items-center justify-between w-full p-4 rounded-2xl border text-left transition-all duration-200 text-sm font-medium",
                optionStyle
              )}
            >
              <span>{option}</span>
              {hasAnswered && isCorrect && (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              {hasAnswered && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Instant Feedback Explanation Drawer */}
      {hasAnswered && (
        <div className="p-4 rounded-2xl bg-surface-container border border-outline/10 mb-6 animate-fadeIn">
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
            Explanation
          </p>
          <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Next Question Button */}
      {hasAnswered && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm transition-all shadow-md shadow-primary/20"
          >
            {currentIndex + 1 < questions.length ? "Next Question" : "View Results"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
