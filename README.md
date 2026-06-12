# frontend-agent-skills

**Vue 3 · JavaScript · Vite AI agent skills for [Cursor](https://cursor.sh), [Amp Code](https://ampcode.com), and [Claude Code](https://docs.anthropic.com/en/docs/claude-code)**

[![npm version](https://img.shields.io/npm/v/frontend-agent-skills)](https://www.npmjs.com/package/frontend-agent-skills)
[![npm downloads](https://img.shields.io/npm/dm/frontend-agent-skills)](https://www.npmjs.com/package/frontend-agent-skills)
[![license](https://img.shields.io/npm/l/frontend-agent-skills)](./LICENSE)
[![github stars](https://img.shields.io/github/stars/makshc2/vue-3-AI-skills?style=social)](https://github.com/makshc2/vue-3-AI-skills)

> **Looking for Cursor skills for Vue? JavaScript agent skills? Amp or Claude Code rules?**  
> Install production-ready `SKILL.md` files for your AI coding agent in one command:

```bash
npx frontend-agent-skills install
```

Curated **AI agent skills** for **Vue 3**, **JavaScript**, and **Vite** frontend development. Works with **Cursor IDE**, **Amp Code**, and **Claude Code** — the same skills, installed to `.cursor/skills/`, `.agents/skills/`, or `.claude/skills/`.

Gives your AI agent deep knowledge of Vue 3 Composition API, JavaScript ES2020+, Vite, Pinia, Vue Router, VueUse, Vitest, and more — so it writes idiomatic, production-ready code out of the box.

| Install | Links |
|---------|-------|
| `npx frontend-agent-skills install` | [npm package](https://www.npmjs.com/package/frontend-agent-skills) · [GitHub repo](https://github.com/makshc2/vue-3-AI-skills) · [Report issue](https://github.com/makshc2/vue-3-AI-skills/issues) |

> **Migrating from `vue-cursor-skills`?** Renamed in v2.0.0 — same skills, clearer name. Old CLI alias still works.

### Supported AI Agents

| Agent | Skills directory | Search terms |
|-------|-----------------|--------------|
| [Cursor](https://cursor.sh) | `.cursor/skills/` | cursor skills, cursor rules, cursor vue skills |
| [Amp](https://ampcode.com) | `.agents/skills/` | amp skills, amp code skills, amp agent skills |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `.claude/skills/` | claude code skills, claude agent skills |

All agents use the same `SKILL.md` format — skills are written once and installed to the correct directory for each agent.

---

## Frequently searched

<details>
<summary><strong>Cursor skills for Vue 3</strong></summary>

```bash
npx frontend-agent-skills install --agent cursor --category vue
```

Installs: `vue-core`, `vue-pinia`, `vue-router`, `vue-testing`, `vueuse`, `vue-composables`, `vue-debug`, `vue-axios`, `vue-architecture`.
</details>

<details>
<summary><strong>JavaScript skills for AI agents</strong></summary>

```bash
npx frontend-agent-skills install --category javascript
```

Installs: `javascript-core`, `javascript-dom`, `javascript-debug`, `javascript-node`, `javascript-testing`, `javascript-performance`, `javascript-data`.
</details>

<details>
<summary><strong>Amp Code skills</strong></summary>

```bash
npx frontend-agent-skills install --agent amp
```

Copies skills to `.agents/skills/` — Amp's native skills directory.
</details>

<details>
<summary><strong>Claude Code skills</strong></summary>

```bash
npx frontend-agent-skills install --agent claude
```

Copies skills to `.claude/skills/` — use as slash commands or auto-loaded skills.
</details>

<details>
<summary><strong>Install all agents at once</strong></summary>

```bash
npx frontend-agent-skills install --agent all
```

</details>

---

## Skills

### Vue 3

| Skill | Description |
|-------|-------------|
| `vue-core` | Vue 3 Composition API, `<script setup>`, reactivity, SFC, data flow, composables, performance |
| `vue-pinia` | Pinia setup stores, storeToRefs, actions, plugins, SSR, testing, gotchas |
| `vue-router` | Vue Router 4 guards, navigation patterns, route lifecycle, gotchas |
| `vue-testing` | Vitest + Vue Test Utils + Playwright E2E, async patterns, Pinia mocking |
| `vueuse` | 200+ VueUse composable utilities with invocation rules |
| `vue-composables` | Library-grade composables with `MaybeRef`/`MaybeRefOrGetter` patterns |
| `vue-debug` | Runtime errors, warnings, hydration issues, SSR debugging guide |
| `vue-axios` | Axios HTTP client patterns for Vue 3 projects |
| `vue-architecture` | Enterprise Vue 3 architecture: structure, state, API layer, routing, layouts, permissions, DX, team standards |

### Vite

| Skill | Description |
|-------|-------------|
| `vite` | Vite config (`defineConfig`, env vars, proxy, aliases), plugin API (hooks, virtual modules, ordering), build (library mode, multi-page, chunking), SSR, Environment API (v6+), Rolldown migration (v8) |

### JavaScript

| Skill | Description |
|-------|-------------|
| `javascript-core` | Modern ES2020+ best practices: declarations, naming, strict equality, functions, destructuring, async/await & Promise APIs, immutability, array methods, ES modules, error handling |
| `javascript-dom` | Vanilla DOM: selectors, event delegation, safe HTML (no innerHTML XSS), forms & FormData, Intersection/Resize/Mutation observers, layout performance, cleanup |
| `javascript-debug` | Language pitfall catalog: `this` binding, closures in loops, TDZ, floating point, reference equality, coercion, mutation, microtasks vs macrotasks, async traps, JSON losses |
| `javascript-node` | Node.js ≥18: `node:` builtins, fs/promises, env config, CLI with parseArgs, streams & pipeline, child processes, AbortSignal timeouts, graceful shutdown, worker threads |
| `javascript-testing` | Vitest for plain JS: AAA structure, matchers, vi.fn/spyOn/mock, fake timers, async rejects/resolves, it.each, setup/teardown, what not to test |
| `javascript-performance` | Debounce/throttle, memoization, rAF/idle scheduling, Web Workers, memory leak prevention, Map/Set in hot loops, lazy loading, measuring with Performance API |
| `javascript-data` | Dates & time zones, Intl formatting (currency, plurals, lists, collation), JSON gotchas, structuredClone, regex best practices, Map/Set/WeakMap collections |

---

## Installation

### Option 1: npx — no install required (recommended)

```bash
npx frontend-agent-skills install
```

You will be prompted to choose your agent(s):

```
? Install skills for which agent(s)?

  1) Cursor (default)
  2) Amp
  3) Claude Code
  4) All (Cursor + Amp + Claude Code)

Choose [1-4] (press Enter for Cursor):
```

Press **Enter** to skip — defaults to **Cursor**.

Skip the prompt in CI or scripts:

```bash
npx frontend-agent-skills install --yes
# or
FRONTEND_AGENT_SKILLS_AGENT=amp npx frontend-agent-skills install
```

#### Specify agent directly (no prompt)

```bash
npx frontend-agent-skills install --agent cursor        # Cursor only
npx frontend-agent-skills install --agent amp            # Amp only
npx frontend-agent-skills install --agent claude         # Claude Code only
npx frontend-agent-skills install --agent cursor --agent amp   # multiple agents
npx frontend-agent-skills install --agent all            # all supported agents
```

#### Filter by category or specific skills

```bash
npx frontend-agent-skills install --category vue
npx frontend-agent-skills install --category javascript
npx frontend-agent-skills install --skill vue-core --skill javascript-core --skill vite
```

#### Combine agent + category/skill filters

```bash
npx frontend-agent-skills install --agent amp --category vue
npx frontend-agent-skills install --agent all --skill vue-core --skill vite
```

#### Install into a specific project

```bash
npx frontend-agent-skills install --target /path/to/my-project
```

### Option 2: npm install as devDependency

```bash
npm install --save-dev frontend-agent-skills
```

Add to `package.json`:

```json
{
  "scripts": {
    "skills:install": "frontend-agent-skills install",
    "skills:install:all": "frontend-agent-skills install --agent all"
  }
}
```

Then run:

```bash
npm run skills:install
```

### Option 3: Global install

```bash
npm install -g frontend-agent-skills
frontend-agent-skills install
```

### Option 4: Manual

Copy any folder from `skills/` directly into your agent's skills directory:

| Agent | Copy to |
|-------|---------|
| Cursor | `.cursor/skills/<skill-name>/` |
| Amp | `.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` |

---

## After Installation

Skills are copied to the appropriate directory for your chosen agent(s). **Restart the agent** to activate them.

Example structure after installing for all agents:

```
your-project/
├── .cursor/skills/       ← Cursor
│   ├── vue-core/
│   ├── javascript-core/
│   ├── vite/
│   └── ...
├── .agents/skills/       ← Amp
│   ├── vue-core/
│   ├── javascript-core/
│   ├── vite/
│   └── ...
└── .claude/skills/       ← Claude Code
    ├── vue-core/
    ├── javascript-core/
    ├── vite/
    └── ...
```

---

## Usage

After installation, skills are automatically available in your agent. For best results, reference skills explicitly in your prompt:

**Cursor:**
```
Use vue-core skill, create a dashboard component with real-time data updates
Use javascript-core skill, refactor this module to ES modules with async/await
Use vite skill, configure proxy and path aliases for my Vue project
```

**Amp:**
```
Use the vite skill to create a Vite plugin that injects build metadata
Use vue-pinia skill, set up an auth store with SSR support
Use javascript-debug skill, why does this async loop not await?
```

**Claude Code:**
```
/vue-core create a dashboard component with real-time data updates
/javascript-core refactor this file to modern ES2020+ patterns
/vite configure proxy and path aliases for my Vue project
```

Alternatively, add to your project's configuration:

| Agent | File | Example |
|-------|------|---------|
| Cursor | `.cursor/rules/` | `Always load vue-core, javascript-core, and vite skills for frontend work.` |
| Amp | `AGENTS.md` | `Always load vue-core, javascript-core, and vite skills for frontend work.` |
| Claude Code | `CLAUDE.md` | `Always load vue-core, javascript-core, and vite skills for frontend work.` |

---

## List Available Skills

```bash
npx frontend-agent-skills list
```

Output:
```
  📁 vue/
      - vue-core
      - vue-pinia
      ...
  📦 vite
  📁 javascript/
      - javascript-core
      - javascript-data
      - javascript-debug
      - javascript-dom
      - javascript-node
      - javascript-performance
      - javascript-testing
  📁 typescript/  (empty — coming soon)

  Supported agents: Cursor (cursor), Amp (amp), Claude Code (claude)
```

---

## Repository Structure

```
frontend-agent-skills/
├── package.json
├── README.md
├── bin/
│   └── install.js              # CLI installer (multi-agent)
└── skills/
    ├── vue/                    # Vue 3 skills
    ├── vite/                   # Vite build tool skill
    ├── javascript/             # JavaScript skills
    └── typescript/             # TS skills (coming soon)
```

---

## How It Works

All skills use a **single unified format** (`SKILL.md` + `references/`) that is compatible with every supported agent. The installer simply copies the same skill files into the correct directory for each agent:

| Agent | Target directory |
|-------|-----------------|
| Cursor | `.cursor/skills/<skill-name>/` |
| Amp | `.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` |

**No code duplication.** Skills are authored once, stored once in `skills/`, and installed to one or more agent directories. Adding a new agent in the future requires only one line in the installer's agent registry.

---

## Migration from vue-cursor-skills

| Before (v1.x) | After (v2.x) |
|---------------|--------------|
| `npx vue-cursor-skills install` | `npx frontend-agent-skills install` |
| `npm i -D vue-cursor-skills` | `npm i -D frontend-agent-skills` |
| `VUE_CURSOR_SKILLS_AGENT=amp` | `FRONTEND_AGENT_SKILLS_AGENT=amp` |

The old package name `vue-cursor-skills` and CLI alias remain available temporarily for backward compatibility.

---

## Roadmap

- [x] Vue 3 core skills (9 skills)
- [x] `vue-architecture` — enterprise project structure, API layer, routing, team standards
- [x] Vite — config, plugins, build, SSR, Environment API, Rolldown migration
- [x] Multi-agent support — Cursor, Amp, Claude Code
- [x] JavaScript — 7 skills: core, dom, debug, node, testing, performance, data
- [x] Package rename — `frontend-agent-skills` v2.0.0
- [ ] TypeScript — advanced types, utility types, type-safe patterns
- [ ] Vitest — advanced testing patterns
- [ ] Additional agents — Windsurf, Cline, and others

---

## npm & GitHub discoverability

Indexed by **npm search** (keywords, description, README) and **Google** (npm package page + GitHub README).

### GitHub repository settings

In [Repository settings → General](https://github.com/makshc2/vue-3-AI-skills/settings):

| Field | Value |
|-------|-------|
| **Description** | `Vue 3, JavaScript & Vite AI agent skills for Cursor, Amp Code, and Claude Code` |
| **Website** | `https://www.npmjs.com/package/frontend-agent-skills` |
| **Topics** | `vue3`, `vue`, `javascript`, `vite`, `cursor`, `cursor-ide`, `cursor-skills`, `agent-skills`, `ai-skills`, `claude-code`, `amp`, `ampcode`, `pinia`, `vueuse`, `vitest`, `frontend`, `llm`, `coding-agent`, `skill-md` |

### npm registry

After publish, deprecate the old package name so npm search surfaces the redirect message:

```bash
npm deprecate vue-cursor-skills "Renamed to frontend-agent-skills → npx frontend-agent-skills install"
```

Verify indexing:

```bash
npm search frontend-agent-skills
npm view frontend-agent-skills
```

---

## Contributing

1. Fork [makshc2/vue-3-AI-skills](https://github.com/makshc2/vue-3-AI-skills).
2. Add or improve skills in `skills/<category>/<skill-name>/SKILL.md`.
3. Follow the SKILL.md frontmatter format.
4. Submit a PR.

---

## License

MIT — Skills content retains original licenses from source repositories.
