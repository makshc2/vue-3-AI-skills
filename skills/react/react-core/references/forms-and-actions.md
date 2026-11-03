# Forms and Actions

## `useActionState`

```tsx
const [state, formAction, isPending] = useActionState(action, initialState)
```

- `action(previousState, formData)` may be async; its return value becomes the next `state`.
- `isPending` replaces a hand-rolled loading flag.
- Return error values instead of throwing when you want to render them inline; throw when an Error Boundary should take over.

## `useFormStatus`

```tsx
function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
}
```

- Must be rendered **inside** the `<form>` it reports on — it reads the closest parent form, not its own component.

## `useOptimistic`

```tsx
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (current, pending: Item) => [...current, pending],
)

async function submit(formData: FormData) {
  const draft = { id: crypto.randomUUID(), text: String(formData.get('text')) }
  addOptimistic(draft)
  await createItem(draft)
}
```

- Call the optimistic updater inside an Action or `startTransition`; React reverts automatically when the Action settles.

## Uncontrolled vs controlled

- Prefer uncontrolled inputs with `name` + `FormData` for plain forms: less state, fewer re-renders, native validation keeps working.
- Reach for controlled inputs only when you need to transform or validate on every keystroke.
- Reset a form by changing the `key` of the form subtree.

## Pitfalls

- Do not mix `<form action={fn}>` with `onSubmit` + `preventDefault` — pick one.
- `FormData` values are strings (or `File`); parse and validate at the boundary.
- Disable the submit button via `isPending` / `useFormStatus`, never by tracking a separate state flag that can drift.
- Keep validation messages tied to inputs with `aria-describedby` and announce errors with `role="alert"`.
