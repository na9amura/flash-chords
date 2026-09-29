import { lazy, Suspense } from 'react'
import { Chord, chordName } from '../core/chords'
import { chordStaffNotes, StaffNote } from '../core/notation'
import { ScoreBreakdown } from '../core/scoring'
import { playArpeggio, playChord, playNote } from '../audio/player'
// VexFlow は大きいので、楽譜を初めて表示するときに読み込む
const Staff = lazy(() => import('./Staff'))

interface PanelProps {
  title: string
  chord: Chord
  notes: StaffNote[]
  rootMismatch?: boolean
  showPlay: boolean
}

function Panel({ title, chord, notes, rootMismatch, showPlay }: PanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">
        <strong>
          {title}: {chordName(chord)}
        </strong>
        <div className="panel-actions">
          {showPlay && (
            <button className="btn" onClick={() => void playChord(chord)}>
              ▶ 再生
            </button>
          )}
          <button className="btn" onClick={() => void playArpeggio(chord)}>
            ▶ 分散
          </button>
        </div>
      </div>
      <Suspense fallback={<div className="staff staff-loading">楽譜を読み込み中…</div>}>
        <Staff notes={notes} />
      </Suspense>
      <ul className="note-labels">
        {notes.map((n) => (
          <li key={n.midi}>
            <button
              className={`note ${n.flag}`}
              aria-label={`${n.label}を鳴らす`}
              onClick={() => void playNote(n.midi)}
            >
              {n.label}
              {n.flag === 'missing' && <small>不足</small>}
              {n.flag === 'extra' && <small>余分</small>}
              {n.isRoot && rootMismatch && <small>ルート違い</small>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface Props {
  correct: Chord
  answer: Chord
  breakdown: ScoreBreakdown
  showPlay?: boolean
}

/** 正解コードと回答コードの構成音を楽譜で並べる。完全一致なら1つだけ表示 */
export default function ChordCompare({ correct, answer, breakdown, showPlay = true }: Props) {
  const same = correct.root === answer.root && correct.typeId === answer.typeId
  const correctNotes = chordStaffNotes(correct, breakdown.missingIntervals, 'missing')
  const answerNotes = chordStaffNotes(answer, breakdown.extraIntervals, 'extra')

  return (
    <div className="compare">
      {same ? (
        <Panel title="正解（回答と一致）" chord={correct} notes={correctNotes} showPlay={showPlay} />
      ) : (
        <>
          <Panel title="正解" chord={correct} notes={correctNotes} showPlay={showPlay} />
          <Panel
            title="あなたの回答"
            chord={answer}
            notes={answerNotes}
            rootMismatch={breakdown.rootPenalty > 0}
            showPlay={showPlay}
          />
        </>
      )}
    </div>
  )
}
