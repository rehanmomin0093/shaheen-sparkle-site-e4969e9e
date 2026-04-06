

## Plan: Faculty Module — Fix Data Synchronization

### Analysis

Almost everything requested is **already implemented**. The database schema, RLS policies, admin form with multi-class/multi-subject selects, photo crop, resume upload, public faculty page with class-wise grouping, navbar links, and smooth scrolling all exist and work correctly.

The **one real gap** is the connectivity issue: when an admin saves or deletes a teacher, only the `["admin-teachers"]` query is invalidated. The public faculty page uses `["public-teachers-with-classes"]` and `["public-non-teaching-staff"]` query keys, which are never invalidated. This means the public page won't refresh its cache until the user navigates away and back.

### Changes

**`src/pages/admin/AdminTeachers.tsx`** — Add cross-domain cache invalidation

1. In `saveMutation.onSuccess` (line 110): add `queryClient.invalidateQueries({ queryKey: ["public-teachers-with-classes"] })`
2. In `deleteMutation.onSuccess` (line 139): add `queryClient.invalidateQueries({ queryKey: ["public-teachers-with-classes"] })`

That's it — two lines added to one file. No database, RLS, routing, or component changes needed.

