import { Dispatch } from 'react'
import { CHORD_TYPES } from '../core/chords'
import { getDifficulty } from '../core/difficulty'
import { formatScore, MAX_SCORE_PER_QUESTION } from '../core/scoring'
import { Action, SessionState, sessionTotal } from '../core/session'
import { formatAids } from '../core/aids'
import { summarize } from '../core/stats'

interface Props {
  state: SessionState
  dispatch: Dispatch<Action>
}

export default function Result({ state, dispatch }: Props) {
  const max = state.questions.length * MAX_SCORE_PER_QUESTION
  const stats = summarize(state.questions, state.answers)
  const aids = formatAids(state.aids)
  const label = (id: string) => CHORD_TYPES.find((t) => t.id === id)?.label ?? id

  return (
    <section className="center">
      <h1>結果</h1>
      <p className="muted">難易度: {getDifficulty(state.difficultyId).label}</p>
      <p className="score">{formatScore(sessionTotal(state), max)}</p>
      <div className="stats">
        <div>
          ルート <strong>{stats.rootCorrect} / {stats.total}</strong>
        </div>
        <div>
          タイプ <strong>{stats.typeCorrect} / {stats.total}</strong>
        </div>
        {stats.typeMisses.length === 0 ? (
          <p className="muted">タイプはすべて正解でした</p>
        ) : (
          <>
            <h2>間違えたタイプ</h2>
            <ul className="misses">
              {stats.typeMisses.map((m) => (
                <li key={m.typeId}>
                  <span>{label(m.typeId)}</span>
                  <strong>{m.missed} / {m.asked}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      {aids && <p className="muted">補助の使用: {aids}</p>}
      <button className="btn primary big" onClick={() => dispatch({ type: 'review' })}>
        復習する
      </button>
      <button className="btn big" onClick={() => dispatch({ type: 'reset' })}>
        新しいセッション
      </button>
    </section>
  )
}
