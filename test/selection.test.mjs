import { describe, it, expect, vi } from 'vitest'
import { resolveSelection, BUDGET_WARNING } from '../bin/lib/selection.js'

const MANIFEST = {
  version: 1,
  default: 'vue',
  presets: {
    vue: { label: 'Vue', skills: ['vue-core', 'vite'], detect: { dependencies: ['vue'] } },
    react: { label: 'React', skills: ['react-core', 'vite'], detect: { dependencies: ['react'] } },
    web: { label: 'Web', skills: ['css-core', 'html-core'] },
    full: { label: 'Full', skills: '*' },
  },
  unlisted: {},
}

const CATALOG = [
  { name: 'vue-core', category: 'vue' },
  { name: 'vue-router', category: 'vue' },
  { name: 'react-core', category: 'react' },
  { name: 'css-core', category: 'css' },
  { name: 'html-core', category: 'html' },
  { name: 'vite', category: 'vite' },
]
const ALL = CATALOG.map((s) => s.name)

function resolve(options = {}, detect = () => ({ presets: [], notes: [] })) {
  return resolveSelection({
    options: { presets: [], categories: [], skills: [], all: false, ...options },
    manifest: MANIFEST,
    catalogSkills: CATALOG,
    detect,
  })
}

const sorted = (r) => [...r.skills].sort()

describe('resolveSelection without a preset (legacy)', () => {
  it('uses the default preset with no selectors', () => {
    const r = resolve()
    expect(r.mode).toBe('default')
    expect(sorted(r)).toEqual(['vite', 'vue-core'])
    expect(r.warnings).toEqual([])
  })

  it('handles a category only', () => {
    expect(sorted(resolve({ categories: ['vue'] }))).toEqual(['vue-core', 'vue-router'])
  })

  it('handles --skill only', () => {
    expect(sorted(resolve({ skills: ['vite'] }))).toEqual(['vite'])
  })

  it('intersects --category with --skill', () => {
    expect(sorted(resolve({ categories: ['vue'], skills: ['vue-core'] }))).toEqual(['vue-core'])
  })

  it('installs the whole catalog for --all with a budget warning', () => {
    const r = resolve({ all: true })
    expect(r.mode).toBe('all')
    expect(sorted(r)).toEqual([...ALL].sort())
    expect(r.warnings).toEqual([BUDGET_WARNING])
  })

  it('--all --skill vite narrows to vite with no warning', () => {
    const r = resolve({ all: true, skills: ['vite'] })
    expect(r.mode).toBe('explicit')
    expect(r.skills).toEqual(['vite'])
    expect(r.warnings).toEqual([])
  })

  it('--all --category css narrows to css', () => {
    expect(sorted(resolve({ all: true, categories: ['css'] }))).toEqual(['css-core'])
  })

  it.each([{ categories: ['nope'] }, { skills: ['nope-skill'] }])(
    'leaves %o empty instead of falling back to the default',
    (options) => {
      const r = resolve(options)
      expect(r.skills).toEqual([])
      expect(r.mode).toBe('explicit')
    }
  )
})

describe('resolveSelection with a preset', () => {
  it('resolves a single preset', () => {
    expect(sorted(resolve({ presets: ['web'] }))).toEqual(['css-core', 'html-core'])
  })

  it('unions several presets without duplicates', () => {
    const r = resolve({ presets: ['vue', 'react'] })
    expect(sorted(r)).toEqual(['react-core', 'vite', 'vue-core'])
  })

  it('unions a preset with --skill', () => {
    expect(sorted(resolve({ presets: ['react'], skills: ['vue-core'] })))
      .toEqual(['react-core', 'vite', 'vue-core'])
  })

  it('unions a preset with a whole category', () => {
    expect(sorted(resolve({ presets: ['vue'], categories: ['css'] })))
      .toEqual(['css-core', 'vite', 'vue-core'])
  })

  it('intersects category and skill filters before the union', () => {
    expect(sorted(resolve({ presets: ['react'], categories: ['vue'], skills: ['vue-core'] })))
      .toEqual(['react-core', 'vite', 'vue-core'])
  })

  it('ignores a filter that matches nothing', () => {
    expect(sorted(resolve({ presets: ['web'], skills: ['nope'] }))).toEqual(['css-core', 'html-core'])
  })

  it('lets --all win over the preset', () => {
    const r = resolve({ all: true, presets: ['web'] })
    expect(r.mode).toBe('all')
    expect(sorted(r)).toEqual([...ALL].sort())
  })

  it.each([{ presets: ['nope'] }, { presets: ['nope'], all: true }])(
    'rejects an unknown preset (%o)',
    (options) => {
      const r = resolve(options)
      expect(r.skills).toEqual([])
      expect(r.errors[0]).toContain('Unknown preset "nope"')
      expect(r.errors[0]).toContain('vue, react, web, full, auto')
    }
  )

  it('warns about the token budget for full', () => {
    expect(resolve({ presets: ['full'] }).warnings).toEqual([BUDGET_WARNING])
    expect(sorted(resolve({ presets: ['full'] }))).toEqual([...ALL].sort())
    expect(resolve({ presets: ['web'] }).warnings).toEqual([])
    expect(resolve().warnings).toEqual([])
  })
})

describe('resolveSelection with --preset auto', () => {
  it('uses the detected presets and forwards notes', () => {
    const detect = vi.fn(() => ({ presets: [{ name: 'react', reasons: [] }], notes: ['a note'] }))
    const r = resolve({ presets: ['auto'] }, detect)
    expect(sorted(r)).toEqual(['react-core', 'vite'])
    expect(r.messages).toContain('a note')
    expect(detect).toHaveBeenCalledTimes(1)
  })

  it('falls back to the default preset when nothing is detected', () => {
    const r = resolve({ presets: ['auto'] })
    expect(sorted(r)).toEqual(['vite', 'vue-core'])
    expect(r.messages.join('\n')).toContain('No stack detected')
  })

  it('unions auto with an explicit preset', () => {
    const detect = () => ({ presets: [{ name: 'react', reasons: [] }], notes: [] })
    expect(sorted(resolve({ presets: ['auto', 'web'] }, detect)))
      .toEqual(['css-core', 'html-core', 'react-core', 'vite'])
  })

  it('never calls detect without auto', () => {
    const detect = vi.fn(() => ({ presets: [], notes: [] }))
    resolve({ presets: ['web'] }, detect)
    resolve({ categories: ['vue'] }, detect)
    resolve({}, detect)
    expect(detect).not.toHaveBeenCalled()
  })
})
