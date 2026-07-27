/**
 * Golden-output diff — the gate that proves the port is faithful.
 *
 * tools/golden/golden.json was produced by running the original's own source
 * text under a seeded Math.random. Here core/ regenerates the same items and the
 * two are compared. A mismatch means the learning engine's output moved.
 *
 * NEVER EDIT golden.json TO MAKE A TEST PASS. It is now the project's regression
 * anchor outright: Joe lifted the freeze on v0/junos-words.html on 27 July 2026,
 * so the file this was captured from can change, which is precisely why the
 * captured SNAPSHOT is what protects us and the file no longer can. If a change
 * is meant to alter what the engine produces, re-capture deliberately with
 * `npm run golden:capture` and say so in the commit.
 */
import { describe, it, expect } from 'vitest'
import golden from '../tools/golden/golden.json'
import { mulberry32 } from '../src/core/rng'
import { makeDeck } from '../src/core/decks'
import { GREEN, RED } from '../src/core/wordlists'
import { buildPool, buildNeighbours } from '../src/core/neighbours'
import { generateRead } from '../src/core/generators/read'
import { generateAdd, generateSub } from '../src/core/generators/sums'
import { generateBuild } from '../src/core/generators/build'
import type { ReadState } from '../src/core/generators/read'
import type { SumState } from '../src/core/generators/sums'
import type { BuildState } from '../src/core/generators/build'

describe('golden output — core matches the frozen original', () => {
  // ONE shared Rng, mirroring the original's single global Math.random.
  const rng = mulberry32(golden.seed)
  // ONE shared green deck: the original has a single module-level drawGreen
  // serving both generateRead (v0:807) and generateBuild (v0:1165), so its
  // state carries between them.
  const drawGreen = makeDeck(rng, GREEN)
  const drawRed = makeDeck(rng, RED)
  const neigh = buildNeighbours(buildPool())

  // State objects deliberately carry across the level flip: reading's
  // n = min(8, MIN + history.length) saturates at 8, and the sums' anti-repeat
  // guard compares the first level-2 item against the last level-1 one.
  const readState: ReadState = { history: [], idx: -1 }
  const addState: SumState = { history: [], idx: -1 }
  const subState: SumState = { history: [], idx: -1 }
  const buildState: BuildState = { history: [], idx: -1 }

  const take = (n: number, fn: () => void): void => { for (let i = 0; i < n; i++) fn() }

  // Same order as tools/golden/capture.mjs, including the level flips.
  take(500, () => generateRead(readState, { rng, drawGreen, drawRed, neigh, level: 1 }))
  take(500, () => generateAdd(addState, rng, 1))
  take(500, () => generateSub(subState, rng, 1))
  take(500, () => generateBuild(buildState, { rng, drawGreen, level: 1 }))

  const readMark = readState.history.length
  const addMark = addState.history.length
  const subMark = subState.history.length
  const buildMark = buildState.history.length

  take(500, () => generateRead(readState, { rng, drawGreen, drawRed, neigh, level: 2 }))
  take(500, () => generateAdd(addState, rng, 2))
  take(500, () => generateSub(subState, rng, 2))
  take(500, () => generateBuild(buildState, { rng, drawGreen, level: 2 }))

  const subMark3 = subState.history.length
  take(500, () => generateSub(subState, rng, 3))

  it('reproduces the level 1 reading rounds', () => {
    expect(readState.history.slice(0, readMark)).toEqual(golden.read)
  })

  it('reproduces the level 2 alien reading rounds', () => {
    expect(readState.history.slice(readMark)).toEqual(golden.readL2)
  })

  it('reproduces the level 1 additions', () => {
    expect(addState.history.slice(0, addMark)).toEqual(golden.add)
  })

  it('reproduces the level 2 bridging additions', () => {
    expect(addState.history.slice(addMark)).toEqual(golden.addL2)
  })

  it('reproduces the level 1 subtractions', () => {
    expect(subState.history.slice(0, subMark)).toEqual(golden.sub)
  })

  it('reproduces the level 2 subtractions', () => {
    expect(subState.history.slice(subMark, subMark3)).toEqual(golden.subL2)
  })

  it('reproduces the level 3 subtractions', () => {
    expect(subState.history.slice(subMark3)).toEqual(golden.subL3)
  })

  it('reproduces the level 1 build items', () => {
    expect(buildState.history.slice(0, buildMark)).toEqual(golden.build)
  })

  it('reproduces the level 2 alien build items', () => {
    expect(buildState.history.slice(buildMark)).toEqual(golden.buildL2)
  })
})
