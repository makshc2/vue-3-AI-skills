# Routing patterns

## Guards

```tsx
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
```

- Put the guard in a layout route so every child inherits it.
- Keep the attempted URL in navigation state and return to it after login.
- Never call `navigate()` during render; return a redirect element instead.

## Lazy routes

```tsx
const Settings = lazy(() => import('./features/settings/SettingsPage'))

<Route
  path="settings"
  element={<Suspense fallback={<PageSkeleton />}><Settings /></Suspense>}
/>
```

- Split at route boundaries first; component-level splitting rarely pays off.
- Preload on hover or focus for the primary navigation path.
- A spinner that flashes is worse than no spinner — use a skeleton or a small delay.

## Search params as state

```tsx
const [params, setParams] = useSearchParams()
const page = Number(params.get('page') ?? '1')
const query = params.get('q') ?? ''

setParams((previous) => {
  previous.set('q', nextQuery)
  previous.set('page', '1')
  return previous
}, { replace: true })
```

- Parse and clamp every value; the URL is user-editable input.
- Use `replace` for keystroke-level updates so the back button stays useful.
- Keep one owner per parameter — two components writing `page` will fight.

## Scroll restoration

- Use the router's scroll restoration component when it has one.
- Otherwise reset scroll on pathname change, and skip the reset when only search params changed.

## Errors and not found

- One catch-all route rendering a real 404 screen with a way back.
- A route-level error element so a failed loader does not blank the app; see the `react-debug` skill for diagnosing the failure itself.
