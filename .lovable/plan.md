

# Enhanced School Website with ADCET-Style Dropdown Navigation

## Overview
Upgrade the existing Shaheen School website with an ADCET-inspired dropdown navigation system and enriched homepage sections. The project already has most pages and content — the main work is adding hover dropdown menus to the navbar and polishing the homepage layout.

## What Changes

### 1. Navbar — Add Hover Dropdown Menus
Replace the current flat navigation links with dropdown-enabled menu items. On desktop, hovering over About, Academic, Gallery, Notice Board, Admission, or Contact reveals a styled dropdown panel with sub-links. Each sub-link scrolls to or navigates to the relevant section/page.

**Dropdown structure:**
```text
About         → School History, Vision & Mission, Principal Message, Staff
Academic      → Curriculum, Departments, Faculty, Time Table
Gallery       → Events, Sports, Cultural Programs, Campus Photos
Notice Board  → Latest Notices, Events, Announcements
Admission     → Admission Process, Eligibility, Fees Structure, Apply Online
Contact       → Address, Phone, Email, Google Map
```

- Desktop: CSS-driven hover dropdowns with smooth fade-in/slide-down animation
- Mobile: Accordion-style expand/collapse for each menu item
- Home link has no dropdown

### 2. Homepage — Add Missing Sections
The homepage already has Hero, Stats, About, Academics, Notices, and CTA. Add:
- **Gallery Preview** — 6-image grid with hover zoom effect, pulled from the gallery_images table
- **Contact Preview** — Address, email, phone, and a compact contact form at the bottom before footer

### 3. Footer — Add Social Media Icons
Add placeholder social media icon links (Facebook, Instagram, Twitter/X, YouTube) to the existing footer.

### 4. Homepage Hero — Add "Apply Now" Button
The hero currently has no text overlay or CTA. Add the school name, tagline, and an "Apply Now" button over the carousel.

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/layout/Navbar.tsx` | Modify | Add dropdown menus with hover behavior on desktop, accordion on mobile |
| `src/pages/Index.tsx` | Modify | Add Gallery preview grid and Contact preview section; add hero text overlay with Apply Now button |
| `src/components/layout/Footer.tsx` | Modify | Add social media icons |
| `src/index.css` | Modify | Add dropdown animation keyframes |

## Technical Details

- Dropdowns use a `group/hover` pattern: each nav item wraps a `<div className="group">` with the dropdown as a child that becomes visible on `group-hover`
- Animation: `opacity-0 translate-y-2 → opacity-100 translate-y-0` with `transition-all duration-200`
- Mobile: replace dropdowns with collapsible sections using existing framer-motion `AnimatePresence`
- Gallery preview reuses the existing `public-gallery` query, limited to 6 images
- Social icons use `lucide-react` (Facebook, Instagram, Twitter, Youtube)
- Sub-links for dropdown items like "School History" navigate to `/about#history` using hash anchors; corresponding section IDs will be added to About.tsx and other pages as needed

