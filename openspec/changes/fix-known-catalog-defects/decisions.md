# Decisions — fix-known-catalog-defects

<!-- append-only; пише npx agent-orchestrator-kit handoff <name> з handoff.md ## Decisions -->

- 2026-10-01 Ім'я зміни: fix-known-catalog-defects.
- 2026-10-01 Крок roadmap «CI node-version 20 → 22» виключено зі скоупу: .github/workflows/agent-verify.yml:18 уже `22` (змінено у fb0bdfb).
- 2026-10-01 javascript-node: `compatibility` на рядку 9 (roadmap каже 10). Значення містить подвійні лапки, тому «загорнути у подвійні лапки» зламало б YAML: одинарні лапки для `compatibility`, подвійні для `description`.
- 2026-10-01 Токени в артефактах — лише нижня межа bytes/4; факти подано в байтах, виміряних сесією.
- 2026-10-01 Q2 (README usage-приклади з не-default skills): обрано мінімальний diff — один hint-рядок про `--category javascript` замість заміни трьох прикладів; третій приклад (javascript-debug в Amp-блоці) знайшов архітектор. Альтернатива: замінити приклади на default-skills.
- 2026-10-01 Q3: дельта skill-catalog (5 ADDED) плюс нова capability packaging (2 ADDED: publish gate і Node-range для тестів).
- 2026-10-01 Q1: guard-тести strict-YAML і orphan — поза скоупом; вимоги перевіряються разово командами M2/M4, регресія можлива.
- 2026-10-01 Вимога «Strictly valid frontmatter» сформульована за результатом: блок парситься без помилок strict YAML 1.2, значення дорівнюють задуманому тексту; у лапки береться лише те, що не можна записати як plain-скаляр. Причина збою javascript-node — `: ` усередині `("type": "module")`, а не лапки; `vue-core` і `typescript-vue` мають валідні plain-скаляри з `lang="ts"` і не змінюються.
- 2026-10-01 Вердикт spec-reviewer: APPROVE (Blocker 0, Major 0, Minor 9). Minor M1-M9 визнано неблокуючими: M1, M5, M6, M9 враховано в apply-notes.md; M2, M3, M4, M7, M8 лишаються текстовими неточностями design.md/specs/README-охоплення без впливу на виконання задач, їх виправлення чи прийняття вирішує користувач.
- 2026-10-01 Дефолти Q1-Q5 і рішення Architect поза Q діють лише після явного підтвердження користувача; якщо користувач змінює будь-яке, спершу `/opsx:update fix-known-catalog-defects` (змінені артефакти потребують нового `/opsx:review`), а не `/opsx:apply`.
- 2026-10-01 Release note з design.md:137 не копіювати дослівно: речення про зміну slash-команди `/vueuse-functions` → `/vueuse` неточне й непідтверджене (M1).
- 2026-10-01 2026-10-01 Явний Approve користувача отримано до apply: Q1 (без guard-тестів strict-YAML і orphan), Q2 (один hint-рядок замість заміни usage-прикладів), Q3 (delta skill-catalog + нова capability packaging), Q4 (rename vueuse без alias і без bump версії, BREAKING), Q5 (compatibility інших skills не аудитується) і 4 рішення Architect поза Q (CI pin уже 22; javascript-node лапки `'` для compatibility і `"` для description; javascript-core лише TC39; vueuse без заміни абзацу IMPORTANT). Minor M2, M3, M4, M7, M8 прийнято як неблокуючі.
- 2026-10-01 2026-10-01 Task 2.2: hint вставлено з одним порожнім рядком з кожного боку без дублювання наявного порожнього (apply-notes, M6); буквальне читання Do дало б два порожні рядки.
- 2026-10-01 2026-10-01 Task 4.3 доповнено `git status --porcelain` (M5): 9 ` M` плюс `?? openspec/changes/fix-known-catalog-defects/`, інших untracked немає.
- 2026-10-01 2026-10-01 Release note при релізі писати нейтрально, не копіюючи design.md:137 (M1): rename змінює лише поле `name`; `/vueuse` у Claude Code працює через ім'я теки (roadmap:36); для хостів, що беруть команду з `name`, `/vueuse-functions` зникне; жоден випадок не перевірено.
