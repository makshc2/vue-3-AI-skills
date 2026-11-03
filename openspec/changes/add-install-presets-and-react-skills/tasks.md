# Tasks: add-install-presets-and-react-skills

Передумова для apply (гейт, не задача): (1) `review.md` із `Verdict: APPROVE`; (2) власник вирішив долю kit-churn у робочому дереві (на момент пропозиції 29 змінених + 2 нові файли після оновлення kit; рішення «залишити чи відкотити» не прийнято, див. Open Questions у `design.md`), інакше коміти цієї зміни змішаються з churn.

Мови: артефакти зміни — українською; `README.md`, `package.json`, `.github/repository-metadata.json`, `SKILL.md` і код — англійською (текст, який Do вказує українською, там перекладається). Блоки виконуються по черзі, кожен закінчується контрольною точкою `npm test` і може бути окремою apply-сесією. Префікс `new file:` у `Files:` стоїть у кожній задачі, що торкається шляху, якого немає в репозиторії на момент пропозиції (файл створює ця або попередня задача); шляхи без префікса вже існують. Наявні тести не змінюються, окрім названих додавань. Не редагуються: `.github/workflows/agent-verify.yml`, `version` у `package.json`, `openspec/specs/**`, наявні `skills/**` поза `skills/react/**`.

## 1. Каталог і маніфест пресетів (без змін поведінки CLI)

- [x] 1.1 Модуль каталогу `bin/lib/catalog.js`
  Files: new file: bin/lib/catalog.js
  Do: Створити ESM-модуль без побічних ефектів, що експортує `getCategories(skillsDir)`, `getSkillsInCategory(category, skillsDir)`, `isTopLevelSkill(category, skillsDir)` і `listCatalogSkills(skillsDir)`, який повертає масив `{name, category}` (категорія з кореневим `SKILL.md` дає один запис `{name: category, category}` і ігнорує вкладені папки; інакше кожна підпапка категорії — запис). Значення `skillsDir` за замовчуванням — `skills/` пакета, обчислений від `import.meta.url`. Логіка — дослівний перенос функцій з `bin/install.js`; сам `bin/install.js` у цій задачі не змінюється.
  Done-when: `node --input-type=module -e "import {listCatalogSkills as l} from './bin/lib/catalog.js'; const s=l(); console.log(s.some(x=>x.name==='vite'&&x.category==='vite'), s.some(x=>x.name==='vue-core'&&x.category==='vue'))"` друкує `true true`.

- [x] 1.2 Тести модуля каталогу
  Files: new file: test/catalog.test.mjs
  Do: Додати vitest-кейси: (а) `listCatalogSkills()` містить кожну папку `skills/<category>/<name>/` із `SKILL.md` і `vite` як `{name:'vite', category:'vite'}`; (б) на тимчасовому каталозі-фікстурі категорія з кореневим `SKILL.md` не віддає вкладені папки; (в) порожня категорія не дає записів.
  Done-when: `npx vitest run test/catalog.test.mjs` завершується з кодом 0.

- [x] 1.3 Маніфест `bin/presets.json` без пресета `react`
  Files: new file: bin/presets.json
  Do: Створити JSON `{"version":1,"default":"vue","presets":{...},"unlisted":{...}}`. Пресети (кожен має `label`, `skills`, для `vue` і `typescript` — `detect`): `vue` = vue-core, vue-pinia, vue-axios, vue-router, vue-composables, vue-testing, typescript-vue, typescript-core, vite (рівно ці 9), `detect.dependencies:["vue"]`; `typescript` = typescript-core, typescript-types, typescript-config, typescript-testing, typescript-debug, `detect:{dependencies:["typescript"],files:["tsconfig.json"],fallbackOnly:true}`; `javascript` = усі 7 `javascript-*` (core, data, debug, dom, node, performance, testing); `web` = html-core, html-forms, html-a11y, css-core, css-layout, css-responsive, css-animations; `design` = design-transfer, design-from-screenshot, figma-intake; `full` = `"skills":"*"`. `unlisted`: `{"vueuse":"manual-only","vue-architecture":"manual-only","vue-debug":"on-demand"}`. Пресета `react` ще немає (його додає блок 4).
  Done-when: `node -e "const m=require('./bin/presets.json'); console.log(m.default, m.presets.vue.skills.length, Object.keys(m.presets).join(','))"` друкує `vue 9 vue,typescript,javascript,web,design,full`.

- [x] 1.4 Модуль пресетів `bin/lib/presets.js`
  Files: new file: bin/lib/presets.js
  Do: Створити модуль без побічних ефектів, що експортує: `loadManifest(path)` (читає JSON через `readFileSync` + `JSON.parse`, за замовчуванням `bin/presets.json` поруч з модулем, шлях від `import.meta.url`); `presetNames(manifest)`; `resolvePreset(manifest, name, catalogNames)` (повертає масив імен; для `"*"` — усі `catalogNames`; для невідомого імені — кидає `Error` зі списком доступних); `validateManifest(manifest, catalogNames)` → масив рядків-помилок: `version` не 1; `default` відсутній серед пресетів; `skills` не масив рядків і не `"*"`; ім'я скіла відсутнє в каталозі; дубль імені в межах пресета; запис `unlisted` з неіснуючим скілом або причиною поза `manual-only`/`on-demand`; скіл і в пресеті, і в `unlisted`; скіл каталогу, що не входить ні в один пресет (окрім `full`) і не в `unlisted`.
  Done-when: `node --input-type=module -e "import {loadManifest as l, validateManifest as v} from './bin/lib/presets.js'; import {listCatalogSkills as c} from './bin/lib/catalog.js'; console.log(JSON.stringify(v(l(), c().map(s=>s.name))))"` друкує `[]`.

- [x] 1.5 Тести цілісності маніфесту
  Files: new file: test/presets.test.mjs
  Do: Додати vitest-кейси: (а) `validateManifest` реального маніфесту → `[]`; (б) пресет `vue` дорівнює множині з 9 імен (typescript-core, typescript-vue, vite, vue-axios, vue-composables, vue-core, vue-pinia, vue-router, vue-testing), `default` = `vue`; (в) `resolvePreset(..., 'full', ...)` повертає всі імена каталогу; (г) кожен запис `unlisted` з причиною `manual-only` має `disable-model-invocation: true` у frontmatter його `SKILL.md`; (д) негативні фікстури-маніфести (неіснуючий скіл, непокритий скіл, погана причина, відсутній `default`, скіл і в пресеті, і в `unlisted`) дають помилки з відповідним текстом; (е) `resolvePreset` з невідомим іменем кидає помилку зі списком доступних.
  Done-when: `npx vitest run test/presets.test.mjs` завершується з кодом 0.

- [x] 1.6 Контрольна точка блоку 1
  Files: bin/install.js
  Do: Запустити повний набір тестів і переконатися, що `bin/install.js` у цьому блоці не змінювався.
  Done-when: `npm test` завершується з кодом 0, а `git diff --quiet -- bin/install.js` завершується з кодом 0.

## 2. Прапорці `--preset`, автовизначення, розв'язання вибору (без UI)

- [x] 2.1 Характеризаційні тести легасі-вибору (до рефакторингу)
  Files: new file: test/cli-selection-legacy.test.mjs
  Do: Додати кейси через `spawnSync(process.execPath, ['bin/install.js', 'install', ...args, '--yes', '--agent', 'cursor', '--target', <tmp>])`, що фіксують поточну поведінку незміненого `bin/install.js`: `--category vue --skill vue-core` → лише `vue-core`; `--skill vite --skill typescript-core` → рівно ці два; `--category vue --category css` → усі скіли обох категорій; `--all --skill vite` → лише `vite`; `--all --category css` → рівно скіли категорії `css` (з `listCatalogSkills()`); `--category nope` і `--skill nope-skill` → код 1, повідомлення `No matching skills` і жодної папки скіла в `<tmp>/.cursor/skills` (default не ставиться); `--all` → стільки скілів, скільки в `listCatalogSkills()`; `--yes` без селекторів → 9. Виконується до будь-якої правки `bin/install.js`.
  Done-when: `npx vitest run test/cli-selection-legacy.test.mjs` завершується з кодом 0 на ще незміненому `bin/install.js` (`git diff --quiet -- bin/install.js` також код 0).

- [x] 2.2 Чистий розбір аргументів `bin/lib/args.js`
  Files: new file: bin/lib/args.js
  Do: Створити `parseArgs(argv, agentNames)` → `{options, errors}` без `process.exit` і без друку. `options` = `{target, categories, skills, presets, agents, yes, all}`; `target` за замовчуванням `process.cwd()`. Легасі-правила без змін: прапорець зі значенням споживає `argv[i+1]` лише якщо воно істинне, невідомі прапорці ігноруються, `--agent` у нижньому регістрі, `all` дає усі `agentNames`, невідомий агент додає в `errors` рядок `Unknown agent: "<x>". Available: <names>, all`. Новий `--preset`: значення додається в `presets` (нижній регістр); якщо значення відсутнє або починається з `-`, до `errors` додається `--preset requires a value`.
  Done-when: `node --input-type=module -e "import {parseArgs as p} from './bin/lib/args.js'; const r=p(['--preset','Web','--preset','vue','--category','css','--yes'],['cursor','amp','claude']); console.log(JSON.stringify([r.options.presets,r.options.categories,r.options.yes,r.errors]))"` друкує `[["web","vue"],["css"],true,[]]`.

- [x] 2.3 Тести розбору аргументів
  Files: new file: test/args.test.mjs
  Do: Додати кейси: повторюваний `--preset`; `--preset` останнім аргументом і `--preset --yes` дають помилку `--preset requires a value`; `--agent all`; повторюваний `--agent` без дублів; невідомий агент дає помилку з переліком; `--category` без значення в кінці ігнорується (`categories` порожній, `errors` порожній); `-y` = `--yes`; невідомий прапорець ігнорується.
  Done-when: `npx vitest run test/args.test.mjs` завершується з кодом 0.

- [x] 2.4 Автовизначення стеку `bin/lib/detect.js`
  Files: new file: bin/lib/detect.js
  Do: Створити модуль без побічних ефектів. `readProjectDeps(targetDir)` читає `<targetDir>/package.json` → `{status:'ok'|'missing'|'invalid', deps}`, де `deps` — об'єднання `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies` (ім'я → діапазон); без винятків. `detectPresets(manifest, project, {fileExists})` → `{presets:[{name, reasons}], notes}`: пресет визначений, якщо ім'я з `detect.dependencies` є в `deps` або `fileExists(імʼя)` істинне для файлу з `detect.files`; пресети з `detect.fallbackOnly:true` повертаються, лише коли не визначено жодного не-fallback. `vue` не визначається для мажора 2 (після зрізання символів `^~>=< v` і пробілів перша група цифр дорівнює `2`); тоді в `notes` додається `Vue 2 is not supported by the Vue skills; the vue preset was not selected`. Діапазони без цифр на початку (`catalog:`, `workspace:*`, `latest`, `npm:vue@3`) вважаються присутністю.
  Done-when: `node --input-type=module -e "import {detectPresets as d} from './bin/lib/detect.js'; const m={presets:{vue:{detect:{dependencies:['vue']}},typescript:{detect:{dependencies:['typescript'],fallbackOnly:true}}}}; console.log(d(m,{status:'ok',deps:{vue:'^2.6.14',typescript:'5'}},{fileExists:()=>false}).presets.map(p=>p.name).join(','))"` друкує `typescript`.

- [x] 2.5 Тести автовизначення
  Files: new file: test/detect.test.mjs
  Do: Додати кейси на фікстурі-маніфесті (`vue`, `react`, `typescript` із `fallbackOnly`) і тимчасових каталогах: `react` у `dependencies`; `react` лише в `devDependencies` і лише в `peerDependencies`; `vue` ^3 визначається; `vue` ^2.6.14, `2.x`, `~2.7` не визначаються й дають `notes`; `workspace:*` і `catalog:` вважаються присутністю; `react`+`typescript` дають лише `react`; лише `typescript` дає `typescript`; `tsconfig.json` без `package.json` дає `typescript`; відсутній `package.json` → `status:'missing'`, нуль пресетів; зіпсований JSON → `status:'invalid'`, без винятку.
  Done-when: `npx vitest run test/detect.test.mjs` завершується з кодом 0.

- [x] 2.6 Розв'язання вибору `bin/lib/selection.js`
  Files: new file: bin/lib/selection.js
  Do: Створити `resolveSelection({options, manifest, catalogSkills, detect})` → `{mode, skills, presets, messages, warnings, errors}` без побічних ефектів (`catalogSkills` — результат `listCatalogSkills`; `detect()` повертає результат `detectPresets` і викликається лише для `--preset auto`). `L` = скіли каталогу, для яких (`categories` порожній або категорія скіла в ньому) І (`skills` порожній або ім'я скіла в ньому) — це легасі-вибір `bin/install.js`. Правила за порядком. (1) Невідомий пресет → `errors` (`Unknown preset "<x>". Available: <names>, auto`) і порожній `skills`, навіть коли є `--all`. (2) Немає `--preset`: якщо немає жодного з `all`/`categories`/`skills` → скіли пресета `manifest.default`, `mode:'default'`; інакше `skills = L` (`--all` не розширює фільтри: `--all --skill x` → лише `x`, `--all --category css` → лише `css`), `mode:'all'` лише коли `all` без `categories`/`skills`, інакше `mode:'explicit'`; порожній `L` лишається порожнім (default не підставляється: CLI завершується exit 1 `No matching skills`). (3) Є `--preset`: `all` → увесь каталог, `mode:'all'`; інакше `P ∪ L`, де `P` — об'єднання пресетів (`auto` розгортається через `detect()`; без збігів → `manifest.default` і повідомлення `No stack detected; using default preset (<default>)`), а `L` порожній, коли немає ні `categories`, ні `skills`; `mode:'explicit'`. `BUDGET_WARNING` (експортується) потрапляє в `warnings`, лише коли `mode:'all'` або серед пресетів є `full`. Результат без дублів; `notes` детекції переносяться в `messages`.
  Done-when: `node --input-type=module -e "import {resolveSelection as r} from './bin/lib/selection.js'; import {loadManifest as l} from './bin/lib/presets.js'; import {listCatalogSkills as c} from './bin/lib/catalog.js'; const f=(o)=>r({options:{presets:[],categories:[],skills:[],all:false,...o},manifest:l(),catalogSkills:c(),detect:()=>({presets:[],notes:[]})}); const x=f({skills:['vite'],all:true}), y=f({}); console.log(x.mode, x.skills.join(), y.mode, y.skills.length)"` друкує `explicit vite default 9`.`.

- [x] 2.7 Тести розв'язання вибору
  Files: new file: test/selection.test.mjs
  Do: Додати кейси на фікстурі-маніфесті й фікстурі-каталозі. Без пресета (легасі): default без селекторів; лише категорія; лише `--skill`; `--category vue --skill vue-core` → лише `vue-core`; `--all` → весь каталог, `mode:'all'`; `--all --skill vite` → лише `vite`, `mode:'explicit'`, без попередження; `--all --category css` → лише css; `--category nope` і `--skill nope-skill` → порожній `skills`, без підстановки default. З пресетом: `--preset a` і `--preset a --preset b` (об'єднання без дублів); `--preset react --skill vue-core` = пресет плюс скіл; `--preset vue --category css` = пресет плюс уся категорія; `--preset react --category vue --skill vue-core` = пресет плюс `vue-core`; `--preset web --skill nope` = лише `web`; `--all --preset web` → увесь каталог; невідомий пресет (також з `--all`) → `errors` зі списком доступних і порожній `skills`. `--preset full` і `--all` дають `BUDGET_WARNING`, default і `--preset web` — ні. `--preset auto` бере результат `detect`; без збігів → default і `No stack detected`; `auto` з іменем = об'єднання; без `auto` `detect` не викликається.
  Done-when: `npx vitest run test/selection.test.mjs` завершується з кодом 0.

- [x] 2.8 Підключення модулів до `bin/install.js`
  Files: bin/install.js
  Do: Замінити локальні `getCategories`/`getSkillsInCategory`/`isTopLevelSkill`/`parseArgs` імпортами з `bin/lib/*`; видалити `DEFAULT_SKILLS`. У `main()` після розбору: помилки `parseArgs` і `resolveSelection` — `console.error` і `process.exit(1)` до створення будь-яких каталогів; `warnings` — `console.error`, `messages` — `console.log`. `detect` = `() => detectPresets(manifest, readProjectDeps(opts.target), {fileExists: (f) => existsSync(join(opts.target, f))})`. `installSkills` приймає розв'язаний список імен і копіює їх для кожного агента з `skills/<category>/<name>` за записом `listCatalogSkills` (для `vite` — `{name:'vite', category:'vite'}`, джерело `skills/vite`, не `skills/vite/vite`); при `mode:'default'` лишити повідомлення «Installing default (token-light) skill set…» з переліком із маніфесту, для пресетів друкувати `Installing preset(s): <names> (<N> skills)`, для решти лишити «Installing skills for…»; `No matching skills found…` і exit 1 за нуля встановлених лишити. У `printUsage` згенерувати категорії з `getCategories()` і додати рядок `--preset <name>` з пресетами маніфесту та `auto`. `promptAgent` не чіпати; жодних порівнянь `process.argv[1]`.
  Done-when: `npm test` завершується з кодом 0 (разом із `test/cli-selection-legacy.test.mjs` з 2.1 і незміненими наявними тестами), `grep -c "DEFAULT_SKILLS" bin/install.js` друкує `0` і `grep -c "argv\[1\]" bin/install.js` друкує `0`.

- [x] 2.9 `list` показує пресети
  Files: bin/install.js
  Do: У `listSkills()` після блоку категорій і перед рядком «Supported agents» додати секцію `  Presets:` із рядком `    - <name> (<N> skills) — <label>` на кожен пресет маніфесту (`N` для `full` = кількість скілів каталогу; позначити `default` суфіксом ` [default]`). Файлову систему `list` не змінює.
  Done-when: `node bin/install.js list` друкує рядок `Presets:` і рядки з назвами `vue`, `typescript`, `javascript`, `web`, `design`, `full`, і завершується з кодом 0.

- [x] 2.10 CLI-тести пресетів без TTY
  Files: new file: test/cli-presets.test.mjs
  Do: Додати кейси через `spawnSync(process.execPath, ['bin/install.js', 'install', ...args, '--agent', 'cursor', '--target', <tmp>, '--yes'])` у тимчасових каталогах: `--preset web` → рівно 7 скілів `html-*`/`css-*`; `--preset vue --preset web` → 16 унікальних; `--preset full` і `--all --preset web` → та сама множина, що й `--all`; `--all --skill vite` → лише `vite`, без попередження про бюджет; `--preset typescript` → 5; `--preset nope` → код 1, stderr з назвами доступних пресетів, у `<tmp>` немає `.cursor`; `--preset` без значення → код 1 без запису; `--preset auto` для `package.json` з `"vue":"^3.4.0"` → 9 vue-скілів; `--preset auto` без `package.json` → 9, stdout містить `No stack detected`, код 0; `--preset auto` для `package.json` з `typescript` без фреймворків → 5; `--all` і `--preset full` мають у stderr попередження про бюджет, `--yes` без селекторів — ні; `help` містить `--preset` і всі назви пресетів; `list` містить `Presets:`; `install` без прапорців і без TTY (`input: ''`) → 9 скілів для cursor.
  Done-when: `npx vitest run test/cli-presets.test.mjs` завершується з кодом 0.

- [x] 2.11 Контрольна точка блоку 2
  Files: package.json
  Do: Запустити повний набір тестів і перевірити, що default не змінився.
  Done-when: `npm test` завершується з кодом 0, а `node bin/install.js install --yes --agent cursor --target <порожній tmp>` дає `ls <tmp>/.cursor/skills | wc -l` = `9`.

## 3. Залежність, адаптер промптів і меню

- [x] 3.1 Перша runtime-залежність і `engines`
  Files: package.json, package-lock.json
  Do: Перевірити `npm view @clack/prompts@1.8.1 engines.node` (очікується `>= 20.12.0`), виконати `npm install --save-exact @clack/prompts@1.8.1` (поле `dependencies` з точною версією без `^`), виставити в `package.json` `"engines": {"node": ">=20.12.0"}`; `version`, `scripts` і `files` не змінювати. Перевірити, що пакет експортує `multiselect`, `select`, `isCancel`, `cancel`, `log`.
  Done-when: `node -p "require('./package.json').dependencies['@clack/prompts']"` друкує `1.8.1`, `node -p "require('./package.json').engines.node"` друкує `>=20.12.0`, `node --input-type=module -e "import('@clack/prompts').then(m=>console.log(['multiselect','select','isCancel','cancel','log'].every(k=>k in m)))"` друкує `true`, `npm ci --dry-run` завершується з кодом 0.

- [x] 3.2 Тести пакування й залежності
  Files: new file: test/packaging.test.mjs
  Do: Додати кейси: (а) `dependencies['@clack/prompts']` відповідає `^\d+\.\d+\.\d+$`; (б) `package-lock.json` має `packages['node_modules/@clack/prompts'].version`, рівну цій версії; (в) нижня межа `engines.node` у `package.json` не менша за найвищу нижню межу `engines.node` серед усіх не-dev записів `package-lock.json` (для `||` — найменша альтернатива; порівнювати кортежі major.minor.patch); (г) `npm pack --dry-run --json` містить `bin/presets.json` і кожен файл `bin/lib/*.js`, але жодного шляху з префіксом `openspec/` чи `test/`.
  Done-when: `npx vitest run test/packaging.test.mjs` завершується з кодом 0.

- [x] 3.3 Адаптер `bin/lib/prompter.js`
  Files: new file: bin/lib/prompter.js
  Do: Створити єдиний у `bin/` модуль, що згадує `@clack/prompts`. Експортувати `CANCELLED` (`Symbol.for('frontend-agent-skills.cancelled')`) і `async createPrompter()`, який у момент виклику робить `await import('@clack/prompts')` (не на верхньому рівні модуля) і повертає об'єкт: `multiselect({message, options, initialValues})` → масив значень або `CANCELLED` (вимога щонайменше одного вибору: `required: true`), `select({message, options, initialValue})` → значення або `CANCELLED`, `info(text)`, `cancel(text)`. Отримане від бібліотеки скасування (`isCancel`) перетворювати на `CANCELLED`.
  Done-when: `grep -rl "@clack/prompts" bin` друкує лише `bin/lib/prompter.js`, а `node --input-type=module -e "import('./bin/lib/prompter.js').then(m=>console.log(typeof m.createPrompter, typeof m.CANCELLED))"` друкує `function symbol`.

- [x] 3.4 Логіка меню `bin/lib/menu.js`
  Files: new file: bin/lib/menu.js
  Do: Створити модуль без побічних ефектів. `shouldShowMenu({options, stdinIsTTY, stdoutIsTTY, env})` істинне лише коли обидва TTY істинні, `env.CI` порожнє, `options.yes` хибне й `options.all`, `categories`, `skills`, `presets` порожні. `buildMenuOptions(manifest, catalogNames)` → `[{value, label, hint}]` у порядку ключів маніфесту (`hint` — кількість скілів, для `full` ще й попередження про бюджет). `runMenu({prompter, manifest, catalogNames, detected, agentChoice, agentOptions, defaultAgent})`: крок 1 — `multiselect` з `initialValues` = імена визначених пресетів, а без них — `[manifest.default]`; крок 2 — `select` агента (кожен агент і `all`), лише коли `agentChoice` порожній; будь-яке `CANCELLED` → `{cancelled:true}` без подальших запитів; успіх → `{cancelled:false, presets, agents, skills}` (унікальні скіли). `formatEquivalentCommand({presets, agents, target, cwd, packageName})` → `npx <packageName> install --preset <p>... --agent <a>...` (для `all` — `--agent all`; `--target <dir>` лише коли `target !== cwd`).
  Done-when: `node --input-type=module -e "import {formatEquivalentCommand as f} from './bin/lib/menu.js'; console.log(f({presets:['vue','web'],agents:['claude'],target:'/a',cwd:'/a',packageName:'frontend-agent-skills'}))"` друкує `npx frontend-agent-skills install --preset vue --preset web --agent claude`.

- [x] 3.5 Тести меню з фейковим prompter
  Files: new file: test/menu.test.mjs
  Do: Додати кейси без TTY: таблиця `shouldShowMenu` (не-TTY stdin; не-TTY stdout; `CI=1`; `--yes`; кожен із `--all`/`--category`/`--skill`/`--preset` окремо → `false`; усе чисто → `true`); `runMenu` з фейковим prompter: початковий вибір = визначені пресети; без визначених — лише default; пропуск запиту агента, коли `agentChoice` заданий; скасування на кроці пресетів → `{cancelled:true}` і другий крок не викликається; скасування на кроці агента → `{cancelled:true}`; результат містить унікальні скіли об'єднання; `formatEquivalentCommand` для `all`-агента, для іншого `--target` і для кількох пресетів; `buildMenuOptions` містить для `full` попередження про бюджет.
  Done-when: `npx vitest run test/menu.test.mjs` завершується з кодом 0.

- [x] 3.6 Підключення меню до `bin/install.js`
  Files: bin/install.js
  Do: У `main()` для `install` перед вибором агента: якщо `shouldShowMenu({options: opts, stdinIsTTY: !!process.stdin.isTTY, stdoutIsTTY: !!process.stdout.isTTY, env: process.env})`, визначити стек (`detectPresets`), створити `await createPrompter()` і викликати `runMenu` з `agentChoice = opts.agents.length > 0 ? opts.agents : resolveAgentsFromEnv()` (функція вже є в `bin/install.js`, повертає масив або `null`; непорожнє значення пропускає запит агента), `agentOptions` = ключі `AGENTS` плюс `all`, `defaultAgent = DEFAULT_AGENT`. `cancelled` → `Cancelled.` через `console.error` і `process.exit(130)` до будь-якого запису. Успіх → надрукувати кількість унікальних скілів і `formatEquivalentCommand`, встановити вибране для вибраних агентів без виклику `promptAgent`; якщо вибрано `full`, надрукувати попередження про бюджет у stderr. Усі інші шляхи (не-TTY, `CI`, `--yes`, будь-які селектори) лишаються без змін і не імпортують `@clack/prompts`.
  Done-when: `npm test` завершується з кодом 0, `node bin/install.js install --yes --agent cursor --target <порожній tmp>` ставить 9 скілів, а `grep -rl "createPrompter" bin` друкує `bin/install.js` і `bin/lib/prompter.js`.

- [x] 3.7 CLI-тест не-інтерактивних шляхів із попередніми TTY-умовами
  Files: new file: test/cli-presets.test.mjs
  Do: Додати кейси: `spawnSync` без TTY (піпи) і без прапорців не друкує текстів меню (stdout не містить слова `Cancelled` і запитань меню), ставить 9 скілів для cursor, код 0; з `env: {...process.env, CI: '1'}` поведінка та сама; `--category javascript --yes` ставить лише 7 `javascript-*`.
  Done-when: `npx vitest run test/cli-presets.test.mjs` завершується з кодом 0.

- [x] 3.8 [human-step] Ручна перевірка меню в реальному TTY
  Files: bin/install.js
  Do: Без змін коду. Виконує людина (агент не має TTY, тож не позначає задачу `[x]` без її підтвердження). У реальному терміналі у порожньому тимчасовому каталозі `T` виконати: (а) `node <repo>/bin/install.js install --target T`, залишити початковий вибір, обрати агента Cursor; (б) повторити в новому порожньому `T2` і скасувати клавішею Esc; (в) повторити в новому порожньому `T3` і скасувати Ctrl+C на кроці агента.
  Done-when: (а) завершується кодом 0 і `ls T/.cursor/skills | wc -l` друкує `9`; (б) і (в) `echo $?` друкує ненульове значення, а `ls -A T2 T3` не друкує жодного файлу.

- [x] 3.9 Перевірка нижньої межі Node 20.12
  Files: package.json
  Do: Запустити набір тестів під Node 20.12.0: `npx --yes node@20.12.0 node_modules/vitest/vitest.mjs run`.
  Done-when: `npx --yes node@20.12.0 node_modules/vitest/vitest.mjs run` завершується з кодом 0.

- [x] 3.10 Контрольна точка блоку 3
  Files: package.json
  Do: Запустити повний набір тестів.
  Done-when: `npm test` завершується з кодом 0, а `node -p "require('./package.json').dependencies['@clack/prompts']"` друкує `1.8.1`.

## 4. Категорія `react`: скіли хвилями

Спільний контракт кожного React-скіла (повторюється, бо задачі самодостатні): файл `skills/react/<name>/SKILL.md`; frontmatter `name` = папка (префікс `react-`), `description` починається з `Use for`, ≤350 символів (значення з `: ` — у подвійних лапках), `license: MIT`, `metadata.sources` (≥1 офіційний `https://` URL), `metadata.version`, `compatibility` (React 19, Vite SPA); тіло англійською, понад 400 символів, з правилами й короткими прикладами; глибші теми — у `references/*.md`, кожен досяжний за посиланням із `SKILL.md`; посилання й згадки інших скілів — лише `react-*`, `html-*`, `css-*`; без розділів про Next.js, RSC, SSR; версії й API звіряти з react.dev і документацією бібліотек зі `sources`, не з пам'яті.

### Хвиля A: базис

- [x] 4.1 Скіл `react-core` і початок пресета `react`
  Files: new file: skills/react/react-core/SKILL.md, new file: bin/presets.json
  Do: Створити `skills/react/react-core/SKILL.md` за спільним контрактом. Обов'язкові теми: базис Vite SPA з React Compiler (підключення за актуальною документацією react.dev і `@vitejs/plugin-react`); функційні компоненти й пропси як звичайні типізовані аргументи, значення за замовчуванням через параметри (антипатерн `defaultProps`); `ref` як звичайний проп у React 19 (антипатерн `forwardRef`); обчислення похідних даних під час рендеру; `key`; композиція й підйом стану; Context із `<Context value>` замість `.Provider`; форми й Actions (`useActionState`, `useFormStatus`, `useOptimistic`); метадані документа; StrictMode. Джерела: react.dev (learn, reference, блог React 19), `@vitejs/plugin-react`, React Compiler. У `bin/presets.json` додати пресет `react`: `{"label":"React (Vite SPA)","skills":["react-core","typescript-core","vite"],"detect":{"dependencies":["react"]}}`.
  Done-when: `grep -rl "forwardRef" skills/react/react-core` і `grep -rl "defaultProps" skills/react/react-core` друкують щонайменше один шлях кожен, `grep -c "^license: MIT" skills/react/react-core/SKILL.md` друкує `1`, `npx vitest run test/presets.test.mjs test/skills-structure.test.mjs` завершується з кодом 0.

- [x] 4.2 Тест контракту React-скілів
  Files: new file: test/react-skills.test.mjs
  Do: Додати кейси для кожної підпапки `skills/react/`: у корені `skills/react/` немає `SKILL.md`; назва папки починається з `react-` і має `SKILL.md`; `name` = папка; `license: MIT`; `description` починається з `Use for` і ≤350 символів (константа `MAX_DESCRIPTION = 350` на початку файлу); `compatibility` і `metadata.version` присутні й непорожні; frontmatter містить `sources:` і щонайменше один рядок `https://`; відносні посилання в усіх `.md` категорії резолвляться в `skills/react/`, `skills/html/` або `skills/css/`; жоден `.md` не містить у зворотних лапках імен скілів категорій `vue`, `typescript`, `javascript`, `design` (імена з файлової системи; `vite` не перевіряється — збігається з назвою інструмента); кожен файл у `references/` досяжний за відносними посиланнями з `SKILL.md`. Кейс на точний перелік із 8 скілів додається в задачі 4.11, не тут.
  Done-when: `npx vitest run test/react-skills.test.mjs` завершується з кодом 0 на наявному `react-core`.

- [x] 4.3 Скіл `react-hooks`
  Files: new file: skills/react/react-hooks/SKILL.md, new file: bin/presets.json
  Do: Створити `skills/react/react-hooks/SKILL.md` за спільним контрактом. Обов'язкові теми: правила хуків; `useEffect` за настановою «You Might Not Need an Effect» (антипатерн useEffect для похідного стану, скидання стану через `key`, обробники подій замість ефектів, підписки через `useSyncExternalStore`); cleanup, гонки й чесний масив залежностей; `useRef`; `useTransition` і `useDeferredValue`; `use`; `useEffectEvent` (перевірити статус стабільності в react.dev); кастомні хуки; React Compiler: коли `useMemo`/`useCallback`/`memo` не потрібні (антипатерн повсюдної мемоізації) і коли лишаються, директива `'use no memo'`, eslint-правила. Джерела: react.dev reference, React Compiler docs, `eslint-plugin-react-hooks`. У `bin/presets.json` додати `react-hooks` у `presets.react.skills`.
  Done-when: `grep -rl "You Might Not Need an Effect" skills/react/react-hooks` і `grep -rl "useCallback" skills/react/react-hooks` друкують щонайменше один шлях кожен, `npx vitest run test/react-skills.test.mjs test/presets.test.mjs` завершується з кодом 0.

- [x] 4.4 Скіл `react-typescript`
  Files: new file: skills/react/react-typescript/SKILL.md, new file: bin/presets.json
  Do: Створити `skills/react/react-typescript/SKILL.md` за спільним контрактом. Обов'язкові теми: типізація пропсів без `React.FC` (обґрунтувати); `ComponentProps`/`ComponentPropsWithoutRef`, `ReactNode`, `PropsWithChildren`; типи подій; generic-компоненти; `ref` як проп; типізація `useState`, `useReducer` (discriminated unions), `useRef`, Context; `jsx: "react-jsx"` у `tsconfig`; зміни `@types/react` 19; `satisfies`. Джерела: react.dev (TypeScript), `@types/react`, TypeScript handbook (JSX). У `bin/presets.json` додати `react-typescript` у `presets.react.skills`.
  Done-when: `grep -rl "React.FC" skills/react/react-typescript` друкує щонайменше один шлях, `grep -rl "react-jsx" skills/react/react-typescript` друкує щонайменше один шлях, `npx vitest run test/react-skills.test.mjs test/presets.test.mjs` завершується з кодом 0.

- [x] 4.5 Контрольна точка хвилі A
  Files: package.json
  Do: Запустити повний набір тестів.
  Done-when: `npm test` завершується з кодом 0, а `node bin/install.js list` показує категорію `react/` з 3 скілами.

### Хвиля B: екосистема

- [x] 4.6 Скіл `react-state`
  Files: new file: skills/react/react-state/SKILL.md, new file: bin/presets.json
  Do: Створити `skills/react/react-state/SKILL.md` за спільним контрактом. Огляд нейтральний, без «єдиного правильного»: локальний і піднятий стан; Context + `useReducer`; `useSyncExternalStore`; таблиця критеріїв (серверний/клієнтський стан, обсяг шаблонного коду, гранулярність підписок і ре-рендери, devtools, TypeScript-ергономіка, розмір, крива навчання) для щонайменше трьох варіантів: Zustand, Redux Toolkit, Jotai (інші — одним рядком); короткі канонічні приклади; типові пастки (fan-out Context, серверні дані в клієнтському сховищі, похідні дані в сховищі, модульні сховища в тестах). Джерела: react.dev (Managing State), документація згаданих бібліотек. У `bin/presets.json` додати `react-state` у `presets.react.skills`.
  Done-when: `grep -rl "Zustand" skills/react/react-state`, `grep -rl "Redux Toolkit" skills/react/react-state` і `grep -rl "Jotai" skills/react/react-state` друкують щонайменше один шлях кожен, `npx vitest run test/react-skills.test.mjs test/presets.test.mjs` завершується з кодом 0.

- [x] 4.7 Скіл `react-router`
  Files: new file: skills/react/react-router/SKILL.md, new file: bin/presets.json
  Do: Створити `skills/react/react-router/SKILL.md` за спільним контрактом. Огляд нейтральний: таблиця критеріїв (типобезпека маршрутів, завантаження даних, code splitting, search params, вкладені layouts, розмір, зрілість, крива навчання) для щонайменше трьох варіантів: React Router (declarative і data-режими для SPA), TanStack Router, Wouter; окремим рядком — «без роутера» для малих застосунків; короткі канонічні приклади; пастки (захист маршрутів, lazy-маршрути, відновлення скролу, синхронізація search params). Режим фреймворку/SSR згадати лише як поза межами скіла. Джерела: документація кожного роутера. У `bin/presets.json` додати `react-router` у `presets.react.skills`.
  Done-when: `grep -rl "TanStack Router" skills/react/react-router`, `grep -rl "Wouter" skills/react/react-router` і `grep -rl "React Router" skills/react/react-router` друкують щонайменше один шлях кожен, `npx vitest run test/react-skills.test.mjs test/presets.test.mjs` завершується з кодом 0.

- [x] 4.8 Скіл `react-data`
  Files: new file: skills/react/react-data/SKILL.md, new file: bin/presets.json
  Do: Створити `skills/react/react-data/SKILL.md` за спільним контрактом. Теми: серверний стан у SPA; гонки й waterfalls при `fetch` в `useEffect`, скасування через `AbortController`; `use` + Suspense із кешованим promise; Error Boundaries; мутації через Actions і `useOptimistic`; нейтральна таблиця критеріїв (кешування, інвалідація, devtools, розмір, інтеграція з роутером) для щонайменше трьох варіантів: TanStack Query, SWR, loaders роутера (RTK Query й `fetch` — одним рядком). Джерела: react.dev, документація бібліотек. Без «єдиного правильного». У `bin/presets.json` додати `react-data` у `presets.react.skills`.
  Done-when: `grep -rl "TanStack Query" skills/react/react-data`, `grep -rl "SWR" skills/react/react-data` і `grep -rl "AbortController" skills/react/react-data` друкують щонайменше один шлях кожен, `npx vitest run test/react-skills.test.mjs test/presets.test.mjs` завершується з кодом 0.

- [x] 4.9 Скіл `react-testing`
  Files: new file: skills/react/react-testing/SKILL.md, new file: bin/presets.json
  Do: Створити `skills/react/react-testing/SKILL.md` за спільним контрактом. Теми: Vitest + React Testing Library + `user-event`; запити за роллю (посилання на `html-a11y` дозволене); `renderHook`; обгортки провайдерів; async-запити (`findBy*`, `waitFor`); мокування мережі (MSW); Suspense і Error Boundary в тестах; уникання тестування деталей реалізації; примітка про Jest як альтернативу. Джерела: документація Testing Library, Vitest, MSW. У `bin/presets.json` додати `react-testing` у `presets.react.skills`.
  Done-when: `grep -rl "renderHook" skills/react/react-testing` і `grep -rl "user-event" skills/react/react-testing` друкують щонайменше один шлях кожен, `npx vitest run test/react-skills.test.mjs test/presets.test.mjs` завершується з кодом 0.

- [x] 4.10 Скіл `react-debug` (поза пресетом)
  Files: new file: skills/react/react-debug/SKILL.md, new file: bin/presets.json
  Do: Створити `skills/react/react-debug/SKILL.md` за спільним контрактом. Теми: типові помилки й попередження («Too many re-renders», «Cannot update a component while rendering a different component», нескінченні ефекти, stale closures, порядок хуків, попередження `act`); StrictMode і подвійні виклики; React DevTools і Profiler; `onCaughtError`/`onUncaughtError` у `createRoot`; діагностика React Compiler. Джерела: react.dev, React DevTools. У `bin/presets.json` додати в `unlisted` запис `"react-debug":"on-demand"` (у пресет `react` його не додавати).
  Done-when: `grep -rl "Too many re-renders" skills/react/react-debug` друкує щонайменше один шлях, `node -p "require('./bin/presets.json').unlisted['react-debug']"` друкує `on-demand`, `npx vitest run test/react-skills.test.mjs test/presets.test.mjs` завершується з кодом 0.

### Завершення блоку 4

- [x] 4.11 Перелік із 8 React-скілів у тесті контракту
  Files: new file: test/react-skills.test.mjs
  Do: Додати кейс, що `readdirSync('skills/react').sort()` дорівнює рівно `['react-core','react-data','react-debug','react-hooks','react-router','react-state','react-testing','react-typescript']`; кейс, що кожен із трьох скілів `react-state`, `react-router`, `react-data` містить Markdown-таблицю (щонайменше 3 рядки даних) у `SKILL.md` або у файлі `references/`, на який він посилається; кейс, що `react-core`/`react-hooks`/`react-typescript` містять слова `forwardRef`+`defaultProps`, `useEffect`+`useMemo`, `React.FC` відповідно.
  Done-when: `npx vitest run test/react-skills.test.mjs` завершується з кодом 0.

- [x] 4.12 Тест встановлення категорії `react` на три агенти
  Files: test/skills-structure.test.mjs
  Do: Додати в `describe('installer')` кейс `installs react category to all agents` за зразком `installs html category to all agents`: `--category react --agent all --target <tmp> --yes`; у `.cursor/skills`, `.agents/skills`, `.claude/skills` відсортований перелік react-core, react-data, react-debug, react-hooks, react-router, react-state, react-testing, react-typescript і вміст `SKILL.md` збігається з джерелом. Наявні кейси (зокрема межу `toBeGreaterThanOrEqual(33)`) не змінювати.
  Done-when: `npx vitest run test/skills-structure.test.mjs` завершується з кодом 0 і виводить кейс `installs react category to all agents`.

- [x] 4.13 CLI-тести пресета `react` і автовизначення React
  Files: new file: test/cli-presets.test.mjs
  Do: Додати кейси: `--preset react` ставить рівно react-core, react-hooks, react-typescript, react-state, react-router, react-data, react-testing, typescript-core, vite (9) і не ставить `react-debug`; `--skill react-debug` ставить лише його; `--preset auto` для `package.json` із `react` і `typescript` ставить рівно ті самі 9 скілів; для `package.json` лише з `react` — теж 9; `--preset auto --preset web` для `react`-проєкту ставить 16 унікальних; `list` містить `react/` і `react-debug`, а секція пресетів містить `react`.
  Done-when: `npx vitest run test/cli-presets.test.mjs` завершується з кодом 0.

- [x] 4.14 Контрольна точка блоку 4
  Files: package.json
  Do: Запустити повний набір тестів.
  Done-when: `npm test` завершується з кодом 0, а `node bin/install.js list` показує категорію `react/` із 8 скілами й пресет `react`.

## 5. Документація, метадані, фінальна перевірка

- [x] 5.1 README: таблиця React-скілів, `<details>` і дерево
  Files: README.md
  Do: У розділ «Skills» додати підрозділ `### React` з таблицею 8 скілів (за зразком таблиць HTML/CSS) і приміткою, що React-скіли орієнтовані на Vite SPA, React 19 і React Compiler. У «Frequently searched» додати `<details>` для React із командою `npx frontend-agent-skills install --agent cursor --category react` і переліком 8 скілів. У «Repository Structure» додати рядок `react/` до дерева `skills/`.
  Done-when: `grep -c "category react" README.md` друкує число ≥ 1, `grep -c "react-hooks" README.md` друкує число ≥ 1, `grep -n "react/" README.md` показує рядок дерева.

- [x] 5.2 README: пресети, меню, вимоги, бюджет
  Files: README.md
  Do: У розділ «Installation» додати підрозділ `### Presets`: таблиця назв, складу й автовизначення (з `bin/presets.json`); приклади `--preset react`, `--preset vue --preset web`, `--preset auto`, `--preset full`; меню (лише в TTY без `--yes` і без `--all`/`--category`/`--skill`/`--preset`; Esc/Ctrl+C скасовує без запису; після вибору друкується еквівалентна команда); `install --yes` і не-TTY без прапорців ставлять 9 скілів; `--preset` з `--category`/`--skill` — об'єднання, без пресета `--category` + `--skill` — перетин, `--all` з `--preset` перемагає. Розділ про токен-бюджет: `full` і `--all` друкують попередження, описи частини скілів можуть бути усічені (`skill listing`) списком скілів агента; послатися на вимірювання з `docs/improvement-roadmap.md` із версією агента. Розділ «Requirements»: Node.js 20.12 або новіший для користувачів; окремим реченням — контриб'юторам для дев-інструментів (`vite`, `@fission-ai/openspec`) потрібен Node не нижчий за найвищу нижню межу `engines.node` цих пакетів у `package-lock.json` (читається під час apply; на момент пропозиції 20.19). Оновити приклад виводу `list` (категорія `react`, секція `Presets:`).
  Done-when: `grep -c "preset auto" README.md` друкує число ≥ 1, `grep -c "20.12" README.md` друкує число ≥ 1, `grep -c -i "contributors" README.md` друкує число ≥ 1, `grep -c "^### Presets" README.md` друкує `1`, `grep -c -i "listing" README.md` друкує число ≥ 1, `grep -n "Presets:" README.md` показує приклад `list`.

- [x] 5.3 README Roadmap і формулювання про залежності
  Files: README.md, docs/improvement-roadmap.md
  Do: У `## Roadmap` README додати виконані пункти «Install presets, interactive menu and stack auto-detection» і «React — 8 skills». У `docs/improvement-roadmap.md` замінити твердження про відсутність залежностей інсталятора (рядок про prompt-injection surface у design-скілах) формулюванням: на момент аудиту залежностей не було, а після зміни `add-install-presets-and-react-skills` є одна runtime-залежність `@clack/prompts`; до пункту про `--preset` (rank 11) додати статус: пресети `vue`, `react`, `typescript`, `javascript`, `web`, `design`, `full` і `--preset auto` реалізовано, `minimal`, маніфест встановлення й `update` лишаються відкритими.
  Done-when: `grep -n -i "no dependencies" README.md docs/improvement-roadmap.md` не друкує нічого, `grep -c "@clack/prompts" docs/improvement-roadmap.md` друкує число ≥ 1, `grep -c "React" README.md` друкує число ≥ 1.

- [x] 5.4 Тести README щодо вимог
  Files: new file: test/packaging.test.mjs
  Do: Додати кейси: `README.md` містить `20.12`, заголовок зі словом `Presets`, рядки `--preset auto` і `--category react`; `README.md` та `docs/improvement-roadmap.md` не містять `no dependencies` (регістронезалежно).
  Done-when: `npx vitest run test/packaging.test.mjs` завершується з кодом 0.

- [x] 5.5 `package.json`: description і keywords
  Files: package.json
  Do: У `description` додати згадку React (формулювання: `Vue 3, React, TypeScript, JavaScript, HTML, CSS, Design & Vite AI agent skills for Cursor IDE, Amp Code, and Claude Code — install curated SKILL.md rules with one CLI command.`). У `keywords` додати `react`, `react-skills`, `react19`, `react-compiler`, `presets`. Поля `version`, `scripts`, `dependencies`, `engines` не змінювати.
  Done-when: `node -p "const p=require('./package.json'); [p.description.includes('React'), ['react','react-skills','react19','react-compiler','presets'].every(k=>p.keywords.includes(k))].join(' ')"` друкує `true true`.

- [x] 5.6 Метадані репозиторію GitHub
  Files: .github/repository-metadata.json
  Do: У `description` додати React у перелік технологій (за зразком: `Vue 3, React, TypeScript, JavaScript & Vite AI agent skills for Cursor, Amp Code, and Claude Code`), у `topics` додати `react` і `react19`.
  Done-when: `node -p "const m=require('./.github/repository-metadata.json'); [m.description.includes('React'), m.topics.includes('react'), m.topics.includes('react19')].join(' ')"` друкує `true true true`.

- [x] 5.7 `project-conventions`: категорії й маніфест
  Files: .agents/skills/project-conventions/SKILL.md
  Do: У кроці 1 розділу «Adding a new published skill» закритий список категорій розширити до `vue` | `typescript` | `javascript` | `vite` | `html` | `css` | `design` | `react`. У кроці 5 замінити «keep out of the default install set in `bin/install.js`» на «list it under `unlisted` in `bin/presets.json`». Додати крок: кожен новий скіл додається у щонайменше один пресет або в `unlisted` у `bin/presets.json` (інакше падає `test/presets.test.mjs`). У розділі «Default install (token-light)» зазначити, що default = пресет `vue` з `bin/presets.json` (ті самі 9 скілів), а не константа в `bin/install.js`.
  Done-when: `grep -c "react" .agents/skills/project-conventions/SKILL.md` друкує число ≥ 1, `grep -c "presets.json" .agents/skills/project-conventions/SKILL.md` друкує число ≥ 2, `grep -c "default install set in \`bin/install.js\`" .agents/skills/project-conventions/SKILL.md` друкує `0`.

- [x] 5.8 `openspec/config.yaml`: застарілі категорії й стек
  Files: openspec/config.yaml
  Do: У `context` замінити `Categories today: vue | typescript | javascript | vite` на `Categories today: vue | typescript | javascript | vite | html | css | design | react`; `Node.js ≥ 18` на `Node.js ≥ 20.12`; у `Purpose` додати React; у `Layout` додати рядки `bin/presets.json — install presets (data)` і `bin/lib/*.js — CLI modules`; у `Stack` додати `Runtime dependency: @clack/prompts (interactive menu)`; рядок `No app src/…` не змінювати. Секцію `rules` не змінювати.
  Done-when: `grep -c "vite | html | css | design | react" openspec/config.yaml` друкує `1`, `grep -c "≥ 20.12" openspec/config.yaml` друкує `1`, `grep -c "≥ 18" openspec/config.yaml` друкує `0`.

- [x] 5.9 Фінальна верифікація
  Files: package.json
  Do: Запустити повний набір перевірок.
  Done-when: `npm test` завершується з кодом 0, `npx openspec validate --all --strict` завершується з кодом 0, `npx agent-orchestrator-kit gate-check --tasks add-install-presets-and-react-skills` завершується з кодом 0, `git diff --quiet -- openspec/specs` завершується з кодом 0, `npm pack --dry-run` у списку файлів містить `bin/presets.json`, `bin/lib/prompter.js` і `skills/react/react-core/SKILL.md`.
