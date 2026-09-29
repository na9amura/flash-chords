// コード定義。タイプを追加するときは CHORD_TYPES に1行足すだけでよい。
export interface ChordType {
  id: string
  label: string
  /** ルートからの半音インターバル(ルート=0を含む) */
  intervals: number[]
}

export const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export const CHORD_TYPES: ChordType[] = [
  { id: 'major', label: 'Major', intervals: [0, 4, 7] },
  { id: 'minor', label: 'minor', intervals: [0, 3, 7] },
  { id: '7', label: '7', intervals: [0, 4, 7, 10] },
  { id: 'maj7', label: 'maj7', intervals: [0, 4, 7, 11] },
  { id: 'm7', label: 'm7', intervals: [0, 3, 7, 10] },
  { id: 'm7b5', label: 'm7b5', intervals: [0, 3, 6, 10] },
  { id: 'dim', label: 'dim', intervals: [0, 3, 6] },
  { id: 'aug', label: 'aug', intervals: [0, 4, 8] },
  { id: 'sus4', label: 'sus4', intervals: [0, 5, 7] },
  { id: 'add9', label: 'add9', intervals: [0, 4, 7, 14] },
]

export interface Chord {
  /** 0〜11 (C=0) */
  root: number
  typeId: string
}

export function getChordType(id: string, types: ChordType[] = CHORD_TYPES): ChordType {
  const t = types.find((x) => x.id === id)
  if (!t) throw new Error(`Unknown chord type: ${id}`)
  return t
}

export function chordName(chord: Chord, types: ChordType[] = CHORD_TYPES): string {
  const t = getChordType(chord.typeId, types)
  return `${ROOTS[chord.root]} ${t.label}`
}
