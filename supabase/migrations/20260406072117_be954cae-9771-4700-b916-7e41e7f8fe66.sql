
-- 1. Teacher class assignments
CREATE TABLE public.teacher_class_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_class_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage assignments" ON public.teacher_class_assignments
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can read their assignments" ON public.teacher_class_assignments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.teachers t WHERE t.id = teacher_id AND t.email = auth.jwt()->>'email')
    OR has_role(auth.uid(), 'admin')
  );

-- 2. Attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can read attendance for assigned class" ON public.attendance
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );

CREATE POLICY "Teachers can insert attendance" ON public.attendance
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );

CREATE POLICY "Teachers can update attendance" ON public.attendance
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );

-- 3. Student results table
CREATE TABLE public.student_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('Unit Test 1', 'Unit Test 2', 'Half Yearly', 'Annual')),
  subject TEXT NOT NULL CHECK (subject IN ('English', 'Hindi', 'Marathi', 'Math', 'Science', 'Social Studies')),
  marks_obtained NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_marks NUMERIC(5,2) NOT NULL DEFAULT 100,
  academic_year TEXT NOT NULL DEFAULT '2025-26',
  entered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, exam_type, subject, academic_year)
);
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage results" ON public.student_results
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can read results for assigned class" ON public.student_results
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );

CREATE POLICY "Teachers can insert results" ON public.student_results
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );

CREATE POLICY "Teachers can update results" ON public.student_results
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );

-- 4. Student physical data table
CREATE TABLE public.student_physical_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, recorded_date)
);
ALTER TABLE public.student_physical_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage physical data" ON public.student_physical_data
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can read physical data for assigned class" ON public.student_physical_data
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );

CREATE POLICY "Teachers can insert physical data" ON public.student_physical_data
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );

CREATE POLICY "Teachers can update physical data" ON public.student_physical_data
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.teacher_class_assignments tca ON s.class = tca.class_name AND (tca.section IS NULL OR s.section = tca.section)
      JOIN public.teachers t ON t.id = tca.teacher_id AND t.email = auth.jwt()->>'email'
      WHERE s.id = student_id
    )
  );
