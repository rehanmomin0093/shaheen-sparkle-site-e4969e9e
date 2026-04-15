
-- Add is_class_teacher column
ALTER TABLE public.teacher_class_assignments 
  ADD COLUMN is_class_teacher BOOLEAN NOT NULL DEFAULT false;

-- Drop existing teacher attendance policies
DROP POLICY IF EXISTS "Teachers can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can update attendance" ON public.attendance;

-- Recreate with is_class_teacher requirement
CREATE POLICY "Teachers can insert attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
    SELECT 1
    FROM students s
    JOIN teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
    JOIN teachers t ON t.id = tca.teacher_id AND t.email = (auth.jwt() ->> 'email'::text)
    WHERE s.id = attendance.student_id AND tca.is_class_teacher = true
  )
);

CREATE POLICY "Teachers can update attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
    SELECT 1
    FROM students s
    JOIN teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
    JOIN teachers t ON t.id = tca.teacher_id AND t.email = (auth.jwt() ->> 'email'::text)
    WHERE s.id = attendance.student_id AND tca.is_class_teacher = true
  )
);
