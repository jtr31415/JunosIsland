# PB-036 handoff — themed animal collections

*Run 11 (PB-036 manager, phase 3), written 29 July 2026. Read
`docs/MANAGER-ORDERS.md` for the job. This file is PB-036's baton only —
`docs/MANAGER-HANDOFF.md` belongs to the queue manager and was not touched.*

## Queue position

- **Phase 1 (the spine): DONE.** Species-as-data, roster, quadruped kit, name
  table, Joe's audit bench.
- **Phase 2 (fan out on quadruped): DONE.** Four collections, 50 species.
- **Phase 3 (the name collision + the songbird kit): DONE.** 72 species built,
  **woodland and farm are the first two COMPLETE collections in the game**.
  All five gates green, pushed, `origin/main` level at `88b290b`.
- **Phase 4 (the next kit): NOT STARTED. Raptor — see "Where the next manager
  starts", and note it is now the CHEAPEST kit, not just the next one.**
- Nothing is wired to a child yet, on purpose — see "Why nothing is wired".

## What this run did

**1. The defect first: `Gichesh` named two animals.** Phase 2 shipped that name
on both the warthog and the otter and left it for Joe to settle by hand with a
`replacement`. That was the wrong place to fix it — the seed is per species, so
independent draws collide by the birthday problem, and a manual fix recurs every
time the roster grows. Roster §3 makes the given name playground currency: "have
you got Gichesh?" must identify ONE creature.

So the generator was fixed instead. `naming.ts _allocate` walks all 320 rostered
species in roster order and gives each the first name off its **own** seeded
stream that is both in band and not already taken. Deterministic, pure,
collision-free by construction.

**The load-bearing choice: allocation runs over the whole ratified ROSTER, not
over the built species.** All 320 are named whether or not a kit exists to build
them, so finishing songbird — or swim, or the last bespoke one-off — cannot
rename a single creature. Had it run over what is built, every new kit would
reshuffle names of animals children already own.

**Exactly one creature moved, and it is named:** the warthog is Africa
(collection 4), the otter is Woodland (9), so the warthog KEPT `Gichesh` and the
otter took the next name off its own stream — **`Vuhick`**. A test rebuilds all
320 names the old blind way and asserts the diff is `['animal-otter']`; that is
phase 2's "renamed nobody" discipline extended, not discarded. The slack that
permitted three collisions is now zero. Juno's pets are untouched: pin table
still empty, no save read, no id moved.

**2. The songbird kit, then one agent per collection.** Songbird was chosen over
bespoke (which unlocks more species, 53 v 41) because it CLOSES collections
rather than widening the front. Woodland +2 game birds → **16/16**. Farm arrives
whole → **16/16**. Home Pets 10 → 14. Total built 50 → 72.

`kits/shared.ts` now holds the primitives, colour maths and `fitRig`, as a pure
move with no number changed; quadruped imports them. Every measured expectation
in the five pinning test files passed untouched — that is the evidence the move
was pure, and it is why six kits will not drift apart.

## Gate results

Hashed over the files this run owns, immediately before and after a clean
back-to-back run of all five, no edits between:

```
BEFORE: 293aaf4e17ed725996421f9fdb06817de802c690371fb782adf3ea2abbb13802
$ npm test        Test Files 89 passed (89)  Tests 1837 passed (1837)
$ npx tsc --noEmit -p tsconfig.json          exit 0, zero bytes of output
$ npm run build   dist/island/assets/index-DVaKOGjz.js 736.95 kB gzip 200.70 kB
                  PWA precache 8 entries (773.57 KiB)
$ npm run smoke   all boot checks passed
$ npm run parity  every step renders identically
AFTER : 293aaf4e17ed725996421f9fdb06817de802c690371fb782adf3ea2abbb13802
TREE UNMOVED
```

**Two honest caveats, both about a CONCURRENT SESSION in this repo.**
1. `npm test` unfiltered reports **1 failed / 1852**:
   `species-facts.test.ts > covers every shipped species`. That test and
   `joe/species-facts.json` are **untracked** — another session's live JT-031
   work. It fails because I added 22 species and their fact file has 74 rows.
   The 89/1837 above is the same suite with that one untracked file excluded,
   i.e. the committed tree. **I did not write facts for the 22.** Joe's JT-031
   ruling is that facts are agent-written *and fact-checked*; inventing 22 pairs
   as a side effect of a kit run would defeat the checking.
2. The whole-index hash moved mid-run because that session staged its own files
   while my gates ran. That is why the hash above is scoped to my paths, and it
   is why I committed by explicit path rather than from the index.

**My own revert-check, personally watched:** disabled the `taken` check in
`naming.ts draw()` — six named tests went red across three describes
(`never collides across the whole roster`, `renamed exactly one creature…`,
`allocates over the whole ROSTER…`, both pin tests, and `cannot drift from the
generator`). Restored, 32 passed.

**Agents' own revert-checks, reported to me and NOT watched by me:** the kit
agent broke `wingbar-*` into `wing-bar-*` (which would hand `pets.ts` four flap
targets) — 1 red; woodland gave the capercaillie the pheasant's tail — 2 red
including the geometric one; home-pets gave the lovebird the canary's tail — 1
red; farm collapsed the mule into the donkey — 2 red.

## Where the next manager starts

**Build the RAPTOR kit, then fan out.** It is now both the highest value and the
cheapest, which has not been true of any kit until this one:

- **It completes a whole collection in one run.** Raptors is 16 members and
  essentially all of them ride this kit — the same "close a collection" logic
  that made songbird the right second kit. It also releases birds' owlet and
  africa's vulture.
- **Most of it already exists.** A raptor is a songbird with a hooked beak,
  broad wings and talons. `beak: 'hooked'` was deliberately LEFT OUT of
  `SongbirdBuild` and the reason is written in `types.ts` — hooked beaks belong
  to raptor, so an owl cannot be smuggled in as a songbird. Build `RaptorBuild`
  beside `SongbirdBuild`, reuse `kits/shared.ts`, keep its extras list CLOSED.
- Order after that: **swim** (22, and Ocean is the biggest untouched
  collection), then **minibeast** (18, Critters), then **bespoke LAST** — it is
  ~30 one-offs, not a kit, and it is the last blocker for garden (the slow-worm
  alone, 13/14), home-pets and africa.

The three wiring seams remain unwired and unchanged:
1. `src/island/pets.ts` `prototype()` — the early return that registers a built
   species instead of loading a GLB. Exact line at the foot of `kit.ts`.
2. `src/island/variants/atlas.ts` `dress()` must return early for built species;
   a built pet has no atlas UVs. `paletteFor()` in `kit.ts` replaces it.
3. `src/island/main.ts:1174` — swap `petName(defaultRng)` for `givenName(species)`.
   **One argument, not two** (JT-029 removed the set).

## The keep-out question: ASKED, ANSWERED, AND THE ANSWER IS NO

Phase 2 left "harmonise the four bars" open and warned against a third guess. I
tested a real hypothesis rather than guessing: keep-out is a *pathing* radius, so
the principled bar should come from the island's geometry — the narrowest gap a
pet must fit through. **It is false, and the measurements are in
`species-silhouette.test.ts` so nobody looks there again.**

- `pets.ts:652` measures radius AFTER the 0.16 field scale, so kit-space 1.16 is
  0.186 world units; adjacent hex centres are 2.0.
- The largest obstacle is a mountain tile, not a tree: `footprintBelow` at
  walking height is 1.062.
- Two adjacent rock-hex mountains are both centred, so the gap between them is
  `2.0 − 2 × 1.062 = **−0.124**`. Negative before any pet exists. No bar on pet
  width can be derived from a corridor that is already sealed.
- `clearOf` fails SOFT and `randomSpot` degrades to "stay put", so keep-out was
  never a hard invariant. It is a quality bar.

**The ratchet therefore stays, and stays labelled a ratchet** (garden 1.16,
home-pets 1.28, africa 1.40, woodland 1.58, farm 1.38 — added this run from the
water buffalo at 1.379). No fourth guess was shipped.

**DEFECT FOUND ON THE WAY — IT NEEDS A BACKLOG CARD AND I DID NOT WRITE ONE.**
Placement checks overlap with `footprintOf` (axis-aligned half-extent, 0.938,
measured PRE-ROTATION) while pets collide against `blocks`, which uses
`footprintBelow`'s rotation-invariant reach (1.062). **Two different,
disagreeing metrics on the same object**, so the island can legally place a pair
of mountains a pet of any size cannot pass. `props.ts:1214` vs `props.ts:1271`.
I did not card it because `joe/backlog.json` was being edited by the concurrent
session and colliding with it was the worse risk. **Card it.**

## For Joe's review hour, in the workbench

`joe/names-audit.json` is now **72 rows**, regenerated and ordered by ship order
then roster order. The regeneration carries his three fields across by
`speciesId`, so it can grow under him without ever costing him a verdict — that
contract is now asserted in `naming.test.ts`. The new animals also appear in the
3D turntable the concurrent session shipped at `d5e2921`, which is kit-agnostic
and picked them up for free.

**Flagged by the agents for his eye, in confidence order:**
- **`animal-water-buffalo` (farm) vs `animal-buffalo` (africa)** — the farm agent
  is least confident here. 2.25 v 2.15, separated by a colour temperature. Two
  collections, no agent could see both.
- **`animal-cockatiel` vs the FROZEN `animal-parrot`** — 1.52 v 1.55. The whole
  separation rides on the crest and the grey.
- **`animal-capercaillie` (woodland) vs `animal-turkey` (farm)** — same beak,
  same tail, same wings, a shared `ruff`, heights 0.07 apart, built in the same
  hour by two agents neither of whom could see the other. Now guarded by the
  WATCHED list in `species-silhouette.test.ts`.
- **`animal-canary` vs `animal-lovebird`** — keep-outs 0.001 apart.
- **`animal-mule` vs `animal-pony`** — 2.00 v 1.95, separated by long ears and a
  dun coat.
- **`animal-quail` at 1.30** is below the pack floor of 1.43. Deliberate — the
  album wants one little one — but it is the one departure.
- **Names worth reading aloud:** `Vuhick` (otter, the replacement), `Hissdu`
  (turkey), `Goncha` (pheasant), `Pewod` (budgie), plus phase 2's `Chashet`
  (bear), `Thuckwa` (chipmunk), `Hecksa` (hamster), `Nawuck` (vole).
- **A real finding, not a workaround:** `'stout'` stands in for a parrot's
  hooked bill and reads as "seed-eater", not "parrot". The raptor kit's
  `'hooked'` will fix budgie/cockatiel/lovebird properly and free `'short'`/
  `'stout'` back up as separators. Not worth blocking on.

**Still undone and it needs a browser, not Joe:** the seven badged base-24
species carry no IUCN category. Three phases have now refused to write them from
memory — `Threat.checkedDate` exists so a status is a dated reading of the Red
List, and a remembered one only looks checked.

## What I learned that is not in the code

- **A test that predicts its own death should be believed.**
  `species-registry.test.ts` asserted no collection was 100% shipped and said in
  its comment "if this test ever goes red, a second kit landed and that question
  became live." It went red. It was INVERTED, not deleted — it now names farm
  and woodland explicitly, so completeness stays a stated fact rather than a
  side effect.
- **`m.body` in `species-silhouette.test.ts` was dead** and carried a TODO
  saying a second kit would need a per-kit read of it. It was collected and
  never asserted on — a leftover of the abandoned "keep-out ≤ pack × body" rule.
  Removed. Everything that file enforces is measured off BUILT geometry, which
  is kit-agnostic by construction, so a new kit needs to do nothing to be
  measured. That TODO would have cost the next manager an hour.
- **This repo is not single-writer any more.** A second session was committing
  to `main`, editing `joe/tasks.json`, `joe/backlog.json` and
  `joe/names-audit.json`, and had files STAGED in the index while my gates ran.
  Commit by explicit path (`git commit -- <paths>`), never from the index, or
  you will ship their half-finished work under your message. One of my agents
  also swept an in-flight edit of theirs into a `git stash -u` and had to undo
  it carefully.
- **`JT-030 was never actually written.`** Phase 2's handoff says it raised the
  card; no commit of `joe/tasks.json` has ever contained a JT-030. The append
  was lost, most likely to the UI-save race HANDOFF §6 documents. **Verify a
  workbench raise by re-reading the file from disk after committing it** — the
  handoff claim is not the evidence, the blob is.
- **`tests/island/pettap.test.ts > does NOT let the camera into the keep-out or
  the blob` is a pre-existing flake**, ~1 run in 6 under cold-cache load, proved
  by an agent against the *committed* tree (2 failures in 12 cold runs). `pets.ts`
  seeds `phase`/`goal`/`restFor` from `Math.random()` and the pet resets to
  (0,0,0), exactly the obstacle centre, where push-out is degenerate.
  `governors.test.ts > leaves a wide corridor…` shows the same load sensitivity.
  Not species code. Worth its own card.

## Why nothing is wired

Unchanged from phase 2: roster §3's order is generate → audit → freeze, and Joe
is auditing. **JT-030 is still open** and it decides what a child sees on an
album page. `shippedIn()` returns only built members, so it supports every answer
for free.

## Decisions

**RAISED this run:**
- **JT-030** — *NEEDS JOE: does a collection unlock with a hole in it?* Phase 2
  believed it raised this and the record never reached the file, so **Joe is
  seeing it for the first time**. Options: (a) wait for kits, (b) unlock partial
  showing only what is built, (c) unlock partial with silhouetted "not yet"
  slots. Nothing is built on the answer; it gates the wiring, not the data.
- **JT-030 amended** later the same day, because the songbird kit falsified its
  own opening premise: two collections are now complete, so option (a) is a real
  choice rather than a way of shipping nothing. Corrected rather than left to
  mislead him.

**PICKED UP this run:** none. JT-030 is the only open ruling. **JT-031** (facts
get written by an agent, then checked, then signed off with the name) was raised
and answered by the concurrent session, not by me — its work is that session's.

**NOT ACTED ON, deliberately, and inherited intact:** the wider half of JT-029 —
*"we drop the colours"*, which implies the 25 variant sets stop applying to pets.
It touches pets Juno already owns, so phase 2 left it and so did I. Nothing is
built on it either way. **It needs Joe, and no subagent should tidy it away.**
