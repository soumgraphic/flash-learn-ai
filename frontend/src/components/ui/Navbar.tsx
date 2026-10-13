"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkles, BookOpen, Flame, LogOut } from "lucide-react";

interface NavbarProps {
  userStreak?: number;
  userXp?: number;
  userName?: string;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export function Navbar({
  userStreak = 1,
  userXp = 50,
  userName = "Soumaila",
  isAuthenticated = false,
  onLogout,
}: NavbarProps) {
  // Extract initial: 'S' for Soumaila by default
  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : "S";

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/80 border-b border-outline/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
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
            {isAuthenticated ? "Study Deck" : "Home"}
          </Link>
          <a
            href="/#how-it-works"
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            How it works
          </a>
          {isAuthenticated && (
            <Link
              href="/profile"
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              My Progress
            </Link>
          )}
        </nav>

        {/* User Stats, Theming & Profile Avatar */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm">
                <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>{userStreak}d Streak</span>
              </div>

              {/* XP Pill */}
              <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold">
                <span>+{userXp} XP</span>
              </div>
            </>
          )}

          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Profile Avatar showing 'S' for Soumaila */}
              <Link
                href="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white font-headline font-extrabold text-base shadow-md shadow-primary/25 hover:scale-105 active:scale-95 transition-all border-2 border-white dark:border-surface"
                title={`${userName}'s Profile`}
              >
                {avatarLetter}
              </Link>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
