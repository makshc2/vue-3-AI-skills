# Structuring state

## Principles

1. **Single source of truth** — every value has exactly one owner.
2. **Store the minimum** — derive everything else.
3. **Normalize collections** — `{ byId, allIds }` beats nested arrays for updates and lookups.
4. **Group values that change together**; split values that change independently.
5. **Avoid contradictory flags** — replace `isLoading` + `isError` + `data` with one `status` union.

```ts
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
```

## Reducers

- Keep them pure: no fetches, no timers, no randomness.
- One action per user intent (`checkout/submitted`), not per setter (`setStep`).
- Name actions in past tense from the domain's point of view; it keeps devtools logs readable.

## Selecting

- Select the narrowest value a component needs.
- Memoized selectors matter for expensive derivations; for simple field access they are noise.
- Never select a freshly built object without shallow comparison.

## Forms

Most form state is local. Reach for a form library only when you need cross-field validation, arrays of fields, or wizard flows — and keep the result out of the global store.
