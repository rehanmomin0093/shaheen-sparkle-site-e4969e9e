
CREATE TABLE public.popup_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  link_url text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.popup_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active banners" ON public.popup_banners
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage banners" ON public.popup_banners
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
