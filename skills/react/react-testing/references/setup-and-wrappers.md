# Setup, wrappers and renderHook

## Vitest config

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    restoreMocks: true,
  },
})
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
afterEach(cleanup)
```

## A custom render

```tsx
function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return { user: userEvent.setup(), ...render(ui, { wrapper: AppProviders, ...options }) }
}
```

- Create the client **inside** the wrapper so each test gets a fresh cache.
- Disable retries in tests; otherwise a failing request takes seconds to surface.
- Re-export everything from the testing library through this module so tests have one import.

## Routing

```tsx
render(<App />, { wrapper: ({ children }) => (
  <MemoryRouter initialEntries={['/users/1']}>{children}</MemoryRouter>
) })
```

Assert on what the route renders, not on the router's internals.

## renderHook

```tsx
const { result, rerender } = renderHook(({ id }) => useUser(id), {
  initialProps: { id: '1' },
  wrapper: AppProviders,
})

await waitFor(() => expect(result.current.data?.name).toBe('Ada'))
rerender({ id: '2' })
```

- Wrap state-changing calls in `act`.
- `result.current` is a snapshot — read it again after each update instead of destructuring once.

## Stores

A module-level store leaks across tests. Export a factory, or reset it:

```ts
beforeEach(() => useCounter.setState(useCounter.getInitialState()))
```
