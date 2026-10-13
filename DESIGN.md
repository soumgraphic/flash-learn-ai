---
name: Lumina Learn
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#494454'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#7b7486'
  outline-variant: '#cbc3d7'
  surface-tint: '#6d3bd7'
  primary: '#6b38d4'
  on-primary: '#ffffff'
  primary-container: '#8455ef'
  on-primary-container: '#fffbff'
  inverse-primary: '#d0bcff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#b10e6b'
  on-tertiary: '#ffffff'
  tertiary-container: '#d23284'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3.5rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system establishes an approachable, distraction-free environment for modern digital learning. Designed for lightweight micro-learning, focus sprints, and interactive mini-courses, it balances playful warmth with high-clarity minimalism.

### Aesthetic Principles
- **Airy & Uncluttered:** Content breathes with generous negative space. Interfaces avoid deep nested menus, heavy toolbars, or visual noise.
- **Playfully Modern:** Vibrant candy accents signal progress, delight, and interactivity without overwhelming core readability.
- **Tactile Softness:** Generous curves, subtle 1px structural outlines, and pill-shaped interactive anchors create a tactile, welcoming interface.
- **Instant Comprehension:** High-contrast typography and clear visual affordances guide learners effortlessly through educational flows.

## Colors

The palette is anchored by a crisp white canvas paired with four distinct candy-tinted accents and clean slate neutrals.

### Roles & Accents
- **Canvas (`#FFFFFF`) & Surface Tint (`#F8FAFC`):** The foundation for maximum brightness and focus.
- **Primary Violet (`#8B5CF6`):** The primary interaction hue, used for focal CTAs, active states, and central progress metrics.
- **Mint Green (`#10B981`):** Represents success, completed tasks, streaks, and validation states.
- **Candy Pink (`#EC4899`):** Represents interactive badges, bonus milestones, and energetic moments of delight.
- **Sunny Yellow (`#F59E0B`):** Applied as an auxiliary accent for warnings, streaks, XP rewards, and tips.
- **Text & Neutral (`#1E293B` to `#64748B`):** Deep slate ensures AAA contrast on white backgrounds, while subtle borders leverage `#E2E8F0`.

## Typography

The type system blends the energetic curves of **Plus Jakarta Sans** for headlines and interactive elements with the utilitarian legibility of **Inter** for long-form instructional copy.

- **Headlines & Titles:** Set in Plus Jakarta Sans with weights ranging from 600 to 800. Generous line-heights prevent text-cramping during bite-sized lessons.
- **Body & Prompts:** Set in Inter at 400 and 500 weights for frictionless reading.
- **Badges & Labels:** Set in Plus Jakarta Sans (600/700) to reinforce playful clarity on buttons, pills, and reward chips.

## Layout & Spacing

The layout model prioritizes centered, focused content zones rather than complex multi-pane screens.

### Grid & Structure
- **Max Content Container:** Standard content containers span a comfortable max-width (e.g., `max-w-4xl` to `max-w-5xl`) centered on the viewport.
- **Fluid Grid Rhythm:** Mobile uses a single-column stack with `1rem` margins. Tablets scale to 2-column grids with `1.25rem` gutters. Desktop workflows expand into clean 3-column card layouts with `2rem` gutters.
- **Vertical Spacing:** Generous spacing (`space-lg` to `space-xl`) isolates lessons, quizzes, and modules to eliminate cognitive clutter.

## Elevation & Depth

Visual depth is achieved through high-contrast boundary definition rather than dramatic drop shadows.

- **Surface Contrast:** All primary cards rest on white (`#FFFFFF`) with a clean 1px border (`#E2E8F0` or `#F1F5F9`).
- **Subtle Ambient Shadows:** Surfaces use a soft, ambient blur: `box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05)`.
- **Hover Micro-Lifts:** Cards and primary buttons subtly shift upward on hover (`translate-y-[-2px]`) accompanied by a soft, color-tinted ambient glow derived from the element's accent hue (`rgba(139, 92, 246, 0.12)`).
- **Zero Heavy Overlays:** Modals and prompt dialogs use an airy frosted backdrop (`backdrop-blur-sm bg-slate-900/10`) to keep the session light and open.

## Shapes

The shape system adopts smooth, welcoming curves that reinforce an engaging educational mood.

- **Cards & Dialogs:** Standardized on `rounded-2xl` (1rem to 1.25rem corner radius).
- **Controls & Buttons:** Styled with `rounded-xl` or fully rounded pills (`rounded-full`) for quick action chips.
- **Progress Trackers:** Enclosed in continuous pill contours (`rounded-full`) to emphasize soft progression.

## Components

Standardized component treatments tuned for standard Tailwind CSS implementation:

### Buttons
- **Primary Action:** Solid candy violet (`bg-violet-500 hover:bg-violet-600 active:scale-[0.98] text-white rounded-xl font-semibold shadow-sm shadow-violet-200 transition-all`).
- **Secondary Action:** Mint or candy pink alternatives (`bg-emerald-500` or `bg-pink-500`), used when distinguishing alternate micro-actions like "Check Answer" or "Bonus Quest".
- **Ghost/Tertiary:** Soft tint (`bg-violet-50 text-violet-600 hover:bg-violet-100 rounded-xl`).

### Cards & Question Tiles
- **Default Tile:** Clean white background (`bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm`).
- **Interactive Option Card:** Includes hover feedback and clean selected state (`border-2 border-slate-100 hover:border-violet-200 cursor-pointer transition-all`). Active selection transforms border to `border-violet-500 bg-violet-50/30`.

### Chips & Badges
- **Pill Badges:** Petite status pills (`px-3 py-1 text-xs font-bold rounded-full`).
- **Streak & XP Counter:** Amber tint (`bg-amber-50 text-amber-600 border border-amber-200/60`).
- **Topic Tag:** Soft violet (`bg-violet-50 text-violet-600`).

### Checkboxes & Radio Buttons
- Custom square-rounded (`rounded-lg`) or circular checkboxes (`rounded-full`) with a 2px boundary (`border-slate-300`). Checked states transition dynamically to `bg-violet-500 border-violet-500` displaying a crisp white icon.

### Form Inputs
- Single-line inputs and quiz text boxes feature generous internal padding (`px-4 py-3`), clear placeholder styling, and a distinct focus ring: `border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 rounded-xl outline-none`.

### Progress Bars
- High-visibility track (`h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5`). Filled track utilizes rounded indicators (`bg-emerald-500 h-full rounded-full transition-all duration-500`).