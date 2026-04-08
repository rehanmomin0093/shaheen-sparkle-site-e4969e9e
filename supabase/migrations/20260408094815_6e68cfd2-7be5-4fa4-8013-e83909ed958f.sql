ALTER TABLE public.tests
ADD COLUMN question_file_url text DEFAULT NULL,
ADD COLUMN extracted_questions jsonb DEFAULT NULL;