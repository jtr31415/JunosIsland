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
import {
  tapEgg, tapSum, askForLand, challengePassed, challengeFailed, placeTile, askToRetype,
} from './flow'
import { TILE_QUESTION } from './script'
import type { Flow, HatchDetails } from './flow'
import type { Axial } from './world/hex'
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
  /**
   * Fred asks for the other thing instead — and the child may say no.
   *
   * Returns `'asked'` the first time, when Fred has just spoken and the tap is
   * spent on hearing him; `'again'` when they have tapped the same thing
   * straight back, which is the child overriding him, and the caller must then
   * let the round open exactly as if no governor existed.
   *
   * PB-042/JT-012: the ask is real, the refusal is not. Before this, both call
   * sites invited and returned the flow unchanged forever, so "the child may
   * ignore him" was the one thing they could not do. Joe found it in the wild
   * with a six-year-old on it: *"erroneously forcing tile building"*. An
   * invitation they cannot decline is a lockout with a warm line on it.
   *
   * On `'again'` Fred says NOTHING, deliberately: the round is about to speak
   * its own prompt, and speech cancels speech (HANDOFF §5).
   */
  invite(which: 'space-surplus' | 'nursery-queue'): 'asked' | 'again'
  /** Fred hops and says his name, like any other friend. */
  greetFred(): void
  bouncePet(id: string): void
  /**
   * Turn the island about this tile — "zoom to location" (Joe, 27 July).
   *
   * A camera move and nothing else: it changes no state, costs nothing, and
   * must never be paired with opening a round. See the `tile` case below for
   * why this gesture and not another.
   */
  focusOn(a: Axial): void
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
      // Fred may ask them to build instead — once. Tap again and the egg opens.
      if (p.eggsPaused(flow) && p.invite('nursery-queue') === 'asked') return flow
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
       * and Joe hit it mid-game: the intro restarted, walked them through a
       * challenge that handed over an animal and then another that handed over
       * a tile, in the middle of a session they were already playing. A tap on
       * a friendly character has to be the smallest thing in the game, not the
       * largest.
       *
       * Replaying the story is not lost, it has moved behind the grown-ups PIN
       * where a curious tap cannot reach it.
       */
      p.greetFred()
      return flow
    }

    case 'plot': {
      /*
       * They tap what they are building to change what it is going to be.
       *
       * Joe, relaying the complaint: *"she'd like to change her mind if shes
       * picked a wrong type of tile."* Tapping the thing itself needs no new
       * button and nothing explained — and it is the only hex on the island that
       * has no other meaning, since the socket beneath a standing plot is
       * removed (#19).
       *
       * Nothing is spent and nothing is lost: `sumProgress` lives on the flow,
       * so every sum they have already answered still counts toward whatever
       * they pick instead. If the offer comes back with only one kind in it,
       * that kind is what the rules allow here and the panel says so honestly.
       */
      const asked = askToRetype(flow)
      if (asked === flow) return flow
      p.say(TILE_QUESTION)
      return asked
    }

    case 'socket': {
      /*
       * A socket is now how they ASK for land, as well as where it goes.
       *
       * Any patch of grass used to start a maths round, which made simply
       * looking round their own island a minefield — Joe: "annoying UX if you
       * only want to look around". The glowing outlines are permanent for the
       * same reason: if they are the only thing that starts land, they have to
       * be visible before they have already started.
       */
      if (flow.phase !== 'placing' || !flow.chosen) {
        // As with the egg: Fred asks once, and a second tap builds anyway.
        if (!flow.plot && p.landPaused(flow) && p.invite('space-surplus') === 'asked') {
          return flow
        }
        const asked = askForLand(flow, hit.axial)
        if (asked === flow) return flow
        /*
         * Always the question, never a sum. `askForLand` opened the next sum
         * instead when a plot was standing; since PB-048 it always opens the
         * bank, so the branch that read `asked.phase === 'challenge'` was dead
         * and told a reader this tap might hand them a round. It cannot.
         */
        p.say(TILE_QUESTION)
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
       * Tapping their own land turns the island about THAT tile.
       *
       * It never starts a round — it used to, so there was no way to look at
       * what they had built without being handed a sum, and land is asked for
       * at a socket now. That left the tile tap doing nothing at all, which is
       * the slot this fills, and it fills it with the one thing the tap can
       * unambiguously mean: *look here*.
       *
       * Why this gesture and not a double-tap or a tap on the sea. A
       * double-tap is unreliable from a six-year-old and would have to be told
       * apart from two ordinary taps, which is a new state machine on the one
       * path in the game that has already caused two reported bugs. The sea
       * carries no location worth pivoting on, and pivoting over open water is
       * precisely the "lost the island" failure the camera is built to prevent.
       * Their own land is the only surface where "look here" has a meaning, and
       * it was already free.
       *
       * Nothing is lost or spent, so a mis-aimed tap costs them only a tap
       * somewhere better (brief section 19).
       *
       * THERE IS NO EXCEPTION FOR A STANDING PLOT, and that is PB-048. Tapping
       * their land while one stood used to carry on building it. Joe found what
       * that does in the wild: Juno taps an ANIMAL, misses — `picking.ts` answers
       * with whatever IS under the ray, so a near-miss falls through to this very
       * case — and they are dropped into building a tile they walked away from.
       *
       * So a tile tap starts nothing and resumes nothing, ever. Sockets are the
       * only way to ask for land, which is what the `socket` case above already
       * says the design intends, and a build they left is picked back up by
       * tapping a glowing socket and choosing again (`askForLand`).
       */
      p.focusOn(hit.axial)
      return flow
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
