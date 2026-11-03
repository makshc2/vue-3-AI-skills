#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

import {
  getCategories,
  getSkillsInCategory,
  isTopLevelSkill,
  listCatalogSkills,
} from './lib/catalog.js'
import { loadManifest, presetNames, resolvePreset } from './lib/presets.js'
import { parseArgs } from './lib/args.js'
import { readProjectDeps, detectPresets } from './lib/detect.js'
import { resolveSelection, BUDGET_WARNING } from './lib/selection.js'
import { shouldShowMenu, runMenu, formatEquivalentCommand } from './lib/menu.js'
import { createPrompter } from './lib/prompter.js'

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

const MANIFEST = loadManifest()

// ─── Args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const command = args[0] || 'install'

// ─── Helpers ─────────────────────────────────────────────────────────
function catalogNames() {
  return listCatalogSkills(SKILLS_DIR).map((s) => s.name)
}

function defaultSkills() {
  return resolvePreset(MANIFEST, MANIFEST.default, catalogNames())
}

function presetSkillCount(name) {
  return resolvePreset(MANIFEST, name, catalogNames()).length
}

function printUsage() {
  const agentList = AGENT_NAMES.join(' | ')
  const categoryList = getCategories(SKILLS_DIR).join(' | ')
  const presetList = presetNames(MANIFEST).join(' | ')
  console.log(`
${PACKAGE_NAME} — AI agent skills for Vue 3, React, TypeScript, JavaScript, HTML, CSS, Design, and Vite

Usage:
  npx ${PACKAGE_NAME} [command] [options]

Commands:
  install   Copy skills to the target agent directory (default)
  list      List available categories, skills and presets
  help      Show this help

Options:
  --target <dir>       Target project directory (default: cwd)
  --category <name>    Install one category: ${categoryList}
  --skill <name>       Install specific skill (can repeat)
  --preset <name>      Install a preset: ${presetList} | auto (can repeat)
  --all                Install every published skill (not the default)
  --agent <name>       Target agent: ${agentList} | all (can repeat)
                       If omitted, uses ${ENV_AGENT} env or prompts (default: cursor)
  --yes, -y            Skip agent prompt, use default agent (cursor)

Default install (no --category / --skill / --preset / --all):
  ${defaultSkills().join(', ')}

Examples:
  npx ${PACKAGE_NAME} install
  npx ${PACKAGE_NAME} install --all
  npx ${PACKAGE_NAME} install --preset react
  npx ${PACKAGE_NAME} install --preset vue --preset web
  npx ${PACKAGE_NAME} install --preset auto
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

function listSkills() {
  const categories = getCategories(SKILLS_DIR)
  console.log()
  for (const category of categories) {
    if (isTopLevelSkill(category, SKILLS_DIR)) {
      console.log(`  📦 ${category}`)
      continue
    }
    const skills = getSkillsInCategory(category, SKILLS_DIR)
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
  console.log('  Presets:')
  for (const name of presetNames(MANIFEST)) {
    const preset = MANIFEST.presets[name]
    const suffix = name === MANIFEST.default ? ' [default]' : ''
    console.log(`    - ${name} (${presetSkillCount(name)} skills) — ${preset.label}${suffix}`)
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
function installSkills(targetDir, selection, agents) {
  const agentLabels = agents.map((a) => AGENTS[a].label).join(', ')
  const catalog = listCatalogSkills(SKILLS_DIR)
  const selected = catalog.filter((s) => selection.skills.includes(s.name))

  if (selection.mode === 'default') {
    console.log(`\nInstalling default (token-light) skill set for: ${agentLabels}`)
    console.log(`  ${selection.skills.join(', ')}`)
    console.log('  Use --all, --preset or --category to install more.\n')
  } else if (selection.presets.length > 0) {
    console.log(`\nInstalling preset(s): ${selection.presets.join(', ')} (${selection.skills.length} skills)`)
    console.log(`  for: ${agentLabels}\n`)
  } else {
    console.log(`\nInstalling skills for: ${agentLabels}\n`)
  }

  let totalInstalled = 0

  for (const agent of agents) {
    const agentConfig = AGENTS[agent]
    const destBase = join(targetDir, agentConfig.dir)
    if (!existsSync(destBase)) mkdirSync(destBase, { recursive: true })

    console.log(`  ${agentConfig.label} → ${agentConfig.dir}/`)

    let agentInstalled = 0

    for (const entry of selected) {
      const src = entry.name === entry.category
        ? join(SKILLS_DIR, entry.category)
        : join(SKILLS_DIR, entry.category, entry.name)
      const dest = join(destBase, entry.name)
      copyDir(src, dest)
      console.log(`    ✓ ${entry.name}`)
      agentInstalled++
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

  console.log(`Done! ${totalInstalled} skill(s) installed across ${agents.length} agent(s).`)
  console.log(`Restart your agent(s) to activate the skills.\n`)
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  if (command === 'list') {
    listSkills()
  } else if (command === 'help' || command === '--help' || command === '-h') {
    printUsage()
  } else if (command === 'install' || !['list', 'help', '--help', '-h'].includes(command)) {
    const restArgs = command === 'install' ? args.slice(1) : args
    const { options: opts, errors } = parseArgs(restArgs, AGENT_NAMES)

    if (errors.length > 0) {
      for (const error of errors) console.error(error)
      process.exit(1)
    }

    const detect = () => detectPresets(MANIFEST, readProjectDeps(opts.target), {
      fileExists: (file) => existsSync(join(opts.target, file)),
    })

    if (shouldShowMenu({
      options: opts,
      stdinIsTTY: !!process.stdin.isTTY,
      stdoutIsTTY: !!process.stdout.isTTY,
      env: process.env,
    })) {
      const detected = detect().presets.map((p) => p.name)
      const prompter = await createPrompter()
      const result = await runMenu({
        prompter,
        manifest: MANIFEST,
        catalogNames: catalogNames(),
        detected,
        agentChoice: opts.agents.length > 0 ? opts.agents : resolveAgentsFromEnv(),
        agentOptions: [...AGENT_NAMES],
        defaultAgent: DEFAULT_AGENT,
      })

      if (result.cancelled) {
        console.error('Cancelled.')
        process.exit(130)
      }

      if (result.presets.includes('full')) console.error(BUDGET_WARNING)
      console.log(`\n${result.skills.length} skill(s) selected.`)
      console.log(formatEquivalentCommand({
        presets: result.presets,
        agents: result.agents,
        target: opts.target,
        cwd: process.cwd(),
        packageName: PACKAGE_NAME,
      }))

      installSkills(opts.target, {
        mode: 'explicit',
        skills: result.skills,
        presets: result.presets,
      }, result.agents)
      return
    }

    const selection = resolveSelection({
      options: opts,
      manifest: MANIFEST,
      catalogSkills: listCatalogSkills(SKILLS_DIR),
      detect,
    })

    if (selection.errors.length > 0) {
      for (const error of selection.errors) console.error(error)
      process.exit(1)
    }

    for (const warning of selection.warnings) console.error(warning)
    for (const message of selection.messages) console.log(message)

    let agents = opts.agents
    if (agents.length === 0) {
      agents = await promptAgent(opts.yes)
    }

    installSkills(opts.target, selection, agents)
  } else {
    console.error(`Unknown command: ${command}`)
    printUsage()
    process.exit(1)
  }
}

main()
