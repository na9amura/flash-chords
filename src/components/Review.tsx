import { Dispatch } from 'react'
import { chordName } from '../core/chords'
import { Action, SessionState } from '../core/session'
import { getDifficulty } from '../core/difficulty'
import { playChord } from '../audio/player'

export default function Review({ state, dispatch }: { state: SessionState; dispatch: Dispatch<Action> }) {
  return (
    <section className="review">
      <header className="review-head">
        <button className="btn" onClick={() => dispatch({ type: 'backToResult' })}>
          ← 結果へ
        </button>
        <h1>復習</h1>
        <span className="muted">{getDifficulty(state.difficultyId).label}</span>
      </header>
      <ol className="list">
        {state.questions.map((q, i) => {
          const a = state.answers[i]
          const same = a.score === 1
          return (
            <li key={i} className="card">
              <div className="card-head">
                <span>Q{i + 1}</span>
                <span className="pts">{a.score} 点</span>
              </div>
              <div>正解: <strong>{chordName(q)}</strong></div>
              <div>回答: <strong>{chordName(a.answer)}</strong></div>
              <div className="actions">
                <button className="btn" onClick={() => void playChord(q)}>▶ 正解</button>
                <button className="btn" disabled={same} onClick={() => void playChord(a.answer)}>
                  ▶ 自分の回答
                </button>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
