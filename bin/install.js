#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SKILLS_DIR = join(ROOT, 'skills')

// ─── Agent registry (add new agents here) ───────────────────────────
const AGENTS = {
  cursor: { dir: '.cursor/skills', label: 'Cursor' },
  amp:    { dir: '.agents/skills', label: 'Amp' },
  claude: { dir: '.claude/skills', label: 'Claude Code' },
}

const AGENT_NAMES = Object.keys(AGENTS)
const DEFAULT_AGENT = 'cursor'

const PACKAGE_NAME = 'frontend-agent-skills'
const ENV_AGENT = 'FRONTEND_AGENT_SKILLS_AGENT'
const LEGACY_ENV_AGENT = 'VUE_CURSOR_SKILLS_AGENT'

// ─── Args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const command = args[0] || 'install'

// ─── Helpers ─────────────────────────────────────────────────────────
function printUsage() {
  const agentList = AGENT_NAMES.join(' | ')
  console.log(`
${PACKAGE_NAME} — AI agent skills for Vue 3, TypeScript, JavaScript, and Vite

Usage:
  npx ${PACKAGE_NAME} [command] [options]

Commands:
  install   Copy skills to the target agent directory (default)
  list      List available categories and skills
  help      Show this help

Options:
  --target <dir>       Target project directory (default: cwd)
  --category <name>    Install one category: vue | vite | javascript | typescript
  --skill <name>       Install specific skill (can repeat)
  --agent <name>       Target agent: ${agentList} | all (can repeat)
                       If omitted, uses ${ENV_AGENT} env or prompts (default: cursor)
  --yes, -y            Skip agent prompt, use default agent (cursor)

Examples:
  npx ${PACKAGE_NAME} install
  npx ${PACKAGE_NAME} install --agent cursor
  npx ${PACKAGE_NAME} install --agent amp
  npx ${PACKAGE_NAME} install --agent cursor --agent amp
  npx ${PACKAGE_NAME} install --yes
  npx ${PACKAGE_NAME} install --agent all
  npx ${PACKAGE_NAME} install --category vue --agent amp
  npx ${PACKAGE_NAME} install --skill vue-core --skill vite --agent claude
  npx ${PACKAGE_NAME} install --target /path/to/project
  npx ${PACKAGE_NAME} list
`)
}

function copyDir(src, dest) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

function getCategories() {
  return readdirSync(SKILLS_DIR).filter(
    (entry) => statSync(join(SKILLS_DIR, entry)).isDirectory()
  )
}

function getSkillsInCategory(category) {
  const categoryDir = join(SKILLS_DIR, category)
  if (!existsSync(categoryDir)) return []
  return readdirSync(categoryDir).filter(
    (entry) => statSync(join(categoryDir, entry)).isDirectory()
  )
}

function isTopLevelSkill(category) {
  const categoryDir = join(SKILLS_DIR, category)
  return existsSync(join(categoryDir, 'SKILL.md'))
}

function listSkills() {
  const categories = getCategories()
  console.log()
  for (const category of categories) {
    if (isTopLevelSkill(category)) {
      console.log(`  📦 ${category}`)
      continue
    }
    const skills = getSkillsInCategory(category)
    if (skills.length === 0) {
      console.log(`  📁 ${category}/  (empty — coming soon)`)
      continue
    }
    console.log(`  📁 ${category}/`)
    for (const skill of skills) {
      console.log(`      - ${skill}`)
    }
  }

  console.log()
  console.log(`  Supported agents: ${AGENT_NAMES.map((a) => `${AGENTS[a].label} (${a})`).join(', ')}`)
  console.log()
}

function resolveAgentsFromEnv() {
  const envAgent = (
    process.env[ENV_AGENT] ?? process.env[LEGACY_ENV_AGENT]
  )?.trim().toLowerCase()
  if (!envAgent) return null
  if (envAgent === 'all') return [...AGENT_NAMES]
  if (AGENTS[envAgent]) return [envAgent]
  console.error(`Unknown ${ENV_AGENT}: "${envAgent}". Available: ${AGENT_NAMES.join(', ')}, all`)
  process.exit(1)
}

// ─── Agent prompt ────────────────────────────────────────────────────
function promptAgent(skipPrompt) {
  return new Promise((resolve) => {
    const fromEnv = resolveAgentsFromEnv()
    if (fromEnv) {
      resolve(fromEnv)
      return
    }

    if (skipPrompt) {
      resolve([DEFAULT_AGENT])
      return
    }

    const isTTY = process.stdin.isTTY

    if (!isTTY) {
      resolve([DEFAULT_AGENT])
      return
    }

    const options = [
      ...AGENT_NAMES.map((name, i) => ({
        key: String(i + 1),
        agents: [name],
        label: AGENTS[name].label + (name === DEFAULT_AGENT ? ' (default)' : ''),
      })),
      {
        key: String(AGENT_NAMES.length + 1),
        agents: [...AGENT_NAMES],
        label: `All (${AGENT_NAMES.map((a) => AGENTS[a].label).join(' + ')})`,
      },
    ]

    console.log('\n? Install skills for which agent(s)?\n')
    for (const opt of options) {
      console.log(`  ${opt.key}) ${opt.label}`)
    }
    console.log()

    const rl = createInterface({ input: process.stdin, output: process.stdout })

    rl.question(`Choose [1-${options.length}] (press Enter for ${AGENTS[DEFAULT_AGENT].label}): `, (answer) => {
      rl.close()
      const trimmed = answer.trim()

      if (!trimmed) {
        resolve([DEFAULT_AGENT])
        return
      }

      const match = options.find((o) => o.key === trimmed)
      if (match) {
        resolve(match.agents)
      } else {
        console.log(`Invalid choice "${trimmed}", using default: ${AGENTS[DEFAULT_AGENT].label}`)
        resolve([DEFAULT_AGENT])
      }
    })
  })
}

// ─── Install ─────────────────────────────────────────────────────────
function installSkills(targetDir, selectedCategories, selectedSkills, agents) {
  const agentLabels = agents.map((a) => AGENTS[a].label).join(', ')
  console.log(`\nInstalling skills for: ${agentLabels}\n`)

  let totalInstalled = 0

  for (const agent of agents) {
    const agentConfig = AGENTS[agent]
    const destBase = join(targetDir, agentConfig.dir)
    if (!existsSync(destBase)) mkdirSync(destBase, { recursive: true })

    console.log(`  ${agentConfig.label} → ${agentConfig.dir}/`)

    const categoriesToProcess = selectedCategories.length > 0
      ? getCategories().filter((c) => selectedCategories.includes(c))
      : getCategories()

    let agentInstalled = 0

    for (const category of categoriesToProcess) {
      if (isTopLevelSkill(category)) {
        if (selectedSkills.length > 0 && !selectedSkills.includes(category)) continue

        const src = join(SKILLS_DIR, category)
        const dest = join(destBase, category)
        copyDir(src, dest)
        console.log(`    ✓ ${category}`)
        agentInstalled++
        continue
      }

      const skills = getSkillsInCategory(category)
      if (skills.length === 0) continue

      const toInstall = selectedSkills.length > 0
        ? skills.filter((s) => selectedSkills.includes(s))
        : skills

      if (toInstall.length === 0) continue

      for (const skill of toInstall) {
        const src = join(SKILLS_DIR, category, skill)
        const dest = join(destBase, skill)
        copyDir(src, dest)
        console.log(`    ✓ ${skill}`)
        agentInstalled++
      }
    }

    totalInstalled += agentInstalled

    if (agentInstalled === 0) {
      console.log(`    (no matching skills)`)
    }

    console.log()
  }

  if (totalInstalled === 0) {
    console.error(`No matching skills found. Run "npx ${PACKAGE_NAME} list" to see available skills.\n`)
    process.exit(1)
  }

  const agentDirs = agents.map((a) => AGENTS[a].dir).join(', ')
  console.log(`Done! ${totalInstalled} skill(s) installed across ${agents.length} agent(s).`)
  console.log(`Restart your agent(s) to activate the skills.\n`)
}

// ─── Arg parsing ─────────────────────────────────────────────────────
function parseArgs(args) {
  const options = { target: process.cwd(), categories: [], skills: [], agents: [], yes: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && args[i + 1]) {
      options.target = args[++i]
    } else if (args[i] === '--category' && args[i + 1]) {
      options.categories.push(args[++i])
    } else if (args[i] === '--skill' && args[i + 1]) {
      options.skills.push(args[++i])
    } else if (args[i] === '--yes' || args[i] === '-y') {
      options.yes = true
    } else if (args[i] === '--agent' && args[i + 1]) {
      const val = args[++i].toLowerCase()
      if (val === 'all') {
        options.agents = [...AGENT_NAMES]
      } else if (AGENTS[val]) {
        if (!options.agents.includes(val)) options.agents.push(val)
      } else {
        console.error(`Unknown agent: "${val}". Available: ${AGENT_NAMES.join(', ')}, all`)
        process.exit(1)
      }
    }
  }
  return options
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  if (command === 'list') {
    listSkills()
  } else if (command === 'help' || command === '--help' || command === '-h') {
    printUsage()
  } else if (command === 'install' || !['list', 'help', '--help', '-h'].includes(command)) {
    const restArgs = command === 'install' ? args.slice(1) : args
    const opts = parseArgs(restArgs)

    let agents = opts.agents
    if (agents.length === 0) {
      agents = await promptAgent(opts.yes)
    }

    installSkills(opts.target, opts.categories, opts.skills, agents)
  } else {
    console.error(`Unknown command: ${command}`)
    printUsage()
    process.exit(1)
  }
}

main()
