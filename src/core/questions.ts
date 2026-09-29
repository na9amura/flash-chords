import { Chord, CHORD_TYPES, ChordType } from './chords'

export const QUESTIONS_PER_SESSION = 10

export type Rng = () => number

export function generateQuestions(
  count: number = QUESTIONS_PER_SESSION,
  rng: Rng = Math.random,
  types: ChordType[] = CHORD_TYPES,
): Chord[] {
  const result: Chord[] = []
  const total = 12 * types.length
  if (total < 2) throw new Error('Need at least 2 distinct chords')
  let prev = -1
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(rng() * total) % total
    if (idx === prev) idx = (idx + 1 + Math.floor(rng() * (total - 1))) % total
    prev = idx
    result.push({ root: Math.floor(idx / types.length), typeId: types[idx % types.length].id })
  }
  return result
}
