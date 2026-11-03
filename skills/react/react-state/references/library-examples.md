# The same feature in three libraries

A counter slice with an async increment, written idiomatically in each library.

## Zustand

```ts
import { create } from 'zustand'

type CounterStore = { count: number; increment: () => void; loadInitial: () => Promise<void> }

export const useCounter = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  loadInitial: async () => set({ count: await fetchCount() }),
}))

// component: select the narrowest slice
const count = useCounter((state) => state.count)
```

## Redux Toolkit

```ts
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counter = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: { increment: (state) => { state.count += 1 } },
})

export const store = configureStore({ reducer: { counter: counter.reducer } })
export const { increment } = counter.actions

// component
const count = useSelector((state: RootState) => state.counter.count)
const dispatch = useDispatch()
```

Immer lets reducers look mutable while staying immutable. Type `RootState` and `AppDispatch` once and export typed hooks.

## Jotai

```ts
import { atom, useAtom } from 'jotai'

export const countAtom = atom(0)
export const doubledAtom = atom((get) => get(countAtom) * 2)

// component
const [count, setCount] = useAtom(countAtom)
```

Derived atoms are the idiomatic replacement for selectors; a component only re-renders for the atoms it actually reads.

## Reading the comparison

- Zustand: fewest concepts, you own the conventions.
- Redux Toolkit: the conventions are the point — consistent slices, devtools, middleware, and RTK Query if you also need server state.
- Jotai: think in a graph of small values; excellent when derived state is the hard part.
