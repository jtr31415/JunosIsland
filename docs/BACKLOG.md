# Backlog — the long-form reasoning behind the cards

*Written 28 July 2026 at the end of the overnight run. **Reconciled 29 July 2026
against the repo and against `joe/backlog.json`** (manager run 7), after Runs A
and B shipped and after fifteen of Joe's rulings landed — this file had drifted
badly enough to be dangerous, and eleven entries on it were describing work that
was already live.*

## Which file wins

There are two backlogs and they had quietly disagreed. They now have different
jobs, and this is the rule:

- **`joe/backlog.json` is the backlog.** It is authoritative for **what exists,
  what state it is in, and which run it belongs to**. It carries all 46 cards
  (`PB-001`…`PB-046`), a `state` of `open | planned | done | parked`, and a
  `run`. If this file and that file ever disagree again, **the JSON wins** and
  this file is the one that is stale.
- **This file is the prose annex.** It carries the long-form reasoning for the
  subset of cards that have any — what was measured, what was tried, what the
  trade-off was — because that reasoning is the valuable part and most of it is
  Joe's own writing. It does **not** try to list every card; it never did.

Every heading below now carries its **`PB-0NN` id**, which is the join between
the two files. Before this reconciliation there were none, and the only link was
a `#NN` number that appeared on barely half the entries.

Read `docs/PHASE3-HANDOVER.md` for how the game is wired and `docs/HANDOFF.md`
for the landmines. Each card says what was measured, so nobody re-derives it.
Where a card says FABLE FOUND, that came from a review that read the code rather
than a summary.

## What shipped after this file was written

Nothing below described any of it, which is precisely how work gets done twice.
The detail lives in `joe/backlog.json`; this is the index.

- **Run A** — the attempt model, the reading page mix fix (`PB-038`), and the
  A5/A6/A7 signal work. Joe's rulings **JT-008 … JT-011**.
- **Run B — automatic progression (`PB-030`, now `done`).** Three slices: **B1
  `1cf4e71`** the promotion gates and probes, **B2 `ad848e4`** the offer and the
  honeymoon economy, **B3 `9138176`** the 65/35 weakness lean, invisible mercy
  runs and whisper retirement. Shipped and deployed. One dial is still contested
  as **JT-026**, open at the time of writing.
- **`PB-042` — the governors became a PRICE (now `done`).** Joe's **JT-012**
  replaced the hard stop with an escalating price and an override; **JT-013 …
  JT-022** settled every number. `PB-039`'s open end of the ratio closed with it.
- **Closed by delivery:** `PB-011` album pop-out, `PB-044` the placement
  backstop, `PB-045` change-your-mind on tile type, `PB-046` the break
  suggestion, `PB-033` the asset viewer, `PB-038`, `PB-007`.
- **New since:** `PB-043` the reading progression curriculum (Joe's own, from his
  JT-025 note), and `PB-036` new animals — whose brief landed 29 July as
  **`docs/pet-island-species-roster.md`** and is now the spec for it.

**Joe's rulings live in `joe/tasks.json`, not here.** Fifteen landed during Runs
A and B and several of them overturned things written on this page. Check a
ruling before trusting a paragraph below.

---

## Waiting on Joe — do not guess these

### PB-001 · Item 13's difficulty currency — NARROWED, NO LONGER BLOCKING

**Status 29 July: two thirds of this is overtaken, and only differential pay is
left.** The tier table below describes the DOCUMENT, not the build — nothing
difficulty-tiered was ever built. Pay is flat at `balance.json` `pay {item: 2,
honeymoon: 3}`, so the cost curve did not re-base and session length did not
halve; a third thing happened instead. What did ship is one tier that is not a
difficulty tier at all — the honeymoon pays 3 (`balance/index.ts:274-300`,
deliberately a sibling of `itemPay` rather than a parameter of it) — plus
overshoot carry-forward at `flow.ts:633-660`. **The live question is only: should
a harder item pay more than an easy one?** Still never ruled on. Read the rest of
this entry as the original case, not as the current state.
`pet-island-difficulty.md` §5 and slice-1 §4 are in the same currency and
disagree. Today one sum banks one unit against a tile costing 1–16. §5 sets easy
= 2, tricky = 3, honeymoon = 4, and Phase 3 adds mastered = 1. The day item 13
lands, **every tile halves in length for an ordinary child** — the eighth tile
drops from eleven sums to six — and only the mastered case restores today's pace.
Either the cost curve re-bases or session length halves. This wants numbers, and
the modelling of both curves is a deliverable in its own right.

### PB-002 · Whether v1 ships without adaptive difficulty — CLOSED BY DELIVERY

**Status 29 July: closed, and say plainly that Joe never answered it.** It was
overtaken — the queue put `PB-030` above it, Run B built the adaptive ladder, and
it is live and headless (`harness.ts:13-16`, `856`, `1127`). v1 ships WITH
adaptive difficulty. Nothing here needs a ruling any more.
Item 13 sits inside "the release" but is blocked on the above. Fable's view: it
should ship without, since today's fixed difficulty is the v0 behaviour she
already plays. Joe's call.

### PB-003 · Two overlays now behave differently
Tapping outside the tile offer returns to the island (it is `cancelPlacing`, a
zero-cost menu). Tapping outside a CHALLENGE does nothing, because a round is work
in progress. Recorded as a rule in HANDOFF §6 — but it is a feel judgement and
Juno is the only real judge.

### PB-004 · A gesture is live on her tablet
Tapping her own land turns the island about that tile. Costless, cannot start a
round, but it is a product change to a gesture Joe had explicitly ruled on. Veto
is one line in `interactions.ts` (the `focusOn` call in the `'tile'` case).

### PB-005 · The lighting slice — END OF PHASE 4 (#43)
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

**PB-006 · Get it in front of Juno again (#34).** She played for an hour on 27 July and
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

### PB-044 · #41 Backstop: refuse any placement leaving zero growable witnesses — SHIPPED

**Status 29 July: SHIPPED (`c7b0097`).** `isGrowableWitness()` at
`world/coast.ts:918` and `keepsAWitness` at `:1251`, wired into the placement
decision at `:1278` and documented as THE BACKSTOP at `flow.ts:464-495`. The
pinned failing `describe('the floor is a margin, not a theorem')` **is gone from
the repo** — it flipped exactly as this entry predicted, and the live tests are
`tests/island/coast.test.ts:975` and `:1004`. Knowingly still one ply only, so the
last witness can itself be a dead end; the code says so at `coast.ts:1067` and
`:1286`. Read the rest as the case that produced the fix.
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

### PB-008 · #46 `void async` over a loop — one failure kills the rest, THREE MORE SITES
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

### PB-007 · #44 One found word banks the whole page — FIXED IN RUN A

**Status 29 July: FIXED in Run A, and this entry had been contradicting
`joe/backlog.json` for a day.** `flyToScore` sets `earned` only off a find page
and a find page banks on `celebrate()` — `overlay.ts:428`, `:472`. `wordFind`
still fires per word, which is by design (`challenges/wordFind.ts:64`). The
separate question this entry raised about item 13's currency lives on `PB-001`.
`earned` is set by `flyToScore`, which the word-find fires on EVERY found word, not
on completion. So finding one word of five and leaving banks the page. PRE-EXISTING
— the old button and backdrop had identical logic, and the challenge × made it
rarer, not gone.

**Matters for item 13:** adaptive difficulty will read "pages passed" as mastery,
and a passed page may mean five words or one. Decide whether a partial page counts
before building the difficulty rule. Note §19 says work she genuinely did should
bank — the question is whether "passed" and "collected" should be the same fact.
Today they are.

### PB-009 · #47 A quarter of dead trunks flicker shadowless
Because `VARY` has no real floor (`(dh >> 13) % span` is a signed shift on an
unsigned hash — 48.8% of pieces get a NEGATIVE term), bare trees actually span
0.252–0.868 fitted height, not the 0.506–0.868 the shadow work measured. 23.4% fall
below the 0.40 height arm and their reach ~0.16 misses the other arm.

**Do NOT fix by flipping the shift.** That would re-roll the size of half the
scenery on every island that already exists, including Juno's — the world
rearranging itself behind her, which `props.ts`'s own header forbids. Fix by
shadowing by KIND (a tree is a tree whatever its roll), or correct the test that
pins a floor the code does not enforce.

### PB-045 · #32 QA: let her change her mind after picking the wrong tile type — SHIPPED

**Status 29 July: SHIPPED (`efff9fa`), in the shape proposed below.**
`chooseTile` swaps `plot.type` in place and re-runs `tileTypeFor`, keeping
`plot.at` and `sumProgress` so the change costs her nothing already earned —
`flow.ts:520-548`, re-entry at `:553-557`. Tested at `tests/island/retype.test.ts`,
including the §19 property at `:101`.
Juno's own first feature request, via Joe. Distinct from the offer-dismiss already
shipped, which only escapes the chooser BEFORE a kind is picked. This undoes a plot
already sited and **already holding every sum she has spent on it**, so switching
type must carry that progress over rather than restart the build (§19).
`cancelPlacing` deliberately leaves `plot` alone for exactly this reason. Likely
shape: keep `plot.at` and `sumProgress`, change only `plot.type`, re-run
`tileTypeFor` so the coast rules still get the final say.

---

## Features and polish

### PB-011 · #31 Album pop-out — SHIPPED

**Status 29 July: SHIPPED (`dc21396`), and it dodged the hard part.** The second
live WebGL context this entry worried about was avoided entirely by **reusing the
`stage.ts` turntable and rendering the card as a hole rather than a panel** —
`album.ts:13-45`. The missing species display name was solved too: `speciesName`
comes from `./script` (`album.ts:51`, species row at `:174`). Tests at
`tests/island/album.test.ts:154`, `:252`, `:309`, `:353`, `:443`. `album.ts:140-168`
reserves the third row for brief item 7, which is `PB-016`.
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

### PB-046 · #36 Suggest a break when mashing persists — SHIPPED

**Status 29 July: SHIPPED (`b1f7656`, later touched by `ad848e4` and `58425b6`).**
`MASH_PAGES = 3` with a cross-page counter at `governors.ts:417`, `:462-475`,
delivered by `offerAStretch()` at `main.ts:1896` from `:476`, `:1392`, `:1570`.
The guardrail is tested rather than assumed: `tests/island/stretch.test.ts:316`,
"the suggestion locks nothing and expires nothing (§19)".
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

### PB-012 · #39 PARKED — pure play elements as a session reward
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

### PB-013 · #35 Release engineering — the phase named "the release" has none
No item for: cutting the first `v*` tag; verifying `npm run channel` against a
TAGGED build (it has only ever run against main); an on-tablet pass; a pre-session
backup from the gear; deleting the redundant `docs/nextphase.zip`.

### PB-014 · #45 Prop glTFs 404 on a texture that is never used
`props/*.gltf` reference `hexagons_medieval.png` but the folder ships only
`hexagons_medieval_Summer.png`. Harmless — `props.ts` binds the season atlas in code
— but it has now cost two agents time working out whether they caused it. A clean
console is a debugging tool. Cheapest fix is the loading manager, since re-exporting
vendor assets is how asset facts go stale.

### PB-010 · #47b Batch the blob shadows before the 40-tile island
`createBlobShadow` makes a fresh geometry AND material per blob; only the alpha
texture is shared. +1 draw call each, measured 1.74 per tile — fine now, ~70 extra
at 40 tiles. Prop blobs are STATIC and all share opacity, so a shared unit geometry
plus one shared material collapses them to ~1. **Must exclude pets**, whose
`castShadow` mutates opacity per frame. Natural home: beside the Phase 5 lighting
rework.

### PB-015 · Tablet screenshot wanted: a rim mountain's shadow
Hills and mountains at 1.92 tall / 0.96 reach throw an ellipse whose far edge lands
~3.7 units from the base, spanning neighbouring tiles and overhanging the sea. The
arithmetic is right for a 35° sun and pets already do this at the coast, so no
clipping rule was invented. If it reads broken on the tablet, cap stretch/radius for
`big` features rather than inventing clipping.

---

## Phase 5, from the brief

Items 7–12 and 14–17. **Each has its own card, and this one line was standing in
for ten of them** — that is why they kept looking unplanned. The mapping:
`PB-016` item 7 (progressive album + set unlocks), `PB-017` item 8 (habitats,
nursery, move-in), `PB-018` item 9 (pet quests v1), `PB-019` item 10 (the daily
visitor), `PB-020` item 11 (small ports), `PB-021` item 12 (per-item records +
scheduler), `PB-022` item 14 (biome & tile ladder), `PB-023` item 15 (stardust,
the Star Pool, the first wonder), `PB-024` item 16 (the persona simulator),
`PB-025` item 17 (blossom enchantment I). Their scope notes live in
`joe/backlog.json`, not here.

Item 7 is the one with a consequence attached: **the ladder is 600 creatures,
not ~1,000**, because the spotted twelve were dropped once it was proved the
atlas cannot express a spot. Either a third wearing arrives with a positional
signal behind it, or the pacing re-bases on 600.

**And as of 29 July that number is the OLD ceiling.** `PB-036`'s brief landed as
`docs/pet-island-species-roster.md` and adds ~296 builds across 20 collections on
top of the live 24, shipped one collection at a time on the existing 85% unlock
cadence. So item 7's ladder must be read against the roster before anyone
re-bases pacing on 600. `album.ts:140-168` already reserves the third row for
this.

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
