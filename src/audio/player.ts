import { Chord } from '../core/chords'
import { chordFrequencies } from '../core/voicing'

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
const HARMONICS: [number, number][] = [
  [1, 1],
  [2, 0.35],
  [3, 0.12],
]

let current: { gain: GainNode; stop: () => void } | null = null

/** 和音を同時発音する。再生中の音は止めてから鳴らす。 */
export async function playChord(chord: Chord): Promise<void> {
  const c = await ensureAudio()
  current?.stop()

  const freqs = chordFrequencies(chord)
  const t0 = c.currentTime + 0.02
  const master = c.createGain()
  master.gain.value = 0.5 / Math.max(1, freqs.length)
  master.connect(c.destination)

  const oscs: OscillatorNode[] = []
  for (const f of freqs) {
    const env = c.createGain()
    // ピアノ風エンベロープ: 速い立ち上がり→指数減衰→フェードアウト
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.exponentialRampToValueAtTime(1, t0 + 0.015)
    env.gain.exponentialRampToValueAtTime(0.35, t0 + 0.4)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + DURATION)
    env.connect(master)
    for (const [mul, amp] of HARMONICS) {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = 'sine'
      o.frequency.value = f * mul
      g.gain.value = amp
      o.connect(g).connect(env)
      o.start(t0)
      o.stop(t0 + DURATION + 0.05)
      oscs.push(o)
    }
  }

  const handle = {
    gain: master,
    stop: () => {
      const now = c.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0, now + 0.03)
      oscs.forEach((o) => {
        try {
          o.stop(now + 0.05)
        } catch {
          /* already stopped */
        }
      })
    },
  }
  current = handle
  oscs[0].onended = () => {
    if (current === handle) current = null
  }
}
