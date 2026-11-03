import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'
import { listCatalogSkills } from '../bin/lib/catalog.js'
import { loadManifest, presetNames } from '../bin/lib/presets.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const INSTALLER = join(ROOT, 'bin/install.js')
const CATALOG = listCatalogSkills().map((s) => s.name).sort()
const MANIFEST = loadManifest()

function withTarget(files, fn) {
  const target = mkdtempSync(join(tmpdir(), 'cli-presets-'))
  try {
    for (const [name, content] of Object.entries(files ?? {})) {
      writeFileSync(join(target, name), content)
    }
    return fn(target)
  } finally {
    rmSync(target, { recursive: true, force: true })
  }
}

function installed(target) {
  const dir = join(target, '.cursor/skills')
  return existsSync(dir) ? readdirSync(dir).sort() : []
}

function install(args, files) {
  return withTarget(files, (target) => {
    const r = spawnSync(process.execPath, [
      INSTALLER, 'install', ...args, '--agent', 'cursor', '--target', target, '--yes',
    ], { encoding: 'utf8', input: '' })
    return {
      status: r.status,
      stdout: r.stdout,
      stderr: r.stderr,
      skills: installed(target),
      hasCursorDir: existsSync(join(target, '.cursor')),
    }
  })
}

function run(args, input = '') {
  return spawnSync(process.execPath, [INSTALLER, ...args], { encoding: 'utf8', input })
}

const BUDGET = /token-heavy/i

describe('cli presets', () => {
  it('--preset web installs exactly the 7 html/css skills', () => {
    const r = install(['--preset', 'web'])
    expect(r.skills).toEqual(MANIFEST.presets.web.skills.slice().sort())
    expect(r.skills.every((s) => s.startsWith('html-') || s.startsWith('css-'))).toBe(true)
  })

  it('--preset vue --preset web installs 16 unique skills', () => {
    expect(install(['--preset', 'vue', '--preset', 'web']).skills.length).toBe(16)
  })

  it('--preset full and --all --preset web match --all', () => {
    expect(install(['--preset', 'full']).skills).toEqual(CATALOG)
    expect(install(['--all', '--preset', 'web']).skills).toEqual(CATALOG)
    expect(install(['--all']).skills).toEqual(CATALOG)
  })

  it('--all --skill vite installs only vite and does not warn about the budget', () => {
    const r = install(['--all', '--skill', 'vite'])
    expect(r.skills).toEqual(['vite'])
    expect(r.stderr).not.toMatch(BUDGET)
  })

  it('--preset typescript installs 5 skills', () => {
    expect(install(['--preset', 'typescript']).skills.length).toBe(5)
  })

  it('an unknown preset exits 1, lists presets and writes nothing', () => {
    const r = install(['--preset', 'nope'])
    expect(r.status).toBe(1)
    for (const name of presetNames(MANIFEST)) expect(r.stderr).toContain(name)
    expect(r.hasCursorDir).toBe(false)
  })

  it('--preset without a value exits 1 and writes nothing', () => {
    const r = install(['--preset'])
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/--preset requires a value/)
    expect(r.hasCursorDir).toBe(false)
  })

  it('--preset auto detects vue 3 from package.json', () => {
    const r = install(['--preset', 'auto'], {
      'package.json': JSON.stringify({ dependencies: { vue: '^3.4.0' } }),
    })
    expect(r.skills).toEqual(MANIFEST.presets.vue.skills.slice().sort())
  })

  it('--preset auto without a package.json falls back to the default preset', () => {
    const r = install(['--preset', 'auto'])
    expect(r.status).toBe(0)
    expect(r.skills.length).toBe(9)
    expect(r.stdout).toMatch(/No stack detected/)
  })

  it('--preset auto detects typescript only', () => {
    const r = install(['--preset', 'auto'], {
      'package.json': JSON.stringify({ devDependencies: { typescript: '^5.5.0' } }),
    })
    expect(r.skills.length).toBe(5)
  })

  it('warns about the token budget for --all and --preset full but not for the default', () => {
    expect(install(['--all']).stderr).toMatch(BUDGET)
    expect(install(['--preset', 'full']).stderr).toMatch(BUDGET)
    expect(install([]).stderr).not.toMatch(BUDGET)
  })

  it('help lists --preset and every preset name', () => {
    const r = run(['help'])
    expect(r.stdout).toContain('--preset')
    for (const name of presetNames(MANIFEST)) expect(r.stdout).toContain(name)
  })

  it('list shows a Presets section', () => {
    const r = run(['list'])
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('Presets:')
  })

  it('install without flags and without a TTY installs the 9 default skills', () => {
    const target = mkdtempSync(join(tmpdir(), 'cli-presets-'))
    try {
      const r = spawnSync(process.execPath, [
        INSTALLER, 'install', '--target', target,
      ], { encoding: 'utf8', input: '' })
      expect(r.status).toBe(0)
      expect(installed(target).length).toBe(9)
    } finally {
      rmSync(target, { recursive: true, force: true })
    }
  })
})

describe('cli non-interactive paths', () => {
  function installRaw(args, env) {
    const target = mkdtempSync(join(tmpdir(), 'cli-presets-'))
    try {
      const r = spawnSync(process.execPath, [INSTALLER, 'install', '--target', target, ...args], {
        encoding: 'utf8',
        input: '',
        env: env ? { ...process.env, ...env } : process.env,
      })
      return { status: r.status, stdout: r.stdout, stderr: r.stderr, skills: installed(target) }
    } finally {
      rmSync(target, { recursive: true, force: true })
    }
  }

  it('shows no menu text over pipes and installs the 9 default skills', () => {
    const r = installRaw([])
    expect(r.status).toBe(0)
    expect(r.skills.length).toBe(9)
    expect(r.stdout).not.toContain('Cancelled')
    expect(r.stdout).not.toMatch(/Which skill preset/)
    expect(r.stdout).not.toMatch(/which agent/i)
  })

  it('behaves the same under CI=1', () => {
    const r = installRaw([], { CI: '1' })
    expect(r.status).toBe(0)
    expect(r.skills.length).toBe(9)
    expect(r.stdout).not.toContain('Cancelled')
  })

  it('--category javascript --yes installs only the 7 javascript skills', () => {
    const r = installRaw(['--category', 'javascript', '--yes', '--agent', 'cursor'])
    expect(r.skills.length).toBe(7)
    expect(r.skills.every((s) => s.startsWith('javascript-'))).toBe(true)
  })
})

describe('cli react preset', () => {
  const REACT_PRESET = [
    'react-core', 'react-hooks', 'react-typescript', 'react-state',
    'react-router', 'react-data', 'react-testing', 'typescript-core', 'vite',
  ].sort()

  it('--preset react installs the 9 preset skills and not react-debug', () => {
    const r = install(['--preset', 'react'])
    expect(r.skills).toEqual(REACT_PRESET)
    expect(r.skills).not.toContain('react-debug')
  })

  it('--skill react-debug installs only react-debug', () => {
    expect(install(['--skill', 'react-debug']).skills).toEqual(['react-debug'])
  })

  it('--preset auto installs the react preset for a react + typescript project', () => {
    const r = install(['--preset', 'auto'], {
      'package.json': JSON.stringify({
        dependencies: { react: '^19.0.0' },
        devDependencies: { typescript: '^5.5.0' },
      }),
    })
    expect(r.skills).toEqual(REACT_PRESET)
  })

  it('--preset auto installs the react preset for a react-only project', () => {
    const r = install(['--preset', 'auto'], {
      'package.json': JSON.stringify({ dependencies: { react: '^19.0.0' } }),
    })
    expect(r.skills).toEqual(REACT_PRESET)
  })

  it('--preset auto --preset web installs 16 unique skills for a react project', () => {
    const r = install(['--preset', 'auto', '--preset', 'web'], {
      'package.json': JSON.stringify({ dependencies: { react: '^19.0.0' } }),
    })
    expect(r.skills.length).toBe(16)
  })

  it('list shows the react category, react-debug and the react preset', () => {
    const r = run(['list'])
    expect(r.stdout).toContain('react/')
    expect(r.stdout).toContain('react-debug')
    expect(r.stdout).toMatch(/- react \(\d+ skills\)/)
  })
})
