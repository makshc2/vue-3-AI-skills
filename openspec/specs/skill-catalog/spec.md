# skill-catalog Specification

## Purpose

Defines how published AI agent skills are structured, named, and documented in this package.

## Requirements

### Requirement: Category layout
The package MUST organize published skills under `skills/<category>/`, where `<category>` is one of: `vue`, `typescript`, `javascript`, `vite`, `html`, `css`, `design`.

#### Scenario: Nested skill folder
- GIVEN a category other than a top-level skill category
- WHEN a new skill is added
- THEN it MUST live at `skills/<category>/<skill-name>/SKILL.md`
- AND `<skill-name>` MUST be kebab-case

#### Scenario: Top-level category skill
- GIVEN the `vite` category (top-level skill)
- WHEN the category skill is published
- THEN `skills/vite/SKILL.md` MUST exist at the category root

#### Scenario: HTML category skills
- GIVEN the `html` category
- WHEN the category is published
- THEN `skills/html/html-core/SKILL.md`, `skills/html/html-forms/SKILL.md`, and `skills/html/html-a11y/SKILL.md` MUST exist

#### Scenario: CSS category skills
- GIVEN the `css` category
- WHEN the category is published
- THEN `skills/css/css-core/SKILL.md`, `skills/css/css-layout/SKILL.md`, `skills/css/css-responsive/SKILL.md`, and `skills/css/css-animations/SKILL.md` MUST exist

#### Scenario: Design category skills
- GIVEN the `design` category
- WHEN the category is published
- THEN `skills/design/design-transfer/SKILL.md`, `skills/design/design-from-screenshot/SKILL.md`, and `skills/design/figma-intake/SKILL.md` MUST exist

### Requirement: SKILL.md frontmatter
Every published skill MUST include YAML frontmatter with at least: `name`, `description`, `license`.

#### Scenario: Required fields present
- GIVEN a new or modified `SKILL.md`
- WHEN the skill is packaged
- THEN `name` MUST match the skill folder name
- AND `description` MUST state when the agent should load the skill
- AND `license` MUST be `MIT`

### Requirement: Actionable skill body
Skill bodies MUST give concrete preferences and rules an agent can follow; deep material SHOULD live in `references/`.

#### Scenario: References for deep docs
- GIVEN a skill with substantial reference material
- WHEN the skill is authored
- THEN detailed docs SHOULD be under `skills/<category>/<skill-name>/references/`
- AND `SKILL.md` SHOULD link to those references

### Requirement: Orchestration skills are separate
Published product skills MUST NOT be stored in `.agents/skills/`; that directory is reserved for OpenSpec / agent-orchestrator kit skills.

#### Scenario: Separation of concerns
- GIVEN a new Vue/TS/JS/Vite skill for end users
- WHEN it is added to the repo
- THEN it MUST be placed under `skills/`
- AND it MUST NOT be committed only under `.agents/skills/`

### Requirement: New category install coverage
When a new category is added to the catalog, the installer test suite MUST verify that installing the category copies all of its skills to every supported agent directory.

#### Scenario: HTML category install test
- GIVEN the `html` category exists in `skills/`
- WHEN `npm test` runs
- THEN a test MUST install `--category html --agent all` into a temp target
- AND assert all three `html-*` skills exist under `.cursor/skills/`, `.agents/skills/`, and `.claude/skills/`

#### Scenario: CSS category install test
- GIVEN the `css` category exists in `skills/`
- WHEN `npm test` runs
- THEN a test MUST install `--category css --agent all` into a temp target
- AND assert all four `css-*` skills exist under `.cursor/skills/`, `.agents/skills/`, and `.claude/skills/`

#### Scenario: Design category install test
- GIVEN the `design` category exists in `skills/`
- WHEN `npm test` runs
- THEN a test MUST install `--category design --agent all` into a temp target
- AND assert all three `design-*` skills exist under `.cursor/skills/`, `.agents/skills/`, and `.claude/skills/`

### Requirement: New category documentation
The README MUST document every published category with a skills table and an install example.

#### Scenario: HTML and CSS documented
- GIVEN the `html` and `css` categories are published
- WHEN README.md is rendered
- THEN it MUST include a skills table for each new category
- AND it MUST include `--category html` and `--category css` install examples

#### Scenario: Design category documented
- GIVEN the `design` category is published
- WHEN README.md is rendered
- THEN it MUST include a Design skills table
- AND it MUST include a `--category design` install example

### Requirement: Design brief contract
The `design-transfer` skill MUST define a durable design brief artifact as the single intake contract for all design sources, so implementation never depends on a live design-tool session.

#### Scenario: Brief structure documented
- GIVEN the `design-transfer` skill is published
- WHEN an agent loads it
- THEN the skill MUST document a design brief containing: layout structure, design tokens, reference images, source metadata, and constraints
- AND a full brief template MUST exist at `skills/design/design-transfer/references/design-brief-template.md`

#### Scenario: Source-independent implementation
- GIVEN a design brief has been captured from any source (Figma MCP, export, screenshot, photo)
- WHEN the agent implements the design
- THEN the skill MUST instruct the agent to work from the brief and reference images only
- AND MUST NOT require re-querying the original design tool during implementation

### Requirement: Intake path skills
The design category MUST provide dedicated intake skills for raster sources and for Figma MCP access, each converging on the design brief contract.

#### Scenario: Screenshot intake
- GIVEN the source is a screenshot or photo
- WHEN the agent loads `design-from-screenshot`
- THEN the skill MUST cover layout extraction, spacing-scale inference, palette and type-scale extraction
- AND MUST require confidence markers on inferred values

#### Scenario: Figma MCP intake with graceful degradation
- GIVEN a Figma MCP server is available
- WHEN the agent loads `figma-intake`
- THEN the skill MUST define a one-pass capture order that saves all needed context into the brief before access can expire
- AND MUST instruct falling back to `design-from-screenshot` when MCP access fails

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
