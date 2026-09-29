import { describe, expect, it } from 'vitest'
import { CHORD_TYPES, chordName, getChordType, ROOTS } from './chords'

describe('chords', () => {
  it('has 12 roots and 10 initial types with unique ids', () => {
    expect(ROOTS).toHaveLength(12)
    expect(CHORD_TYPES).toHaveLength(10)
    expect(new Set(CHORD_TYPES.map((t) => t.id)).size).toBe(10)
  })
  it('every type starts at 0 and is ascending', () => {
    for (const t of CHORD_TYPES) {
      expect(t.intervals[0]).toBe(0)
      expect([...t.intervals].sort((a, b) => a - b)).toEqual(t.intervals)
    }
  })
  it('names chords', () => {
    expect(chordName({ root: 1, typeId: 'm7b5' })).toBe('C# m7b5')
  })
  it('throws on unknown type', () => {
    expect(() => getChordType('nope')).toThrow()
  })
})
