
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_type text NOT NULL DEFAULT 'teaching',
  name text NOT NULL,
  designation text NOT NULL DEFAULT '',
  qualification text DEFAULT '',
  area_of_expertise text DEFAULT '',
  experience text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  photo_url text DEFAULT '',
  joining_date date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read staff" ON public.staff FOR SELECT TO public
  USING (true);
