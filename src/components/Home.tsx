import { useState } from 'react'
import { DIFFICULTIES, typesForDifficulty } from '../core/difficulty'

interface Props {
  initialDifficultyId: string
  onStart: (difficultyId: string) => void
}

export default function Home({ initialDifficultyId, onStart }: Props) {
  const [difficultyId, setDifficultyId] = useState(initialDifficultyId)

  return (
    <section className="center">
      <h1>Flash Chords</h1>
      <p className="muted">コードを聞いて、ルートとタイプを当てよう。1セッション10問。</p>
      <h2>難易度</h2>
      <div className="difficulties" role="group" aria-label="難易度">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            className={`btn difficulty${d.id === difficultyId ? ' selected' : ''}`}
            aria-pressed={d.id === difficultyId}
            onClick={() => setDifficultyId(d.id)}
          >
            <strong>{d.label}</strong>
            <small>{d.typeIds ? typesForDifficulty(d.id).map((t) => t.label).join(' / ') : '全タイプ'}</small>
          </button>
        ))}
      </div>
      <button className="btn primary big" onClick={() => onStart(difficultyId)}>
        セッション開始
      </button>
    </section>
  )
}
