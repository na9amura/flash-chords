import { Dispatch, useState } from 'react'
import { chordName } from '../core/chords'
import { getDifficulty } from '../core/difficulty'
import { formatBreakdown, MAX_SCORE_PER_QUESTION } from '../core/scoring'
import { Action, SessionState } from '../core/session'
import { playChord } from '../audio/player'
import ChordCompare from './ChordCompare'

export default function Review({ state, dispatch }: { state: SessionState; dispatch: Dispatch<Action> }) {
  const [open, setOpen] = useState<Set<number>>(new Set())
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

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
          const same = a.breakdown.total === MAX_SCORE_PER_QUESTION
          const detail = formatBreakdown(a.breakdown)
          const isOpen = open.has(i)
          return (
            <li key={i} className="card">
              <div className="card-head">
                <span>Q{i + 1}</span>
                <span className="pts">
                  {a.breakdown.total} / {MAX_SCORE_PER_QUESTION} 点
                </span>
              </div>
              {detail && <div className="muted">{detail}</div>}
              <div>正解: <strong>{chordName(q)}</strong></div>
              <div>回答: <strong>{chordName(a.answer)}</strong></div>
              <div className="actions">
                <button className="btn" onClick={() => void playChord(q)}>▶ 正解</button>
                <button className="btn" disabled={same} onClick={() => void playChord(a.answer)}>
                  ▶ 自分の回答
                </button>
              </div>
              <button className="btn" aria-expanded={isOpen} onClick={() => toggle(i)}>
                {isOpen ? '楽譜を閉じる' : '楽譜を見る'}
              </button>
              {isOpen && <ChordCompare correct={q} answer={a.answer} breakdown={a.breakdown} showPlay={false} />}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
