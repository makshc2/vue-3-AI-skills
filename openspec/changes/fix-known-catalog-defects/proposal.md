# Proposal: fix-known-catalog-defects

## Why

Roadmap item 1 lists defects in the published catalog. The suite is green at HEAD `fb0bdfb` (271 passed, Node 22) because it cannot see most of them: the link test skips 25 of 239 markdown files, frontmatter is parsed by a line regex, and `name === folder` is checked for 5 of 7 categories. Measured at HEAD:

- 268 dead relative links, all in `skills/vue/vueuse/SKILL.md` (no `references/` directory).
- 1 of 33 frontmatters fails strict YAML (`javascript-node`).
- 1 `name`/folder mismatch (`vueuse-functions` vs `vueuse`).
- 1 orphan: `skills/typescript/typescript-vue/references/script-setup-typing.md`.
- README says "Always load vue-core, javascript-core, and vite"; `javascript-core` is not in the default install.
- A test calls `Object.groupBy` (Node 21+) unguarded; `engines` allows Node >=18 (Node 20 failure not reproduced locally).

## What Changes

- `skills/vue/vueuse/SKILL.md` (category `vue`): `name: vueuse`; 268 dead link wrappers become plain inline code (-8,316 B; about 2.1k tok at bytes/4, a lower bound); delete the paragraph pointing to the missing `./references`. **BREAKING:** the user-visible name changes from `vueuse-functions`; whether the old name still resolves is unverified.
- `skills/javascript/javascript-node/SKILL.md` (category `javascript`): quote `description` and `compatibility` so the frontmatter is valid YAML.
- `skills/javascript/javascript-data/SKILL.md` (category `javascript`): `compatibility` states Node floors for `Object.groupBy` and `toSorted`.
- `skills/javascript/javascript-core/SKILL.md` (category `javascript`): replace the `mcpmarket.com` source with the TC39 specification.
- `skills/typescript/typescript-vue/SKILL.md` (category `typescript`): link the orphan reference.
- `README.md`: task-scoped load rule naming default-installed skills; one hint that `javascript-*` prompts need `--category javascript`.
- `test/skills-structure.test.mjs`: link-check all 239 files; require `name === folder` for every category.
- `test/skills-behavior.test.mjs`: skip the `Object.groupBy` case when the API is absent.
- `package.json`: `"prepublishOnly": "npm test"`.

## Capabilities

### New Capabilities

- `packaging`: tests run before publish; the suite skips cases for APIs missing in a supported Node.

### Modified Capabilities

- `skill-catalog`: strict-valid frontmatter; `name === folder` verified for every category; resolvable relative links in all markdown; reachable reference files; README load rules limited to default-installed skills.

## Impact

- Five `SKILL.md` files, `README.md`, two test files, `package.json`. Unchanged: `bin/`, `DEFAULT_SKILLS`, `engines`, and the CI Node pin (already `22`).
- No CHANGELOG file exists; the VueUse rename release note is in `design.md`.

## Non-goals

- No description rewrites, default-install trimming, router/hook enforcement, or eval harness.
- No changes to `DEFAULT_SKILLS` or `bin/`.
- No new VueUse lookup rule (roadmap item 9, not reviewed here).
- No strict-YAML or orphan guard tests, no CHANGELOG file (see `design.md` Open Questions).
- No version bump, publish, or `engines` change.
- No token-savings claims from other roadmap items; they overlap.

## Acceptance criteria

- `npm test`: 296 passed (16 + 280), 239 "links resolve" cases.
- Strict YAML parse of all 33 frontmatters: 0 errors.
- Broken relative links 268 to 0; name/folder mismatches 1 to 0; orphans 1 to 0.
- `skills/vue/vueuse/SKILL.md` at most 29,009 B (37,325 B at HEAD).
- No "Always load" rule in `README.md`; `prepublishOnly` is `npm test`.
- `npm run openspec:validate` passes.
