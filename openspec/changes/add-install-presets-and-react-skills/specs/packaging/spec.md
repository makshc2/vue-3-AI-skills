## MODIFIED Requirements

### Requirement: Test suite honors the declared Node range
Every test case that calls a runtime API introduced after the minimum Node version declared in `engines.node` MUST skip itself, rather than fail, when the running Node lacks that API.

#### Scenario: Runtime without Object.groupBy
- GIVEN `engines.node` allows a runtime without `Object.groupBy` (Node older than 21)
- WHEN `npm test` runs on such a runtime
- THEN the `Object.groupBy` case MUST be reported as skipped
- AND the run MUST NOT fail because of that case

#### Scenario: Runtime with Object.groupBy
- GIVEN a runtime that provides `Object.groupBy` (Node 21 or newer)
- WHEN `npm test` runs
- THEN the `Object.groupBy` case MUST run and pass

## ADDED Requirements

### Requirement: Exact-pinned runtime dependency
The package MUST declare its interactive prompt library in `dependencies` with an exact version (no range operator), and `package-lock.json` MUST resolve that package to the same version.

#### Scenario: Exact version declared
- GIVEN `package.json`
- WHEN `dependencies["@clack/prompts"]` is read
- THEN it MUST match `^\d+\.\d+\.\d+$`

#### Scenario: Lockfile agrees
- GIVEN `package-lock.json`
- WHEN the entry `node_modules/@clack/prompts` is read
- THEN its `version` MUST equal the version in `package.json`
- AND `npm ci --dry-run` MUST exit with code 0

### Requirement: Node floor covers runtime dependencies
`engines.node` MUST NOT allow a Node version below the highest minimum Node declared by any runtime dependency in `package-lock.json`.

#### Scenario: Floor at least the dependency minimum
- GIVEN the runtime dependencies resolved in `package-lock.json`
- WHEN their `engines.node` lower bounds are compared with `engines.node` of `package.json`
- THEN the `package.json` lower bound MUST be greater than or equal to the highest dependency lower bound

#### Scenario: Declared floor
- GIVEN the prompt library minimum Node is 20.12.0
- WHEN `package.json` is read
- THEN `engines.node` MUST be `>=20.12.0`

### Requirement: Published package ships preset data and modules
The published package MUST include `bin/presets.json` and every module under `bin/lib/`, so that the CLI runs from an installed copy.

#### Scenario: Pack contents
- GIVEN the repository
- WHEN `npm pack --dry-run --json` runs
- THEN its file list MUST include `bin/presets.json` and each `bin/lib/*.js` file
- AND it MUST NOT include `openspec/` or `test/`

### Requirement: README states runtime requirements
The README MUST state the minimum Node version, and MUST NOT claim that the package has no dependencies.

#### Scenario: Node requirement documented
- GIVEN `README.md`
- WHEN it is searched for the minimum Node version
- THEN it MUST name Node 20.12 or newer

#### Scenario: No dependency-free claim
- GIVEN `README.md` and `docs/improvement-roadmap.md`
- WHEN they are searched for statements that the installer has no dependencies
- THEN none MUST remain
