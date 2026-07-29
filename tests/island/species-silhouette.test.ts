/**
 * Every shipped species, measured the way `pets.ts` will actually measure it.
 *
 * PB-036 phase 2 fanned four collections out to four agents working in
 * parallel, and each one tuned its animals against a bar it chose for itself.
 * They chose four different bars — Garden held to 1.17, Home Pets to 1.28,
 * Africa to 1.40, Woodland to 1.60 — and every one of those was defensible in
 * isolation. None of them could see the others. This file is where that gets
 * settled once, because a keep-out radius is not a per-collection matter: it is
 * how much of a shared island one creature takes up.
 *
 * ## What is measured, and why exactly this
 *
 * `pets.ts:650-660` does three things to a built group, in this order: scales it
 * by 0.16, takes a `Box3` of it, and derives
 *
 *     radius   = max(width, depth) / 2      // the obstacle keep-out
 *     standing = height                      // drives the shadow
 *
 * So the keep-out is measured on the group's own geometry BEFORE the uniform
 * field scale, in Kenney units, and that is what is measured here. A species
 * with a fat keep-out cannot walk between two trees; it is not a cosmetic
 * number.
 *
 * ## The bar — a hard ceiling and a ratchet, and NOT a rule about what is right
 *
 * Be honest about what this file does and does not settle.
 *
 * What it settles: nobody exceeds `MAX_KEEP_OUT`. All 50 shipped species pass
 * it, it is the number the kit's own worked example already implies, and it is
 * the one that matters for pathing — a creature wider than this cannot walk
 * between two trees.
 *
 * What it does NOT settle: whether the four collections should have been tuned
 * to the same bar. They were not, and I could not find a principled rule that
 * separates the good cases from the bad. Two attempts, both wrong, both worth
 * recording so the next person does not spend the afternoon on them:
 *
 *   1. *"A small species must stay inside the pack envelope."* Catches the real
 *      defect — Garden's MOLE at a keep-out of 1.47, the smallest animal in the
 *      collection demanding more floor than a fox. But it also condemns eleven
 *      animals that are simply LONG: the stoat, otter, mink, ferret, gecko. A
 *      stoat IS long and low. A rule keyed on height cannot tell a mole from a
 *      stoat.
 *   2. *"A species may be only as wide as its `body` declares it long"*
 *      (`keepOut <= PACK_KEEP_OUT * body`). Better — it permits the stoat and
 *      still catches the mole. But it condemns the HIPPO, which declares
 *      `body: 0.8` and measures 1.38, because a hippo is wide from bulk, not
 *      from length. `body` is a length multiplier and the keep-out is
 *      `max(width, depth)`; the two are simply not the same axis.
 *
 * So instead of a third guess, `WORST_SO_FAR` is a RATCHET: each collection is
 * held to the widest it already measures. That stops drift without forcing
 * eleven retunes on an aesthetic judgement I could not justify. Harmonising the
 * four bars is a real open question and it is written up in the PB-036 handoff.
 *
 * The underlying trap, which is what produced all of this, is documented in the
 * `>>>` block in `kits/quadruped.ts`: dropping `legs` to mean "low" raises the
 * uniform fit scale and silently stretches the body in world units, so a
 * creature grows while its data still claims it is small.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { SHIPPED_SPECIES } from '../../src/island/species/registry'
import { buildSpecies } from '../../src/island/species/kit'
import type { Species } from '../../src/island/species/types'

/**
 * The measured live pack's widest keep-out: `animal-fox`, 1.25 x 1.69 x 2.31,
 * so `max(1.25, 2.31) / 2`. Quoted from the measurement table in the
 * `kits/quadruped.ts` header, which parsed all 24 GLBs.
 */
const PACK_KEEP_OUT = 1.16

/**
 * The hard ceiling for anything. The kit's own worked "plausible stoat"
 * (`kit-quadruped.test.ts:93`) measures 1.59, so 1.6 is the number the kit
 * already implies rather than one invented here.
 */
const MAX_KEEP_OUT = 1.6

/**
 * The widest each collection currently measures. A RATCHET, not a target —
 * these four numbers disagree with each other and that disagreement is the open
 * question, not the answer. Lower one when a collection is retuned; never raise
 * one to make a new species fit.
 */
const WORST_SO_FAR: Readonly<Record<string, number>> = {
  garden: 1.16,
  'home-pets': 1.28,
  africa: 1.40,
  woodland: 1.58,
}

interface Measured {
  id: string
  collection: string
  height: number
  /** The length multiplier the species DECLARES about itself. */
  body: number
  keepOut: number
  wh: number
}

/** Measure one species exactly as `pets.ts:650-660` does. */
function measure(s: Species): Measured {
  const group = buildSpecies(s.build!)
  group.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(group)
  const w = box.max.x - box.min.x
  const d = box.max.z - box.min.z
  const h = box.max.y - box.min.y
  // Every species shipped so far rides the quadruped kit, which is the only
  // kit with a `body`. When a second kit lands this needs a per-kit read;
  // `body ?? 1` means a kit without one gets the plain pack allowance rather
  // than silently passing.
  const build = s.build as { height: number; body?: number }
  return {
    id: s.id,
    collection: s.collection,
    height: h,
    body: build.body ?? 1,
    keepOut: Math.max(w, d) / 2,
    wh: w / h,
  }
}

const BUILT = SHIPPED_SPECIES.filter(s => s.build !== undefined)
const MEASURED = BUILT.map(measure)

describe('every built species, measured as pets.ts measures it', () => {
  it('has actually built something for all 50 of them', () => {
    // If this drops, a collection stopped being imported by the registry and
    // the rest of this file would pass vacuously.
    expect(BUILT.length).toBe(50)
    expect(MEASURED.every(m => m.keepOut > 0 && m.height > 0)).toBe(true)
  })

  it('keeps every species inside the hard keep-out ceiling', () => {
    const over = MEASURED
      .filter(m => m.keepOut > MAX_KEEP_OUT)
      .map(m => `${m.id} (${m.collection}) keep-out ${m.keepOut.toFixed(2)}`)
    expect(over, 'a creature this wide cannot path between two trees').toEqual([])
  })

  it('does not let any collection get WIDER than it already is', () => {
    // A ratchet on measured fact, not a rule about what is right. Read the
    // "the bar" note at the top of this file for why it is only a ratchet.
    const worst = new Map<string, number>()
    for (const m of MEASURED) {
      worst.set(m.collection, Math.max(worst.get(m.collection) ?? 0, m.keepOut))
    }
    const regressed: string[] = []
    for (const [c, cap] of Object.entries(WORST_SO_FAR)) {
      const now = worst.get(c)
      if (now === undefined) { regressed.push(`${c} has no built species at all`); continue }
      if (now > cap + 0.005) {
        regressed.push(`${c} was ${cap.toFixed(2)} and is now ${now.toFixed(2)}`)
      }
    }
    expect(regressed, 'a collection got wider — retune it, do not raise the cap').toEqual([])
  })

  it('keeps GARDEN inside the live pack envelope, because it ships first', () => {
    // Garden is roster §6's proposed first collection and so the likeliest to
    // reach a child. Its agent held it to the pack's own widest (the fox) on
    // purpose, and that is the one collection where the stricter bar is both
    // achieved and worth keeping: the first new animals Juno meets should not
    // take more room than animals she already has.
    //
    // The other three run wider. Whether they should is the open question in
    // the header — this is not a claim that they are wrong, only that Garden is
    // known-good and must stay that way.
    const over = MEASURED
      .filter(m => m.collection === 'garden' && m.keepOut > PACK_KEEP_OUT)
      .map(m => `${m.id} keeps out ${m.keepOut.toFixed(2)} vs the fox at ${PACK_KEEP_OUT}`)
    expect(over).toEqual([])
  })

  it('keeps every species in the pack\'s width-to-height family', () => {
    // Roster §1: a new species must sit beside `animal-fox` without looking
    // like a guest. The pack's mean W/H is 0.97 and the kit's reference
    // silhouette is 0.69; the first pass of the kit built at 0.37 and read as a
    // total stranger. This is the guard on that failure returning through data.
    const strange = MEASURED
      .filter(m => m.wh < 0.5 || m.wh > 1.45)
      .map(m => `${m.id} (${m.collection}) W/H ${m.wh.toFixed(2)}`)
    expect(strange).toEqual([])
  })

  it('gives no two shipped species an identical silhouette', () => {
    // Roster §4's whole point, applied ACROSS collections rather than inside
    // one. Each agent checked its own collection; nobody could check the wolf
    // against the dingo in another file. This is that check.
    const seen = new Map<string, string>()
    const clashes: string[] = []
    for (const m of MEASURED) {
      const key = [
        m.keepOut.toFixed(3), m.height.toFixed(3), m.wh.toFixed(3),
      ].join('|')
      const prev = seen.get(key)
      if (prev) clashes.push(`${prev} and ${m.id} measure identically`)
      else seen.set(key, m.id)
    }
    expect(clashes).toEqual([])
  })
})
