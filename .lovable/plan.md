
## Plan: File-Based Question Upload & AI Answer Sheet Grading

### Overview
Teachers upload a Word/PDF file with questions. AI extracts and displays questions. Students upload answer sheets (photo/PDF). AI compares answers against questions and assigns marks. Teachers can manually edit marks.

### Phase 1: Database Changes (Migration)

Add columns to `tests` table:
- `question_file_url` (text, nullable) — uploaded Word/PDF with questions
- `extracted_questions` (jsonb, nullable) — AI-extracted questions from the file

No new tables needed — `test_submissions` already has `file_url` and `score`.

### Phase 2: Edge Function — Extract Questions from File

**`supabase/functions/extract-questions/index.ts`**
- Teacher uploads Word/PDF to storage
- Edge function downloads the file, sends content to Lovable AI (Gemini)
- AI extracts questions with marks allocation
- Saves extracted questions as JSON to the `tests.extracted_questions` column
- Returns extracted questions to the UI

### Phase 3: Edge Function — Grade Answer Sheet

**Update `supabase/functions/grade-submission/index.ts`**
- When test has `question_file_url` (file-based test):
  - Fetch the extracted questions from `tests.extracted_questions`
  - Fetch the student's uploaded answer sheet URL
  - Send both to Gemini (multimodal — can read images/PDFs)
  - AI compares answers to questions and assigns marks per question
  - Save detailed grading breakdown in `test_submissions.answers`

### Phase 4: Admin/Teacher UI Updates

**`src/pages/teacher/TestsTab.tsx`**
- Add new test type option: "File Upload Questions" 
- Show file upload field (accept .pdf, .doc, .docx) when selected
- After upload, call extract-questions edge function
- Display extracted questions for teacher review
- In submissions view, show per-question marks breakdown
- Add editable score fields so teacher can override AI marks

### Phase 5: Student UI Updates

**`src/pages/student/StudentDashboard.tsx`**
- For file-based tests, show the extracted questions
- Show upload button for answer sheet (accept .pdf, .jpg, .png)
- After submission, show grading status and results when available

### Files Modified/Created
1. **Migration SQL** — add `question_file_url`, `extracted_questions` to `tests`
2. **`supabase/functions/extract-questions/index.ts`** — new edge function
3. **`supabase/functions/grade-submission/index.ts`** — update for file-based grading
4. **`src/pages/teacher/TestsTab.tsx`** — file upload UI, question review, mark editing
5. **`src/pages/student/StudentDashboard.tsx`** — view questions, upload answer sheet
