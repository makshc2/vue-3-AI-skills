---
name: project-conventions
description: Project conventions for frontend-agent-skills. Load when adding or editing published SKILL.md files, changing bin/install.js, or updating package surface. Ukrainian chat; English skill content.
---

# Project conventions — frontend-agent-skills

## Product vs orchestration

| Path | Purpose | In npm package? |
|------|---------|-----------------|
| `skills/` | Published agent skills for end users | yes |
| `bin/install.js` | Install CLI | yes |
| `.agents/` | OpenSpec + orchestrator (Amp/Cursor sync) | no |
| `openspec/` | Specs and changes | no |

## Adding a new published skill

1. Choose category: `vue` | `typescript` | `javascript` | `vite` | `html` | `css` | `design`
2. Create `skills/<category>/<kebab-name>/SKILL.md`
3. Frontmatter: `name`, `description` (with load triggers), `license: MIT`
4. Prefer `Use for…` over `MUST be used…` except for the primary `vue-core` skill
5. Heavy catalogs (`vueuse`, `vue-architecture`) → `disable-model-invocation: true` and keep out of the default install set in `bin/install.js`
6. Body: preferences + rules; put depth in `references/`; tell the agent to open only matching references
7. If public surface changes — update `README.md`
8. If CLI discovery / default set changes — update `test/` and run `npm test`
9. Use OpenSpec change: `/opsx:propose add-<skill-name>` (or `extend-<category>`)

## Default install (token-light)

`bin/install.js` without `--category` / `--skill` / `--all` installs only:
`vue-core`, `vue-pinia`, `vue-axios`, `vue-router`, `vue-composables`, `vue-testing`, `typescript-vue`, `typescript-core`, `vite`.

## Language

- Chat / AGENTS / OpenSpec artifacts: Ukrainian when `agent_language: uk`
- Published `SKILL.md` content: English

## Verify locally

```bash
npm test
npx openspec validate --all --strict
npx agent-orchestrator-kit status
```

## Do not

- Mix explore/propose/apply in one chat
- Put product skills only in `.agents/skills/`
- Edit `openspec/specs/` directly — only via `/opsx:archive`
