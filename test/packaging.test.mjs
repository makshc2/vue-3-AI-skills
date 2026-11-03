import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const lock = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'))

function lowerBound(range) {
  // for `a || b` take the smallest alternative
  const alternatives = String(range).split('||')
  const tuples = []
  for (const alt of alternatives) {
    const match = alt.match(/(\d+)\.(\d+)\.(\d+)|(\d+)\.(\d+)|(\d+)/)
    if (!match) continue
    const nums = match[0].split('.').map(Number)
    while (nums.length < 3) nums.push(0)
    tuples.push(nums)
  }
  if (tuples.length === 0) return null
  return tuples.sort(compare)[0]
}

function compare(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

let packed
function packFiles() {
  if (!packed) {
    const out = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT, encoding: 'utf8' })
    packed = JSON.parse(out)[0].files.map((f) => f.path)
  }
  return packed
}

describe('packaging', () => {
  it('pins @clack/prompts to an exact version', () => {
    expect(pkg.dependencies['@clack/prompts']).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('has the same version in package-lock.json', () => {
    expect(lock.packages['node_modules/@clack/prompts'].version)
      .toBe(pkg.dependencies['@clack/prompts'])
  })

  it('declares an engines.node floor not below any runtime dependency', () => {
    const ours = lowerBound(pkg.engines.node)
    for (const [path, entry] of Object.entries(lock.packages)) {
      if (!path || entry.dev) continue
      const range = entry.engines?.node
      if (!range) continue
      const required = lowerBound(range)
      if (!required) continue
      expect(compare(ours, required), `${path} requires node ${range}`).toBeGreaterThanOrEqual(0)
    }
  })

  it('ships the preset manifest and every bin/lib module, but no specs or tests', () => {
    const files = packFiles()
    expect(files).toContain('bin/presets.json')
    for (const name of readdirSync(join(ROOT, 'bin/lib')).filter((f) => f.endsWith('.js'))) {
      expect(files).toContain(`bin/lib/${name}`)
    }
    expect(files.filter((f) => f.startsWith('openspec/'))).toEqual([])
    expect(files.filter((f) => f.startsWith('test/'))).toEqual([])
  })
})

describe('documentation', () => {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
  const roadmap = readFileSync(join(ROOT, 'docs/improvement-roadmap.md'), 'utf8')

  it('documents the Node requirement', () => {
    expect(readme).toContain('20.12')
  })

  it('has a Presets heading', () => {
    expect(readme).toMatch(/^#{2,4} .*Presets/m)
  })

  it('documents --preset auto and the react category', () => {
    expect(readme).toContain('--preset auto')
    expect(readme).toContain('--category react')
  })

  it('no longer claims the installer has no dependencies', () => {
    expect(readme.toLowerCase()).not.toContain('no dependencies')
    expect(roadmap.toLowerCase()).not.toContain('no dependencies')
  })
})
