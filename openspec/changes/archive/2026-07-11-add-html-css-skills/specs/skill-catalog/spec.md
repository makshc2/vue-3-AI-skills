# skill-catalog Delta

## MODIFIED Requirements

### Requirement: Category layout
The package MUST organize published skills under `skills/<category>/`, where `<category>` is one of: `vue`, `typescript`, `javascript`, `vite`, `html`, `css`.

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

## ADDED Requirements

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

### Requirement: New category documentation
The README MUST document every published category with a skills table and an install example.

#### Scenario: HTML and CSS documented
- GIVEN the `html` and `css` categories are published
- WHEN README.md is rendered
- THEN it MUST include a skills table for each new category
- AND it MUST include `--category html` and `--category css` install examples
