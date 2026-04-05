

# Navigation, Z-Index Fix, Section Anchors & Public Staff Page

## Summary
Most navbar dropdown content is already correct. The main work is: fix the z-index layering between dropdowns and the news ticker, add section anchor IDs throughout pages, create a public Staff page, and add the `/staff` route.

## Changes

### 1. Navbar Z-Index Fix (`src/components/layout/Navbar.tsx`)
The hover-triggered announcement ticker (lines 118-144) sits between the navbar and dropdown menus, causing overlap. Fix by:
- Moving the inline news ticker below the header in DOM order
- Setting dropdown `z-[60]`, navbar header `z-[40]`, ticker `z-[10]`
- The dropdown containers already use `absolute z-50` — bump to `z-[60]` to guarantee they render above the ticker

### 2. Section Anchors on Index.tsx
Add `id` attributes to each major section so dropdown sub-links like `/#about` work:
- `id="about"` on About section
- `id="academics"` on Academic Highlights section
- `id="gallery"` on Gallery section
- `id="notices"` on Notice Board section
- `id="admissions"` on Admission section
- `id="contact"` on Contact section

Add a `useEffect` that reads `window.location.hash` on mount and scrolls to the matching element with `scrollIntoView({ behavior: 'smooth' })`.

### 3. Section Anchors on Sub-Pages
Add `id` attributes to About.tsx (`#history`, `#vision`, `#management`, `#staff`), Academics.tsx (`#curriculum`, `#departments`, `#faculty`, `#timetable`, `#results`), Admissions.tsx (`#process`, `#eligibility`, `#fees`, `#apply`), and NoticeBoard.tsx (`#latest`, `#announcements`, `#events`). Each page gets a `useEffect` for hash-based smooth scrolling.

### 4. Public Staff Page (`src/pages/Staff.tsx`)
New page fetching from the existing `staff` table (not `staff_members` — the table is called `staff`). Display a responsive card grid with:
- Photo (with fallback avatar)
- Name, designation, qualification
- Department/area of expertise
- Staff type badge (Teaching / Non-Teaching)
- Filter tabs: All, Teaching, Non-Teaching
- Hover-lift animation on cards

Uses TanStack React Query to fetch data. RLS already allows public reads.

### 5. Route Registration (`src/App.tsx`)
Add `/staff` route inside the Layout route group, import the new Staff page.

## Files

| File | Action |
|------|--------|
| `src/components/layout/Navbar.tsx` | Fix z-index on dropdown vs ticker |
| `src/pages/Index.tsx` | Add section `id` attributes + hash scroll effect |
| `src/pages/About.tsx` | Add section `id` attributes + hash scroll effect |
| `src/pages/Academics.tsx` | Add section `id` attributes + hash scroll effect |
| `src/pages/Admissions.tsx` | Add section `id` attributes + hash scroll effect |
| `src/pages/NoticeBoard.tsx` | Add section `id` attributes + hash scroll effect |
| `src/pages/Staff.tsx` | Create — public staff directory page |
| `src/App.tsx` | Add `/staff` route |

