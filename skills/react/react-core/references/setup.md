# React 19 + Vite SPA setup

Verify versions against react.dev and the plugin's npm page before pinning.

## Scaffold

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install
```

This gives React 19, `@vitejs/plugin-react` and a `src/main.tsx` entry point.

## React Compiler

The compiler memoizes components and hooks automatically, so hand-written `useMemo` / `useCallback` / `memo` become the exception rather than the rule.

```bash
npm install -D babel-plugin-react-compiler@latest
```

From `@vitejs/plugin-react@6.0.0` the inline `babel` option was removed and the compiler is wired through `reactCompilerPreset` plus `@rolldown/plugin-babel`:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
})
```

On older plugin versions:

```js
react({ babel: { plugins: ['babel-plugin-react-compiler'] } })
```

The compiler targets React 19; React 17 and 18 need extra configuration.

## Lint

```bash
npm install -D eslint-plugin-react-hooks@latest
```

Use the `recommended-latest` preset — it contains both the Rules of Hooks rules and the compiler's static analysis. Fix every reported violation: code the compiler cannot verify is code it will not optimize.

## Structure

```
src/
  main.tsx          # createRoot + StrictMode
  App.tsx
  components/       # shared presentational components
  features/<name>/  # feature-local components, hooks, api
  hooks/            # cross-feature custom hooks
  lib/              # framework-free helpers
```

Keep feature code colocated; promote to `components/` or `hooks/` only on the second real consumer.

## Environment

- `import.meta.env.VITE_*` for client configuration; never put secrets in a SPA bundle.
- `npm run build` must stay warning-free before merging.
