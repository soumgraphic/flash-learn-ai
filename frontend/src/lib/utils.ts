import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional CSS classes and merges conflicting Tailwind classes.
 * Educational Note for Students:
 * Prevents class collision bugs (e.g. `p-4` being overwritten unpredictably by `p-6`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
