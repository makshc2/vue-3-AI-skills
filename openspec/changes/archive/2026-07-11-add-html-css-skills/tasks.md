# Tasks: add-html-css-skills

## 1. HTML skills content

- [x] 1.1 Create `skills/html/html-core/SKILL.md` — semantic elements, document structure/head metadata, media (`picture`, `srcset`, lazy loading), `dialog`/`details`, data attributes; frontmatter per design (name, description with triggers, license MIT, metadata.sources, compatibility)
- [x] 1.2 Create `skills/html/html-forms/SKILL.md` — input types, native validation, `autocomplete`, labels/fieldsets, FormData, submit patterns
- [x] 1.3 Create `skills/html/html-a11y/SKILL.md` — ARIA first rule, landmarks, headings, focus management, keyboard patterns, alt text, `prefers-*` hooks

## 2. CSS skills content

- [x] 2.1 Create `skills/css/css-core/SKILL.md` — custom properties, native nesting, `:is`/`:where`/`:has`, cascade layers, specificity, logical properties, units
- [x] 2.2 Create `skills/css/css-layout/SKILL.md` — Flexbox vs Grid decision rules, grid patterns, `subgrid`, container queries, intrinsic sizing
- [x] 2.3 Create `skills/css/css-responsive/SKILL.md` — mobile-first strategy, fluid typography with `clamp()`, media vs container queries, `dvh` viewport units; cross-link container query syntax to `css-layout`
- [x] 2.4 Create `skills/css/css-animations/SKILL.md` — transitions, `@keyframes`, compositor-friendly properties, View Transitions API, scroll-driven animations, `prefers-reduced-motion`

## 3. CLI help text

- [x] 3.1 Update `--category` line in `printUsage()` in `bin/install.js` to `vue | vite | javascript | typescript | html | css`

## 4. Tests

- [x] 4.1 Add installer test "installs html category to all agents" in `test/skills-structure.test.mjs` (mirror the javascript case, expect 3 `html-*` skills)
- [x] 4.2 Add installer test "installs css category to all agents" (expect 4 `css-*` skills)
- [x] 4.3 Extend folder-name frontmatter assertion to `html` and `css` categories; bump minimum discovered-skills count to account for 7 new skills

## 5. Documentation

- [x] 5.1 Add HTML and CSS skills tables to README.md Skills section
- [x] 5.2 Add "Frequently searched" entries and install examples for `--category html` and `--category css`
- [x] 5.3 Update README.md `list` output example, repository structure tree, and Roadmap

## 6. Verification

- [x] 6.1 Run `npm test` — all Vitest suites pass
- [x] 6.2 Run `node bin/install.js list` and confirm `html/` and `css/` categories appear with their skills
- [x] 6.3 Run `openspec validate add-html-css-skills --strict --type change` — passes
