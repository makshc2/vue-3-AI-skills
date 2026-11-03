# Props, children and element types

## Choosing a prop type

| Need | Type |
| --- | --- |
| Anything renderable | `React.ReactNode` |
| A single JSX element | `React.ReactElement` |
| A component to render | `React.ComponentType<P>` |
| Props of `<input>` | `React.ComponentProps<'input'>` |
| Props of `<input>` without `ref` | `React.ComponentPropsWithoutRef<'input'>` |
| Props of an existing component | `React.ComponentProps<typeof Component>` |

## Wrapping a DOM element

```tsx
type ButtonProps = React.ComponentPropsWithRef<'button'> & {
  tone?: 'primary' | 'ghost'
}

export function Button({ tone = 'primary', className, ...rest }: ButtonProps) {
  return <button className={`btn btn--${tone} ${className ?? ''}`} {...rest} />
}
```

Spread the rest props last so callers can override, and never drop `className`, `id` or ARIA attributes.

## Discriminated prop unions

Model mutually exclusive props instead of making everything optional:

```tsx
type LinkProps =
  | { href: string; onPress?: never }
  | { href?: never; onPress: () => void }
```

## Polymorphic components

Keep them rare — they cost a lot of type complexity for little gain. When needed:

```tsx
type BoxProps<T extends React.ElementType> = {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, 'as'>
```

## Style and class props

Type `style` as `React.CSSProperties`. Keep styling decisions in the `css-core` and `css-layout` skills; types only guard the handoff.
