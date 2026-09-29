import { describe, expect, it } from 'vitest'
import { CHORD_TYPES } from './chords'
import { formatBreakdown, formatScore, intervalSet, scoreAnswer, totalScore } from './scoring'

const ch = (root: number, typeId: string) => ({ root, typeId })
const s = (c: [number, string], a: [number, string]) => scoreAnswer(ch(...c), ch(...a))

describe('scoreAnswer', () => {
  it('perfect = 10 with no penalties', () => {
    const b = s([0, 'major'], [0, 'major'])
    expect(b).toEqual({
      total: 10, rootPenalty: 0, typePenalty: 0, notePenalty: 0, missingIntervals: [], extraIntervals: [],
    })
  })
  it('root only wrong = 6 (notes are compared root-relative)', () => {
    const b = s([0, 'major'], [2, 'major'])
    expect(b.total).toBe(6)
    expect([b.rootPenalty, b.typePenalty, b.notePenalty]).toEqual([4, 0, 0])
  })
  it('C Major vs C minor = 6 (type -3, one substituted note -1)', () => {
    const b = s([0, 'major'], [0, 'minor'])
    expect(b.total).toBe(6)
    expect(b.missingIntervals).toEqual([4])
    expect(b.extraIntervals).toEqual([3])
  })
  it('C Major vs C7 = 6 (extra note only)', () => {
    const b = s([0, 'major'], [0, '7'])
    expect(b.total).toBe(6)
    expect(b.missingIntervals).toEqual([])
    expect(b.extraIntervals).toEqual([10])
  })
  it('C m7 vs C m7b5 = 6', () => {
    const b = s([0, 'm7'], [0, 'm7b5'])
    expect(b.total).toBe(6)
    expect(b.missingIntervals).toEqual([7])
    expect(b.extraIntervals).toEqual([6])
  })
  it('C Major vs D minor = 2', () => {
    expect(s([0, 'major'], [2, 'minor']).total).toBe(2)
  })
  it('C Major vs D m7b5 = 0 (10-4-3-3)', () => {
    const b = s([0, 'major'], [2, 'm7b5'])
    expect(b.notePenalty).toBe(3)
    expect(b.total).toBe(0)
  })
  it('never goes below 0', () => {
    for (const a of CHORD_TYPES) {
      for (const c of CHORD_TYPES) {
        for (const r of [0, 5]) expect(scoreAnswer(ch(0, c.id), ch(r, a.id)).total).toBeGreaterThanOrEqual(0)
      }
    }
  })
  it('add9 uses the ninth as interval 2', () => {
    expect(intervalSet(CHORD_TYPES.find((t) => t.id === 'add9')!)).toEqual([0, 2, 4, 7])
  })
  it('distinct types always have distinct interval sets; same type never costs notes', () => {
    for (const x of CHORD_TYPES) {
      for (const y of CHORD_TYPES) {
        const b = scoreAnswer(ch(0, x.id), ch(7, y.id))
        if (x.id === y.id) expect(b.notePenalty).toBe(0)
        else expect(b.notePenalty).toBeGreaterThanOrEqual(1)
      }
    }
  })
})

describe('totals and formatting', () => {
  it('totals and formats out of 100', () => {
    expect(totalScore([10, 6, 10, 10, 10, 10, 10, 10, 9, 0])).toBe(85)
    expect(formatScore(85, 100)).toBe('85 / 100')
  })
  it('formats breakdown only for penalties', () => {
    expect(formatBreakdown(s([0, 'major'], [0, 'major']))).toBeNull()
    expect(formatBreakdown(s([0, 'major'], [0, 'minor']))).toBe('10 − 3(タイプ) − 1(構成音)')
    expect(formatBreakdown(s([0, 'major'], [2, 'minor']))).toBe('10 − 4(ルート) − 3(タイプ) − 1(構成音)')
    expect(formatBreakdown(s([0, 'major'], [2, 'major']))).toBe('10 − 4(ルート)')
  })
})
