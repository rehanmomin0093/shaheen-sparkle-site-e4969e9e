## Plan

Update the result-system numeric fields so they are typing-only inputs, without the browser up/down spinner controls shown in your screenshot.

### What I will change
1. Remove the spinner/stepper controls from numeric inputs in the CCE admin configuration screen.
2. Apply the same spinner-free input style to the result-entry numeric fields used by teachers, so the behavior is consistent across the result system.
3. Keep number validation intact, so users can still enter marks manually and invalid values are still prevented.

### Expected result
- Users will only see a clean input box.
- No up/down arrows will appear inside the field.
- Marks and max marks can still be typed normally.

### Technical details
- Update the shared/input class usage on `type="number"` fields to hide native browser spin buttons.
- If needed, add a reusable utility class so the same behavior is applied consistently in admin and teacher result forms.
- Verify the affected screens:
  - `src/pages/admin/AdminCCEConfig.tsx`
  - `src/pages/teacher/CCETab.tsx`

Approve this and I’ll implement it.