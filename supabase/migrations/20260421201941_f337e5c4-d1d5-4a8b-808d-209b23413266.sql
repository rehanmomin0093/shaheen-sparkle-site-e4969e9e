
-- CCE Result System for Classes 1-8
-- Stores per-student per-subject per-semester component marks

CREATE TABLE public.cce_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL DEFAULT '2025-26',
  semester TEXT NOT NULL CHECK (semester IN ('1','2')),
  subject TEXT NOT NULL,
  -- Summative components (max marks fixed by class config; values nullable)
  sum_oral NUMERIC,
  sum_practical NUMERIC,
  sum_project NUMERIC,
  sum_assignment NUMERIC,
  sum_unit_test NUMERIC,
  sum_other NUMERIC,
  -- Formative components
  form_oral NUMERIC,
  form_written NUMERIC,
  -- Audit
  entered_by UUID,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year, semester, subject)
);

CREATE INDEX idx_cce_results_student ON public.cce_results(student_id);
CREATE INDEX idx_cce_results_lookup ON public.cce_results(academic_year, semester, subject);

-- Per-class subject + max-marks configuration (admin-editable)
CREATE TABLE public.cce_subject_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL CHECK (semester IN ('1','2')),
  max_sum_oral NUMERIC DEFAULT 0,
  max_sum_practical NUMERIC DEFAULT 0,
  max_sum_project NUMERIC DEFAULT 0,
  max_sum_assignment NUMERIC DEFAULT 0,
  max_sum_unit_test NUMERIC DEFAULT 0,
  max_sum_other NUMERIC DEFAULT 0,
  max_form_oral NUMERIC DEFAULT 0,
  max_form_written NUMERIC DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_name, subject, semester)
);

CREATE INDEX idx_cce_subject_config_class ON public.cce_subject_config(class_name);

-- Updated-at trigger
CREATE TRIGGER trg_cce_results_updated
BEFORE UPDATE ON public.cce_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.cce_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cce_subject_config ENABLE ROW LEVEL SECURITY;

-- cce_results policies
CREATE POLICY "Admins manage cce results"
  ON public.cce_results FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE POLICY "Teachers read cce results for assigned class"
  ON public.cce_results FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'teacher') AND EXISTS (
      SELECT 1 FROM students s
      JOIN teacher_class_assignments tca
        ON s.class = tca.class_name
       AND (tca.section IS NULL OR s.section = tca.section)
      JOIN teachers t ON t.id = tca.teacher_id
      WHERE s.id = cce_results.student_id
        AND t.email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Teachers insert cce results for their subject"
  ON public.cce_results FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(),'teacher') AND EXISTS (
      SELECT 1 FROM students s
      JOIN teacher_class_assignments tca
        ON s.class = tca.class_name
       AND (tca.section IS NULL OR s.section = tca.section)
      JOIN teachers t ON t.id = tca.teacher_id
      WHERE s.id = cce_results.student_id
        AND t.email = (auth.jwt() ->> 'email')
        AND (
          tca.is_class_teacher = true
          OR position(lower(cce_results.subject) in lower(coalesce(tca.subjects,''))) > 0
        )
    )
  );

CREATE POLICY "Teachers update cce results for their subject"
  ON public.cce_results FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(),'teacher') AND EXISTS (
      SELECT 1 FROM students s
      JOIN teacher_class_assignments tca
        ON s.class = tca.class_name
       AND (tca.section IS NULL OR s.section = tca.section)
      JOIN teachers t ON t.id = tca.teacher_id
      WHERE s.id = cce_results.student_id
        AND t.email = (auth.jwt() ->> 'email')
        AND (
          tca.is_class_teacher = true
          OR position(lower(cce_results.subject) in lower(coalesce(tca.subjects,''))) > 0
        )
    )
  );

CREATE POLICY "Students read own published cce results"
  ON public.cce_results FOR SELECT TO authenticated
  USING (
    published = true AND has_role(auth.uid(),'user') AND EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = cce_results.student_id
        AND s.email = (auth.jwt() ->> 'email')
    )
  );

-- cce_subject_config policies
CREATE POLICY "Admins manage cce subject config"
  ON public.cce_subject_config FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone can read cce subject config"
  ON public.cce_subject_config FOR SELECT TO public
  USING (true);

-- Seed default subject config for Classes 1-8 (Sem I & Sem II)
-- Standard CCE max marks (from uploaded sheet)
DO $$
DECLARE
  cls TEXT;
  subj TEXT;
  subjects TEXT[] := ARRAY['Urdu','Hindi','Marathi','English','Mathematics','Science','Social Science','Arts'];
  ord INT;
BEGIN
  FOREACH cls IN ARRAY ARRAY['1','2','3','4','5','6','7','8'] LOOP
    ord := 0;
    FOREACH subj IN ARRAY subjects LOOP
      ord := ord + 1;
      -- Semester 1: full Summative + Formative
      INSERT INTO public.cce_subject_config
        (class_name, subject, semester,
         max_sum_oral, max_sum_practical, max_sum_project, max_sum_assignment, max_sum_unit_test, max_sum_other,
         max_form_oral, max_form_written, sort_order)
      VALUES
        (cls, subj, '1', 10, 0, 10, 10, 10, 0, 10, 50, ord)
      ON CONFLICT DO NOTHING;
      -- Semester 2: only Formative (per uploaded sheet for Class 8)
      INSERT INTO public.cce_subject_config
        (class_name, subject, semester,
         max_sum_oral, max_sum_practical, max_sum_project, max_sum_assignment, max_sum_unit_test, max_sum_other,
         max_form_oral, max_form_written, sort_order)
      VALUES
        (cls, subj, '2', 0, 0, 0, 0, 0, 0, 10, 50, ord)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
