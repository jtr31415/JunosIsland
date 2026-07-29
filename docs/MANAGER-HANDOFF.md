# Manager handoff

*Run 5, written 29 July 2026. Read `docs/MANAGER-ORDERS.md` for the job.*

## Queue position

- **Item 1 (PB-042): DONE** (run 4). JT-021 and JT-022 came back this run and
  neither moved any code — see Decisions.
- **Item 2 (addition/subtraction ladder = PB-030, Run B): IN PROGRESS.**
  B1 DONE (`1cf4e71`). **B2 DONE this run (`ad848e4`), deployed and verified
  from the shipped bundle. B3 is NOT STARTED and is yours.**
- Item 3 (backlog sweep): NOT STARTED

## What this run did

**Slice B2, the offer surface, complete.** The island now asks her Run B's two
questions and a yes is worth something. `harness.pendingOffer()` was already
complete on its own, so the surface renders what it returns and re-derives
nothing — there is a test that goes red if anyone adds a second cadence check to
the render path.

Five things landed:

1. **`overlay.offer(text): Promise<boolean>`** (`src/island/overlay.ts:156`
   declared, `:702` implemented). Shown **after** `await ceremony(...)`, never
   inside it, because `ceremony()` holds the island's exits locked and an offer
   is not a thing to put to a child who cannot leave. **A backdrop tap resolves
   nothing at all** — a decline carries a two-session consequence and a stray
   palm on a tablet must not be able to spend it. This deliberately diverges
   from `askName()`, which it is otherwise modelled on.
2. **The two lines, byte-verbatim** from `pet-island-runA.md:230-236`, spoken
   and pinned as bytes in `tests/island/offer.test.ts` and in
   `voice/scripts.json`. A test asserting "some text was spoken" would have been
   worthless here.
3. **The honeymoon's economic half**, as Option A — maths only (JT-024).
4. **`autoWouldDo` went live** (`src/island/report.ts:243`), and
   `LearningDeps.harness` became **required**: the panel had been building a
   second harness on the wrong clock, which `barrier.test.ts` exists to forbid.
5. **The minus sign pops on debut**, read off `attainment.takingAway.stages[1]
   .attempts === 0` — the real record, so the debut survives a held re-deal and
   happens exactly once. No new persisted state.

**The honeymoon economy, and why it is shaped the way it is.** Fable chose
maths-only on Joe's own JT-018 (*"unlimited tiles, limited stash of animals"*),
and found a second reason nobody had spotted: `pagesRead` works out which
reading page she is on by dividing progress by the pay rate, so a reading page
paying 3 would have drifted the 3-build-1-find mix Joe ruled in JT-010(2).
The frozen cost index is a **permanent offset** (`honeymoonTiles`), not a freeze
that thaws — a thaw would snap the tile price up and strand part-paid progress,
which `flow.ts:37-57` spends twenty lines proving can never happen. And pay-3
overshoots a pay-2-quantised price, so `commitPlot` now carries the remainder
forward instead of zeroing it (brief §19).

## Gate results

Hashed the tree immediately before and immediately after, and it did not move.

```
### HASH BEFORE   ce42cd2fe60378fa1616ef5df7e89a2f
$ npx vitest run
 Test Files  73 passed (73)
      Tests  1475 passed (1475)      (baseline 1402 / 72 files)
   Duration  31.64s
$ npx tsc --noEmit -p tsconfig.json
TSC OK exit=0                        (no output)
$ npm run build
PWA v1.3.0 · mode generateSW · precache 8 entries (772.42 KiB)
  ../../dist/island/sw.js  ../../dist/island/workbox-9c191d2f.js
$ npm run smoke
ok  builds the ambience layer / battery is retired / reading mode is active
ok  score bar initialised
all boot checks passed
$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  first spoken      : ["run","got","am","a"]
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically
### HASH AFTER    ce42cd2fe60378fa1616ef5df7e89a2f
```

`git diff --stat tools/golden/golden.json src/core v0` is empty.

**§5 discipline — eight reverts, done by me, each watched go red.** The three
build agents report thirty-one more between them; **those are theirs, not mine,
and are not claimed here or in the commit.** The tree hash was confirmed back to
`ce42cd2…` after every single restore.

| mutation | tests red |
|---|---|
| `noteOffer('sums', …)` instead of `due.path` | 1 |
| her yes never persisted (drop the `commit`) | 1 |
| maths pays `itemPay()` — pay-3 dead | 3 |
| drop `- f.honeymoonTiles` — frozen index dead | 4 |
| pop every take-away, not just the debut | 1 |
| "Not now" resolves `true` | 2 |
| `autoWouldDo` stops naming a standing offer | 2 |
| the spec line reworded "trickier"→"harder" | 1 |

**Deploy: DONE and VERIFIED FROM THE SHIPPED BUNDLE.** CI green
(`gh run list` → success, 1m37s), Pages rebuilt `index-B12HLUsZ.js` →
**`assets/index-x2R0Wd-P.js`** and `assets/index-M91DIwIK.css`. Grepped the live
JavaScript, not a tick (`agent-browser` still wedges on `open`; method at the
foot of this file):

```
"trickier questions"                    1     ← the offer line, verbatim
"Would you like to do some taking away" 1
"Yes please" / "Not now"                1 / 1 ← both answers, as words
op-debut / op-debut-pop (in the CSS)    1 / 1 ← the minus-sign debut
honeymoonTiles                          1     ← the frozen index, persisted
"offering taking away"                  1     ← autoWouldDo, live
D.noteOffer(e.path,r)                         ← answers with the DUE offer's
                                                path, not a literal
rg(l,void 0,D.honeymoonActive(xe?.path??`sums`))
```

## Where the next manager starts

**Slice B3 of PB-030.** Run A's spec for it is `docs/pet-island-runA.md:236-240`
and it is four things: the **65/35 weakness lean** between paths, bounded, and
**on persistent estimates only**; **invisible in-session mercy runs**; **whisper
retirement** (1–2 items a session from mastered stages, feeding the settled-✓
that can quietly wake); and the **month-walk** asserting refusal-inertness and
the ratchet. *"Nothing demotes, ever."*

The seam is the same one B2 just used and it is clean: the harness decides,
`main.ts` renders. `harness.dealMaths(roll)` (`src/island/harness.ts`, declared
`:~440`) is where the lean belongs — it currently draws uniformly over the
ticked pool, which is Joe's JT-010(1) ruling, so **the lean must not break that
ruling; read JT-010's note in `joe/tasks.json` before touching it.** Mercy runs
and whisper retirement are also `dealMaths`/`pick` decisions, not render ones.

**Read `docs/HANDOFF.md:588-601` before you write a line of it.** The plot/flow
seam has produced faults no unit test on either side could see, and B3 is the
same shape. `tests/island/offer.test.ts` is now the second worked example of a
test that drives BOTH sides (the first is `fred.test.ts`, `describe('no child is
ever read a placeholder — JT-019')`); copy its rig.

## What I learned that is not in the code

- **`ceremony()` locks the island's exits for the whole of its body.** Anything
  that asks a child a question must therefore run *after* `await ceremony(...)`
  returns, not inside it. A test pins this; it is not obvious from the call site.
- **`itemPay()` cannot become path-aware, ever.** Three callers must keep seeing
  2 forever, and the dangerous one is the save stamp (`save.ts:161`/`:203`): it
  is the *denomination* of banked units, so if it ever wrote 3, `fromSave`'s
  rescale would corrupt every unit a child had banked, on the next load. Pay-3
  is a sibling function, never a parameter to that one.
- **A cost index that unfreezes is a trap.** Suspend-and-resume snaps the price
  up at expiry and strands part-paid progress. Offsets are monotone; freezes are
  not. Same reasoning as the no-stranding proof at `flow.ts:37-57`.
- **Pay-3 breaks the quantisation assumption.** Prices are whole multiples of
  `pay.item`, so pay-2 lands exactly on the price and pay-3 overshoots by 1–2
  units. Anywhere that zeroes progress on purchase now silently eats what she
  earned. There may be more of these; the egg side was checked and is safe only
  because reading always pays 2.
- **`voice/scripts.json`'s enforcement is narrower than it advertises.** Its
  `about` says no spoken line may be added without an entry, but the test at
  `stretch.test.ts:527-595` only scans `GOVERNOR_LINE` — it does not sweep
  spoken literals in `main.ts`, so the two new lines would NOT have been caught.
  `offer.test.ts` supplies that enforcement for them. **If you add a spoken line,
  you must add its own test; the ledger will not catch you.**
- **Files in this tree keep coming back CRLF from editor passes.** It happened
  twice this run, to `tests/island/flow.test.ts` and `src/challenges/sum.ts`,
  and `git status` says nothing about it. Both agents caught it on the check.
  Run `tr -cd '\r' < file | wc -c` over every changed file before you gate.
- **Do not build JSON for `joe/tasks.json` inside a bash heredoc that the shell
  expands.** I wrote two workbench records through `node -e "…"` in double
  quotes and bash silently ate every backtick-quoted identifier inside them,
  turning `honeymoonTiles` into nothing. The safe-write check caught that Joe's
  notes survived, but not that my own text was mangled. **Write the script to a
  file with a quoted heredoc (`<<'EOF'`) and run it.**
- **Run 4's rule held and it is worth restating:** every subagent had REPORTED
  before I ran a single gate, and the tree hash either side of the gate run was
  identical. It also caught the eight restores. Cheap, and it is the difference
  between run 4's red CI and this run's green one.

## Decisions

**Picked up this run (his nod, all three answered mid-run and committed as
`dd2ed72` on their own before any code was touched):**

- **JT-020 — DONE, no code change.** *"If a trickier-sums offer is due the same
  session, taking away wins."* That is exactly what `pendingOffer()` already
  does, so his nod ratified the surface I was about to render rather than
  changing it.
- **JT-021 — DONE, commentary only.** *"lets keep for now… mark it in the code
  commentary so we find it easy if we need to change."* The 1.2/4.0 price walls
  are unchanged and now carry provisional markers in **two** places:
  `balance.json:9` (a `__jt021` note string, using the `__`-prefix convention
  `balance.dev.json` already established, since JSON has no comments) and the
  tuning table in `src/island/balance/index.ts:369-379`.
- **JT-022 — DONE, "accepted".** Grace silencing the crowded governor below six
  animals stands. `governors.ts` and its fixtures did not move. **The standing
  consequence still holds: any test of the crowded wall must use ≥ 6 animals.**
- **JT-023 — still open.** External recording task, nothing blocked.

**Raised this run:**

- **JT-024** — the honeymoon makes maths cheaper and leaves reading alone.
  Fable's call on his own JT-018; built on and shipped in `ad848e4`. The card
  says a reversal is roughly half a day, not a data edit.
- **JT-025 — NEEDS JOE.** The offer promises *"eggs and tiles faster"* and under
  JT-024 only tiles get faster directly; eggs get faster only when the island is
  crowded. Words a child hears, so his alone. Three options costed; nothing is
  blocked, and option (b) is one line plus a `scripts.json` entry.

## Deploy verification (run 1's method — `agent-browser` wedges on `open`)

```bash
js=$(curl -s "https://jtr31415.github.io/JunosIsland/?cb=$(date +%s)" \
     | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1)
curl -s "https://jtr31415.github.io/JunosIsland/$js" -o live.js
grep -c "trickier questions" live.js    # B2's offer line — 0 before, 1 after
grep -c "honeymoonTiles"     live.js    # the frozen index reached the bundle
```

Do the CSS separately (`assets/index-*.css`) — `op-debut-pop` lives there, and a
class name in the JS is not proof the animation shipped.
