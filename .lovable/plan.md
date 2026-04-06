

## Plan: Remove Hover Announcement Ticker from Navbar

The blue-highlighted area is the hardcoded announcement ticker that appears between the top bar and the main navbar when hovering over dropdown menus. It shows items like "Admissions Open for 2026", "Annual Sports Day on 25 January", etc.

### Changes

**`src/components/layout/Navbar.tsx`**
- Remove the `announcementItems` array (lines ~79-84)
- Remove the `hoveredDropdown` state variable
- Remove the entire `<AnimatePresence>` block that renders the hover ticker (lines ~106-126)
- Remove `setHoveredDropdown` calls from `onMouseEnter`/`onMouseLeave` on nav items

One file, no database changes.

