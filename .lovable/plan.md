

## Plan: Class-wise Teaching Staff Directory

This is a large feature. Here's how we'll implement it across 4 phases.

### Current State
- **`teachers` table**: has `name`, `email`, `phone`, `subject`, `qualification`, `photo_url`, `joining_date`. No `assigned_classes` array, `experience`, `area_of_expertise`, `designation`, or `resume_url` columns.
- **`teacher_class_assignments` table**: junction table with `teacher_id`, `class_name`, `section`. Currently stores only ONE class per teacher.
- **`staff` table**: separate table for the public Staff page (teaching + non-teaching). Has `designation`, `qualification`, `area_of_expertise`, `experience`, `phone`, `email`, `photo_url`.
- **Admin form** (`AdminTeachers.tsx`): single class select, multi-subject select, photo crop. No designation, experience, expertise, or resume fields.
- **Public Staff page** (`Staff.tsx`): shows `staff` table data with Teaching/Non-Teaching filter. Does NOT show `teachers` table data.
- **Navbar**: Academic dropdown has Curriculum, Departments, Faculty, Time Table links.

### Phase 1: Database Migration

Add columns to the `teachers` table:
```sql
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS designation text DEFAULT '',
  ADD COLUMN IF NOT EXISTS area_of_expertise text DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience text DEFAULT '',
  ADD COLUMN IF NOT EXISTS resume_url text DEFAULT '';
```

No need for an `assigned_classes` array column -- we already have `teacher_class_assignments` as a junction table and will allow **multiple** class assignments per teacher (currently admin UI only saves one).

### Phase 2: Admin Teacher Form Updates (`AdminTeachers.tsx`)

- Add form fields: `designation`, `area_of_expertise`, `experience`
- Add resume file upload (stored in `site-assets` bucket under `resumes/`)
- Change "Assigned Class" from single `<Select>` to a **multi-select checkbox popover** (same pattern as subjects), saving multiple rows to `teacher_class_assignments`
- Update the save mutation to insert multiple `teacher_class_assignments` rows
- Update the query to fetch all assignments per teacher (not just the first one)
- Add these new columns to the table display

### Phase 3: Public Staff Page Redesign (`Staff.tsx`)

Completely redesign the `/staff` page:

- Fetch from **both** `teachers` (with `teacher_class_assignments`) and `staff` tables
- Add a "Teaching Staff by Class" section with 10 sub-sections (`id="1st-standard"` through `id="10th-standard"`)
- Each section shows teacher cards for that class
- Keep the existing "Non-Teaching Staff" section below using `staff` table data

**Card design**: Horizontal layout (photo left, details right) with:
- Photo (rounded, with ring)
- Name (bold), Designation, Qualification, Area of Expertise, Experience, Phone, Email
- Resume download link if available
- GraduationCap icon in bottom-right corner
- Subtle border + shadow

Add `useEffect` for hash-based smooth scrolling (consistent with existing pattern across the site).

### Phase 4: Navigation Dropdown (`Navbar.tsx`)

Update the "Academic" dropdown to include Faculty sub-links:
```
Academic
  ├── Curriculum        → /academics#curriculum
  ├── Departments       → /academics#departments
  ├── Time Table        → /academics#timetable
  ├── ── Faculty ──
  ├── 1st Standard      → /staff#1st-standard
  ├── 2nd Standard      → /staff#2nd-standard
  ├── ...
  └── 10th Standard     → /staff#10th-standard
```

Add a separator label "Faculty" and 10 class links beneath it.

### Additional
- Add `scroll-behavior: smooth` to `html` in `index.css` (if not already present)
- Update TypeScript types inline (no separate types file needed since we use Supabase generated types + inline interfaces)

### Files Modified
1. **Migration SQL** -- add 4 columns to `teachers`
2. **`src/pages/admin/AdminTeachers.tsx`** -- new fields, multi-class select, resume upload
3. **`src/pages/Staff.tsx`** -- complete redesign with class-wise sections
4. **`src/components/layout/Navbar.tsx`** -- Academic dropdown with faculty class links
5. **`src/index.css`** -- `scroll-behavior: smooth` on `html`

