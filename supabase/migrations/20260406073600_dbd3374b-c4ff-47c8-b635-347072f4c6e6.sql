
-- Tests table
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  test_type TEXT NOT NULL DEFAULT 'mcq' CHECK (test_type IN ('mcq', 'upload', 'both')),
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  section TEXT,
  total_marks NUMERIC(5,2) NOT NULL DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tests" ON public.tests
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage their tests" ON public.tests
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND created_by = auth.uid()
  ) WITH CHECK (
    has_role(auth.uid(), 'teacher') AND created_by = auth.uid()
  );

CREATE POLICY "Students can view tests for their class" ON public.tests
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'user') AND is_active = true AND EXISTS (
      SELECT 1 FROM public.students s WHERE s.email = auth.jwt()->>'email' AND s.class = class_name
    )
  );

-- Test questions (MCQ)
CREATE TABLE public.test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  marks NUMERIC(5,2) NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage questions" ON public.test_questions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage their test questions" ON public.test_questions
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.created_by = auth.uid()
    )
  ) WITH CHECK (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view questions for active tests" ON public.test_questions
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'user') AND EXISTS (
      SELECT 1 FROM public.tests t
      JOIN public.students s ON s.class = t.class_name AND s.email = auth.jwt()->>'email'
      WHERE t.id = test_id AND t.is_active = true
    )
  );

-- Test submissions
CREATE TABLE public.test_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',
  file_url TEXT,
  score NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(test_id, student_id)
);
ALTER TABLE public.test_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage submissions" ON public.test_submissions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view submissions for their tests" ON public.test_submissions
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Teachers can grade submissions" ON public.test_submissions
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view own submissions" ON public.test_submissions
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'user') AND EXISTS (
      SELECT 1 FROM public.students s WHERE s.id = student_id AND s.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Students can submit tests" ON public.test_submissions
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(), 'user') AND EXISTS (
      SELECT 1 FROM public.students s WHERE s.id = student_id AND s.email = auth.jwt()->>'email'
    )
  );
