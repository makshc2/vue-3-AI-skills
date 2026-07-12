# Design: add-design-transfer-skill

## Context

The catalog has six categories (`vue`, `typescript`, `javascript`, `vite`, `html`, `css`). The installer discovers categories dynamically from `skills/`, so adding a category is content-only. Design-to-code work today has no skill coverage: agents either depend on a live Figma MCP session (which expires) or improvise from screenshots with no method, producing inconsistent transfers. The existing `html/*`, `css/*`, and `vue/*` skills cover the implementation layer but not the capture/mapping layer.

## Goals / Non-Goals

**Goals:**

- Ship a `design` category with 3 English production-quality skills that make design transfer source-independent: capture once into a durable design brief, implement from the brief.
- Define one intake contract (the design brief) shared by all sources: Figma MCP, exports, screenshots, photos.
- Cover the new category with installer tests and README docs.

**Non-Goals:**

- No orchestrator-kit pipeline changes (design-intake phase/gate is a separate change in the kit repo).
- No CLI logic changes (dynamic discovery handles the new category).
- No visual-regression tooling, no UI-kit-specific skills, no Figma token management.

## Skill Layout

`design` is a nested-skill category (like `javascript`):

```
skills/design/
├── design-transfer/
│   ├── SKILL.md
│   └── references/
│       ├── design-brief-template.md
│       └── token-extraction.md
├── design-from-screenshot/
│   └── SKILL.md
└── figma-intake/
    └── SKILL.md
```

### Frontmatter contract (every SKILL.md)

```yaml
---
name: <matches folder name, kebab-case>
description: <MUST state load triggers, e.g. "Load when transferring a design (Figma, screenshot, photo, PDF) to frontend code...">
license: MIT
metadata:
  sources:
    - <authoritative source URLs where applicable>
  version: "1.0.0"
compatibility: <e.g. "Any frontend stack; examples use Vue 3 + CSS custom properties">
---
```

Description length must exceed 40 chars and body must exceed 400 chars (enforced by structure tests). Body style follows existing skills: preferences bullet list, core principles, numbered topic sections.

### Skill scope

| Skill | Scope |
|-------|-------|
| `design-transfer` | The playbook: intake contract (design brief: structure, tokens, reference images, constraints), source-agnostic workflow (capture → brief → implement → verify), mapping brief to code (tokens → CSS custom properties, layout → grid/flex, components → SFC), structural QA checklist against reference images. Links to both sibling skills as intake paths. |
| `design-from-screenshot` | Vision-only intake: reading layout hierarchy from raster images, inferring spacing scale (4/8px grids), extracting palette and type scale, multi-breakpoint reasoning from separate images, handling low-quality photos, confidence markers for inferred values. |
| `figma-intake` | Using a Figma MCP server while access lasts: one-pass capture order (metadata → design context → variables → screenshots of key states), saving everything into the brief immediately, never re-querying Figma during implementation, degrading to `design-from-screenshot` when access fails. Tool-agnostic wording (any Figma MCP server, not one vendor). |

## Decisions

1. **New `design` category, not skills inside `css`/`vue`.** Design transfer is stack-agnostic and covers process + extraction, not CSS syntax. A separate category gives clean install filtering (`--category design`) for non-Vue users. Alternative — `vue/vue-design-transfer` — rejected: nothing Vue-specific in intake.
2. **Three skills, not one.** Load triggers differ: the playbook loads for any transfer task; screenshot extraction loads only for raster sources; figma-intake loads only when an MCP server is present. One mega-skill would exceed the actionable-SKILL.md size budget. Alternative — two skills (merge figma-intake into transfer) — viable fallback, rejected to keep the MCP-specific volatile content isolated.
3. **Design brief as the single contract.** All intake paths converge on one artifact shape (`design-brief.md` + `design-tokens` + `assets/` reference images) documented in `references/design-brief-template.md`. Implementation skills consume the brief, never the source. This removes the live-Figma dependency during apply.
4. **References hold the deep material.** The brief template and token-extraction checklist would bloat SKILL.md past ~250 lines; they live in `design-transfer/references/`, linked from the skill body. Sibling skills reference them by relative path within the installed skill tree — no duplication.
5. **No CLI changes.** `getCategories()` reads the filesystem; only the `--category` help text mentions `design`. Same approach as the html/css change.

## README / Test Impact

- **README.md**: add Design skills table, `--category design` install example, list-output example update, repository tree, roadmap entry.
- **test/skills-structure.test.mjs**: frontmatter/link tests pick up new skills automatically; extend the folder-name assertion to the `design` category; add an installer test `--category design --agent all` asserting all three `design-*` skills land in `.cursor/skills/`, `.agents/skills/`, `.claude/skills/`; bump minimum discovered-skills count (30 → 33).
- **package.json**: no changes.

## Risks / Trade-offs

- [Figma MCP servers differ in tool names] → figma-intake describes capture *goals* (context, variables, screenshots) rather than exact tool calls, with one vendor-neutral example.
- [Vision extraction accuracy varies by model] → design-from-screenshot mandates confidence markers (`~`) on inferred values and instructs verification against reference images before styling details.
- [Brief can drift from source if design iterates] → brief includes source metadata (file key, node ids, capture date) so re-intake is cheap and diffable.
- [Category proliferation] → mitigated: `design` has a distinct audience and triggers, same justification bar as `html`/`css`.
