DROP POLICY IF EXISTS "Students can read own results" ON public.student_results;
CREATE POLICY "Students can read own published results"
ON public.student_results
FOR SELECT
TO authenticated
USING (
  published = true
  AND has_role(auth.uid(), 'user'::app_role)
  AND EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_results.student_id
    AND s.email = (auth.jwt() ->> 'email'::text)
  )
);