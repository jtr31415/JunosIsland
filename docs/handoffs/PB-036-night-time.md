# PB-036 — Night Time

*Written 2 August 2026 by the manager for this collection. Read
`docs/MANAGER-ORDERS.md` for the job, `docs/building-animals-from-parts.md` for
the method and `docs/PB036-HANDOFF.md` for the species baton. This file is the
record of one run; it is not the queue.*

---

## THIRTEEN OF SIXTEEN

| | | |
|---|---|---|
| **Built** | 13 | raccoon, wolf, firefly, opossum, nightjar, tarsier, bushbaby, fennec fox, civet, aye-aye, kiwi, kinkajou, glow-worm |
| **Not built** | 3 | bat, sugar glider, scorpion |

Night Time is the **first collection built end to end on the assembly route**,
and the first with no kit build anywhere in it. Joe, this morning: *"only the
garden animals have been built to spec… do not build any more of them. all the
rest must be built in the same way as the garden animals. which should be pretty
much deterministic and quick."*

### The three that are not built, and the exact part each one needed

| species | what it needed | why nothing substitutes |
|---|---|---|
| `animal-bat` | a **membranous wing** | The `wing` role occurs **zero** times in all 94 bank records, alongside `horn` and `claw`. Everything else about a bat is here — `box-06`/`box-07`, the bunny's 0.913-tall upright ears, are the biggest in the bank and are exactly a bat's — but a bat's wings are the animal. Without them it is a mouse with big ears, and this collection already has three of those. |
| `animal-sugar-glider` | a **patagium** | The same absence, and here it bites twice: without the membrane a sugar glider is indistinguishable from `animal-opossum`, which is in this same collection. Two records for one silhouette is worse than one honest gap. |
| `animal-scorpion` | a **pincer**, and a segmented tail | The `claw` role is empty and the pack's one true claw — the crab's — was never banked. There is no segmented limb either. A sting could be found among the tusks; pincers cannot, and brief §19's "bright, never scary" is a second reason not to improvise one. |

**None is waiting on effort or on a kit.** There is no kit coming; the kit route
is closed. They are waiting on a SHAPE, and the only honest ways out are Joe
commissioning authored geometry under §2's escape clause (used exactly once, for
the hedgehog's nose) or the species staying unbuilt.

`tests/island/species-night-time.test.ts` **measures** that absence rather than
asserting it, so the day somebody banks a wing the test says the ruling can be
reopened. It goes red alongside `species-africa.test.ts`'s identical check —
correctly, because one banked wing reopens five species, not three.

### The line this collection draws, which decided six species

> **If the missing part IS the animal, the species is blocked. If the animal is
> recognisable without it, the species is built and the absence is flagged.**

A bat's wings are the animal. A kiwi is famously wingless; a nightjar is only
ever seen perched with its wings folded flat; a firefly signals at rest with its
elytra closed; and the glowing British glow-worm is the **female**, larviform for
life and genuinely wingless — so there is no wing absent from that model at all.
That last one is the cleanest case in the collection and `animal-glow-worm.ts`
leads with it.

---

## SPEED: MEASURE ONCE FOR THE COLLECTION, NOT ONCE PER ANIMAL

This is the finding worth carrying to the next nineteen collections, and it is
the answer to Joe's *"the first batch was really quick… the last 3 seemed to take
too long."*

The Garden fourteen went fast because they shared one recipe and one measuring
pass. The corn snake, goldfish and crocodile each re-derived everything from
scratch — three runs, three animals. **This run surveyed the entire 94-record
bank in a single pass before dispatching anybody**: every hull, ear, tail, snout,
nose, eye card, band and tooth, with its size, attachment axis, donor burial and
who had already spent it. That table was written down once, handed to five agents
as a single shared brief, and **no worker re-measured the bank**.

Thirteen animals in one run against four in the previous three. The registry
comment records it: this is the first drop of more than four in the assembly era,
and the remaining 207 unshipped species are a schedule rather than a wall.

**Two pieces of evidence that the shared pass was worth it.** The manager's own
arithmetic predicted the fennec fox would stand ≈2.010 against the 2.02 ceiling
before a line was written; it measures **2.0100**. And the ear-transfer check the
worker was asked to quote came back at one part in a million — joined at the
cube's top face and sunk the bunny's own 0.366259, the centre solves to 1.553395
against the bank's recorded 1.553396.

**The one thing that would have made it faster still:** wire the collection file
and the registry record BEFORE dispatching. `assertAssembly` asserts
`speciesRecord(id)?.assembly`, so every worker's very first test goes red until a
collection exists. I did it mid-flight after the first worker hit it. Do it in
step one next time.

---

## THE STRETCHES, WHICH JOE ASKED ABOUT BY NAME

He flagged that all three of the newest animals lean on a **non-uniform part
stretch** — goldfish `fin` `[1.000, 1.149, 0.500]`, crocodile `snout`
`[1.812, 0.502, 1.000]`, corn snake `coil` `[0.749, 0.749, 1.000]`.

**Twelve of the thirteen new species carry no stretch of any kind.** There is
exactly one, and it is forced rather than chosen:

> **`animal-firefly`, the lantern ring, `box-35`, `stretch: [1, 1, 0.5]`.**
> Rule 3 (`assertAssembly`'s `massRatio`) demands the hull be 3× the next largest
> mesh by bounding-box volume. The hoop's box is 1.343 × 1.343 × 0.4975 = 0.8978
> against the hull's 1.9531 — **ratio 2.175**, under 3, because a hoop's bounding
> box is mostly hole. **A uniform shrink provably cannot fix it**: k³ × 0.8978 <
> 0.6510 needs k < 0.8984, at which the ring is 1.207 across — *inside* a 1.250
> hull, invisible, and paid for in full. Only the thickness moves; the x and y are
> the entire read (0.0467 proud all round). It is `animal-tortoise.ts:149`'s own
> halving of `box-19`, reused rather than re-derived.

**Two things for Joe when he rules on the set.**

1. **A GARDEN animal already carries one.** `animal-tortoise.ts` has
   `stretch: [1, 1, 0.5]` on its shell rim and has done since the Garden run.
   So the idiom is not new with the last three; the tortoise is its origin, and
   the firefly is the tortoise's descendant. Whatever he rules should be ruled
   over all five, not the three he happened to see.
2. **`box-35` cannot be worn unstretched by ANY of the pack's ten hulls** —
   measured; even `box-41`, the biggest, only reaches 2.64. So the choice on that
   part is halve it or do not use it.

**The kiwi is the case worth reading against the crocodile.** Its bill wanted
exactly what the crocodile's jaw took `[1.812, 0.502, 1.000]` for. It is instead
a **chain**: the chick's beak `tube-02` as the root, with the bee's antenna
`cone-01` hung on the beak's own *built* front plane via `on: 'snout'`. Reach
0.375 from the hull's face, tapering to a true point, **no stretch at all**. The
worker's measurement of why the obvious route fails is worth keeping: `box-18`'s
long axis (y, 0.623) is *perpendicular* to its `z +1` attachment, so every spin
that brings its length forward takes its attachment off the front face — which is
precisely why the crocodile needed a stretch. **`on:` chaining is the answer to a
long thin part, and it should be tried before any stretch is.**

---

## GATES — all five, run by me, twice

`tools/golden/golden.json` untouched throughout (`git status --porcelain` on it
empty at both ends).

**On my own tree, before rebasing** (`c972b16`):

```
$ npx vitest run
 Test Files  147 passed (147)
      Tests  3265 passed (3265)
$ npx tsc --noEmit -p tsconfig.json     TSC_EXIT=0, zero output
$ npm run build                          precache 50 entries (1852.00 KiB)
                                         files generated  ../../dist/island/sw.js
                                         BUILD_EXIT=0
$ npm run smoke                          all boot checks passed   SMOKE_EXIT=0
$ npm run parity                         every step renders identically  PARITY_EXIT=0
```

**Baseline measured on `main` at the start of this run: 133 files / 2986 tests,
tsc exit 0.** (The brief said 134/2999; the measured figure was 133/2986.) So
this run's contribution is **+14 test files and +279 tests**: thirteen
`assembly-<id>.test.ts` plus `species-night-time.test.ts`.

**After rebasing onto `main`** (10 commits had landed — PB-056's pronoun sweep,
JT-034/JT-042 retiring the kit route, and two `creature.ts` features), re-run in
full at `482ec97`:

```
$ npx vitest run
 Test Files  148 passed (148)
      Tests  3287 passed (3287)
$ npx tsc --noEmit -p tsconfig.json     TSC_EXIT=0
$ npm run build                          BUILD_EXIT=0
$ npm run smoke                          all boot checks passed
$ npm run parity                         every step renders identically
```

The rebase was **clean, and the overlap was checked BEFORE it rather than
discovered during it** (`git diff --name-only HEAD~1...main` against my own file
list): three files overlapped — `unlock.ts`, `naming.test.ts`,
`species-registry.test.ts` — and all three of main's changes were PB-056 pronoun
rewording in comment regions I had not touched.

**The two flaky tests the phase-6 baton warns about — `governors.test.ts`'s "wide
corridor" and `pettap.test.ts`'s "does NOT let the camera into the keep-out" —
were green on every run this session. They are still flaky; do not read that as
fixed.**

### Revert-checks — every one watched by the agent that wrote the test

I wrote no species test myself. All five workers were told to break a real number
in `src/`, watch the named test go red, quote the message, and restore. **All
five did, and all five verified restoration by SHA-256 rather than by `git
diff`** — the species files are untracked on the run that creates them, so
`git diff --stat src/` is exactly the thing that cannot police them. Fourteen
revert-checks in total; the messages are in each worker's report.

My own two changes to shared files were verified differently and are described
below.

---

## THE LATENT HARNESS BUG, FOUND AND FIXED RATHER THAN WORKED AROUND

This cost the most thinking of anything in the run and it nearly cost three
species their best part, so it is written out in full.

`assembly-assert.ts` checked that an eye card is never scaled by comparing the
built card's bounding box against the bank's `shape.size` at 4dp. **The bank
stores `size` to 6dp and `positions` to 4dp, so for a card whose true extent has
a sixth decimal the two cannot agree past the fourth.** Measured over all five
eye cards:

```
plate-01  field 0.400000 x 0.320208   built drift 0 / 8.0e-6      passes
plate-08  field 0.400000 x 0.400000   built drift 0 / 0           passes
plate-06  field 0.329780 x 0.276342   built drift 2.0e-5 / 5.8e-5 FAILS
plate-14  field 0.435472 x 0.442601   built drift 7.2e-5 / 1.0e-6 FAILS
```

`toBeCloseTo(x, 4)` allows 5e-5. **So `plate-14` and `plate-06` failed at k = 1
and at every other scale alike — the assertion had zero discriminating power for
them.** It was invisible until now because every species built before Night Time
wore `plate-01` or `plate-08`, the two that happen to round exactly. The tarsier
was the first species to spend the panda's card.

**The fix**: compare the built card against **the part's own referenced
vertices** at 4dp with no allowance, plus the metadata field at 3dp, which is all
that field can support.

**It was proved, not asserted.** A scratch test showed the amended guard passes
at exactly k = 1 and catches any scale beyond **1.13e-4** for `plate-14` —
*tighter* than the old guard ever was for `plate-01` (1.25e-4). The proof was
then deleted.

**Two agents reached this fix independently** — one worker and me — with the same
shape of change, which is the strongest evidence available that it is right.

> **THE PROCESS NOTE, and it is the important half.** A worker reported the
> symptom upward as "`plate-14` is unwearable, switch three species to
> `plate-08`", and that recommendation was relayed to me as an instruction. It
> was wrong: it had been measured against the OLD harness, read mid-flight before
> the fix landed. **Had I complied, three species would have lost the largest eye
> card in the pack to work around a broken assertion.** The instruction was
> retracted once the measurement was redone. The lesson is the one already in the
> orders — *assert the contract the real port enforces* — extended: **when a
> report says a shared invariant blocks your work, measure the invariant before
> you change your work.**

**The real fix is upstream and is NOT done here** — see the card below.

---

## A card for the drumbeat to raise

**`joe/backlog.json` and `joe/tasks.json` were not touched by this run**, per the
constraint. This is the one card worth adding.

> **The parts bank stores positions to 4dp and sizes to 6dp, and they cannot
> agree.** `bank.generated.ts` rounds `positions` to four decimals while
> `shape.size` carries six, so any assertion comparing a built part against its
> own recorded size has a built-in error floor of ~1e-4. It surfaced on
> `plate-14` (7.2e-5) and `plate-06` (5.8e-5) during Night Time and was worked
> around correctly in `assembly-assert.ts` by comparing against the part's own
> vertices instead. The upstream fix is one change in `tools/pets/parts-bank.ts`
> to emit positions at the same precision as sizes, then re-run `npm run
> pets:parts`. **DO NOT DO THIS CASUALLY: bank ids are `<form>-<ordinal>`, so a
> regeneration that changes the record set renumbers `box-*` and breaks all
> thirty assembled species and all thirty fingerprint pins.** It is a deliberate,
> gated act with a fingerprint re-pin in the same commit.

---

## WHAT THE NEXT MANAGER SHOULD KNOW

### JT-030 is now live in its hardest form, and it is Joe's

`night-time` **left `NOT_BUILT_YET` — the first id ever deleted from that list**
— and it left **with a hole in it**, which no released collection has done.

- `album.ts` draws one frame per ROSTER member, so a child opening Night Time
  sees sixteen frames of which **three can never be filled**. That is a smaller
  version of the PB-058 bug that list exists to prevent, but it is the same bug,
  and this is the first time it ships.
- `completion()` divides by ROSTER size, so this collection **can never reach
  100%, never goes inactive, and holds one of `MAX_ACTIVE`'s four slots
  permanently.** That is exactly the trap the goldfish run recorded for Home Pets
  and closed by building its last two animals. **Here it cannot be closed that
  way.**

I shipped it rather than holding it, and the reasoning is in `unlock.ts` where
the next person will find it: holding thirteen finished animals off the cadence
indefinitely, for three that no amount of work can produce, is worse for a child
and hides the question instead of asking it. **If Joe rules the other way,
putting `night-time` back is one string.**

Net effect on the cadence: the pool widens from five to six and the slots narrow
by one. Close to a wash.

### Nobody has LOOKED at these thirteen

**Port 4173 was in use by Joe throughout and I did not touch it**, per the
constraint. All thirteen rest on measurement plus their flags. **Somebody should
look at them before they reach a child** — and the four things most worth a human
eye are:

1. **Every palette in the collection is a first proposal.** No Night Time species
   ever had a record anywhere to carry a colour, so all thirteen are `UNREVIEWED`
   at every line. `collections/night-time.ts` says this once rather than thirteen
   times, deliberately — see the flag-policy note below.
2. **The fennec fox at 2.0100** against a 2.02 ceiling. It is all ear and it is
   the tallest thing this method has built.
3. **The raccoon's keep-out at 1.154**, a hair past the fox's 1.15, which is the
   pack's own worst. It has no live consumer yet (`pets.ts prototype()` still
   loads GLBs and assembled species are not wired to it), so it is a note and not
   a fault.
4. **The three confusable groups** the collection test guards: tarsier /
   bushbaby / aye-aye, opossum / civet / kinkajou, and firefly / glow-worm, which
   are the same insect at two life stages.

### The flag policy, settled centrally, because the workers disagreed

Six of thirteen carry a `flag`; seven do not. **A flag names a rule the build
strained** (§9.3: "an animal with a flag is one he is being asked to rule on"),
and an unreviewed palette is not a strained rule — it is the normal state of
every species on its first run. Had all thirteen carried one for a reason all
thirteen share, the field would stop telling Joe which animals are the difficult
ones. So it is stated once in the collection header instead. **An unflagged
member here has unreviewed colours exactly as much as a flagged one.**

### Four corrections to the shared vocabulary, from the workers

Worth carrying into the next collection's measuring pass:

- **`box-21` is not a tall body.** It is the standard 1.250 cube with two fused
  ear lugs on top — the badger's `box-12` finding on a second hull. Its full top
  face lands on world **1.43125**, the pack's own floor; all 0.2551 above that is
  two forward lobes. **A species on it needs no ear part and must not be given
  one**, and every 1.250-cube donor placement transfers to it unchanged.
- **`plate-14`'s bands are INVERTED** against `plate-01`'s: band 15 is the 40
  outer triangles rather than a 10-triangle pupil. Since the builder always sends
  band 15 to `PACK_PUPIL`, it builds a nearly all-dark eye with one pale glint —
  **a nocturnal eye for no geometry and no new mechanism.** Free to anything that
  wants one.
- **`box-36` (the panda's cube) CAN say "the front of this hull is a different
  colour"** — the sentence the badger's flag records as impossible. Kenney cut it
  front-to-back and both flat end planes are band 3 entire. The badger is right
  about `patch` and right about `box-03`; it is not true of this shell. Price: the
  rear face goes pale with the front.
- **`tube-03`/`tube-06`/`tube-07`'s "0.532 long" is their WIDTH, not their
  reach.** Their z-extents are 0.2314/0.2314/0.266. Reaching for one as a long
  bill gives a wide muzzle. (My own vocabulary file said "long"; it was wrong.)

### One measured counter-example to a rule in the method doc

`docs/building-animals-from-parts.md` §3 says *"every eared species embeds its
ear into the hull by at least 0.125"*. **The elephant's `tube-04` buries only
0.045 units.** The bushbaby's transfer recovers the elephant's recorded
x = 0.759317 exactly and then overrides the burial to §3's floor, with the
override and the reason in the file. Worth correcting in §3 when somebody next
edits it.

### And one about the budget floor

The pack's own **bee** — cube, `box-04` band, `cone-01` antennae, `plate-01`
eyes, `plate-03` mouth, four legs — is **332 built vertices against
`MODEL_VERTS_MIN` 405**. *Kenney's own insect would fail rule 9's floor.* Both
insect files are shaped by that fact, and it is the same class of finding as the
goldfish run's "the pack's own fish would fail the floor". **The floor is
calibrated on quadrupeds and it is hostile to small animals**; a future run that
keeps hitting it is hitting a real mis-calibration, not building badly.

### Scope discipline

**I did not start another collection**, per the check-in instruction — and
`a6dc85d` on `main` says the same thing from Joe's side: *"Night Time finishes
its current run and waits."* His stated next order is by what a child can SEE:
**Home Pets 14, Africa 13, Farm 16, Woodland 16 rebuilt off the kit route, then
new collections.**

### The nine places, confirmed as ELEVEN for a NEW collection

The goldfish run found nine. A collection that has never shipped costs two more:

1. `parts/assembled/animal-<id>.ts` — the definition
2. `parts/assembled/index.ts` — one appended line, **never before the file exists**
3. `collections/<collection>.ts` — the `defineSpecies(id, 'bespoke')` record
4. `import '../parts/assembled'` in that collection file
5. `tests/island/species-<collection>.test.ts`
6. `tests/island/assembly-<id>.test.ts`
7. `tests/island/assembly-fingerprint.test.ts` — the pin
8. `joe/names-audit.json` — one row
9. `joe/species-facts.json` — one fact, plus the collection id in `coveredCollections`
10. **`registry.ts` — the import and the `SHIPPED_SPECIES` spread** (new collection only)
11. **`src/island/species/unlock.ts` — delete the id from `NOT_BUILT_YET`** (new
    collection only; `species-unlock.test.ts` fails BY NAME and tells you to)

Plus the shared counts: `naming.test.ts` (audit length), `species-registry.test.ts`
(registry size, per-collection lengths, unshipped count) and — new this run —
**`tests/tools/gallery-source.test.ts`**, whose fixture pins what the old
per-animal divisor did at the tallest assembled animal. The fennec displaced the
squirrel, so 0.633 became 0.622.

---

## THE FACTS — four of thirteen flagged, which is the method working

Drafted by one agent, then **refuted by a second that never saw the first's
reasoning or its URLs** (JT-031). Four came back flagged — the highest rate in
`joe/species-facts.json` so far:

- **tarsier** — "each eye is bigger than its brain" is a *repeated factoid*. The
  only peer-reviewed statement reachable hedges to "same or greater", and in the
  fetal specimens measured the combined eye volume is *less* than the endocranium.
- **bushbaby** — "several metres" is true of the lesser bushbaby (3–5 m) and false
  of the greater (up to 2 m, and generally quadrupedal).
- **opossum** — **most opossums have no pouch.** Only the larger genera have one;
  smaller species have lateral abdominal folds.
- **firefly** — **not all fireflies flash**, and Britain has no flashing firefly
  at all: its lampyrid is the glow-worm.

**All four keep their drafted wording** and carry a sourced `proposedRewrite`,
because this file's own rule is that an unverified fact stays *visibly flagged*
rather than being quietly reworded until it sounds safe. **The verdict is Joe's.**

The tarsier's refutation was also applied back into `animal-tarsier.ts`, whose
flag had repeated the same factoid.

**Two caveats on VERIFIED rows that bear on the models**, and both are things
only a person looking at the art can settle:

- **civet** — fruit holds for palm and African civets, but the otter civet takes
  fish and crabs. **If the model reads as an otter civet, re-open that row.**
- **glow-worm** — the female is wingless and glows from vegetation. **Artwork
  showing a flying glowing insect would contradict the text.** (The model has no
  wings, so it is consistent today.)

---

## Where the next manager starts

Joe's own order, from `a6dc85d`: **rebuild the four kit-built collections off the
kit route, by what a child can see** — Home Pets 14, Africa 13, Farm 16,
Woodland 16 — then new collections. All 59 are rejected work awaiting rebuild,
and **the species ids must be KEPT and only the build data swapped**, because
`pets.ts` creates nothing for an id it cannot build and a kit-built pet Juno
already owns would become invisible. Brief §19.

**Use this run's method**: survey the bank once for the whole collection, write
the vocabulary down, wire the collection file and registry record *first*, then
dispatch in parallel. It is the difference between four animals and thirteen.
