## Purpose

packaging — requirements merged from change fix-known-catalog-defects.

## Requirements

### Requirement: Pre-publish test gate
The package manifest MUST declare a `prepublishOnly` script that runs `npm test`, so that a failing test suite stops `npm publish` before anything is uploaded.

#### Scenario: Gate is declared
- GIVEN `package.json`
- WHEN its `scripts` section is read
- THEN `prepublishOnly` MUST equal `npm test`

#### Scenario: Failing suite blocks publish
- GIVEN at least one failing test
- WHEN `npm run prepublishOnly` runs
- THEN the command MUST exit with a non-zero status
- AND `npm publish` MUST stop before uploading the package

### Requirement: Test suite honors the declared Node range
Every test case that calls a runtime API introduced after the minimum Node version declared in `engines.node` MUST skip itself, rather than fail, when the running Node lacks that API.

#### Scenario: Runtime without Object.groupBy
- GIVEN `engines.node` is `>=18` and the runtime has no `Object.groupBy` (Node older than 21)
- WHEN `npm test` runs
- THEN the `Object.groupBy` case MUST be reported as skipped
- AND the run MUST NOT fail because of that case

#### Scenario: Runtime with Object.groupBy
- GIVEN a runtime that provides `Object.groupBy` (Node 21 or newer)
- WHEN `npm test` runs
- THEN the `Object.groupBy` case MUST run and pass
