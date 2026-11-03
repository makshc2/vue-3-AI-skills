import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

const MAX_DESCRIPTION = 350

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(ROOT, 'skills')
const REACT_DIR = join(SKILLS_DIR, 'react')

const FOREIGN_CATEGORIES = ['vue', 'typescript', 'javascript', 'design']
const FOREIGN_SKILL_NAMES = FOREIGN_CATEGORIES.flatMap((category) => {
  const dir = join(SKILLS_DIR, category)
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((entry) => statSync(join(dir, entry)).isDirectory())
})

const reactSkills = readdirSync(REACT_DIR)
  .filter((entry) => statSync(join(REACT_DIR, entry)).isDirectory())

function frontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  return match ? match[1] : null
}

function scalar(fm, key) {
  const match = fm.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, 'm'))
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null
}

function markdownFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...markdownFiles(p))
    else if (entry.endsWith('.md')) out.push(p)
  }
  return out
}

function relativeLinks(content) {
  return [...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
    .map((m) => m[1])
    .filter((href) => !href.startsWith('http') && !href.startsWith('#'))
}

describe('react skills', () => {
  it('has no SKILL.md at the category root', () => {
    expect(existsSync(join(REACT_DIR, 'SKILL.md'))).toBe(false)
  })

  it('has at least one skill', () => {
    expect(reactSkills.length).toBeGreaterThan(0)
  })

  it.each(reactSkills)('%s satisfies the shared contract', (name) => {
    expect(name.startsWith('react-'), `${name} must start with react-`).toBe(true)
    const file = join(REACT_DIR, name, 'SKILL.md')
    expect(existsSync(file), `${name}: missing SKILL.md`).toBe(true)

    const content = readFileSync(file, 'utf8')
    const fm = frontmatter(content)
    expect(fm, `${name}: missing frontmatter`).not.toBeNull()

    expect(scalar(fm, 'name')).toBe(name)
    expect(fm).toMatch(/^license: MIT$/m)

    const description = scalar(fm, 'description')
    expect(description, `${name}: missing description`).toBeTruthy()
    expect(description.startsWith('Use for'), `${name}: description must start with "Use for"`).toBe(true)
    expect(description.length, `${name}: description too long`).toBeLessThanOrEqual(MAX_DESCRIPTION)

    expect(scalar(fm, 'compatibility'), `${name}: missing compatibility`).toBeTruthy()
    expect(scalar(fm, 'version'), `${name}: missing metadata.version`).toBeTruthy()
    expect(fm, `${name}: missing sources`).toMatch(/^\s*sources:\s*$/m)
    expect(fm, `${name}: sources need an https URL`).toMatch(/https:\/\//)

    expect(content.length).toBeGreaterThan(400)
  })

  it.each(markdownFiles(REACT_DIR).map((f) => [relative(ROOT, f), f]))(
    '%s links stay inside react, html and css',
    (_label, file) => {
      const content = readFileSync(file, 'utf8')
      for (const href of relativeLinks(content)) {
        const target = resolve(dirname(file), href)
        expect(existsSync(target), `broken link in ${file}: ${href}`).toBe(true)
        const allowed = ['react', 'html', 'css'].some((category) =>
          target.startsWith(join(SKILLS_DIR, category)) || !target.startsWith(SKILLS_DIR)
        )
        expect(allowed, `link leaves the allowed categories: ${href}`).toBe(true)
      }
    }
  )

  it.each(markdownFiles(REACT_DIR).map((f) => [relative(ROOT, f), f]))(
    '%s does not reference foreign skills in backticks',
    (_label, file) => {
      const content = readFileSync(file, 'utf8')
      for (const skill of FOREIGN_SKILL_NAMES) {
        expect(content, `${file} mentions \`${skill}\``).not.toContain(`\`${skill}\``)
      }
    }
  )

  it.each(reactSkills)('%s reaches every reference file from SKILL.md', (name) => {
    const referencesDir = join(REACT_DIR, name, 'references')
    if (!existsSync(referencesDir)) return
    const skillFile = join(REACT_DIR, name, 'SKILL.md')
    const linked = new Set(
      relativeLinks(readFileSync(skillFile, 'utf8'))
        .map((href) => resolve(dirname(skillFile), href))
    )
    for (const file of markdownFiles(referencesDir)) {
      expect(linked.has(file), `${name}: ${relative(ROOT, file)} is not linked from SKILL.md`).toBe(true)
    }
  })
})

describe('react catalogue', () => {
  it('contains exactly the eight v1 skills', () => {
    expect(readdirSync(REACT_DIR).sort()).toEqual([
      'react-core',
      'react-data',
      'react-debug',
      'react-hooks',
      'react-router',
      'react-state',
      'react-testing',
      'react-typescript',
    ])
  })

  it.each(['react-state', 'react-router', 'react-data'])(
    '%s compares options in a markdown table',
    (name) => {
      const skillFile = join(REACT_DIR, name, 'SKILL.md')
      const files = [skillFile, ...relativeLinks(readFileSync(skillFile, 'utf8'))
        .map((href) => resolve(dirname(skillFile), href))
        .filter((file) => file.endsWith('.md') && existsSync(file))]

      const hasTable = files.some((file) => {
        const lines = readFileSync(file, 'utf8').split('\n')
        for (let i = 0; i < lines.length; i++) {
          if (!/^\|\s*-{2,}/.test(lines[i].replace(/\s*\|\s*/g, '| '))) continue
          if (!/^\|.*\|/.test(lines[i - 1] ?? '')) continue
          let rows = 0
          for (let j = i + 1; j < lines.length && /^\|.*\|/.test(lines[j]); j++) rows++
          if (rows >= 3) return true
        }
        return false
      })
      expect(hasTable, `${name}: no comparison table with at least 3 data rows`).toBe(true)
    }
  )

  it.each([
    ['react-core', ['forwardRef', 'defaultProps']],
    ['react-hooks', ['useEffect', 'useMemo']],
    ['react-typescript', ['React.FC']],
  ])('%s covers its required topics', (name, words) => {
    const content = readFileSync(join(REACT_DIR, name, 'SKILL.md'), 'utf8')
    for (const word of words) expect(content, `${name} must mention ${word}`).toContain(word)
  })
})
