

## Problem
Admission form submissions are saved to the database (`admission_inquiries` table), but there is no admin page to view, manage, or track them.

## Plan

### 1. Create Admin Admissions Page (`src/pages/admin/AdminAdmissions.tsx`)
- Fetch all rows from `admission_inquiries` table
- Display in a table with columns: Student Name, Parent Name, Phone, Email, Class, Message, Date
- Add delete functionality for individual inquiries
- Add Excel/CSV export (using `xlsx` library already installed)
- Add maximize/minimize dialog for viewing full inquiry details

### 2. Add Sidebar Link in `src/pages/admin/AdminLayout.tsx`
- Add "Admissions" link with `ClipboardList` icon to the sidebar navigation

### 3. Add Route in `src/App.tsx`
- Add `/admin/admissions` route pointing to the new page

### 4. Update Admin Dashboard (`src/pages/admin/AdminDashboard.tsx`)
- Add admission inquiry count card to the dashboard stats

