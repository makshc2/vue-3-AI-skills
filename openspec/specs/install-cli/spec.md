# install-cli Specification

## Purpose

Defines CLI behavior for listing and installing skills into Cursor, Amp, and Claude Code directories.

## Requirements

### Requirement: Install command
The CLI MUST copy selected skills into the target agent's skills directory.

#### Scenario: Default install to Cursor
- GIVEN the user runs `npx frontend-agent-skills install --yes`
- WHEN install completes
- THEN the default token-light skill set MUST be copied under `.cursor/skills/` in the target project
- AND the set MUST include `vue-core`, `vue-pinia`, `vue-axios`, `vue-router`, `vue-composables`, `vue-testing`, `typescript-vue`, `typescript-core`, and `vite`
- AND it MUST NOT install the full catalog (`vueuse`, `javascript-core`, etc.) unless `--all`, `--category`, or `--skill` is passed

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
The CLI MUST support installing by category and by individual skill name.

#### Scenario: Category filter
- GIVEN `--category vue`
- WHEN install runs
- THEN only skills from the `vue` category MUST be installed

#### Scenario: Skill filter
- GIVEN one or more `--skill <name>` flags
- WHEN install runs
- THEN only the named skills MUST be installed

### Requirement: List command
The CLI MUST list available categories and skills without modifying the filesystem.

#### Scenario: List output
- GIVEN `npx frontend-agent-skills list`
- WHEN the command runs
- THEN it MUST print categories and their skill names
- AND it MUST exit successfully
