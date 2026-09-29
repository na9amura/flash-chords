import { Chord, CHORD_TYPES, ChordType, getChordType } from './chords'

export const MAX_SCORE_PER_QUESTION = 10
export const ROOT_PENALTY = 4
export const TYPE_PENALTY = 3
export const NOTE_PENALTY = 1

export interface ScoreBreakdown {
  /** 0〜10 */
  total: number
  rootPenalty: number
  typePenalty: number
  /** max(不足, 余分) */
  notePenalty: number
  /** 正解にあって回答にないインターバル(ルート相対、0〜11) */
  missingIntervals: number[]
  /** 回答にあって正解にないインターバル */
  extraIntervals: number[]
}

/** コードタイプのインターバル集合(12で割った余り、重複なし、昇順) */
export function intervalSet(type: ChordType): number[] {
  return [...new Set(type.intervals.map((i) => i % 12))].sort((a, b) => a - b)
}

export function scoreAnswer(correct: Chord, answer: Chord, types: ChordType[] = CHORD_TYPES): ScoreBreakdown {
  const a = intervalSet(getChordType(correct.typeId, types))
  const b = intervalSet(getChordType(answer.typeId, types))
  const missingIntervals = a.filter((i) => !b.includes(i))
  const extraIntervals = b.filter((i) => !a.includes(i))

  const rootPenalty = correct.root === answer.root ? 0 : ROOT_PENALTY
  const typePenalty = correct.typeId === answer.typeId ? 0 : TYPE_PENALTY
  const notePenalty = Math.max(missingIntervals.length, extraIntervals.length) * NOTE_PENALTY

  const total = Math.max(0, MAX_SCORE_PER_QUESTION - rootPenalty - typePenalty - notePenalty)
  return { total, rootPenalty, typePenalty, notePenalty, missingIntervals, extraIntervals }
}

export function totalScore(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0)
}

export function formatScore(total: number, max: number): string {
  return `${total} / ${max}`
}

/** 「10 − 3(タイプ) − 1(構成音)」形式の内訳。減点がなければ null */
export function formatBreakdown(b: ScoreBreakdown): string | null {
  const parts: string[] = []
  if (b.rootPenalty) parts.push(`${b.rootPenalty}(ルート)`)
  if (b.typePenalty) parts.push(`${b.typePenalty}(タイプ)`)
  if (b.notePenalty) parts.push(`${b.notePenalty}(構成音)`)
  if (parts.length === 0) return null
  return `${MAX_SCORE_PER_QUESTION} − ${parts.join(' − ')}`
}
