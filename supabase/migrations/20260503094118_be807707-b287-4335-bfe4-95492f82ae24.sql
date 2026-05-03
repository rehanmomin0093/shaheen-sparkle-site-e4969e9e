
CREATE TABLE public.infrastructure_facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  value_type TEXT NOT NULL DEFAULT 'text',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.infrastructure_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read infrastructure" ON public.infrastructure_facilities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage infrastructure" ON public.infrastructure_facilities
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_infrastructure_updated_at
  BEFORE UPDATE ON public.infrastructure_facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed defaults
INSERT INTO public.infrastructure_facilities (section, label, value, value_type, sort_order) VALUES
('Basic Information','School Name','',  'text', 1),
('Basic Information','Year of Establishment','', 'text', 2),
('Basic Information','Affiliation Board','', 'text', 3),
('Basic Information','Total Campus Area (sq. m)','', 'number', 4),
('Basic Information','Built-up Area (sq. m)','', 'number', 5),

('Academic Infrastructure','Total Classrooms','', 'number', 1),
('Academic Infrastructure','Smart Classrooms','', 'number', 2),
('Academic Infrastructure','Science Laboratories','', 'number', 3),
('Academic Infrastructure','Computer Lab','false', 'boolean', 4),
('Academic Infrastructure','Math Lab','false', 'boolean', 5),

('Sanitation Facilities','Boys Toilets','', 'number', 1),
('Sanitation Facilities','Girls Toilets','', 'number', 2),
('Sanitation Facilities','Staff Toilets','', 'number', 3),
('Sanitation Facilities','CWSN Friendly Toilet','false', 'boolean', 4),
('Sanitation Facilities','Drinking Water (RO)','false', 'boolean', 5),

('Library & Learning Resources','Library Available','true', 'boolean', 1),
('Library & Learning Resources','Total Books','', 'number', 2),
('Library & Learning Resources','Magazines & Journals','', 'number', 3),
('Library & Learning Resources','Digital Library','false', 'boolean', 4),

('Utilities & Safety','Electricity Backup','false', 'boolean', 1),
('Utilities & Safety','Fire Safety Equipment','false', 'boolean', 2),
('Utilities & Safety','CCTV Surveillance','false', 'boolean', 3),
('Utilities & Safety','Boundary Wall','false', 'boolean', 4),
('Utilities & Safety','First-Aid / Medical Room','false', 'boolean', 5),

('Sports & Additional Facilities','Playground','false', 'boolean', 1),
('Sports & Additional Facilities','Indoor Games','false', 'boolean', 2),
('Sports & Additional Facilities','Outdoor Sports','', 'text', 3),
('Sports & Additional Facilities','Auditorium / Hall','false', 'boolean', 4),
('Sports & Additional Facilities','Transport Facility','false', 'boolean', 5);
