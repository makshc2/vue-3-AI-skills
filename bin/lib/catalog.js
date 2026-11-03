import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Default skills directory: `skills/` of this package. */
export const DEFAULT_SKILLS_DIR = join(__dirname, '..', '..', 'skills')

export function getCategories(skillsDir = DEFAULT_SKILLS_DIR) {
  if (!existsSync(skillsDir)) return []
  return readdirSync(skillsDir).filter(
    (entry) => statSync(join(skillsDir, entry)).isDirectory()
  )
}

export function getSkillsInCategory(category, skillsDir = DEFAULT_SKILLS_DIR) {
  const categoryDir = join(skillsDir, category)
  if (!existsSync(categoryDir)) return []
  return readdirSync(categoryDir).filter(
    (entry) => statSync(join(categoryDir, entry)).isDirectory()
  )
}

export function isTopLevelSkill(category, skillsDir = DEFAULT_SKILLS_DIR) {
  const categoryDir = join(skillsDir, category)
  return existsSync(join(categoryDir, 'SKILL.md'))
}

/** @returns {{name: string, category: string}[]} */
export function listCatalogSkills(skillsDir = DEFAULT_SKILLS_DIR) {
  const result = []
  for (const category of getCategories(skillsDir)) {
    if (isTopLevelSkill(category, skillsDir)) {
      result.push({ name: category, category })
      continue
    }
    for (const name of getSkillsInCategory(category, skillsDir)) {
      result.push({ name, category })
    }
  }
  return result
}
