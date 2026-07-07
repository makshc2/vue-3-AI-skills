import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(ROOT, 'skills')

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (entry.endsWith('.md')) out.push(p)
  }
  return out
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const fm = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)$/)
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '')
  }
  return fm
}

function discoverSkills() {
  const skills = []

  for (const category of readdirSync(SKILLS_DIR)) {
    const categoryDir = join(SKILLS_DIR, category)
    if (!statSync(categoryDir).isDirectory()) continue

    const topLevelSkill = join(categoryDir, 'SKILL.md')
    if (existsSync(topLevelSkill)) {
      skills.push({ category, name: category, skillPath: categoryDir })
      continue
    }

    for (const skill of readdirSync(categoryDir)) {
      const skillDir = join(categoryDir, skill)
      if (!statSync(skillDir).isDirectory()) continue
      if (!existsSync(join(skillDir, 'SKILL.md'))) continue
      skills.push({ category, name: skill, skillPath: skillDir })
    }
  }

  return skills
}

function extractRelativeLinks(content) {
  return [...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
    .map((m) => m[1])
    .filter((href) => !href.startsWith('http') && !href.startsWith('#'))
}

const allSkills = discoverSkills()

describe('skill frontmatter', () => {
  it('discovers at least javascript and typescript skills', () => {
    expect(allSkills.length).toBeGreaterThanOrEqual(13)
  })

  it.each(allSkills.map((s) => [s.name, s.category, s.skillPath]))(
    '%s has valid frontmatter',
    (name, category, skillPath) => {
      const content = readFileSync(join(skillPath, 'SKILL.md'), 'utf8')
      const fm = parseFrontmatter(content)
      expect(fm, `${name}: missing YAML frontmatter`).not.toBeNull()
      expect(fm.name, `${name}: missing name`).toBeTruthy()
      if (category === 'javascript' || category === 'typescript') {
        expect(fm.name, `${name}: name must match folder`).toBe(name)
      }
      expect(fm.description, `${name}: missing description`).toBeTruthy()
      expect(fm.description.length, `${name}: description too short`).toBeGreaterThan(40)
      expect(content.length, `${name}: SKILL.md too short`).toBeGreaterThan(400)
    },
  )
})

function hasLocalReferences(skillPath) {
  return existsSync(join(skillPath, 'references')) || existsSync(join(skillPath, 'reference'))
}

describe('markdown internal links', () => {
  const markdownFiles = walk(SKILLS_DIR).filter((filePath) => {
    if (!filePath.endsWith('SKILL.md') && !filePath.includes('/references/') && !filePath.includes('/reference/')) {
      return false
    }
    const skillRoot = filePath.includes('/skills/')
      ? filePath.split('/skills/')[1].split('/').slice(0, 2).join('/')
      : null
    if (!skillRoot) return true
    const [category, skill] = skillRoot.split('/')
    const skillPath = skill
      ? join(SKILLS_DIR, category, skill)
      : join(SKILLS_DIR, category)
    return hasLocalReferences(skillPath)
  })

  it.each(markdownFiles.map((f) => [f.replace(`${ROOT}/`, ''), f]))(
    '%s links resolve',
    (_label, filePath) => {
      const content = readFileSync(filePath, 'utf8')
      const baseDir = dirname(filePath)

      for (const href of extractRelativeLinks(content)) {
        const target = resolve(baseDir, href)
        expect(existsSync(target), `broken link in ${filePath}: ${href}`).toBe(true)
      }
    },
  )
})

describe('installer', () => {
  it('installs javascript category to all agents', () => {
    const target = mkdtempSync(join(tmpdir(), 'frontend-agent-skills-test-'))

    try {
      execFileSync(process.execPath, [
        join(ROOT, 'bin/install.js'),
        'install',
        '--category',
        'javascript',
        '--agent',
        'all',
        '--target',
        target,
        '--yes',
      ], { stdio: 'pipe' })

      const agents = ['.cursor/skills', '.agents/skills', '.claude/skills']
      const expected = [
        'javascript-core',
        'javascript-data',
        'javascript-debug',
        'javascript-dom',
        'javascript-node',
        'javascript-performance',
        'javascript-testing',
      ]

      for (const agentDir of agents) {
        const installedDir = join(target, agentDir)
        expect(existsSync(installedDir)).toBe(true)
        const installed = readdirSync(installedDir).sort()
        expect(installed).toEqual(expected)

        for (const skill of expected) {
          const src = readFileSync(join(SKILLS_DIR, 'javascript', skill, 'SKILL.md'), 'utf8')
          const dst = readFileSync(join(installedDir, skill, 'SKILL.md'), 'utf8')
          expect(dst).toBe(src)
        }
      }
    } finally {
      rmSync(target, { recursive: true, force: true })
    }
  })

  it('installs typescript category to all agents', () => {
    const target = mkdtempSync(join(tmpdir(), 'frontend-agent-skills-test-'))

    try {
      execFileSync(process.execPath, [
        join(ROOT, 'bin/install.js'),
        'install',
        '--category',
        'typescript',
        '--agent',
        'all',
        '--target',
        target,
        '--yes',
      ], { stdio: 'pipe' })

      const agents = ['.cursor/skills', '.agents/skills', '.claude/skills']
      const expected = [
        'typescript-config',
        'typescript-core',
        'typescript-debug',
        'typescript-testing',
        'typescript-types',
        'typescript-vue',
      ]

      for (const agentDir of agents) {
        const installedDir = join(target, agentDir)
        expect(existsSync(installedDir)).toBe(true)
        const installed = readdirSync(installedDir).sort()
        expect(installed).toEqual(expected)

        for (const skill of expected) {
          const src = readFileSync(join(SKILLS_DIR, 'typescript', skill, 'SKILL.md'), 'utf8')
          const dst = readFileSync(join(installedDir, skill, 'SKILL.md'), 'utf8')
          expect(dst).toBe(src)
        }
      }
    } finally {
      rmSync(target, { recursive: true, force: true })
    }
  })
})
