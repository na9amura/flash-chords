import { describe, expect, it } from 'vitest'
import { scoreAnswer } from './scoring'
import { summarize } from './stats'

const ch = (root: number, typeId: string) => ({ root, typeId })
const rec = (c: ReturnType<typeof ch>, a: ReturnType<typeof ch>) => ({ breakdown: scoreAnswer(c, a) })

describe('summarize', () => {
  it('counts root and type correctness', () => {
    const qs = [ch(0, 'major'), ch(2, 'minor'), ch(4, 'm7')]
    const as = [rec(qs[0], ch(0, 'major')), rec(qs[1], ch(3, 'minor')), rec(qs[2], ch(4, 'm7b5'))]
    const s = summarize(qs, as)
    expect(s).toMatchObject({ total: 3, rootCorrect: 2, typeCorrect: 2 })
  })
  it('lists missed types most-missed first, ties in CHORD_TYPES order', () => {
    const qs = [ch(0, 'm7b5'), ch(1, 'm7b5'), ch(2, 'sus4'), ch(3, 'minor'), ch(4, 'sus4'), ch(5, 'major')]
    const wrong = { root: 0, typeId: 'aug' }
    const as = [
      rec(qs[0], wrong), rec(qs[1], wrong), rec(qs[2], wrong),
      rec(qs[3], wrong), rec(qs[4], ch(4, 'sus4')), rec(qs[5], ch(5, 'major')),
    ]
    expect(summarize(qs, as).typeMisses).toEqual([
      { typeId: 'm7b5', missed: 2, asked: 2 },
      { typeId: 'minor', missed: 1, asked: 1 },
      { typeId: 'sus4', missed: 1, asked: 2 },
    ])
  })
  it('returns no misses when all types are right', () => {
    const qs = [ch(0, 'major')]
    expect(summarize(qs, [rec(qs[0], ch(5, 'major'))]).typeMisses).toEqual([])
  })
})
