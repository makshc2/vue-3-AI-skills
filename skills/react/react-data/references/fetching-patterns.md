# Fetching patterns

## Kill the waterfall

```tsx
// ❌ sequential: user, then orders
const user = await fetchUser(id)
const orders = await fetchOrders(user.id)

// ✅ parallel when independent
const [user, settings] = await Promise.all([fetchUser(id), fetchSettings(id)])
```

At the UI level, start requests as high as the data is needed — in a route loader or a parent — instead of letting each child discover its own data after mount.

## Keys and staleness

With a query library, the cache key *is* the identity of the data:

```ts
const { data, isPending, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: ({ signal }) => fetchUser(userId, { signal }),
  staleTime: 30_000,
})
```

- Include every variable the request depends on in the key.
- `staleTime` decides when a background refetch happens; the default of zero refetches aggressively.
- Pass the library's `signal` through to `fetch` so cancellation works.

## Pagination and infinite lists

- Keep the page or cursor in the URL when it should be shareable.
- Use the library's infinite-query support instead of concatenating pages into component state.
- Preserve the previous page while the next loads to avoid layout jumps.

## Caching by hand

If you stay with `use` + Suspense and no library, keep one module-level cache keyed by the request:

```ts
const cache = new Map<string, Promise<User>>()
export function getUser(id: string) {
  if (!cache.has(id)) cache.set(id, fetchUser(id))
  return cache.get(id)!
}
```

Be explicit about eviction and about what happens after a failed promise — a rejected promise left in the cache will re-throw forever.

## Request boundaries

- Validate and narrow responses where they enter the app; a cast is not a check.
- Map transport errors to domain errors once, not in every component.
- Keep auth headers and base URLs in one client module.
