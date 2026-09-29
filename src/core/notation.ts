import { Chord, CHORD_TYPES, ChordType, ROOTS } from './chords'
import { chordMidiNotes, BASE_MIDI } from './voicing'

export type Clef = 'treble' | 'bass'
export type NoteFlag = 'ok' | 'missing' | 'extra'

export interface NotatedPitch {
  /** 'C'〜'B' */
  letter: string
  accidental: '' | '#'
  octave: number
  clef: Clef
}

/** MIDI 60(C4) 以上はト音譜表、未満はヘ音譜表 */
export const TREBLE_MIN_MIDI = 60

export function midiToNotation(midi: number): NotatedPitch {
  const name = ROOTS[((midi % 12) + 12) % 12]
  return {
    letter: name[0],
    accidental: name.length > 1 ? '#' : '',
    octave: Math.floor(midi / 12) - 1,
    clef: midi >= TREBLE_MIN_MIDI ? 'treble' : 'bass',
  }
}

export interface StaffNote extends NotatedPitch {
  midi: number
  /** ルートからのインターバル(0〜11) */
  interval: number
  isRoot: boolean
  flag: NoteFlag
  /** 表示用の音名 (例: 'D#') */
  label: string
}

/**
 * コードの構成音を楽譜表示用に変換する。
 * flaggedIntervals に含まれるインターバルの音に flag を付ける(ルート相対で判定)。
 */
export function chordStaffNotes(
  chord: Chord,
  flaggedIntervals: number[] = [],
  flag: Exclude<NoteFlag, 'ok'> = 'missing',
  types: ChordType[] = CHORD_TYPES,
): StaffNote[] {
  return chordMidiNotes(chord, types).map((midi) => {
    const interval = (midi - BASE_MIDI - chord.root) % 12
    const p = midiToNotation(midi)
    return {
      ...p,
      midi,
      interval,
      isRoot: interval === 0,
      flag: flaggedIntervals.includes(interval) ? flag : 'ok',
      label: p.letter + p.accidental,
    }
  })
}
