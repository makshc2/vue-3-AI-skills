## Context

- `bin/install.js` — один ESM-файл без runtime-залежностей; `main()` викликається на верхньому рівні й не експортується. Голий `install` ставить `DEFAULT_SKILLS` (9). Скіли вибираються лише `--category`/`--skill`/`--all`; `--category` разом із `--skill` дає перетин; `--all` лише вимикає default і не розширює фільтри (`--all --skill x` ставить лише `x`, `--all --category css` — лише `css`); нуль збігів → exit 1 `No matching skills`. Інтерактив — лише вибір агента через `node:readline`.
- Усі наявні інсталяційні тести запускають `--yes --agent … --target <tmp>` без TTY; один тест вимагає рівно 9 скілів у default.
- Категорії виявляються з файлової системи (`getCategories()`); категорія з кореневим `SKILL.md` ігнорує вкладені скіли. Імена скілів плоскі й глобально унікальні.
- Стан каталогу на момент пропозиції: 33 скіли, 7 категорій (кількості перевіряються під час apply); React-скілів немає. `--all` уже на межі бюджету списку скілів агента (`docs/improvement-roadmap.md`, розділ про бюджет).
- Рішення власника (`decisions.md`, не переглядаються): (1) меню = стеки/пресети; (2) стороння prompt-бібліотека = перша runtime-залежність; (3) автовизначення стеку входить у зміну; (4) React v1 = лише Vite SPA, нейтральний огляд роутерів/state; (5) пресети й React — одна зміна, tasks блоками.

## Goals / Non-Goals

**Goals:**

- Пресети як дані (`bin/presets.json`), `--preset`, `--preset auto`, меню в TTY з попереднім вибором.
- Нульова зміна поведінки для не-TTY, CI, `--yes` і прапорців вибору.
- Логіка в модулях `bin/lib/*`, юніт-тестована без TTY; бібліотека промптів ізольована адаптером.
- Категорія `react` із 8 скілів, придатна до часткового встановлення (без висячих посилань).
- Блоки tasks, кожен із власним `npm test`, придатні для окремих сесій apply.

**Non-Goals:** див. `proposal.md` (Next.js/RSC/SSR, маніфест встановлення, `list --tokens`, оцінка токенів, зміна наявних скілів, версія пакета, `agent-verify.yml`).

## Decisions

### D1. Маніфест пресетів `bin/presets.json`

Формат (версія схеми 1):

```json
{
  "version": 1,
  "default": "vue",
  "presets": {
    "vue":   { "label": "Vue 3", "skills": ["vue-core", "..."], "detect": { "dependencies": ["vue"] } },
    "full":  { "label": "Full catalog", "skills": "*" }
  },
  "unlisted": { "vueuse": "manual-only", "vue-debug": "on-demand" }
}
```

- `skills` — явний список імен (або `"*"` = увесь каталог, лише для `full`). Явні списки, а не категорії: новий скіл без пресета ламає тест цілісності, що змушує свідомо вирішити, куди його віднести. Категорії й `--category` лишаються виявленими з файлової системи; маніфест їх не дублює.
- `unlisted` — скіли поза пресетами з причиною: `manual-only` (потрібен `disable-model-invocation: true` у frontmatter) або `on-demand` (не входить у token-light набір, ставиться через `--category`/`--skill`/`full`).
- `detect` (необов'язково): `dependencies` (імена пакетів), `files` (імена файлів у корені цілі), `fallbackOnly` (пресет спрацьовує, лише якщо не знайдено жодного не-fallback пресета).
- Маніфест читається через `readFileSync` + `JSON.parse` відносно `import.meta.url` (без import attributes, щоб не залежати від версії Node). `bin` уже в `files` пакета.

Склад пресетів (A1, уточнено; фіксується в delta «Preset contents»):

| Пресет | Скіли | Автовизначення |
|--------|-------|----------------|
| `vue` (default) | vue-core, vue-pinia, vue-axios, vue-router, vue-composables, vue-testing, typescript-vue, typescript-core, vite (рівно 9) | залежність `vue` (крім мажора 2) |
| `react` | react-core, react-hooks, react-typescript, react-state, react-router, react-data, react-testing, typescript-core, vite (9) | залежність `react` |
| `typescript` | typescript-core, typescript-types, typescript-config, typescript-testing, typescript-debug | залежність `typescript` або `tsconfig.json`, `fallbackOnly` |
| `javascript` | усі 7 `javascript-*` | немає |
| `web` | html-core, html-forms, html-a11y, css-core, css-layout, css-responsive, css-animations | немає |
| `design` | design-transfer, design-from-screenshot, figma-intake | немає |
| `full` | `"*"` | немає |

`unlisted`: `vueuse`, `vue-architecture` (`manual-only`); `vue-debug`, `react-debug` (`on-demand`, за аналогією: debug-скіли не входять у token-light набір фреймворку, як і зараз `vue-debug`). Пресет `react` додається в маніфест у блоці React-скілів (до того скілів не існує й тест цілісності впав би).

Альтернативи: код у `install.js` (відхилено — не тестується без запуску CLI, не читається інструментами); категорії як пресети (відхилено — `vue` мусить бути рівно 9, а не вся категорія з 9 + 0, і `typescript-vue` лежить у `typescript/`); YAML (відхилено — потрібен парсер, а JSON читається без залежностей).

### D2. Семантика вибору

Нехай `P` — об'єднання скілів усіх `--preset`, `L` — легасі-набір із `--category`/`--skill`: скіли каталогу, для яких (категорії не задано або категорія скіла в списку) **і** (`--skill` не задано або ім'я скіла в списку); це відтворює `bin/install.js:213-243` (категорії → усі скіли категорій; лише `--skill` → названі; обидва → перетин). `--all` у легасі лише вимикає default і не розширює `L`. Правила за порядком:

1. Невідомий пресет або `--preset` без значення → помилка (exit 1, повідомлення зі списком доступних), файли не пишуться; перевіряється першою, навіть з `--all`.
2. **Без `--preset`** — рівно легасі: немає жодного з `--all`/`--category`/`--skill` → пресет `default` (9 скілів, `mode:'default'`); інакше `L`, де `--all` без `--category`/`--skill` дає весь каталог (`mode:'all'`), а `--all --skill x` і `--all --category css` дають лише `x` / `css`. `L` порожній (напр. `--category nope`) → exit 1 `No matching skills` (існуюче повідомлення `installSkills`), default **не** підставляється.
3. **З `--preset`**: є `--all` → увесь каталог (`mode:'all'`, пресети й фільтри нічого не змінюють); інакше `P ∪ L`, де `L` порожній, якщо не задано ні `--category`, ні `--skill` (а не «весь каталог»).

Отже `--preset react --skill vue-core` = react ∪ {vue-core}; `--preset react --category css` = react ∪ усі css; `--category vue --skill vue-core` без пресета лишається перетином (легасі). `--all` «перемагає» лише разом із `--preset`. Невідомий `--skill` лишається мовчки неіснуючим (як зараз; валідація — окремий roadmap-пункт): `--preset web --skill nope` ставить `web`, а `--skill nope` без пресета дає exit 1.

Selection повертає явний список імен скілів; `installSkills` лише копіює їх (для кожного агента). Перед рефакторингом пишуться характеризаційні тести легасі-вибору (блок 2, задача 2.1) із кейсами `--all --skill x`, `--all --category css`, `--category nope`.

### D3. Автовизначення (`--preset auto`, попередній вибір меню)

- Джерело: `<target>/package.json` (`--target` або cwd); зливаються `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`. Лише корінь цілі: workspace-обхід не робиться (документується `--target <package>`). Мережі й запису файлів немає.
- Пресет визначено, якщо збігається будь-яке ім'я з `detect.dependencies` або існує будь-який файл із `detect.files`. Діапазони `catalog:`, `workspace:*` тощо вважаються присутністю.
- `vue` не визначається для мажора 2 (діапазон, що починається з `2`/`^2`/`~2`/`2.x`): ставити Vue-3 скіли в Vue 2 проєкт шкідливо; друкується пояснення.
- `fallbackOnly` (`typescript`) спрацьовує лише без збігів серед інших: `auto` для React+TS дає `react`, а не `react ∪ typescript` (тримає набір ≈ розміру default).
- Немає `package.json`, JSON зіпсований або збігів немає → fallback на default-пресет із повідомленням «No stack detected; using default preset (vue)». Ніколи не завершує запуск помилкою.
- `--preset auto` можна комбінувати з іменами (`--preset auto --preset web`) — об'єднання.

### D4. Меню (TTY)

Умова показу: команда `install`, `stdin.isTTY` і `stdout.isTTY`, немає `--yes`/`-y`, немає `--all`/`--category`/`--skill`/`--preset`, немає змінної `CI`. Інакше поведінка без змін (у т.ч. наявний `readline`-вибір агента, якщо TTY і є прапорці вибору без `--agent`).

Потік:
1. `multiselect` пресетів (мінімум один). Початковий вибір = визначені пресети; якщо жодного — `vue` (Enter без змін = легасі default). Підписи містять кількість скілів; біля `full` — попередження про бюджет.
2. Агент(и) — `select`, лише якщо немає `--agent` і змінної середовища агента.
3. Підсумок: кількість унікальних скілів і еквівалентна команда (`npx frontend-agent-skills install --preset vue --preset web --agent claude`; `--target` лише якщо не cwd; друкується розв'язаний список імен, не `auto`), далі встановлення.

Скасування (результат `isCancel`) → повідомлення «Cancelled», exit 130, жодного запису. Додаткового підтвердження немає. Оцінки токенів немає (A5): лише кількість.

### D5. Бібліотека промптів: `@clack/prompts@1.8.1` (точна версія)

Звірено `npm view` 2026-11-03:

| Кандидат | Версія | Node engines | Підтримка | Залежності | Висновок |
|----------|--------|--------------|-----------|------------|----------|
| `@clack/prompts` | 1.8.1 | `>=20.12.0` | оновлено 2026-09-13, MIT, ESM | 4 прямі (`@clack/core` 1.5.1, `sisteransi`, `fast-wrap-ansi`, `fast-string-width`) | **обрано** |
| `@inquirer/prompts` | 8.7.5 | `>=23.5.0 \|\| ^22.13.0 \|\| ^20.17.0` | оновлено 2026-10-27 | 10 під-пакетів | відхилено: вужчі engines (виключає 20.12–20.16, 22.0–22.12), більший граф |
| `prompts` | 2.4.2 | `>=6` | востаннє 2023-10 | — | відхилено: не підтримується |
| `enquirer` | 2.4.1 | — | востаннє 2023-07 | — | відхилено: не підтримується |
| власний raw-mode UI на `node:readline` | — | — | — | 0 | відхилено рішенням власника (сторонній UI) і складністю edge-case (resize, Windows, cancel) |

Критерії: нижня межа Node якомога менша й чесна (ця бібліотека задає `>=20.12.0`), підтримуваність, ESM, готові `multiselect`/`select`/`isCancel`, малий граф. Версія фіксується **точно** (`"@clack/prompts": "1.8.1"`, без `^`): інсталятор запускається через `npx` без перегляду коду користувачем, тож оновлення залежності — свідомий крок. Перед фіксацією apply повторно перевіряє `npm view @clack/prompts@1.8.1 engines` і API (`multiselect`, `select`, `isCancel`, `cancel`) за встановленим пакетом.

Ізоляція: імпортує бібліотеку лише `bin/lib/prompter.js` через динамічний `import()` у момент показу меню. Не-інтерактивні шляхи її не завантажують (на Node < 20.12 вони, імовірно, працюватимуть, але це не обіцянка, а побічний ефект; підтримуваний діапазон — `engines`).

### D6. `engines.node`: `>=18` → `>=20.12.0` і semver

- Мінімум = нижня межа обраної бібліотеки. Node 18 — EOL (квітень 2025); Node 20 — також EOL (квітень 2026), але межа не вужча за потрібну; піднімати до 22 без потреби не варто.
- Semver-оцінка: це **BREAKING** для користувачів Node 18 і 20.0–20.11 (npm дає `EBADENGINE` — попередження, помилка лише з `engine-strict`; `npx` із нею запускає й може впасти на імпорті меню). За загальноприйнятою конвенцією відмова від версії Node = major. Рекомендація: наступний реліз — major відносно поточної `version`. Сама зміна `version` — крок релізу поза цією зміною (Open Question 2).
- CI — лише Node 22 (`agent-verify.yml` kit-managed, не редагується). Межа 20.12 у CI не перевіряється; компенсація — ручна перевірка в блоці 3 (`npx --yes node@20.12.0 …`) і рядок у README.
- Дев-інструменти (`vite`, `@fission-ai/openspec`) у `package-lock.json` вимагають Node ≥ 20.19 (значення читається з lockfile під час apply): це стосується контриб'юторів, а README «Node 20.12» — споживачів; обидва речення фіксуються в README (задача 5.2).
- Наявна вимога packaging «Test suite honors the declared Node range» посилається на `engines >=18`: MODIFIED із тією самою поведінкою (скіп `Object.groupBy` на Node < 21) і оновленим GIVEN.

### D7. Модулі `bin/lib/*`

| Модуль | Відповідальність |
|--------|------------------|
| `catalog.js` | `getCategories`, `getSkillsInCategory`, `isTopLevelSkill`, `listCatalogSkills(skillsDir)` → `[{name, category}]` |
| `presets.js` | завантаження й валідація маніфесту, `resolvePreset`, список імен, default |
| `detect.js` | читання `package.json` цілі, `detectPresets` із правилами D3 |
| `args.js` | чистий `parseArgs(argv)` → `{options, errors}`; легасі-розбір без змін (невідомі прапорці ігноруються, значення беруться як `args[i+1]`) |
| `selection.js` | `resolveSelection` за D2, попередження про бюджет, повідомлення про fallback |
| `menu.js` | `shouldShowMenu`, `runMenu(prompter, …)`, формування еквівалентної команди |
| `prompter.js` | **єдине** місце з `@clack/prompts`; тонкий адаптер із методами, що підміняються в тестах |

`bin/install.js` лишається точкою входу: wiring, `copyDir`, `listSkills`, `installSkills`, `promptAgent` (легасі readline), `printUsage`. Без перевірки «чи це головний модуль» (symlink у `npx` її ламає): модулі `lib` не мають побічних ефектів при імпорті, юніт-тести імпортують лише їх. Рядок категорій у `printUsage` генерується з файлової системи.

### D8. Попередження про бюджет

Коли встановлюється весь каталог через `--preset full` (у т.ч. вибраний у меню) або `--all` (також `--all` з `--preset`; не `--all --skill x` / `--all --category css`, які ставлять частину), у stderr друкується одне попередження: повний каталог може перевищити бюджет списку скілів агента, описи частини скілів можуть бути усічені; посилання на розділ README. Встановлений набір, stdout і exit-код не змінюються. Числа токенів не друкуються (вони залежать від агента й версії); README посилається на вимірювання з roadmap із позначкою «виміряно для Claude Code 2.1.286».

### D9. React-скіли: межі й контракт

Категорія `skills/react/` містить лише вкладені `skills/react/<name>/SKILL.md` (кореневого `SKILL.md` немає). Frontmatter: `name` = папка, `description` (починається «Use for…», до 350 символів — захист бюджету; значення з `: ` — у лапках), `license: MIT`, `metadata.sources` (≥1 офіційний URL: react.dev або документація бібліотеки), `metadata.version`, `compatibility` (React 19 + Vite SPA). Деталі — у `references/*.md`, кожен файл має бути досяжним за посиланням із `SKILL.md`. Мови: SKILL.md англійською.

Посилання й згадки інших скілів — лише `react-*`, `html-*`, `css-*` (без залежності від `vite`, `typescript-*`, `vue-*`; інакше висячі посилання при частковому встановленні). Версії й API звіряються з react.dev і документацією бібліотек під час написання, а не з пам'яті агента.

Загальний фокус на антипатернах LLM: `useEffect` для похідного стану, `forwardRef` (у React 19 `ref` — проп), `defaultProps`, `React.FC`, `Context.Provider` замість `<Context value>`, повсюдний `useMemo`/`useCallback`/`memo` за наявності React Compiler.

| Скіл | Обов'язкові теми | Джерела для звірки | Режим |
|------|------------------|--------------------|-------|
| `react-core` | базис Vite SPA + React Compiler (підключення за актуальною документацією), компоненти й пропси, обчислення похідних даних під час рендеру, keys, composition, Context, ref як проп, форми й Actions (`useActionState`, `useFormStatus`, `useOptimistic`), метадані документа, StrictMode | react.dev (learn, reference, блог React 19), документація `@vitejs/plugin-react`, React Compiler | model-invocable |
| `react-hooks` | правила хуків, `useEffect` («You Might Not Need an Effect»: похідний стан, скидання через `key`, обробники подій, підписки через `useSyncExternalStore`), cleanup і races, `useRef`, `useTransition`/`useDeferredValue`, `use`, `useEffectEvent`, кастомні хуки, Compiler: коли `useMemo`/`useCallback`/`memo` не потрібні й коли лишаються, `'use no memo'`, eslint-правила | react.dev reference, React Compiler docs, `eslint-plugin-react-hooks` | model-invocable |
| `react-typescript` | типізація пропсів (не `React.FC`), `ComponentProps`, `ReactNode`, події, generic-компоненти, `ref` як проп, типізація `useState`/`useReducer`/`useRef`/Context, `jsx: "react-jsx"`, зміни `@types/react` 19, discriminated unions | react.dev (TypeScript), `@types/react`, TypeScript handbook (JSX) | model-invocable |
| `react-state` | локальний/піднятий стан, Context + `useReducer`, `useSyncExternalStore`; нейтральна таблиця критеріїв для Zustand, Redux Toolkit, Jotai (+ одним рядком інші) без «єдиного правильного»; пастки (fan-out Context, серверні дані в client-store, похідні дані в сховищі) | react.dev (Managing State), документація кожної бібліотеки | model-invocable |
| `react-router` | нейтральна таблиця критеріїв для React Router (declarative/data режими для SPA), TanStack Router, Wouter, «без роутера»; вкладені layouts, lazy-маршрути, search params, захист маршрутів, пастки | документація кожного роутера | model-invocable |
| `react-data` | серверний стан у SPA: гонки й waterfalls у `useEffect`, `use` + Suspense, Error Boundaries, мутації через Actions, оптимістичні оновлення; нейтральна таблиця критеріїв (TanStack Query, SWR, RTK Query, loaders роутера, простий `fetch`) | react.dev (`use`, Suspense), документація бібліотек | model-invocable |
| `react-testing` | Vitest + React Testing Library + `user-event`, `renderHook`, обгортки провайдерів, async-запити (`findBy*`), мокування мережі (MSW), Suspense/Error Boundary у тестах, a11y-запити; уникання тестування деталей реалізації | документація Testing Library, Vitest, MSW | model-invocable |
| `react-debug` | типові помилки й попередження (надмірні ре-рендери, «Cannot update a component while rendering…», нескінченні ефекти, stale closures, порядок хуків, `act`), StrictMode, Profiler/DevTools, `onCaughtError`/`onUncaughtError`, діагностика Compiler | react.dev, React DevTools | model-invocable |

`react-debug` не входить у пресет `react` (як `vue-debug` у `vue`). Решта скілів `react` входять. `react-architecture` у v1 не створюється (Non-goal): механізм `manual-only` уже покритий Vue-скілами, а обсяг зміни й так великий.

Хвилі: **A** = `react-core`, `react-hooks`, `react-typescript` (повторюваний базис, перевіряється першим); **B** = `react-state`, `react-router`, `react-data`, `react-testing`, `react-debug`. Пресет `react` і тест встановлення категорії додаються після хвилі B.

### D10. Наявні скіли не змінюються

Перехресні вказівки у `vite`, `typescript-config`, testing-скілах не додаються: будь-яке посилання з не-React скіла на `react-*` висить при частковому встановленні (roadmap), а `vite/SKILL.md` уже перелічує React-плагіни. Мінімум = нуль змін у `skills/` поза `skills/react/`. Це припущення A7.

### D11. Тести

Нові файли в `test/`: `catalog.test.mjs`, `presets.test.mjs` (цілісність, негативні фікстури), `args.test.mjs`, `detect.test.mjs`, `selection.test.mjs` (у т.ч. характеризація легасі), `menu.test.mjs` (фейковий prompter), `cli-presets.test.mjs` (CLI без TTY через `execFileSync`, `npm pack --dry-run` вміст), `react-skills.test.mjs`. Існуючі тести не змінюються, крім доданого кейсу `react` у `skills-structure.test.mjs` (за прецедентом html/css). Меню в реальному TTY перевіряється вручну (чекпоінт блоку 3).

## Припущення (потребують підтвердження на spec-review)

Припущення explorer A1–A6 не підтверджені власником. Нижче — як я їх прийняв і що зміниться, якщо вони хибні.

| № | Припущення | Обґрунтування | Якщо хибне |
|---|------------|---------------|------------|
| A1 | Склад пресетів із таблиці D1; скіл може бути в кількох пресетах | паралель із поточним default; явні списки + тест цілісності | змінюється `bin/presets.json`, README, delta «Preset contents» і тести, що фіксують склад (1.5б, 2.10, 4.13); код `bin/lib/*` не змінюється |
| A1′ | `react` = 9 скілів без `react-debug` (уточнення A1, де було «react-*») | token-light паралель із `vue` (без `vue-debug`) | додати `react-debug` у пресет і прибрати з `unlisted`; оновити тести 4.13/2.10, delta «Preset contents» і README |
| A2 | `install --yes`/не-TTY без прапорців = `vue` (9); `--preset auto` — opt-in; без збігів fallback на default | не ламає CI і spec | якщо fallback має бути іншим (напр. `typescript-core`+`vite`) — змінити `default`/правило fallback в D3, delta «Auto-detection fallback» і сценарії/тести 2.5, 2.10 (spec уже кодує це припущення як MUST, доки власник не відповів на Open Question 3) |
| A2′ | `typescript` — `fallbackOnly` | `auto` для React/Vue+TS не роздуває набір | зробити звичайним — `auto` дасть react ∪ typescript (13 скілів); змінити delta «Stack auto-detection» (сценарій React project), `bin/presets.json` і тести 2.5, 2.10, 4.13 (spec кодує це припущення як MUST до відповіді власника на Open Question 4) |
| A3 | Семантика D2: без `--preset` — рівно легасі (включно з `--all` + фільтри, нуль збігів → exit 1); з `--preset` — `P ∪ L`, `--all` перемагає; `--preset` повторюваний | зберігає легасі й додає передбачуване об'єднання | інша семантика (напр. перетин із `--category`) — змінити `selection.js`, delta «Selector combination» і тести 2.7, 2.10 |
| A4 | Немає другого кроку «точне налаштування»; `vueuse`, `vue-architecture` лише через `--skill`/`full` | менше UI й тестів у v1 | додати крок меню окремою зміною |
| A5 | Підсумок = кількість скілів + еквівалентна команда; токенів немає | оцінка залежить від агента/версії | додати `list --tokens` окремою зміною |
| A6 | 8 React-скілів із D9; `react-architecture` відкладено; типізація в `react-typescript`, не в `typescript/` | `typescript-vue` не чіпаємо; нижчий обсяг | додати `react-architecture` (`manual-only`) окремою зміною |
| A7 | Наявні скіли не редагуються (D10) | відсутність висячих посилань | додати текстові згадки без посилань окремою зміною |
| A8 | Ліміт опису React-скіла 350 символів | бюджет списку скілів | змінити константу в `test/react-skills.test.mjs` |
| A9 | Код виходу при скасуванні меню — 130, меню без додаткового підтвердження | конвенція SIGINT | довільний ненульовий код сумісний зі spec |

## Risks / Trade-offs

- [Підняття `engines` ламає Node 18/20.0–20.11] → позначено **BREAKING**, рекомендація major, README, динамічний імпорт бібліотеки лише в меню.
- [Велика зміна під одним review-гейтом] → 5 блоків із власним `npm test`; React-скіли хвилями; крупні блоки можна віддати окремим apply-сесіям.
- [Регресія легасі-вибору при винесенні в модулі] → характеризаційні тести до рефакторингу; наявні тести не змінюються.
- [Нова runtime-залежність у `npx`-інструменті: supply chain] → точна версія, lockfile, лише одна пряма залежність, ізоляція адаптером.
- [`full` і `--all` перевищують бюджет списку скілів агента, ще більше з React] → попередження + розділ README.
- [Контент React-скілів застаріває швидше за інші (React/Compiler/роутери)] → `metadata.sources`, `metadata.version`, звірка з docs під час написання, нейтральні таблиці без «рекомендованого».
- [Не-TTY / CI регресія через меню] → умова показу D4 і тести `shouldShowMenu`; меню лише при `isTTY` обох потоків і без `CI`.
- [Фактичні сценарії меню в реальному TTY не покриті автотестами] → ручний чекпоінт у блоці 3.
- [Kit-churn у робочому дереві] → див. Open Questions 1.

## Migration Plan

- Існуючі користувачі з прапорцями й `--yes`: без змін. Користувачі, що запускають голий `install` у терміналі, замість prompt-агента побачать меню; Enter із початковим вибором = колишній default (`vue`), якщо стек не визначено.
- Реліз: окремий крок (не в цій зміні) — bump `version` (рекомендовано major) і примітка про Node ≥ 20.12.
- Відкат: видалення `bin/lib/*`, `bin/presets.json`, залежності й повернення `engines`; React-скіли видаляються окремо, бо категорія виявляється з файлової системи.
- Main specs оновлюються лише при `/opsx:archive`; у цій зміні вони не редагуються.

## Open Questions

1. **Kit-churn (блокер apply/першого коміту).** Оновлення kit до 0.20.1 лишило в робочому дереві 29 змінених і 2 нові файли (`.agents/**`, `scripts/**`, `.github/workflows/agent-verify.yml`, `.gitignore`), нічого не закомічено. Рішення «залишити чи відкотити» не прийнято; без нього коміти цієї зміни змішаються з churn. Architect цих файлів не торкається.
2. Чи підтверджує власник major-реліз (3.x → наступний major) через `engines`, чи достатньо minor з приміткою? Чи піднімати `version` у цій зміні, чи при релізі?
3. Fallback `--preset auto` без збігів = `vue` (A2) — прийнятно для не-Vue проєкту, чи краще окремий мінімальний набір? (Непідтверджена пропозиція architect; delta «Auto-detection fallback» кодує її й зміниться разом із відповіддю.)
4. Чи залишати `typescript` як `fallbackOnly` (A2′)? (Непідтверджена пропозиція; delta «Stack auto-detection» кодує її й зміниться разом із відповіддю.)
5. Чи потрібен окремий CI-прогін на Node 20.12 (новий workflow поза kit-managed файлом)? Зараз — лише ручна перевірка.
6. `react-architecture` (A6) — відкласти (прийнято тут) чи включити в цю зміну?

## Delivery blocks (порядок apply)

| Блок | Зміст | Перевірка |
|------|-------|-----------|
| 1 | `bin/lib/catalog.js`, `bin/presets.json` (без `react`), `bin/lib/presets.js`, тести цілісності | `npm test` |
| 2 | `args.js`, `detect.js`, `selection.js`, wiring `--preset`/`auto`, `list`, попередження, характеризаційні й CLI-тести | `npm test` |
| 3 | залежність + `engines` + lockfile, `prompter.js`, `menu.js`, wiring меню, тести, ручний TTY-чекпоінт | `npm test`, Node 20.12 |
| 4 | React-скіли: хвиля A → хвиля B → пресет `react`, тест категорії | `npm test` після кожної хвилі |
| 5 | README, project-conventions, config.yaml, package.json, metadata, roadmap, фінальна верифікація | `npm test`, `openspec validate --all --strict` |
