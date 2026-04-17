
The user wants a UML use case diagram showing actors and their interactions with the school management system. Mermaid doesn't have native UML use case syntax, but I can produce a clean approximation using a flowchart with actors on the sides and use cases as ellipses (using `(...)` node shape) inside a system boundary subgraph.

Actors to include:
- Visitor (public)
- Applicant (admission inquiry)
- Student
- Teacher (with sub-cases gated by class teacher / subject assignment)
- Class Teacher (specialization of Teacher)
- Admin (whitelisted)
- System / Email Queue (secondary actor)

Key use cases grouped:
- Public: Browse pages, View notices, View gallery, View faculty, Submit admission inquiry
- Student: Login (roll no), View attendance, View results, Take MCQ test
- Teacher: Login (email), Mark attendance «class teacher only», Enter results «assigned subjects only», Create tests, Manage links, Update physical data
- Admin: Manage content, Manage gallery, Manage notices, Manage banners, Manage teachers, Assign classes & subjects, Mark class teacher, Manage students, Bulk import, Review admissions, Invite users
- System: Send emails, Process email queue

I'll use «include» / «extend» style labels on edges where relevant (e.g., attendance "extends" with class-teacher constraint).

## Plan

Create a single Mermaid use case-style diagram saved to `/mnt/documents/Use_Case_Diagram.mmd` and emit it as an artifact. Pure documentation — no code changes.

Structure:
- Left column: Visitor, Applicant, Student, Teacher, Class Teacher
- Right column: Admin, Email System
- Center subgraph "Shaheen School System" containing all use case ellipses
- Constraint notes on restricted use cases (class teacher, assigned subjects, whitelisted admin)
