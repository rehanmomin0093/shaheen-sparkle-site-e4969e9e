

# Enhanced School Website — Full UI/UX Upgrade

## Overview
Apply all the requested enhancements to the existing React/Tailwind project. The codebase already has most pages and infrastructure — the work focuses on navbar refinements, homepage enrichments, new interactive sections, and polish.

## Changes

### 1. Navbar Updates (`src/components/layout/Navbar.tsx`)
- Remove "Principal Message" from About dropdown
- Add "Management" to About dropdown
- Add "Results" to Academics dropdown
- Remove dropdown from Contact (direct link only)
- Update Notice Board dropdown: "Latest Notices", "Announcements", "Upcoming Events"
- Add news ticker that appears inside dropdown panels (scrolling announcements)
- Add navbar color change on scroll (transparent → solid)
- Add hover glow effect on nav items

### 2. Homepage Enhancements (`src/pages/Index.tsx`)
- **Hero**: Add "Explore" button alongside "Apply Now", add parallax-style background effect, gradient overlay, staggered text animations
- **Academic Highlights**: Replace current 3-card layout with 5 cards (Departments, Smart Classrooms, Labs, Library, Sports) with hover-lift animations
- **Results Section**: New section with Roll Number + Class input fields and a sample results table
- **Admission Form**: New section with a simple application form (Name, Email, Phone, Class, Submit)
- **Gallery**: Add filter buttons (Events, Sports, Campus, Cultural) and lightbox popup on click
- **Notice Board**: Convert to vertical scrolling notice list
- **Back to Top**: Floating action button that appears on scroll

### 3. CSS Enhancements (`src/index.css`)
- Page loader animation (fade out on load)
- Floating animated shapes keyframes
- Ripple effect for buttons
- Parallax helper class
- Scroll reveal animation
- Glassmorphism utility class
- Back-to-top button styles

### 4. Layout Updates (`src/components/layout/Layout.tsx`)
- Add page loader overlay
- Add floating "Back to Top" button
- Add floating decorative shapes

### 5. Footer Enhancements (`src/components/layout/Footer.tsx`)
- Add "Latest Notices" column (pull 3 recent notices)
- Improve spacing and polish

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/Navbar.tsx` | Remove Principal Message, remove Contact dropdown, add Results to Academics, add Management to About, scroll color change, hover glow |
| `src/pages/Index.tsx` | Add Results section, Admission form, gallery filters/lightbox, vertical notice board, Explore button, parallax hero, academic highlights (5 cards), back-to-top |
| `src/index.css` | Loader, floating shapes, ripple, parallax, glassmorphism, scroll-reveal keyframes |
| `src/components/layout/Layout.tsx` | Page loader, back-to-top FAB, floating shapes |
| `src/components/layout/Footer.tsx` | Add latest notices column |

## Technical Details
- Parallax effect: CSS `background-attachment: fixed` on hero
- Lightbox: Simple modal state with full-screen image overlay using existing Dialog component
- Results section: Client-side only with sample data (no DB query needed)
- Scroll detection: `useEffect` with `window.addEventListener('scroll')` for navbar color change and back-to-top visibility
- Floating shapes: Absolute-positioned divs with CSS animation (rotate + float)
- Page loader: CSS overlay that fades out after 1s via `useEffect`

