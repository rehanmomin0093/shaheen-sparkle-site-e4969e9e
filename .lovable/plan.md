

## Plan: Simplify Attendance Status to Present/Absent Select

### What Changes

In `src/pages/teacher/AttendanceTab.tsx`, replace the cycling toggle button with a Select dropdown showing only two options: "Present" and "Absent". Remove the "Late" status entirely.

### Changes in `src/pages/teacher/AttendanceTab.tsx`

1. **Change the `Status` type** from `"present" | "absent" | "late"` to `"present" | "absent"`
2. **Remove** the `toggleStatus` function and the `lateCount` variable
3. **Remove** the Late badge from the summary
4. **Replace** the ghost button in the Status column with a `<Select>` component (from shadcn/ui) with two `<SelectItem>` options: "Present" (green) and "Absent" (red)
5. **Update imports**: add `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` — remove `Clock` icon

One file changed, no database or backend changes.

