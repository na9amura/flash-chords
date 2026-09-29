import { Dispatch, useEffect, useState } from 'react'
import { chordName } from '../core/chords'
import { Action, SessionState } from '../core/session'
import { getDifficulty, typesForDifficulty } from '../core/difficulty'
import { playChord } from '../audio/player'
import { RootGrid, TypeButtons } from './Pickers'

export default function Quiz({ state, dispatch }: { state: SessionState; dispatch: Dispatch<Action> }) {
  const { index, questions, answers, revealed } = state
  const question = questions[index]
  const types = typesForDifficulty(state.difficultyId)
  const [root, setRoot] = useState<number | null>(null)
  const [typeId, setTypeId] = useState<string | null>(null)

  // 新しい問題に入ったら選択をリセットして自動再生
  useEffect(() => {
    setRoot(null)
    setTypeId(null)
    void playChord(question)
  }, [index, question])

  const record = revealed ? answers[index] : null
  const submit = () => {
    if (root === null || typeId === null) return
    dispatch({ type: 'answer', answer: { root, typeId } })
  }

  return (
    <section className="quiz">
      <header className="progress">
        <span>
          {index + 1} / {questions.length}
        </span>
        <span className="muted">{getDifficulty(state.difficultyId).label}</span>
        <progress value={index + (revealed ? 1 : 0)} max={questions.length} />
      </header>

      <button className="btn replay" onClick={() => void playChord(question)}>
        🔊 もう一度聞く
      </button>

      <h2>ルート</h2>
      <RootGrid value={root} onChange={setRoot} disabled={revealed} />
      <h2>タイプ</h2>
      <TypeButtons value={typeId} onChange={setTypeId} disabled={revealed} types={types} />

      {record ? (
        <div className={`feedback s${record.score === 1 ? 'ok' : record.score === 0 ? 'ng' : 'half'}`} role="status">
          <strong>
            {record.score === 1 ? '正解！' : record.score === 0.5 ? '惜しい！ (0.5点)' : '不正解'}
          </strong>
          <div>正解: {chordName(question)}</div>
          <div>あなたの回答: {chordName(record.answer)}</div>
        </div>
      ) : null}

      <div className="footer">
        {revealed ? (
          <button className="btn primary big" onClick={() => dispatch({ type: 'next' })}>
            {index + 1 >= questions.length ? '結果を見る' : '次へ'}
          </button>
        ) : (
          <button className="btn primary big" disabled={root === null || typeId === null} onClick={submit}>
            回答する
          </button>
        )}
      </div>
    </section>
  )
}
