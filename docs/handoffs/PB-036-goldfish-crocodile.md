# PB-036 — the goldfish and the crocodile

*Written 2 August 2026 by the manager for this pair. Read
`docs/MANAGER-ORDERS.md` for the job and `docs/PB036-HANDOFF.md` for the species
baton. This file is the record of one run; it is not the queue.*

---

## What landed

Two species on the parts-bank assembly route, in the same deterministic style as
the fifteen before them.

| | collection | before | after |
|---|---|---|---|
| `animal-goldfish` | Home Pets | 15 of 16 | **16 of 16 — COMPLETE** |
| `animal-crocodile` | Africa | 13 of 16 | 14 of 16 |

**Home Pets is the fourth complete collection**, after garden, woodland and
farm. That matters beyond the tick: `completion()` divides by ROSTER size, so a
collection that can never be fully built can never complete, never goes inactive
and never releases one of the four active slots JT-027 allows. Home Pets had
been holding one of those four permanently.

**The `swim` kit was never built and now never needs to be.** The goldfish was
rostered against it since phase 2. Both of Home Pets' stragglers left the
deferred list the same way — by being assembled from the pack's own geometry
rather than by waiting for a kit — and that is the pattern worth carrying
forward: *a collection's shortfall is not a queue of kits, it is a queue of
animals.*

## The three species NOT built, and why that is a ruling rather than a gap

`animal-ostrich` and `animal-vulture` were explicitly out of scope and stay out.
The reason is now MEASURED rather than asserted, and `species-africa.test.ts`
measures it on every run:

- the `wing` role is declared in `bank.generated.ts`'s `PartRole` union and
  occurs **zero times** in the data — as do `horn` and `claw`;
- the pack's own three birds (parrot, chick, penguin) donated **no wing
  either**: each is a fused hull plus a beak, legs and eye cards.

So there is no shape to adapt and rule 1 (adapt before authoring) has nothing to
work on. How those two should read is a **look** decision and it is Joe's. The
day somebody banks a wing shape, that test tells them the absence has changed.

---

## THE CARD'S PREMISE WAS HALF WRONG — measure before you build to it

`PB-036`'s card says the bank "already has a real fish hull `box-20` and its
shell-band `box-19`". Half of that is true and the other half would have wasted a
build. Measured against `box-03`, the default cube:

- both are 1.250 on all three axes; both sit at `[0, 0.80625, 0]`; both have the
  same coordinate value set on every axis;
- `box-20`'s unique point set is a strict **superset** of `box-03`'s — 40 points
  against 32, and not one of `box-03`'s is missing;
- the eight extra points are `(±0.5, ±0.5, ±0.3125)`: the four vertical chamfer
  edges, each split once.

**`box-20` is the same chamfered cube as `box-03`, retriangulated.** It costs +18
triangles and +20 vertices and changes the silhouette not at all. It is still the
right hull to take — it is the shape this animal's own donor wore, so the lineage
is exact, and the 18 triangles are wanted — but a build planned around "a
fish-shaped body" would have found nothing there.

`box-19` is the real find. Measured off its raw positions it is an **open
octagonal hoop**, not a disc: no vertex comes near the axis, the radius runs 0.65
at z = −0.26 out to 0.702 across the middle and back to 0.65, with a chamfered
lip at both ends. Worn upright and concentric with the body it is a dorsal fin, a
ventral fin and a gill line in one part. That is what makes Kenney's fish a fish.

This is the third time on this project a card has been wrong about itself. The
corn snake baton says so in as many words. **Re-measure the premise.**

---

## THE PACK'S OWN FISH WOULD FAIL RULE 9's FLOOR — and it is the VERTEX floor

Worth writing down because it shaped the whole build. Kenney's fish is a cube, a
hoop, two eye cards and a mouth card: 78 + 92 + 60 + 12 = **242 triangles and 156
vertices**, against `MODEL_TRIS_MIN` 422 and `MODEL_VERTS_MIN` 405.

Rule 9's budget is a **floor as well as a ceiling**, the floor was measured over
24 animals that all carry four legs (176 triangles), and a fish carries none.
`budget()` in `assembly-assert.ts:326` enforces the floor with no escape hatch —
`overBudget` only forgives a ceiling.

**And the binding floor is the VERTEX one, which is the opposite way round from
what it looks like.** This was measured after the fact, by the agent writing the
tests, and it corrected a claim I had already written into the species file. The
goldfish is 758 triangles and 480 vertices. Take the tail off and it is 546
triangles — still clear of 422 — but 366 vertices, under 405. Take the scales off
instead and it is 454 triangles, again clear, but 288 vertices, again under.
**Either part alone satisfies the triangles; neither alone satisfies the
vertices.** That is what made the goldfish a two-part answer rather than a
one-part one.

**Budget a legless species against the vertex floor first.** And note the second
trap in the same place: the bank's `verts` field is RAW and the built geometry is
indexed and deduplicated, so the two differ by roughly 3× (`box-20` is 140 in the
bank and 44 built). Estimating from the bank will mislead you by a factor of
three in the direction of thinking you are fine.

The corn snake hit this same wall one species ago and paid it with fifteen
saddles. The goldfish paid it with the two parts Kenney's fish most obviously
lacks and a goldfish most obviously has: a tail and scales.

---

## The goldfish, measured

```
height 1.6125   keep-out 0.877   verts 480   tris 758   fingerprint 58c690f8271aaca6
  hull    box-20    the fish's own hull record (= box-03 retriangulated)
  fin     box-19    the fish's shell-ring, no spin, stretch [1, 1.148504, 0.5], sink 0.887597
  tail    wedge-15  the lion's, at [0, 0.80625, -0.625], donor's own facing and burial
  eyes    plate-08  the fish's own ROUND card, y 0.89375
  mouth   plate-03  the fish's own face card, at [0, 0.686849, 0.635]
  scale   wedge-04  ridge, rows ['chamfer'], count 4, span 0.5
  legs    NONE
```

**The fin ring's height is solved, not chosen.** The ring is concentric with the
body — that is where its donor wore it — so whatever it stands proud of the back
it also reaches below the belly. Make that reach `HULL_BOTTOM_Y` (0.18125, the
height the pack's legs hold every other animal up by) and its underside lands on
y = 0: the plane the feet would have stood on. The ring is therefore the hull's
own 1.250 plus the leg row twice, 1.6125, and the animal measures 1.6125 tall.
Joined at the hull's **top** face, which is the face its own `y +1` attachment
names, so the burial transfers legitimately.

**The scale count is EVEN, and that is a measurement.** An odd `count` puts a
ridge station at z = 0, which is exactly where the fin ring is. A part there
reaches 0.782 out along the chamfer diagonal against the ring's own 0.788 — it
builds **inside** the hoop, invisible, and is paid for in full. The first build
did that four times over and the tool's per-mesh table is what showed it. There
is now a test that goes red if anyone changes `count` or `span` back.

**`box-19` is also the tortoise's shell rim** (`animal-tortoise.ts:142`), spun
`{axis:'x', deg:90}` — turned flat into the ground plane. The goldfish's is not
spun at all. Same shape, opposite axis, and the tests assert it both ways round
so neither can drift into the other. Same for `wedge-04`, which is the corn
snake's saddle and is in the same collection.

---

## The crocodile, measured

```
height 1.5857   keep-out 1.045   verts 573 (body 445)   tris 772   fingerprint c4bafe77662805a1
  hull    box-03    the default cube
  snout   box-18    stretch [1.811594, 0.501603, 1], at [0, 0.6875, 0.625], donor sink 0 -> flush
  tail    wedge-03  the beaver's paddle, at [0, 0.80625, -0.625], donor's own facing and burial
  scute   wedge-06  ridge, rows ['top'] ONLY, count 5, span 0.5
  legs    { x: 0.4375, z: 0.375 }   (the defaults are x 0.27, z 0.25)
  eyes    plate-01  default
```

**The jaw is the elephant's trunk, which the bank filed as a tail.** §3.1 is
exactly this: a shape is named for what it IS, never for what it was. `box-18`
has the longest forward reach in the bank — 0.425211 — at a recorded burial of
**zero**, which is the trunk sitting flush on the front face. It is not stretched
on z, because that reach is what the keep-out is spent on. It IS stretched in
plan, to 0.625 × 0.3125: **the 2:1 ratio is what makes it a crocodile and not a
muzzle.**

**The jaw's height is a solved bound.** `box-18`'s own recorded 0.482248 (the
elephant's trunk root) would put its lower edge at 0.326 — off the bottom of the
hull's flat front face and onto the chamfer, where it would float. The flat face
runs 0.49375 to 1.11875, so the lowest centre that keeps the whole jaw on flat
geometry is 0.65. 0.6875 is the next notch up the pack's 1/16 grid.

**The legs sit at the exact edge of the footprint.** `box-01` is 0.375 across, so
at `x: 0.4375` each leg's outer face lands on 0.625 — the hull's own side, and
not one thousandth past it. The pack's axiom, checked over 23 of 23 animals, is
that every leg is inside the body's footprint; this is that axiom at its limit,
which is as sprawled as a fixed leg row can be while still telling the truth.

**One ridge row, on the top only — no other assembled species does this**, and a
sweep of `ASSEMBLED_BUILDS` in the test proves it is the only one. The chamfer
idiom exists to make a cubic back read ROUND, and a crocodile is the one animal
here that must not: it is flat-backed and its scutes run in a single line down
the spine.

**That line turned out to be load-bearing on the budget, not just tidy.** A top
row is not mirrored; a chamfer or side row is. Adding either takes five parts to
fifteen and 772 triangles to 1392, against a ceiling of 951 — `defineCreature`
throws `RULE 9` at module load. There is a test that asserts the throw, because
the throw happens before any named test can run (see the revert-check note
below).

**IT HAS NO TEETH, AND THAT IS AN ASSERTION.** `wedge-04` and `wedge-05` carry
the pack's `tooth` role and would have mounted on the jaw's own anchor for free,
with no chosen number anywhere. They are left off because brief §19 is "bright,
never scary" and a crocodile is precisely where that bites — the same guardrail
already bans predation framing in `joe/species-facts.json`. There is a test named
for the reason, so nobody can add them without deleting an assertion that says
why.

---

## The eight places a species costs — confirmed, and it is now nine

The corn snake commit recorded eight. Building two at once confirmed the list and
added one:

1. `src/island/species/parts/assembled/animal-<id>.ts` — the definition.
2. `src/island/species/parts/assembled/index.ts` — one appended export line.
   **Never before the file exists** (the header explains why: a live blank viewer).
3. `src/island/species/collections/<collection>.ts` — the `defineSpecies(id,
   'bespoke')` record, in ROSTER order, plus the collection header prose.
4. **`import '../parts/assembled'` in that collection file** — the ninth place,
   and the one that is easy to miss. `africa.ts` had never needed it. Without it
   the species finds no assembly and builds as a bare hull.
5. `tests/island/species-<collection>.test.ts` — a rework, not an edit.
6. `tests/island/assembly-<id>.test.ts` — the species' own invariants.
7. `tests/island/assembly-fingerprint.test.ts` — the pin.
8. `joe/names-audit.json` — one row, with the generated name.
9. `joe/species-facts.json` — one fact.

Plus two shared counts: `tests/island/naming.test.ts` (audit length) and
`tests/island/species-registry.test.ts` (registry size, per-collection lengths,
the rostered-but-unshipped count, and the complete-collections list).

**`joe/species-facts.json`'s `coveredCollections` tripwire works.** Both
`home-pets` and `africa` were already listed, so the moment the two species
registered, `tests/island/species-facts.test.ts` and
`tests/tools/approver-bench.test.ts` went red naming them. That is the design
working: a shipped species cannot reach Joe's bench factless in a covered
collection. A NEW collection still needs its id added there by hand.

## The tools that did the work

- `npm run pets:creature -- animal-goldfish` — builds the species exactly as the
  game will and prints height against the band, keep-out, the budgets, the
  fingerprint, and **a per-mesh table with where each part joined, how deep it is
  sunk and whether it is still embedded**. That table is what caught the buried
  scales. Run it with no argument for a one-line summary of all seventeen.
- A per-mesh vertex dump is worth keeping to hand: the bank's `verts` field is
  RAW and the built geometry is indexed and deduplicated, so they differ by about
  3×. `box-20` is 140 in the bank and 44 built. Budget against the built numbers.

---

## GATES

All five, run by me on the final tree, `tools/golden/golden.json` untouched
throughout (`git status --porcelain` on it empty at both ends).

```
$ npx vitest run
 Test Files  131 passed (131)
      Tests  2935 passed (2935)

$ npx tsc --noEmit -p tsconfig.json
TSC_EXIT=0, zero output

$ npm run build
PWA v1.3.0 · mode generateSW · precache 8 entries (1284.67 KiB)
files generated  ../../dist/island/sw.js
BUILD_EXIT=0

$ npm run smoke
ok    score bar initialised
all boot checks passed          SMOKE_EXIT=0

$ npm run parity
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically  PARITY_EXIT=0
```

**Read those two numbers carefully, because a parallel manager landed underneath
me mid-run.** My baseline was 128 files / 2859 tests at `175ef4b`. On my own tree
I measured **130 / 2906**: +2 files (the two new species suites, 21 and 22 tests)
and +47 tests, the balance being the two reworked collection suites. While I
worked, PB-028's manager put five commits on `main` (Fred's voice bake), so I
rebased onto `4a8e536` and re-ran all five. The rebased figures above, 131 /
2935, are mine plus theirs. **My contribution is the +2 files and +47 tests;
nothing fell on either count.**

The rebase was clean and had **zero file overlap** — they were in `voice/`,
`script.ts`, `main.ts` and `tools/workbench/`, I was in `species/`. Checked with
`git diff --name-only HEAD...main` before rebasing rather than discovered during
it. **Check that before you rebase, not after**; and check `git rev-list --count
HEAD..main` before you assume your branch is a fast-forward, because HANDOFF §6's
"staging is not a lock" has a sibling: *branching is not a lock either*.

**The two flaky tests the phase-6 baton warns about — `governors.test.ts`'s "wide
corridor" and `pettap.test.ts`'s "does NOT let the camera into the keep-out" —
were green on every run this session, including standalone. They are still
flaky; do not read that as fixed.**

### Revert-checks — mine reported separately from my agents'

**Mine: none.** I wrote no test myself; I wrote the two species, the two
collection records, the fingerprint pins, the shared counts and the two data
rows. Both agents were told to break `src/`, watch the named test go red, and
restore. Both did, and both reported the failing messages.

**Goldfish agent, four:**
1. `ridge.count` 4 → 3 — *"SPACES THE SCALES OFF THE RING — every station clears
   its half-thickness"* went red: `stations -0.5, 0, 0.5: expected 1 to be +0`.
   3 others fell with it.
2. `stretch` removed from the fin — 7 red including the shared harness:
   `1.4078 is shorter than anything in the pack: expected 1.4078… to be greater
   than 1.43`, and `fin is close to hull-sized: expected 1.905… to be greater
   than 3`.
3. `at` removed from the tail — 4 red: `expected 1.204607 to be close to 0.80625`.
4. Unasked, and the best of the four: it removed the `spin` from the **tortoise's**
   rim and confirmed the both-ways-round claim bites from the other side, with
   only that one test moving.

**Crocodile agent, four:**
1. `legs.x` 0.4375 → 0.5 — `leg-r0 hangs off the far side: expected 0.6875 to be
   less than or equal to 0.625000001`.
2. `JAW_Y` 0.6875 → the donor's own 0.482248 — exactly one test red: `the jaw
   hangs off the bottom of the flat face: expected 0.32596… to be greater than or
   equal to 0.49372…`.
3. Ridge `rows: ['top']` → `['top','chamfer']` — **red, but reported honestly as
   NOT reaching the named test.** `defineCreature` throws `RULE 9 — this species
   is 1392 triangles, over the pack's measured 951` at module load, so both files
   fail at import and no test runs. The agent checked that no ridge-row change
   can reach a named test (`['chamfer']` and `['side']` alone are both 1082) and
   added an in-test `expect(...).toThrow(/RULE 9/)` that proves the same fact
   from inside a test that does run.
4. Its own substitute: `count` 5 → 4, which reaches the row test by name —
   `expected [ …(4) ] to have a length of 5 but got 4`.

**`src/` was verified restored by SHA-256, not by `git diff`** — both new species
files are untracked, so `git diff` cannot police them. Worth remembering: on the
run that adds a species, the species file is exactly the file `git diff --stat
src/` will not tell you about.

### The facts were drafted and refuted by two agents, JT-031's method

One agent researched and drafted with sources; a **second, which never saw the
first's reasoning or its URLs**, was given only the two claims and told to break
them. It could not break either, and reached nine pages it fetched directly
(PNAS/PMC, IUCN Crocodile Specialist Group, San Diego Zoo, National Geographic,
the Invasive Species Centre).

It earned one change. The goldfish draft said *"people in China bred the orange
ones"*, which overstates human agency — the mutation arose on its own in wild
crucian carp and the fish were **found** and collected into temple ponds before
anyone bred them. The shipped wording is *"found rare orange ones and bred
more"*. Both `sourceNote` fields carry the caveats the refuter raised, including
the one that matters most for the crocodile: the playback experiments are Nile
crocodile only, so "crocodiles" generally rests on the CSG's descriptive
statement rather than on multi-species trials.

**Two house rules on `joe/species-facts.json` that are not obvious and that I
tripped over**, both enforced by `tests/island/species-facts.test.ts`:
- a fact is capped at **twenty words** (the first goldfish draft was thirty);
- `source` must match `/^https:\/\//`, so an `http`-only institutional page
  cannot be the source field however good it is. The IUCN CSG page is http; it is
  cited in `sourceNote` and a primary open-access paper carries `source`.

---

## What the next manager should know

### Where the species work stands

- **Home Pets: 16 of 16, COMPLETE.** Africa: 14 of 16. The registry is 100
  records; 220 rostered ids still have none, on purpose.
- **Africa's last two are BLOCKED ON JOE, not on effort.** Ostrich and vulture
  need wings and the bank has none. `species-africa.test.ts` measures the absence
  every run. Do not improvise a shape for either — that is the exact failure
  roster §1's "kits before species" exists to stop.
- **JT-034 still gates all kit work** and 72 kit-built species still hang off it.
  Unchanged by this run.
- **JT-036 is unchanged and this run does not answer it**, but it does add
  evidence in its favour: both new animals carry something above the hull (the
  goldfish's fin ring stands 0.18125 proud, the crocodile's scutes 0.154), and
  neither is on the height floor. The four that ARE on the floor — mouse, shrew,
  mole, badger — are still there.

### The one thing I did NOT do, said out loud

**I did not look at either animal in the viewer.** Port 4173 was already bound by
another process (PID 53276) serving a different worktree, and with a parallel
manager live on this machine I judged killing it the worse risk. Both species
therefore rest on measurement plus their `flag`, and both flags say so where Joe
reads them. **Somebody should look at these two before they reach a child**, and
the goldfish's tail is the specific thing to look at (below).

### The look decision that needs Joe — draft `JT-040`

The bank has **no fin, flipper or fluke** — measured, and `docs/how-the-animals-
are-made.md` §14 names that absence as the reason the whole Ocean collection
cannot be built. So the goldfish's caudal fin is **the lion's tail** (`wedge-15`,
the only one of the seven tails nothing had spent), thin and tall and pointed
backwards. Numerically it is right: 0.280 across, 1.0824 tall, tapering to a
half, which is a vertical blade. Whether it READS as a fin at tablet distance is
a look, and the orders are explicit that a look belongs to Joe rather than to
Fable. The exact text to raise is in this run's report to the drumbeat.

If he says no, the fallback is not another shape — there isn't one. It is either
authored geometry (rule 1's escape clause, which he has used exactly once, for
the hedgehog's nose) or the goldfish keeps a stub tail and finds its vertices
elsewhere.

### Two smaller things left tidy rather than fixed

- `joe/species-facts.json`'s `coveredCollections` did its job here because both
  collections were already listed. **A newly shipped collection still needs its
  id added by hand** or its members reach Joe's bench factless and nothing
  shouts.
- `home-pets.ts` had the corn snake's record wedged between the terrapin's doc
  comment and the terrapin's own `defineSpecies` call, so the terrapin's comment
  described the snake. Moved. Worth a glance in any collection file the assembly
  route has touched — the same slip is easy to repeat, and I nearly did.

---

## FOR THE DRUMBEAT — the two data edits this run could not make itself

`joe/backlog.json` and `joe/tasks.json` are held centrally while two managers run
in parallel, so this run did not touch either. Both edits below are exact.

### 1. `PB-036`'s card is now wrong about what is left

Its `detail` ends: *"Goldfish, crocodile, ostrich and vulture are what stand
between both collections and 16/16, which is also what unwedges the two album
slots JT-030 describes."* Replace that sentence with:

> Home Pets is 16 of 16 and Africa is 14 of 16. Ostrich and vulture are all that
> is left, and neither is buildable: both want wings and the bank has none, so
> they are Joe's look decision rather than anyone's next build.

### 2. Raise `JT-040` — NEEDS JOE

```json
{
  "id": "JT-040",
  "type": "ruling",
  "title": "Does the lion's tail read as a goldfish's fin? (PB-036)",
  "detail": "The goldfish is built and Home Pets is now 16 of 16. Everything on it is the pack's own fish — box-20 is the hull the fish donated, box-19 is the fish's own shell-ring worn upright as a dorsal and ventral fin, plate-08 is the fish's round eye and plate-03 its mouth card. One part is NOT: the tail. The bank has no fin, no flipper and no fluke at all — that is measured, and docs/how-the-animals-are-made.md section 14 names the same absence as the reason the whole Ocean collection cannot be built. So the caudal fin is wedge-15, the LION's tail, and it is the only one of the pack's seven tails nothing else had spent. Numerically it is a good fit: 0.280 across, 1.0824 tall, 0.5552 long, tapering to half along its length, mounted at the body's own centre pointing straight back — a thin vertical blade, which is the right shape. Whether it READS as a goldfish's fan at tablet distance is a look, and looks are yours. FABLE WAS NOT ASKED, deliberately: the orders say a decision that changes what a child sees is not Fable's to settle. NOTHING ELSE DEPENDS ON THIS. If you say no, the fallback is not another shape, because there is not one — it is either authored geometry under rule 1's escape clause (which you have invoked exactly once, for the hedgehog's nose) or the goldfish keeps a stub tail and finds its 114 vertices somewhere else, since rule 9's VERTEX floor is what that part is really carrying. Reversing it changes one commit, the feat(PB-036) that added animal-goldfish.ts, and no other species. Two other things on these two animals are also unreviewed and are called out in their own flags: both palettes (neither species was ever in its collection file to be given colours) and the crocodile's deliberate absence of teeth, which brief 19's 'bright, never scary' is the reason for. And nobody has LOOKED at either animal in the viewer yet — port 4173 was bound by another worktree's server during the run.",
  "blocks": ["PB-036"],
  "artefact": "src/island/species/parts/assembled/animal-goldfish.ts",
  "doneRule": "manual",
  "check": "",
  "note": "",
  "state": "open"
}
```
