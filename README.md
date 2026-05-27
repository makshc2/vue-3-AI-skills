# vue-cursor-skills

[![npm version](https://img.shields.io/npm/v/vue-cursor-skills)](https://www.npmjs.com/package/vue-cursor-skills)
[![license](https://img.shields.io/npm/l/vue-cursor-skills)](./LICENSE)
[![github](https://img.shields.io/badge/github-makshc2%2Fvue--3--AI--skills-blue)](https://github.com/makshc2/vue-3-AI-skills)

Curated AI agent skills for **Vue 3 + Vite development** — works with **Cursor**, **Amp**, and **Claude Code**.

Gives your AI agent deep knowledge of Vue 3, Vite, Pinia, Vue Router, VueUse, testing, and more — so it writes idiomatic, production-ready code out of the box.

### Supported Agents

| Agent | Skills directory | Status |
|-------|-----------------|--------|
| [Cursor](https://cursor.sh) | `.cursor/skills/` | ✅ Supported |
| [Amp](https://ampcode.com) | `.agents/skills/` | ✅ Supported |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `.claude/skills/` | ✅ Supported |

All agents use the same `SKILL.md` format — skills are written once and installed to the correct directory for each agent.

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

---

## Installation

### Option 1: npx — no install required (recommended)

```bash
npx vue-cursor-skills install
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
npx vue-cursor-skills install --yes
# or
VUE_CURSOR_SKILLS_AGENT=amp npx vue-cursor-skills install
```

#### Specify agent directly (no prompt)

```bash
npx vue-cursor-skills install --agent cursor        # Cursor only
npx vue-cursor-skills install --agent amp            # Amp only
npx vue-cursor-skills install --agent claude         # Claude Code only
npx vue-cursor-skills install --agent cursor --agent amp   # multiple agents
npx vue-cursor-skills install --agent all            # all supported agents
```

#### Filter by category or specific skills

```bash
npx vue-cursor-skills install --category vue
npx vue-cursor-skills install --category vite
npx vue-cursor-skills install --skill vue-core --skill vue-pinia --skill vite
```

#### Combine agent + category/skill filters

```bash
npx vue-cursor-skills install --agent amp --category vue
npx vue-cursor-skills install --agent all --skill vue-core --skill vite
```

#### Install into a specific project

```bash
npx vue-cursor-skills install --target /path/to/my-project
```

### Option 2: npm install as devDependency

```bash
npm install --save-dev vue-cursor-skills
```

Add to `package.json`:

```json
{
  "scripts": {
    "skills:install": "vue-cursor-skills install",
    "skills:install:all": "vue-cursor-skills install --agent all"
  }
}
```

Then run:

```bash
npm run skills:install
```

### Option 3: Global install

```bash
npm install -g vue-cursor-skills
vue-cursor-skills install
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
│   ├── vue-pinia/
│   ├── vite/
│   └── ...
├── .agents/skills/       ← Amp
│   ├── vue-core/
│   ├── vue-pinia/
│   ├── vite/
│   └── ...
└── .claude/skills/       ← Claude Code
    ├── vue-core/
    ├── vue-pinia/
    ├── vite/
    └── ...
```

---

## Usage

After installation, skills are automatically available in your agent. For best results, reference skills explicitly in your prompt:

**Cursor:**
```
Use vue-core skill, create a dashboard component with real-time data updates
Use vite skill, configure proxy and path aliases for my Vue project
```

**Amp:**
```
Use the vite skill to create a Vite plugin that injects build metadata
Use vue-pinia skill, set up an auth store with SSR support
```

**Claude Code:**
```
/vue-core create a dashboard component with real-time data updates
/vite configure proxy and path aliases for my Vue project
```

Alternatively, add to your project's configuration:

| Agent | File | Example |
|-------|------|---------|
| Cursor | `.cursor/rules/` | `Always load vue-core and vite skills for Vue work.` |
| Amp | `AGENTS.md` | `Always load vue-core and vite skills for Vue work.` |
| Claude Code | `CLAUDE.md` | `Always load vue-core and vite skills for Vue work.` |

---

## List Available Skills

```bash
npx vue-cursor-skills list
```

Output:
```
  📁 vue/
      - vue-core
      - vue-pinia
      - vue-router
      - vue-testing
      - vueuse
      - vue-composables
      - vue-debug
      - vue-axios
      - vue-architecture
  📦 vite
  📁 javascript/  (empty — coming soon)
  📁 typescript/  (empty — coming soon)

  Supported agents: Cursor (cursor), Amp (amp), Claude Code (claude)
```

---

## Repository Structure

```
vue-cursor-skills/
├── package.json
├── README.md
├── bin/
│   └── install.js              # CLI installer (multi-agent)
└── skills/
    ├── vue/                    # Vue 3 skills
    │   ├── vue-core/
    │   ├── vue-pinia/
    │   ├── vue-router/
    │   ├── vue-testing/
    │   ├── vueuse/
    │   ├── vue-composables/
    │   ├── vue-debug/
    │   ├── vue-axios/
    │   └── vue-architecture/
    ├── vite/                   # Vite build tool skill
    │   ├── SKILL.md
    │   └── references/
    │       ├── core-config.md
    │       ├── core-features.md
    │       ├── plugin-api.md
    │       ├── build-and-ssr.md
    │       └── environment-and-migration.md
    ├── javascript/             # JS skills (coming soon)
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

## Roadmap

- [x] Vue 3 core skills (9 skills)
- [x] `vue-architecture` — enterprise project structure, API layer, routing, team standards
- [x] Vite — config, plugins, build, SSR, Environment API, Rolldown migration
- [x] Multi-agent support — Cursor, Amp, Claude Code
- [ ] JavaScript — modern patterns, ESNext features, async patterns
- [ ] TypeScript — advanced types, utility types, type-safe patterns
- [ ] Vitest — advanced testing patterns
- [ ] Additional agents — Windsurf, Cline, and others

---

## Contributing

1. Fork [makshc2/vue-3-AI-skills](https://github.com/makshc2/vue-3-AI-skills).
2. Add or improve skills in `skills/<category>/<skill-name>/SKILL.md`.
3. Follow the SKILL.md frontmatter format.
4. Submit a PR.

---

## License

MIT — Skills content retains original licenses from source repositories.
