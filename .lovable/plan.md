

## Plan: Enhance Homepage UI with Animations, Hover Effects & Interactivity

### Overview
Upgrade the homepage and key components with richer animations, hover effects, smooth transitions, and micro-interactions to make the site feel polished and engaging.

### Changes

#### 1. Hero Section Enhancements (`src/pages/Index.tsx`)
- Add a **dark gradient overlay** on hero images for better contrast
- Add **hero text content** (school name, tagline) with staggered fade-in animation over the slides
- Animate the **navigation arrows** with hover scale + glow effect
- Make dots have a smooth width transition animation

#### 2. Stats Cards — Animated Counters & Hover Effects (`src/pages/Index.tsx`)
- Add **counting animation** for stat numbers (animate from 0 to value on scroll)
- Add **hover lift effect** on stat cards: `hover:-translate-y-2 hover:shadow-xl` with smooth transition
- Add icon **spin/bounce** on card hover

#### 3. Program Cards — Interactive Hover (`src/pages/Index.tsx`)
- Add **colored top border** that animates in on hover
- Scale the icon up on hover with color transition
- Add a subtle **gradient background shift** on hover
- Add an **arrow indicator** that slides in from the right on hover

#### 4. Notice Cards — Slide-in & Hover (`src/pages/Index.tsx`)
- Add **left border accent** that appears on hover
- Slide the category badge with a subtle bounce
- Add hover background color transition

#### 5. CTA Section — Floating Animation (`src/pages/Index.tsx`)
- Add a subtle **floating/pulse animation** on the CTA button
- Add **particle/sparkle dots** in the background using CSS

#### 6. Navbar — Smooth Underline & Transitions (`src/components/layout/Navbar.tsx`)
- Replace plain background highlight with an **animated underline** on nav links (scale-x from center)
- Add **hover scale** on the logo
- Animate mobile menu open/close with **slide-down** transition using framer-motion

#### 7. Footer — Hover Animations (`src/components/layout/Footer.tsx`)
- Add **slide-right arrow** on quick links hover
- Add icon **color pulse** on contact items hover

#### 8. Tailwind Config — New Keyframes (`tailwind.config.ts`)
- Add keyframes: `float`, `shimmer`, `count-up`, `slide-in-left`
- Add corresponding animation utilities

#### 9. Global CSS Utilities (`src/index.css`)
- Add `.hover-lift` utility class for consistent card hover lift
- Add `.animated-underline` for nav link underlines
- Add `.glow-on-hover` for subtle glow effects on interactive elements

### Files to modify
- `src/pages/Index.tsx` — Hero overlay, counter animation, card hover effects, CTA enhancements
- `src/components/layout/Navbar.tsx` — Animated underlines, logo hover, mobile menu animation
- `src/components/layout/Footer.tsx` — Link hover arrows, icon animations
- `tailwind.config.ts` — New keyframes and animation utilities
- `src/index.css` — Global utility classes for hover/glow effects

