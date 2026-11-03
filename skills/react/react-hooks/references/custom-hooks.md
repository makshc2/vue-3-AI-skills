# Custom hook design

## Shape

```tsx
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((value) => !value)
  return { isOpen, open, close, toggle }
}
```

- Return an object with named fields when there are more than two values; a tuple only when the names are obvious (`[value, setValue]`).
- Keep the hook focused: one concern, no "kitchen sink" options object.

## Rules

- A custom hook may call hooks; a plain helper may not. If your function calls no hooks, do not prefix it with `use`.
- Hooks are not shared state: two components calling the same hook get independent state. Shared state needs a store or context.
- Do not accept a callback you then put into a dependency array without extracting the non-reactive part — that is what `useEffectEvent` is for.

## Testing

Test custom hooks through a component that uses them, or with `renderHook` from the testing library — see the `react-testing` skill.

## Naming

| Hook | Returns |
| --- | --- |
| `useX` | state plus actions for X |
| `useXValue` | a read-only derived value |
| `useOnX` | an event subscription with cleanup |
