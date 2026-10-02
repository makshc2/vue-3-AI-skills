# Spec Review

**Change:** fix-known-catalog-defects
**Date:** 2026-10-01
**Verdict:** APPROVE

Підсумок: Blocker 0, Major 0, Minor 9. Усі 15 задач відтворено на викинутій копії HEAD `fb0bdfb` (1.3 буквальними командами з Do, решта правок sed/node-скриптами за текстом Do): кожен Done-when дав заявлений результат, фінальний `npm test` = 296 passed (16 + 280), `npm run openspec:validate` = 3 passed. Артефакти реалізовні без суттєвих здогадок. Користувач має підтвердити Q1-Q5 та ще кілька рішень (розділ «For explicit user approval») до `/opsx:apply`. Vue 3-пункти чекліста: N/A (`project.stack: node`).

## Checklist summary

- Consistency (proposal ↔ design ↔ tasks): ✓ — числа, імена, порядок і обсяг збігаються: 268 / 239 / 25 / 33, `name: vueuse`, 28 782 B при ліміті 29 009 B, 296 = 16 + 280 (proposal.md:5-12,52-57; design.md:5-17,85-96; tasks.md:25,71,106). Вимога «Strictly valid frontmatter» сформульована однаково за результатом у specs/skill-catalog/spec.md:6-18, design.md:12,32,67 і tasks.md:14: причина збою javascript-node — `: ` усередині значення, `compatibility` в одинарних лапках, `description` у подвійних, `vue-core` і `typescript-vue` не змінюються. Залишків кроку «CI 20 → 22» у proposal/design/tasks/specs немає (лише констатація, що pin уже `22`: proposal.md:38, design.md:30). Дрейфу у вимогах немає; неточності лише в побічних текстах (M1, M2).
- Delta specs ↔ design: ✓ — `openspec show --json`: 7 дельт (skill-catalog 5 ADDED, packaging 2 ADDED), 16 scenarios. Кожне рішення з поведінкою (D2-D4, D6-D9) має вимогу (design.md:119-131); D5 і D1 явно без вимоги (design.md:121,125, Q5). Сирот немає в жоден бік (таблиця нижче); 1.1 і 1.5 мапляться на пункти «What Changes» (proposal.md:18-19), 4.3-4.5 на Acceptance criteria (proposal.md:50-57). Частково перевіряються лише 3 scenarios (M3).
- Main specs: ✓ — імена 5 ADDED не збігаються з 8 наявними вимогами skill-catalog; наявна вимога «name MUST match the skill folder name» (openspec/specs/skill-catalog/spec.md:38-46) зараз порушується vueuse, зміна її відновлює. README-вимога спирається на default-набір з openspec/specs/install-cli/spec.md:15-17 (9 skills = `DEFAULT_SKILLS`, bin/install.js:26-36) і не суперечить йому. `packaging` коректна як нова capability: є в openspec/config.yaml:34, `openspec/specs/packaging` немає, у дельті лише ADDED без MODIFIED/REMOVED.
- Scope vs Non-goals: ✓ — усі пункти «What Changes» відповідають кроку «How» roadmap (docs/improvement-roadmap.md:32) із декларованими відхиленнями (CI-крок знято, quote-стиль, лише TC39, Q2). Не чіпаються `bin/` (`git diff --name-only fb0bdfb -- bin` порожній), `DEFAULT_SKILLS`, `engines`, `version`, CI; `description` javascript-node міняється лише лапками (текст ідентичний під двома парсерами); нового lookup-правила для VueUse, guard-тестів і CHANGELOG немає. План зачіпає рівно 9 файлів (перевірено буквальною командою 4.3 у локальному клоні).
- Task self-sufficiency: ✓ — усі `Files:` існують; Do однозначні (косметика: M6); кожен Done-when є командою з точним очікуваним виведенням. Залежність 3.2 після 1.3 заявлена в шапці tasks.md:3 і підтверджена (лише 3.2 на непочиненому вмісті = рівно 2 червоні кейси). Папка `skills/vue/vueuse` не перейменовується (міняється лише поле `name`), тож шляхи в інших задачах не ламаються; три команди 1.3 ідемпотентні (повторний запуск лишає 28 782 B).
- Project rules (openspec/config.yaml): ✓ — proposal 486 слів за `wc -w` (< 500, запас 14), Non-goals є (proposal.md:41-48), категорії й шляхи skills названо (proposal.md:16-20); design описує frontmatter-поля й layout (design.md:61-73) та README/test impact (design.md:75-79); tasks: CLI-групи немає, бо `bin/` не змінюється (tasks.md:3), тести й packaging відокремлені від skill-контенту (група 3), `npm test` є верифікаційною задачею (4.4); specs: MUST/SHOULD, GIVEN/WHEN/THEN, без блоків коду (inline-фрагменти значень frontmatter є даними, не імплементацією).

### Покриття scenarios задачами

| Вимога / scenario | Задача і Done-when |
|---|---|
| Strictly valid frontmatter / All frontmatter blocks parse | 1.2, 4.1 (`invalid: 0 of 33`; типи name/description/license не перевіряються, M3) |
| ... / Value that a plain scalar cannot represent | 1.2 (точний текст `compatibility`, довжина `description` 403) |
| Folder-name check / Every discovered skill is checked | 3.2 (`280 passed`, grep `category ===` порожній) |
| ... / A new category needs no test edit | 3.2 (структурно: список категорій видалено) |
| ... / VueUse skill name | 1.3 (`name: vueuse`) |
| Resolvable relative links / Every markdown file is link-checked | 3.2 (239 кейсів), 4.4 |
| ... / Relative targets exist | 4.2 (`broken relative links: 0 in 239 md files`) |
| ... / Single-file catalog skill | 1.3 (`refs=0 up=0 important=0 dotref=0`) |
| Reachable reference files / No orphan reference files | 4.2 (`orphan reference files: 0`) |
| ... / TypeScript-Vue script-setup reference | 1.4 (grep `1` + awk `OK`) |
| README load rules / Project-configuration snippets | 2.1 (`Always load` = 0, нова фраза = 3) |
| ... / Usage example for a non-default skill | 2.2 (grep `1` + awk `OK`) |
| packaging: Pre-publish test gate / Gate is declared | 3.3 |
| ... / Failing suite blocks publish | 3.3, лише декларація скрипта (M3) |
| Test suite honors the declared Node range / Runtime without Object.groupBy | 3.1 (симуляція: `15 passed \| 1 skipped`) |
| ... / Runtime with Object.groupBy | 3.1 (`16 passed`), 4.4 |

## Findings

### Blocker

Немає.

### Major

Немає.

### Minor

- **M1. design.md:137 (release note) перекручує roadmap і змішує факт із непевним.** Текст: «its slash-command and menu entry changes from `/vueuse-functions` to `/vueuse`. Whether the old name keeps working through the folder name is unverified (the roadmap says it does in Claude Code)». Roadmap (docs/improvement-roadmap.md:36) каже інше: `/vueuse` «already works in Claude Code through the folder name», тобто працює нова назва, а не стара; стара назва «через ім'я теки» працювати не може (тека завжди була `vueuse`). Перше речення подає як факт зміну slash-команди й пункту меню, тоді як design.md:17, proposal.md:16 і Q4 визнають поведінку хостів після rename неперевіреною (а за roadmap для Claude Code команда береться з теки, тобто rename там нічого не змінює). Чому важливо: цей текст призначений для дослівного релізу і живить рішення за Q4; apply design.md не змінює, тож помилка дійде до архіву. Пропозиція: переписати нейтрально (поле `name` змінюється; хости, що беруть команду з теки, за roadmap Claude Code, вже показують `/vueuse`; хости, що беруть її з `name`, втратять `/vueuse-functions`; жоден випадок не перевірено). Не блокує apply: жодна задача цей текст не споживає.
- **M2. design.md:24, 149 і specs/packaging/spec.md:19-31 перебільшують «Node range».** Goal «make the suite safe on Node runtimes inside `engines` (>=18)» і заголовок вимоги «honors the declared Node range» не враховують, що сам інструментарій має вищі мінімуми: `vite@7.3.5` — `^20.19.0 || >=22.12.0`, `@fission-ai/openspec@1.6.0` — `>=20.19.0`, `vitest@3.2.6` — `^18 || ^20 || >=22` (node_modules/*/package.json). Тож на Node 18 і Node <20.19 `npm test` імовірно не стартує взагалі, і `skipIf` реально допомагає на Node 20.19+. Scenario (spec:22-26) сформульований обережно («case skipped, run MUST NOT fail because of that case»), тому вимога не хибна, але GIVEN «Node older than 21» охоплює стани, де набір не запускається. design.md:149 чесно каже, що Node 20/18 не запускали, проте не згадує інструментарні мінімуми. Пропозиція: додати їх у Context/Risks і звузити Goal або заголовок до «cases that use post-18 APIs skip when the API is missing». На реалізацію не впливає.
- **M3. Три scenarios перевіряються частково.** (а) specs/packaging/spec.md:13-17 «Failing suite blocks publish» ↔ tasks.md:73-76: Done-when читає лише рядок скрипта, виходу non-zero й зупинки `npm publish` не перевіряє (я перевірив на копіях: `npm run prepublishOnly` дає exit 0 і exit 1; `npm pack --dry-run` тести не запускає; це семантика npm, ризик малий). (б) specs/skill-catalog/spec.md:12 «name, description, license — non-empty strings» ↔ tasks.md:84-86: 4.1 рахує лише `errors.length` (я перевірив типи для 33 файлів: усе гаразд). (в) spec.md:18 «word for word» ↔ tasks.md:15: для `description` перевіряється лише довжина 403 (рівність оригіналу перевірив двома парсерами). Пропозиція: або дописати по одному рядку в Done-when, або сформулювати scenarios рівно за тим, що перевіряється.
- **M4. README.md:326,331,336 лишаються поза охопленням.** Дерево «Example structure after installing for all agents» показує `javascript-core/` як встановлений skill, хоча default його не містить (той самий клас дефекту, що й «Always load»). Це не load-rule, тому вимога його не торкається, а design.md:77 прямо каже «No ... install example changes». Пропозиція: зафіксувати в design як свідомо залишене або додати до Q2.
- **M5. tasks.md:98-101 (4.3): сліпа зона перевірки обсягу.** `git diff --name-only fb0bdfb` не показує untracked файли, тож випадково створений новий файл пройде перевірку; `Files: package.json` (так само в 4.5) не відображає, що команда працює по всьому дереву. Пропозиція: додати `git status --porcelain -- . ':!openspec'` з очікуваними рівно 9 рядками ` M` (я врахував це в apply-notes.md).
- **M6. tasks.md:52-54 (2.2): двозначність пробілів і неповний hint.** Do каже «insert one blank line, then the line, then one blank line»; дослівно це дає два порожні рядки поспіль перед «Alternatively...», бо один уже є (задумане «по одному з кожного боку» випливає лише з наступного речення, Done-when його не перевіряє). Hint не згадує `--agent`: без нього команда ставить для агента, обраного в запиті (TTY), або для Cursor (non-TTY, bin/install.js:164-167); істинність від цього не страждає. Косметика.
- **M7. specs/skill-catalog/spec.md:6: «every parsed value MUST equal the text the author intended».** `disable-model-invocation: true` (vueuse, vue-architecture) парситься як boolean; це задумано, але дослівно «text» неточно. Пропозиція: «every parsed scalar MUST have the type and content the author intended». Перевірено: усі 197 plain-скалярів у 33 файлах збігаються з вихідним текстом, крім цих двох boolean.
- **M8. design.md:59: «Purpose line should be reworded by hand» суперечить правилу project-conventions** («Edit `openspec/specs/` directly — only via `/opsx:archive`», .agents/skills/project-conventions/SKILL.md:51). Уточнити процедуру (правка в межах archive-коміту або окрема зміна) або прийняти TBD-Purpose.
- **M9. tasks.md:19-25 (1.3): два критерії розміру і GNU-команди.** Done-when вимагає точне `bytes=28782` і водночас «at most 29009» у дужках; не сказано, що вирішальне при «any equivalent edit». `sed -i` без суфікса та адреса `,+1d` специфічні для GNU sed (на BSD/macOS не працюють); на Linux ці команди дали заявлений результат. Відображено в apply-notes.md.
- Інформаційно, без дії: AGENTS.md перелічує для Implementer `skills/`, `bin/`, `test/`, а зміна править ще README.md і package.json (узгоджено з project-conventions, крок 7); проміжок до ліміту proposal — 14 слів, тож правки під Q2/Q3 мають його тримати.

## Verified independently

- `git rev-parse HEAD`, `git status --porcelain`, `node --version` → `fb0bdfb`, лише `?? openspec/changes/fix-known-catalog-defects/`, v22.22.0 (також є v22.12.0 і v22.22.1; Node 20/18 немає).
- Baseline на копії HEAD (`git archive | tar`, симлінк node_modules): `npm test` → 271 passed (16 + 255); M0 → 214; M1 → `268 in 239 md files` (усі 268 лише в skills/vue/vueuse/SKILL.md, пофайлово); M2 → `invalid: 1 of 33` (javascript-node); M3 → один MISMATCH (vueuse); M4 → 1 orphan (script-setup-typing.md). Команди M1-M4 у design.md посимвольно ідентичні командам у tasks 4.1/4.2.
- `find skills -name '*.md' | wc -l` → 239; `find skills -name SKILL.md | wc -l` → 33; не-md файлів 0; 206 reference-файлів. Репліка фільтра з test/skills-structure.test.mjs:97-110 → покрито 214, поза тестом 25 = 19 SKILL.md без references-теки + 6 файлів skills/vite/.
- YAML: npm `yaml` 2.9.0 і PyYAML 6.0.3 узгоджені: 1 з 33 невалідний (javascript-node), джерело `: ` у `node: built-in` і `("type": "module")`. Варіанти значення `compatibility`: plain ✗, уся в подвійних лапках ✗, в одинарних ✓; `description` у подвійних ✓; plain-скаляр з `lang="ts"` (vue-core, typescript-vue) ✓. Після виправлення 33 з 33 парсяться, `description` і `compatibility` дорівнюють вихідному тексту під обома парсерами.
- vueuse на HEAD: `refs=266 up=1 important=1 dotref=1 rows=299 http=95 bytes=37325`; 268 обгорток (266 + 2 у рядку useSSRWidth); лише заміна лінків → 29 009 B (−8 316 B, 2 079 tok за bytes/4); рядок IMPORTANT 216 B з LF; `name` −10 B; усі три правки → 28 782 B; 22 таблиці, у всіх три колонки (колонки `Reference` немає); після правки 277 рядків функцій well-formed; незалежне відтворення `sed -E` ідентичне node-regex з tasks 1.3.
- README: «Always load» лише в рядках 372-374; usage-приклади з не-default skills у README.md:350 (javascript-core), :358 (javascript-debug), :364 (javascript-core); нова фраза 127 B проти 73 B; javascript-core 6 978 B + vite 5 494 B = 12 472 B; `vueuse-functions` у відвантажуваних файлах лише в SKILL.md vueuse; `bin/install.js:215-216,256-258` підтверджує hint (default лише 9 skills, `--category javascript` ставить усю категорію).
- CI: `git show ab34553:.github/workflows/agent-verify.yml` → `node-version: 20`; у fb0bdfb і HEAD (рядок 18) → `22`.
- Повний прогін плану на копії (1.1 → 4.5; 1.3 буквальними командами з Do, решта правок sed/node-скриптами за текстом Do): Done-when усіх 15 задач збігаються з заявленим; `npm test` → `Test Files  2 passed (2)`, `Tests  296 passed (296)` (також на Node 22.12.0); `npm run openspec:validate` → 3 passed; після плану: 239 / `broken relative links: 0` / `invalid: 0 of 33` (PyYAML теж 0) / без MISMATCH / `orphan reference files: 0` (і за суворішим «лише в межах того ж skill» теж 0); буквальна `git diff --name-only fb0bdfb -- . ':!openspec'` у локальному `git clone` → рівно 9 файлів у заявленому порядку.
- Твердження про порядок і режим збою: лише 3.2 на непочиненому вмісті → рівно 2 failed (`vueuse has valid frontmatter`, `skills/vue/vueuse/SKILL.md links resolve`); HEAD-тест із `NODE_OPTIONS='--import=data:text/javascript,delete%20Object.groupBy'` → `TypeError: Object.groupBy is not a function`; з guard → `15 passed | 1 skipped`; Done-when 1.2 до правки справді дає `YAMLParseError`, exit 1.
- Packaging: `npm run prepublishOnly` → exit 0 на копії плану і exit 1 після додавання зламаного лінка в `skills/vite/SKILL.md` (заодно видно, що vite тепер link-тестується); `npm pack --dry-run` тестів не запускає, 243 файли в tarball, vueuse 28,8 kB.
- `wc -w proposal.md` → 486; `npx openspec validate fix-known-catalog-defects --strict` → valid; `npx openspec validate --all --strict` → 3 passed; `npx openspec show fix-known-catalog-defects --json` → 7 дельт.
- Мінімуми Node інструментарію (node_modules/*/package.json): vitest 3.2.6 `^18 || ^20 || >=22`, vite 7.3.5 `^20.19.0 || >=22.12.0`, @fission-ai/openspec 1.6.0 `>=20.19.0`.
- Кінцевий стан: sha256 шести артефактів збігаються з baseline батьківської сесії, `git status --porcelain` без змін, записано лише review.md і apply-notes.md.

## Not verified / taken on trust

- Реальний запуск на Node 20/18 і Node 21: їх немає (лише 22.12.0, 22.22.0, 22.22.1). Guard перевірено симуляцією `delete Object.groupBy` на Node 22, як і в design.md:30; чи проходить решта набору на Node 20.19+, не перевірено.
- Заява «єдиний CI-ран впав на Node 20»: `gh` немає; перевірено лише історію pin (20 у ab34553, 22 у fb0bdfb). Для apply не потрібна.
- Поведінка `/vueuse-functions` і `/vueuse` у Claude Code, Cursor, Amp: перевірити тут неможливо; артефакти позначають це як unverified (proposal.md:16, design.md:17, Q4), крім M1.
- `npm publish` (навіть `--dry-run`) навмисно не запускався, щоб виключити ризик публікації; перевірено лише `npm run prepublishOnly` і `npm pack --dry-run` на копіях.
- Як frontmatter парсять самі хости: перевірено лише двома YAML-парсерами (npm `yaml` 2.9.0, PyYAML 6.0.3).
- Roadmap читався лише через `sed` по рядках 7-20 і 23-37 (і `sed -n 32p`, `36p`). Проте grep по всьому репозиторію (за `script-setup-typing` і `Always load`) випадково показав обрізані фрагменти рядків 60, 62 і 276 roadmap; жодних висновків із них не зроблено. Числа, на які спираються артефакти (33, 239, 25, 266 + 2, −8 316 B, номери рядків у файлах), перемірено.
- Це не реальний apply: прогін зроблено на копії HEAD і локальному клоні (копії видалено). Побічний ефект: vitest через симлінк оновив gitignored-кеш `node_modules/.vite/vitest/*/results.json`; трековані й untracked файли репозиторію не змінено.

## For explicit user approval

Вердикт APPROVE означає лише готовність артефактів; apply починається після явного Approve користувача (`review_to_apply: explicit_approve`, .agents/orchestrator.yaml:43).

- **Q1. Guard-тести strict-YAML і orphan поза скоупом.** Підтвердити, що дві з п'яти ADDED-вимог («Strictly valid frontmatter», «Reachable reference files») після архіву стануть постійними MUST у main spec, а перевіряються лише разово командами 4.1/4.2. Корінь дефекту (line-regex `parseFrontmatter`, test/skills-structure.test.mjs:21-30) лишається, тож майбутній `: ` у `description` знову пройде `npm test`. Альтернатива: окрема зміна з `yaml` у devDependencies (зараз `yaml` лише транзитивна залежність @fission-ai/openspec і vite).
- **Q2. Один hint-рядок замість заміни usage-прикладів.** Це відхиляється від буквального кроку 6 roadmap («examples at 350/364», docs/improvement-roadmap.md:32): приклади лишаються, додається один рядок; він покриває й Amp-приклад README.md:358, якого roadmap не згадує. Якщо обрати заміну на default-skills, змінюються задача 2.2 і другий scenario README-вимоги (design.md:160). Див. також M4.
- **Q3. Spec placement: delta skill-catalog плюс нова capability `packaging`.** Якщо user обере task-only, треба видалити specs/packaging/spec.md і записи про `packaging` у proposal та traceability (design.md:161). При архіві main spec створюється з TBD-Purpose (M8).
- **Q4. Rename vueuse без alias.** Факти для рішення: (а) `disable-model-invocation: true` (skills/vue/vueuse/SKILL.md:4) робить slash-команду єдиним шляхом виклику, тож зміна імені помітна користувачам; (б) roadmap:36 каже, що `/vueuse` у Claude Code вже працює через ім'я теки, а design.md:137 це перекручує (M1); (в) proposal.md:16 позначає зміну **BREAKING**, але версію ця зміна не піднімає (зараз 2.4.0): рівень semver вирішується при релізі; (г) поведінка в Claude Code, Cursor, Amp не перевірена.
- **Q5. `compatibility` інших skills не аудитується.** Перевірка: поле є у 24 з 33 skills; javascript-debug і vue-debug, чиї references використовують `toSorted` (ES2023), поля не мають, тож хибного floor там немає; дефолт безпечний.
- **Рішення Architect поза Q (підтвердити або заперечити).** (1) Крок roadmap «CI node-version 20 → 22» знято: перевірено істинним (agent-verify.yml:18 = 22). (2) javascript-node: `compatibility` в одинарних лапках замість «подвійних» з roadmap (вони зламали б YAML, перевірено двома парсерами). (3) javascript-core: лише TC39, MDN уже в списку. (4) vueuse: абзац `IMPORTANT ...` видаляється без заміни; до roadmap item 9 агент не має інструкції, де шукати usage-деталі, хоча посилання й так були мертві.
