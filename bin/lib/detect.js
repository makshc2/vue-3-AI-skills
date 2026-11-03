import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const VUE2_NOTE =
  'Vue 2 is not supported by the Vue skills; the vue preset was not selected'

const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

/** @returns {{status:'ok'|'missing'|'invalid', deps: Record<string,string>}} */
export function readProjectDeps(targetDir) {
  let raw
  try {
    raw = readFileSync(join(targetDir, 'package.json'), 'utf8')
  } catch {
    return { status: 'missing', deps: {} }
  }
  let pkg
  try {
    pkg = JSON.parse(raw)
  } catch {
    return { status: 'invalid', deps: {} }
  }
  const deps = {}
  for (const field of DEP_FIELDS) {
    const section = pkg?.[field]
    if (section && typeof section === 'object') {
      for (const [name, range] of Object.entries(section)) {
        if (!(name in deps)) deps[name] = String(range)
      }
    }
  }
  return { status: 'ok', deps }
}

/** Major version of a range, or null when it cannot be read as a number. */
export function majorOf(range) {
  const cleaned = String(range ?? '').replace(/[\^~>=<v\s]/g, '')
  const match = cleaned.match(/^(\d+)/)
  return match ? Number(match[1]) : null
}

/** @returns {{presets: {name: string, reasons: string[]}[], notes: string[]}} */
export function detectPresets(manifest, project, { fileExists = () => false } = {}) {
  const notes = []
  const matched = []
  const deps = project?.deps ?? {}

  for (const [name, preset] of Object.entries(manifest.presets ?? {})) {
    const detect = preset?.detect
    if (!detect) continue
    const reasons = []

    for (const dep of detect.dependencies ?? []) {
      if (!(dep in deps)) continue
      if (name === 'vue' && dep === 'vue' && majorOf(deps[dep]) === 2) {
        if (!notes.includes(VUE2_NOTE)) notes.push(VUE2_NOTE)
        continue
      }
      reasons.push(`dependency: ${dep}`)
    }

    for (const file of detect.files ?? []) {
      if (fileExists(file)) reasons.push(`file: ${file}`)
    }

    if (reasons.length > 0) {
      matched.push({ name, reasons, fallbackOnly: detect.fallbackOnly === true })
    }
  }

  const primary = matched.filter((p) => !p.fallbackOnly)
  const chosen = primary.length > 0 ? primary : matched.filter((p) => p.fallbackOnly)

  return {
    presets: chosen.map(({ name, reasons }) => ({ name, reasons })),
    notes,
  }
}
