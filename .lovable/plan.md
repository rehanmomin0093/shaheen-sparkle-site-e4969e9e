

# Shaheen School & Shaheen High School — Institutional Website

## Phase 1: Public Website (Pages & Design)

### 1. Global Layout
- **Sticky Navigation**: School logo + name, links to Home, About, Academics, Gallery, Notice Board, Admissions, Contact. Emerald/Gold color scheme with `backdrop-blur` navbar.
- **Footer**: Address, phone, email, social links, quick links grid.

### 2. Homepage
- **Hero Section**: Full-width campus image with serif headline *"Nurturing the Falcons of Tomorrow"*, CTA buttons for Admissions & Student Portal.
- **Stats Bar**: Key numbers (years est., students, faculty, results %) in emerald cards with gold text.
- **About Snippet**: Vision & mission in the "Ledger Grid" layout (label left, content right).
- **Academics Preview**: 3-column grid — Primary, Secondary, High School highlights.
- **Latest Notices**: 3 most recent notices with links to Notice Board page.

### 3. About Page
- School history, vision, mission, principal's message.
- Management/leadership profiles.

### 4. Academics Page
- Programs offered for Shaheen School & Shaheen High School (combined sections).
- Curriculum details, subjects, extracurricular activities.

### 5. Gallery & Infrastructure Page
- Filterable image gallery (Campus, Labs, Sports, Classrooms, Events).
- Infrastructure highlights with descriptions.

### 6. Notice Board & Downloads Page
- Vertical list of notices with dates, categories, and PDF download icons on hover.
- Filter by category (Circulars, Results, Events, General).

### 7. Contact Page
- School address with embedded map, phone numbers, email.
- General inquiry form.

---

## Phase 2: Backend & Admissions (Supabase)

### 8. Database Setup
- Tables: `notices`, `gallery_images`, `admission_inquiries`, `students`, `results`, `attendance`, `teachers`.
- User roles: `admin`, `teacher`, `student`.

### 9. Admissions Inquiry Form
- Parent/student details form (name, class applying for, phone, email, message).
- Submissions stored in database with email notification capability.

---

## Phase 3: Student Portal

### 10. Student Login
- Students log in with roll number + password.
- **Student Dashboard**: View results (subject-wise marks, percentage, rank), attendance summary (monthly/yearly), and performance trends (charts).

---

## Phase 4: Admin & Teacher Dashboard

### 11. Admin Panel
- Manage notices (create, edit, delete, upload PDFs).
- Manage gallery (upload images, categorize).
- View and export admission inquiries.
- Manage student records, create student accounts.

### 12. Teacher Panel  
- Upload/edit student results (class, subject, exam type).
- Mark daily attendance.
- View class performance summaries.

---

## Design System
- **Colors**: Deep Emerald (`162 85% 16%`) + Academic Gold (`38 92% 50%`) on warm white.
- **Typography**: Instrument Serif for headings, Geist for body text.
- **Layout**: 12-column "Ledger Grid" with generous spacing (`py-24`).
- **Motion**: Subtle `framer-motion` fade-up animations on scroll.
- **Radius**: 4px — sharp, institutional feel.

---

*We'll start with Phase 1 (the public-facing pages) to establish the design and content structure, then layer on the backend features.*

