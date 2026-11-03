import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { loadManifest, presetNames, resolvePreset, validateManifest } from '../bin/lib/presets.js'
import { listCatalogSkills } from '../bin/lib/catalog.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = loadManifest()
const catalog = listCatalogSkills()
const catalogNames = catalog.map((s) => s.name)

function skillPath(name) {
  const entry = catalog.find((s) => s.name === name)
  return entry.name === entry.category
    ? join(ROOT, 'skills', entry.category, 'SKILL.md')
    : join(ROOT, 'skills', entry.category, entry.name, 'SKILL.md')
}

const VUE_PRESET = [
  'typescript-core',
  'typescript-vue',
  'vite',
  'vue-axios',
  'vue-composables',
  'vue-core',
  'vue-pinia',
  'vue-router',
  'vue-testing',
]

describe('presets manifest', () => {
  it('is valid against the real catalog', () => {
    expect(validateManifest(manifest, catalogNames)).toEqual([])
  })

  it('has the expected default preset', () => {
    expect(manifest.default).toBe('vue')
    expect([...manifest.presets.vue.skills].sort()).toEqual(VUE_PRESET)
  })

  it('resolves "full" to the whole catalog', () => {
    expect(resolvePreset(manifest, 'full', catalogNames).sort()).toEqual([...catalogNames].sort())
  })

  it('marks every manual-only skill as disable-model-invocation', () => {
    const manualOnly = Object.entries(manifest.unlisted ?? {})
      .filter(([, reason]) => reason === 'manual-only')
      .map(([name]) => name)
    expect(manualOnly.length).toBeGreaterThan(0)
    for (const name of manualOnly) {
      const content = readFileSync(skillPath(name), 'utf8')
      expect(content, name).toMatch(/^disable-model-invocation:\s*true\s*$/m)
    }
  })

  it('throws for an unknown preset and lists the available ones', () => {
    expect(() => resolvePreset(manifest, 'nope', catalogNames)).toThrow(/Unknown preset "nope"/)
    expect(() => resolvePreset(manifest, 'nope', catalogNames)).toThrow(
      new RegExp(presetNames(manifest).join(', '))
    )
  })

  describe('validateManifest negative fixtures', () => {
    const names = ['alpha', 'beta', 'gamma']
    const base = () => ({
      version: 1,
      default: 'one',
      presets: {
        one: { label: 'One', skills: ['alpha', 'beta'] },
        all: { label: 'All', skills: '*' },
      },
      unlisted: { gamma: 'on-demand' },
    })

    it('accepts the base fixture', () => {
      expect(validateManifest(base(), names)).toEqual([])
    })

    it('rejects an unknown skill', () => {
      const m = base()
      m.presets.one.skills.push('missing')
      expect(validateManifest(m, names).join('\n')).toMatch(/unknown skill "missing"/)
    })

    it('rejects an uncovered catalog skill', () => {
      const m = base()
      delete m.unlisted.gamma
      expect(validateManifest(m, names).join('\n')).toMatch(/"gamma" is in no preset/)
    })

    it('rejects a bad unlisted reason', () => {
      const m = base()
      m.unlisted.gamma = 'whenever'
      expect(validateManifest(m, names).join('\n')).toMatch(/invalid reason "whenever"/)
    })

    it('rejects a missing default', () => {
      const m = base()
      m.default = 'nope'
      expect(validateManifest(m, names).join('\n')).toMatch(/default "nope" is not a known preset/)
    })

    it('rejects a skill that is both in a preset and unlisted', () => {
      const m = base()
      m.unlisted.alpha = 'on-demand'
      expect(validateManifest(m, names).join('\n')).toMatch(/both in a preset and in unlisted/)
    })

    it('rejects a wrong version and duplicate entries', () => {
      const m = base()
      m.version = 2
      m.presets.one.skills = ['alpha', 'alpha', 'beta']
      const errors = validateManifest(m, names).join('\n')
      expect(errors).toMatch(/version must be 1/)
      expect(errors).toMatch(/lists skill "alpha" twice/)
    })
  })
})
