---
name: react-debug
description: "Use for diagnosing React 19 runtime problems in a Vite SPA: Too many re-renders, cross-component update warnings, infinite Effects, stale closures, hook order errors, act warnings, StrictMode double invocation, DevTools and Profiler, root error callbacks and React Compiler diagnostics."
license: MIT
compatibility: "React 19.x · Vite SPA · React DevTools 6"
metadata:
  sources:
    - https://react.dev/reference/react-dom/client/createRoot
    - https://react.dev/learn/react-developer-tools
    - https://react.dev/reference/react/StrictMode
    - https://react.dev/learn/react-compiler
  version: "1.0.0"
---

# React Debugging — Symptoms and Causes

> Scope: diagnosing a running React 19 Vite SPA. Load on demand; this skill is a lookup table, not a style guide.

## References (open on demand)

- Error and warning catalogue → [`references/error-catalogue.md`](references/error-catalogue.md)
- Profiling re-renders → [`references/profiling.md`](references/profiling.md)

---

## 1) Method

1. Reproduce in a development build — production strips the useful messages.
2. Read the component stack in the error, not just the message.
3. Find the **one** state update or render that starts the cascade.
4. Fix the cause (impurity, wrong dependency, state in the wrong place), never the symptom with a guard flag.

## 2) Frequent errors

**"Too many re-renders. React limits the number of renders to prevent an infinite loop."**
A state setter is called during render. Usually `onClick={handler()}` instead of `onClick={handler}`, or a `setState` in the component body without a condition that eventually stops.

**"Cannot update a component while rendering a different component"**
A component sets state in a *different* component during its own render. Move the update into an Effect or an event handler, or lift the state to the common owner.

**Infinite Effect loop**
The Effect sets state that is in its own dependency array, directly or via an object/function recreated every render. Derive the value instead, or stabilize the dependency.

**Stale closure** (a handler sees an old value)
A callback captured an old render's variables and was stored in a ref, a timer or an external subscription. Use the updater form `setState(previous => …)`, or extract the non-reactive part with `useEffectEvent`.

**"Rendered more hooks than during the previous render" / "Rendered fewer hooks…"**
A hook is called conditionally or after an early `return`. Hooks must run in the same order every render.

**`act(...)` warning in tests**
A state update happened outside what the test awaited. Await the interaction or a `findBy*` query — see the `react-testing` skill.

## 3) StrictMode double invocation

In development React calls render, Effects and reducers twice to expose impurity and missing cleanup. If code breaks only under StrictMode, it is already broken: it mutates something during render, or its Effect has no cleanup. Never add a `hasRun` ref to hide it, and never disable StrictMode to "fix" a bug.

## 4) DevTools and Profiler

- **Components** tab: inspect props, state and hooks; "Highlight updates when components render" shows the cascade live.
- **Profiler** tab: record an interaction, then read the flame chart for what rendered and why — with "Record why each component rendered" enabled.
- Profile a **production-like** build; development is intentionally slower and double-renders.
- With the React Compiler active, DevTools marks optimized components — a component that is not marked usually violated a rule the lint plugin also reports.

## 5) Root-level error callbacks

```tsx
createRoot(container, {
  onCaughtError: (error, info) => report('caught', error, info.componentStack),
  onUncaughtError: (error, info) => report('uncaught', error, info.componentStack),
  onRecoverableError: (error) => report('recoverable', error),
}).render(<App />)
```

`onCaughtError` fires for errors an Error Boundary handled, `onUncaughtError` for ones that reached the root. Wire both to your logging before shipping.

## 6) React Compiler diagnostics

- Run the ESLint rules first: they name the exact function the compiler refused to compile and why.
- A suspicious behaviour change after enabling the compiler is almost always a Rules of React violation — mutation during render, reading a ref in render, or an impure helper.
- `'use no memo'` on the function isolates whether the compiler is involved. If the bug survives, the compiler is not the cause. Treat the directive as a temporary probe.

## Checklist

- [ ] Reproduced in development with the full component stack
- [ ] The first offending update identified, not just the last
- [ ] StrictMode still enabled
- [ ] Root error callbacks report to the logger
- [ ] Hook lint rules pass with zero suppressions
