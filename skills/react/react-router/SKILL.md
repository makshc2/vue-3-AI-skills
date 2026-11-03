---
name: react-router
description: "Use for routing in a React 19 Vite SPA: a neutral comparison of React Router, TanStack Router and Wouter with selection criteria, canonical examples, lazy routes, search params, nested layouts, route guards and scroll restoration."
license: MIT
compatibility: "React 19.x · Vite SPA · React Router 7 · TanStack Router 1 · Wouter 3"
metadata:
  sources:
    - https://reactrouter.com/
    - https://tanstack.com/router/latest/docs/framework/react/overview
    - https://github.com/molefrog/wouter
    - https://react.dev/learn
  version: "1.0.0"
---

# React Routing — Choosing and Using

> Scope: client-side routing in a Vite SPA. Framework mode, SSR and server data loading are out of scope.

## References (open on demand)

- Canonical setup per router → [`references/router-examples.md`](references/router-examples.md)
- Guards, lazy routes, search params → [`references/patterns.md`](references/patterns.md)

---

## 1) Do you need a router at all?

For a single screen, a modal-driven tool or an embedded widget, a `useState` view switch is enough. Add a router when you need shareable URLs, back/forward navigation, deep links or code splitting per screen.

## 2) Comparison

| Criterion | React Router (declarative / data mode) | TanStack Router | Wouter |
| --- | --- | --- | --- |
| Route type safety | paths and params are strings | end-to-end typed routes and params | strings |
| Data loading | `loader` in data mode; none in declarative mode | built-in loaders, integrates with the query library | none — fetch in components |
| Code splitting | `lazy` per route | `lazy` per route, built-in preloading | manual `React.lazy` |
| Search params | `useSearchParams` (strings) | typed, validated, first-class state | `useSearch`-style helpers |
| Nested layouts | yes, nested routes with outlets | yes, file or code based | manual composition |
| Bundle size | medium | medium-large | very small |
| Maturity / ecosystem | largest, longest history | newer, fast moving, strong docs | small and stable |
| Learning curve | low (declarative) / medium (data mode) | medium-high | lowest |

One line each for the rest: **"no router"** for single-screen apps; **Navigo / page.js** only when integrating with non-React code.

Choose on: how much you care about typed params, whether route-level data loading belongs in the router or in a data library, and the size budget.

## 3) React Router in a SPA

Two usable shapes:

- **Declarative mode** — `<BrowserRouter>` + `<Routes>`/`<Route>`. Simplest; data fetching stays in components or a data library.
- **Data mode** — `createBrowserRouter` + route objects with `loader`/`action`. Removes request waterfalls, at the cost of learning the data APIs.

Both are SPA-friendly. Framework mode (with its own build and SSR) is outside this skill.

## 4) Pitfalls

- **Route guards:** render a guard component or a layout route that redirects; never call `navigate()` during render — do it in an Effect or return a `<Navigate>` element.
- **Lazy routes:** wrap lazily loaded elements in `<Suspense>` with a real fallback, and preload on hover/focus for critical paths.
- **Scroll restoration:** SPAs do not restore scroll by default. Use the router's scroll restoration component or reset scroll on pathname change.
- **Search params as state:** the URL is shared, mutable, string-typed state — parse and validate it at the boundary and keep one owner per parameter.
- **Not found and errors:** define an explicit catch-all route and a route-level error element; an unhandled routing error should not blank the app.

## Checklist

- [ ] A router is actually needed; the choice has written criteria
- [ ] Every lazy route has a Suspense fallback
- [ ] Guards redirect declaratively, not during render
- [ ] Search params are parsed and validated once
- [ ] Catch-all route and error element exist
