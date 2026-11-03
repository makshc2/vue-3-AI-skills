import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'
import { listCatalogSkills } from '../bin/lib/catalog.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const INSTALLER = join(ROOT, 'bin/install.js')
const CATALOG = listCatalogSkills()

function run(args, target) {
  return spawnSync(process.execPath, [
    INSTALLER, 'install', ...args, '--yes', '--agent', 'cursor', '--target', target,
  ], { encoding: 'utf8' })
}

function withTarget(fn) {
  const target = mkdtempSync(join(tmpdir(), 'legacy-selection-'))
  try {
    return fn(target)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
}

function installed(target) {
  const dir = join(target, '.cursor/skills')
  return existsSync(dir) ? readdirSync(dir).sort() : []
}

function select(args) {
  return withTarget((target) => {
    const r = run(args, target)
    return { status: r.status, stderr: r.stderr, skills: installed(target) }
  })
}

describe('legacy selection (characterization)', () => {
  it('--category vue --skill vue-core installs only vue-core', () => {
    expect(select(['--category', 'vue', '--skill', 'vue-core']).skills).toEqual(['vue-core'])
  })

  it('repeated --skill installs exactly those skills', () => {
    expect(select(['--skill', 'vite', '--skill', 'typescript-core']).skills)
      .toEqual(['typescript-core', 'vite'])
  })

  it('two categories install every skill of both', () => {
    const expected = CATALOG
      .filter((s) => s.category === 'vue' || s.category === 'css')
      .map((s) => s.name).sort()
    expect(select(['--category', 'vue', '--category', 'css']).skills).toEqual(expected)
  })

  it('--all --skill vite installs only vite', () => {
    expect(select(['--all', '--skill', 'vite']).skills).toEqual(['vite'])
  })

  it('--all --category css installs exactly the css category', () => {
    const expected = CATALOG.filter((s) => s.category === 'css').map((s) => s.name).sort()
    expect(select(['--all', '--category', 'css']).skills).toEqual(expected)
  })

  it('an unknown category exits 1 with No matching skills and installs nothing', () => {
    const r = select(['--category', 'nope'])
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/No matching skills/)
    expect(r.skills).toEqual([])
  })

  it('an unknown skill exits 1 with No matching skills and installs nothing', () => {
    const r = select(['--skill', 'nope-skill'])
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/No matching skills/)
    expect(r.skills).toEqual([])
  })

  it('--all installs the whole catalog', () => {
    expect(select(['--all']).skills).toEqual(CATALOG.map((s) => s.name).sort())
  })

  it('--yes without selectors installs the 9 default skills', () => {
    expect(select([]).skills.length).toBe(9)
  })
})
