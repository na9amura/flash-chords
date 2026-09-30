import { Dispatch, useEffect, useState } from 'react'
import { chordName } from '../core/chords'
import { formatBreakdown, MAX_SCORE_PER_QUESTION } from '../core/scoring'
import { Action, SessionState } from '../core/session'
import { getDifficulty, typesForDifficulty } from '../core/difficulty'
import { REFERENCE_TONES } from '../core/aids'
import { BASE_MIDI } from '../core/voicing'
import { playArpeggio, playChord, playNote, stopCurrent, toggleReference } from '../audio/player'
import ChordCompare from './ChordCompare'
import { RootGrid, TypeButtons } from './Pickers'

interface Props {
  state: SessionState
  dispatch: Dispatch<Action>
  noteTap: boolean
  onNoteTapChange: (v: boolean) => void
}

export default function Quiz({ state, dispatch, noteTap, onNoteTapChange }: Props) {
  const { index, questions, answers, revealed } = state
  const question = questions[index]
  const types = typesForDifficulty(state.difficultyId)
  const [root, setRoot] = useState<number | null>(null)
  const [typeId, setTypeId] = useState<string | null>(null)
  const [playingRef, setPlayingRef] = useState<number | null>(null)

  // 新しい問題に入ったら選択をリセットして自動再生
  useEffect(() => {
    setRoot(null)
    setTypeId(null)
    void playChord(question)
  }, [index, question])

  // 画面を離れるときは鳴っている音を止める
  useEffect(() => stopCurrent, [])

  const useAid = (kind: 'reference' | 'arpeggio' | 'note') => {
    if (!revealed) dispatch({ type: 'useAid', kind })
  }
  const pickRoot = (r: number) => {
    setRoot(r)
    if (noteTap) {
      void playNote(BASE_MIDI + r)
      useAid('note')
    }
  }
  const pressReference = async (freq: number) => {
    const started = await toggleReference(freq, () => setPlayingRef((p) => (p === freq ? null : p)))
    setPlayingRef(started ? freq : null)
    if (started) useAid('reference')
  }

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

      <div className="replay-row">
        <button className="btn replay" onClick={() => void playChord(question)}>
          🔊 もう一度聞く
        </button>
        <button
          className="btn replay"
          onClick={() => {
            void playArpeggio(question)
            useAid('arpeggio')
          }}
        >
          🎼 分散して聞く
        </button>
      </div>

      <h2>基準音</h2>
      <div className="grid types" role="group" aria-label="基準音">
        {REFERENCE_TONES.map((t) => (
          <button
            key={t.id}
            className={`btn${playingRef === t.freq ? ' selected' : ''}`}
            aria-pressed={playingRef === t.freq}
            onClick={() => void pressReference(t.freq)}
          >
            {playingRef === t.freq ? '■ ' : '▶ '}
            {t.label}
          </button>
        ))}
      </div>

      <h2>ルート</h2>
      <label className="switch" htmlFor="note-tap">
        <input id="note-tap" type="checkbox" checked={noteTap} onChange={(e) => onNoteTapChange(e.target.checked)} />
        <span>音名をタップすると単音を鳴らす</span>
      </label>
      <RootGrid value={root} onChange={pickRoot} disabled={revealed} />
      <h2>タイプ</h2>
      <TypeButtons value={typeId} onChange={setTypeId} disabled={revealed} types={types} />

      {record ? (
        <div
          className={`feedback ${record.breakdown.total === MAX_SCORE_PER_QUESTION ? 'sok' : record.breakdown.total === 0 ? 'sng' : 'shalf'}`}
          role="status"
        >
          <strong>今回の得点: {record.breakdown.total} / {MAX_SCORE_PER_QUESTION}</strong>
          {formatBreakdown(record.breakdown) && <div className="muted">{formatBreakdown(record.breakdown)}</div>}
          <div>正解: {chordName(question)}</div>
          <div>あなたの回答: {chordName(record.answer)}</div>
        </div>
      ) : null}
      {record ? (
        <ChordCompare correct={question} answer={record.answer} breakdown={record.breakdown} />
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
