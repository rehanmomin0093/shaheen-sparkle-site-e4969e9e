# Teacher Dashboard Features

## Overview
After login at `/staff-portal`, teachers see a dashboard with 3 main features — all filtered to their assigned class only.

## Database Changes

### 1. `teacher_class_assignments` table
- `teacher_id` (references teachers), `class_name`, `section`
- Admin assigns classes to teachers

### 2. `attendance` table
- `student_id` (references students), `date`, `status` (present/absent/late), `marked_by` (teacher user_id)
- Unique constraint on (student_id, date) — one entry per student per day

### 3. `student_results` table
- `student_id`, `exam_type` (Unit Test 1, Unit Test 2, Half Yearly, Annual), `subject`, `marks_obtained`, `total_marks`, `academic_year`
- Subjects: English, Hindi, Marathi, Math, Science, Social Studies

### 4. `student_physical_data` table
- `student_id`, `height_cm`, `weight_kg`, `recorded_date`, `recorded_by`

## UI Changes

### Teacher Dashboard (`/teacher-dashboard`)
After login, redirect to teacher dashboard with tabs:
- **Attendance**: Select date → shows student list for assigned class → mark Present/Absent/Late → save
- **Results**: Select exam type → shows student list → enter marks per subject → save
- **Student Data**: Shows student list → enter height/weight → save

### Admin Panel Update
- Add class assignment UI in AdminTeachers — assign class + section to each teacher

## RLS Policies
- Teachers can read students in their assigned class
- Teachers can insert/update attendance, results, and physical data for their assigned class
- Admins have full access

## Routes
- `/teacher-dashboard` — protected, requires teacher role
