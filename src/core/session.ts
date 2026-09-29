import { Chord } from './chords'
import { generateQuestions, Rng } from './questions'
import { scoreAnswer, totalScore } from './scoring'

export interface AnswerRecord {
  answer: Chord
  score: number
}

export type Screen = 'home' | 'quiz' | 'result' | 'review'

export interface SessionState {
  screen: Screen
  questions: Chord[]
  answers: AnswerRecord[]
  /** 現在の問題index(0始まり) */
  index: number
  /** 回答済みで正誤表示中(「次へ」待ち) */
  revealed: boolean
}

export type Action =
  | { type: 'start'; rng?: Rng }
  | { type: 'answer'; answer: Chord }
  | { type: 'next' }
  | { type: 'review' }
  | { type: 'backToResult' }
  | { type: 'reset' }

export const initialState: SessionState = {
  screen: 'home',
  questions: [],
  answers: [],
  index: 0,
  revealed: false,
}

export function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'start':
      return {
        screen: 'quiz',
        questions: generateQuestions(undefined, action.rng),
        answers: [],
        index: 0,
        revealed: false,
      }
    case 'answer': {
      if (state.screen !== 'quiz' || state.revealed) return state
      const correct = state.questions[state.index]
      return {
        ...state,
        revealed: true,
        answers: [...state.answers, { answer: action.answer, score: scoreAnswer(correct, action.answer) }],
      }
    }
    case 'next': {
      if (state.screen !== 'quiz' || !state.revealed) return state
      if (state.index + 1 >= state.questions.length) return { ...state, screen: 'result', revealed: false }
      return { ...state, index: state.index + 1, revealed: false }
    }
    case 'review':
      return state.screen === 'result' ? { ...state, screen: 'review' } : state
    case 'backToResult':
      return state.screen === 'review' ? { ...state, screen: 'result' } : state
    case 'reset':
      return initialState
  }
}

export function sessionTotal(state: SessionState): number {
  return totalScore(state.answers.map((a) => a.score))
}
