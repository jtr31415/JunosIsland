# Pet Island — First Slice Gameplay Spec

Scope: the moment-to-moment choreography and economy of the first slice.
Academic progression (which sums, which words, escalation of *difficulty*) is
deliberately deferred; this document governs *pacing, costs and ceremony*.
Companion to `pet-island-brief.md`; the opening script there is canon and this
spec's curves are fitted to it.

---

## 1. The first ten minutes (beat sheet)

1. **Load** → island: one hex, Fred, sea, gulls. Opening script lines 1–3.
2. **Egg bobs ashore** (script 4–6) → tap egg → the challenge stage opens
   (egg on the turntable), **one word**
   → egg cracks fully → hatch ceremony → first pet + name card (script 7).
3. **Fred asks for space** (script 8) → the challenge stage opens, **one sum** → the
   pick-of-three appears (grass, grass, water on first run) → she picks →
   sockets pulse → she taps one → the whole plot **blooms in one fast
   sequence** (all increments play back-to-back — maximum first-taste
   spectacle) → pet moves in if biome matches, else nursery want appears.
4. **Free play begins.** Egg #2 drifts in within ~20s; the tile bank invites.
   From here, costs follow the curves (§4) and the governors (§5) steer.

## 2. The growing plot (maths progress made physical)

- Flow per tile: bank opens → **pick 1 of 3 tile types** → **pick a socket**
  (pulsing rims) → ghost hex appears → each correct sum advances the build.
- **Increment sequence** (data per biome, 10 canonical steps): soil mound →
  ground colour floods → pebbles → big rock → grass tufts/flowers → bush →
  sapling → tree grows → second prop → completion flourish (sparkle +
  butterflies + sound). Water biome variant: water rises → ripples → reeds →
  lilypad → … → fish-jump flourish.
- When tile cost < 10 (early curve), each sum advances multiple increments —
  the animation queue simply plays faster. Intro tile = all ten in one go.
- Wrong answers advance nothing and remove nothing. Pieces never un-grow.
- Completion → tile becomes live; matching nursery pet auto-moves-in with
  ceremony.

## 3. The cracking egg (reading progress made physical)

- Egg sits visibly on the shore/nursery. Reading pages advance its state:
  **intact → hairline → crack → big cracks → wobble-and-glow → hatch.**
- Stage thresholds at 25% / 50% / 75% / 90% of the egg's page cost.
- A "page" = one challenge screen: **find-page** (3 target words) or
  **build-page** (1 word from tiles). Pages alternate find/build (≈50/50,
  matching the 5+5 instinct); egg #1 is the scripted single word.
- Hatch ceremony order (port the 2D sequencing law), performed **on the
  stage**: crack burst on the turntable → pet pops with **name card** → name
  spoken → stage dissolves → pet hops down into the world (home tile or
  nursery) → album chip fly-in → 1s breath.

## 4. Costs — one curve, three constants

`cost(n) = round(cap − (cap − base) · e^((1 − n) / tau))`

- **Tiles (sums):** base 1, cap 16, tau 6 →
  n: 1→**1**, 2→**3**, 3→**5**, 4→**7**, 5→**9**, 6→**10**, 8→**12**,
  12→**14**, 20→**15**, →16.
- **Eggs (pages):** base 1, cap 14, tau 5 →
  n: 1→**1**, 2→**3**, 3→**5**, 4→**7**, 5→**8**, 6→**9**, 8→**11**,
  12→**13**, →14.
- Session shape at standard costs (~egg 7 / tile 6): one egg ≈ 6–7 min of
  reading, one tile ≈ 4–5 min of sums → **one pet + one tile ≈ a 12-minute
  session**. At cap: ~17 minutes combined. Tune `cap`/`tau` on field data.
- All constants live in `balance.json` (§8); nothing hardcoded.

## 5. The governors (symmetric, want-framed, never walls)

- **Space surplus gate:** when `emptyHabitableTiles − petsHome ≥ 4`, new plots
  pause (a plot mid-build always finishes). Fred: *"We've got lots of lovely
  space — let's read some friends home first!"* Maths challenges from pet
  quests still work; only new land pauses.
- **Nursery queue gate:** when `waitingPets ≥ 3`, new eggs pause. Fred:
  *"They need homes first!"* Reading from pet quests still works.
- Both gates are invitations with pointing (camera nudges toward the egg or
  the bank), never greyed-out lockouts, and never fire during the first ten
  minutes.

## 6. The challenge stage (split view — no overlay, no peeks)

- **Layout:** landscape → challenge panel (DOM, ported learning engine) on the
  **left**, the live 3D vignette on the **right**. Portrait → vignette on
  **top**, challenge on the **bottom** (thumb reach). Roughly 55/45 split.
- **The turntable:** the tile-in-progress or the egg sits on the vignette,
  slowly spinning (~9s/rev) with a gentle bob. Every completed page/sum adds
  its piece or crack **immediately, in view** — continuous cause-and-effect,
  which is the entire pedagogical point of building it this way.
- **Serene-right rule:** wrong answers change nothing on the stage. Feedback
  (wobble, rescue) lives entirely in the challenge panel; the work never
  suffers, per guardrails.
- **Completion — the fly-back:** tile finishes → flourish on the turntable →
  stage dissolves → the tile arcs across the screen to its chosen socket and
  lands with bounce + particles → move-in check. Egg: bursts on the turntable
  → hatch ceremony there (§3) → pet hops down into the world. The fly-back is
  the connective payoff between abstract work and world position.
- **Ambient progress dots** under the vignette (○○●●●) — a sense of "how much
  longer" with no numbers. Optional via balance flag.
- **Performance:** while the stage is up, the world scene does not render —
  the vignette is its own small scene in a scissored viewport over a dimmed
  world snapshot. Cheap on tablets by construction.
- Leaving mid-challenge (back tap) preserves plot/egg state perfectly;
  nothing is ever lost by wandering off to poke a pet.

## 7. Biome & tile-type ladder (first slice)

- **Start set:** grass (meadow) + water. First-run pick-of-three is weighted
  [grass, grass, water].
- **Unlocks, in order:** light-green (spring meadow) → desert → ice. Each
  unlock = new home biomes = new pet families become hatchable — collection
  expansion is the reward's reward.
- Unlock ceremony: Fred announcement + the new type appears glowing in the
  next pick-of-three.
- Slice-level unlock triggers (placeholders until the academic spec):
  spring at 8 tiles + 6 pets · desert at 18 + 12 · ice at 30 + 20.
  These become mastery-based when academic progression lands.

## 8. balance.json (schema)

```json
{
  "tile":     { "base": 1, "cap": 16, "tau": 6 },
  "egg":      { "base": 1, "cap": 14, "tau": 5 },
  "pages":    { "wordsPerFindPage": 3, "mix": ["find", "build"] },
  "governor": { "maxWaitingPets": 3, "maxEmptySurplus": 4 },
  "stage":    { "spinSec": 9, "progressDots": true, "flyBackMs": 900 },
  "firstRun": { "tileOffer": ["grass", "grass", "water"], "egg2DelaySec": 20 },
  "unlocks":  [ { "type": "spring", "tiles": 8,  "pets": 6  },
                { "type": "desert", "tiles": 18, "pets": 12 },
                { "type": "ice",    "tiles": 30, "pets": 20 } ]
}
```

## 9. Open items

- **Confirm the tile material variants actually in the purchased hex pack**
  (grass / light-green / desert / ice / water / stone?) so §7 names match the
  atlas swatches rather than my optimism.
- Academic progression spec (difficulty escalation, band coupling) — next
  session, per the product owner.
- Whether sums 8–10 of a tile should escalate slightly ("finish strong") —
  parked until academic spec.
