# Memoization with the React Compiler

## Default: do nothing

The compiler memoizes component output and hook results automatically. Hand-written memoization adds code, hides bugs behind stale closures, and often slows things down with its own comparison cost.

## When to keep a manual hook

- **Referential identity for a non-React consumer:** a value handed to an external store, a map library, a chart instance.
- **A measured hotspot** where profiling shows the compiler could not memoize (usually because of a rule violation it reported).
- **Expensive work the compiler cannot see**, such as a value computed in a module-level cache keyed by props.

## `memo`

Rarely needed with the compiler on. If you still reach for it, the real problem is usually a context that re-renders too much or state living too high in the tree.

## Escape hatches

- `'use no memo'` at the top of a function opts that function out of compilation. Use it to unblock work while you fix the underlying violation, and leave a TODO.
- The compiler's ESLint rules (shipped in `eslint-plugin-react-hooks`, `recommended-latest`) tell you exactly which code it refused to compile — fix those first.

## Measuring

1. Run a production build; development is double-rendering and slower by design.
2. Use React DevTools Profiler to find the component that actually re-renders.
3. Change one thing, measure again. Do not add memoization on a hunch.
