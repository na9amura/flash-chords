import { describe, expect, it } from 'vitest'
import { CHORD_TYPES } from './chords'
import { arpeggioSchedule, formatAids, REFERENCE_TONES, rootNoteFrequency } from './aids'
import { midiToFreq } from './voicing'

describe('reference tones', () => {
  it('are A 440Hz and A 220Hz', () => {
    expect(REFERENCE_TONES.map((t) => [t.label, t.freq])).toEqual([
      ['A 440Hz', 440],
      ['A 220Hz', 220],
    ])
  })
})

describe('arpeggioSchedule', () => {
  it('plays C major upward every 0.3s', () => {
    const s = arpeggioSchedule({ root: 0, typeId: 'major' })
    expect(s.map((x) => x.offset)).toEqual([0, 0.3, 0.6].map((v) => expect.closeTo(v, 10)))
    expect(s.map((x) => Math.round(x.freq))).toEqual([131, 165, 196])
  })
  it('has one ascending step per note for every chord type and root', () => {
    for (const t of CHORD_TYPES) {
      for (let root = 0; root < 12; root++) {
        const s = arpeggioSchedule({ root, typeId: t.id })
        expect(s).toHaveLength(t.intervals.length)
        for (let i = 1; i < s.length; i++) {
          expect(s[i].freq).toBeGreaterThan(s[i - 1].freq)
          expect(s[i].offset - s[i - 1].offset).toBeCloseTo(0.3, 10)
        }
        expect(s[0].offset).toBe(0)
      }
    }
  })
})

describe('rootNoteFrequency', () => {
  it('maps roots into C3..B3', () => {
    expect(rootNoteFrequency(0)).toBeCloseTo(midiToFreq(48))
    expect(rootNoteFrequency(11)).toBeCloseTo(midiToFreq(59))
  })
})

describe('formatAids', () => {
  it('is null when nothing was used', () => {
    expect(formatAids({ reference: 0, arpeggio: 0, note: 0 })).toBeNull()
  })
  it('omits zero items', () => {
    expect(formatAids({ reference: 3, arpeggio: 0, note: 5 })).toBe('基準音 3回 / 単音 5回')
    expect(formatAids({ reference: 3, arpeggio: 2, note: 5 })).toBe('基準音 3回 / 分散 2回 / 単音 5回')
  })
})
