# Error and warning catalogue

| Message | Usual cause | Fix |
| --- | --- | --- |
| Too many re-renders | setter called during render | pass the function, not its result; guard the update |
| Cannot update a component while rendering a different component | cross-component `setState` during render | move to an Effect or event handler |
| Maximum update depth exceeded | Effect sets a state it depends on | derive the value; stabilize the dependency |
| Rendered more/fewer hooks than expected | conditional hook or early return | hooks at the top level only |
| Invalid hook call | two copies of React, or a hook outside a component | dedupe React in the bundle; check the call site |
| Each child in a list should have a unique "key" | missing or duplicated key | stable id-based key |
| Objects are not valid as a React child | rendering an object or a promise | render a field; `use()` the promise |
| Warning: An update to X inside a test was not wrapped in act | unawaited async update in a test | await the interaction or `findBy*` |
| Cannot read properties of null (reading 'current') | ref read before mount | read refs in Effects or handlers |
| Hydration failed | SSR markup mismatch | out of scope for a pure SPA; check for a stray SSR build |

## Infinite Effect checklist

1. Does the Effect call a setter for a value in its own dependency array?
2. Is a dependency an object, array or function created during render?
3. Could the value be derived during render instead?
4. Is the Effect synchronizing with something outside React at all?

## Stale closure checklist

1. Is the callback stored in a ref, timer, subscription or event listener?
2. Does it read state directly instead of using the updater form?
3. Does its Effect cleanup remove the old listener before adding a new one?

## Dev-only vs production

Development adds StrictMode double-invocation, extra warnings and slower paths. Always confirm a performance problem against a production build before optimizing.
