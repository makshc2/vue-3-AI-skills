# Tasks: fix-known-catalog-defects

> **Implementer:** load `.agents/skills/project-conventions` before editing any `SKILL.md` (frontmatter keeps `name`, `description`, `license: MIT`; skill content stays English). Run every command from the repository root on Node 22. Locate frontmatter keys by name, not by line number. Do the groups in order: groups 1 and 2 (content) come before group 3 (tests), because the stricter tests in task 3.2 fail on exactly 2 cases (`vueuse has valid frontmatter` and `skills/vue/vueuse/SKILL.md links resolve`) until task 1.3 is done. This change has no `bin/` edits, so there is no CLI group. Commands that use `require("yaml")` rely on `node_modules/yaml`, installed as a dependency of `@fission-ai/openspec` (run `npm ci` if `npm ls yaml` shows it missing).

## 1. Skill content (categories javascript, typescript, vue)

- [x] 1.1 Document the Node floors in javascript-data compatibility
  Files: skills/javascript/javascript-data/SKILL.md
  Do: In the frontmatter, change the line `compatibility: ECMAScript 2020+ / Node.js >=18` to `compatibility: ECMAScript 2020+ / Node.js >=18 (Object.groupBy needs Node 21+, toSorted Node 20+)` (plain unquoted value). Leave every other line of the file unchanged.
  Done-when: `grep '^compatibility:' skills/javascript/javascript-data/SKILL.md` prints exactly `compatibility: ECMAScript 2020+ / Node.js >=18 (Object.groupBy needs Node 21+, toSorted Node 20+)`, and `node -e 'const {parse}=require("yaml");const m=require("fs").readFileSync(process.argv[1],"utf8").match(/^---\n([\s\S]*?)\n---/);console.log(Object.keys(parse(m[1])).join(","))' skills/javascript/javascript-data/SKILL.md` exits 0 and prints `name,description,license,metadata,compatibility`.

- [x] 1.2 Make javascript-node frontmatter valid YAML
  Files: skills/javascript/javascript-node/SKILL.md
  Do: In the frontmatter, locate the keys by name. Wrap the whole value of `description:` in double quotes (the value contains no quote characters). Wrap the whole value of `compatibility:` in single quotes so that the line reads `compatibility: 'Node.js >=18, ESM ("type": "module")'` (the value itself contains double quotes, so double quotes would break it). Do not change a single word of either value.
  Done-when: `node -e 'const {parse}=require("yaml");const m=require("fs").readFileSync("skills/javascript/javascript-node/SKILL.md","utf8").match(/^---\n([\s\S]*?)\n---/);const d=parse(m[1]);console.log(d.compatibility);console.log(d.description.length)'` exits 0 and prints `Node.js >=18, ESM ("type": "module")` and then `403` (before the change the same command exits 1 with `YAMLParseError`).

- [x] 1.3 Fix the vueuse skill: name, dead links, false paragraph
  Files: skills/vue/vueuse/SKILL.md
  Do: (a) In the frontmatter change `name: vueuse-functions` to `name: vueuse`. (b) Replace every relative-link wrapper by its bare inline code: a wrapper such as ``[`createGlobalState`](references/createGlobalState.md)`` becomes `` `createGlobalState` `` (266 replacements), and the two links on the `useSSRWidth` row, ``[`useMediaQuery`](../useMediaQuery/index.md)`` and ``[`useBreakpoints`](../useBreakpoints/index.md)``, become `` `useMediaQuery` `` and `` `useBreakpoints` `` (268 replacements in total). Leave every `http(s)` link untouched, including the 11 table rows whose first cell links to external docs. (c) Delete the one line that starts with `IMPORTANT: Each function entry includes a short` together with the blank line after it, so that exactly one blank line remains between the paragraph that starts `All functions listed below` and the heading `### State`. Change nothing else (`description`, `disable-model-invocation: true`, `license`, `metadata` and `compatibility` stay as they are). These three commands perform (a), (b) and (c); any equivalent edit is fine:
  ```bash
  sed -i 's/^name: vueuse-functions$/name: vueuse/' skills/vue/vueuse/SKILL.md
  node -e 'const fs=require("fs");const p="skills/vue/vueuse/SKILL.md";fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace(/\[`([^`]+)`\]\((?:references\/[^)]+\.md|\.\.\/[^)]+\/index\.md)\)/g,"`$1`"))'
  sed -i '/^IMPORTANT: Each function entry includes a short/,+1d' skills/vue/vueuse/SKILL.md
  ```
  Done-when: this command prints `refs=0 up=0 important=0 dotref=0 rows=299 http=95 bytes=28782` followed by `name: vueuse` (the byte count must be at most 29009):
  ```bash
  f=skills/vue/vueuse/SKILL.md; echo "refs=$(grep -c '](references/' $f) up=$(grep -c '](\.\./' $f) important=$(grep -c 'IMPORTANT: Each function' $f) dotref=$(grep -c '\./references' $f) rows=$(grep -c '^| ' $f) http=$(grep -o '](http' $f | wc -l) bytes=$(wc -c < $f)"; grep -m1 '^name:' $f
  ```

- [x] 1.4 Link the orphan reference from typescript-vue
  Files: skills/typescript/typescript-vue/SKILL.md
  Do: Find the heading that starts with `## 3)` (the `defineModel` section) and the next heading that starts with `## 4)`. Directly after the last paragraph of section 3 (the one that starts `Replaces the old`) and before the `## 4)` heading, insert one blank line and then exactly the line below, so that one blank line separates it from the `## 4)` heading. Do not touch any other line.
  ```
  See [`references/script-setup-typing.md`](references/script-setup-typing.md) for slots, expose, and attrs typing.
  ```
  Done-when: `grep -c 'script-setup-typing' skills/typescript/typescript-vue/SKILL.md` prints `1` and `awk '/^## 3\)/{a=NR} /script-setup-typing/{b=NR} /^## 4\)/{c=NR} END{print (a<b && b<c) ? "OK" : "BAD"}' skills/typescript/typescript-vue/SKILL.md` prints `OK`.

- [x] 1.5 Replace the mcpmarket source in javascript-core
  Files: skills/javascript/javascript-core/SKILL.md
  Do: In the frontmatter list `metadata.sources`, replace the item line `    - https://mcpmarket.com/tools/skills/javascript-best-practices (JavaScript Best Practices skill)` with `    - https://tc39.es/ecma262/ (ECMAScript language specification)` (same 4-space indent). Keep the next item, `https://developer.mozilla.org/en-US/docs/Web/JavaScript (MDN reference)`, unchanged; MDN is already listed, so do not add it a second time.
  Done-when: `grep -c 'mcpmarket' skills/javascript/javascript-core/SKILL.md` prints `0`; `grep -c 'tc39.es/ecma262' skills/javascript/javascript-core/SKILL.md` prints `1`; `grep -c 'https://developer.mozilla.org/en-US/docs/Web/JavaScript (MDN reference)' skills/javascript/javascript-core/SKILL.md` prints `1`; and `node -e 'const {parse}=require("yaml");const m=require("fs").readFileSync(process.argv[1],"utf8").match(/^---\n([\s\S]*?)\n---/);console.log(Object.keys(parse(m[1])).join(","))' skills/javascript/javascript-core/SKILL.md` exits 0 and prints `name,description,license,metadata,compatibility`.

## 2. README

- [x] 2.1 Replace the blanket "Always load" rule in three README rows
  Files: README.md
  Do: In the table that follows the line `Alternatively, add to your project's configuration:`, in each of the three rows (Cursor `.cursor/rules/`, Amp `AGENTS.md`, Claude Code `CLAUDE.md`) replace the Example text `Always load vue-core, javascript-core, and vite skills for frontend work.` with `For Vue component work load vue-core; for vite.config or build setup load vite; load other skills only when the task needs them` (keep the cell's surrounding backticks; no trailing period). Change no other line in this task.
  Done-when: `grep -c 'Always load' README.md` prints `0` and `grep -c 'load other skills only when the task needs them' README.md` prints `3`.

- [x] 2.2 Add the `--category javascript` hint under the usage examples
  Files: README.md
  Do: Directly after the closing code fence of the `**Claude Code:**` usage block (its last line is `/vite configure proxy and path aliases for my Vue project`) and before the line `Alternatively, add to your project's configuration:`, insert one blank line, then exactly the line below, then one blank line. Leave the three usage blocks themselves unchanged.
  ```
  > The `javascript-core` and `javascript-debug` prompts above need the JavaScript category, which the default install omits: run `npx frontend-agent-skills install --category javascript` first.
  ```
  Done-when: `grep -c 'need the JavaScript category' README.md` prints `1` and `awk '/^\*\*Claude Code:\*\*/{a=NR} /need the JavaScript category/{b=NR} /^Alternatively, add to your project/{c=NR} END{print (a<b && b<c) ? "OK" : "BAD"}' README.md` prints `OK`.

## 3. Tests and packaging

- [x] 3.1 Skip the Object.groupBy test when the API is absent
  Files: test/skills-behavior.test.mjs
  Do: In the `describe('javascript-data patterns', ...)` block, change `it('Map groupBy pattern works', () => {` to `it.skipIf(typeof Object.groupBy !== 'function')('Map groupBy pattern works', () => {`. Keep the test title and body unchanged.
  Done-when: `npx vitest run test/skills-behavior.test.mjs` prints `Tests  16 passed (16)`, and `NODE_OPTIONS='--import=data:text/javascript,delete%20Object.groupBy' npx vitest run test/skills-behavior.test.mjs` exits 0 and prints `Tests  15 passed | 1 skipped (16)` (this simulates a Node without `Object.groupBy`; before the change the simulated run fails with `TypeError: Object.groupBy is not a function`).

- [x] 3.2 Link-check every markdown file and enforce name === folder for every skill
  Files: test/skills-structure.test.mjs
  Do: Run this task only after task 1.3. (a) In `describe('skill frontmatter', ...)`: change `it.each(allSkills.map((s) => [s.name, s.category, s.skillPath]))(` to `it.each(allSkills.map((s) => [s.name, s.skillPath]))(`; change the callback parameters `(name, category, skillPath) => {` to `(name, skillPath) => {`; replace the whole `if (category === 'javascript' || ... || category === 'design') { ... }` block (the one that guards the name check) by the single unconditional line shown below. (b) Delete the function `hasLocalReferences` (3 lines). In `describe('markdown internal links', ...)` replace the `const markdownFiles = walk(SKILLS_DIR).filter((filePath) => { ... })` expression (14 lines, ending with the closing `})`) by `const markdownFiles = walk(SKILLS_DIR)`. Keep `parseFrontmatter`, `walk`, `discoverSkills`, `extractRelativeLinks`, the installer tests and every other line unchanged.
  ```js
  expect(fm.name, `${name}: name must match folder`).toBe(name)
  ```
  Done-when: `grep -n 'hasLocalReferences\|category ===' test/skills-structure.test.mjs` prints nothing; `npx vitest run test/skills-structure.test.mjs` prints `Tests  280 passed (280)`; and `npx vitest run test/skills-structure.test.mjs --reporter=verbose 2>&1 | grep -c "links resolve"` prints `239`.

- [x] 3.3 Add the prepublishOnly gate
  Files: package.json
  Do: In the `scripts` object add the entry `"prepublishOnly": "npm test",` on its own line directly after the line `"test:watch": "vitest",`. Do not change `version`, `engines`, `files`, `bin` or any dependency.
  Done-when: `node -p "require('./package.json').scripts.prepublishOnly"` prints `npm test` and `node -p "require('./package.json').version+' '+require('./package.json').engines.node"` prints `2.4.0 >=18`.

## 4. Verification

- [x] 4.1 Strict-YAML parse of all 33 SKILL.md frontmatters (one-off, not committed)
  Files: skills
  Do: From the repository root run the command below. It parses every frontmatter block with the npm `yaml` library, not with the test's line-regex `parseFrontmatter`. Write no file.
  ```bash
  find skills -name SKILL.md | sort | xargs node -e 'const {parseDocument}=require("yaml");const fs=require("fs");let bad=0;for(const p of process.argv.slice(1)){const m=fs.readFileSync(p,"utf8").match(/^---\n([\s\S]*?)\n---/);const d=parseDocument(m?m[1]:"");if(!m||d.errors.length){bad++;console.log("INVALID",p)}}console.log("invalid:",bad,"of",process.argv.length-1)'
  ```
  Done-when: the output is exactly `invalid: 0 of 33` with no `INVALID` line (before tasks 1.2 it reads `INVALID skills/javascript/javascript-node/SKILL.md` and `invalid: 1 of 33`).

- [x] 4.2 Defect counters: broken links, name versus folder, orphan references (one-off, not committed)
  Files: skills
  Do: From the repository root run the three commands below (no file is written).
  ```bash
  node -e 'const fs=require("fs"),path=require("path");const walk=d=>fs.readdirSync(d).flatMap(e=>{const p=path.join(d,e);return fs.statSync(p).isDirectory()?walk(p):[p]});let n=0,files=0;for(const f of walk("skills").filter(f=>f.endsWith(".md"))){files++;for(const m of fs.readFileSync(f,"utf8").matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const h=m[1];if(h.startsWith("http")||h.startsWith("#"))continue;if(!fs.existsSync(path.resolve(path.dirname(f),h)))n++}}console.log("broken relative links:",n,"in",files,"md files")'
  find skills -name SKILL.md | sort | while read f; do n=$(grep -m1 '^name:' "$f" | sed 's/^name: *//'); d=$(basename "$(dirname "$f")"); [ "$n" = "$d" ] || echo "MISMATCH $f name=$n folder=$d"; done; echo done
  node -e 'const fs=require("fs"),path=require("path");const walk=d=>fs.readdirSync(d).flatMap(e=>{const p=path.join(d,e);return fs.statSync(p).isDirectory()?walk(p):[p]});let orphans=[];for(const s of walk("skills").filter(f=>f.endsWith("/SKILL.md"))){const sd=path.dirname(s);const seen=new Set();const q=[s];while(q.length){const f=q.pop();if(seen.has(f))continue;seen.add(f);for(const m of fs.readFileSync(f,"utf8").matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const h=m[1];if(h.startsWith("http")||h.startsWith("#"))continue;const t=path.join(path.dirname(f),h.split("#")[0]);if(t.endsWith(".md")&&fs.existsSync(t))q.push(t)}}for(const f of walk(sd).filter(f=>/\/references?\//.test(f)&&f.endsWith(".md")))if(!seen.has(f))orphans.push(f)}console.log("orphan reference files:",orphans.length,orphans.join(" "))'
  ```
  Done-when: the three outputs are `broken relative links: 0 in 239 md files`, then only `done` (no `MISMATCH` line), then `orphan reference files: 0` (at HEAD they read `268 in 239`, one `MISMATCH` for `skills/vue/vueuse/SKILL.md`, and `1 skills/typescript/typescript-vue/references/script-setup-typing.md`).

- [x] 4.3 Scope check: only the planned files changed
  Files: package.json
  Do: Run `git diff --name-only fb0bdfb -- . ':!openspec'` from the repository root (`fb0bdfb` is the commit this change was planned on).
  Done-when: the output is exactly these 9 lines in this order: `README.md`, `package.json`, `skills/javascript/javascript-core/SKILL.md`, `skills/javascript/javascript-data/SKILL.md`, `skills/javascript/javascript-node/SKILL.md`, `skills/typescript/typescript-vue/SKILL.md`, `skills/vue/vueuse/SKILL.md`, `test/skills-behavior.test.mjs`, `test/skills-structure.test.mjs`; nothing under `bin/`, `.github/` or `docs/` appears.

- [x] 4.4 Run the full test suite
  Files: package.json, test/skills-behavior.test.mjs, test/skills-structure.test.mjs
  Do: Run `npm test` from the repository root. Fix a failing case at its source (the skill file or the test edit from groups 1 to 3); do not delete or skip a test to make it pass.
  Done-when: the command exits 0 and the summary shows `Test Files  2 passed (2)` and `Tests  296 passed (296)` (16 in `skills-behavior` plus 280 in `skills-structure`).

- [x] 4.5 Validate the OpenSpec artifacts
  Files: package.json
  Do: Run `npm run openspec:validate` from the repository root (it runs `openspec validate --all --strict`).
  Done-when: the command exits 0 and reports no invalid item (the change `fix-known-catalog-defects` and the specs `install-cli` and `skill-catalog` all pass).
