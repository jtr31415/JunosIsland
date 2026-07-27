# Backlog — the open cards, with the reasoning attached

*Written 28 July 2026, at the end of the overnight run, so that clearing the
session does not lose it. The task list this came from is session state; this file
is not.*

Read `docs/PHASE3-HANDOVER.md` for how the game is wired and `docs/HANDOFF.md`
for the landmines. This file is only "what is left, and what we already know
about it".

Each card says what was measured, so nobody re-derives it. Where a card says
FABLE FOUND, that came from a review that read the code rather than a summary.

---

## Waiting on Joe — do not guess these

### Item 13's difficulty currency — BLOCKS PHASE 4
`pet-island-difficulty.md` §5 and slice-1 §4 are in the same currency and
disagree. Today one sum banks one unit against a tile costing 1–16. §5 sets easy
= 2, tricky = 3, honeymoon = 4, and Phase 3 adds mastered = 1. The day item 13
lands, **every tile halves in length for an ordinary child** — the eighth tile
drops from eleven sums to six — and only the mastered case restores today's pace.
Either the cost curve re-bases or session length halves. This wants numbers, and
the modelling of both curves is a deliverable in its own right.

### Whether v1 ships without adaptive difficulty
Item 13 sits inside "the release" but is blocked on the above. Fable's view: it
should ship without, since today's fixed difficulty is the v0 behaviour she
already plays. Joe's call.

### Two overlays now behave differently
Tapping outside the tile offer returns to the island (it is `cancelPlacing`, a
zero-cost menu). Tapping outside a CHALLENGE does nothing, because a round is work
in progress. Recorded as a rule in HANDOFF §6 — but it is a feel judgement and
Juno is the only real judge.

### A gesture is live on her tablet
Tapping her own land turns the island about that tile. Costless, cannot start a
round, but it is a product change to a gesture Joe had explicitly ruled on. Veto
is one line in `interactions.ts` (the `focusOn` call in the `'tile'` case).

### The lighting slice — END OF PHASE 4 (#43)
Joe: *"add to this slice lighting review and tilt shift with a bit more fog, on a
visual options menu. end of ph4, not immediatly."*

The MENU is the settings toggle that the lighting brief's own amendment precedent
requires, so half the bar is met by the card's own scope. **What is missing is
measured fps on the actual mid-range Android tablet** — not a desktop, not
headless. Nothing in this project has ever been measured there. Order: measure →
amend the brief → build. Building first and measuring after is how the previous
attempt went wrong (HANDOFF §2 rule 3). `?flat` already exists reserved for this;
drive the same switch. And the DEFAULTS matter more than the options, because she
will never open a settings menu.

---

## The highest-value action that is not code

**Get it in front of Juno again (#34).** She played for an hour on 27 July and
every single thing she reported is now fixed: the pet tap target, the 3:1
build-to-find ratio, the challenge X, the hatch delay, the water snooker. The next
session is worth more than any remaining card.

It is also the only way to judge what was decided on a DPR-1 desktop at night by
one person: the new font, the prop shadows, the tap target, the 3:1 ratio, the
camera focus gesture. HANDOFF §9 has said this for three phases.

**The tag is NOT gating** — Joe, 28 July: *"curent live build is v0 as its a pt."*
Shipping unpinned to a prototype is accepted. What that does NOT retire: the
schemaVersion rollback hazard (take a backup from the gear FIRST if ever rolling
back), and her save is not a prototype — §19 holds whatever the build is called.

---

## Correctness, in rough priority order

### #41 Backstop: refuse any placement leaving zero growable witnesses
**IN FLIGHT at time of writing.** The dry-connection floor is an empirical margin,
not a theorem. FABLE FALSIFIED IT with a 64-tap counterexample, replayed through
the real tap path with every placement a genuinely offered button, ending with her
fields sealed behind water. It is pinned in `tests/island/coast.test.ts` under
`describe('the floor is a margin, not a theorem')`, which currently asserts the
FAILURE so the limit stays known.

Three gaps compound and no value of `LAND_FLOOR` closes them:
1. `mustBeLand` yields when grass is infeasible, so water is still offered where it
   spends the last ways out (7 such placements in 60 one-ply games).
2. Grass erosion is unguarded — a field on a dry socket whose empty neighbours all
   touch water consumes a way out and creates none.
3. **Dry sockets are not the real witnesses.** Once the count is zero the island
   survives on WET sockets where grass happens to remain drawable, which the floor
   never models.

Fix: at `flow.tileTypeFor`, refuse any placement leaving zero sockets at which
grass would actually land. Structural, fires never in normal play, closes the
bypass free. When it lands, the pinned test flips.

Severity if not done: a greedy harvest plus a six-ply search was needed to find
the counterexample. Before the floor, six natural taps walled her in.

### #46 `void async` over a loop — one failure kills the rest, THREE MORE SITES
**This pattern already cost a day of scenery.** The shape: an `async sync()` that
loops and `await`s inside the loop, called as `void thing.sync(...)` with no
`.catch`. One rejection abandons every item after it AND surfaces as an unhandled
rejection.

Still live:
- `props.ts` water-piece `await model(name)` — no `.catch`. Names are static so the
  deterministic case is dead, but a flaky fetch abandons the rest of the tiles that
  round and skips `publishObstacles()`/`placeEgg()`, because the call site is
  `void props.sync(...).then(...)` with no catch.
- `props.ts` cloud load — same shape.
- **`pets.ts` `sync()`** — `for (const pet of pets) { await model(pet.species) }`,
  called as `void pets.sync(...)`. One flaky pet GLB and every pet after it in the
  list fails to appear until the next refresh.
- `album.ts` `void portraits.shoot(...).then(...)` — per-item, no loop-kill, but an
  unhandled rejection.

The rule already exists in the codebase and was simply not applied: `increments.ts`
— *"a missing piece leaves a gap, never a broken build"*.

ALSO: the `scatter` comment claims a piece lost to a flaky fetch is "not marked
placed, so dressed properly on the next sync". FALSE for cover — `placed.add(k)`
runs BEFORE `scatter()`. Only a failed FEATURE leaves the hex unmarked. A lost
cover piece is a session-permanent gap.

### #44 One found word banks the whole page
`earned` is set by `flyToScore`, which the word-find fires on EVERY found word, not
on completion. So finding one word of five and leaving banks the page. PRE-EXISTING
— the old button and backdrop had identical logic, and the challenge × made it
rarer, not gone.

**Matters for item 13:** adaptive difficulty will read "pages passed" as mastery,
and a passed page may mean five words or one. Decide whether a partial page counts
before building the difficulty rule. Note §19 says work she genuinely did should
bank — the question is whether "passed" and "collected" should be the same fact.
Today they are.

### #47 A quarter of dead trunks flicker shadowless
Because `VARY` has no real floor (`(dh >> 13) % span` is a signed shift on an
unsigned hash — 48.8% of pieces get a NEGATIVE term), bare trees actually span
0.252–0.868 fitted height, not the 0.506–0.868 the shadow work measured. 23.4% fall
below the 0.40 height arm and their reach ~0.16 misses the other arm.

**Do NOT fix by flipping the shift.** That would re-roll the size of half the
scenery on every island that already exists, including Juno's — the world
rearranging itself behind her, which `props.ts`'s own header forbids. Fix by
shadowing by KIND (a tree is a tree whatever its roll), or correct the test that
pins a floor the code does not enforce.

### #32 QA: let her change her mind after picking the wrong tile type
Juno's own first feature request, via Joe. Distinct from the offer-dismiss already
shipped, which only escapes the chooser BEFORE a kind is picked. This undoes a plot
already sited and **already holding every sum she has spent on it**, so switching
type must carry that progress over rather than restart the build (§19).
`cancelPlacing` deliberately leaves `plot` alone for exactly this reason. Likely
shape: keep `plot.at` and `sumProgress`, change only `plot.type`, re-run
`tileTypeFor` so the coast rules still get the final say.

---

## Features and polish

### #31 Album pop-out — IN FLIGHT at time of writing
Tap a pet to open a larger card: the pet rotating, its NAME, its SPECIES, a
find-it-on-the-map action, and a speak-its-name button.

Five things already established:
1. The speak button ALREADY EXISTS in `album.ts`. The new work is the pop-out.
2. A rotating pop-out is not free — `album.ts` already creates a SECOND WebGL
   context, offscreen and render-once. Rotating means a live loop on the thing
   `scene.ts` calls "the expensive way" on this tablet. Prefer reusing the stage
   turntable.
3. "Find it on the map" CANNOT use `flow.pets[].at` — that is the hatch spot;
   wandering happens on live roots in `pets.ts` and never writes back to `Flow`.
   Needs a live-position port. The camera half is DONE: `world.focusOn`.
4. There is NO display name for a species. `SPECIES` holds ids like `animal-fox`.
   Needs copy, written with care (`polar` is a polar bear), kept with the other copy.
5. LEAVE ROOM FOR A THIRD LINE — item 7 makes a pet `{setId, speciesId}`, so the
   card will read "Cherry — Fox" eventually.

If the pop-out ever shows a DRESSED variant it needs `wearFaceUVs()`, because
`album.ts` loads its own GLBs and the face-decal fix does not reach it.

### #36 Suggest a break when mashing persists — IN FLIGHT at time of writing
Joe: *"repeated mashing on successive pages should lead to a suggestion for a break
or to get up, run around for a minute and then come back."*

The existing guards fire at 3 wrongs per round and **reset immediately, per round**
— there is no cross-page memory at all. `governors.ts` is the home (it owns
want-framed nudges with a grace period).

TWO GUARDRAILS: §19 says "no timers, no expiry", so "come back in a minute" must be
a SUGGESTION, never an enforced wait. And "three stumbles summon help and NEVER
SHAME" — a six-year-old must not read it as "you are bad at this".

Trap: `body:has(.overlay:not(.hide)) .say { display: none }` hides Fred's say card
whenever any overlay is open. That is why the tile-offer question was invisible for
a day. If the suggestion must appear DURING a round it cannot use `.say`.

### #39 PARKED — pure play elements as a session reward
Joe, for discussion, NOT to be built without him: *"she just did a solid hr of work
and is now enjoying looking at the island and looking for the animals. we may want
to add some pure play elements as session reward."*

The observation matters as much as the idea: after an hour of earning, the reward
she chose for herself was unstructured looking. Nobody designed that. Three things
already shipped serve it — the pet tap target (she was missing the animals she was
hunting), the album's find-on-map, and camera focus. The cheapest "pure play
element" may be to stop obstructing the play she has already invented.

Open questions: does a pure-play reward need to be EARNED (which makes it economy,
not play)? And §19 means a "session reward" must never become a session limit.

### #35 Release engineering — the phase named "the release" has none
No item for: cutting the first `v*` tag; verifying `npm run channel` against a
TAGGED build (it has only ever run against main); an on-tablet pass; a pre-session
backup from the gear; deleting the redundant `docs/nextphase.zip`.

### #45 Prop glTFs 404 on a texture that is never used
`props/*.gltf` reference `hexagons_medieval.png` but the folder ships only
`hexagons_medieval_Summer.png`. Harmless — `props.ts` binds the season atlas in code
— but it has now cost two agents time working out whether they caused it. A clean
console is a debugging tool. Cheapest fix is the loading manager, since re-exporting
vendor assets is how asset facts go stale.

### #47b Batch the blob shadows before the 40-tile island
`createBlobShadow` makes a fresh geometry AND material per blob; only the alpha
texture is shared. +1 draw call each, measured 1.74 per tile — fine now, ~70 extra
at 40 tiles. Prop blobs are STATIC and all share opacity, so a shared unit geometry
plus one shared material collapses them to ~1. **Must exclude pets**, whose
`castShadow` mutates opacity per frame. Natural home: beside the Phase 5 lighting
rework.

### Tablet screenshot wanted: a rim mountain's shadow
Hills and mountains at 1.92 tall / 0.96 reach throw an ellipse whose far edge lands
~3.7 units from the base, spanning neighbouring tiles and overhanging the sea. The
arithmetic is right for a 35° sun and pets already do this at the coast, so no
clipping rule was invented. If it reads broken on the tablet, cap stretch/radius for
`big` features rather than inventing clipping.

---

## Phase 5, from the brief

Items 7–12 and 14–17. Item 7 (progressive album + set unlocks) is the one with a
consequence attached: **the ladder is 600 creatures, not ~1,000**, because the
spotted twelve were dropped once it was proved the atlas cannot express a spot.
Either a third wearing arrives with a positional signal behind it, or the pacing
re-bases on 600.

`docs/rock-hexes-proposal.md` is a down-payment on item 14 and carries two questions
for Joe: what a rock tile is FOR (if not habitable, choosing it silently slows her
pet progress, which a six-year-old cannot weigh), and that "pure grey" is not
actually available — the bare mountain variants sample the atlas rock swatch, which
the Summer palette renders TAN.

---

## To restart the overnight loop

The cron is session state and dies with the session. To resume, recreate it with a
29-minute interval and this shape:

> Check whether agents are running. If yes, stop. If one has finished and its
> worktree is unmerged: FABLE-REVIEW ITS DIFF FIRST (an agent with model "fable",
> given the actual diff, asked to attack specific things — HANDOFF §7), action
> anything relevant, then merge, run all six gates, commit. Never merge unreviewed
> or ungated. If nothing is running, dispatch the next card, capped at THREE
> concurrent agents, with worktree isolation. Push once green.

Things learned about running it that are worth keeping:

- **Worktrees are cut from `origin/main`, not local `main`.** One agent silently
  built 439 lines against a base 43 commits stale because the remote had not been
  pushed. Push before dispatching, and make every brief verify its own HEAD first.
- **Tell agents not to run `taskkill /F /IM node.exe`** — one did, and killed every
  other agent's dev server.
- **Partition file ownership explicitly in each brief**, and name the two or three
  files another agent holds.
- **If a brief adds a wiring line in `main.ts`, demand a source-assertion test.**
  An undefended wiring line silently reverted a fix twice in two days.
- **Name the known flakes in every brief** so nobody burns time on a failure that
  is not theirs — though as of `5876457` both are fixed.
- Fable reviewing the PLAN, before the code, caught a spec that could not meet its
  own goal while an agent was already building it.
