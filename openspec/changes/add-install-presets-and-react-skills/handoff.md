# Session Handoff

## Closed role
Implementer (apply завершено: 50/50 задач `[x]`, 3.8 підтверджена людиною в реальному TTY)

## Change
- name: add-install-presets-and-react-skills
- status: implemented — 50/50 задач `[x]`; 3.8 `[human-step]` підтверджена людиною в реальному TTY 2026-11-03 (успіх → 9 скілів; Esc і Ctrl+C → ненульовий код і порожній каталог). Верифікація: `npm test` — 12 файлів / 531 тест passed; `openspec validate --all --strict` — 4 passed, 0 failed; `gate-check --tasks` — exit 0; code review: APPROVE.

## Done
Блок 1 (каталог і маніфест): `bin/lib/catalog.js` (дослівний перенос `getCategories`/`getSkillsInCategory`/`isTopLevelSkill` + `listCatalogSkills`), `bin/presets.json` (version 1, default `vue`, пресети vue/typescript/javascript/web/design/full, `unlisted`: vueuse, vue-architecture, vue-debug), `bin/lib/presets.js` (`loadManifest`, `presetNames`, `resolvePreset`, `validateManifest`), тести `test/catalog.test.mjs`, `test/presets.test.mjs`. `bin/install.js` у блоці 1 не змінювався (перевірено `git diff --quiet`).

Блок 2 (прапорці й розв'язання вибору): `test/cli-selection-legacy.test.mjs` написано й прогнано ДО будь-якої правки `bin/install.js` (9 характеризаційних кейсів). Далі `bin/lib/args.js` (чистий `parseArgs`, `--preset` з валідацією значення), `bin/lib/detect.js` (`readProjectDeps`, `detectPresets`, Vue 2 не визначається + note, `fallbackOnly`), `bin/lib/selection.js` (легасі-семантика без `--preset`; з `--preset`: невідомий пресет → errors першим, `--all` перемагає, інакше `P ∪ L`; `BUDGET_WARNING` лише для `mode:'all'` або `full`). `bin/install.js` переведено на модулі, `DEFAULT_SKILLS` видалено (grep = 0), `argv[1]` немає (grep = 0), `printUsage` бере default і пресети з маніфесту, `list` друкує секцію `Presets:`. Тести: args, detect, selection, cli-presets.

Блок 3 (залежність, меню): `@clack/prompts` 1.8.1 `--save-exact`, `engines.node` → `>=20.12.0` (`version` не змінювався, лишився 3.0.0); `test/packaging.test.mjs` (точна версія, збіг із lock, межа engines проти не-dev записів lock, вміст `npm pack`); `bin/lib/prompter.js` — єдиний файл у `bin/`, що згадує `@clack/prompts`, імпорт динамічний усередині `createPrompter()`; `bin/lib/menu.js` (`shouldShowMenu`, `buildMenuOptions`, `runMenu`, `formatEquivalentCommand` — підтримано і `agents:['all']`, і розгорнутий список, нотатка review 6); меню підключено в `main()` перед вибором агента, скасування → `Cancelled.` + exit 130 до будь-якого запису; тести menu і не-інтерактивних шляхів (піпи, `CI=1`).

Блок 4 (категорія `react`): 8 скілів з `references/` — react-core, react-hooks, react-typescript (хвиля A), react-state, react-router, react-data, react-testing, react-debug (хвиля B). Версії й API звірено з react.dev і реєстром npm (React 19.3.1, @types/react 19.3.0, @vitejs/plugin-react 6.2.1 + `reactCompilerPreset`/`@rolldown/plugin-babel`, правила компілятора в `eslint-plugin-react-hooks` `recommended-latest`, React Router 7, TanStack Router 1, Wouter 3, Zustand 5, Redux Toolkit 2, Jotai 3, TanStack Query 5, SWR 2, MSW 2, Testing Library 16). Пресет `react` = 9 скілів (8 react-* мінус `react-debug`, плюс typescript-core і vite); `react-debug` — лише `unlisted: on-demand`. Тести: `test/react-skills.test.mjs` (контракт + перелік із 8 + таблиці порівнянь + обов'язкові слова), кейс `installs react category to all agents` у `test/skills-structure.test.mjs` (межу `>=33` не чіпано), CLI-кейси пресета `react` і `--preset auto`.

Блок 5 (документація): README — `### React` з таблицею 8 скілів, `<details>` у Frequently searched, `react/` у дереві й у прикладі `list` (разом із секцією `Presets:`), новий `### Presets` (таблиця, приклади, меню, правила вибору, токен-бюджет) і `### Requirements` (Node ≥ 20.12 для користувачів, окремо контриб'ютори за `package-lock.json`), два виконані пункти Roadmap. `docs/improvement-roadmap.md` — твердження «no dependencies» замінено (одна runtime-залежність `@clack/prompts`), rank 11 отримав статус реалізованого. `package.json` description + keywords (react, react-skills, react19, react-compiler, presets), `.github/repository-metadata.json`, `.agents/skills/project-conventions/SKILL.md` (категорія `react`, `unlisted` у `bin/presets.json` замість «default install set in bin/install.js», новий крок про пресети, default = пресет `vue`), `openspec/config.yaml` (категорії, Node ≥ 20.12, Purpose, Layout, Stack).

Нотатки review враховано: (3) формулювання «окрім `*`» у `validateManifest` і в конвенціях; (4) розділ README `## Requirements` створено; (5) `printUsage` бере default із маніфесту; (6) обидва потоки агентів у меню; (7) Node 20.12 перепрогнано і в 3.9, і в 5.9.

## Decisions
15. Apply 2026-11-03 (фінал): людина підтвердила 3.8 у реальному TTY — усі три Done-when виконані; задачу позначено `[x]`, 50/50. `npm test` 531 passed, `openspec validate --all --strict` 4 passed, `gate-check --tasks` exit 0. Залишені відкриті питання (kit-churn, Open Questions у `design.md`) — рішення власника перед PR, на код не впливають.
14. Apply 2026-11-03 (контрольна сесія): єдина відкрита задача 3.8 `[human-step]` — агент не має TTY, тож нічого не реалізовано і `tasks.md` не редаговано. Перевірки зелені: `npm test` 12 файлів / 531 тест, `openspec validate --all --strict` 4 passed / 0 failed. Next command лишається `/opsx:apply` до підтвердження людиною.
13. Code review 2026-11-03 (post-implementation): `APPROVE` / Ready for MR. Зауваження рев'ювера (`VUE2_NOTE` не доходить у TTY-меню; порожній каталог при нульовому збігу; churn у `agent-verify.yml`) свідомо НЕ виправлялись у цій сесії: перші два — поза Done-when задач і поза вимогами delta-специфікацій, третє — kit-churn і рішення власника. Код і tasks.md у цій сесії не редагувались.

## Blocked
none (apply і code review закриті, 50/50). Поза межами зміни, рішення власника перед PR: kit-churn у робочому дереві (серед них `.github/workflows/agent-verify.yml`) і Open Questions у `design.md` (семантика релізу і `version`, CI Node 20.12, fallback `--preset auto` на `vue`, `typescript` як `fallbackOnly`, `react-architecture`).

## Next command
`npx agent-orchestrator-kit archive add-install-presets-and-react-skills --sync`

## Next role
none

## Attach
- `openspec/changes/add-install-presets-and-react-skills/tasks.md` (50/50 `[x]`)
- `openspec/changes/add-install-presets-and-react-skills/apply-notes.md`
- `bin/presets.json`, `bin/lib/catalog.js`, `bin/lib/presets.js`, `bin/lib/args.js`, `bin/lib/detect.js`, `bin/lib/selection.js`, `bin/lib/prompter.js`, `bin/lib/menu.js`, `bin/install.js`
- `skills/react/**` (8 скілів з `references/`)
- `test/catalog.test.mjs`, `test/presets.test.mjs`, `test/args.test.mjs`, `test/detect.test.mjs`, `test/selection.test.mjs`, `test/cli-selection-legacy.test.mjs`, `test/cli-presets.test.mjs`, `test/menu.test.mjs`, `test/packaging.test.mjs`, `test/react-skills.test.mjs`, `test/skills-structure.test.mjs`
- `README.md`, `docs/improvement-roadmap.md`, `openspec/config.yaml`, `.agents/skills/project-conventions/SKILL.md`, `.github/repository-metadata.json`

## Subagents to spawn
Жодного. `code-reviewer` відпрацював у цій сесії (APPROVE). Відкрита задача — лише human-step, субагент її виконати не може.

## Constraints
- 3.8 не позначати `[x]` без підтвердження людини в реальному TTY.
- Не комітити разом із kit-churn; рішення власника про churn — перед PR.
- Не редагувати: `.github/workflows/agent-verify.yml`, `version` у `package.json`, `openspec/specs/**`, `skills/**` поза `skills/react/**` (дотримано).
- `@clack/prompts` лише `1.8.1` (точно), імпорт лише в `bin/lib/prompter.js`, динамічно.
- Мова: чат і OpenSpec — українська; `SKILL.md` — англійська.

## Runtime
- runtime: local
- agent_id: none

## Metrics
- platform: claude
- model: claude-opus-5
- input_tokens: unknown
- output_tokens: unknown
- cost_usd: unknown
- amp_credits: unknown
- spend_source: unknown

## Prompt

```text
npx agent-orchestrator-kit archive add-install-presets-and-react-skills --sync

Ти — conductor наступної рольової сесії для зміни `add-install-presets-and-react-skills`.
Мова відповіді: українська (`project.agent_language: uk`). НЕ змішуй фази: наступна роль починається в НОВОМУ чаті після HARD STOP.

## Роль
- Наступна роль / субагент фази: `code-reviewer`
- Amp: заспавни isolated skill `subagent-code-reviewer` зі свіжим контекстом — тіло спеціаліста ніколи не виконується в головному треді Amp.
- Cursor / Claude: заспавни `.cursor/agents/code-reviewer.md` / `.claude/agents/code-reviewer.md`.
- Батьківська сесія — лише conductor: перевіряє звіт, не виконує роботу спеціаліста.

## Старт
`npx agent-orchestrator-kit handoff add-install-presets-and-react-skills --restore` — канонічний брифінг (handoff.md, decisions.md, Attach). Читай `openspec/changes/add-install-presets-and-react-skills/handoff.md` лише якщо restore впав. Лише після цього заспавни субагента фази. Free-form «продовжуй» / «далі» при одній активній зміні = `Handoff.next_command`.

## Контекст (самодостатній)
- Закрита роль: Implementer (apply завершено: 50/50 задач `[x]`, 3.8 підтверджена людиною в реальному TTY)
- Зміна: add-install-presets-and-react-skills (status: implemented — 50/50 задач `[x]`; 3.8 `[human-step]` підтверджена людиною в реальному TTY 2026-11-03 (успіх → 9 скілів; Esc і Ctrl+C → ненульовий код і порожній каталог). Верифікація: `npm test` — 12 файлів / 531 тест passed; `openspec validate --all --strict` — 4 passed, 0 failed; `gate-check --tasks` — exit 0; code review: APPROVE.)
- Зроблено:
Блок 1 (каталог і маніфест): `bin/lib/catalog.js` (дослівний перенос `getCategories`/`getSkillsInCategory`/`isTopLevelSkill` + `listCatalogSkills`), `bin/presets.json` (version 1, default `vue`, пресети vue/typescript/javascript/web/design/full, `unlisted`: vueuse, vue-architecture, vue-debug), `bin/lib/presets.js` (`loadManifest`, `presetNames`, `resolvePreset`, `validateManifest`), тести `test/catalog.test.mjs`, `test/presets.test.mjs`. `bin/install.js` у блоці 1 не змінювався (перевірено `git diff --quiet`).

Блок 2 (прапорці й розв'язання вибору): `test/cli-selection-legacy.test.mjs` написано й прогнано ДО будь-якої правки `bin/install.js` (9 характеризаційних кейсів). Далі `bin/lib/args.js` (чистий `parseArgs`, `--preset` з валідацією значення), `bin/lib/detect.js` (`readProjectDeps`, `detectPresets`, Vue 2 не визначається + note, `fallbackOnly`), `bin/lib/selection.js` (легасі-семантика без `--preset`; з `--preset`: невідомий пресет → errors першим, `--all` перемагає, інакше `P ∪ L`; `BUDGET_WARNING` лише для `mode:'all'` або `full`). `bin/install.js` переведено на модулі, `DEFAULT_SKILLS` видалено (grep = 0), `argv[1]` немає (grep = 0), `printUsage` бере default і пресети з маніфесту, `list` друкує секцію `Presets:`. Тести: args, detect, selection, cli-presets.

Блок 3 (залежність, меню): `@clack/prompts` 1.8.1 `--save-exact`, `engines.node` → `>=20.12.0` (`version` не змінювався, лишився 3.0.0); `test/packaging.test.mjs` (точна версія, збіг із lock, межа engines проти не-dev записів lock, вміст `npm pack`); `bin/lib/prompter.js` — єдиний файл у `bin/`, що згадує `@clack/prompts`, імпорт динамічний усередині `createPrompter()`; `bin/lib/menu.js` (`shouldShowMenu`, `buildMenuOptions`, `runMenu`, `formatEquivalentCommand` — підтримано і `agents:['all']`, і розгорнутий список, нотатка review 6); меню підключено в `main()` перед вибором агента, скасування → `Cancelled.` + exit 130 до будь-якого запису; тести menu і не-інтерактивних шляхів (піпи, `CI=1`).

Блок 4 (категорія `react`): 8 скілів з `references/` — react-core, react-hooks, react-typescript (хвиля A), react-state, react-router, react-data, react-testing, react-debug (хвиля B). Версії й API звірено з react.dev і реєстром npm (React 19.3.1, @types/react 19.3.0, @vitejs/plugin-react 6.2.1 + `reactCompilerPreset`/`@rolldown/plugin-babel`, правила компілятора в `eslint-plugin-react-hooks` `recommended-latest`, React Router 7, TanStack Router 1, Wouter 3, Zustand 5, Redux Toolkit 2, Jotai 3, TanStack Query 5, SWR 2, MSW 2, Testing Library 16). Пресет `react` = 9 скілів (8 react-* мінус `react-debug`, плюс typescript-core і vite); `react-debug` — лише `unlisted: on-demand`. Тести: `test/react-skills.test.mjs` (контракт + перелік із 8 + таблиці порівнянь + обов'язкові слова), кейс `installs react category to all agents` у `test/skills-structure.test.mjs` (межу `>=33` не чіпано), CLI-кейси пресета `react` і `--preset auto`.

Блок 5 (документація): README — `### React` з таблицею 8 скілів, `<details>` у Frequently searched, `react/` у дереві й у прикладі `list` (разом із секцією `Presets:`), новий `### Presets` (таблиця, приклади, меню, правила вибору, токен-бюджет) і `### Requirements` (Node ≥ 20.12 для користувачів, окремо контриб'ютори за `package-lock.json`), два виконані пункти Roadmap. `docs/improvement-roadmap.md` — твердження «no dependencies» замінено (одна runtime-залежність `@clack/prompts`), rank 11 отримав статус реалізованого. `package.json` description + keywords (react, react-skills, react19, react-compiler, presets), `.github/repository-metadata.json`, `.agents/skills/project-conventions/SKILL.md` (категорія `react`, `unlisted` у `bin/presets.json` замість «default install set in bin/install.js», новий крок про пресети, default = пресет `vue`), `openspec/config.yaml` (категорії, Node ≥ 20.12, Purpose, Layout, Stack).

Нотатки review враховано: (3) формулювання «окрім `*`» у `validateManifest` і в конвенціях; (4) розділ README `## Requirements` створено; (5) `printUsage` бере default із маніфесту; (6) обидва потоки агентів у меню; (7) Node 20.12 перепрогнано і в 3.9, і в 5.9.
- Блокери:
none (apply і code review закриті, 50/50). Поза межами зміни, рішення власника перед PR: kit-churn у робочому дереві (серед них `.github/workflows/agent-verify.yml`) і Open Questions у `design.md` (семантика релізу і `version`, CI Node 20.12, fallback `--preset auto` на `vue`, `typescript` як `fallbackOnly`, `react-architecture`).
- Attach:
- `openspec/changes/add-install-presets-and-react-skills/tasks.md` (50/50 `[x]`)
- `openspec/changes/add-install-presets-and-react-skills/apply-notes.md`
- `bin/presets.json`, `bin/lib/catalog.js`, `bin/lib/presets.js`, `bin/lib/args.js`, `bin/lib/detect.js`, `bin/lib/selection.js`, `bin/lib/prompter.js`, `bin/lib/menu.js`, `bin/install.js`
- `skills/react/**` (8 скілів з `references/`)
- `test/catalog.test.mjs`, `test/presets.test.mjs`, `test/args.test.mjs`, `test/detect.test.mjs`, `test/selection.test.mjs`, `test/cli-selection-legacy.test.mjs`, `test/cli-presets.test.mjs`, `test/menu.test.mjs`, `test/packaging.test.mjs`, `test/react-skills.test.mjs`, `test/skills-structure.test.mjs`
- `README.md`, `docs/improvement-roadmap.md`, `openspec/config.yaml`, `.agents/skills/project-conventions/SKILL.md`, `.github/repository-metadata.json`
- Субагенти цієї сесії:
Жодного. `code-reviewer` відпрацював у цій сесії (APPROVE). Відкрита задача — лише human-step, субагент її виконати не може.
- Обмеження:
- 3.8 не позначати `[x]` без підтвердження людини в реальному TTY.
- Не комітити разом із kit-churn; рішення власника про churn — перед PR.
- Не редагувати: `.github/workflows/agent-verify.yml`, `version` у `package.json`, `openspec/specs/**`, `skills/**` поза `skills/react/**` (дотримано).
- `@clack/prompts` лише `1.8.1` (точно), імпорт лише в `bin/lib/prompter.js`, динамічно.
- Мова: чат і OpenSpec — українська; `SKILL.md` — англійська.
- status: spec-approved
- tasks: 50/50
- review: APPROVE

## HARD STOP на виході (ти НЕ закінчив, поки це не виконано)
Запиши `openspec/changes/add-install-presets-and-react-skills/handoff.md` → `npx agent-orchestrator-kit handoff add-install-presets-and-react-skills` (exit 0) → встав stdout CLI одним fenced-блоком (перший рядок `/opsx:…`, без скорочень і ярлика) → зупинись.
Повний протокол: `.agents/rules/session-handoff.mdc`. OpenSpec-файли — source of truth.
```
