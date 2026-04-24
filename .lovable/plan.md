# Add class selector to Results & Tests tabs

Right now the **Results** and **Tests** tabs auto-pick a single class assignment via `useTeacherAssignment()` (it just returns the first/preferred row). Teachers who teach multiple classes have no way to switch. The **CCE** and **Links** tabs already have a class selector — we'll mirror that same pattern.

## What changes

### 1. Results tab (`src/pages/teacher/ResultsTab.tsx`)
- Add a **Class / Section** dropdown at the top of the card (next to Exam Type and Academic Year).
- Populate it from `useTeacherAssignments()` (returns ALL assignments for the logged-in teacher).
- Auto-select the first assignment on load (prioritize the **Class Teacher** row, like CCE tab does).
- When the teacher switches class:
  - Student roster reloads for the new class/section.
  - Subject list filters to **only the subjects assigned to that specific class** (read from `assignment.subjects` of the selected row, not the global teacher subject list).
  - Existing marks for the new class load.
  - Total-marks config key updates (already keyed by class/section, so saved totals stay per-class).

### 2. Tests tab — Create Test dialog (`src/pages/teacher/TestsTab.tsx`)
- Add a **Class / Section** dropdown inside the Create Test dialog (above the Subject selector).
- Populate from `useTeacherAssignments()`.
- The Subject selector then shows **only the subjects assigned for the chosen class** (matching the screenshot: Class 9 → Urdu, Math; Class 8 → Urdu, Math).
- On submit, the test row stores the chosen `class_name` and `section` (currently it falls back to the single auto-picked assignment).
- The tests **list** below stays as-is (shows all tests created by this teacher across all classes — each row already shows class label).

### 3. Empty/edge states
- If teacher has **no assignments** → show the same friendly message that LinksTab shows ("No classes assigned…").
- If teacher has **only one assignment** → still show the dropdown (disabled-looking, single option) for consistency, OR just render a read-only label. We'll render it as a normal Select that's pre-selected — minimal noise.

## Technical notes

- **Hook reuse:** No new hooks needed. `useTeacherAssignments()` already exists and is used by CCETab/LinksTab.
- **Subject filtering helper:** small inline helper:
  ```ts
  const subjectsForAssignment = (a) =>
    (a?.subjects || "").split(",").map(s => s.trim()).filter(Boolean);
  ```
  Falls back to the full canonical subject list if the assignment has no subjects field set.
- **State key:** Replace the current `assignment` derivation with `selectedAssignmentId` + a memoized `selectedAssignment` lookup. All downstream queries (students, results, total-marks config) consume `selectedAssignment.class_name` / `.section`.
- **Reset on switch:** When `selectedAssignmentId` changes, reset the in-memory `marks` object (Results) and the `subject` field (Tests) so stale entries don't bleed across classes.
- **No DB changes, no migrations, no RLS changes** — all existing policies already key off `class_name`/`section` and `tca.subjects`.

## Files to edit
- `src/pages/teacher/ResultsTab.tsx`
- `src/pages/teacher/TestsTab.tsx`

## Out of scope
- Attendance, Physical Data tabs (already use `useTeacherAssignment` single-class — can be done in a follow-up if you want).
- Admin-side subject assignment UI (already exists).
