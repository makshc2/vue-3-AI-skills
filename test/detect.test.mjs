import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, it, expect } from 'vitest'
import { readProjectDeps, detectPresets, VUE2_NOTE } from '../bin/lib/detect.js'

const MANIFEST = {
  version: 1,
  default: 'vue',
  presets: {
    vue: { skills: ['vue-core'], detect: { dependencies: ['vue'] } },
    react: { skills: ['react-core'], detect: { dependencies: ['react'] } },
    typescript: {
      skills: ['typescript-core'],
      detect: { dependencies: ['typescript'], files: ['tsconfig.json'], fallbackOnly: true },
    },
  },
}

function withProject(files, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'detect-'))
  try {
    for (const [name, content] of Object.entries(files)) {
      writeFileSync(join(dir, name), content)
    }
    return fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function detectIn(dir) {
  return detectPresets(MANIFEST, readProjectDeps(dir), {
    fileExists: (f) => existsSync(join(dir, f)),
  })
}

const pkg = (obj) => JSON.stringify(obj)
const names = (result) => result.presets.map((p) => p.name).sort()

describe('detectPresets', () => {
  it('detects react from dependencies', () => {
    withProject({ 'package.json': pkg({ dependencies: { react: '^19.0.0' } }) }, (dir) => {
      expect(names(detectIn(dir))).toEqual(['react'])
    })
  })

  it('detects react from devDependencies and from peerDependencies', () => {
    withProject({ 'package.json': pkg({ devDependencies: { react: '^19.0.0' } }) }, (dir) => {
      expect(names(detectIn(dir))).toEqual(['react'])
    })
    withProject({ 'package.json': pkg({ peerDependencies: { react: '19' } }) }, (dir) => {
      expect(names(detectIn(dir))).toEqual(['react'])
    })
  })

  it('detects vue 3', () => {
    withProject({ 'package.json': pkg({ dependencies: { vue: '^3.4.0' } }) }, (dir) => {
      const result = detectIn(dir)
      expect(names(result)).toEqual(['vue'])
      expect(result.notes).toEqual([])
    })
  })

  it.each(['^2.6.14', '2.x', '~2.7'])('does not detect vue %s and reports a note', (range) => {
    withProject({ 'package.json': pkg({ dependencies: { vue: range } }) }, (dir) => {
      const result = detectIn(dir)
      expect(names(result)).toEqual([])
      expect(result.notes).toEqual([VUE2_NOTE])
    })
  })

  it.each(['workspace:*', 'catalog:', 'latest', 'npm:vue@3'])(
    'treats the %s range as present',
    (range) => {
      withProject({ 'package.json': pkg({ dependencies: { vue: range } }) }, (dir) => {
        expect(names(detectIn(dir))).toEqual(['vue'])
      })
    }
  )

  it('prefers react over the typescript fallback', () => {
    withProject(
      { 'package.json': pkg({ dependencies: { react: '19', typescript: '5' } }) },
      (dir) => expect(names(detectIn(dir))).toEqual(['react'])
    )
  })

  it('falls back to typescript when nothing else matches', () => {
    withProject({ 'package.json': pkg({ devDependencies: { typescript: '^5.5.0' } }) }, (dir) => {
      expect(names(detectIn(dir))).toEqual(['typescript'])
    })
  })

  it('detects typescript from tsconfig.json without a package.json', () => {
    withProject({ 'tsconfig.json': '{}' }, (dir) => {
      expect(readProjectDeps(dir).status).toBe('missing')
      expect(names(detectIn(dir))).toEqual(['typescript'])
    })
  })

  it('reports a missing package.json and detects nothing', () => {
    withProject({}, (dir) => {
      expect(readProjectDeps(dir)).toEqual({ status: 'missing', deps: {} })
      expect(detectIn(dir).presets).toEqual([])
    })
  })

  it('reports an invalid package.json without throwing', () => {
    withProject({ 'package.json': '{ not json' }, (dir) => {
      expect(readProjectDeps(dir)).toEqual({ status: 'invalid', deps: {} })
      expect(() => detectIn(dir)).not.toThrow()
      expect(detectIn(dir).presets).toEqual([])
    })
  })
})
