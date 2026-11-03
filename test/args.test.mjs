import { describe, it, expect } from 'vitest'
import { parseArgs } from '../bin/lib/args.js'

const AGENTS = ['cursor', 'amp', 'claude']
const parse = (argv) => parseArgs(argv, AGENTS)

describe('parseArgs', () => {
  it('collects repeated --preset values in lowercase', () => {
    const { options, errors } = parse(['--preset', 'Web', '--preset', 'react'])
    expect(options.presets).toEqual(['web', 'react'])
    expect(errors).toEqual([])
  })

  it('reports a missing --preset value at the end of argv', () => {
    const { options, errors } = parse(['--preset'])
    expect(errors).toEqual(['--preset requires a value'])
    expect(options.presets).toEqual([])
  })

  it('reports --preset followed by another flag', () => {
    const { options, errors } = parse(['--preset', '--yes'])
    expect(errors).toEqual(['--preset requires a value'])
    expect(options.yes).toBe(true)
    expect(options.presets).toEqual([])
  })

  it('expands --agent all', () => {
    expect(parse(['--agent', 'all']).options.agents).toEqual(AGENTS)
  })

  it('does not duplicate repeated --agent values', () => {
    expect(parse(['--agent', 'cursor', '--agent', 'Cursor', '--agent', 'amp']).options.agents)
      .toEqual(['cursor', 'amp'])
  })

  it('reports an unknown agent with the available list', () => {
    const { errors } = parse(['--agent', 'nope'])
    expect(errors).toEqual(['Unknown agent: "nope". Available: cursor, amp, claude, all'])
  })

  it('ignores a trailing --category without a value', () => {
    const { options, errors } = parse(['--category'])
    expect(options.categories).toEqual([])
    expect(errors).toEqual([])
  })

  it('treats -y as --yes', () => {
    expect(parse(['-y']).options.yes).toBe(true)
  })

  it('ignores unknown flags', () => {
    const { options, errors } = parse(['--nope', '--skill', 'vite'])
    expect(options.skills).toEqual(['vite'])
    expect(errors).toEqual([])
  })

  it('defaults target to cwd and reads --target', () => {
    expect(parse([]).options.target).toBe(process.cwd())
    expect(parse(['--target', '/tmp/x']).options.target).toBe('/tmp/x')
  })
})
