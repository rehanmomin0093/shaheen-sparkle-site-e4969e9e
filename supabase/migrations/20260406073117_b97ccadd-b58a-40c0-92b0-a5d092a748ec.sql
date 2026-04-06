
-- Students can read their own attendance
CREATE POLICY "Students can read own attendance" ON public.attendance
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'user') AND EXISTS (
      SELECT 1 FROM public.students s WHERE s.id = student_id AND s.email = auth.jwt()->>'email'
    )
  );

-- Students can read their own results
CREATE POLICY "Students can read own results" ON public.student_results
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'user') AND EXISTS (
      SELECT 1 FROM public.students s WHERE s.id = student_id AND s.email = auth.jwt()->>'email'
    )
  );

-- Students can read their own physical data
CREATE POLICY "Students can read own physical data" ON public.student_physical_data
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'user') AND EXISTS (
      SELECT 1 FROM public.students s WHERE s.id = student_id AND s.email = auth.jwt()->>'email'
    )
  );
