import { describe, expect, it } from 'vitest'
import { CHORD_TYPES } from './chords'
import { generateQuestions } from './questions'

describe('generateQuestions', () => {
  it('returns 10 valid questions by default', () => {
    const qs = generateQuestions()
    expect(qs).toHaveLength(10)
    for (const q of qs) {
      expect(q.root).toBeGreaterThanOrEqual(0)
      expect(q.root).toBeLessThan(12)
      expect(CHORD_TYPES.some((t) => t.id === q.typeId)).toBe(true)
    }
  })
  it('never repeats the same chord consecutively (even with a constant rng)', () => {
    for (const v of [0, 0.5, 0.999999]) {
      const qs = generateQuestions(200, () => v)
      for (let i = 1; i < qs.length; i++) {
        expect(qs[i].root === qs[i - 1].root && qs[i].typeId === qs[i - 1].typeId).toBe(false)
      }
    }
  })
  it('never repeats with the real rng', () => {
    for (let n = 0; n < 200; n++) {
      const qs = generateQuestions()
      for (let i = 1; i < qs.length; i++) {
        expect(qs[i].root === qs[i - 1].root && qs[i].typeId === qs[i - 1].typeId).toBe(false)
      }
    }
  })
})
