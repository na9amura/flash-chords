import { describe, expect, it } from 'vitest'
import { CHORD_TYPES } from './chords'
import { DIFFICULTIES, getDifficulty, typesForDifficulty } from './difficulty'

const ids = (d: string) => typesForDifficulty(d).map((t) => t.id)

describe('difficulty', () => {
  it('defines four difficulties', () => {
    expect(DIFFICULTIES.map((d) => d.label)).toEqual(['入門', '中級1', '中級2', '上級1'])
  })
  it('every typeId exists in CHORD_TYPES', () => {
    for (const d of DIFFICULTIES) {
      for (const id of d.typeIds ?? []) expect(CHORD_TYPES.some((t) => t.id === id)).toBe(true)
    }
  })
  it('beginner / intermediate1 / intermediate2 do not overlap and cover all types', () => {
    const all = [...ids('beginner'), ...ids('intermediate1'), ...ids('intermediate2')]
    expect(new Set(all).size).toBe(all.length)
    expect([...all].sort()).toEqual(CHORD_TYPES.map((t) => t.id).sort())
  })
  it('maps types as specified', () => {
    expect(ids('beginner')).toEqual(['major', 'minor'])
    expect(ids('intermediate1')).toEqual(['7', 'maj7', 'm7', 'm7b5'])
    expect(ids('intermediate2')).toEqual(['dim', 'aug', 'sus4', 'add9'])
  })
  it('advanced returns all types', () => {
    expect(typesForDifficulty('advanced')).toEqual(CHORD_TYPES)
  })
  it('throws on unknown id', () => {
    expect(() => getDifficulty('x')).toThrow()
  })
})
