import { Chord, CHORD_TYPES, ChordType, getChordType } from './chords'

/** ルートは C3(MIDI 48)〜B3(59) に置く */
export const BASE_MIDI = 48

export function chordMidiNotes(chord: Chord, types: ChordType[] = CHORD_TYPES): number[] {
  const t = getChordType(chord.typeId, types)
  return t.intervals.map((i) => BASE_MIDI + chord.root + i)
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function chordFrequencies(chord: Chord, types: ChordType[] = CHORD_TYPES): number[] {
  return chordMidiNotes(chord, types).map(midiToFreq)
}
