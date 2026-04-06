

## Plan: Remove Results Section from Homepage & Academic Dropdown

### Changes

**1. `src/pages/Index.tsx`**
- Remove the `sampleResults` array (lines ~34-38)
- Remove `resultRoll`, `resultClass`, `showResults` state variables (lines ~118-120)
- Remove the entire Results Section (lines ~316-354)
- Remove unused imports (`Search`, `Select`/`SelectItem` etc.) if no longer needed elsewhere

**2. `src/components/layout/Navbar.tsx`**
- Remove `{ label: "Results", to: "/academics#results" }` from the Academic dropdown links (line 41)

Two files changed, no database or backend changes needed.

