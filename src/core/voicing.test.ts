import { describe, expect, it } from 'vitest'
import { chordFrequencies, chordMidiNotes, midiToFreq } from './voicing'

describe('voicing', () => {
  it('C major = C3 E3 G3', () => {
    expect(chordMidiNotes({ root: 0, typeId: 'major' })).toEqual([48, 52, 55])
  })
  it('B m7 is rooted at B3 (59)', () => {
    expect(chordMidiNotes({ root: 11, typeId: 'm7' })).toEqual([59, 62, 66, 69])
  })
  it('add9 includes the ninth above the root', () => {
    expect(chordMidiNotes({ root: 0, typeId: 'add9' })).toEqual([48, 52, 55, 62])
  })
  it('converts midi to frequency', () => {
    expect(midiToFreq(69)).toBeCloseTo(440)
    expect(midiToFreq(57)).toBeCloseTo(220)
  })
  it('returns one frequency per note', () => {
    expect(chordFrequencies({ root: 0, typeId: 'dim' })).toHaveLength(3)
  })
})
