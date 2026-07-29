# PB-036 handoff — themed animal collections

*Run 14 (PB-036 manager, phase 6), written 30 July 2026. Read
`docs/MANAGER-ORDERS.md` for the job. This file is PB-036's baton only —
`docs/MANAGER-HANDOFF.md` belongs to the queue manager and was not touched.*

## Queue position

- **Phases 1–5: DONE.** Species-as-data, roster, three kits, name table, Joe's
  audit bench, the component census, the four pack axioms, the Anatomy gallery.
- **Phase 6 (this run): Joe's size note is answered and fixed at the builder, and
  the Garden closed at 14 species.** Five commits, all pushed.
- Nothing is wired to a child yet, on purpose. Unchanged since phase 2.
- **The 72 kit-built species remain scrap** and have no tab (`viewer.html:16-19`).
  JT-034 is still open and still gates any kit work.

## What this run did

**1. Joe's size note, which was the point of the run.** His words: *"the new
animals look genuinely really good. general criticism is size. the body/cube
should always be the standard size, its often bigger."* Measured before touching
anything, and the obvious diagnosis was wrong in an instructive way:

- **The geometry was already right.** All 14 built hulls measure exactly 1.250 on
  x and y (1.125 on z for the three using `box-31`). **No node in any built
  creature carries a non-identity scale.** No species set `hull.stretch`. The
  badger's 1.539 is the `box-12` shell's own ear lugs, torso still exactly 1.250.
- **The builder permitted it anyway.** `hull.stretch` multiplied the hull's
  vertices by an arbitrary `Vec3` with **no bound of any kind** — the only guard
  was that a non-empty `stretchWhy` sentence be present. `stretch: [4,4,4]`
  compiled and built. **A dial defended only by prose is a dial that gets
  turned**, and this was the second appearance of the fault (his first hedgehog
  note was *"body cubic, its currently too wide"*, fixed for the hedgehog alone).
  Now `Hull.stretch`/`HullDef.stretch` are `never` — a type error where written,
  including through a spread — and `buildAssembly`/`creatureSpec` throw if one
  arrives as data. Features keep their stretch; the tortoise rim and slow-worm
  coil need it. The route to a different body is one of the ten real shells.
- **What Joe was actually LOOKING at was the viewer.** `toUnitHeight` divided
  every model by its **own** height, so an identical 1.250 cube drew at 0.8735 of
  the frame for the 1.431-tall mouse and 0.6326 for the 1.976-tall squirrel — a
  **1.38× swing in apparent body size invented by the review tool**, applied to
  the pack reference beside it too, with a second normaliser in the camera fit and
  a **third and different** one in grid view. All three now share one stated
  divisor, `SHARED_SCALE = 1 / 1.611185` (the measured median height of the 24
  originals), so the cube draws at 0.7758 for every species — spread 1.000×.

**2. The Garden closed at fourteen.** The orders said nine of thirteen definition
files existed; in fact **all eleven missing ones had been written** by sessions
that died on API errors before committing, and HEAD carried barrel lines for seven
files that were not tracked. So this was a landing, not a build: badger, dormouse,
frog, mole, newt, salamander, shrew, slow-worm, toad, tortoise, vole. The
slow-worm was in `ASSEMBLED_BUILDS` and the roster with no species record, no
fingerprint pin and no audit row, and five tests were red on that alone.

**3. The inherited uncommitted work was triaged, not discarded.** Verdicts and
what was done are in the Decisions section.

## Gate results

Run by me on `9a0ba7d`, all five:

```
$ npx tsc --noEmit -p tsconfig.json    TSC_EXIT=0, zero output
$ npm run build                        precache 8 entries (774.36 KiB), files generated
$ npm run smoke                        all boot checks passed
$ npm run parity                       every step renders identically
$ npm test                             Test Files 119 passed (119)
                                       Tests 2668 passed (2668)
```

**Fully green — but two of those tests are FLAKY and you should know which.** At
`fe3f247`, before this run touched anything, `npm test` had 7 reds. Five were the
slow-worm's half-wiring and are genuinely fixed. The other two went green without
anybody touching them:

- `tests/island/governors.test.ts` > *the floor is a RATIO too — PB-039, moved by
  JT-012* > "leaves a wide corridor between the two walls at every size"
- `tests/island/pettap.test.ts` > "does NOT let the camera into the keep-out or the
  blob" — this one **fails standalone and passes inside a full `tests/island/` run**,
  which is the clearest evidence of the two.

So both are order- or state-dependent, not fixed. **Do not read a green `npm test`
as proof either of those is sound**, and if one of them goes red under you, it is
not necessarily your change. Neither is PB-036's ground (`29bb22b` and the camera
work respectively), so I left them; a run whose actual job is either of those
should expect an intermittent, not a bug at a fixed line.

Revert-checks **watched by the agent and reported to me, not watched by me**: the
new hull invariant went red on badger and hedgehog at `stretch [1.08,1,1]`, and
again at `[1.0002,1,1]` so the tight 4dp claim earns its place; the viewer test has
a negative control that feeds the old source back through the reader and requires
both old divisors to be caught.

## Where the next manager starts

**Read JT-036 and JT-034, in that order.** JT-036 is this run's one open question
and it is small and concrete: Kenney gets an animal's height from what sits **on
top of** the cube (mean clearance 0.236 above the hull), ours is 0.134, and the
**mouse, shrew, mole and badger have exactly 0.000** — the cube *is* the top of
the animal, all four sit on the height floor 1.43125, and the cube takes 87.3% of
their silhouette against the pack's median 77.6%. Our legs are the pack's own
0.18125 **to the digit**, so it is not the legs. Three options are costed in the
task; nothing is built on any of them. Do not choose for him — ear-or-no-ear on
four animals is a look, not a measurement.

JT-034 still gates all kit work and 72 species still hang off it.

The three wiring seams remain unwired and unchanged: `pets.ts prototype()`,
`atlas.ts dress()` early-returning for built species, and `main.ts:1174` swapping
`petName(defaultRng)` for `givenName(species)` — one argument, not two.

`joe/species-facts.json` covers 97 species. Its `notCovered` field is the tripwire:
a newly shipped collection needs its id added to `coveredCollections` or its
members reach Joe's bench factless **and nothing shouts**.

## What I learned that is not in the code

- **The orders can be stale in the direction of MORE work already done.** I was
  told nine species files existed; fourteen did, written by dead sessions. Read
  `git status` and `ls` the directory before believing a handoff's inventory —
  three of those files were tracked and eleven were not, and HEAD was already
  broken because barrel lines had been committed ahead of their files.
- **`| tail -25` on a backgrounded test run destroys the evidence.** The task
  notification said "exit code 0" while the captured tail said 6 files failed, and
  the file held only the 25 lines. Pipe to `grep -E "FAIL|Test Files"` instead, and
  **never trust a background exit code over the test summary**.
- **A guard that checks for prose is not a guard.** `stretchWhy` demanded a
  sentence and permitted any magnitude. If a field must stay within a bound, the
  bound goes in the type or the throw — not in a comment field.
- **The review tool can be the bug.** Joe's criticism was about the animals and
  the animals were innocent; three separate size normalisers in `viewer.ts` were
  manufacturing the difference. When he reports something visual, measure the
  geometry AND trace the render path to the pixels before changing either.
- **Fix the card in the same pass as the canvas.** `assembled.ts:318` told Joe on
  screen "both are scaled to exactly one unit tall" for an hour after that stopped
  being true, six inches from the animals it misdescribed — and a test was
  *pinning* the false sentence (`assembled-gallery.test.ts:301`).
- **Drafting a child-facing fact and checking it in the same pass is not a check.**
  `joe/species-facts.json`'s own `method` says so. The slow-worm fact was drafted
  by one agent and refuted by a second that never saw the draft and read only the
  sources; it could not refute it and reached three authorities, so the row is
  `verified` rather than `flagged`. That is JT-031's instruction carried out.

## Decisions

**RAISED this run:**
- **JT-036** — *NEEDS JOE: our animals carry almost nothing above the body cube —
  do four of them get ears? (PB-036)* Three options with cost. Fable was not
  asked; this is a look, not a measurement.

**PICKED UP this run:**
- **JT-031** (*"have an agent create the facts and fact check them"*) — carried out
  for the slow-worm by the draft-then-refute method above.

**Inherited uncommitted work — triaged, all of it kept, nothing discarded:**
- **The species half** (11 animal files, 11 tests, `motion.ts`, the four modified
  `parts/*.ts`) was coherent: no TODOs, no stubs, no `@ts-ignore`, a test per
  animal. Committed as `b4f24da`. `motion.ts` resolves to `[]` for every species
  and has **no consumer and no test** — named in the commit so nobody depends on
  it unawares.
- **The dead editor manager's half** (`tools/workbench/{api,merge,seed}.mjs`,
  `public/editor/{def,library}.ts`, three `tests/tools/*.test.ts`,
  `joe/species-edits.json`) had two of three layers finished and covered end to
  end — persistence and the edit model — and **no page at all**. Committed as
  `6bde9ec` with that stated, so nobody looks for a screen.
- `tests/tools/editor-def.test.ts` had two type errors that were **not mine**. I
  did not paper over them: they were two genuine typing slips (a dropped index
  signature, a `readonly` cast) in tests that pass at runtime, and CI runs
  `npm run typecheck`, so they were fixed properly. Two more errors appeared *from
  my change* — the editor still offered a hull-stretch dial — and that branch now
  returns `def` unchanged like `legs`/`eyes`/`ridge` already do. **A mouse gesture
  must not be able to put a scaled body on screen.**
- Still open in that file and left alone: `def.ts:913` holds two **literal NUL
  bytes** where `'\x00'` was meant, which makes the largest new file in the repo
  invisible to ripgrep. One character, whoever owns it.

**NOT ACTED ON, deliberately, and inherited intact:** the wider half of JT-029 —
*"we drop the colours"* — which touches pets Juno already owns. Phases 2–5 left it
and so did I. It needs Joe, and no subagent should tidy it away.
