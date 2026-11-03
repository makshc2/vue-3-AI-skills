## MODIFIED Requirements

### Requirement: Install command
The CLI MUST copy selected skills into the target agent's skills directory.

#### Scenario: Default install to Cursor
- GIVEN the user runs `npx frontend-agent-skills install --yes`
- WHEN install completes
- THEN the default token-light skill set MUST be copied under `.cursor/skills/` in the target project
- AND the set MUST include `vue-core`, `vue-pinia`, `vue-axios`, `vue-router`, `vue-composables`, `vue-testing`, `typescript-vue`, `typescript-core`, and `vite`
- AND it MUST NOT install the full catalog (`vueuse`, `javascript-core`, etc.) unless `--all`, `--category`, `--skill`, or `--preset` is passed

#### Scenario: Full catalog install
- GIVEN the user runs `npx frontend-agent-skills install --all --yes`
- WHEN install completes
- THEN every published skill under `skills/` MUST be copied into the target agent skills directory

#### Scenario: Amp agent target
- GIVEN `--agent amp`
- WHEN install runs
- THEN skills MUST be copied under `.agents/skills/`

#### Scenario: Claude Code agent target
- GIVEN `--agent claude`
- WHEN install runs
- THEN skills MUST be copied under `.claude/skills/`

### Requirement: Category and skill filters
The CLI MUST support installing by category and by individual skill name. Without `--preset` the flags keep their existing meaning (see "Selection without a preset"); with `--preset` they add to the preset (see "Selector combination").

#### Scenario: Category filter
- GIVEN `--category vue` and no `--preset`
- WHEN install runs
- THEN only skills from the `vue` category MUST be installed

#### Scenario: Skill filter
- GIVEN one or more `--skill <name>` flags and no `--preset`
- WHEN install runs
- THEN only the named skills MUST be installed

#### Scenario: Filters with a preset
- GIVEN `--preset react --category css`
- WHEN install runs
- THEN the `css` skills MUST be installed in addition to the `react` preset skills, as defined by "Selector combination"

### Requirement: List command
The CLI MUST list available categories, their skills, and the available presets without modifying the filesystem.

#### Scenario: List output
- GIVEN `npx frontend-agent-skills list`
- WHEN the command runs
- THEN it MUST print categories and their skill names
- AND it MUST exit successfully

#### Scenario: List shows presets
- GIVEN `npx frontend-agent-skills list`
- WHEN the command runs
- THEN it MUST print every preset name from the manifest with its skill count
- AND it MUST NOT create or modify any file

## ADDED Requirements

### Requirement: Preset manifest
Install presets MUST be defined as data in `bin/presets.json`, not in code. Each preset MUST list catalog skill names (or `*` for the whole catalog), and every catalog skill MUST belong to at least one preset or be listed in `unlisted` with a reason, either `manual-only` or `on-demand`.

#### Scenario: Preset skills exist
- GIVEN `bin/presets.json`
- WHEN the integrity test runs
- THEN every skill name listed in a preset MUST match an existing skill folder under `skills/`

#### Scenario: Every skill is covered
- GIVEN the catalog discovered from `skills/`
- WHEN the integrity test runs
- THEN each skill MUST appear in at least one preset or in `unlisted`
- AND a skill added without either entry MUST fail the test

#### Scenario: Manual-only entries
- GIVEN an `unlisted` entry with reason `manual-only`
- WHEN the integrity test runs
- THEN that skill's frontmatter MUST contain `disable-model-invocation: true`

### Requirement: Preset contents
The manifest MUST define the presets `vue`, `react`, `typescript`, `javascript`, `web`, `design`, and `full` with exactly the skills listed in the scenarios below. A different composition is a manifest change and MUST update these scenarios.

#### Scenario: Vue preset
- GIVEN the `vue` preset
- WHEN its skills are read
- THEN they MUST be exactly `vue-core`, `vue-pinia`, `vue-axios`, `vue-router`, `vue-composables`, `vue-testing`, `typescript-vue`, `typescript-core`, and `vite`

#### Scenario: React preset
- GIVEN the `react` preset
- WHEN its skills are read
- THEN they MUST be exactly `react-core`, `react-hooks`, `react-typescript`, `react-state`, `react-router`, `react-data`, `react-testing`, `typescript-core`, and `vite`
- AND `react-debug` MUST NOT be in it

#### Scenario: TypeScript preset
- GIVEN the `typescript` preset
- WHEN its skills are read
- THEN they MUST be exactly `typescript-core`, `typescript-types`, `typescript-config`, `typescript-testing`, and `typescript-debug`

#### Scenario: JavaScript preset
- GIVEN the `javascript` preset
- WHEN its skills are read
- THEN they MUST be exactly the seven skills of the `javascript` category

#### Scenario: Web preset
- GIVEN the `web` preset
- WHEN its skills are read
- THEN they MUST be exactly `html-core`, `html-forms`, `html-a11y`, `css-core`, `css-layout`, `css-responsive`, and `css-animations`

#### Scenario: Design preset
- GIVEN the `design` preset
- WHEN its skills are read
- THEN they MUST be exactly `design-transfer`, `design-from-screenshot`, and `figma-intake`

#### Scenario: Full preset contents
- GIVEN the `full` preset
- WHEN it is resolved
- THEN it MUST resolve to every skill of the catalog

### Requirement: Default install comes from the default preset
A run that selects no skills (no `--all`, `--category`, `--skill`, `--preset`) in a non-interactive context MUST install exactly the skills of the preset named by `default` in the manifest, and that preset MUST be `vue` with nine skills.

#### Scenario: Yes flag without selectors
- GIVEN `install --yes --agent cursor` in an empty target
- WHEN install completes
- THEN `.cursor/skills/` MUST contain exactly `typescript-core`, `typescript-vue`, `vite`, `vue-axios`, `vue-composables`, `vue-core`, `vue-pinia`, `vue-router`, `vue-testing`

#### Scenario: Non-TTY without flags
- GIVEN stdin is not a TTY and no flags other than `--target` are passed
- WHEN install runs
- THEN the agent MUST default to Cursor and the nine default skills MUST be installed

### Requirement: Preset flag
`--preset <name>` MUST add every skill of the named preset to the installation and MAY be repeated; the result MUST be the union of the named presets. `--preset full` MUST install the whole catalog.

#### Scenario: Single preset
- GIVEN `install --preset web --agent cursor --yes`
- WHEN install completes
- THEN exactly the skills of the `web` preset MUST be installed

#### Scenario: Two presets
- GIVEN `--preset vue --preset web`
- WHEN install completes
- THEN the installed set MUST equal the union of the `vue` and `web` presets, with shared skills copied once

#### Scenario: Full preset
- GIVEN `--preset full`
- WHEN install completes
- THEN the installed set MUST equal the set installed by `--all`

### Requirement: Invalid preset input
An unknown preset name, or `--preset` with no value, MUST end the run with exit code 1 and an error message that names the available presets, before any file is written.

#### Scenario: Unknown preset
- GIVEN `install --preset nope --yes`
- WHEN the command runs
- THEN it MUST exit with code 1
- AND the message MUST list the available preset names
- AND the target directory MUST contain no skills

#### Scenario: Missing value
- GIVEN `install --preset` as the last argument
- WHEN the command runs
- THEN it MUST exit with code 1 and write no files

### Requirement: Selection without a preset
Without `--preset`, selection MUST keep the existing behavior: `--category` and `--skill` select their intersection (a missing flag does not restrict), `--all` alone selects the whole catalog and does not widen `--category` or `--skill`, and a selection that matches no skill MUST exit with code 1 and the message `No matching skills`.

#### Scenario: All with skill
- GIVEN `--all --skill vite` and no `--preset`
- WHEN install completes
- THEN only `vite` MUST be installed

#### Scenario: All with category
- GIVEN `--all --category css` and no `--preset`
- WHEN install completes
- THEN only the skills of the `css` category MUST be installed

#### Scenario: Category with skill
- GIVEN `--category vue --skill vue-core` and no `--preset`
- WHEN install completes
- THEN only `vue-core` MUST be installed

#### Scenario: Unknown category or skill
- GIVEN `--category nope` (or `--skill nope-skill`) and no `--preset`
- WHEN install runs
- THEN it MUST exit with code 1 and print `No matching skills`
- AND the default preset MUST NOT be installed

### Requirement: Selector combination
When `--preset` is present, the installed set MUST be the union of the preset skills and the skills selected by `--category` and `--skill` (their intersection when both are given), and `--all` MUST take precedence and select the whole catalog.

#### Scenario: Preset with skill
- GIVEN `--preset react --skill vue-core`
- WHEN install completes
- THEN the installed set MUST be the `react` preset skills plus `vue-core`

#### Scenario: Preset with category
- GIVEN `--preset vue --category css`
- WHEN install completes
- THEN the installed set MUST be the `vue` preset skills plus every skill of the `css` category

#### Scenario: Preset with category and skill
- GIVEN `--preset react --category vue --skill vue-core`
- WHEN install completes
- THEN the installed set MUST be the `react` preset skills plus `vue-core`

#### Scenario: All with preset
- GIVEN `--all --preset web`
- WHEN install completes
- THEN every published skill MUST be installed

### Requirement: Stack auto-detection
`--preset auto` MUST pick presets by matching dependency names from `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies` of the target `package.json`, and marker files, against the manifest `detect` rules, without network access or writes. A `fallbackOnly` preset MUST apply only when no other preset matched.

#### Scenario: React project
- GIVEN the target `package.json` lists `react` and `typescript`
- WHEN `install --preset auto --yes` runs
- THEN the `react` preset MUST be installed
- AND the `typescript` preset MUST NOT be added, because it is `fallbackOnly`

#### Scenario: TypeScript-only project
- GIVEN the target `package.json` lists `typescript` and neither `vue` nor `react`
- WHEN `install --preset auto --yes` runs
- THEN the `typescript` preset MUST be installed

#### Scenario: Vue 2 project
- GIVEN the target `package.json` lists `vue` with a range whose major version is 2
- WHEN detection runs
- THEN the `vue` preset MUST NOT be detected
- AND the output MUST explain that Vue 2 is not supported by the Vue skills

#### Scenario: Auto combined with a name
- GIVEN `--preset auto --preset web` and a target with `react`
- WHEN install completes
- THEN the installed set MUST be the union of `react` and `web`

#### Scenario: Target directory respected
- GIVEN `--target <dir>` and a `package.json` in that directory
- WHEN detection runs
- THEN the `package.json` of `<dir>` MUST be used, not the one in the current directory

### Requirement: Auto-detection fallback
When `--preset auto` matches no preset, or `package.json` is missing or unreadable, the CLI MUST install the default preset, MUST print a message saying so, and MUST NOT fail.

#### Scenario: No package.json
- GIVEN an empty target and `--preset auto --yes`
- WHEN install completes
- THEN the nine default skills MUST be installed
- AND the output MUST state that no stack was detected and the default preset was used
- AND the exit code MUST be 0

#### Scenario: Malformed package.json
- GIVEN a target whose `package.json` is not valid JSON
- WHEN `--preset auto --yes` runs
- THEN the run MUST fall back to the default preset and exit 0

### Requirement: Interactive menu
In a TTY (stdin and stdout), with `CI` unset, without `--yes`, and without `--all`, `--category`, `--skill`, or `--preset`, `install` MUST show a menu whose items are presets. Detected presets MUST be preselected; when none is detected the default preset MUST be preselected; at least one item MUST be chosen.

#### Scenario: Detected stack preselected
- GIVEN a TTY and a target `package.json` with `react`
- WHEN the menu opens
- THEN the `react` item MUST be preselected

#### Scenario: Nothing detected
- GIVEN a TTY and a target without recognizable dependencies
- WHEN the menu opens
- THEN only the default preset item MUST be preselected

#### Scenario: Agent question skipped
- GIVEN the menu is shown and `--agent claude` was passed
- WHEN the preset choice is confirmed
- THEN no agent question MUST be asked

### Requirement: Non-interactive behavior unchanged
In a non-TTY run, with `CI` set, with `--yes`, or with any of `--all`, `--category`, `--skill`, `--preset`, `install` MUST NOT show the menu, MUST NOT read a preset choice from stdin, and MUST keep the existing agent selection and skill selection behavior.

#### Scenario: Selection flag in a TTY
- GIVEN a TTY and `--category javascript`
- WHEN install runs
- THEN no menu MUST be shown
- AND only the `javascript` category skills MUST be installed

#### Scenario: Yes flag in a TTY
- GIVEN a TTY and `--yes`
- WHEN install runs
- THEN no menu MUST be shown
- AND the nine default skills MUST be installed for the default agent

#### Scenario: CI environment
- GIVEN `CI` is set and no selection flags are passed
- WHEN install runs
- THEN no menu MUST be shown

### Requirement: Menu cancellation
When the user cancels the menu (Esc or Ctrl+C), the CLI MUST exit with a non-zero code and MUST NOT create or modify any file in the target directory.

#### Scenario: Cancel at preset step
- GIVEN the menu is open
- WHEN the user presses Esc
- THEN the exit code MUST be non-zero
- AND the target directory MUST stay unchanged

#### Scenario: Cancel at agent step
- GIVEN the preset step was confirmed and the agent question is open
- WHEN the user presses Ctrl+C
- THEN the exit code MUST be non-zero
- AND no skill files MUST be written

### Requirement: Menu summary
After a menu selection and before copying files, the CLI MUST print the number of distinct skills selected and the equivalent non-interactive command, which lists the resolved preset names instead of `auto`.

#### Scenario: Equivalent command printed
- GIVEN the user selects `vue` and `web` and agent `claude` in the menu
- WHEN the selection is confirmed
- THEN the output MUST include a command containing `--preset vue`, `--preset web`, and `--agent claude`
- AND it MUST include the count of distinct skills

### Requirement: Full catalog budget warning
When the installed set is the whole catalog because of `--preset full` or `--all` (including `--all` with `--preset`), the CLI MUST print a warning on stderr that the full catalog can exceed the agent skill-listing budget. The warning MUST NOT change the installed set or the exit code.

#### Scenario: All flag
- GIVEN `install --all --yes`
- WHEN install runs
- THEN stderr MUST contain the budget warning
- AND the installed set and exit code MUST equal those without the warning

#### Scenario: All narrowed by a filter
- GIVEN `install --all --skill vite --yes`
- WHEN install runs
- THEN no budget warning MUST be printed

#### Scenario: Default install
- GIVEN `install --yes`
- WHEN install runs
- THEN no budget warning MUST be printed

### Requirement: Prompt library isolation
The prompt library MUST be imported only by `bin/lib/prompter.js` and only when the menu is shown. Menu logic MUST depend on an injectable prompter interface so that tests run without a TTY.

#### Scenario: Single import site
- GIVEN the sources under `bin/`
- WHEN they are searched for imports of `@clack/prompts`
- THEN only `bin/lib/prompter.js` MUST contain one

#### Scenario: Menu test with a fake prompter
- GIVEN a fake prompter that returns preset names or a cancel marker
- WHEN the menu module runs in a test
- THEN it MUST produce the selection or the cancelled result without a TTY

### Requirement: Side-effect-free library modules
Preset resolution, detection, argument parsing, and selection MUST live in modules under `bin/lib/` that have no side effects on import. `bin/install.js` MUST NOT test whether it is the main module.

#### Scenario: Import in tests
- GIVEN a test that imports `bin/lib/presets.js` and `bin/lib/selection.js`
- WHEN the import runs
- THEN no install, prompt, or process exit MUST occur

#### Scenario: No main-module check
- GIVEN `bin/install.js`
- WHEN it is searched for comparisons of `process.argv[1]` with the module URL
- THEN none MUST be found

### Requirement: Usage text lists presets and categories
The `help` output MUST describe `--preset` with the available preset names, and the category list in it MUST be generated from the `skills/` directory, not hardcoded.

#### Scenario: Help output
- GIVEN `npx frontend-agent-skills help`
- WHEN the command runs
- THEN the output MUST include `--preset` and every preset name from the manifest
- AND it MUST list `react` among the categories once `skills/react/` exists
