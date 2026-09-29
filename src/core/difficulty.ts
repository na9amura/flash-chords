import { CHORD_TYPES, ChordType } from './chords'

export interface Difficulty {
  id: string
  label: string
  /** 出題対象のタイプID。省略すると全タイプ */
  typeIds?: string[]
}

// 難易度定義。追加・変更はこの配列を編集する。
export const DIFFICULTIES: Difficulty[] = [
  { id: 'beginner', label: '入門', typeIds: ['major', 'minor'] },
  { id: 'intermediate1', label: '中級1', typeIds: ['7', 'maj7', 'm7', 'm7b5'] },
  { id: 'intermediate2', label: '中級2', typeIds: ['dim', 'aug', 'sus4', 'add9'] },
  { id: 'advanced', label: '上級1' },
]

export const DEFAULT_DIFFICULTY_ID = 'beginner'

export function getDifficulty(id: string, list: Difficulty[] = DIFFICULTIES): Difficulty {
  const d = list.find((x) => x.id === id)
  if (!d) throw new Error(`Unknown difficulty: ${id}`)
  return d
}

export function typesForDifficulty(
  id: string,
  list: Difficulty[] = DIFFICULTIES,
  types: ChordType[] = CHORD_TYPES,
): ChordType[] {
  const { typeIds } = getDifficulty(id, list)
  return typeIds ? types.filter((t) => typeIds.includes(t.id)) : types
}
