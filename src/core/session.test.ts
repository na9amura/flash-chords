import { describe, expect, it } from 'vitest'
import { typesForDifficulty } from './difficulty'
import { initialState, reducer, sessionTotal } from './session'

function play(answerCorrect: boolean) {
  let s = reducer(initialState, { type: 'start' })
  for (let i = 0; i < 10; i++) {
    const q = s.questions[s.index]
    s = reducer(s, { type: 'answer', answer: answerCorrect ? q : { root: (q.root + 1) % 12, typeId: q.typeId === 'm7b5' ? 'major' : 'm7b5' } })
    s = reducer(s, { type: 'next' })
  }
  return s
}

describe('session reducer', () => {
  it('starts a quiz with 10 questions', () => {
    const s = reducer(initialState, { type: 'start' })
    expect(s.screen).toBe('quiz')
    expect(s.questions).toHaveLength(10)
  })
  it('ignores double answers and premature next', () => {
    let s = reducer(initialState, { type: 'start' })
    expect(reducer(s, { type: 'next' })).toBe(s)
    s = reducer(s, { type: 'answer', answer: s.questions[0] })
    expect(reducer(s, { type: 'answer', answer: s.questions[0] })).toBe(s)
    expect(s.answers).toHaveLength(1)
  })
  it('perfect run scores 100 and reaches result', () => {
    const s = play(true)
    expect(s.screen).toBe('result')
    expect(sessionTotal(s)).toBe(100)
  })
  it('stores the score breakdown with each answer', () => {
    let s = reducer(initialState, { type: 'start' })
    const q = s.questions[0]
    s = reducer(s, { type: 'answer', answer: { root: (q.root + 1) % 12, typeId: q.typeId } })
    expect(s.answers[0].breakdown).toMatchObject({ total: 6, rootPenalty: 4, typePenalty: 0, notePenalty: 0 })
  })
  it('a run of worst answers never scores below 0', () => {
    expect(sessionTotal(play(false))).toBeGreaterThanOrEqual(0)
  })
  it('goes to review and back; reset discards data', () => {
    let s = play(true)
    s = reducer(s, { type: 'review' })
    expect(s.screen).toBe('review')
    s = reducer(s, { type: 'backToResult' })
    expect(s.screen).toBe('result')
    expect(reducer(s, { type: 'reset' })).toEqual(initialState)
  })
  it('start with a difficulty only asks that difficulty\'s types', () => {
    for (const d of ['beginner', 'intermediate1', 'intermediate2', 'advanced']) {
      const s = reducer(initialState, { type: 'start', difficultyId: d })
      const allowed = typesForDifficulty(d).map((t) => t.id)
      expect(s.difficultyId).toBe(d)
      expect(s.questions).toHaveLength(10)
      expect(s.questions.every((q) => allowed.includes(q.typeId))).toBe(true)
    }
  })
  it('reset clears questions/answers but keeps the last difficulty selected', () => {
    const s = reducer(reducer(initialState, { type: 'start', difficultyId: 'intermediate1' }), { type: 'reset' })
    expect(s).toEqual({ ...initialState, difficultyId: 'intermediate1' })
  })
})
