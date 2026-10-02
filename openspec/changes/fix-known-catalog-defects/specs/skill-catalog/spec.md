# skill-catalog Delta

## ADDED Requirements

### Requirement: Strictly valid frontmatter
The YAML frontmatter block of every published `SKILL.md` MUST parse without errors under a strict YAML 1.2 parser, and every parsed value MUST equal the text the author intended. A value that cannot be written as a plain (unquoted) scalar, because it fails to parse or parses to different text (for example, it contains `: `), MUST be quoted with a style that does not collide with the quote characters inside the value.

#### Scenario: All frontmatter blocks parse
- GIVEN every `SKILL.md` under `skills/`
- WHEN its frontmatter block is parsed by a strict YAML parser instead of a line-by-line pattern
- THEN parsing MUST finish with zero errors
- AND `name`, `description` and `license` MUST each parse as a non-empty string

#### Scenario: Value that a plain scalar cannot represent
- GIVEN a frontmatter value that a plain scalar cannot represent, such as `node: built-in` in a description or `("type": "module")` in `compatibility`
- WHEN the value is written
- THEN it MUST be quoted with a style that does not collide with the quote characters inside it
- AND the parsed value MUST equal the intended text word for word

### Requirement: Folder-name check covers every category
The test suite MUST verify, for every discovered skill and without a per-category list, that the frontmatter `name` equals the skill folder name.

#### Scenario: Every discovered skill is checked
- GIVEN the skills discovered under `skills/`, including top-level category skills such as `vite`
- WHEN `npm test` runs
- THEN each skill MUST have a frontmatter test case that asserts `name` equals its folder name
- AND the assertion MUST NOT depend on the skill's category

#### Scenario: A new category needs no test edit
- GIVEN a new category directory is added under `skills/`
- WHEN `npm test` runs
- THEN the folder-name check MUST cover the skills of that category without any edit to the test file

#### Scenario: VueUse skill name
- GIVEN the skill folder `skills/vue/vueuse/`
- WHEN its frontmatter is read
- THEN `name` MUST be `vueuse`

### Requirement: Resolvable relative links
Every relative Markdown link in every `.md` file under `skills/` MUST resolve to an existing path, and the test suite MUST include one link-resolution case for each of those files.

#### Scenario: Every markdown file is link-checked
- GIVEN all `.md` files under `skills/`: each `SKILL.md` and every file under a `references/` or `reference/` directory
- WHEN `npm test` runs
- THEN the suite MUST contain one link-resolution case per file
- AND no file MUST be excluded from the check because of what its skill directory contains

#### Scenario: Relative targets exist
- GIVEN a link whose target is neither an absolute URL nor an in-page anchor
- WHEN the target is resolved against the directory of the file that contains the link
- THEN the resolved path MUST exist

#### Scenario: Single-file catalog skill
- GIVEN a skill directory that contains only `SKILL.md`, such as `skills/vue/vueuse/`
- WHEN its `SKILL.md` lists entries such as functions
- THEN it MUST NOT link an entry to a per-entry file that does not exist
- AND it MUST NOT tell the agent to consult a `references/` directory that does not exist

### Requirement: Reachable reference files
Every file under a skill's `references/` or `reference/` directory MUST be reachable from that skill's `SKILL.md` by following relative Markdown links, directly or through other files of the same skill. A link to a reference file SHOULD name the topic the file covers.

#### Scenario: No orphan reference files
- GIVEN a skill whose directory contains reference files
- WHEN relative links are followed starting from its `SKILL.md`
- THEN every reference file of that skill MUST be reached

#### Scenario: TypeScript-Vue script-setup reference
- GIVEN the file `skills/typescript/typescript-vue/references/script-setup-typing.md`
- WHEN `skills/typescript/typescript-vue/SKILL.md` is read
- THEN it MUST contain a relative link to that file
- AND the link SHOULD be accompanied by its topic: slots, expose, and attrs typing

### Requirement: README load rules name only default-installed skills
Rule snippets in `README.md` that tell an agent which skills to load MUST name only skills that belong to the default install set defined by the `install-cli` capability, and MUST scope loading to the task at hand instead of to all frontend work.

#### Scenario: Project-configuration snippets
- GIVEN the README table of configuration snippets for Cursor, Amp and Claude Code
- WHEN a snippet tells the agent to load skills
- THEN every skill it names MUST be in the default install set
- AND it MUST NOT instruct loading skills for all frontend work unconditionally

#### Scenario: Usage example for a non-default skill
- GIVEN a README usage example that names a skill outside the default install set
- WHEN the example blocks are rendered
- THEN the README MUST state, directly after those blocks, which `--category` or `--skill` flag installs that skill
