CREATE POLICY "Anyone can read class assignments"
  ON public.teacher_class_assignments
  FOR SELECT
  TO public
  USING (true);