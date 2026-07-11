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

1. Choose category: `vue` | `typescript` | `javascript` | `vite`
2. Create `skills/<category>/<kebab-name>/SKILL.md`
3. Frontmatter: `name`, `description` (with load triggers), `license: MIT`
4. Body: preferences + rules; put depth in `references/`
5. If public surface changes — update `README.md`
6. If CLI discovery changes — update `test/` and run `npm test`
7. Use OpenSpec change: `/opsx:propose add-<skill-name>` (or `extend-<category>`)

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
