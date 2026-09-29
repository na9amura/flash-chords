import { useEffect, useRef, useState } from 'react'
import { Accidental, Formatter, Renderer, Stave, StaveConnector, StaveNote, Voice } from 'vexflow'
import { Clef, StaffNote } from '../core/notation'

const WIDTH = 240
const HEIGHT = 250
const TREBLE_Y = 30
const BASS_Y = 130

function cssColor(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

/** テーマ(OS設定 / data-theme)が変わったら値を更新して再描画させる */
function useThemeTick(): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const bump = () => setTick((t) => t + 1)
    mq.addEventListener('change', bump)
    const mo = new MutationObserver(bump)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mq.removeEventListener('change', bump)
      mo.disconnect()
    }
  }, [])
  return tick
}

function makeNote(clef: Clef, notes: StaffNote[], colors: Record<string, string>): StaveNote {
  if (notes.length === 0) {
    return new StaveNote({ clef, keys: [clef === 'treble' ? 'b/4' : 'd/3'], duration: 'wr' })
  }
  const sorted = [...notes].sort((a, b) => a.midi - b.midi)
  const sn = new StaveNote({
    clef,
    keys: sorted.map((n) => `${n.letter.toLowerCase()}/${n.octave}`),
    duration: 'w',
  })
  sorted.forEach((n, i) => {
    if (n.accidental) sn.addModifier(new Accidental(n.accidental), i)
    const color = colors[n.flag]
    if (color) sn.setKeyStyle(i, { fillStyle: color, strokeStyle: color })
  })
  return sn
}

export default function Staff({ notes }: { notes: StaffNote[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const tick = useThemeTick()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    const renderer = new Renderer(el as HTMLDivElement, Renderer.Backends.SVG)
    renderer.resize(WIDTH, HEIGHT)
    const ctx = renderer.getContext()
    ctx.setFillStyle('currentColor')
    ctx.setStrokeStyle('currentColor')

    const colors = { missing: cssColor('--half', '#e67700'), extra: cssColor('--ng', '#c92a2a') }

    const treble = new Stave(10, TREBLE_Y, WIDTH - 20).addClef('treble').setContext(ctx)
    const bass = new Stave(10, BASS_Y, WIDTH - 20).addClef('bass').setContext(ctx)
    treble.draw()
    bass.draw()
    new StaveConnector(treble, bass).setType('brace').setContext(ctx).draw()
    new StaveConnector(treble, bass).setType('singleLeft').setContext(ctx).draw()

    for (const [clef, stave] of [['treble', treble], ['bass', bass]] as const) {
      const note = makeNote(clef, notes.filter((n) => n.clef === clef), colors)
      const voice = new Voice({ numBeats: 4, beatValue: 4 }).setStrict(false).addTickables([note])
      new Formatter().joinVoices([voice]).format([voice], 110)
      voice.draw(ctx, stave)
    }

    const svg = el.querySelector('svg')
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
      svg.removeAttribute('height')
      svg.setAttribute('width', '100%')
      svg.style.maxWidth = `${WIDTH}px`
      svg.setAttribute('role', 'img')
    }
  }, [notes, tick])

  return <div className="staff" ref={ref} aria-hidden="true" />
}
