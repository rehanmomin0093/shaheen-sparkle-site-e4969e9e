
CREATE TABLE public.teacher_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT '',
  class_name TEXT NOT NULL,
  section TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all links"
ON public.teacher_links FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can manage their own links"
ON public.teacher_links FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) AND created_by = auth.uid())
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND created_by = auth.uid());

CREATE POLICY "Students can view links for their class"
ON public.teacher_links FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'user'::app_role) AND
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.email = (auth.jwt() ->> 'email'::text)
      AND s.class = teacher_links.class_name
      AND (teacher_links.section IS NULL OR s.section = teacher_links.section)
  )
);
