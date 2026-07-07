import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

describe('javascript-performance patterns', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('debounce runs once after burst', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)
    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledOnce()
  })
})

describe('javascript-data patterns', () => {
  it('Intl formats UAH currency', () => {
    const fmt = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' })
    expect(fmt.format(1234.5)).toMatch(/1[\s\u00a0]?234/)
  })

  it('structuredClone preserves Date', () => {
    const original = { at: new Date('2026-06-12T10:00:00Z'), tags: new Set(['a']) }
    const copy = structuredClone(original)
    expect(copy.at).toEqual(original.at)
    expect(copy.tags).toEqual(original.tags)
  })

  it('Map groupBy pattern works', () => {
    const orders = [{ status: 'new' }, { status: 'done' }, { status: 'new' }]
    const byStatus = Object.groupBy(orders, (o) => o.status)
    expect(byStatus.new).toHaveLength(2)
    expect(byStatus.done).toHaveLength(1)
  })
})

describe('javascript-debug pitfalls (bug vs fix)', () => {
  it('let in loop fixes closure capture', async () => {
    const results = []
    for (let i = 0; i < 3; i++) {
      results.push(new Promise((r) => setTimeout(() => r(i), 0)))
    }
    expect(await Promise.all(results)).toEqual([0, 1, 2])
  })

  it('return await catches rejection in try/catch', async () => {
    const failing = () => Promise.reject(new Error('fail'))

    async function withAwait() {
      try {
        return await failing()
      } catch {
        return 'caught'
      }
    }

    async function withoutAwait() {
      try {
        return failing()
      } catch {
        return 'caught'
      }
    }

    expect(await withAwait()).toBe('caught')
    await expect(withoutAwait()).rejects.toThrow('fail')
  })

  it('spread before sort avoids mutating source', () => {
    const users = [{ age: 30 }, { age: 20 }]
    const sorted = [...users].sort((a, b) => a.age - b.age)
    expect(sorted[0].age).toBe(20)
    expect(users[0].age).toBe(30)
  })

  it('Number.isNaN vs isNaN', () => {
    expect(Number.isNaN(NaN)).toBe(true)
    expect(Number.isNaN('hello')).toBe(false)
    expect(isNaN('hello')).toBe(true)
  })
})

describe('javascript-core immutability', () => {
  it('updates nested object immutably', () => {
    const state = { user: { name: 'Ann', role: 'guest' } }
    const next = { ...state, user: { ...state.user, role: 'admin' } }
    expect(next.user.role).toBe('admin')
    expect(state.user.role).toBe('guest')
  })
})

describe('javascript-testing conventions', () => {
  it.each([
    ['', 0],
    ['hello world', 2],
  ])('countWords(%j) → %i', (input, expected) => {
    const countWords = (s) => (s.trim() === '' ? 0 : s.trim().split(/\s+/).length)
    expect(countWords(input)).toBe(expected)
  })
})

describe('typescript-core narrowing patterns', () => {
  function assertNever(value) {
    throw new Error(`Unhandled case: ${JSON.stringify(value)}`)
  }

  function area(shape) {
    switch (shape.kind) {
      case 'circle': return Math.PI * shape.radius ** 2
      case 'square': return shape.side ** 2
      default: return assertNever(shape)
    }
  }

  it('computes area for each discriminated union member', () => {
    expect(area({ kind: 'circle', radius: 2 })).toBeCloseTo(Math.PI * 4)
    expect(area({ kind: 'square', side: 3 })).toBe(9)
  })

  it('throws for an unhandled discriminant', () => {
    expect(() => area({ kind: 'triangle' })).toThrow(/Unhandled case/)
  })
})

describe('typescript-types utility patterns', () => {
  it('groupBy mirrors a generic groupBy<T, K> implementation', () => {
    function groupBy(items, keyFn) {
      const result = {}
      for (const item of items) {
        const key = keyFn(item)
        ;(result[key] ??= []).push(item)
      }
      return result
    }

    const users = [{ role: 'admin' }, { role: 'member' }, { role: 'admin' }]
    const byRole = groupBy(users, (u) => u.role)

    expect(byRole.admin).toHaveLength(2)
    expect(byRole.member).toHaveLength(1)
  })
})

describe('typescript-debug pitfalls (bug vs fix)', () => {
  it('capturing a narrowed value locally survives an async callback', async () => {
    const state = { user: { name: 'Ann' } }

    const readLater = () =>
      new Promise((resolve) => {
        const user = state.user
        setTimeout(() => resolve(user?.name), 0)
      })

    expect(await readLater()).toBe('Ann')
  })

  it('nullish coalescing only substitutes for null/undefined, not falsy values', () => {
    expect(0 ?? 'fallback').toBe(0)
    expect('' ?? 'fallback').toBe('')
    expect(null ?? 'fallback').toBe('fallback')
    expect(undefined ?? 'fallback').toBe('fallback')
  })
})
