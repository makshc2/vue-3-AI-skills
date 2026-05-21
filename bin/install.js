#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SKILLS_DIR = join(ROOT, 'skills')

const CATEGORIES = ['vue', 'javascript', 'typescript']

const args = process.argv.slice(2)
const command = args[0] || 'install'

function printUsage() {
  console.log(`
vue-cursor-skills — AI agent skills for Vue 3 / JS / TS in Cursor IDE

Usage:
  npx vue-cursor-skills [command] [options]

Commands:
  install   Copy skills to .cursor/skills/ (default)
  list      List available categories and skills
  help      Show this help

Options:
  --target <dir>       Target project directory (default: cwd)
  --category <name>    Install one category: vue | javascript | typescript
  --skill <name>       Install specific skill (can repeat)

Examples:
  npx vue-cursor-skills
  npx vue-cursor-skills install --category vue
  npx vue-cursor-skills install --category typescript
  npx vue-cursor-skills install --skill vue-core --skill vue-pinia
  npx vue-cursor-skills install --target /path/to/project
  npx vue-cursor-skills list
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

function listSkills() {
  const categories = getCategories()
  console.log()
  for (const category of categories) {
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
}

function installSkills(targetDir, selectedCategories, selectedSkills) {
  const destDir = join(targetDir, '.cursor', 'skills')
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })

  const categoriesToProcess = selectedCategories.length > 0
    ? getCategories().filter((c) => selectedCategories.includes(c))
    : getCategories()

  let installed = 0

  console.log(`\nInstalling skills to: ${destDir}\n`)

  for (const category of categoriesToProcess) {
    const skills = getSkillsInCategory(category)
    if (skills.length === 0) continue

    const toInstall = selectedSkills.length > 0
      ? skills.filter((s) => selectedSkills.includes(s))
      : skills

    if (toInstall.length === 0) continue

    console.log(`  ${category}/`)
    for (const skill of toInstall) {
      const src = join(SKILLS_DIR, category, skill)
      const dest = join(destDir, skill)
      copyDir(src, dest)
      console.log(`    ✓ ${skill}`)
      installed++
    }
  }

  if (installed === 0) {
    console.error(`\nNo matching skills found. Run "npx vue-cursor-skills list" to see available skills.\n`)
    process.exit(1)
  }

  console.log(`\nDone! ${installed} skill(s) installed.`)
  console.log(`Restart Cursor to activate the skills.\n`)
}

function parseArgs(args) {
  const options = { target: process.cwd(), categories: [], skills: [] }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && args[i + 1]) {
      options.target = args[++i]
    } else if (args[i] === '--category' && args[i + 1]) {
      options.categories.push(args[++i])
    } else if (args[i] === '--skill' && args[i + 1]) {
      options.skills.push(args[++i])
    }
  }
  return options
}

if (command === 'list') {
  listSkills()
} else if (command === 'help' || command === '--help' || command === '-h') {
  printUsage()
} else if (command === 'install' || !['list', 'help', '--help', '-h'].includes(command)) {
  const restArgs = command === 'install' ? args.slice(1) : args
  const opts = parseArgs(restArgs)
  installSkills(opts.target, opts.categories, opts.skills)
} else {
  console.error(`Unknown command: ${command}`)
  printUsage()
  process.exit(1)
}
