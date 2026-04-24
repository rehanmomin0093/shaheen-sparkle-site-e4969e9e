ALTER TABLE public.cce_results ADD COLUMN IF NOT EXISTS sum_classwork numeric;
ALTER TABLE public.cce_subject_config ADD COLUMN IF NOT EXISTS max_sum_classwork numeric DEFAULT 0;