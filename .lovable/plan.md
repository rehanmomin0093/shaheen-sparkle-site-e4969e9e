

## Plan: Simplify Academic Dropdown — Move Standards Inside Faculty Page

### What Changes
Remove the 10 individual standard links from the Academic dropdown. Keep only a single "Faculty" link pointing to `/staff`, where all 10 standards are already displayed as sections on the page.

### File Changed

**`src/components/layout/Navbar.tsx`** (lines 36-51)

Replace the current Academic dropdown entries with:
```
Curriculum     → /academics#curriculum
Departments    → /academics#departments
Time Table     → /academics#timetable
Faculty        → /staff
```

Remove the 10 "Xth Standard" entries and the separator-style "── Faculty ──" label. Just a clean "Faculty" link.

One file, one small edit. The `/staff` page already has all 10 standard sections with proper IDs.

