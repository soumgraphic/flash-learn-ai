"use client";

import { useState } from "react";
import { Flashcard } from "@/types";
import { RotateCw, CheckCircle2, RefreshCw, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardDeckProps {
  flashcards: Flashcard[];
}

export function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-2xl">
        No flashcards available in this deck.
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const isMastered = masteredIds.has(currentIndex);

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const toggleMastered = () => {
    const updated = new Set(masteredIds);
    if (updated.has(currentIndex)) {
      updated.delete(currentIndex);
    } else {
      updated.add(currentIndex);
    }
    setMasteredIds(updated);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Progress Counter & Mastery Score */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <span className="text-sm font-bold text-on-surface-variant">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
          {masteredIds.size} Mastered
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 cursor-pointer perspective-1000 group select-none"
      >
        <div
          className={cn(
            "relative w-full h-full duration-500 transform-style-3d transition-transform rounded-3xl shadow-xl border border-outline/10",
            isFlipped ? "rotate-y-180" : ""
          )}
        >
          {/* Front Face (Prompt) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-surface-container-lowest p-8 flex flex-col justify-between border-2 border-primary/10 hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                Question
              </span>
              <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" /> Tap to Flip
              </span>
            </div>

            <p className="text-xl sm:text-2xl font-headline font-bold text-center text-on-surface px-4 leading-relaxed">
              {currentCard.front}
            </p>

            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              {currentCard.hint ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-amber-500 transition-colors font-medium"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {showHint ? currentCard.hint : "Show Hint"}
                </button>
              ) : (
                <span />
              )}
              <span className="font-semibold text-primary">Front Side</span>
            </div>
          </div>

          {/* Back Face (Answer / Explanation) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-surface-container to-surface-container-low p-8 flex flex-col justify-between border-2 border-secondary/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                Answer & Key Idea
              </span>
              <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                <RotateCw className="w-3.5 h-3.5" /> Tap to Flip Back
              </span>
            </div>

            <p className="text-base sm:text-lg font-body text-center text-on-surface px-4 leading-relaxed">
              {currentCard.back}
            </p>

            <div className="flex justify-center text-xs font-semibold text-secondary">
              Back Side
            </div>
          </div>
        </div>
      </div>

      {/* Review Actions & Navigation Buttons */}
      <div className="flex items-center justify-between w-full mt-6 gap-3">
        <button
          onClick={handlePrev}
          className="px-5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm transition-colors border border-outline/10"
        >
          Previous
        </button>

        <button
          onClick={toggleMastered}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border",
            isMastered
              ? "bg-secondary text-white border-secondary shadow-md shadow-secondary/20"
              : "bg-surface-container-low text-on-surface hover:text-secondary border-outline/10"
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          {isMastered ? "Mastered" : "Mark Mastered"}
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm transition-colors shadow-md shadow-primary/20"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}
