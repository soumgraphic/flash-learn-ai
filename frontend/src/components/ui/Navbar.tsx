"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkles, BookOpen, User, Flame } from "lucide-react";

interface NavbarProps {
  userStreak?: number;
  userXp?: number;
}

export function Navbar({ userStreak = 1, userXp = 50 }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/80 border-b border-outline/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-extrabold text-lg tracking-tight text-on-surface">
              FlashLearn<span className="text-primary font-bold">.AI</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant -mt-1">
              Smart Study
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline/10">
          <Link
            href="/"
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-on-surface hover:text-primary transition-colors"
          >
            Create
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            My Decks
          </Link>
        </nav>

        {/* Gamified Stats & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>{userStreak} Day Streak</span>
          </div>

          {/* XP Pill */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold">
            <span>+{userXp} XP</span>
          </div>

          <ThemeToggle />

          <Link
            href="/login"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors border border-outline/10"
            title="Account Profile"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
