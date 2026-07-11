# install-cli Specification

## Purpose

Defines CLI behavior for listing and installing skills into Cursor, Amp, and Claude Code directories.

## Requirements

### Requirement: Install command
The CLI MUST copy selected skills into the target agent's skills directory.

#### Scenario: Default install to Cursor
- GIVEN the user runs `npx frontend-agent-skills install --yes`
- WHEN install completes
- THEN skills MUST be copied under `.cursor/skills/` in the target project

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
