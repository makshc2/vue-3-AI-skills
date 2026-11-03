---
name: react-typescript
description: "Use for typing React 19 code: props without React.FC, ComponentProps helpers, ReactNode and PropsWithChildren, event and generic components, ref as a prop, typed useState/useReducer/useRef/Context, jsx react-jsx config, and @types/react 19 changes."
license: MIT
compatibility: "React 19.x · @types/react 19.x · TypeScript 5.x · Vite SPA"
metadata:
  sources:
    - https://react.dev/learn/typescript
    - https://react.dev/reference/react
    - https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react
    - https://www.typescriptlang.org/docs/handbook/jsx.html
  version: "1.0.0"
---

# React + TypeScript — Best Practices

> Scope: React 19 with `@types/react` 19 in a Vite SPA.

## References (open on demand)

- Props, children and element types → [`references/props-and-children.md`](references/props-and-children.md)
- Hooks and generics → [`references/hooks-and-generics.md`](references/hooks-and-generics.md)

---

## 1) Type props directly — not with `React.FC`

```tsx
type ButtonProps = {
  label: string
  tone?: 'primary' | 'ghost'
  onPress: () => void
}

export function Button({ label, tone = 'primary', onPress }: ButtonProps) {
  return <button className={tone} onClick={onPress}>{label}</button>
}
```

Why not `React.FC`:

- it adds nothing once props are typed;
- it makes generic components awkward to express;
- its historical implicit `children` is gone in the React 19 types, so code written around that assumption silently changes meaning.

Declare `children` explicitly when the component accepts it.

## 2) Reuse DOM prop types

```tsx
type InputProps = React.ComponentPropsWithRef<'input'> & { label: string }
type CardProps = React.ComponentProps<typeof Card>
```

- `ComponentProps<'tag'>` — props of an intrinsic element.
- `ComponentPropsWithoutRef<'tag'>` — the same without `ref`; use it when you deliberately do not forward a ref.
- `ComponentProps<typeof X>` — props of an existing component, so wrappers stay in sync.

## 3) `children` and renderable values

- `React.ReactNode` — anything renderable (the right type for `children`).
- `React.ReactElement` — specifically a JSX element.
- `PropsWithChildren<P>` is fine, but an explicit `children: React.ReactNode` field reads better and documents optionality.

## 4) Events

```tsx
function onChange(event: React.ChangeEvent<HTMLInputElement>) { /* … */ }
function onSubmit(event: React.FormEvent<HTMLFormElement>) { /* … */ }
const onClick: React.MouseEventHandler<HTMLButtonElement> = (event) => { /* … */ }
```

Prefer inline handlers so TypeScript infers the event type; annotate only when the handler is defined away from its JSX.

## 5) Generic components

```tsx
type ListProps<T> = {
  items: readonly T[]
  getKey: (item: T) => string
  renderItem: (item: T) => React.ReactNode
}

export function List<T>({ items, getKey, renderItem }: ListProps<T>) {
  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>
}
```

A plain function declaration keeps the generic parameter readable — another reason to avoid `React.FC`.

## 6) `ref` as a prop

```tsx
type FieldProps = React.ComponentPropsWithRef<'input'> & { label: string }

export function Field({ label, ref, ...rest }: FieldProps) {
  return <label>{label}<input ref={ref} {...rest} /></label>
}
```

`useRef` now requires an initial argument: `useRef<HTMLInputElement | null>(null)`.

## 7) Hooks

```tsx
const [user, setUser] = useState<User | null>(null)       // annotate when the initial value is null
const [count, setCount] = useState(0)                     // otherwise let inference work

type Action = { type: 'add'; item: Item } | { type: 'clear' }
function reducer(state: State, action: Action): State { /* exhaustive switch */ }
```

- Discriminated unions make `useReducer` exhaustive — add a `default` branch with `never` to catch new cases at compile time.
- Context: `createContext<Value | null>(null)` plus a typed hook that throws outside the provider, so consumers never deal with `null`.

## 8) `tsconfig`

```jsonc
{
  "compilerOptions": {
    "jsx": "react-jsx",        // the automatic runtime, no React import needed
    "strict": true,
    "moduleResolution": "bundler",
    "types": ["vite/client"]
  }
}
```

Keep `strict` on; `noUncheckedIndexedAccess` is a worthwhile addition for list-heavy UI code.

## 9) `@types/react` 19 notes

- `ReactNode` no longer includes `{}`, so some previously accepted values now error — model the real union instead of widening.
- `useRef` requires an argument.
- Implicit `children` is gone from the function component types.
- Keep `@types/react` and `@types/react-dom` on matching major versions.

## 10) `satisfies`

```tsx
const tones = { primary: 'btn-primary', ghost: 'btn-ghost' } satisfies Record<Tone, string>
```

Validates the shape while keeping literal types for keys and values.

## Checklist

- [ ] No `React.FC`, no implicit `children`
- [ ] DOM wrappers reuse `ComponentProps*` instead of re-declaring props
- [ ] Reducer actions are a discriminated union
- [ ] `jsx: "react-jsx"` and `strict: true`
- [ ] `@types/react` and `@types/react-dom` majors match React
