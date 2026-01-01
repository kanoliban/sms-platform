# Lu.ma Design Analysis

Systematic extraction of design patterns from 295 Lu.ma screenshots.

**Source:** `/Luma web Dec 2024/` (Mobbin export, Dec 2024)

---

## Analysis Framework

### Phase 1: Design System Extraction

| File | Purpose |
|------|---------|
| `design-system.md` | Colors, typography, spacing, shadows, border-radius |
| `components.md` | Buttons, cards, inputs, selects, modals, tooltips |
| `layouts.md` | Grid systems, container widths, responsive breakpoints |
| `micro-interactions.md` | Hover states, transitions, loading states, feedback |

### Phase 2: Flow Analysis

| File | Purpose |
|------|---------|
| `flows/event-creation.md` | Host creates event (steps, fields, UX) |
| `flows/event-page.md` | Public event page structure |
| `flows/rsvp-checkout.md` | Guest RSVP and payment |
| `flows/check-in.md` | Event day check-in experience |
| `flows/post-event.md` | Follow-up, photos, connections |

### Phase 3: SMS Adoption

| File | Purpose |
|------|---------|
| `sms-adoption.md` | What to adopt, adapt, or intentionally skip |

---

## Analysis Prompts

Use these when analyzing batches of 10-12 images:

### Design System Prompt
```
Analyze these Lu.ma screenshots. Extract:
1. Color palette (background, text, accent, borders) with hex values
2. Typography (font sizes, weights, line heights)
3. Spacing patterns (padding, margins, gaps)
4. Border radius values
5. Shadow styles

Output as markdown with CSS variable suggestions.
```

### Component Prompt
```
Analyze these Lu.ma screenshots. Identify:
1. Button variants (primary, secondary, ghost, sizes)
2. Card patterns (event cards, user cards, info cards)
3. Input styles (text, select, date picker, search)
4. Modal/dialog patterns
5. Navigation patterns

For each, describe structure and visual treatment.
```

### Flow Prompt
```
Analyze these Lu.ma screenshots showing [FLOW NAME]. Document:
1. Steps in the flow (numbered)
2. Key UI elements at each step
3. Information hierarchy
4. Error states / edge cases visible
5. What makes this flow feel polished

Output as a user journey with annotations.
```

---

## Batch Analysis Log

Track progress here:

| Batch | Images | Focus | Status |
|-------|--------|-------|--------|
| 1 | 01-10 | Landing/Discovery | Pending |
| 2 | 11-20 | Event Pages | Pending |
| ... | ... | ... | ... |

---

## Key Questions for SMS

As you analyze, consider:

1. **What makes Lu.ma feel premium?** (we want this)
2. **What's Lu.ma-specific vs universal good design?** (adopt universal)
3. **What would feel wrong for SMS's intimate vibe?** (skip these)
4. **What's missing for SMS's use case?** (innovate here)

---

## Output Target

Final deliverable: A design system and component library spec that the main dev session can implement incrementally.
