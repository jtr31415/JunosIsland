# Manager handoff

*Run 9, written 29 July 2026, ~16:20. Read `docs/MANAGER-ORDERS.md` for the job.*

## Queue position

- Items 0-3: DONE (runs 4-8). Do not re-do them.
- Item 4 (**PB-036**): **NOT MINE.** Its own manager is live in this same tree
  right now — see `docs/PB036-HANDOFF.md`. Read the first landmine below before
  you commit anything while it is running.
- **PB-052 (the sealing defect): the buildable half is DONE. The remedy is held
  on `JT-033`, which is still `open` with an empty note.** Detection is built,
  tested, shipped and called by nothing. Nothing here is waiting on me.
- **PB-053: detection built (`bareRockHexes`), cause explained, not fixed.**
- Item 5 (`PB-043`, the reading progression curriculum): NOT STARTED. Still a
  survey-then-ask item, not a build-it item.

## What this run did

Reproduced PB-052 and stopped cleanly at the seam Joe has not ruled on.

**The reproduction, watched failing.** `tests/island/walk.test.ts` measures the
real `props/mountain_*.gltf` geometry off disk, places grass at the origin and
rock on all six neighbours, and asserts a pet of radius **zero** is in a walkable
region that is not the island's. It was red before `walk.ts` existed. The
revert-check is the honest one: making the pinch test ignore the radii turns 6 of
19 red — including `walkableRegions` collapsing to a single region — while all 13
negative controls stay green, so the test is driven by the geometry and not by
bookkeeping.

**The detection is topological, not a constant.** `src/island/world/walk.ts`
models the free space *between* keep-out circles as the hex lattice's **corner
graph**: every side of the lattice is flanked by exactly two adjacent hexes, and
is passable iff the gap between their obstacles leaves `2 * petRadius`. Flood
the corners; a pet is sealed when its component is not the island's. It rests on
one premise — only *adjacent* hex obstacles can pinch, since non-adjacent centres
are 3.4641 apart — and a test asserts that premise against every measured radius,
so a fatter prop one day is a red test rather than a silently under-reporting
model.

**`src/island/world/mountains.ts`** is the pure half of `props.ts` lifted out
(`hash`, `pick`, `MOUNTAIN_HEXES`, `mountainHexFor`, `mountainSpinFor`, all
re-exported from `props.ts` so no importer changed) so that `flow.ts` can ask the
question without importing THREE. It carries the root cause written down as two
measured tables, both re-measured from the real glTF by the tests so neither can
drift: placement uses `MOUNTAIN_FOOTPRINT` (0.938 for A/B, 1.011 for C), pets
collide on `MOUNTAIN_KEEPOUT` (1.027-1.062), adjacent centres are 2.0000.

**PB-053 is now explained rather than counted.** Only C-beside-C is wide enough
to collide; the C models carry 8 of 21 weight; (8/21)² = 14.51%, against 14.40%
measured over 19,182 pairs. And phase 4's warning is confirmed and worse: the
revert-check shows that tightening placement to the walking metric makes
**100%** of rock hexes with a rock neighbour bare, not 14%.

**No remedy was picked.** `sealsAPet` and `sealedLand` are exported, tested, and
called by nothing. The seam is one marked comment block in `tileTypeFor` with all
three of Joe's options costed where each would go.

## Gate results

Tree hash before the gate run and after: **`e05f6106...` both times, identical.**
`git status --porcelain` on `tools/golden/golden.json`, `src/core` and `v0` was
empty at both ends. All five new/changed files are `eol: lf` per `.gitattributes`.

```
$ npx vitest run
 Test Files  97 passed (97)
      Tests  2046 passed (2046)
   Duration  32.10s

$ npx tsc --noEmit -p tsconfig.json
TSC exit=0

$ npm run build
PWA v1.3.0 · mode generateSW · precache 8 entries (773.57 KiB)
files generated  ../../dist/island/sw.js

$ npm run smoke
ok    builds the ambience layer
ok    reading mode is active
all boot checks passed          SMOKE exit=0

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically  PARITY exit=0
```

Those counts (97 files / 2046 tests) include the PB-036 manager's concurrent
uncommitted work, which was in the tree when I gated. It was green too.

**Revert-checks, mine reported separately from my agents'.** Mine: none — I wrote
no test myself; I wrote the seam in `flow.ts` and its comment. My agents watched
four, all reported with the failing messages: (1) `gapBetween` ignoring the radii,
6 of 19 red; (2) `bareRockHexes` on the walking metric, which quantified the 100%
figure above; (3) `sealsAPet` forced `false`, 4 red, two of which only went red
after the agent strengthened two of its own tests it had found vacuous; (4)
`sealedLand` forced `[]`, 3 red — needed because the two functions share no code
path at the flow level. `flow.ts` was confirmed restored by `git hash-object`
before and after each.

**`origin/main` is level.** Confirmed with `git rev-list --count origin/main..HEAD`.

## What happens to an island that is ALREADY sealed

**It cannot be repaired by the child, and this is the finding that should shape
the ruling.** Once a rock tile is committed it can never be retyped
(`askToRetype` only touches the half-built plot, never `island.tiles`) and no
code path anywhere removes a tile — `grid.place` has no inverse. A pet is
re-sited on load at its recorded *hatch* hex (`pets.ts:661-662`), which is the
pocket, and nothing in the game ever moves a pet across a barrier. **A test
round-trips a sealed island through the real save layer and confirms
`sealedLand` still finds the trapped hex, so a rescue can find them.** But there
is no rescue, because writing one *is* Joe's option (c).

So Joe's options A (silent grass) and B (refuse the socket) are **preventive
only** — they do nothing for a girl who has already built the ring. Only (c)
reaches an island in the wild. That is in the JT-033 addendum in his own words'
place, not decided here.

**Worse, and needing no ruling: a new pet can be hatched INSIDE an existing
sealed pocket.** `firstFreeSpot` takes the first tile key no other pet's
*recorded hatch hex* occupies — no tile type check, no reachability check — and
`tests/island/sealing.test.ts` demonstrates a real hatch landing on `0,0` while
`sealedLand` names it. One condition on one loop, about ten minutes. **Not
applied**, because where an animal appears is something a child sees.

## Where the next manager starts

**If `JT-033` has a note, the whole job is at `src/island/flow.ts`, in the
comment block beginning `>>> REMEDY SEAM` immediately above the `if (chosen ===
'rock')` return in `tileTypeFor`.** It names each of Joe's three options and
where each goes; (a) is one line there, (b) additionally needs
`buildableSockets` to drop the hex or she taps a dead socket, and (c) changes
nothing there at all and lives at the pet layer. `sealsAPet(f, a, t)` and
`sealedLand(f)` are ready and tested. Whichever he picks, `tests/island/
sealing.test.ts` has an assertion that `tileTypeFor` still says `'rock'` today —
**update it, do not delete it.**

If `JT-033` is still open, **do not start it**, and do not start a kit either
(`JT-032` gates all kit work and is also open). PB-053 is the honest next piece
of ground: `bareRockHexes` in `mountains.ts` already detects it, and the trap is
written into the code — do not fix it by making placement use the walking metric.

## What I learned that is not in the code

All three are now in `docs/HANDOFF.md` under "Landmines added 29 July"; short
form here:

- **Staging is not a lock.** I staged seven files deliberately, gated them, and
  in the window before `git commit` the parallel PB-036 manager committed with a
  broad add **and pushed**. All my work is in `0369387`, whose message is about
  taking an animal apart. I did **not** rewrite history — it was already on
  `origin/main` and the other manager was still live; rebasing under a running
  agent is a worse fault than an untidy log. **Find PB-052's code by symbol, not
  by commit message.** When another manager is live, commit the instant the
  gates go green.
- **The two "she cannot wall herself in" invariants are different theorems.** The
  corridor one is about building and is true; the walking one had never been
  stated. Neither implies the other, and `flow.ts:524`'s rock exemption is exactly
  where they diverge.
- **The pet radius is provably not a dial.** Every gap on the island is either
  mountain-beside-mountain (already shut at −0.054 to −0.125) or has a mountain
  on one side only (0.937 wide), and the fattest animal needs 0.38. The band a
  radius could act in is empty. I had written the opposite into a comment on the
  strength of it "reading true" and an agent's measurement corrected me; the
  comment now says so.

## Decisions

**RAISED this run:** none — no new `JT` id was minted.

**AMENDED this run:** `JT-033`'s `detail` (the agent-owned field;
`note` and `state` are Joe's, per `tools/workbench/merge.mjs:79-81`). His note
was empty and stayed empty; all 33 notes and states were re-parsed from disk and
confirmed intact, LF preserved, one line of the file changed, committed alone as
`data(workbench)`. The addendum tells him the four measured things, the two that
bear on his choice, and explicitly that **nothing has to be reverted whichever he
picks**.

**PICKED UP this run (his nod):** none. `JT-030`, `JT-032` and `JT-033` are all
still `open` with empty notes — checked at the start of the run. Nothing was
reverted.

**Decided rather than asked:** that detection defaults to `petRadius = 0`, the
strongest form of the claim. It is not a product choice today because the radius
cannot change any answer (above), and the reasoning is in the doc comment on
`sealsAPet`.

**Still open in the workbench:** `JT-001`, `JT-004`, `JT-005`, `JT-006`,
`JT-007`, `JT-023`, `JT-030`, `JT-032`, `JT-033`.
