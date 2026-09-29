import { describe, expect, it } from 'vitest'
import { formatScore, scoreAnswer, totalScore } from './scoring'

const c = { root: 0, typeId: 'major' }

describe('scoring', () => {
  it('both correct = 1', () => expect(scoreAnswer(c, { ...c })).toBe(1))
  it('root only = 0.5', () => expect(scoreAnswer(c, { root: 0, typeId: 'minor' })).toBe(0.5))
  it('type only = 0.5', () => expect(scoreAnswer(c, { root: 2, typeId: 'major' })).toBe(0.5))
  it('both wrong = 0', () => expect(scoreAnswer(c, { root: 2, typeId: 'minor' })).toBe(0))
  it('totals and formats', () => {
    expect(totalScore([1, 0.5, 1, 0, 1, 1, 1, 1, 1, 1])).toBe(8.5)
    expect(formatScore(8.5, 10)).toBe('8.5 / 10')
    expect(formatScore(10, 10)).toBe('10 / 10')
  })
})
