# skill-catalog Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
