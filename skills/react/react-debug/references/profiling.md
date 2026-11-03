# Profiling re-renders

## Workflow

1. Build in production mode (`npm run build && npm run preview`) with the profiling build of React DevTools.
2. Record one specific interaction — typing, opening a panel, switching a tab.
3. Find the **commit** with the longest duration, then the component with the largest self time.
4. Read "why did this render": props changed, state changed, parent rendered, or context changed.

## Common findings

| "Why did it render" | Real cause | Fix |
| --- | --- | --- |
| Parent rendered | state lives too high | move state down, or pass `children` through |
| Context changed | one context holds unrelated fields | split contexts by concern |
| Props changed (object) | a fresh object or array built each render | derive it, or select primitives |
| Hook changed | selector returns a new object | select narrower slices |

## With the React Compiler

The compiler already memoizes most of this. If a component still re-renders too much:

- check whether DevTools marks it as compiled; if not, fix the reported rule violation first;
- look at state placement and context shape before adding any manual memoization;
- measure after each change — one at a time.

## Measuring the right thing

- Interaction latency and dropped frames matter; a render count does not.
- A long task in a handler (parsing, sorting, formatting) is a JavaScript problem, not a React one — move it out of the render path or defer it with `useDeferredValue`.
