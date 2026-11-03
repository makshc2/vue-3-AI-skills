# Typing hooks and generic code

## `useState`

```tsx
const [query, setQuery] = useState('')                  // inferred string
const [user, setUser] = useState<User | null>(null)     // annotate unions
const [ids, setIds] = useState<string[]>([])            // annotate empty arrays
```

Updater functions get the previous state typed for free: `setIds((previous) => [...previous, id])`.

## `useReducer`

```tsx
type State = { items: Item[]; status: 'idle' | 'loading' | 'error' }
type Action =
  | { type: 'loading' }
  | { type: 'loaded'; items: Item[] }
  | { type: 'failed'; message: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading': return { ...state, status: 'loading' }
    case 'loaded': return { items: action.items, status: 'idle' }
    case 'failed': return { ...state, status: 'error' }
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}
```

## `useRef`

```tsx
const inputRef = useRef<HTMLInputElement | null>(null)   // DOM node
const timerRef = useRef<number | undefined>(undefined)   // mutable value
```

In the React 19 types `useRef` always takes an argument.

## Context

```tsx
type AuthValue = { user: User; signOut: () => void }
const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
```

Consumers get a non-nullable type and a clear runtime error.

## Generic custom hooks

```tsx
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : initial
  })
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue] as const
}
```

`as const` preserves the tuple shape for destructuring. Validate parsed JSON at the boundary — a cast is a promise, not a check.
