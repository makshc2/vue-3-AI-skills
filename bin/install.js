#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const args = process.argv.slice(2)
const command = args[0] || 'install'

function printUsage() {
  console.log(`
vue-cursor-skills - AI agent skills for Vue 3 in Cursor IDE

Usage:
  npx vue-cursor-skills [command] [options]

Commands:
  install [--target <dir>]   Copy all skills to .cursor/skills/ (default)
  list                       List available skills
  help                       Show this help

Options:
  --target <dir>   Target project directory (default: current working directory)
  --skill <name>   Install specific skill only (can be repeated)

Examples:
  npx vue-cursor-skills
  npx vue-cursor-skills install --target /path/to/my-project
  npx vue-cursor-skills install --skill vue-core --skill vue-pinia
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

function listSkills() {
  const skillsDir = join(ROOT, 'skills')
  const skills = readdirSync(skillsDir).filter(
    (entry) => statSync(join(skillsDir, entry)).isDirectory()
  )
  console.log('\nAvailable skills:')
  for (const skill of skills) {
    console.log(`  - ${skill}`)
  }
  console.log()
}

function installSkills(targetDir, selectedSkills) {
  const skillsDir = join(ROOT, 'skills')
  const destDir = join(targetDir, '.cursor', 'skills')

  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })

  const available = readdirSync(skillsDir).filter(
    (entry) => statSync(join(skillsDir, entry)).isDirectory()
  )

  const toInstall = selectedSkills.length > 0
    ? available.filter((s) => selectedSkills.includes(s))
    : available

  if (toInstall.length === 0) {
    console.error(`No matching skills found. Run "vue-cursor-skills list" to see available skills.`)
    process.exit(1)
  }

  console.log(`\nInstalling skills to: ${destDir}\n`)
  for (const skill of toInstall) {
    const src = join(skillsDir, skill)
    const dest = join(destDir, skill)
    copyDir(src, dest)
    console.log(`  ✓ ${skill}`)
  }
  console.log(`\nDone! ${toInstall.length} skill(s) installed.`)
  console.log(`\nRestart Cursor to activate the skills.\n`)
}

function parseArgs(args) {
  const options = { target: process.cwd(), skills: [] }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && args[i + 1]) {
      options.target = args[++i]
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
} else if (command === 'install' || !command) {
  const opts = parseArgs(args.slice(1))
  installSkills(opts.target, opts.skills)
} else {
  console.error(`Unknown command: ${command}`)
  printUsage()
  process.exit(1)
}
