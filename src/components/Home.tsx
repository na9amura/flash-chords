export default function Home({ onStart }: { onStart: () => void }) {
  return (
    <section className="center">
      <h1>Flash Chords</h1>
      <p className="muted">コードを聞いて、ルートとタイプを当てよう。1セッション10問。</p>
      <button className="btn primary big" onClick={onStart}>
        セッション開始
      </button>
    </section>
  )
}
