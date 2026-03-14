
-- Teachers table
CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  subject text NOT NULL DEFAULT '',
  qualification text DEFAULT '',
  photo_url text DEFAULT '',
  joining_date date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read teachers" ON public.teachers FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage teachers" ON public.teachers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Students table
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  father_name text DEFAULT '',
  mother_name text DEFAULT '',
  class text NOT NULL DEFAULT '',
  section text DEFAULT '',
  roll_number text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  date_of_birth date,
  admission_date date DEFAULT CURRENT_DATE,
  photo_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read students" ON public.students FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
