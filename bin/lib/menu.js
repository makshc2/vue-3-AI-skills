import { presetNames, resolvePreset } from './presets.js'
import { CANCELLED } from './prompter.js'
import { BUDGET_WARNING } from './selection.js'

export function shouldShowMenu({ options, stdinIsTTY, stdoutIsTTY, env = {} }) {
  if (!stdinIsTTY || !stdoutIsTTY) return false
  if (env.CI) return false
  if (options.yes) return false
  if (options.all) return false
  if ((options.categories ?? []).length > 0) return false
  if ((options.skills ?? []).length > 0) return false
  if ((options.presets ?? []).length > 0) return false
  return true
}

export function buildMenuOptions(manifest, catalogNames) {
  return presetNames(manifest).map((value) => {
    const preset = manifest.presets[value]
    const count = resolvePreset(manifest, value, catalogNames).length
    const hint = value === 'full'
      ? `${count} skills — ${BUDGET_WARNING}`
      : `${count} skills`
    return { value, label: preset.label, hint }
  })
}

export async function runMenu({
  prompter,
  manifest,
  catalogNames,
  detected = [],
  agentChoice,
  agentOptions = [],
  defaultAgent,
}) {
  const initialValues = detected.length > 0 ? [...detected] : [manifest.default]

  const presets = await prompter.multiselect({
    message: 'Which skill preset(s) do you want to install?',
    options: buildMenuOptions(manifest, catalogNames),
    initialValues,
  })
  if (presets === CANCELLED) return { cancelled: true }

  let agents = agentChoice && agentChoice.length > 0 ? [...agentChoice] : null
  if (!agents) {
    const choice = await prompter.select({
      message: 'Install skills for which agent(s)?',
      options: [
        ...agentOptions.map((value) => ({ value, label: value })),
        { value: 'all', label: `All (${agentOptions.join(' + ')})` },
      ],
      initialValue: defaultAgent,
    })
    if (choice === CANCELLED) return { cancelled: true }
    agents = choice === 'all' ? [...agentOptions] : [choice]
  }

  const skills = [...new Set(presets.flatMap((name) => resolvePreset(manifest, name, catalogNames)))]

  return { cancelled: false, presets, agents, skills }
}

export function formatEquivalentCommand({ presets, agents, target, cwd, packageName }) {
  const parts = [`npx ${packageName} install`]
  for (const preset of presets) parts.push(`--preset ${preset}`)
  const isAll = agents.includes('all') || agents.length > 1
  if (isAll) {
    parts.push('--agent all')
  } else {
    for (const agent of agents) parts.push(`--agent ${agent}`)
  }
  if (target !== cwd) parts.push(`--target ${target}`)
  return parts.join(' ')
}
