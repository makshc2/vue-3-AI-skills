# Apply notes: fix-known-catalog-defects

- Порядок 1.x, 2.x, 3.x, 4.x. Задача 3.2 лише після 1.3, інакше рівно 2 червоних кейси (`vueuse has valid frontmatter`, `skills/vue/vueuse/SKILL.md links resolve`).
- Дефолти Q1-Q5 діють, лише якщо користувач їх підтвердив; інакше спершу `/opsx:update`, не apply.
- javascript-node: `description` у ПОДВІЙНИХ лапках, `compatibility` в ОДИНАРНИХ (`("type": "module")` ламає подвійні). Ключі шукати за іменем (`compatibility` на рядку 9, не 10); жодного слова не міняти (`description` = 403 символи).
- vueuse: міняється лише поле `name` (папку `skills/vue/vueuse` не перейменовувати); 268 обгорток = 266 `references/*.md` + 2 `../useX/index.md`; 95 http(s)-лінків і 299 рядків таблиць не чіпати; видалити рядок `IMPORTANT ...` і один порожній; очікувано 28782 B (ліміт 29009).
- Команди 1.3 (`sed -i`, адреса `,+1d`) GNU-специфічні й ідемпотентні; на BSD/macOS брати node-еквівалент. Решта правок не ідемпотентна: 1.2, 1.4, 2.2 повторним застосуванням дублюють лапки або рядки.
- 1.4: вставка між абзацом `Replaces the old` і `## 4)`. 1.5: MDN уже є, не додавати вдруге. 2.2: по одному порожньому рядку до і після hint (наявний порожній не дублювати).
- НЕ чіпати: `bin/`, `DEFAULT_SKILLS`, `engines`, `version`, `.github/` (node-version уже 22), `docs/`, інші SKILL.md (зокрема `compatibility` інших skills), `parseFrontmatter` (лишається line-regex), `openspec/specs/`, decisions.md, handoff.md, metrics.json.
- НЕ додавати: guard-тести strict-YAML/orphan, alias `vueuse-functions`, lookup-правило VueUse, нові файли. Не skip-ати й не видаляти тести заради зеленого `npm test`.
- Release note з design.md:137 не копіювати дослівно: речення про slash-команду неточне (review.md, M1).
- 4.3: `git diff` не показує untracked, тож додатково `git status --porcelain` має містити лише 9 рядків ` M` (плюс `?? openspec/changes/fix-known-catalog-defects/`, якщо зміну ще не закомічено).
- Верифікація (корінь репозиторію, Node 22): `npm test` → `Test Files  2 passed (2)`, `Tests  296 passed (296)`; `npm run openspec:validate` → 3 passed.
- `NODE_OPTIONS='--import=data:text/javascript,delete%20Object.groupBy' npx vitest run test/skills-behavior.test.mjs` → `Tests  15 passed | 1 skipped (16)`.
- Команди з tasks 4.1/4.2 → `invalid: 0 of 33`; `broken relative links: 0 in 239 md files`, `done`, `orphan reference files: 0`; `wc -c < skills/vue/vueuse/SKILL.md` → 28782; `git diff --name-only fb0bdfb -- . ':!openspec'` → рівно 9 файлів (README.md, package.json, 5 SKILL.md, 2 тести).
