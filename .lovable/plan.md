

# Plan: Add "Class Teacher" Flag & Restrict Attendance to Class Teachers

## Summary
Add an `is_class_teacher` boolean to `teacher_class_assignments` so admins can mark one teacher per class/section as the "Class Teacher." Only class teachers can fill attendance.

## Database Changes

1. **Add column** to `teacher_class_assignments`:
   ```sql
   ALTER TABLE public.teacher_class_assignments 
     ADD COLUMN is_class_teacher BOOLEAN NOT NULL DEFAULT false;
   ```

2. **Update attendance RLS policies** — modify the INSERT and UPDATE policies for teachers to additionally require `tca.is_class_teacher = true`.

## Admin UI Changes (AdminTeachers.tsx)

3. In the teacher edit/add dialog, add a **"Class Teacher"** checkbox next to each assigned class (or a single toggle if only one class). When saving, store `is_class_teacher` per assignment row.

4. In the teachers table list, show a badge/indicator for class teacher assignments.

## Teacher Dashboard Changes (AttendanceTab.tsx)

5. Update `useTeacherAssignment` to also fetch `is_class_teacher` from `teacher_class_assignments`.

6. In the Attendance tab, check `is_class_teacher` — if false, show a message like "Only class teachers can mark attendance" and hide the attendance form.

## Technical Details

- The `is_class_teacher` flag lives on `teacher_class_assignments`, so a teacher can be class teacher for Class 4-A but not for Class 9-A.
- RLS ensures server-side enforcement — even if UI is bypassed, non-class-teachers cannot insert/update attendance.
- Existing assignment rows default to `false`, so no attendance disruption until admin explicitly sets class teachers.

