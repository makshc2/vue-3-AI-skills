# Spec Review

**Change:** add-install-presets-and-react-skills
**Date:** 2026-11-03
**Verdict:** APPROVE

Повторний Tier 2 (LLM-only) після `REQUEST CHANGES`. Tier 1 не перевірявся повторно. Прочитано повністю: `proposal.md`, `design.md`, `tasks.md` (59 534 B, 50 задач), `decisions.md`, три delta-специфікації, попередній `review.md`; три основні специфікації (`install-cli`, `skill-catalog`, `packaging`) повністю; `bin/install.js` повністю (легасі-вибір, рядки 213-243); `package.json`, `test/skills-structure.test.mjs`, `test/skills-behavior.test.mjs`, README (заголовки), `openspec/config.yaml`, `.agents/skills/project-conventions/SKILL.md`, `docs/improvement-roadmap.md` (рядки 172-182, 301), `.github/repository-metadata.json`, `.agents/orchestrator.yaml` (`project.stack: node`).

## Checklist summary

- Proposal: ✓ (Why/What/Impact/Non-goals/Acceptance узгоджені з D2/A3/D8 і з задачами; семантика «без `--preset` = легасі» віддзеркалена в Acceptance)
- Design: ✓ (Context, D2, D8, A3 — один набір правил; A1/A1′/A2/A2′/A3 коректно посилаються на тести 1.5б, 2.5, 2.7, 2.10, 4.13, які існують)
- Tasks: ✓ (50 задач; усі перехресні номери існують; кількісні `Done-when` збігаються з `Do`)
- Delta specs: ✓ (покривають усю змінену поведінку; «Category and skill filters» зберігає обидва наявні сценарії)

Tier 2 чекліст:

- ✓ Consistency: proposal ↔ design ↔ tasks ↔ delta розповідають одну історію (прогнано мислено на `bin/install.js:213-243`: `--all --skill vite` → лише `vite`; `--all --category css` → лише `css`; `--category nope` → порожній `L` → exit 1 `No matching skills`, default не підставляється; `--preset X --all` → увесь каталог, невідомий X — помилка першою; `--preset X --skill y` → `P ∪ {y}`; без аргументів → default-9; `--category vue --skill vue-core` без пресета → перетин). Delta покривають усю поведінку design (виняток — лише Minor нижче).
- ✓ Main specs: конфліктів немає. `install-cli` «Category and skill filters» змінено через MODIFIED із застереженням «and no `--preset`», обидва наявні сценарії (Category filter, Skill filter) збережені за змістом, доданий сценарій «Filters with a preset»; «Install command», «List command» збережені; `packaging` «Test suite honors the declared Node range» узгоджено (Node 20 не має `Object.groupBy`, скіп потрібен); `skill-catalog` — React-контракт доповнює frontmatter/links/reachability, не послаблює.
- ✓ Scope: жодна задача не виходить за Non-goals (`agent-verify.yml`, `version`, `openspec/specs/**`, наявні `skills/**` поза `skills/react/**` не редагуються; немає `list --tokens`, маніфесту встановлення, `react-architecture`).
- ✓ Task self-sufficiency: кожну задачу можна виконати з Files/Do/Done-when без `design.md` (2.6 містить повні правила; React-контракт повторено в преамбулі блоку 4).
- N/A Vue 3: `project.stack: node`.

## Notes

Некритичні спостереження (не блокують apply, врахувати під час apply або окремо):

1. **Vue 2 + fallback (рішення власника, Open Question 3).** Для проєкту лише з `vue@2` `detectPresets` не визначає `vue`, друкує пояснення, а далі fallback («No stack detected; using default preset (vue)») ставить 9 Vue-3 скілів — те, чого D3 прагне уникнути. Задачі й spec детерміновані й узгоджені, тому не блокер; варто врахувати у відповіді на Open Question 3 (напр. для Vue 2 не підставляти default).
2. **Меню й `full`.** Попередження про бюджет для `full`, вибраного в меню (D4/D8, 3.4, 3.6), у delta прямо не описане (вимога «Full catalog budget warning» говорить про `--preset full`/`--all`); у меню-вимозі немає сценарію про підпис `full`. Додати сценарій у delta або лишити як деталь реалізації.
3. **«Preset manifest».** Вимога «кожен скіл у ≥1 пресеті або в `unlisted`» тривіально виконується через `full: "*"`; реалізація (1.4, «окрім full») і негативна фікстура 1.5д це враховують, але в тексті вимоги варто уточнити «пресет, окрім `*`».
4. **README «Requirements».** У README такого розділу немає (заголовки: Installation, After Installation, Usage…); у 5.2 його треба створити (наприклад, перед `## Installation`) — перевіряється лише `grep` по `20.12` і `contributors` (саме множина).
5. **`printUsage` у 2.8.** Блок «Default install…» використовує `DEFAULT_SKILLS.join` — при видаленні константи його треба взяти з маніфесту (`help` перевіряється в 2.10).
6. **Меню: агент `all`.** У 3.4/3.6 не сказано прямо, чи `runMenu` повертає `agents:['all']` чи розгорнутий список; 3.6 потребує розгорнутого списку для копіювання і `--agent all` для еквівалентної команди — реалізатор має зберегти обидва.
7. **Node 20.12 лише в 3.9.** Тести з блоків 4-5 під 20.12 не перепрогоняються (CI — Node 22); у 5.9 за бажанням повторити `npx --yes node@20.12.0 node_modules/vitest/vitest.mjs run`. Уникати в нових тестах API, відсутніх у Node 20.12 (`Set.prototype.union`, `Object.groupBy` без скіпу).
8. **Косметика.** У `Done-when` 2.6 зайвий хвіст `` `.`. ``; `react` у `presets.json` стає після `full` (порядок меню/`list`; за потреби перемістити перед `full`); у `decisions.md` два записи з номером 10; Open Question 6 у design каже «прийнято тут», а `decisions.md` п. 10 — «непідтверджена пропозиція» (узгодити); префікс `new file:` для файлів, що вже створені попередніми задачами, відповідає преамбулі.
9. Відкриті питання власника (major/minor, CI Node 20.12, fallback на `vue`, `typescript` як `fallbackOnly`, `react-architecture`, kit-churn) — рішення власника; kit-churn лишається передумовою apply (преамбула `tasks.md`).

## Previous findings

1. **Required Before Apply №1 (семантика D2 / 2.6 / «Selector combination», кейси 2.1/2.7) — resolved.** `design.md` Context/D2/A3/D8 і `tasks.md` 2.6/2.8 визначають: без `--preset` рівно легасі (`--all` не розширює `--category`/`--skill`; default лише коли немає `--all`/`--category`/`--skill`/`--preset`; нуль збігів → exit 1), з `--preset` — `--all` перемагає, інакше `P ∪ L`, невідомий пресет перевіряється першим; 2.1 і 2.7 містять `--all --skill vite`, `--all --category css`, `--category nope`/`--skill nope-skill`; delta «Selection without a preset» і «Selector combination» узгоджені; відтворює `bin/install.js:213-243`.
2. **Required Before Apply №2 (MODIFIED «Category and skill filters») — resolved.** `specs/install-cli/spec.md` має MODIFIED «Category and skill filters» із застереженням «and no `--preset`», обидва наявні сценарії збережені за змістом і додано «Filters with a preset» із посиланням на «Selector combination»; заголовок збігається з основною специфікацією.
3. **Required Before Apply №3 (задача 4.2: «4.12» → «4.11») — resolved.** Рядок 161 `tasks.md`: «Кейс на точний перелік із 8 скілів додається в задачі 4.11»; задача 4.11 справді містить перелік із 8 скілів, 4.12 — тест встановлення категорії.
