# Manager handoff

*Run 8, written 29 July 2026, ~11:50. Read `docs/MANAGER-ORDERS.md` for the job.*

## Queue position

- Item 0 (**the live bug, an abandoned tile follows her around**): **DONE — this
  run. Shipped, CI green, verified from the deployed bundle.**
- Item 1 (PB-042): DONE (run 4).
- Item 2 (PB-030, the addition/subtraction ladder): DONE (run 6).
- Item 3 (hold the work, reconcile the backlog): DONE (run 7).
- Item 4 (**PB-036, themed animal collections**): **NOT MINE, AND NOT THE NEXT
  MANAGER'S EITHER.** Joe gave it a dedicated manager mid-run, running in
  parallel with me from ~11:00. Do not pick it up without checking with the
  drumbeat.
- Item 5 (the reading progression curriculum, carded `PB-043`): NOT STARTED.

## What this run did

One item, PB-048 (**now carded as `PB-050` — see Decisions, the id moved and it
was not my choice**). Joe's report: *"if a tile has been started and then
abandoned, then tapping any tile jumps back into the building of the same tile,
frustrating for her if she tries to tap an animal."*

The fact the fix turned on, and it is in `docs/HANDOFF.md` now: **a standing
`flow.plot` in free play IS the abandoned state.** The sum overlay stays open
across every sum of a tile (`main.ts:1577-1588` deals the next sum into the same
panel), so she is only ever back on the island mid-build by having left one.
`askForLand` resumed it, so every later tap re-entered that build — including a
near-miss at an animal, because `picking.ts` answers with whatever is under the
ray and that is the tile her friend stands on.

Three edits, all small: `askForLand` never resumes and always opens the bank
(`flow.ts:236-261`); `placeTile` RELOCATES a standing plot instead of refusing to
site over one (`flow.ts:599-623`); a tile tap starts nothing and resumes nothing,
ever (`interactions.ts:225-241`). Progress carries for free because `sumProgress`
lives on the Flow, not the plot.

**The abandoned scaffolding is deliberately LEFT STANDING.** That is the load-
bearing choice. Nulling `flow.plot` is the obvious fix and it is wrong:
`plot.ts:111-133` reads `state.plot === null` with a plot standing as COMPLETION
and plays the farewell, so an abandoned tile would bow and fly away like a
finished one. Leaving it standing means `flow.plot` goes straight from old plot
to new in one transition and the host takes its ordinary rebuild path.

Tests drive the real `createPlotHost` and the real `handleWorldTap` together
(`tests/island/plot.test.ts:402-534`), written first and watched failing. Seven
existing tests asserted the resumption and were rewritten rather than deleted;
**two of them had been passing vacuously off fixtures that never had a plot at
all**, and one more passed accidentally off a stale `challenge: 'sum'` in its
fixture. The revert-check was watched by the subagent and reported: reverting the
`interactions.ts` edit alone failed 5 tests across two files.

## Gate results

Tree hash before the gate run and after: **`9c25bc9b...` both times, identical.**
`golden.json`, `src/core/` and `v0/` untouched (`git status --porcelain` on those
paths was empty). All five files verified LF.

```
$ npx vitest run
 Test Files  75 passed (75)
      Tests  1525 passed (1525)
   Duration  36.36s

$ npx tsc --noEmit -p tsconfig.json
TSC exit=0

$ npm run build
PWA v1.3.0 · mode generateSW · precache 8 entries (773.57 KiB)
files generated  ../../dist/island/sw.js

$ npm run smoke
ok    no runtime errors on boot
ok    renders a growing reading round
ok    every wiring path runs without throwing
all boot checks passed          SMOKE exit=0

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically  PARITY exit=0
```

**Deploy: shipped and VERIFIED FROM THE BUNDLE, not from the tests.** Pushed
`d6f99c6`; CI run `30444437020` completed **success**. Note the hosting layout,
which cost me time: `https://jtr31415.github.io/JunosIsland/` is the newest `v*`
TAG and `/preview/` is `main` — and the preview page's asset `src` is absolute
(`/JunosIsland/assets/...`) while its bundle actually lives at
`/JunosIsland/preview/assets/...`, so the obvious URL 404s with a 9,379-byte
GitHub error page that looks like a tiny bundle. The real one is 129,638 bytes.
In it, minified with backtick strings:

```
function ai(e,t=null){return e.phase===`free`?{...e,phase:`placing`,chosen:null,pending:t}:e}
case`pet`:{n.bouncePet(t.id);...}case`tile`:return n.focusOn(t.axial),e;default:return e}
```

That is `askForLand` with no resumption, and a tile tap that only moves the
camera. Both halves of the fix are live.

## Where the next manager starts

**Not on PB-036** — it has its own manager. Ask the drumbeat for the next item;
the honest candidates are item 5 (`PB-043`, the reading progression curriculum,
which is a survey-then-ask item, not a build-it item) and Joe's two brand-new
cards, `PB-048` *asset loading optimisation* and `PB-049` *revisit the
"addictiveness"* — the second says explicitly *"discuss with fable 5 in a quick
back and forth to decide on a strategy"*, so it is a conversation before it is
any code.

**If you touch the plot/flow/tap seam at all, read `docs/HANDOFF.md`'s new
"Landmines added 29 July" section first.** The single most useful line in it:
a standing plot means she ABANDONED one, and nulling `flow.plot` makes an
abandoned tile play the completion farewell.

**Nothing about how a tile TYPE is chosen or stored has changed in shape**, which
matters because the PB-036 manager is introducing sets and a `species + set` key.
`flow.plot` is still exactly `{ at: Axial; type: TileType } | null`
(`flow.ts:141`), still persisted whole (`save.ts:179`), still sanitised by
`readPlot` against `grass|water|rock` (`save.ts:186-192`). `TileType` is TERRAIN
and has no relationship to species or sets. What changed is only WHEN the type is
chosen: it is now re-asked on entry at each new socket instead of surviving an
abandonment. **No collision with the roster work.**

## What I learned that is not in the code

All three are now written into `docs/HANDOFF.md` under "Landmines added 29 July",
so this is the short form:

- **`joe/backlog.json` races Joe exactly like `joe/tasks.json` does, and it cost
  three collisions in one run.** His page was loaded before the drumbeat
  committed `PB-048`, so his stale `nextId` dealt his own new cards an id that was
  already taken and the whole-file save overwrote the live-bug card outright —
  twice on the same id. Verify after writing, not just before: card count up,
  no duplicate ids, everything in `HEAD` still present, still LF.
- **Do not fight him for an id.** His cards keep the ids he gave them; your
  record moves and says in its own text which id the orders and commits call it.
- **A near-miss at a pet is a `kind:'tile'` hit**, not "nothing" — `picking.ts`
  has no nothing answer. Any behaviour you attach to a tile tap is behaviour you
  have attached to missing an animal.
- **`git commit -m @'...'@` in the Bash tool is PowerShell syntax and bash takes
  it literally**, so the `@` becomes part of the subject line. Caught before
  pushing and amended with `-F`; use a message file.

## Decisions

**Raised this run:** `JT-028` — *Fred's crowding invite now stays quiet for a
build she starts AFTER abandoning one (PB-048 × PB-042)*. Nothing was changed at
`interactions.ts:159`; what changed is what a standing plot MEANS underneath it.
I built nothing on a guess and did not ask Fable — the governors are Joe's, tuned
across eight rulings, and a live bug should not drag a balance change along with
it. Reversal is one condition on one line, about twenty minutes.

**Picked up this run (his nod):** none. `JT-026` (B3's lean) and `JT-027` (the
25th egg) are both still `open` with empty notes — I checked `joe/tasks.json`
first thing. **So nothing was reverted, and B3's lean stands exactly as shipped**;
the reversal remains costed at about an hour with the dials at
`harness.ts:199-268`.

**Decided rather than asked, and reversible:** that the abandoned scaffolding
stays visible on the island rather than being cleared. It follows from Joe's
ruling and it is what makes the fix safe, but it is a thing a child sees, so it
is worth his eye on the tablet — as the original card asked. It does **not**
read as a loss: `sumsForTile` depends only on `tilesEarned`, so the plot at the
new socket appears already grown to the stage the old one had reached. She sees
her build move, not shrink.

**The id, stated plainly so nobody re-derives it:** the live bug is `PB-050` in
`joe/backlog.json`. `docs/MANAGER-ORDERS.md` item 0 and commit `d6f99c6` both
call the same work `PB-048`, and `PB-048` in the backlog is now Joe's own asset-
loading card. The closed card's full text is also at
`git show 5574cf7:joe/backlog.json` under the old id.

**Still open in the workbench:** `JT-001`, `JT-004`, `JT-005`, `JT-006`,
`JT-007`, `JT-023`, `JT-026`, `JT-027`, `JT-028`.
