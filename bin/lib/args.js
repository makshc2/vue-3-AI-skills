/**
 * Pure argument parsing: no process.exit, no printing.
 * @returns {{options: object, errors: string[]}}
 */
export function parseArgs(argv, agentNames = []) {
  const options = {
    target: process.cwd(),
    categories: [],
    skills: [],
    presets: [],
    agents: [],
    yes: false,
    all: false,
  }
  const errors = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--target' && argv[i + 1]) {
      options.target = argv[++i]
    } else if (arg === '--category' && argv[i + 1]) {
      options.categories.push(argv[++i])
    } else if (arg === '--skill' && argv[i + 1]) {
      options.skills.push(argv[++i])
    } else if (arg === '--preset') {
      const value = argv[i + 1]
      if (!value || value.startsWith('-')) {
        errors.push('--preset requires a value')
        continue
      }
      i++
      options.presets.push(value.toLowerCase())
    } else if (arg === '--all') {
      options.all = true
    } else if (arg === '--yes' || arg === '-y') {
      options.yes = true
    } else if (arg === '--agent' && argv[i + 1]) {
      const val = argv[++i].toLowerCase()
      if (val === 'all') {
        options.agents = [...agentNames]
      } else if (agentNames.includes(val)) {
        if (!options.agents.includes(val)) options.agents.push(val)
      } else {
        errors.push(`Unknown agent: "${val}". Available: ${agentNames.join(', ')}, all`)
      }
    }
  }

  return { options, errors }
}
