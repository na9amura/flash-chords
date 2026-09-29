import { ChordType, CHORD_TYPES, ROOTS } from '../core/chords'

interface Props<T> {
  value: T | null
  onChange: (v: T) => void
  disabled?: boolean
}

export function RootGrid({ value, onChange, disabled }: Props<number>) {
  return (
    <div className="grid roots" role="group" aria-label="ルート">
      {ROOTS.map((r, i) => (
        <button
          key={r}
          className={`btn${value === i ? ' selected' : ''}`}
          aria-pressed={value === i}
          disabled={disabled}
          onClick={() => onChange(i)}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

export function TypeButtons({ value, onChange, disabled, types = CHORD_TYPES }: Props<string> & { types?: ChordType[] }) {
  return (
    <div className="grid types" role="group" aria-label="コードタイプ">
      {types.map((t) => (
        <button
          key={t.id}
          className={`btn${value === t.id ? ' selected' : ''}`}
          aria-pressed={value === t.id}
          disabled={disabled}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
