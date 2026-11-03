## Why

Інсталятор ставить один фіксований набір із 9 Vue-скілів, а вибір стеку можливий лише прапорцями `--category`/`--skill`/`--all`. Користувач React/TS/web-проєкту не має швидкого шляху до свого набору, а в каталозі взагалі немає React-скілів. `--all` уже впирається в бюджет списку скілів агента. Тому потрібні пресети стеків (дані, не код), інтерактивне меню з автовизначенням стеку та нова категорія `react`.

## What Changes

- Пресети стеків у JSON-маніфесті `bin/presets.json` замість константи `DEFAULT_SKILLS`: `vue` (рівно поточні 9), `react`, `typescript`, `javascript`, `web`, `design`, `full`. Скіл поза пресетами позначається `unlisted`.
- Прапорець `--preset <name>` (повторюваний, `--preset auto` — за `package.json` цілі); явна семантика поєднання з `--category`/`--skill` (з `--preset` — об'єднання, `--all` перемагає; без `--preset` — рівно легасі, включно з `--all --skill x` і нулем збігів → exit 1); невідомий пресет — exit 1.
- Інтерактивне меню пресетів лише в TTY (без `--yes` і без прапорців вибору), з попереднім вибором за автовизначенням, підсумком і виводом еквівалентної команди; Esc/Ctrl+C — ненульовий exit без запису файлів.
- Попередження про токен-бюджет для `full` і `--all`; `list` показує пресети.
- Логіка виноситься з `bin/install.js` у модулі `bin/lib/*` (юніт-тести); бібліотека промптів — за тонким адаптером.
- Нова категорія `skills/react/` (Vite SPA, React 19 + React Compiler; без Next.js/RSC/SSR): `react-core`, `react-hooks`, `react-typescript`, `react-state`, `react-router`, `react-data`, `react-testing`, `react-debug`.
- **BREAKING**: перша runtime-залежність `@clack/prompts` (точна версія) і підняття `engines.node` з `>=18` до `>=20.12.0`. Рекомендація — випускати як major.
- Документація: README, `project-conventions`, `openspec/config.yaml`, `package.json` (description/keywords), `.github/repository-metadata.json`, roadmap («no dependencies»).

## Capabilities

### New Capabilities

_Немає — зміна вкладається в наявні capability._

### Modified Capabilities

- `install-cli`: пресети, маніфест, `--preset`, автовизначення, меню, незмінна не-інтерактивна поведінка, `list` із пресетами.
- `skill-catalog`: категорія `react` (8 категорій), тест встановлення, документація, вимоги до React-скілів.
- `packaging`: runtime-залежність із точною версією й lockfile, нижня межа Node, вміст пакета.

## Non-goals

- Next.js, RSC, SSR, React Native; UI-кіти, форм-бібліотеки, стилізація; скіл `react-architecture`.
- Маніфест встановлення, `update`/`uninstall`/`doctor`, `list --tokens`, оцінка токенів у меню, другий крок вибору окремих скілів.
- Зміни наявних скілів (у т.ч. `typescript-vue` не перейменовується), обхід monorepo-workspace, окрема обробка Nuxt.
- Редагування `.github/workflows/agent-verify.yml` і зміна `version` у `package.json` (це крок релізу).

## Acceptance criteria

- `install --yes` без прапорців ставить рівно 9 скілів; наявні тести проходять без зміни очікувань.
- Без `--preset` вибір збігається з легасі: `--all --skill vite` ставить лише `vite`, `--all --category css` — лише `css-*`, `--category nope` — exit 1 `No matching skills` (без підстановки default).
- `--preset vue --preset web` ставить об'єднання; `--preset react --skill vue-core` = пресет плюс скіл; `--all --preset web` = увесь каталог; невідомий пресет дає exit 1 без запису файлів.
- `--preset auto` для `package.json` із `react` обирає `react`; без збігів — default із повідомленням.
- Меню не з'являється поза TTY, у CI, з `--yes` чи прапорцями вибору; скасування в меню — ненульовий exit і порожній target.
- Кожен скіл каталогу входить у ≥1 пресет або в `unlisted` (тест цілісності).
- `--category react --agent all` копіює всі `react-*` у три каталоги агентів.
- `npm test` і `npx openspec validate --all --strict` проходять.

## Impact

- Код: `bin/install.js`, нові `bin/presets.json`, `bin/lib/*.js`; тести `test/*.mjs`.
- Контент: `skills/react/**` (8 нових SKILL.md).
- Залежності: `package.json` (`dependencies`, `engines`), `package-lock.json`.
- Контриб'ютори: дев-інструменти (`vite`, `openspec`) вимагають Node ≥ 20.19, споживачі — Node ≥ 20.12; обидва речення — у README.
- Документи: `README.md`, `.agents/skills/project-conventions/SKILL.md`, `openspec/config.yaml`, `.github/repository-metadata.json`, `docs/improvement-roadmap.md`.
- Залежність від рішення власника: kit-churn у робочому дереві (на момент пропозиції 29 змінених + 2 нові файли після оновлення kit; кількість переоцінюється під час apply) — рішення «залишити чи відкотити» блокує apply і перший коміт (Open Question у design.md).
