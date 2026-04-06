

## Plan: Faculty Module Enhancements

Most of this feature is **already implemented**. The teachers table, admin form with multi-class/multi-subject selects, photo crop, resume upload, public staff page with class-wise grouping, navbar Faculty link, and smooth scrolling all exist. Here's what's actually new:

### What's Already Done
- Teachers table with designation, area_of_expertise, experience, resume_url columns
- `teacher_class_assignments` junction table for multi-class assignments
- Admin form with multi-class checkboxes, multi-subject select, photo crop, resume upload
- Public `/staff` page with teachers grouped by class (1st-10th Standard), horizontal cards with photo + details + resume link
- Academic dropdown with "Faculty" link in navbar
- `scroll-behavior: smooth` in CSS

### What's New / Missing

**1. Database: Add `id_number` column to `teachers` table**
- Add a text column `id_number` for storing teacher ID numbers (e.g., "T-001")

**2. Admin Form (`AdminTeachers.tsx`)**
- Add an "ID Number" input field to the form
- Add `id_number` to the TeacherForm interface and emptyForm
- Include in save mutation and edit population

**3. Public Staff Page (`Staff.tsx`)**
- Add ID number display to TeacherCard (show as first detail line before name)
- Reorder details to match requested order: ID, Name (bold), Designation, Qualification, Expertise, Experience, Phone, Email, Resume

**4. Route: Add `/faculty` as alias**
- Add a `/faculty` route in `App.tsx` pointing to the same Staff component
- Update the navbar "Faculty" link from `/staff` to `/faculty`

### Files Modified
1. **Migration SQL** — add `id_number` text column to `teachers`
2. **`src/pages/admin/AdminTeachers.tsx`** — add id_number field to form
3. **`src/pages/Staff.tsx`** — show id_number in card, reorder details
4. **`src/App.tsx`** — add `/faculty` route
5. **`src/components/layout/Navbar.tsx`** — update Faculty link to `/faculty`

