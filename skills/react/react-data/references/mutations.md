# Mutations, optimistic UI, errors

## Mutation as an Action

```tsx
const [error, submit, isPending] = useActionState(
  async (_previous: string | null, formData: FormData) => {
    try {
      await createTodo({ text: String(formData.get('text')) })
      await queryClient.invalidateQueries({ queryKey: ['todos'] })
      return null
    } catch (cause) {
      return cause instanceof Error ? cause.message : 'Unknown error'
    }
  },
  null,
)
```

- Return errors you want to render inline; throw the ones an Error Boundary should handle.
- `isPending` is the only loading flag you need.

## Optimistic updates

```tsx
const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (current, draft: Todo) => [...current, draft],
)
```

Call `addOptimistic` inside the Action. React discards the optimistic value when the Action settles, so a failure reverts automatically — but still surface the error to the user.

Use optimistic UI when success is the overwhelmingly likely outcome and the change is easy to undo visually. Avoid it for payments, deletions without undo, or anything the server may reject on business rules.

## Invalidate, do not patch

After a successful mutation, invalidate the affected cache keys and let the data layer refetch. Hand-patching caches in several places is where "the list shows stale data" bugs come from. Patch only when a refetch is genuinely too expensive, and keep that patch in one place.

## Error boundaries with retry

```tsx
class ErrorBoundary extends React.Component<Props, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: React.ErrorInfo) { report(error, info) }
  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, () => this.setState({ error: null }))
    }
    return this.props.children
  }
}
```

- One boundary per meaningful region, not one per app.
- Always offer a retry that resets the boundary **and** refetches.
- Log with `componentDidCatch` or the `createRoot` error callbacks.
