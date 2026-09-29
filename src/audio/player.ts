import { Chord } from '../core/chords'
import { arpeggioSchedule } from '../core/aids'
import { chordFrequencies, midiToFreq } from '../core/voicing'

let ctx: AudioContext | null = null

/** ユーザー操作のハンドラ内で呼ぶこと(iOS Safari対策)。 */
export async function ensureAudio(): Promise<AudioContext> {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
  }
  if (ctx.state !== 'running') {
    try {
      await ctx.resume()
    } catch {
      /* ignore */
    }
  }
  return ctx
}

const DURATION = 2
const NOTE_DURATION = 1.5
const REFERENCE_DURATION = 3
const FADE = 0.03
const HARMONICS: [number, number][] = [
  [1, 1],
  [2, 0.35],
  [3, 0.12],
]

interface Handle {
  stop: () => void
}

/** 常に1つだけ鳴らす。新しい再生の前に stopCurrent() で止める。 */
let current: Handle | null = null

export function stopCurrent(): void {
  const h = current
  current = null
  h?.stop()
}

function makeMaster(c: AudioContext, gain: number): GainNode {
  const master = c.createGain()
  master.gain.value = gain
  master.connect(c.destination)
  return master
}

/** ピアノ風の1音: 速い立ち上がり→指数減衰→フェードアウト */
function pianoVoice(c: AudioContext, dest: AudioNode, freq: number, start: number, length: number): OscillatorNode[] {
  const env = c.createGain()
  env.gain.setValueAtTime(0.0001, start)
  env.gain.exponentialRampToValueAtTime(1, start + 0.015)
  env.gain.exponentialRampToValueAtTime(0.35, start + Math.min(0.4, length / 2))
  env.gain.exponentialRampToValueAtTime(0.0001, start + length)
  env.connect(dest)
  return HARMONICS.map(([mul, amp]) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.value = freq * mul
    g.gain.value = amp
    o.connect(g).connect(env)
    o.start(start)
    o.stop(start + length + 0.05)
    return o
  })
}

function makeHandle(c: AudioContext, master: GainNode, oscs: OscillatorNode[], onEnd?: () => void): Handle {
  let done = false
  const finish = () => {
    if (done) return
    done = true
    onEnd?.()
  }
  const handle: Handle = {
    stop: () => {
      const now = c.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0, now + FADE)
      oscs.forEach((o) => {
        try {
          o.stop(now + FADE + 0.02)
        } catch {
          /* already stopped */
        }
      })
      finish()
    },
  }
  const last = oscs[oscs.length - 1]
  last.onended = () => {
    if (current === handle) current = null
    finish()
  }
  return handle
}

async function playVoices(steps: { freq: number; offset: number }[], length: number, gain: number): Promise<void> {
  const c = await ensureAudio()
  stopCurrent()
  const t0 = c.currentTime + 0.02
  const master = makeMaster(c, gain / Math.max(1, steps.length))
  const oscs = steps.flatMap((s) => pianoVoice(c, master, s.freq, t0 + s.offset, length - s.offset))
  current = makeHandle(c, master, oscs)
}

/** 和音を同時発音する。 */
export function playChord(chord: Chord): Promise<void> {
  return playVoices(
    chordFrequencies(chord).map((freq) => ({ freq, offset: 0 })),
    DURATION,
    0.5,
  )
}

/** 構成音を低い音から順に鳴らし、最後の音の後もしばらく響かせる。 */
export function playArpeggio(chord: Chord): Promise<void> {
  const steps = arpeggioSchedule(chord)
  const lastOffset = steps[steps.length - 1].offset
  return playVoices(steps, lastOffset + DURATION, 0.5)
}

/** 単音(MIDIノート番号)を鳴らす。 */
export function playNote(midi: number): Promise<void> {
  return playVoices([{ freq: midiToFreq(midi), offset: 0 }], NOTE_DURATION, 0.35)
}

let referenceFreq: number | null = null

/**
 * 基準音(純音)の再生/停止を切り替える。再生を始めたら true、止めたら false を返す。
 * 他の再生で止められたときも onEnd が呼ばれる。
 */
export async function toggleReference(freq: number, onEnd: () => void): Promise<boolean> {
  if (current && referenceFreq === freq) {
    stopCurrent()
    return false
  }
  const c = await ensureAudio()
  stopCurrent()
  const t0 = c.currentTime + 0.02
  const master = makeMaster(c, 0)
  master.gain.setValueAtTime(0, t0)
  master.gain.linearRampToValueAtTime(0.3, t0 + FADE)
  master.gain.setValueAtTime(0.3, t0 + REFERENCE_DURATION - FADE)
  master.gain.linearRampToValueAtTime(0, t0 + REFERENCE_DURATION)
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.value = freq
  o.connect(master)
  o.start(t0)
  o.stop(t0 + REFERENCE_DURATION + 0.05)
  referenceFreq = freq
  current = makeHandle(c, master, [o], () => {
    referenceFreq = null
    onEnd()
  })
  return true
}
