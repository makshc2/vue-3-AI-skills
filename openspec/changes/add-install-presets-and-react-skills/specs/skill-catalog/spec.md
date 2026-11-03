## MODIFIED Requirements

### Requirement: Category layout
The package MUST organize published skills under `skills/<category>/`, where `<category>` is one of: `vue`, `typescript`, `javascript`, `vite`, `html`, `css`, `design`, `react`.

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

#### Scenario: React category skills
- GIVEN the `react` category
- WHEN the category is published
- THEN `SKILL.md` MUST exist for each of `react-core`, `react-hooks`, `react-typescript`, `react-state`, `react-router`, `react-data`, `react-testing`, and `react-debug` under `skills/react/<name>/`

#### Scenario: React category has no root skill
- GIVEN the `react` category
- WHEN `skills/react/` is listed
- THEN it MUST NOT contain a `SKILL.md` at its root, because a root `SKILL.md` makes the installer ignore nested skills

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

#### Scenario: React category install test
- GIVEN the `react` category exists in `skills/`
- WHEN `npm test` runs
- THEN a test MUST install `--category react --agent all` into a temp target
- AND assert all eight `react-*` skills exist under `.cursor/skills/`, `.agents/skills/`, and `.claude/skills/`

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

#### Scenario: React category documented
- GIVEN the `react` category is published
- WHEN README.md is rendered
- THEN it MUST include a React skills table listing all eight skills
- AND it MUST include a `--category react` install example

## ADDED Requirements

### Requirement: Install presets documentation
The README MUST document the presets (a table of names, contents, and detection), `--preset` examples including `auto`, the interactive menu with its TTY-only condition, and the token-budget warning for `full` and `--all`.

#### Scenario: Presets documented
- GIVEN the presets in `bin/presets.json`
- WHEN README.md is rendered
- THEN it MUST include a table that names every preset
- AND it MUST include `--preset` and `--preset auto` examples

#### Scenario: Menu and non-interactive behavior documented
- GIVEN the interactive menu exists
- WHEN README.md is rendered
- THEN it MUST state that the menu appears only in a TTY without `--yes` or selection flags
- AND it MUST state that `install --yes` still installs the nine default skills

#### Scenario: Budget warning documented
- GIVEN `full` and `--all` print a budget warning
- WHEN README.md is rendered
- THEN it MUST explain that listing descriptions can be truncated for large installs

### Requirement: React skill contract
Every skill under `skills/react/` MUST be named `react-<topic>` and MUST have frontmatter `name`, `description`, `license: MIT`, a non-empty `compatibility`, and `metadata` with `version` and `sources` (at least one official documentation URL). Its `description` MUST start with `Use for` and be at most 350 characters.

#### Scenario: Frontmatter present
- GIVEN each `skills/react/<name>/SKILL.md`
- WHEN the structure test runs
- THEN `name` MUST equal the folder name and start with `react-`
- AND `metadata.sources` MUST contain at least one `https://` URL
- AND `metadata.version` and `compatibility` MUST be present and non-empty

#### Scenario: Description rule
- GIVEN the `description` of a React skill
- WHEN its length and beginning are checked
- THEN it MUST start with `Use for` and MUST NOT exceed 350 characters

### Requirement: React skills are self-contained
Markdown links and skill-name references in files under `skills/react/` MUST point only to `react-*`, `html-*`, or `css-*` skills, so a partial install leaves no dangling reference.

#### Scenario: Links stay inside allowed categories
- GIVEN every `.md` file under `skills/react/`
- WHEN its relative links are resolved
- THEN each target MUST be inside `skills/react/`, `skills/html/`, or `skills/css/`

#### Scenario: No instruction to load other categories
- GIVEN every `.md` file under `skills/react/`
- WHEN it is searched for backticked names of skills from `vue`, `typescript`, `javascript`, or `design`
- THEN none MUST be found

### Requirement: React skills target Vite SPA and stay neutral
React skills MUST target a Vite single-page app with React 19 and the React Compiler, and MUST NOT teach Next.js, React Server Components, or SSR. `react-state`, `react-router`, and `react-data` MUST compare options in criteria tables without naming a single required choice.

#### Scenario: Out-of-scope topics absent
- GIVEN the files under `skills/react/`
- WHEN they are reviewed
- THEN no section MUST instruct on Next.js, React Server Components, or SSR setup
- AND a mention MUST only state that these are out of scope

#### Scenario: Neutral comparison
- GIVEN `react-state`, `react-router`, and `react-data`
- WHEN each is read
- THEN each MUST contain a table of criteria comparing at least three options
- AND none MUST state that one option is the only correct choice

### Requirement: React skills cover modern defaults and LLM antipatterns
React skills MUST present modern React 19 defaults and flag these antipatterns: `useEffect` for derived state, `forwardRef`, `defaultProps`, `React.FC`, and blanket `useMemo`/`useCallback` under the React Compiler.

#### Scenario: Antipattern coverage
- GIVEN the files under `skills/react/`
- WHEN they are searched for each antipattern name
- THEN `useEffect` derived state and blanket memoization MUST be covered in `react-hooks`
- AND `forwardRef` and `defaultProps` MUST be covered in `react-core`
- AND `React.FC` MUST be covered in `react-typescript`

#### Scenario: Sources checked against official docs
- GIVEN a React skill states an API or version
- WHEN it is authored
- THEN the statement MUST be verified against react.dev or the library documentation listed in `metadata.sources`
