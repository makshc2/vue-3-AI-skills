import { existsSync, readdirSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { describe, it, expect } from 'vitest'
import {
  getCategories,
  getSkillsInCategory,
  isTopLevelSkill,
  listCatalogSkills,
} from '../bin/lib/catalog.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(ROOT, 'skills')

function makeFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-fixture-'))
  // category with a root SKILL.md plus a nested folder that must be ignored
  mkdirSync(join(dir, 'tool', 'nested'), { recursive: true })
  writeFileSync(join(dir, 'tool', 'SKILL.md'), '# tool\n')
  writeFileSync(join(dir, 'tool', 'nested', 'SKILL.md'), '# nested\n')
  // normal category
  mkdirSync(join(dir, 'alpha', 'alpha-one'), { recursive: true })
  writeFileSync(join(dir, 'alpha', 'alpha-one', 'SKILL.md'), '# alpha-one\n')
  // empty category
  mkdirSync(join(dir, 'empty'), { recursive: true })
  return dir
}

describe('catalog', () => {
  it('lists every real skill folder in skills/', () => {
    const catalog = listCatalogSkills()
    for (const category of readdirSync(SKILLS_DIR)) {
      const categoryDir = join(SKILLS_DIR, category)
      if (!statSync(categoryDir).isDirectory()) continue
      if (existsSync(join(categoryDir, 'SKILL.md'))) continue
      for (const name of readdirSync(categoryDir)) {
        const skillDir = join(categoryDir, name)
        if (!statSync(skillDir).isDirectory()) continue
        if (!existsSync(join(skillDir, 'SKILL.md'))) continue
        expect(catalog).toContainEqual({ name, category })
      }
    }
  })

  it('treats vite as a single top-level skill', () => {
    expect(listCatalogSkills()).toContainEqual({ name: 'vite', category: 'vite' })
    expect(isTopLevelSkill('vite')).toBe(true)
    expect(isTopLevelSkill('vue')).toBe(false)
  })

  it('ignores nested folders of a category that has a root SKILL.md', () => {
    const dir = makeFixture()
    try {
      const catalog = listCatalogSkills(dir)
      expect(catalog).toContainEqual({ name: 'tool', category: 'tool' })
      expect(catalog.some((s) => s.name === 'nested')).toBe(false)
      expect(catalog).toContainEqual({ name: 'alpha-one', category: 'alpha' })
      expect(getSkillsInCategory('tool', dir)).toEqual(['nested'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('yields no entries for an empty category', () => {
    const dir = makeFixture()
    try {
      expect(getCategories(dir).sort()).toEqual(['alpha', 'empty', 'tool'])
      expect(getSkillsInCategory('empty', dir)).toEqual([])
      expect(listCatalogSkills(dir).some((s) => s.category === 'empty')).toBe(false)
      expect(getSkillsInCategory('missing-category', dir)).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
