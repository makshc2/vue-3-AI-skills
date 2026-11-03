---
name: react-state
description: "Use for choosing and structuring React state in a Vite SPA: local and lifted state, Context with useReducer, useSyncExternalStore, and a neutral comparison of Zustand, Redux Toolkit and Jotai with selection criteria and common pitfalls."
license: MIT
compatibility: "React 19.x · Vite SPA · Zustand 5 · Redux Toolkit 2 · Jotai 3"
metadata:
  sources:
    - https://react.dev/learn/managing-state
    - https://react.dev/reference/react/useSyncExternalStore
    - https://zustand.docs.pmnd.rs/
    - https://redux-toolkit.js.org/
    - https://jotai.org/docs
  version: "1.0.0"
---

# React State — Choosing and Structuring

> Scope: client state in a React 19 Vite SPA. There is no single right answer here; this skill gives criteria, not a verdict. Server data belongs to the `react-data` skill.

## References (open on demand)

- Library examples side by side → [`references/library-examples.md`](references/library-examples.md)
- Structuring state and reducers → [`references/state-shape.md`](references/state-shape.md)

---

## 1) Escalate in order

1. **Local state** (`useState`) — the default. Keep it in the component that owns it.
2. **Lifted state** — move to the closest common ancestor when siblings share it.
3. **Context** — for low-frequency, widely-read values: theme, locale, session, feature flags.
4. **Context + `useReducer`** — when that shared value has non-trivial transitions.
5. **An external store** — when updates are frequent, consumers are scattered, or you need subscriptions outside the tree.

Do not skip steps. Most "we need a state library" problems are state living too high or server data in the wrong place.

## 2) Context + `useReducer`

```tsx
const CartStateContext = createContext<CartState | null>(null)
const CartDispatchContext = createContext<React.Dispatch<CartAction> | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart)
  return (
    <CartStateContext value={state}>
      <CartDispatchContext value={dispatch}>{children}</CartDispatchContext>
    </CartStateContext>
  )
}
```

Splitting state and dispatch keeps components that only dispatch from re-rendering on every change.

## 3) `useSyncExternalStore`

The supported way to read any external store — including a tiny hand-rolled one — without tearing under concurrent rendering:

```tsx
const value = useSyncExternalStore(store.subscribe, store.getSnapshot)
```

`getSnapshot` must return a cached value; returning a fresh object each call causes an infinite loop.

## 4) Choosing a library

| Criterion | Zustand | Redux Toolkit | Jotai |
| --- | --- | --- | --- |
| Mental model | one store object, hook selectors | single store, slices, actions | atoms composed bottom-up |
| Boilerplate | minimal | moderate (slices, store setup) | minimal per atom, grows with graph |
| Subscription granularity | per selector | per selector | per atom (finest) |
| Server state | not included (pair with a data library) | RTK Query included | not included |
| Devtools | via middleware | best in class, time travel | atom devtools |
| TypeScript ergonomics | good, some generics friction | excellent, inferred from slices | excellent, inferred per atom |
| Bundle size | smallest | largest | small |
| Learning curve | low | medium | medium (atom graph thinking) |
| Fits best | small/medium apps, pragmatic teams | large apps, strict conventions, audits | fine-grained derived state |

Others in one line: **Valtio** (proxy/mutable style), **MobX** (observables, OO-friendly), **XState** (explicit state machines for complex flows), **Redux core** (legacy — use Redux Toolkit instead).

Decide on: how often the state changes, how many unrelated consumers read it, whether you need devtools or time travel, and whether the team already knows one of them. A consistent choice beats the theoretically optimal one.

## 5) Pitfalls

- **Context fan-out:** one context holding many unrelated fields re-renders every consumer. Split by concern.
- **Server data in a client store:** caching, invalidation and retries are a data-layer job — see the `react-data` skill.
- **Derived data in the store:** store the minimum; derive the rest in a selector or during render. Duplicated derived state goes stale.
- **Module-level stores in tests:** a store created at module scope leaks between tests. Expose a factory or reset it in `beforeEach`.
- **Selectors returning new objects:** `useStore((s) => ({ a: s.a }))` re-renders every time; select primitives or use the library's shallow comparison.

## Checklist

- [ ] State lives at the lowest level that works
- [ ] Context values are split by concern and change rarely
- [ ] No server data duplicated into client state
- [ ] Selectors return primitives or shallow-compared slices
- [ ] One state library per app, chosen on explicit criteria
