---
name: react-core
description: "Use for any React 19 component work in a Vite SPA: function components, props, refs as props, derived values, keys, context, forms with Actions, document metadata and StrictMode. Load for .jsx/.tsx files, new components, or React + Vite setup."
license: MIT
compatibility: "React 19.x · Vite SPA · React Compiler 1.x"
metadata:
  sources:
    - https://react.dev/learn
    - https://react.dev/reference/react
    - https://react.dev/blog/2024/12/05/react-19
    - https://react.dev/learn/react-compiler/installation
    - https://www.npmjs.com/package/@vitejs/plugin-react
  version: "1.0.0"
---

# React Core — Best Practices

> Scope: React 19 in a Vite single-page app. Server Components, SSR and framework routers are out of scope for this skill.

## Preferences

- TypeScript over JavaScript — see `react-typescript`
- Function components only — never classes (except an Error Boundary)
- Derive during render; store only what cannot be derived
- `ref` is an ordinary prop — never `forwardRef` in new code
- Let the React Compiler memoize — see `react-hooks`

## References (open on demand)

Do not preload everything. Open at most 1–2 files that match the task:

- Vite + React Compiler setup → [`references/setup.md`](references/setup.md)
- Forms, Actions, `useActionState`, `useOptimistic` → [`references/forms-and-actions.md`](references/forms-and-actions.md)
- Context, composition, lifting state → [`references/composition.md`](references/composition.md)

---

## 1) Components and props

Props are ordinary function arguments. Use parameter defaults; `defaultProps` is removed for function components in React 19.

```tsx
// ✅ defaults as parameters
function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'danger' }) {
  return <span className={`badge badge--${tone}`}>{label}</span>
}

// ❌ removed in React 19 for function components
Badge.defaultProps = { tone: 'neutral' }
```

Rules:

- One responsibility per component; split when a component juggles two concerns.
- Components must be pure: no mutation of props, state or module-level values during render.
- Name event props `onSomething`, handlers `handleSomething`.

## 2) `ref` as a prop

In React 19 a function component receives `ref` like any other prop. `forwardRef` still works but is deprecated for new code and will be removed in a future major.

```tsx
// ✅ React 19
function TextField({ ref, ...props }: React.ComponentPropsWithRef<'input'>) {
  return <input ref={ref} {...props} />
}

// ❌ legacy wrapper, avoid in new code
const TextField = forwardRef((props, ref) => <input ref={ref} {...props} />)
```

Ref callbacks may now return a cleanup function; when they do, React no longer calls them with `null`.

## 3) Derive instead of storing

Anything computable from props or state is computed during render — never mirrored into state and never synced with an Effect.

```tsx
// ✅
const visible = items.filter((item) => item.name.includes(query))

// ❌ redundant state + Effect
const [visible, setVisible] = useState([])
useEffect(() => setVisible(items.filter(/* … */)), [items, query])
```

## 4) Keys

- `key` must be stable and identify the item, not its position.
- Array index as a key is acceptable only for a static, never-reordered list.
- Changing a `key` is the idiomatic way to reset a subtree's state.

## 5) State: lift it or keep it local

- Keep state in the lowest component that needs it.
- Lift it to the closest common ancestor when two siblings need the same value.
- Pass components as `children` / render props before reaching for context — composition solves most prop-drilling.

## 6) Context

In React 19 render `<Context>` directly; `<Context.Provider>` is deprecated.

```tsx
const ThemeContext = createContext<Theme>('light')

// ✅ React 19
<ThemeContext value={theme}>{children}</ThemeContext>

// ❌ deprecated
<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
```

Context is for low-frequency, widely-read values (theme, locale, current user). For frequently changing state see `react-state`.

## 7) Forms and Actions

An async function passed to `<form action>`, `useActionState` or `startTransition` is an *Action*: React manages pending state, errors and optimistic updates for you.

```tsx
function Subscribe() {
  const [state, submit, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const error = await subscribe(formData.get('email') as string)
      return error ?? null
    },
    null,
  )

  return (
    <form action={submit}>
      <input name="email" type="email" required />
      <button disabled={isPending}>Subscribe</button>
      {state && <p role="alert">{state}</p>}
    </form>
  )
}
```

- `useFormStatus()` reads the pending state of the closest parent `<form>` from a child component — no prop drilling.
- `useOptimistic()` shows an optimistic value while the Action is in flight and reverts automatically on failure.
- Details and pitfalls → [`references/forms-and-actions.md`](references/forms-and-actions.md).

## 8) Document metadata and stylesheets

React 19 hoists `<title>`, `<meta>`, `<link>` and `<style>` rendered anywhere in the tree into `<head>` — no helper library is needed for a simple SPA.

```tsx
function ArticlePage({ article }: { article: Article }) {
  return (
    <article>
      <title>{article.title}</title>
      <meta name="description" content={article.summary} />
      <h1>{article.title}</h1>
    </article>
  )
}
```

## 9) StrictMode

Keep `<StrictMode>` on in development. It double-invokes render and Effects on purpose to surface impure render logic and missing cleanup. Never "fix" a StrictMode warning with a ref guard — fix the impurity. See `react-debug`.

## 10) Entry point

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Markup and styling belong to [`html-core`](../../html/html-core/SKILL.md) and [`css-core`](../../css/css-core/SKILL.md); accessible structure to [`html-a11y`](../../html/html-a11y/SKILL.md).

## Checklist

- [ ] No `forwardRef`, no `defaultProps`, no `Context.Provider` in new code
- [ ] No state that mirrors props or other state
- [ ] Stable `key` for every list item
- [ ] Mutations go through an Action, not a hand-rolled `isLoading` flag
- [ ] `<StrictMode>` enabled and warning-free
