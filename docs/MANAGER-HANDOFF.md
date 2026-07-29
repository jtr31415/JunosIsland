# Manager handoff

> ## ⚠ RUN 3 WAS KILLED MID-BUILD — READ THIS BEFORE THE REST
>
> *Written by the drumbeat, 29 July 2026, ~00:35. Run 3 did not write a handoff
> because it did not get to stop — it hit the account's weekly token limit
> mid-edit and terminated. Its last words were "let me fix the tests I know are
> wrong". So the body of this file is still RUN 2's handoff, and it is accurate
> about everything except what run 3 did. What follows is what run 3 left behind,
> measured by the drumbeat rather than reported by run 3.*
>
> **What run 3 FINISHED and pushed — do not redo it:**
> - The workbench repair, committed as `3c364b4` and pushed. Verified by reading
>   the file: all twenty tasks present, JT-020 restored and `open`, and Joe's
>   notes on JT-013…JT-019 all present and non-empty, **including his rewritten
>   JT-016**. Nothing of his was lost in the end. `origin/main` is up to date;
>   there are no unpushed commits.
> - The safe-write procedure is already written into `docs/MANAGER-ORDERS.md`
>   (see "Writing to `joe/tasks.json` safely") and `docs/HANDOFF.md` — but both
>   files are UNCOMMITTED in the working tree. Commit them.
>
> **What run 3 left HALF-DONE — this is your inheritance:**
> The JT-014 build (warning and price at different crowding thresholds). The
> working tree is dirty and **13 tests are RED across 2 files** (1375 passing of
> 1388). Measured by the drumbeat at 07:31 UTC, not guessed:
> ```
>  M docs/HANDOFF.md              M src/island/balance/index.ts
>  M docs/MANAGER-ORDERS.md       M src/island/governors.ts
>  M src/island/balance/balance.json  M src/island/main.ts
>  M tests/island/governors.test.ts
>  ?? tests/island/balance-governor.test.ts   (new, untracked)
> ```
> Two failures I saw directly: an `activeGovernor(f)` expectation around
> `tests/island/governors.test.ts:592` expecting `'nursery-queue'`, and
> `tests/island/stretch.test.ts:536` — a new governor line id **`space-surplus`
> has no entry in `voice/scripts.json`**. That second one is a real gap in the
> work, not a stale test: a new nudge was added without its voice line.
>
> **Your first decision is whether to CONTINUE or DISCARD this half-build.**
> Judge it on the code, not on sunk cost. It is uncommitted, so discarding is
> cheap and safe — but note the two doc files above are also uncommitted and are
> worth keeping regardless, so do not blanket-`checkout` the tree. If you
> continue it, remember the tests may be red because the *implementation* is
> half-written, not because the tests are wrong; run 3's dying instinct was to
> "fix the tests", which is exactly the instinct to distrust.
>
> **The deployed game is NOT affected.** Everything red is local and uncommitted.
> The live site carries PB-042 as shipped and verified; Juno's game is fine.

*Run 2, written 28 July 2026, late. Read `docs/MANAGER-ORDERS.md` for the job.*

## Queue position

- **Item 1 (PB-042): REOPENED by Joe.** It was DONE. His JT-014 note reverses
  part of it. **This is your first job — see Decisions.**
- **Item 2 (addition/subtraction ladder = PB-030, Run B): IN PROGRESS, split.**
  Slice B1 (the deciding half) is DONE, gated and committed as `1cf4e71`.
  Slice B2 (the offer surface) is NOT STARTED. The seam is named below.
- Item 3 (backlog sweep): NOT STARTED

## What this run did

Item 2 is **PB-030, "Run B — automatic progression"** (`docs/pet-island-runA.md:225-241`).
It is far too large for one run: gates, probes, the offer, mixed taking-away,
65/35 weakness lean, mercy runs, whisper retirement, the month-walk. I split it
at the only clean seam — **what decides** versus **what she sees** — and built
the first half.

`src/island/harness.ts` already declared `probeWanted` / `offerDue` /
`noteOffer` and left them inert for Run B. They are now live policy. One round
in eight, once the rung below reads ewma .75, is drawn from the next unticked
stage. Probes land in their own 12-deep ring and move *nothing* else, because
`ewma` is seeded by the first answer — a failed first probe would seed an
unticked stage at zero and damn it for dozens of attempts, which is §19's
"wrong answers cost nothing" violated in the ledger. The gate is ewma .85, 20
attempts, 8 probes at .70, no rescue in either of the last two sessions, two
distinct days. One offer per session; a decline costs nothing and buys two
quiet sessions. Run B only ever ticks, and only on Auto paths (JT-011a).
Nothing demotes — asserted against a collapsing ewma, a rescue storm and a
wrong streak.

**All of it is in the island layer.** `src/core/` and `tools/golden/golden.json`
are byte-untouched; `git diff --stat` against both is empty. Parity is unmoved.
That is the HANDOFF §6 landmine (`docs/HANDOFF.md:580-586`) honoured by
construction rather than by care.

§5 discipline: 24 behaviours reverted one at a time, each named test went red.
The one that stayed green — the per-session offer limit, which was actually
being blocked by the decline cooldown — was a bad test and is now a cross-path
one that fails properly.

## Gate results

```
$ npx vitest run
 Test Files  71 passed (71)
      Tests  1368 passed (1368)
   Duration  25.98s
                                   (baseline was 71 / 1322; +46 net)

$ npx tsc --noEmit -p tsconfig.json
TSC OK exit=0                      (no output)

$ npm run build
PWA v1.3.0
precache  8 entries (768.92 KiB)
files generated
  ../../dist/island/sw.js
  ../../dist/island/workbox-9c191d2f.js

$ npm run smoke
ok    reading mode is active
ok    score bar initialised
all boot checks passed

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically
```

## Where the next manager starts

**First, JT-014 — Joe reopened PB-042.** His note: *"actually that probably
does need reversing. suggest a number yourself at which to start warning and
then at which it gets noticibly more expensive, which itself adds some
elasticity."* Run 1 shipped the warning and the price starting at **the same**
threshold (that was JT-016, deliberately). He now wants them **separated**: Fred
warns at one crowding level, the surcharge starts at a later one. He is asking
*you* to pick both numbers — that is an instruction, not a question, so do not
send it back to him; choose, justify in the commit, and raise a JT only if you
think he would disagree. Same visit, fold in **JT-015**: he accepted +25%/step
capped ×3 but asked that the constants be *"mark[ed] … explicitly if user
testing finds it needs adjusting"* — so give that block a loud, named home. Both
land in `src/island/balance/`, and the shipped mechanism is commit `bdc9290`.
**JT-013 needs no work:** he said yes, 2.0 tiles/pet is the target, which is
what `bdc9290` already ships.

**Then slice B2, the offer surface.** The seam is exactly two functions and
nothing else:

- `harness.pendingOffer()` → `{ path, stage, kind: 'trickier' | 'takingAway' } | null`
  (`src/island/harness.ts:~792-916`). It is complete on its own — priority,
  cadence, cooldown and mode are all already applied. B2 renders whatever it
  returns and must not re-derive any of it.
- `harness.noteOffer(path, accepted)` applies the consequence, including the
  tick and the honeymoon stamp.

B2 owes: the overlay at a completion high, the two lines verbatim from
`docs/pet-island-runA.md:230-236` — *"You are doing really well! Would you like
some trickier questions? They will get you eggs and tiles faster."* and
*"Would you like to do some taking away?"* — the minus sign popping on debut,
`honeymoonActive(path)` read by `src/island/balance/` for pay-3 and the frozen
cost index (B1 deliberately stamped the marker and changed no economy), and
"what Auto would do" going live in `src/island/grownups.ts`. Heed
`docs/HANDOFF.md:588-601`: the plot/flow seam has produced three faults in two
days and only a test driving *both* sides catches them.

**Then B3:** 65/35 weakness lean, invisible mercy runs, whisper retirement, and
the month-walk asserting refusal-inertness and the ratchet.

## What I learned that is not in the code

- **The docs disagree about the gate numbers, and `runA.md` wins.**
  `docs/pet-island-difficulty.md` says A ≥ .90 / F ≥ .70 / C; `runA.md:227-229`
  says ewma ≥ .85 / 20 attempts / probes ≥ .70 over 8 / 2 days. The difficulty
  doc marks *itself* stale at its line 8 ("reconcile against the field report
  when it lands"), and `runA.md` was ratified 27 July. I built to `runA.md`. If
  a future run finds the numbers argued about again, this is why.
- **`readAttainment` silently eats fields you add to `StageStats`.** It rebuilds
  outward from the `STAGES` table (`harness.ts:207-264` in the old numbering) as
  untrusted-input discipline, so a new persisted field that the reader does not
  explicitly copy survives a save and vanishes on the next load — green tests,
  data loss in the field. Any new attainment field means editing the reader.
- **`takingAway` starts with nothing ticked**, which quietly breaks any gate
  written in terms of a path's own history: a path with no ticked stage can
  never probe itself, so it can never be promoted by the normal rule. Every
  future path added dark will have this same hole.
- Joe answers the workbench *while you are running*. Re-read `joe/tasks.json`
  before you write the handoff, not only at the start — three of this run's
  four pickups arrived mid-run.

## Decisions

**Picked up this run (his nod):**

- **JT-013 — no action needed.** *"yes, because now we have more elasticity
  either way."* 2.0 tiles/pet is the target; `bdc9290` already ships that.
- **JT-014 — ACTION REQUIRED, not done this run.** He reverses JT-016: the
  warning and the price must start at *different* thresholds, and he has asked
  the next manager to propose both numbers. First job above.
- **JT-015 — accepted, small action outstanding.** +25%/step capped ×3 stands;
  he wants the constants explicitly marked for later tuning.
- **JT-016 — closed with no note.** Read as accepted-as-built, but note JT-014
  supersedes it in substance.
- **JT-017, JT-018, JT-019 — still `open`.** JT-018 and JT-019 are marked NEEDS
  JOE with nothing built on them; they still are.

**Raised this run:**

- **JT-020** — which rung introduces taking away? Fable chose "off sums 1 alone,
  probe clause dropped, ahead of a trickier-sums offer in the same session", and
  `1cf4e71` is built on it. The card names what a reversal costs (one line for
  one alternative, a slice for the other) and flags a second, smaller call
  inside it: the introduction requires *taking away* to be on Auto but does not
  require *sums* to be.

**Why this run stopped here.** PB-030 is a five-slice card and I finished one of
them cleanly with all five gates green and the seam written down. Picking up
JT-014 as well would have meant starting a second substantial piece past 30% of
my window. Per the orders, a fresh manager at 5% beats a tired one at 60%.
