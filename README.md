# vue-cursor-skills

[![npm version](https://img.shields.io/npm/v/vue-cursor-skills)](https://www.npmjs.com/package/vue-cursor-skills)
[![license](https://img.shields.io/npm/l/vue-cursor-skills)](./LICENSE)
[![github](https://img.shields.io/badge/github-makshc2%2Fvue--3--AI--skills-blue)](https://github.com/makshc2/vue-3-AI-skills)

Curated AI agent skills for **Vue 3 + Vite development in Cursor IDE**.

Gives your AI agent deep knowledge of Vue 3, Vite, Pinia, Vue Router, VueUse, testing, and more — so it writes idiomatic, production-ready code out of the box.

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

### Vite

| Skill | Description |
|-------|-------------|
| `vite` | Vite config (`defineConfig`, env vars, proxy, aliases), plugin API (hooks, virtual modules, ordering), build (library mode, multi-page, chunking), SSR, Environment API (v6+), Rolldown migration (v8) |

---

## Installation

### Option 1: npx — no install required (recommended)

Run directly from npm without adding to your project dependencies:

```bash
npx vue-cursor-skills install
```

Copies all skills to `.cursor/skills/` in the current working directory.

Install by category:

```bash
npx vue-cursor-skills install --category vue
npx vue-cursor-skills install --category vite
npx vue-cursor-skills install --category typescript
npx vue-cursor-skills install --category javascript
```

Install specific skills only:

```bash
npx vue-cursor-skills install --skill vue-core --skill vue-pinia --skill vite
```

Install into a specific project:

```bash
npx vue-cursor-skills install --target /path/to/my-project
```

### Option 2: npm install as devDependency

Add to your project once and run from `package.json` scripts:

```bash
npm install --save-dev vue-cursor-skills
```

Add to `package.json`:

```json
{
  "scripts": {
    "skills:install": "vue-cursor-skills install"
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

Copy any folder from `skills/` directly into your project's `.cursor/skills/` directory.

---

## After Installation

Skills are copied to `.cursor/skills/<skill-name>/SKILL.md` in your project.
**Restart Cursor** to activate them.

You can verify installation:

```
.cursor/
└── skills/
    ├── vue-core/
    ├── vue-pinia/
    ├── vue-router/
    ├── vue-testing/
    ├── vueuse/
    ├── vue-composables/
    ├── vue-debug/
    ├── vue-axios/
    └── vite/
```
---

## Usage in Cursor

After installation, skills are automatically available in Cursor. For best results, reference skills explicitly in your prompt:

```
Use vue-core skill, create a dashboard component with real-time data updates
Use vueuse skill, implement infinite scroll with local storage persistence
Use vue-pinia skill, set up an auth store with SSR support
Use vite skill, configure proxy and path aliases for my Vue project
Use vite skill, create a Vite plugin that injects build metadata
```

Alternatively, add to your project's `.cursor/rules/` or `AGENTS.md`:

```markdown
Always load vue-core, vue-pinia, and vite skills for Vue + Vite work in this project.
```

---

## List Available Skills

```bash
npx vue-cursor-skills list
```

---

## Repository Structure

```
vue-cursor-skills/
├── package.json
├── README.md
├── bin/
│   └── install.js              # CLI installer
└── skills/
    ├── vue/                    # Vue 3 skills
    │   ├── vue-core/
    │   ├── vue-pinia/
    │   ├── vue-router/
    │   ├── vue-testing/
    │   ├── vueuse/
    │   ├── vue-composables/
    │   ├── vue-debug/
    │   └── vue-axios/
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

## Roadmap

- [x] Vue 3 core skills (8 skills)
- [x] Vite — config, plugins, build, SSR, Environment API, Rolldown migration
- [ ] JavaScript — modern patterns, ESNext features, async patterns
- [ ] TypeScript — advanced types, utility types, type-safe patterns
- [ ] Vitest — advanced testing patterns

---

## Contributing

1. Fork [makshc2/vue-3-AI-skills](https://github.com/makshc2/vue-3-AI-skills).
2. Add or improve skills in `skills/<skill-name>/SKILL.md`.
3. Follow the SKILL.md frontmatter format.
4. Submit a PR.

---

## License

MIT — Skills content retains original licenses from source repositories.