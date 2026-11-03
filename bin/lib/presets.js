import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const DEFAULT_MANIFEST_PATH = join(__dirname, '..', 'presets.json')
export const UNLISTED_REASONS = ['manual-only', 'on-demand']

export function loadManifest(path = DEFAULT_MANIFEST_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function presetNames(manifest) {
  return Object.keys(manifest.presets ?? {})
}

export function resolvePreset(manifest, name, catalogNames) {
  const preset = manifest.presets?.[name]
  if (!preset) {
    throw new Error(`Unknown preset "${name}". Available: ${presetNames(manifest).join(', ')}`)
  }
  if (preset.skills === '*') return [...catalogNames]
  return [...preset.skills]
}

export function validateManifest(manifest, catalogNames) {
  const errors = []
  const catalog = new Set(catalogNames)
  const presets = manifest.presets ?? {}
  const unlisted = manifest.unlisted ?? {}

  if (manifest.version !== 1) {
    errors.push(`Manifest version must be 1, got ${JSON.stringify(manifest.version)}`)
  }
  if (!manifest.default || !presets[manifest.default]) {
    errors.push(`Manifest default "${manifest.default}" is not a known preset`)
  }

  const covered = new Set()
  for (const [name, preset] of Object.entries(presets)) {
    const skills = preset?.skills
    if (skills === '*') continue
    if (!Array.isArray(skills) || skills.some((s) => typeof s !== 'string')) {
      errors.push(`Preset "${name}" skills must be an array of strings or "*"`)
      continue
    }
    const seen = new Set()
    for (const skill of skills) {
      if (seen.has(skill)) errors.push(`Preset "${name}" lists skill "${skill}" twice`)
      seen.add(skill)
      if (!catalog.has(skill)) {
        errors.push(`Preset "${name}" references unknown skill "${skill}"`)
      }
      covered.add(skill)
    }
  }

  for (const [skill, reason] of Object.entries(unlisted)) {
    if (!catalog.has(skill)) {
      errors.push(`Unlisted entry "${skill}" is not a catalog skill`)
    }
    if (!UNLISTED_REASONS.includes(reason)) {
      errors.push(`Unlisted entry "${skill}" has an invalid reason "${reason}"`)
    }
    if (covered.has(skill)) {
      errors.push(`Skill "${skill}" is both in a preset and in unlisted`)
    }
  }

  for (const skill of catalogNames) {
    if (!covered.has(skill) && !(skill in unlisted)) {
      errors.push(`Catalog skill "${skill}" is in no preset (other than "*") and not unlisted`)
    }
  }

  return errors
}
