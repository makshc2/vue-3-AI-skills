# Async, MSW, Suspense and boundaries

## MSW handlers

```ts
// src/test/handlers.ts
export const handlers = [
  http.get('/api/users/:id', ({ params }) =>
    HttpResponse.json({ id: params.id, name: 'Ada' })),
  http.post('/api/users', async ({ request }) =>
    HttpResponse.json(await request.json(), { status: 201 })),
]
```

Override per test for error paths:

```ts
server.use(http.get('/api/users/:id', () => new HttpResponse(null, { status: 500 })))
```

`onUnhandledRequest: 'error'` turns a forgotten endpoint into a clear failure instead of a mysterious timeout.

## Async assertions

```tsx
expect(screen.getByRole('status')).toBeInTheDocument()            // skeleton first
expect(await screen.findByRole('heading', { name: 'Ada' })).toBeVisible()
await waitForElementToBeRemoved(() => screen.queryByRole('status'))
```

- `queryBy*` is the only family that returns `null` — use it for "should not exist".
- Put a single assertion in `waitFor`; several make failures ambiguous.

## Suspense

```tsx
render(
  <Suspense fallback={<p role="status">Loading…</p>}>
    <UserName promise={getUser('1')} />
  </Suspense>,
)
expect(screen.getByRole('status')).toBeInTheDocument()
expect(await screen.findByText('Ada')).toBeInTheDocument()
```

## Error boundaries

```tsx
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

render(<ErrorBoundary fallback={<p role="alert">Failed</p>}><Broken /></ErrorBoundary>)
expect(await screen.findByRole('alert')).toHaveTextContent('Failed')

consoleError.mockRestore()
```

Restore the spy in the same test; leaving it mocked hides real errors elsewhere.

## Timers

```ts
vi.useFakeTimers()
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
// …
vi.useRealTimers()
```

Debounced inputs need this pairing; without `advanceTimers` the interaction hangs.
