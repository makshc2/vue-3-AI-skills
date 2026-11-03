# Effects: when, cleanup, races

## The one question

> Does this code synchronize with something outside React?

If the answer is no, it does not belong in an Effect.

## Race conditions

Two requests started by the same Effect can resolve out of order. Either abort or ignore:

```tsx
useEffect(() => {
  let active = true
  loadResults(query).then((data) => { if (active) setResults(data) })
  return () => { active = false }
}, [query])
```

`AbortController` is better when the request supports it: it frees the connection as well.

## Dependency arrays

- List every reactive value read inside the Effect.
- If the array feels wrong, the Effect is wrong: move the value into the Effect, hoist a constant out of the component, or extract a non-reactive part with `useEffectEvent`.
- Objects and functions created during render change identity every render; create them inside the Effect or derive primitive dependencies.

## StrictMode double-run

In development React mounts, unmounts and remounts the component. A correct Effect survives this because its cleanup fully undoes its setup. Never add a `didRun` ref to suppress the second run.

## Common anti-patterns

| Anti-pattern | Fix |
| --- | --- |
| `useEffect` that calls `setState` from other state | compute during render |
| `useEffect` for "on mount" analytics in StrictMode | keep it; make it idempotent |
| Chained Effects that each set the next state | compute everything in one pass or in the event handler |
| Effect that writes to a store that an Effect reads back | single source of truth |

## Subscriptions

Prefer `useSyncExternalStore` over `useEffect` + `useState` for external data: it avoids tearing during concurrent rendering and handles the initial read for you.
