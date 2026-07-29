# PB-036 handoff — themed animal collections

*Run 10 (PB-036 manager, phase 2), written 29 July 2026. Read
`docs/MANAGER-ORDERS.md` for the job. This file is PB-036's baton only —
`docs/MANAGER-HANDOFF.md` belongs to the queue manager and was not touched.*

## Queue position

- **Phase 1 (the spine): DONE.** Species-as-data, the roster, the quadruped kit,
  the name table, Joe's audit bench.
- **Phase 2 (fan out, one agent per collection): DONE for every collection the
  built kit can carry.** Four collections, 50 species, all five gates green,
  pushed. `origin/main` is level at `9ee9e38`.
- **Phase 3 (the next kit): NOT STARTED, and it is the whole of the next run.**
  See "Where the next manager starts". **Songbird.**
- Nothing ships to a child yet, on purpose — see "Why nothing is wired".

## What this run did

Four subagents, one collection each, against the one kit that exists. Every
brief named the members AND the kit per member, so no agent ever chose a shape.

| collection | built | rostered | missing, and the kit it needs |
|---|---|---|---|
| garden | 13 | 14 | slow-worm — legless, **bespoke** |
| home-pets | 10 | 16 | budgie/canary/cockatiel/lovebird **songbird**, corn-snake **bespoke**, goldfish **swim** |
| woodland | 14 | 16 | pheasant, capercaillie — **songbird** |
| africa | 13 | 16 | crocodile, ostrich **bespoke**, vulture **raptor** |

**The measured fact that shapes everything after this: no collection in the
roster is 100% quadruped.** Independently classified all 296; the kit split is
quadruped 142, bespoke 53, songbird 41, swim 22, raptor 20, minibeast 18.
Garden is the closest to complete at 13/14. So "collections ship one at a time"
cannot happen at all yet, which is JT-030 (raised, open).

Also landed Joe's two rulings — see Decisions.

## Gate results

Tree hashed immediately before and immediately after a clean back-to-back run
of all five, with no edits in between:

```
BEFORE: f704df6d8cb8c76368506b647cded1759ea4ec9d13ecf5a2496e2ddcd25935b1
$ npm test          Test Files  85 passed (85)   Tests  1730 passed (1730)
$ npx tsc --noEmit -p tsconfig.json      exit 0, zero bytes of output
$ npm run build     2 bundles, dist/island/assets/index-BVdYwsHj.js 736.95 kB
                    gzip 200.70 kB, PWA precache 8 entries (773.57 KiB)
$ npm run smoke     8 ok checks — all boot checks passed
$ npm run parity    every step renders identically
AFTER : f704df6d8cb8c76368506b647cded1759ea4ec9d13ecf5a2496e2ddcd25935b1
TREE UNMOVED
```

**My own revert-check, which I personally watched go red:** raised the bear's
`body` 0.95 → 1.45 in `collections/woodland.ts`; `species-silhouette.test.ts`
went red twice — *"a creature this wide cannot path between two trees"* and
*"a collection got wider — retune it, do not raise the cap: 'woodland was 1.58
and is now 1.90'"*. Restored, 6 passed.

**Agents' own revert-checks, reported to me separately and NOT watched by me:**
garden broke a dormouse tail and watched the four-small-creatures test fail;
home-pets broke a degu `body` and then added a stub budgie, 2 red; woodland
dropped a wolverine height, 1 red; africa cloned the meerkat off the mongoose,
4 red; unlock broke `OPEN_AT`, the held-back filter and the fallback, 8 red
across three checks; naming re-pinned a hedgehog name, 3 red.

## Where the next manager starts

**Build the SONGBIRD kit, then fan out onto it.** That is the entire next run
and it is the same shape phase 1 used for quadruped: build the kit, test it,
then one subagent per collection with the members and the kit named for them.

Why songbird and not bespoke, even though bespoke unlocks more species (53 vs
41): bespoke is not a kit, it is thirty one-offs that happen to share a look
(`types.ts:27`), so it is the least uniform and the worst thing to build while
learning the pattern. Songbird immediately **completes two collections** —
woodland (2 birds) and farm (7) — and farm is in Joe's own proposed ship order.
Bespoke should be last.

- `src/island/species/types.ts:159 PendingBuild` is the placeholder every
  unbuilt kit shares. Songbird becomes a real `SongbirdBuild` interface beside
  `QuadrupedBuild`, and **its extras list must be CLOSED for the same reason**
  (`types.ts:131` explains it): an open list lets phase 3 invent a part per
  species and quietly rebuild the sculpting roster §1 rules out.
- `src/island/species/kit.ts:56 KITS` is where it registers; `buildSpecies`
  currently throws `UnbuiltKitError` by name for all five.
- **Read the `>>>` block in `kits/quadruped.ts` before choosing any number.**
  It is the correction below and it will bite the bird kit too.
- Songbird's collections: birds (17 of 18), farm (7), home-pets (4), outback
  (3), ice (2), woodland (2), and singles elsewhere.

**The three wiring seams remain unwired and are unchanged from phase 1**, except
that one instruction is now WRONG:
1. `src/island/pets.ts:554` in `prototype()` — the early return that registers a
   built species instead of loading a GLB. Exact line at the foot of `kit.ts`.
2. `src/island/variants/atlas.ts:146 dress()` must return early for built
   species; a built pet has no atlas UVs. `paletteFor()` in `kit.ts` replaces it.
3. `src/island/main.ts:1174` — swap `petName(defaultRng)` for `givenName(...)`.
   **Phase 1 said to call `givenName(species, setId)`. JT-029 removed that second
   argument. It is `givenName(species)` and you pass no set at all.**

## Why nothing is wired

Roster §3's order is generate → audit → freeze, and Joe is auditing now. Beyond
that, **JT-030 is open**: no collection can ship complete, so whether a
collection may unlock with a hole in it is unanswered, and it decides what she
sees on an album page. `shippedIn()` already returns only built members, so it
supports either answer for free.

## What I learned that is not in the code

- **The quadruped kit's own header gave backwards advice, and three agents found
  it independently.** It said express long-and-low by dropping `legs` and
  `height`, "which costs nothing". The fit is uniform and solves for `height`,
  so dropping `legs` lowers the raw silhouette, RAISES the fit scale and
  stretches the body in world units. A stoat built as the comment said measured
  **1.78** keep-out against a live pack whose widest is the fox at **1.16**.
  Corrected in place with the measurements; `species-silhouette.test.ts` now
  enforces it. Separately, `ears: 'long'` inflates pre-fit height, so a
  long-eared species silently measures SLIM.
- **I could not find a principled keep-out rule and stopped guessing.** Two were
  tried and both are wrong: "small species stay inside the pack envelope"
  condemns the stoat/otter/mink/ferret/gecko, which are genuinely long;
  "keep-out ≤ pack × `body`" condemns the hippo, which is wide from bulk, not
  length. `body` is a length multiplier and keep-out is `max(width, depth)` —
  different axes. The file ships a hard ceiling plus a per-collection **ratchet**
  and says outright it is not a rule. **Harmonising the four bars (garden 1.16,
  home-pets 1.28, africa 1.40, woodland 1.58) is a real open question.**
- **Parallel agents will each pick their own bar and every one will be
  defensible.** None of the four could see the others. Cross-collection
  invariants are the manager's job and cannot be delegated — that is the entire
  reason `species-silhouette.test.ts` exists.
- **`joe/tasks.json` moved under me three times in one run.** The re-read-append-
  reparse-verify procedure in MANAGER-ORDERS is not paranoia; it saved two of his
  notes. Committing it alone immediately after each pickup is what keeps the blob
  recoverable.
- **A test asserting a thing is ABSENT becomes a landmine the moment you wire the
  thing in.** `species-woodland.test.ts` asserted `speciesRecord(id)` was
  undefined; wiring the registry made it fail, and the tempting fix is to delete
  it. Its real invariant was "must not resolve to a FROZEN pack animal", which is
  what it asserts now.

## Decisions

**RAISED this run:**
- **JT-030** — *NEEDS JOE: no collection can ship complete on one kit — does a
  collection unlock PARTIAL?* Options (a) wait for kits, (b) unlock partial and
  show only what is built, (c) unlock partial with silhouetted "not yet" slots.
  Nothing is built on the answer; it gates the wiring, not the data.

**PICKED UP this run:**
- **JT-029** — *"we drop the colours, only the sets in their natural color…"*
  Names key on SPECIES alone. `givenName`/`nameSeed` lost their `setId`
  argument; `NATURAL_SET` keeps the hashed key's shape so **not one creature was
  renamed** — a new test rebuilds every name from the old two-part key to prove
  it. The audit bench went 14 → 50 rows. **The wider half of his sentence — that
  pets stop wearing the 25 variant sets at all — was NOT acted on.** It touches
  what a child already owns, the recolour machinery is no longer on the critical
  path, and nothing was built on it either way.
- **JT-027** — the unlock ladder, built pure and unwired in
  `src/island/species/unlock.ts` (+27 tests). 80% opens the next; four active at
  most; at the cap only a completion releases one; random order via a supplied
  seeded rng; legendary/dinosaurs/prehistoric held back. **"Perceived as related"
  is my judgement, not his** — a `RELATED_GROUP` table, marked as mine and
  overrulable by moving one string; its point is that the four conservation
  tiers share a group so they cannot open back to back. **The brief's "existing
  85% cadence" never existed in code**; 80 is the first real number, not a
  correction, and `types.ts:202` now says so.
- **JT-026** (*"c)"*) and **JT-028** (*"lets stick with a)"*) — both resolve to
  what is already live. Verified rather than assumed: `9138176` built option (c),
  and `interactions.ts:159` still carries the `!flow.plot` guard that IS option
  (a). **No code change, and none was made.** Neither is a PB-036 card.

## For Joe's review hour, in the workbench

`joe/names-audit.json`, 50 rows, ordered by ship order then roster order.
**One collision to settle first: `Gichesh` is drawn for BOTH the warthog
(africa) and the otter (woodland)** — roster §3 wants the name to be playground
currency, and "have you got Gichesh?" currently names two creatures. A
`replacement` on either fixes it. Worth reading aloud early: `Chashet` (bear),
`Thuckwa` (chipmunk), `Buthtu` (guinea pig), `Hecksa` (hamster), `Nawuck`
(vole), `Chahoop` (elk). The `natural/animal-slow-worm` row was REMOVED — it has
no kit, so auditing and voice-baking a name for it would be premature; nothing
of his was on it.

**Still unblocked but undone, and it needs a browser, not Joe:** the seven badged
base-24 species in `registry.ts` still carry no IUCN category. Phase 1 refused to
write them from memory and so did I — `Threat.checkedDate` exists so a status is
a dated reading of the Red List, and a remembered one only looks checked.

## Why this run stopped here

Context. I was asked to keep building through Joe's hour and to start the next
kit; at ~28% of the window, building songbird properly AND fanning out onto it
would have run past the 30% ceiling, and a half-built kit is exactly the
incompatible-kit failure the phase-2 brief was written to avoid. Everything
in flight is finished, gated, committed and pushed, and the songbird brief above
is complete. A fresh manager at 5% beats a tired one at 60%.
