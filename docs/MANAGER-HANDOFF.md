# Manager handoff

---

## Run 15 (drumbeat, parallel defect burn-down) — 1 Aug. PREPENDED, NOT OVERWRITTEN.

*Joe went away for ten hours with one instruction: pick pieces that can be
built independently, keep it local, don't push, don't make more work, burn the
backlog down. Six managers ran in isolated git worktrees; the drumbeat merged
each one and kept `joe/*.json` centrally so parallel runs could not conflict.*

**Backlog moved 39 open / 13 done → 32 open / 20 done. Nothing pushed.
`origin/main` is behind on purpose.**

### Shipped and merged, all five gates green on the MERGED tree

| Card | What actually happened |
|---|---|
| PB-052 | Sealed pet now **relocated**, per Joe's JT-033 ruling. The card's walkability layer was NOT built. |
| PB-053 | Refused mountain gets a second try with a narrower peak. 2763 refusals before and after, 0 bare hexes. |
| PB-055 | **There are no JPGs and never were.** Real cost was a duplicate `GLTFLoader` re-fetching 3.26 MB. |
| PB-058 | `HELD_BACK` derived from `shippedIn()` with a tripwire test; `advance()` prunes, but only when she owns nothing. |
| PB-054 | Rng threaded through `pets.ts`; test seeds it. 1-in-14 failures → 0 in 16. |
| PB-009 | Test corrected, render deliberately untouched. Dead trunks **do not flicker**. |
| PB-047 | Wipe becomes three tick-boxes. Nearly deleted her name — see below. |

### The three things a future manager most needs to know

1. **Merging three green worktrees produced a RED suite.** Every manager was
   green alone; together, `sealing.test.ts` and `governors.test.ts` timed out at
   the 5s default (9.2s and 5.5s). Fixed in `3c29614` by giving both a real time
   budget, not a smaller job. **Always run the full suite after a merge — a
   green worktree is not evidence about the merged tree.**
2. **`fromSave` treats an empty tile list as "no save at all"** and its fresh
   branch returns `childName: ''`. The obvious spelling of an island wipe would
   therefore have destroyed her name with nobody ticking the name box — a §19
   violation arriving through the one feature allowed to delete her things. A
   fresh island is now written as `createFlow()`'s single grass tile. Pinned by
   a test named after the landmine.
3. **Cards were wrong about themselves, repeatedly, and the corrections are on
   the cards.** PB-054's "load-sensitive" diagnosis was wrong (the test reset
   position while `goal`/`restFor` are pet state too) and its claim that
   `governors.test.ts` shares the cause was false. PB-009's trunks don't
   flicker. PB-055's JPGs don't exist. PB-058's list of six buildable
   collections was stale. **Re-measure a card's premise before building to it.**

### Blocked on Joe, not on us

- **JT-037 — the Sassoon licence.** PB-051 is BUILT AND GREEN but deliberately
  **not merged**, held on branch `pb-051-sassoon-font`. The repo is public,
  Sassoon is "licensed, not sold", the agreement is not on disk, and
  `.gitignore:16` already keeps `Assets/*.zip` out. Merging would be the first
  time the binaries entered public git history, which is the part that survives
  deleting the file later. Retreat is three edits.
- **JT-030 now wedges the ladder, not just the look.** `completion()` divides by
  ROSTER size, so home-pets (14/16) and africa (13/16) can never complete and
  never free their slot — two of four held forever. Option (c) already needed
  the 80% counted against BUILT members, and that same change unwedges it.
  `completion()` was left alone deliberately; the denominator is Joe's ruling.
- PB-009 taste question: does a 0.25-unit dead trunk want a blob shadow?
  Shadow-by-kind would add blobs to islands that already exist.

### Operational note that cost this run real capacity

**The 200-subagent session cap was hit** partway through, with the PB-047
manager reporting it too. After that the drumbeat did the merge-regression fix
directly. If a run like this is repeated, raise
`CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` first.

### Where the next manager starts

Not yet done and needing no ruling: **PB-014** (prop glTF 404 on
`hexagons_medieval.png`), **PB-010** (batch blob shadows — must exclude pets,
whose `castShadow` mutates opacity per frame), and **PB-048** which is
explicitly *"investigation/discussion first"* and must come back as questions
for Joe, not as a build. Then new species — but note the standing verdict in
`docs/PB036-HANDOFF.md` that **the editor outranks building animals**.

---

## Run 10 (ladder manager) — 29 July, ~18:30. PREPENDED, NOT OVERWRITTEN.

*Two managers were live in this tree at once. Run 9's baton below is still
current (JT-033 open, PB-053 unfixed), so overwriting it as the template says
would have destroyed real state. Read both. My ground was `src/core/`,
`src/challenges/`, `src/island/harness.ts` and `joe/`.*

**Joe's fast-track, verbatim:** *"can we fast track some additional summing
levels. it needs at least one between the basic <=10 and the carry level. and
some 3 & 4 letter nouns."*

**Shipped: `521b744`, `1a8fef5`, `9c78b1c` — all pushed, `origin/main` level.**

**The new sums rung is "teens plus units", generator id 3.** The gap was
provable from the sibling path rather than inferred: `STAGE_LABELS.takingAway`
climbs *to ten → teens minus units → anything to twenty*, while addition jumped
from `a+b<=10` straight to a level that ALWAYS bridges ten. The missing step was
addition's own non-regrouping teens rung: `a in [10,18]`, `b in [1, 9-units(a)]`,
sum 11..19, `(a%10)+b <= 9` always.

**The one thing a future reader will want to "tidy" and must not.**
`STAGES.sums` is `[1, 3, 2]` (`harness.ts:63`). The NUMBER is a generator id;
the ARRAY POSITION is the rung. It is not `[1,2,3]` because `golden.json` pins
what level 2 produces, so renumbering reddens a frozen file. There is a comment
saying so at the declaration. Adding a rung is therefore always: append a new
generator id, insert it in `STAGES` at the right ladder position.

**A latent bug this surfaced, now fixed.** `settledOn` compared stage ids
numerically (`s < top`) while `topTicked`/`nextStage` used array order. Harmless
while the two agreed; the moment ladder order diverged from numeric order, a
retired middle rung would never retire. Now compares by ladder index
(`harness.ts:830`). **Anything else that orders stages must use array position.**

**Nobody is demoted, and nobody could have been.** Joe confirmed mid-run: *"no
one is on the next level yet anyway, only in the first on everything."* So no
migration machinery was built. The guarantee is kept in tests instead —
`harness.test.ts` covers ladder order (1→3→2→none), no-demote, `settledOn`
ordering, and Juno's shape of save round-tripped through `toSave`→`fromSave`
with her stage-1 ewma/attempts/ticks intact and stage 3 arriving fresh.

**v0 was edited** (`v0/junos-words.html:981`) — the identical branch, no DOM
touched. Parity therefore still proves both that the two sides agree and that
levels 1 and 2 are unchanged. Say this out loud in any future v0 edit.

**The noun question had a different answer than expected.**
`joe/noun-candidates.json` did not exist and never had — `JT-004` has been open
since the workbench was seeded, waiting on a file that "arrives with Run D", and
Run D never happened. So his red pen had nothing to review. It is now written:
88 clean words (44 three-letter, 44 four-letter), 23 flagged, 35 rejected with
reasons, every word checked against `segmentation.ts` `GRAPHS`, all `verdict`
and `note` fields empty. **This is his twenty minutes, and it now unlocks.**

**But approving them is not shipping them — `JT-035` raised, NEEDS JOE.** GREEN
(`wordlists.ts:17`) cannot be appended to. `makeDeck` deals from the array in
order, `capture.mjs:37` pins the v0 word literals, and `alien.ts:25` spreads
GREEN into `REAL_BLOCK` — so **one extra noun shifts the rng stream behind
`read`, `readL2` AND `build` at once.** Choice is (a) a new list behind a new
reading rung, or (b) a deliberate stated golden re-capture. Nothing is built on
either; a reversal costs nothing today.

**Where the next manager starts:** if `JT-035` has a note, build it — option (a)
is also the front half of queue item 5 (the reading curriculum), since JT-025's
step 1 is literally "adding nouns". If it is still open, the sums ladder now has
three rungs and `takingAway` still has an untouched `else` catch-all at
`sums.ts:48` that silently serves level 3 — the same shape of gap, one path over.

**Gates, run by the manager on the final tree, all five green:** `npm test`
100 files / **2124 passed**, golden included and untouched; `tsc --noEmit` exit
0; `build` ✓ 8 precache entries; `smoke` "all boot checks passed"; `parity`
"every step renders identically", spoken 4/4, score bar `🐚 6`/`🐚 6`.
**Revert-checks went red as required:** reverting the `settledOn` fix failed
*"settles rung 3 as well as rung 1"* (`expected [1] to equal [1,3]`); reverting
`STAGES.sums` failed 18 tests including *"offers 3 above rung one"*. Reported
honestly: the three no-demote tests stay green under both reverts — they guard
the migration invariant, not the ordering, which the block above guards.

---

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
