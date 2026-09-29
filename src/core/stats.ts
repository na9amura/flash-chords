import { Chord, CHORD_TYPES, ChordType } from './chords'
import { AnswerRecord } from './session'

export interface TypeMiss {
  typeId: string
  missed: number
  asked: number
}

export interface Summary {
  total: number
  rootCorrect: number
  typeCorrect: number
  /** 出題タイプごとの間違い。誤りのあるタイプのみ、多い順(同数はCHORD_TYPES順) */
  typeMisses: TypeMiss[]
}

export function summarize(
  questions: Chord[],
  answers: Pick<AnswerRecord, 'breakdown'>[],
  types: ChordType[] = CHORD_TYPES,
): Summary {
  const per = new Map<string, TypeMiss>()
  let rootCorrect = 0
  let typeCorrect = 0
  answers.forEach((a, i) => {
    const typeId = questions[i].typeId
    const entry = per.get(typeId) ?? { typeId, missed: 0, asked: 0 }
    entry.asked++
    if (a.breakdown.rootPenalty === 0) rootCorrect++
    if (a.breakdown.typePenalty === 0) typeCorrect++
    else entry.missed++
    per.set(typeId, entry)
  })
  const order = (id: string) => types.findIndex((t) => t.id === id)
  const typeMisses = [...per.values()]
    .filter((m) => m.missed > 0)
    .sort((x, y) => y.missed - x.missed || order(x.typeId) - order(y.typeId))
  return { total: answers.length, rootCorrect, typeCorrect, typeMisses }
}
