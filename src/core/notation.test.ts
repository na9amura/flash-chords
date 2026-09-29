import { describe, expect, it } from 'vitest'
import { CHORD_TYPES } from './chords'
import { chordStaffNotes, midiToNotation } from './notation'

describe('midiToNotation', () => {
  it('maps midi to letter/accidental/octave/clef', () => {
    expect(midiToNotation(48)).toEqual({ letter: 'C', accidental: '', octave: 3, clef: 'bass' })
    expect(midiToNotation(59)).toEqual({ letter: 'B', accidental: '', octave: 3, clef: 'bass' })
    expect(midiToNotation(60)).toEqual({ letter: 'C', accidental: '', octave: 4, clef: 'treble' })
    expect(midiToNotation(61)).toEqual({ letter: 'C', accidental: '#', octave: 4, clef: 'treble' })
  })
})

describe('chordStaffNotes', () => {
  it('converts every note of every chord type at every root', () => {
    for (const t of CHORD_TYPES) {
      for (let root = 0; root < 12; root++) {
        const notes = chordStaffNotes({ root, typeId: t.id })
        expect(notes).toHaveLength(t.intervals.length)
        expect(notes[0].isRoot).toBe(true)
        for (const n of notes) expect(n.label).toMatch(/^[A-G]#?$/)
      }
    }
  })
  it('C major: C3 E3 G3 on the bass clef', () => {
    const n = chordStaffNotes({ root: 0, typeId: 'major' })
    expect(n.map((x) => `${x.label}${x.octave}/${x.clef}`)).toEqual(['C3/bass', 'E3/bass', 'G3/bass'])
  })
  it('splits across clefs and flags by root-relative interval', () => {
    // A m7: A3(57) C4(60) E4(64) G4(67)
    const n = chordStaffNotes({ root: 9, typeId: 'm7' }, [3, 10], 'extra')
    expect(n.map((x) => x.clef)).toEqual(['bass', 'treble', 'treble', 'treble'])
    expect(n.map((x) => x.flag)).toEqual(['ok', 'extra', 'ok', 'extra'])
  })
  it('add9 ninth is normalised to interval 2', () => {
    const n = chordStaffNotes({ root: 0, typeId: 'add9' }, [2], 'missing')
    expect(n.find((x) => x.flag === 'missing')?.label).toBe('D')
  })
})
