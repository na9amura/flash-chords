import { describe, expect, it } from 'vitest'
import { initialState, reducer, sessionTotal } from './session'

function play(answerCorrect: boolean) {
  let s = reducer(initialState, { type: 'start' })
  for (let i = 0; i < 10; i++) {
    const q = s.questions[s.index]
    s = reducer(s, { type: 'answer', answer: answerCorrect ? q : { root: (q.root + 1) % 12, typeId: 'zzz' } })
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
  it('perfect run scores 10 and reaches result', () => {
    const s = play(true)
    expect(s.screen).toBe('result')
    expect(sessionTotal(s)).toBe(10)
  })
  it('all wrong scores 0', () => {
    expect(sessionTotal(play(false))).toBe(0)
  })
  it('goes to review and back; reset discards data', () => {
    let s = play(true)
    s = reducer(s, { type: 'review' })
    expect(s.screen).toBe('review')
    s = reducer(s, { type: 'backToResult' })
    expect(s.screen).toBe('result')
    expect(reducer(s, { type: 'reset' })).toEqual(initialState)
  })
})
