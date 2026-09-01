# Epic H — UI Component Review

## US-022 — Review the UI foundation component by component

**As the Product Owner,** I want a dedicated local component showroom so that I can review
and revise the visual foundation before it is reused by additional business screens.

### Acceptance Criteria

- Given the local admin app is running, when `/ui-kit` is opened, then a standalone review
  workspace appears without requiring business API data.
- Given the showroom is visible, when a component category is selected, then the page moves
  to a stable, linkable section for that category.
- Given a base component is shown, then its common variants and interaction states are shown
  together, including disabled, loading, invalid, empty or selected states when applicable.
- Given an interactive primitive is shown, when it is used by mouse or keyboard, then it uses
  the same exported base component that production screens consume.
- Given the showroom is viewed at 360 px, then controls remain readable, touch targets remain
  at least 44 px and the page has no horizontal overflow.
- Given a production build is served, then the review-only route is not exposed.

### Review Sequence

1. Foundation tokens: color, typography, spacing, radius and elevation.
2. Actions: buttons and loading buttons.
3. Fields: input, textarea, select and their validation states.
4. Selection: checkbox and radio group.
5. Data display: status badge, KPI card and table.
6. Feedback: loading, empty and error states.
7. Overlay: dialog and focus behavior.

### Out of Scope

- No new rental business workflow or backend endpoint.
- No rollout of revised styles to existing feature screens until each base component is
  reviewed by the Product Owner.
- No competing font or color palette is generated during showroom construction; the current
  approved design system is displayed as the starting point.
