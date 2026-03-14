
-- Create admin role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policy: admins can read all roles
CREATE POLICY "Admins can read roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: admins can manage roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Site content table (key-value for editable text/images)
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'text',
  section TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content" ON public.site_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site content" ON public.site_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Gallery images table
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gallery" ON public.gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery" ON public.gallery_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read notices" ON public.notices
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage notices" ON public.notices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

CREATE POLICY "Public read site-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');

CREATE POLICY "Admins upload site-assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update site-assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete site-assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- Seed default site content
INSERT INTO public.site_content (key, value, content_type, section) VALUES
  ('hero_title', 'Nurturing the Falcons of Tomorrow', 'text', 'hero'),
  ('hero_subtitle', 'Building character, knowledge, and excellence from nursery through higher secondary — where every student soars.', 'text', 'hero'),
  ('hero_image', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80', 'image_url', 'hero'),
  ('stat_years', '25+', 'text', 'stats'),
  ('stat_students', '3,000+', 'text', 'stats'),
  ('stat_faculty', '150+', 'text', 'stats'),
  ('stat_pass_rate', '98%', 'text', 'stats'),
  ('vision_text', 'To be a beacon of educational excellence, empowering every child to discover their potential and contribute meaningfully to society.', 'text', 'about'),
  ('mission_text', 'Providing holistic education that blends academic rigour with moral values, creative thinking, and physical fitness — fostering confident, compassionate leaders.', 'text', 'about'),
  ('values_text', 'Integrity, discipline, inclusivity, and a relentless pursuit of knowledge guide everything we do at Shaheen.', 'text', 'about'),
  ('school_name', 'Shaheen School & Shaheen High School', 'text', 'general'),
  ('school_address', '123 Education Lane, Bidar, Karnataka 585401', 'text', 'contact'),
  ('school_phone', '+91 8482 123456', 'text', 'contact'),
  ('school_email', 'info@shaheenschool.edu.in', 'text', 'contact');

-- Seed gallery images
INSERT INTO public.gallery_images (src, alt, category, sort_order) VALUES
  ('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80', 'Campus Building', 'Campus', 1),
  ('https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80', 'Campus Entrance', 'Campus', 2),
  ('https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80', 'Science Lab', 'Labs', 3),
  ('https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=600&q=80', 'Computer Lab', 'Labs', 4),
  ('https://images.unsplash.com/photo-1461896836934-bd45ba8fcaa7?w=600&q=80', 'Sports Ground', 'Sports', 5),
  ('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80', 'Cricket Match', 'Sports', 6),
  ('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80', 'Classroom', 'Classrooms', 7),
  ('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', 'Library', 'Classrooms', 8),
  ('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', 'Annual Day', 'Events', 9),
  ('https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80', 'Science Exhibition', 'Events', 10),
  ('https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80', 'Campus Aerial', 'Campus', 11),
  ('https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&q=80', 'Students in Class', 'Classrooms', 12);

-- Seed notices
INSERT INTO public.notices (title, category, date) VALUES
  ('Annual Day Celebration — Schedule Released', 'Events', '2026-03-10'),
  ('Mid-Term Exam Timetable 2025–26', 'Circulars', '2026-03-05'),
  ('Admissions Open for 2026–27 Academic Year', 'General', '2026-02-28');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
