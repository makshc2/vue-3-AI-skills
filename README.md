# vue-cursor-skills

[![npm version](https://img.shields.io/npm/v/vue-cursor-skills)](https://www.npmjs.com/package/vue-cursor-skills)
[![license](https://img.shields.io/npm/l/vue-cursor-skills)](./LICENSE)

Curated AI agent skills for **Vue 3 development in Cursor IDE**.

Merged and deduplicated from the best open-source skill repositories:
- [vuejs-ai/skills](https://github.com/vuejs-ai/skills) — workflow-oriented best practices with validated rules
- [antfu/skills](https://github.com/antfu/skills) — generated from official Vue/Pinia docs, Anthony Fu's preferences
- [vueuse/skills](https://github.com/vueuse/skills) — official VueUse composables reference

---

## Skills

| Skill | Description | Sources |
|-------|-------------|---------|
| `vue-core` | Vue 3 Composition API, `<script setup>`, reactivity, SFC, data flow, composables, performance | vuejs-ai + antfu |
| `vue-pinia` | Pinia setup stores, storeToRefs, actions, plugins, SSR, testing, gotchas | antfu + vuejs-ai |
| `vue-router` | Vue Router 4 guards, navigation patterns, route lifecycle, gotchas | vuejs-ai |
| `vue-testing` | Vitest + Vue Test Utils + Playwright E2E, async patterns, Pinia mocking | vuejs-ai |
| `vueuse` | 200+ VueUse composable utilities with invocation rules | vueuse/skills |
| `vue-composables` | Library-grade composables with `MaybeRef`/`MaybeRefOrGetter` patterns | vuejs-ai |
| `vue-debug` | Runtime errors, warnings, hydration issues, SSR debugging guide | vuejs-ai |

---

## Installation

### Option 1: npx — no install required (recommended)

Run directly from npm without adding to your project dependencies:

```bash
npx vue-cursor-skills install
```

Copies all skills to `.cursor/skills/` in the current working directory.

Install into a specific project:

```bash
npx vue-cursor-skills install --target /path/to/my-project
```

Install specific skills only:

```bash
npx vue-cursor-skills install --skill vue-core --skill vue-pinia
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
    └── vue-debug/
```

---

## Usage in Cursor

After installation, skills are automatically available in Cursor. For best results, reference skills explicitly in your prompt:

```
Use vue skill, create a dashboard component with real-time data updates
Use vueuse skill, implement infinite scroll with local storage persistence
Use vue-pinia skill, set up an auth store with SSR support
```

Alternatively, add to your project's `.cursor/rules/` or `AGENTS.md`:

```markdown
Always load vue-core and vue-pinia skills for Vue work in this project.
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
    ├── vue-core/
    │   ├── SKILL.md            # Core Vue 3 best practices
    │   └── references/
    │       ├── reactivity.md
    │       ├── sfc.md
    │       ├── composables.md
    │       ├── component-data-flow.md
    │       ├── script-setup-macros.md
    │       └── core-new-apis.md
    ├── vue-pinia/
    │   ├── SKILL.md            # Pinia state management
    │   └── references/
    │       └── core-stores.md
    ├── vue-router/
    │   └── SKILL.md            # Vue Router 4
    ├── vue-testing/
    │   └── SKILL.md            # Vitest + Vue Test Utils + Playwright
    ├── vueuse/
    │   └── SKILL.md            # 200+ VueUse composables
    ├── vue-composables/
    │   └── SKILL.md            # Adaptable composable patterns
    └── vue-debug/
        └── SKILL.md            # Debugging guide
```

---

## Deduplication Strategy

| Topic | Decision |
|-------|----------|
| `vue-best-practices` (vuejs-ai) vs `vue` (antfu) | **Merged** into `vue-core`: workflow/rules from vuejs-ai + API reference tables + shallowRef preference from antfu |
| `vue-pinia-best-practices` (vuejs-ai) vs `pinia` (antfu) | **Merged** into `vue-pinia`: antfu's comprehensive structure (from official docs) + vuejs-ai's gotchas/patterns |
| `vue-router-best-practices` — identical in both repos | **Single** `vue-router` skill |
| `vue-testing-best-practices` — unique to vuejs-ai | **Kept** as `vue-testing` |
| `vueuse-functions` — identical in vueuse/skills and antfu/skills | **Single** `vueuse` skill (from vueuse/skills) |
| `create-adaptable-composable` — unique to vuejs-ai | **Kept** as `vue-composables` |
| `vue-debug-guides` — unique to vuejs-ai | **Kept** as `vue-debug` |
| `vue-options-api-best-practices` — legacy | **Excluded** (Composition API only per project rules) |

---

## Roadmap

- [x] Vue 3 core skills (7 skills)
- [ ] JavaScript — modern patterns, ESNext features, async patterns
- [ ] TypeScript — advanced types, utility types, type-safe patterns
- [ ] Vite — config, plugins, build optimization
- [ ] Vitest — advanced testing patterns

---

## Contributing

1. Fork this repository.
2. Add or improve skills in `skills/<skill-name>/SKILL.md`.
3. Follow the SKILL.md frontmatter format.
4. Submit a PR.

---

## License

MIT — Skills content retains original licenses from source repositories.
