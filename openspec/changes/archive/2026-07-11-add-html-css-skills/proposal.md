# Proposal: add-html-css-skills

## Why

The catalog covers Vue, TypeScript, JavaScript, and Vite, but agents still lack curated guidance for the two foundational frontend layers: HTML (semantics, forms, accessibility) and CSS (modern layout, responsive design, animations). Users installing frontend skills expect these basics to be covered, and both are frequent sources of low-quality AI output (div-soup markup, inaccessible forms, brittle CSS).

## What Changes

- Add a new `html` category with three skills:
  - `skills/html/html-core/SKILL.md` — semantic HTML, document structure, metadata, media elements, modern attributes
  - `skills/html/html-forms/SKILL.md` — forms, validation, input types, autocomplete, FormData integration
  - `skills/html/html-a11y/SKILL.md` — accessibility: ARIA usage rules, landmarks, focus management, keyboard navigation
- Add a new `css` category with four skills:
  - `skills/css/css-core/SKILL.md` — modern CSS: custom properties, nesting, selectors, specificity/cascade layers, logical properties
  - `skills/css/css-layout/SKILL.md` — Flexbox and Grid patterns, container queries, intrinsic sizing
  - `skills/css/css-responsive/SKILL.md` — responsive design: fluid typography, media/container queries, mobile-first strategy
  - `skills/css/css-animations/SKILL.md` — transitions, keyframes, view transitions, scroll-driven animations, `prefers-reduced-motion`
- Update `bin/install.js` usage text to list the new categories (`--category` help line); discovery itself is dynamic and needs no code change.
- Update `README.md`: skills tables, category examples, list output example, roadmap.
- Extend Vitest coverage: installer tests for `--category html` and `--category css`, structure tests already discover new skills automatically.

## Capabilities

### New Capabilities

_None — new skills fit the existing catalog structure._

### Modified Capabilities

- `skill-catalog`: the Category layout requirement expands the allowed category list from `vue | typescript | javascript | vite` to also include `html` and `css` (both as nested-skill categories).

## Non-goals

- No changes to install/list CLI behavior or agent registry (`install-cli` spec unchanged).
- No preprocessor (Sass/Less), CSS-in-JS, Tailwind, or UI-framework skills — utility/framework styling can be a separate change.
- No restructuring of existing categories or skills.
- No new agents or install targets.

## Impact

- `skills/html/**`, `skills/css/**` — new published content (7 new SKILL.md files, optional `references/`).
- `bin/install.js` — help text only.
- `README.md` — public surface documentation.
- `test/skills-structure.test.mjs` — two new installer test cases.
- `openspec/specs/skill-catalog/spec.md` — category list requirement updated on archive.
- npm package size grows by the new markdown content; no dependency changes.
