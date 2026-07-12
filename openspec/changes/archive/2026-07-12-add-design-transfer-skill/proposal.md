# Proposal: add-design-transfer-skill

## Why

Agents transferring designs to frontend code depend on a live Figma MCP session that regularly expires (tokens/quota), and there is no playbook for other sources (screenshots, photos, PDF exports). Each session re-derives layout and tokens from scratch, producing inconsistent, low-fidelity results. The catalog needs a durable design-to-code workflow that works with or without Figma access.

## What Changes

- Add a new `design` category to the catalog (nested-skill category, like `javascript`).
- Add `skills/design/design-transfer/SKILL.md` — the core playbook: capture any design source (Figma MCP, exports, screenshots, photos) into a durable **design brief** artifact (structure, tokens, reference images, constraints), then implement from the brief — never from a live Figma session.
- Add `skills/design/design-from-screenshot/SKILL.md` — vision-only path: extracting layout, spacing scale, and tokens from raster images when no structured source exists.
- Add `skills/design/figma-intake/SKILL.md` — how to use a Figma MCP server *when it is available*: what to capture in one pass (context, variables, screenshots) before access expires, and how to degrade gracefully to the screenshot path.
- Add `references/` files for the brief template and token extraction checklist.
- Update `README.md` (design category table, install example) and installer tests (`--category design`).

## Capabilities

### New Capabilities

_None — the catalog structure and install behavior capabilities already exist; this change extends them._

### Modified Capabilities

- `skill-catalog`: category list gains `design`; the three design skills MUST exist with the standard frontmatter contract; installer-test and README coverage requirements gain design scenarios. (`install-cli` is untouched — its filter requirements are already category-generic.)

## Impact

- New files under `skills/design/` (content only; installer discovers categories dynamically — no CLI logic changes).
- `README.md`: new category table, install example, roadmap.
- `test/skills-structure.test.mjs`: folder-name assertion extended to `design`; new installer test for `--category design`; minimum skills count bump.
- `package.json`: no changes (`skills/` already packaged).

## Non-goals

- No changes to the agent-orchestrator-kit pipeline (design-intake phase/gate is a separate change in that repo).
- No visual-regression / screenshot-diff CI tooling.
- No stack-specific UI-kit skills (Vuetify, Tailwind, etc.).
- No automation of Figma token refresh — the skill treats access as ephemeral by design.
