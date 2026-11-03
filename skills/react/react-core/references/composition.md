# Composition, context and lifting state

## Prefer composition over context

```tsx
// ❌ prop drilling
<Layout user={user}><Page user={user} /></Layout>

// ✅ pass elements as children
<Layout sidebar={<UserCard user={user} />}><Page /></Layout>
```

`children` and element props remove most drilling without adding a global dependency.

## Context rules

- One context per concern; a single "app context" object re-renders every consumer on any change.
- Put the value in a variable the compiler can track; avoid building fresh objects with unrelated fields.
- Split read context from write context (value vs dispatch) when writers change often and readers do not.
- Give every context a meaningful default and a typed custom hook that throws when used outside its provider.

```tsx
const ThemeContext = createContext<Theme | null>(null)

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
```

## Lifting state

1. Find every component that reads the value.
2. Move the state to their closest common ancestor.
3. Pass the value down and a setter or an event handler back up.

If that ancestor is far away and the value changes often, it is a signal to use a store rather than context — compare options in the `react-state` skill.

## Resetting state

Changing `key` remounts a subtree and clears its state — the idiomatic reset for a form or a detail panel bound to a selected id:

```tsx
<ProfileForm key={selectedUserId} userId={selectedUserId} />
```
