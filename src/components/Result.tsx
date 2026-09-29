import { Dispatch } from 'react'
import { Action, SessionState, sessionTotal } from '../core/session'
import { getDifficulty } from '../core/difficulty'
import { formatScore } from '../core/scoring'

interface Props {
  state: SessionState
  dispatch: Dispatch<Action>
}

export default function Result({ state, dispatch }: Props) {
  return (
    <section className="center">
      <h1>結果</h1>
      <p className="muted">難易度: {getDifficulty(state.difficultyId).label}</p>
      <p className="score">{formatScore(sessionTotal(state), state.questions.length)}</p>
      <button className="btn primary big" onClick={() => dispatch({ type: 'review' })}>
        復習する
      </button>
      <button className="btn big" onClick={() => dispatch({ type: 'reset' })}>
        新しいセッション
      </button>
    </section>
  )
}
