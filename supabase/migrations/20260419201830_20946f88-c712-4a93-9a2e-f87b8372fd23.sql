CREATE TABLE IF NOT EXISTS public.hero_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hero images"
ON public.hero_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage hero images"
ON public.hero_images
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed from existing site_content hero_image_* entries
INSERT INTO public.hero_images (image_url, sort_order)
SELECT value, (regexp_replace(key, 'hero_image_', ''))::int
FROM public.site_content
WHERE key LIKE 'hero_image_%' AND value <> ''
ON CONFLICT DO NOTHING;