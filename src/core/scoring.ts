import { Chord } from './chords'

export function scoreAnswer(correct: Chord, answer: Chord): number {
  const r = correct.root === answer.root
  const t = correct.typeId === answer.typeId
  if (r && t) return 1
  if (r || t) return 0.5
  return 0
}

export function totalScore(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0)
}

export function formatScore(total: number, max: number): string {
  return `${total} / ${max}`
}
