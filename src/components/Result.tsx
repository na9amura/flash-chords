import { Dispatch } from 'react'
import { Action, SessionState, sessionTotal } from '../core/session'
import { formatScore } from '../core/scoring'

interface Props {
  state: SessionState
  dispatch: Dispatch<Action>
  onNew: () => void
}

export default function Result({ state, dispatch, onNew }: Props) {
  return (
    <section className="center">
      <h1>結果</h1>
      <p className="score">{formatScore(sessionTotal(state), state.questions.length)}</p>
      <button className="btn primary big" onClick={() => dispatch({ type: 'review' })}>
        復習する
      </button>
      <button className="btn big" onClick={onNew}>
        新しいセッション
      </button>
    </section>
  )
}
