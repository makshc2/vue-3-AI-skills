import { describe, it, expect, vi } from 'vitest'
import { shouldShowMenu, buildMenuOptions, runMenu, formatEquivalentCommand } from '../bin/lib/menu.js'
import { CANCELLED } from '../bin/lib/prompter.js'

const MANIFEST = {
  version: 1,
  default: 'vue',
  presets: {
    vue: { label: 'Vue 3', skills: ['vue-core', 'vite'] },
    react: { label: 'React', skills: ['react-core', 'vite'] },
    full: { label: 'Everything', skills: '*' },
  },
}
const CATALOG = ['vue-core', 'react-core', 'vite', 'css-core']

const baseOptions = { yes: false, all: false, categories: [], skills: [], presets: [] }
const show = (overrides = {}, extra = {}) =>
  shouldShowMenu({
    options: { ...baseOptions, ...overrides },
    stdinIsTTY: true,
    stdoutIsTTY: true,
    env: {},
    ...extra,
  })

function fakePrompter({ presets = ['vue'], agent = 'cursor' } = {}) {
  return {
    multiselect: vi.fn(async () => presets),
    select: vi.fn(async () => agent),
    info: vi.fn(),
    cancel: vi.fn(),
  }
}

const menu = (prompter, overrides = {}) =>
  runMenu({
    prompter,
    manifest: MANIFEST,
    catalogNames: CATALOG,
    detected: [],
    agentChoice: null,
    agentOptions: ['cursor', 'amp', 'claude'],
    defaultAgent: 'cursor',
    ...overrides,
  })

describe('shouldShowMenu', () => {
  it('is true for a clean interactive invocation', () => {
    expect(show()).toBe(true)
  })

  it('is false without a TTY on stdin or stdout', () => {
    expect(show({}, { stdinIsTTY: false })).toBe(false)
    expect(show({}, { stdoutIsTTY: false })).toBe(false)
  })

  it('is false under CI', () => {
    expect(show({}, { env: { CI: '1' } })).toBe(false)
  })

  it.each([
    ['yes', { yes: true }],
    ['all', { all: true }],
    ['category', { categories: ['vue'] }],
    ['skill', { skills: ['vite'] }],
    ['preset', { presets: ['web'] }],
  ])('is false with --%s', (_label, overrides) => {
    expect(show(overrides)).toBe(false)
  })
})

describe('buildMenuOptions', () => {
  it('keeps manifest order, counts skills and warns for full', () => {
    const options = buildMenuOptions(MANIFEST, CATALOG)
    expect(options.map((o) => o.value)).toEqual(['vue', 'react', 'full'])
    expect(options[0].hint).toContain('2 skills')
    expect(options[2].hint).toContain('4 skills')
    expect(options[2].hint).toMatch(/token-heavy/i)
  })
})

describe('runMenu', () => {
  it('preselects the detected presets', async () => {
    const prompter = fakePrompter()
    await menu(prompter, { detected: ['react'] })
    expect(prompter.multiselect.mock.calls[0][0].initialValues).toEqual(['react'])
  })

  it('preselects the default preset when nothing is detected', async () => {
    const prompter = fakePrompter()
    await menu(prompter)
    expect(prompter.multiselect.mock.calls[0][0].initialValues).toEqual(['vue'])
  })

  it('skips the agent step when the agent is already chosen', async () => {
    const prompter = fakePrompter()
    const result = await menu(prompter, { agentChoice: ['amp'] })
    expect(prompter.select).not.toHaveBeenCalled()
    expect(result.agents).toEqual(['amp'])
  })

  it('returns cancelled when the preset step is cancelled, without asking for an agent', async () => {
    const prompter = fakePrompter()
    prompter.multiselect = vi.fn(async () => CANCELLED)
    const result = await menu(prompter)
    expect(result).toEqual({ cancelled: true })
    expect(prompter.select).not.toHaveBeenCalled()
  })

  it('returns cancelled when the agent step is cancelled', async () => {
    const prompter = fakePrompter()
    prompter.select = vi.fn(async () => CANCELLED)
    expect(await menu(prompter)).toEqual({ cancelled: true })
  })

  it('returns the unique union of the chosen presets', async () => {
    const result = await menu(fakePrompter({ presets: ['vue', 'react'] }))
    expect(result.skills.sort()).toEqual(['react-core', 'vite', 'vue-core'])
    expect(result.cancelled).toBe(false)
  })

  it('expands the all agent choice', async () => {
    const result = await menu(fakePrompter({ agent: 'all' }))
    expect(result.agents).toEqual(['cursor', 'amp', 'claude'])
  })
})

describe('formatEquivalentCommand', () => {
  const base = { target: '/a', cwd: '/a', packageName: 'frontend-agent-skills' }

  it('collapses several agents to --agent all', () => {
    expect(formatEquivalentCommand({ ...base, presets: ['vue'], agents: ['cursor', 'amp', 'claude'] }))
      .toBe('npx frontend-agent-skills install --preset vue --agent all')
    expect(formatEquivalentCommand({ ...base, presets: ['vue'], agents: ['all'] }))
      .toBe('npx frontend-agent-skills install --preset vue --agent all')
  })

  it('adds --target when it differs from cwd', () => {
    expect(formatEquivalentCommand({ ...base, target: '/b', presets: ['vue'], agents: ['cursor'] }))
      .toBe('npx frontend-agent-skills install --preset vue --agent cursor --target /b')
  })

  it('repeats --preset for several presets', () => {
    expect(formatEquivalentCommand({ ...base, presets: ['vue', 'react'], agents: ['claude'] }))
      .toBe('npx frontend-agent-skills install --preset vue --preset react --agent claude')
  })
})
