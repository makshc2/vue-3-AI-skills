# Design: add-html-css-skills

## Context

The catalog has four categories (`vue`, `typescript`, `javascript`, `vite`). The installer (`bin/install.js`) discovers categories dynamically by reading `skills/` — no hardcoded category list exists in logic, only in the `--category` help text. Structure tests (`test/skills-structure.test.mjs`) auto-discover skills and validate frontmatter and internal links; installer tests are per-category snapshots. This change adds two nested-skill categories (`html`, `css`) with 7 skills total, all content-only.

## Goals / Non-Goals

**Goals:**

- Ship 7 production-quality English SKILL.md files across `html` and `css` categories.
- Keep the existing single-format, multi-agent install flow untouched.
- Cover the new categories with installer tests and README docs.

**Non-Goals:**

- No CLI behavior changes (discovery already handles new categories).
- No Sass/Less, Tailwind, CSS-in-JS, or UI-framework skills.
- No changes to existing skills or categories.

## Skill Layout

Both categories are nested-skill categories (like `javascript`), not top-level skills (like `vite`):

```
skills/
├── html/
│   ├── html-core/SKILL.md
│   ├── html-forms/SKILL.md
│   └── html-a11y/SKILL.md
└── css/
    ├── css-core/SKILL.md
    ├── css-layout/SKILL.md
    ├── css-responsive/SKILL.md
    └── css-animations/SKILL.md
```

### Frontmatter contract (every SKILL.md)

```yaml
---
name: <matches folder name, kebab-case>
description: <MUST state load triggers, e.g. "Load for any .html file, semantic markup...">
license: MIT
metadata:
  sources:
    - <authoritative source URLs, e.g. MDN, W3C/WAI>
  version: "1.0.0"
compatibility: <baseline, e.g. "Modern evergreen browsers (Baseline 2024)">
---
```

Description length must exceed 40 chars and body must exceed 400 chars (enforced by structure tests). Follow the `javascript-core` body style: Preferences bullet list, Core Principles, then numbered topic sections with code examples.

### Skill scope

| Skill | Scope |
|-------|-------|
| `html-core` | Semantic elements, document structure/head metadata, media (`picture`, `srcset`, lazy loading), `dialog`/`details`, data attributes |
| `html-forms` | Input types, native validation, `autocomplete`, labels/fieldsets, FormData, submit patterns without JS frameworks |
| `html-a11y` | ARIA first rule (prefer native), landmarks, headings, focus management, keyboard patterns, alt text, `prefers-*` hooks |
| `css-core` | Custom properties, native nesting, selectors (`:is`, `:where`, `:has`), cascade layers, specificity, logical properties, units |
| `css-layout` | Flexbox vs Grid decision rules, common grid patterns, `subgrid`, container queries, intrinsic sizing (`min()`, `clamp()`, `fit-content`) |
| `css-responsive` | Mobile-first strategy, fluid typography with `clamp()`, media vs container queries, viewport units (`dvh`), responsive images coordination |
| `css-animations` | Transitions, `@keyframes`, compositor-friendly properties, View Transitions API, scroll-driven animations, `prefers-reduced-motion` |

`references/` folders are optional; add only if a topic needs deep material that would bloat SKILL.md past ~250 lines.

## Decisions

1. **Nested categories, not top-level skills.** `html` and `css` each need multiple focused skills (agents load smaller skills more reliably); mirrors `javascript`/`typescript` precedent. Alternative — single `skills/html/SKILL.md` like `vite` — rejected: too broad for one loadable unit.
2. **Three HTML / four CSS skills.** Split follows distinct load triggers (markup vs forms vs a11y; syntax vs layout vs responsive vs motion). Alternative — one `-core` per category — rejected: a11y and animations have different triggers and audiences.
3. **`html-a11y` lives in `html`, not a separate `a11y` category.** Most a11y work starts from markup; a standalone category with one skill adds catalog noise. Can be promoted later if WCAG-audit skills appear.
4. **No CLI logic changes.** `getCategories()` reads the filesystem; only the `--category` line in `printUsage()` is updated to mention `html | css`. Alternative — agent/category registry — unnecessary.

## README / Test Impact

- **README.md**: add HTML and CSS tables to the Skills section, add "Frequently searched" entries (`--category html`, `--category css`), update `list` output example, repository structure tree, and Roadmap checkboxes.
- **test/skills-structure.test.mjs**: frontmatter/link tests pick up new skills automatically; extend the folder-name assertion (`fm.name === folder`) to `html` and `css` categories; add two installer tests (`--category html`, `--category css`) mirroring the javascript/typescript ones; bump the minimum discovered-skills count.
- **package.json**: no changes (`skills/` already in `files`).

## Risks / Trade-offs

- [Content drift with evolving CSS platform (view transitions, scroll-driven animations)] → pin claims to Baseline status, cite MDN in `metadata.sources`, note experimental features explicitly.
- [Skill overlap: `css-responsive` vs `css-layout` container queries; `html-forms` vs `html-a11y` labels] → each skill owns one canonical section; the other cross-links with a single line ("see css-layout for container query syntax").
- [Package size growth] → markdown only, negligible; no action.

## Open Questions

None — scope is content-only and follows established category precedent.
