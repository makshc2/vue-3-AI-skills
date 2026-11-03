# Apply notes — add-install-presets-and-react-skills

- Передумова: власник вирішив долю kit-churn (29 M + 2 нові файли); не змішувати з комітами зміни.
- Блоки 1→5 по черзі; `npm test` після кожного. Не редагувати: `.github/workflows/agent-verify.yml`, `version` у `package.json`, `openspec/specs/**`, `skills/**` поза `skills/react/**`.
- Легасі-вибір: без `--preset` рівно як `bin/install.js:213-243` (`--all --skill x` → лише `x`; `--category nope` → exit 1 `No matching skills`, без default). 2.1 писати і запускати до будь-якої правки `bin/install.js`.
- З `--preset`: невідомий пресет → exit 1 першим (навіть з `--all`); `--all` перемагає; інакше `P ∪ L`, `L` порожній без `--category`/`--skill`.
- `@clack/prompts` лише `1.8.1` (точно, без `^`); імпорт лише в `bin/lib/prompter.js`, динамічно; жодних згадок рядка в інших файлах `bin/`. Не-інтерактивні шляхи його не завантажують.
- `bin/lib/*` без побічних ефектів при імпорті; у `install.js` без перевірок `process.argv[1]`; `DEFAULT_SKILLS` видалити, `help` взяти default із маніфесту.
- Новий скіл → у пресет або `unlisted` у `bin/presets.json` (інакше падає тест цілісності). `react` додається в маніфест у 4.1; `react-debug` — лише `unlisted`.
- React-скіли: лише `react-*`/`html-*`/`css-*` у посиланнях і зворотних лапках; без Next.js/RSC/SSR; значення frontmatter із `: ` — у лапках; версії/API звіряти з react.dev, не з пам'яті. У корені `skills/react/` немає `SKILL.md`.
- Не змінювати очікування наявних тестів (зокрема `>=33`); `skills-structure.test.mjs` — лише додати кейс `react`.
- 3.8 — `[human-step]` (реальний TTY); не позначати `[x]` без підтвердження людини.
- README: створити розділ `## Requirements` (Node ≥ 20.12 для користувачів; contributors — вище, за `package-lock.json`), `### Presets` у «Installation».
- Під Node 20.12 уникати `Set.prototype.union` та `Object.groupBy` без скіпу в нових тестах.
- Перевірка: `npm test`; `npx openspec validate --all --strict`; `npx agent-orchestrator-kit gate-check --tasks add-install-presets-and-react-skills`; `git diff --quiet -- openspec/specs`; `npm pack --dry-run`; `npx --yes node@20.12.0 node_modules/vitest/vitest.mjs run`.
