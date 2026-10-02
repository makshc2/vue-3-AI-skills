# Design: fix-known-catalog-defects

## Context

Source: roadmap item 1 ("Make CI green and close the known concrete defects"). Every number below was re-measured at HEAD `fb0bdfb` (clean tree, Node v22.22.0, `npm test` = 271 passed: 16 in `skills-behavior` + 255 in `skills-structure`; `npm run openspec:validate` = 2 specs pass). Where the roadmap text and the measurements differ, the measurements win (see D1, D2, D5).

Catalog facts:

- 33 `SKILL.md` and 239 `.md` files under `skills/`; every file is a `SKILL.md` or sits under a `references/` or `reference/` directory (206 reference files).
- The link test (`test/skills-structure.test.mjs`, `hasLocalReferences` and the filter at lines 92-110) covers 214 of 239 files. The 25 outside are the `SKILL.md` of 19 skills that have no references directory, plus the 6 files of `skills/vite/` (the path derivation at lines 101-108 turns `skills/vite/SKILL.md` into a bogus skill path).
- 268 broken relative links, all in `skills/vue/vueuse/SKILL.md`: 266 `references/<fn>.md` plus 2 `../useMediaQuery/index.md` and `../useBreakpoints/index.md` in the `useSSRWidth` row. That skill directory contains only `SKILL.md`. The other 238 files have 0 broken links, so tightening the test exposes nothing else once vueuse is fixed (measured: on unfixed content exactly 2 cases fail, `vueuse has valid frontmatter` and `skills/vue/vueuse/SKILL.md links resolve`).
- 1 of 33 frontmatters fails strict YAML: `javascript-node`, keys `description` (403 chars, contains `Covers node: built-in`) and `compatibility` (its value contains `("type": "module")`; the `: ` inside breaks a plain scalar, the double quotes alone do not). Confirmed with two parsers (npm `yaml` 2.9.0 and PyYAML 6.0.3). The test's `parseFrontmatter` (lines 21-30) is a line regex, which is why this passed.
- 1 `name`/folder mismatch: `skills/vue/vueuse/SKILL.md` has `name: vueuse-functions`. The test enforces `name === folder` only for javascript, typescript, html, css, design (lines 76-84); `vue` and `vite` are not covered. The string `vueuse-functions` occurs in no other shipped file (README, tests, `bin/`, specs).
- 1 orphan reference file: `skills/typescript/typescript-vue/references/script-setup-typing.md`, under two definitions (basename mentioned in no other file of the skill; not reachable through relative links from `SKILL.md`). The other 205 reference files are reachable.
- `DEFAULT_SKILLS` (`bin/install.js:26-36`) has 9 skills and does not contain `javascript-core`; README lines 372-374 still say "Always load vue-core, javascript-core, and vite skills for frontend work."

Not verified (do not rely on): that the only CI run ever failed on Node 20 (`gh` is not installed, Node 20 is not installed locally); that `/vueuse-functions` keeps working after the rename in Claude Code, Cursor or Amp. Token figures below are bytes/4, a lower bound (the roadmap says real tokens are 6-33% higher).

## Goals / Non-Goals

**Goals:**

- Remove the six measured defects and make the tests able to see them: all 239 files link-checked, `name === folder` for every category.
- Keep `bin/`, `DEFAULT_SKILLS` and `engines` (`>=18`) unchanged; make the suite safe on Node runtimes inside `engines`; gate `npm publish` on `npm test`.

**Non-Goals:** description rewrites, default-install trimming, router/hook enforcement, eval harness, a new VueUse lookup rule (roadmap item 9), strict-YAML or orphan guard tests (Q1), CHANGELOG file, version bump or publish, any token-savings claim from other roadmap items.

## Decisions

**D1. The CI Node pin is already done; drop that edit.** `.github/workflows/agent-verify.yml:18` is `node-version: 22` at HEAD (it was 20 at `ab34553`, changed in `fb0bdfb`). Remaining Node work: guard the `Object.groupBy` test and fix javascript-data's `compatibility` (D5, D8). The failure mechanism was reproduced by simulation, not on Node 20: preloading `delete Object.groupBy` on Node 22 makes the HEAD test fail with `TypeError: Object.groupBy is not a function`, and the changed test reports `15 passed | 1 skipped`.

**D2. javascript-node: double quotes for `description`, single quotes for `compatibility`.** The `description` value has no quote characters, so double quotes work. The `compatibility` value `Node.js >=18, ESM ("type": "module")` contains double quotes, so the roadmap's "wrap in double quotes" would break it; single quotes need no escaping. Alternatives: escaping inner quotes (error-prone for later editors); block scalars (`>-`), rejected because the test's line regex would read `>-` as the whole description and fail the length check; rewording (changes meaning). Key lines are located by name, not number (roadmap says line 10; `compatibility` is on line 9 and line 10 is the closing `---`). Verification uses a strict parser, not `parseFrontmatter`.

**D3. vueuse: strip the dead link wrappers, rename, delete the false paragraph.**

- Each wrapper of the shape ``[`fn`](references/fn.md)`` or ``[`useX`](../useX/index.md)`` becomes `` `fn` ``: 268 replacements, 37,325 B to 29,009 B (-8,316 B; about 2.1k tok at bytes/4, a lower bound). External `http(s)` links (95, including 11 table rows whose first cell links to external docs) and all 299 lines that start with `| ` stay.
- `name: vueuse-functions` becomes `name: vueuse` (-10 B). The line starting `IMPORTANT: Each function entry includes a short` (215 B plus newline; it also mentions a `Reference` column that the tables do not have) is deleted with one adjacent blank line (-1 B). All three edits together give 28,782 B (simulated on a scratch copy of HEAD; the gate is `<= 29,009`).
- No replacement lookup rule is written (roadmap item 9). Other frontmatter fields, including `disable-model-invocation: true`, are unchanged.
- Alternatives: generate 266 `references/*.md` files (large, out of scope); keep the links and exempt vueuse in the test (hides the defect); keep `name: vueuse-functions` and add vue to the test's category list (leaves a user-visible name that differs from the install folder).

**D4. typescript-vue: one pointer line at the end of section 3.** After the closing paragraph of `## 3) defineModel (Vue 3.4+)` and before `## 4) Generic Components`, add the line ``See [`references/script-setup-typing.md`](references/script-setup-typing.md) for slots, expose, and attrs typing.`` (113 B plus separators; `typescript-vue` is in the default install, so it adds about 115 B to that skill). Sections 1-3 are the `<script setup>` macro sections and the reference holds typing for the remaining macros (`defineSlots`, `defineExpose`, `useAttrs`). Alternatives: end of section 1 (props) or section 5 (template refs); each matches only part of the topics.

**D5. Two small frontmatter corrections.**

- javascript-data: `compatibility` gains `(Object.groupBy needs Node 21+, toSorted Node 20+)`; the body uses both APIs (lines 202-226). `engines` stays `>=18` (roadmap caveat). The value is a valid plain YAML scalar.
- javascript-core: the `mcpmarket.com` source in `metadata.sources` is replaced by `https://tc39.es/ecma262/ (ECMAScript language specification)`. The roadmap also says to add MDN, but the next list item already is `https://developer.mozilla.org/en-US/docs/Web/JavaScript (MDN reference)`; adding it again would duplicate it.

**D6. README: task-scoped rule in three rows, one hint line.** In the three configuration rows (Cursor, Amp, Claude Code) the Example text becomes `For Vue component work load vue-core; for vite.config or build setup load vite; load other skills only when the task needs them` (127 B, about 32 tok at bytes/4; the old text was 73 B). The README is not an installed skill; the length matters only to users who paste it. Context for the old rule: an agent obeying it loads `javascript-core` (6,978 B) and `vite` (5,494 B) = 12,472 B (about 3.1k tok at bytes/4) in every session; this bounds the avoidable cost and is not a measured saving. Usage examples: see Q2.

**D7. Tests: remove the gate, remove the category list.** In `test/skills-structure.test.mjs` delete `hasLocalReferences` and the `.filter(...)` so `markdownFiles = walk(SKILLS_DIR)` (all 239); make `expect(fm.name).toBe(name)` unconditional and drop the now-unused `category` argument. Alternatives: add `vue` and `vite` to the list (the list was extended by hand in archived change add-design-transfer-skill, so it can drift again); fix only the vite path derivation (still exempts the 19 skills without a references directory). The tasks put this after the content fixes because the stricter tests fail on exactly 2 cases until vueuse is fixed. `parseFrontmatter` stays a line regex (Q1).

**D8. Guard the groupBy test.** `it.skipIf(typeof Object.groupBy !== 'function')('Map groupBy pattern works', ...)`; title and body unchanged; vitest ^3.2.6 supports `skipIf`. On Node 21+ the case still runs. Alternatives: polyfill (stops testing the runtime behavior the skill teaches); `Map.groupBy` (also Node 21+); raising `engines` (non-goal). A grep of `test/` for common post-Node-18 APIs (`toSorted`, `findLast`, `Array.fromAsync`, `Promise.withResolvers`, Set methods, `import.meta.dirname`, `fs.globSync`) finds only `Object.groupBy`; `structuredClone` is Node 17+.

**D9. `prepublishOnly`: `npm test`.** Added after `test:watch` in `package.json` scripts. npm runs it only on `npm publish`, so installs and `npm pack` are unaffected. Alternatives: `prepack` (also runs on `npm pack`); `prepare` (runs on every local `npm install`); CI-only gate (does not protect a local publish). No version bump.

**D10. Spec placement (Q3, decided).**

- `skill-catalog`: five ADDED requirements. No MODIFIED: the existing "SKILL.md frontmatter" requirement stays valid and only gains neighbors, which avoids copying its whole block.
- `packaging`: new capability, two requirements. `openspec/config.yaml` lists `packaging` as a domain but `openspec/specs/packaging` does not exist; a publish gate is a package-level guarantee that neither `skill-catalog` nor `install-cli` covers; and D8 is what lets that gate run on a maintainer's Node 20. Alternative (task-only, no spec) is smaller but leaves the gate unprotected against silent removal. At archive the kit creates `openspec/specs/packaging/spec.md`; its generated Purpose line should be reworded by hand.

## SKILL.md frontmatter and reference layout

| Skill path | Field | Before | After |
|------------|-------|--------|-------|
| `skills/vue/vueuse/SKILL.md` | `name` | `vueuse-functions` | `vueuse` |
| `skills/javascript/javascript-node/SKILL.md` | `description` | plain scalar containing `node: built-in` | same text in double quotes |
| `skills/javascript/javascript-node/SKILL.md` | `compatibility` | plain scalar containing `: ` (inside `("type": "module")`) | same text in single quotes |
| `skills/javascript/javascript-data/SKILL.md` | `compatibility` | `ECMAScript 2020+ / Node.js >=18` | `ECMAScript 2020+ / Node.js >=18 (Object.groupBy needs Node 21+, toSorted Node 20+)` |
| `skills/javascript/javascript-core/SKILL.md` | `metadata.sources` item 1 | `mcpmarket.com` URL | `https://tc39.es/ecma262/` |

All other fields (`license: MIT`, `metadata.version`, `disable-model-invocation`, ...) are untouched. Body edits outside frontmatter: vueuse (268 link wrappers, 1 paragraph) and typescript-vue (1 line).

Reference layout: no file is added, removed or moved. `typescript-vue/references/` keeps its 3 files, all reachable after D4. `vueuse` stays a single-file skill (no `references/` directory). `skills/vite/` keeps `SKILL.md` plus 5 reference files, now link-tested.

## README and test impact

- README: 3 table rows rewritten and 1 hint line added (Q2). No category, skill list or install example changes; line 258 (`--skill javascript-core`, an explicit install) stays correct. No test reads README.
- `skills-structure`: 255 to 280 cases (1 discover + 33 frontmatter + 239 links + 7 installer). `skills-behavior`: 16 cases, one becomes conditional. Total 271 to 296. No new test file; installer tests untouched.
- `bin/install.js`: unchanged, so there is no CLI task group.

## Verification matrix

Commands M0-M4 are listed below the table. Baseline values were measured at HEAD.

| Check | Baseline | Target | Command |
|-------|----------|--------|---------|
| md files link-checked (vitest "links resolve" cases) | 214 of 239 | 239 of 239 | M0 |
| Broken relative links | 268 | 0 | M1 |
| Strict-YAML-invalid frontmatters | 1 of 33 | 0 of 33 | M2 |
| `name` differs from folder | 1 | 0, enforced for every category | M3 plus test |
| Orphan reference files | 1 | 0 | M4 |
| `skills/vue/vueuse/SKILL.md` size | 37,325 B | at most 29,009 B (28,782 B simulated) | `wc -c < skills/vue/vueuse/SKILL.md` |
| README lines with the "Always load" rule | 3 | 0 | `grep -c 'Always load' README.md` |
| `prepublishOnly` | absent | `npm test` | `node -p "require('./package.json').scripts.prepublishOnly"` |
| vitest total | 271 passed | 296 passed (16 + 280) | `npm test` |
| No change: `engines`, `DEFAULT_SKILLS`, `bin/` | `>=18`, 9 skills | identical | `node -p "require('./package.json').engines.node"`; `git diff --name-only fb0bdfb -- bin` prints nothing |

```bash
# M0  link-check cases (run from the repo root)
npx vitest run test/skills-structure.test.mjs --reporter=verbose 2>&1 | grep -c "links resolve"

# M1  broken relative links over all md files
node -e 'const fs=require("fs"),path=require("path");const walk=d=>fs.readdirSync(d).flatMap(e=>{const p=path.join(d,e);return fs.statSync(p).isDirectory()?walk(p):[p]});let n=0,files=0;for(const f of walk("skills").filter(f=>f.endsWith(".md"))){files++;for(const m of fs.readFileSync(f,"utf8").matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const h=m[1];if(h.startsWith("http")||h.startsWith("#"))continue;if(!fs.existsSync(path.resolve(path.dirname(f),h)))n++}}console.log("broken relative links:",n,"in",files,"md files")'

# M2  strict YAML parse of every SKILL.md frontmatter (npm yaml, a transitive dependency)
find skills -name SKILL.md | sort | xargs node -e 'const {parseDocument}=require("yaml");const fs=require("fs");let bad=0;for(const p of process.argv.slice(1)){const m=fs.readFileSync(p,"utf8").match(/^---\n([\s\S]*?)\n---/);const d=parseDocument(m?m[1]:"");if(!m||d.errors.length){bad++;console.log("INVALID",p)}}console.log("invalid:",bad,"of",process.argv.length-1)'

# M3  name differs from folder
find skills -name SKILL.md | sort | while read f; do n=$(grep -m1 '^name:' "$f" | sed 's/^name: *//'); d=$(basename "$(dirname "$f")"); [ "$n" = "$d" ] || echo "MISMATCH $f name=$n folder=$d"; done; echo done

# M4  reference files not reachable from SKILL.md through relative links
node -e 'const fs=require("fs"),path=require("path");const walk=d=>fs.readdirSync(d).flatMap(e=>{const p=path.join(d,e);return fs.statSync(p).isDirectory()?walk(p):[p]});let orphans=[];for(const s of walk("skills").filter(f=>f.endsWith("/SKILL.md"))){const sd=path.dirname(s);const seen=new Set();const q=[s];while(q.length){const f=q.pop();if(seen.has(f))continue;seen.add(f);for(const m of fs.readFileSync(f,"utf8").matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const h=m[1];if(h.startsWith("http")||h.startsWith("#"))continue;const t=path.join(path.dirname(f),h.split("#")[0]);if(t.endsWith(".md")&&fs.existsSync(t))q.push(t)}}for(const f of walk(sd).filter(f=>/\/references?\//.test(f)&&f.endsWith(".md")))if(!seen.has(f))orphans.push(f)}console.log("orphan reference files:",orphans.length,orphans.join(" "))'
```

M2 also has an independent check with python3 and PyYAML (`yaml.safe_load` on the same frontmatter block); both parsers agree at baseline (1 invalid, `javascript-node`).

## Traceability

| Task | Spec requirement | Decision |
|------|------------------|----------|
| 1.1 javascript-data compatibility | none (content correction) | D5 |
| 1.2 javascript-node YAML | skill-catalog: Strictly valid frontmatter | D2 |
| 1.3 vueuse | skill-catalog: Resolvable relative links; Folder-name check | D3 |
| 1.4 typescript-vue pointer | skill-catalog: Reachable reference files | D4 |
| 1.5 javascript-core source | none (content correction) | D5 |
| 2.1 README rule rows | skill-catalog: README load rules | D6 |
| 2.2 README hint | skill-catalog: README load rules | D6, Q2 |
| 3.1 groupBy guard | packaging: Test suite honors the declared Node range | D1, D8 |
| 3.2 test gate and name check | skill-catalog: Folder-name check; Resolvable relative links | D7 |
| 3.3 prepublishOnly | packaging: Pre-publish test gate | D9 |
| 4.1-4.5 verification | all | matrix |

## Release note

No CHANGELOG or release-notes file exists (releases are `chore(release): publish X.Y.Z ...` commits), so this text is for the next release commit or GitHub release:

> - The VueUse skill is renamed from `vueuse-functions` to `vueuse`, matching its install folder; its slash-command and menu entry changes from `/vueuse-functions` to `/vueuse`. Whether the old name keeps working through the folder name is unverified (the roadmap says it does in Claude Code).
> - The VueUse function index no longer links to per-function files that were never shipped (268 dead links removed; 37,325 B to 28,782 B).
> - `javascript-node` frontmatter is now valid YAML; `javascript-data` documents the Node versions needed for `Object.groupBy` and `toSorted`.
> - README configuration examples no longer tell agents to always load `javascript-core` and `vite`.
> - `npm publish` now runs the test suite first.

## Risks / Trade-offs

- [Anyone who invokes `/vueuse-functions` may lose that command] → release note above; no alias is added (Q4).
- [Strict-YAML and orphan fixes have no regression guard] → one-off commands M2 and M4 in the verification tasks; guards are Q1; the two spec requirements are verified once, here.
- [The regex rewrite touches non-link text] → the pattern matches only the two exact wrapper shapes; verified on a scratch copy: 268 replacements, 0 relative links left, 95 `http(s)` links and 299 table lines unchanged.
- [Stricter tests fail on future dead links or name drift] → intended; after this change all 239 files and 33 names pass.
- [`prepublishOnly` blocks a publish when a dev machine's Node differs] → D8 removes the one known Node-dependent case; a real Node 20 or Node 18 run of the suite was not performed.
- [The vueuse index becomes names plus descriptions only] → the removed references never existed in the package, so no agent-readable content is lost; a lookup rule is roadmap item 9.
- [Applying the stricter tests before the skill fixes turns the suite red] → the task order puts content (1.x) before tests (3.x).

## Migration Plan

No data migration. Apply in the task order: skill content (1.x), README (2.x), tests and packaging (3.x), verification (4.x). Rollback is a plain revert; reverting 1.3 alone also requires reverting 3.2, because the stricter tests fail on the old vueuse file. The release note is published with the next version, which this change does not bump.

## Open Questions

- **Q1. Regression guards for strict YAML and orphan references.** Not part of roadmap item 1. A strict-YAML test needs `yaml` as a devDependency (today it is only a transitive dependency of `@fission-ai/openspec`); an orphan test needs a reachability rule. Default: out of scope; verified once by M2 and M4; flagged for a follow-up change.
- **Q2. README usage examples naming non-default skills.** The Cursor block (`javascript-core`), the Amp block (`javascript-debug`) and the Claude Code block (`javascript-core`) name skills that a default install lacks. The Amp line was not listed in the brief (which names only the other two). Default, picked as the minimal-diff option: add one hint line after the three usage blocks that says these prompts need `--category javascript` (exact text in task 2.2). That is one added line, nothing rewritten, and it covers the Amp line too. Alternative: switch the three prompts to default-installed skills such as `typescript-core` (three rewritten lines, with new prompt text for the Amp line). If the alternative is chosen, task 2.2 and the second scenario of the README requirement change.
- **Q3. Spec placement.** Decided in D10 (skill-catalog delta plus new `packaging` capability). If the user prefers task-only for `prepublishOnly` and the Node-range rule, delete `specs/packaging/spec.md` and the `packaging` entries in the proposal and traceability table.
- **Q4. VueUse rename compatibility.** Whether `/vueuse-functions` still resolves in Claude Code, Cursor or Amp is unverified. Default: ship the rename with the release note; add no alias or duplicate folder.
- **Q5. Other skills' `compatibility` fields.** Only javascript-data is corrected (its test exposed it); other skills may also understate Node floors and were not audited. Default: out of scope, so no catalog-wide `compatibility` requirement is written.
