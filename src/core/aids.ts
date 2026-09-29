import { Chord, CHORD_TYPES, ChordType } from './chords'
import { BASE_MIDI, chordFrequencies, midiToFreq } from './voicing'

export interface ReferenceTone {
  id: string
  label: string
  freq: number
}

// 基準音。A4(MIDI 69)=440Hz、A3(MIDI 57)=220Hz
export const REFERENCE_TONES: ReferenceTone[] = [
  { id: 'a4', label: 'A 440Hz', freq: midiToFreq(69) },
  { id: 'a3', label: 'A 220Hz', freq: midiToFreq(57) },
]

export const ARPEGGIO_STEP_SEC = 0.3

export interface ArpeggioStep {
  freq: number
  /** 再生開始からの発音タイミング(秒) */
  offset: number
}

/** 構成音を低い音から順に、一定間隔で鳴らすためのスケジュール */
export function arpeggioSchedule(
  chord: Chord,
  stepSec: number = ARPEGGIO_STEP_SEC,
  types: ChordType[] = CHORD_TYPES,
): ArpeggioStep[] {
  return [...chordFrequencies(chord, types)]
    .sort((a, b) => a - b)
    .map((freq, i) => ({ freq, offset: i * stepSec }))
}

/** 音名タップで鳴らす単音(出題と同じ C3〜B3 の音域) */
export function rootNoteFrequency(root: number): number {
  return midiToFreq(BASE_MIDI + root)
}

export type AidKind = 'reference' | 'arpeggio' | 'note'

export interface AidCounts {
  reference: number
  arpeggio: number
  note: number
}

export const emptyAids: AidCounts = { reference: 0, arpeggio: 0, note: 0 }

const AID_LABELS: Record<AidKind, string> = { reference: '基準音', arpeggio: '分散', note: '単音' }

/** 「基準音 3回 / 分散 2回」形式。使用がなければ null */
export function formatAids(aids: AidCounts): string | null {
  const parts = (Object.keys(AID_LABELS) as AidKind[])
    .filter((k) => aids[k] > 0)
    .map((k) => `${AID_LABELS[k]} ${aids[k]}回`)
  return parts.length ? parts.join(' / ') : null
}
