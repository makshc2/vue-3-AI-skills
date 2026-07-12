# Tasks: add-design-transfer-skill

## 1. Category scaffolding and core skill

- [x] 1.1 Create `skills/design/design-transfer/SKILL.md` with frontmatter contract (name, trigger-rich description, license MIT, metadata.sources, version, compatibility) and the source-agnostic playbook body: intake contract, capture → brief → implement → verify workflow, token-to-CSS-custom-properties mapping, structural QA checklist
- [x] 1.2 Create `skills/design/design-transfer/references/design-brief-template.md` — full brief template (layout structure, tokens, reference images list, source metadata, constraints)
- [x] 1.3 Create `skills/design/design-transfer/references/token-extraction.md` — token extraction checklist (color, typography, spacing scale, radii, shadows, breakpoints)

## 2. Intake path skills

- [x] 2.1 Create `skills/design/design-from-screenshot/SKILL.md` — vision-only intake: layout hierarchy from raster, spacing-scale inference (4/8px), palette and type-scale extraction, multi-breakpoint reasoning, low-quality photo handling, mandatory confidence markers on inferred values
- [x] 2.2 Create `skills/design/figma-intake/SKILL.md` — one-pass MCP capture order (metadata → design context → variables → screenshots of key states), save-to-brief-immediately rule, no re-querying during implementation, fallback to design-from-screenshot on access failure; vendor-neutral wording

## 3. Docs and tests

- [x] 3.1 Update `README.md`: Design skills table, `--category design` install example, list output example, repository structure tree, roadmap
- [x] 3.2 Update `test/skills-structure.test.mjs`: extend folder-name assertion to `design`, add installer test `--category design --agent all` (three `design-*` skills in `.cursor/skills/`, `.agents/skills/`, `.claude/skills/`), bump minimum discovered-skills count to 33
- [x] 3.3 Update `--category` help text in `bin/install.js` `printUsage()` to mention `design` (no logic changes)

## 4. Verification

- [x] 4.1 Run `npm test` — all tests pass
- [x] 4.2 Run `npx openspec validate add-design-transfer-skill --strict --type change` — passes
