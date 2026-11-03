---
name: react-testing
description: "Use for testing React 19 components in a Vite SPA with Vitest, React Testing Library and user-event: role-based queries, renderHook, provider wrappers, async findBy and waitFor, network mocking with MSW, Suspense and Error Boundary tests."
license: MIT
compatibility: "React 19.x · Vite SPA · Vitest 3 · Testing Library 16 · MSW 2"
metadata:
  sources:
    - https://testing-library.com/docs/react-testing-library/intro/
    - https://testing-library.com/docs/user-event/intro
    - https://vitest.dev/guide/
    - https://mswjs.io/docs/
  version: "1.0.0"
---

# React Testing — Vitest + Testing Library

> Scope: component and hook tests for a React 19 Vite SPA. End-to-end testing is out of scope.

## References (open on demand)

- Setup, wrappers and `renderHook` → [`references/setup-and-wrappers.md`](references/setup-and-wrappers.md)
- Async, network mocking and boundaries → [`references/async-and-network.md`](references/async-and-network.md)

---

## 1) What to test

Test what the user can observe: rendered output, accessible names and roles, and the effects of interaction. Do not assert on state variables, hook call counts, prop names of child components, or class names that exist only for styling.

A test that breaks on every refactor is a liability; a test that keeps passing while the feature is broken is worse.

## 2) Stack

- **Vitest** with `environment: 'jsdom'` — the same transform pipeline as the app, so no second build config.
- **React Testing Library** for rendering and queries.
- **`user-event`** for interaction: it dispatches the full event sequence a real user produces, unlike `fireEvent`.

```tsx
const user = userEvent.setup()
render(<LoginForm onSubmit={onSubmit} />)

await user.type(screen.getByRole('textbox', { name: /email/i }), 'ada@example.com')
await user.click(screen.getByRole('button', { name: /sign in/i }))

expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com' })
```

## 3) Query priority

1. `getByRole` with an accessible name — closest to how users and assistive tech find elements.
2. `getByLabelText` for form fields.
3. `getByPlaceholderText`, `getByText` when no better option exists.
4. `getByTestId` — last resort, for elements with no accessible identity.

If `getByRole` cannot find an element, the markup usually has an accessibility problem; fixing it improves the app and the test. See the `html-a11y` skill.

## 4) Async

- `findBy*` = `getBy*` + `waitFor` — the default for anything that appears after a promise.
- `waitFor` for non-query assertions; keep the callback free of side effects.
- `waitForElementToBeRemoved` for disappearing spinners.
- Never `await` a fixed `setTimeout`; assert on the UI instead.
- With fake timers, pass `advanceTimers` to `userEvent.setup()`.

An `act(...)` warning means a state update happened outside the testing library's knowledge — usually an unawaited promise. Await the user interaction or the `findBy*` query rather than wrapping things in `act` by hand.

## 5) Hooks

```tsx
const { result } = renderHook(() => useCounter(), { wrapper: AppProviders })
act(() => result.current.increment())
expect(result.current.count).toBe(1)
```

Use `renderHook` for genuinely reusable hooks. Feature-specific hooks are better tested through the component that uses them.

## 6) Providers

Wrap once, reuse everywhere: build a custom `render` that mounts router, store and query providers, and create a **fresh** client and store per test so nothing leaks between cases.

## 7) Network

Mock at the network boundary with MSW rather than stubbing `fetch` or the data library: the component under test exercises its real request path, and the same handlers work in tests and in the browser.

```ts
const server = setupServer(
  http.get('/api/users/:id', () => HttpResponse.json({ id: '1', name: 'Ada' })),
)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 8) Suspense and Error Boundaries

- Render the component inside the same `<Suspense>` / Error Boundary it has in the app, then assert the fallback first and the content with `findBy*`.
- Test the error path by making a handler return a 500 and asserting the boundary's message and retry control.
- Silence the expected `console.error` from a deliberate throw, but only in that test.

## 9) Jest

Jest remains a valid choice; the Testing Library API is identical. In a Vite project Vitest avoids a duplicate transform configuration, which is usually the deciding factor.

## Checklist

- [ ] Queries go through roles and labels, not test ids
- [ ] Every interaction uses `user-event` and is awaited
- [ ] No assertions on implementation details
- [ ] Network mocked with MSW, unhandled requests error
- [ ] Fresh providers, store and client per test
