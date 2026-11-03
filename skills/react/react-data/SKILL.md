---
name: react-data
description: "Use for server data in a React 19 Vite SPA: fetch races and waterfalls in Effects, AbortController, use plus Suspense with a cached promise, Error Boundaries, mutations via Actions and useOptimistic, and a neutral comparison of TanStack Query, SWR and router loaders."
license: MIT
compatibility: "React 19.x · Vite SPA · TanStack Query 5 · SWR 2"
metadata:
  sources:
    - https://react.dev/reference/react/use
    - https://react.dev/reference/react/Suspense
    - https://react.dev/learn/you-might-not-need-an-effect
    - https://tanstack.com/query/latest/docs/framework/react/overview
    - https://swr.vercel.app/docs/getting-started
  version: "1.0.0"
---

# React Data Fetching — Server State in a SPA

> Scope: client-side data loading in a React 19 Vite SPA. Server Components and server-side rendering are out of scope.

## References (open on demand)

- Fetching patterns and caching → [`references/fetching-patterns.md`](references/fetching-patterns.md)
- Mutations, optimistic UI, error handling → [`references/mutations.md`](references/mutations.md)

---

## 1) Server state is not client state

Remote data is a **cache**: it goes stale, it can fail, it may be refetched, and several components want the same entry. Treat it as caching infrastructure, not as `useState` you happen to fill from the network.

## 2) The problems with `fetch` inside `useEffect`

- **Races:** a slower earlier response overwrites a newer one. Abort or ignore stale results.
- **Waterfalls:** a parent fetches, renders, and only then a child starts its own request. Hoist requests or load at the route level.
- **No sharing:** two components asking for the same resource make two requests.
- **Missing states:** loading, error, empty, refetching and stale all have to be hand-written and kept consistent.
- **StrictMode:** the double-run in development exposes missing cleanup — that is the point, not a bug.

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    })
    .then(setUser)
    .catch((error) => { if (error.name !== 'AbortError') setError(error) })
  return () => controller.abort()
}, [id])
```

This is the correct hand-written version — and a good argument for a library.

## 3) `use` with Suspense

```tsx
const userPromise = cache.get(userId) ?? cache.set(userId, fetchUser(userId))

function UserName({ promise }: { promise: Promise<User> }) {
  const user = use(promise)       // suspends until resolved
  return <h1>{user.name}</h1>
}

<ErrorBoundary fallback={<LoadFailed />}>
  <Suspense fallback={<Skeleton />}>
    <UserName promise={userPromise} />
  </Suspense>
</ErrorBoundary>
```

The promise must come from a cache or a library. Creating it in the component body starts a new request on every render.

## 4) Error Boundaries

There is still no built-in Error Boundary hook — use a class component or `react-error-boundary`. Place boundaries at meaningful UI seams (route, panel, widget) so one failed request does not blank the app, and give every boundary a retry path. `createRoot` accepts `onCaughtError` and `onUncaughtError` for logging; see the `react-debug` skill.

## 5) Mutations

Prefer an Action over a hand-rolled submit handler: `useActionState` gives you pending state and error handling, and `useOptimistic` shows the result immediately and reverts on failure. After a successful mutation, invalidate the affected cache entries rather than patching state in several places.

## 6) Choosing a data layer

| Criterion | TanStack Query | SWR | Router loaders |
| --- | --- | --- | --- |
| Caching | normalized by key, configurable staleness | key-based, stale-while-revalidate | per navigation, router-owned |
| Invalidation | explicit, fine-grained | mutate by key | revalidate on navigation/action |
| Devtools | dedicated devtools panel | minimal | router devtools |
| Bundle size | medium | small | included with the router |
| Router integration | pairs with any router; preload in loaders | pairs with any router | native |
| Best at | complex caches, pagination, offline, retries | simple read-mostly screens | removing waterfalls at route level |

One line each: **RTK Query** if you already use Redux Toolkit; **plain `fetch` + `use`** for a couple of screens where a library is overkill.

Many apps combine a router loader (start the request early) with a query library (own the cache). Pick on cache complexity, not on popularity.

## Checklist

- [ ] No unaborted `fetch` in an Effect
- [ ] Loading, error and empty states exist for every remote read
- [ ] Error Boundary around each data-driven region, with retry
- [ ] Mutations run as Actions and invalidate the cache
- [ ] One data layer per app, chosen on explicit criteria
