

## Plan: Fix Public Faculty Page — Missing RLS Policy

### Root Cause

The public faculty page fetches from two tables:
1. `teachers` — has a public SELECT policy ("Anyone can read teachers") — works fine
2. `teacher_class_assignments` — has NO public SELECT policy, only policies for authenticated admins and teachers

When an unauthenticated visitor loads `/faculty`, the assignments query silently returns zero rows. Every teacher ends up with an empty `assigned_classes` array, so every class section shows "No teachers assigned."

### Fix

**Database Migration** — Add a public read policy to `teacher_class_assignments`:

```sql
CREATE POLICY "Anyone can read class assignments"
  ON public.teacher_class_assignments
  FOR SELECT
  TO public
  USING (true);
```

This is safe because the table only contains teacher_id, class_name, and section — no sensitive data. It mirrors the existing public SELECT policy on the `teachers` table.

### That's It

One migration, zero code changes. The existing query logic in `Staff.tsx` is correct — values like "4" in `class_name` match `CLASS_LABELS` values like "4". The only problem is RLS blocking the read.

