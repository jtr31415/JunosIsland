/**
 * Tap handling — the wiring layer, extracted so it can be tested.
 *
 * Every blocker found at the M0 and M1 gates lived HERE: not in the flow
 * machine (which no-ops correctly in every bad sequence) and not in the
 * renderers (which are the proven M0 modules), but in the glue that decides
 * which one to call. `flow.ts` would refuse a transition, this layer would
 * proceed as though it had happened, and the child would do real work for
 * nothing.
 *
 * So the glue lives in its own module, takes everything it touches as an
 * injected dependency, and returns the next flow state rather than mutating
 * anything. That makes the sequences that actually broke — tap Fred while
 * placing, tap a socket with no tile chosen, finish a round that never
 * legitimately opened — assertable in a plain unit test.
 */
import { tapEgg, tapSum, askForLand, challengePassed, challengeFailed, placeTile } from './flow'
import { TILE_QUESTION } from './script'
import type { Flow, HatchDetails } from './flow'
import type { Hit } from './scene'

export interface InteractionPorts {
  /** True while a challenge is on screen. Taps on the world are ignored then. */
  challengeOpen(): boolean
  /** True while the opening is playing; it owns taps for its duration. */
  storyPlaying(): boolean
  /**
   * Open a round for the ALREADY-TRANSITIONED flow.
   *
   * The next state is passed explicitly rather than read from the caller's
   * variable: this port fires before the caller has assigned it, so a handler
   * reading its own `flow` would still see the pre-transition phase and refuse
   * to open. That mistake shipped once and no unit test saw it, because the
   * tests mock this port.
   */
  openRead(next: Flow): void
  openSum(next: Flow): void
  /**
   * Is a governor currently asking for the OTHER thing? (spec §5)
   *
   * Asked BEFORE the transition, never after. The ports used to decline to
   * open a round that the flow had already moved into 'challenge' — leaving
   * the child in a phase with no overlay to finish or dismiss, where every
   * subsequent tap no-ops and only a reload recovers. A governor is an
   * invitation, so it must divert the tap, not strand it.
   */
  eggsPaused(f: Flow): boolean
  landPaused(f: Flow): boolean
  /** Fred asks for the other thing instead. Never a lockout. */
  invite(which: 'space-surplus' | 'nursery-queue'): void
  /** Fred hops and says his name, like any other friend. */
  greetFred(): void
  bouncePet(id: string): void
  say(text: string): void
  clearSay(): void
  speak(text: string): void
  win(): void
}

/**
 * Handle one tap on the world.
 *
 * Returns the next flow state. The caller re-renders from it; nothing here
 * touches the scene directly, which is what keeps it testable.
 */
export function handleWorldTap(flow: Flow, hit: Hit | null, p: InteractionPorts): Flow {
  if (!hit) return flow
  if (p.challengeOpen() || p.storyPlaying()) return flow

  switch (hit.kind) {
    case 'egg': {
      // Reading hatches eggs (brief section 4).
      if (p.eggsPaused(flow)) { p.invite('nursery-queue'); return flow }
      const next = tapEgg(flow)
      if (next === flow) return flow          // wrong phase: do nothing, loudly
      p.openRead(next)
      return next
    }

    case 'fred': {
      /*
       * He hops and says his name, exactly as every pet does.
       *
       * This used to replay the whole opening — brief §3's "tell me again?" —
       * and Joe hit it mid-game: the intro restarted, walked her through a
       * challenge that handed over an animal and then another that handed over
       * a tile, in the middle of a session she was already playing. A tap on a
       * friendly character has to be the smallest thing in the game, not the
       * largest.
       *
       * Replaying the story is not lost, it has moved behind the grown-ups PIN
       * where a curious tap cannot reach it.
       */
      p.greetFred()
      return flow
    }

    case 'socket': {
      /*
       * A socket is now how she ASKS for land, as well as where it goes.
       *
       * Any patch of grass used to start a maths round, which made simply
       * looking round her own island a minefield — Joe: "annoying UX if you
       * only want to look around". The glowing outlines are permanent for the
       * same reason: if they are the only thing that starts land, they have to
       * be visible before she has already started.
       */
      if (flow.phase !== 'placing' || !flow.chosen) {
        if (!flow.plot && p.landPaused(flow)) { p.invite('space-surplus'); return flow }
        const asked = askForLand(flow, hit.axial)
        if (asked === flow) return flow
        if (asked.phase === 'challenge') p.openSum(asked)
        else p.say(TILE_QUESTION)
        return asked
      }
      const next = placeTile(flow, hit.axial)
      if (next === flow) return flow          // not a legal socket; choice kept
      p.clearSay()
      p.win()
      /*
       * The plot is sited, so start building it straight away. Without this
       * the child picks a spot, watches a ghost hex appear, and is handed
       * back to an island with no obvious way to get on with it.
       *
       * Unless siting finished it outright — a plot restored from an old
       * banked save is already paid for — in which case the tile is real and
       * there is nothing to open.
       *
       * NOTE the tapSum: the port refuses any state that is not already in a
       * sum challenge, and placeTile returns 'free'. Handing it the sited
       * state directly opened nothing at all, silently, and the test did not
       * catch it because it mocks the port. This is the third time that exact
       * shape has shipped; hence the transition happens HERE.
       */
      if (!next.plot) return next
      const building = tapSum(next)
      if (building === next) return next
      p.openSum(building)
      return building
    }

    case 'pet': {
      p.bouncePet(hit.id)
      const pet = flow.pets.find(x => x.id === hit.id)
      if (pet) p.speak(pet.name)
      return flow
    }

    case 'tile': {
      /*
       * Tapping her own land does NOTHING, deliberately.
       *
       * It used to start a maths round, so there was no way to turn the camera
       * or look at what she had built without being handed a sum. Land is
       * asked for at a socket now — the glowing outline at the island's edge,
       * which says "you could build here" in the one place building happens.
       *
       * A plot already under construction is the exception: tapping the tile
       * she is in the middle of building carries on with it, because that is
       * unambiguously what she is doing.
       */
      if (!flow.plot) return flow
      const next = askForLand(flow)
      if (next === flow) return flow
      if (next.phase === 'challenge') p.openSum(next)
      return next
    }

    default:
      return flow
  }
}

/**
 * A challenge round finished successfully.
 *
 * `hatch` is only consulted for a reading round. If the flow is not actually
 * in a challenge — the exact shape of the swallowed-work bug — nothing
 * happens and the caller can see it, because the returned state is identical.
 */
export function handleChallengePassed(flow: Flow, hatch?: HatchDetails): Flow {
  if (flow.phase !== 'challenge') return flow
  return challengePassed(flow, hatch)
}

/** The child left a challenge. Costs nothing (brief section 18). */
export function handleChallengeDismissed(flow: Flow): Flow {
  return challengeFailed(flow)
}
