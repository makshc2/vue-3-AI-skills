import { presetNames, resolvePreset } from './presets.js'

export const BUDGET_WARNING =
  'Warning: installing every skill is token-heavy. Some agents truncate long skill listings — prefer a narrower preset if your agent struggles.'

const unique = (list) => [...new Set(list)]

/**
 * Resolve the final skill selection. Pure: no file system, no printing.
 * @returns {{mode:'default'|'all'|'explicit', skills:string[], presets:string[], messages:string[], warnings:string[], errors:string[]}}
 */
export function resolveSelection({ options, manifest, catalogSkills, detect }) {
  const messages = []
  const warnings = []
  const errors = []

  const catalogNames = catalogSkills.map((s) => s.name)
  const categories = options.categories ?? []
  const skillFilters = options.skills ?? []
  const requestedPresets = options.presets ?? []
  const all = options.all === true

  const available = presetNames(manifest)
  const unknown = requestedPresets.filter((p) => p !== 'auto' && !available.includes(p))
  if (unknown.length > 0) {
    for (const name of unknown) {
      errors.push(`Unknown preset "${name}". Available: ${available.join(', ')}, auto`)
    }
    return { mode: 'explicit', skills: [], presets: [], messages, warnings, errors }
  }

  // legacy selection L
  const legacy = catalogSkills
    .filter((s) => categories.length === 0 || categories.includes(s.category))
    .filter((s) => skillFilters.length === 0 || skillFilters.includes(s.name))
    .map((s) => s.name)
  const hasFilters = categories.length > 0 || skillFilters.length > 0

  if (requestedPresets.length === 0) {
    if (!all && !hasFilters) {
      const skills = resolvePreset(manifest, manifest.default, catalogNames)
      return { mode: 'default', skills: unique(skills), presets: [manifest.default], messages, warnings, errors }
    }
    const mode = all && !hasFilters ? 'all' : 'explicit'
    if (mode === 'all') warnings.push(BUDGET_WARNING)
    return { mode, skills: unique(legacy), presets: [], messages, warnings, errors }
  }

  // with --preset
  if (all) {
    warnings.push(BUDGET_WARNING)
    return { mode: 'all', skills: unique(catalogNames), presets: requestedPresets, messages, warnings, errors }
  }

  const resolvedPresets = []
  for (const name of requestedPresets) {
    if (name !== 'auto') {
      resolvedPresets.push(name)
      continue
    }
    const detection = detect()
    for (const note of detection.notes ?? []) messages.push(note)
    const detected = (detection.presets ?? []).map((p) => p.name)
    if (detected.length === 0) {
      messages.push(`No stack detected; using default preset (${manifest.default})`)
      resolvedPresets.push(manifest.default)
    } else {
      resolvedPresets.push(...detected)
    }
  }

  const presets = unique(resolvedPresets)
  const fromPresets = presets.flatMap((name) => resolvePreset(manifest, name, catalogNames))
  const skills = unique([...fromPresets, ...(hasFilters ? legacy : [])])

  if (presets.includes('full')) warnings.push(BUDGET_WARNING)

  return { mode: 'explicit', skills, presets, messages, warnings, errors }
}
