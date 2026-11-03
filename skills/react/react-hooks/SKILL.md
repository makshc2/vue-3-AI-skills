---
name: react-hooks
description: "Use for React 19 hooks: Rules of Hooks, when an Effect is the wrong tool, cleanup and race conditions, useRef, useTransition, useDeferredValue, use, useEffectEvent, custom hooks, and why the React Compiler removes most useMemo/useCallback/memo."
license: MIT
compatibility: "React 19.x · Vite SPA · React Compiler 1.x"
metadata:
  sources:
    - https://react.dev/reference/react/hooks
    - https://react.dev/learn/you-might-not-need-an-effect
    - https://react.dev/learn/synchronizing-with-effects
    - https://react.dev/learn/react-compiler
    - https://www.npmjs.com/package/eslint-plugin-react-hooks
  version: "1.0.0"
---

# React Hooks — Best Practices

> Scope: React 19 hooks in a Vite SPA, with the React Compiler enabled.

## References (open on demand)

- Effect patterns, cleanup, race conditions → [`references/effects.md`](references/effects.md)
- Memoization and the compiler → [`references/memoization.md`](references/memoization.md)
- Custom hook design → [`references/custom-hooks.md`](references/custom-hooks.md)

---

## 1) Rules of Hooks

- Call hooks only at the top level of a component or another hook — never in conditions, loops, nested functions or after an early `return`.
- The call order must be identical on every render; a changing order is the root cause of "Rendered fewer hooks than expected".
- Enable `eslint-plugin-react-hooks` (`recommended-latest`) and treat its findings as errors.

## 2) You Might Not Need an Effect

An Effect synchronizes with something **outside** React. It is the wrong tool for:

| Situation | Use instead |
| --- | --- |
| Deriving a value from props/state | compute during render |
| Resetting state when a prop changes | change the `key` of the subtree |
| Reacting to a user action | the event handler |
| Subscribing to an external store | `useSyncExternalStore` |
| Expensive derived data | let the compiler memoize; measure first |

```tsx
// ❌ derived state in an Effect: an extra render and a stale window
const [total, setTotal] = useState(0)
useEffect(() => setTotal(items.reduce((n, i) => n + i.price, 0)), [items])

// ✅
const total = items.reduce((n, i) => n + i.price, 0)
```

Adjusting some state when a prop changes is acceptable *during render* (React re-runs the component immediately) — but resetting a whole subtree is still better done with `key`.

## 3) Effects: cleanup and races

Every subscription, timer, listener or in-flight request needs cleanup. Under StrictMode the Effect runs twice in development on purpose — if that breaks the code, the cleanup is wrong.

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((error) => { if (error.name !== 'AbortError') setError(error) })
  return () => controller.abort()
}, [id])
```

- The dependency array must list every reactive value the Effect reads. Never silence the lint rule — remove the dependency by restructuring instead.
- For server data in a real app, prefer a data library over hand-written Effects; see `react-data`.

## 4) `useSyncExternalStore`

Subscribe to anything outside React (a store, `matchMedia`, `localStorage`, a WebSocket) without tearing:

```tsx
const isOnline = useSyncExternalStore(
  (callback) => {
    window.addEventListener('online', callback)
    window.addEventListener('offline', callback)
    return () => {
      window.removeEventListener('online', callback)
      window.removeEventListener('offline', callback)
    }
  },
  () => navigator.onLine,
)
```

## 5) `useRef`

- For values that must survive renders without causing one: timer ids, previous values, instance-like objects.
- For DOM access: `ref` is an ordinary prop in React 19.
- Never read or write `ref.current` during render — that is an impure render.

## 6) `useTransition` and `useDeferredValue`

- `useTransition` marks an update as non-urgent and exposes `isPending`; async functions inside `startTransition` are Actions.
- `useDeferredValue` lets an expensive subtree lag behind a fast-changing value (typeahead results while typing).
- Both keep the input responsive — they do not make the work cheaper.

## 7) `use`

`use(promise)` and `use(context)` read a resource during render. Unlike other hooks, `use` may be called conditionally and inside loops.

- The promise must come from a cache or a framework/library — creating it in the component body starts a new request on every render.
- Pair it with `<Suspense>` for the pending state and an Error Boundary for failures.

## 8) `useEffectEvent`

Extracts the non-reactive part of an Effect: it always sees the latest props and state, and it is excluded from the dependency array.

```tsx
const onConnected = useEffectEvent(() => {
  if (!muted) showNotification('Connected!')
})

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', onConnected)
  connection.connect()
  return () => connection.disconnect()
}, [roomId]) // `muted` is not a dependency
```

Check the current stability note on react.dev before relying on it in production, and never use it to hide a dependency that *should* re-run the Effect.

## 9) Custom hooks

- Name starts with `use`; it must call at least one hook, otherwise write a plain function.
- Extract a hook to share *stateful logic*, not to shorten a component.
- Return a stable, narrow shape (object with named fields) and keep side effects explicit.

## 10) Memoization and the React Compiler

With the compiler enabled, do **not** sprinkle `useMemo`, `useCallback` and `memo` by default — the compiler inserts equivalent memoization and keeps it correct as the code changes.

Keep them only when:

- a value must be referentially stable for a non-React consumer (an external store, a third-party library);
- you have measured a win the compiler cannot infer (rare).

Escape hatch for a file the compiler must skip: the `'use no memo'` directive — treat it as a temporary bug workaround, not a style choice.

## Checklist

- [ ] No Effect that only derives state or responds to a user action
- [ ] Every Effect has cleanup and an honest dependency array
- [ ] No lint suppressions on the hooks rules
- [ ] No `useMemo` / `useCallback` added "just in case"
- [ ] Custom hooks start with `use` and own one concern
