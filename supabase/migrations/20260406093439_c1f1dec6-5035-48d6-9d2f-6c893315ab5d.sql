ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS designation text DEFAULT '',
  ADD COLUMN IF NOT EXISTS area_of_expertise text DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience text DEFAULT '',
  ADD COLUMN IF NOT EXISTS resume_url text DEFAULT '';
