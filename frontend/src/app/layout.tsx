import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "FlashLearn AI — Transform Lecture Notes into Interactive Flashcards & Quizzes",
  description:
    "Paste lecture notes and let AI extract key concepts, 3D interactive flashcards, and instant-feedback gamified quizzes for students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-on-surface antialiased transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
