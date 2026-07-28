# Manager handoff

*Run 1, written 28 July 2026, evening. Read `docs/MANAGER-ORDERS.md` for the job.*

## Queue position

- **Item 1 (PB-042): DONE.** Both halves built, gated, committed, deployed and
  verified in the live bundle. Seven decisions raised into the workbench.
- Item 2 (addition/subtraction ladder): NOT STARTED — **this is where you begin.**
- Item 3 (backlog sweep): NOT STARTED

## What this run did

Joe reported mid-run that the deployed build was *"erroneously forcing tile
building"*, with Juno frustrated by it right then. So PB-042 stopped being a
tidiness card, and I shipped it in two commits rather than one, urgent half first.

**Half A — the lockout (`58425b6`).** `governors.ts` had claimed since slice 1
that the governors are *"INVITATIONS, never lockouts... the child may ignore
him"*, while both call sites in `interactions.ts` invited and returned the flow
unchanged forever. Nothing greyed out, nothing was taken away, and she could tap
all day — but the round never opened. `invite()` now returns `'asked' | 'again'`:
the first tap spends itself on Fred's line, the next tap on the same thing opens
the round regardless. The memory clears **on** the override, so every override
costs one extra tap and is preceded by the announcement — never a silent
wave-through.

**Half B — the price (`bdc9290`).** Past a wall the over-bought thing gets
dearer instead of refused. Target 2.0 tiles per pet; walls at 1.5 and 3.0
(symmetric in *animals per tile* — 2/3, 1/2, 1/3 evenly spaced — which is the
unit Joe stated his target in); surcharge `1 + d/4` capped at ×3, applied before
the round-to-a-multiple-of-two. `activeGovernor` now fires on exactly the same
condition as the price, which caught a real bug: a new island is one hex with
nobody on it, already a step past the empty wall, so the first tile of the game
would have cost 25% more in silence. Grace now suppresses both together.

**§19 held structurally, not by assertion:** an in-progress price can never rise.
Fields only arrive by committing a plot (which zeroes `sumProgress`), friends
only by hatching (which zeroes `readProgress`), and `placeTile` refuses while a
plot stands. So while she is part-paid toward a thing, every move open to her
makes *that* thing cheaper. Brute-forced over a 40×20 grid.

## Gate results

Final, on the committed tree:

```
$ npx vitest run
 Test Files  71 passed (71)
      Tests  1322 passed (1322)

$ npx tsc --noEmit -p tsconfig.json
TSC OK                                    (no output; exit 0)

$ npm run build
precache  8 entries (766.20 KiB)
files generated
  ../../dist/island/sw.js
  ../../dist/island/workbox-9c191d2f.js

$ npm run smoke
ok    score bar initialised
all boot checks passed

$ npm run parity
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically
```

§5 discipline done on both halves. Half A: reverting the egg guard failed 2 of
the 4 new tests. Half B: defeating only the surcharge failed 2; reverting the
walls failed 7. `tools/golden/golden.json` untouched throughout.

## Deploy

**Both halves live and verified from the artefact, not from the green tick** —
and without a browser, since `agent-browser` was reported wedging. CI runs
`30387358836` (half A) and `30389081100` (half B), `deploy: success` on both.
Live at <https://jtr31415.github.io/JunosIsland/>. I fetched the deployed bundle
each time: half A's minified `invite` with the `'again'` return is there, and
half B's `corridor` / `crowded` / `capMultiple` are in `assets/index-Deg0Btyb.js`.

**Landmine:** the Pages root builds from *the newest `v*` tag* and only falls
back to `main` because **no tag exists yet**. Cut a `v1` and pushing to main will
only move `/preview/`. `.github/workflows/*.yml` L93-106, L116-121.

## Where the next manager starts

**Start item 2, the addition/subtraction ladder.** But do the workbench sweep
first — see Decisions below; JT-018 and JT-019 could send you back into PB-042.

For item 2, the constraint that matters is the HANDOFF landmine: the two
regression gates pull in opposite directions. `golden.json` pins per-level
generator *behaviour* and is frozen; `parity.mjs` drives v0's own level switch.
So adaptive **selection** must live in the island layer and never in
`src/core/`. Start from `docs/PHASE4.1-EDUCATIONAL-HARNESS.md` and
`docs/pet-island-difficulty.md`.

## What I learned that is not in the code

- **Read `joe/tasks.json` FIRST, every run.** The decision channel is the
  workbench now, not a markdown file — `docs/DECISIONS-FOR-JOE.md` is deleted.
  Look for `type: "ruling"` tasks that have gone `state: "done"` with a `note`
  filled in. **That note is Joe's ruling**, and it may reverse what Fable
  decided — in which case your job is to revert or amend what was built on it,
  not to argue. Each JT-013..019 detail names the commit to change. Record in
  your handoff which ids you picked up and what you did about each.
- **Do not judge a background subagent's work by sampling the working tree.** I
  read the tree three times while the price agent was still writing and got 11,
  then 1, then 3 failures — and very nearly reverted a build that was two tests
  from done. "Stable for three minutes" proves it is thinking, not finished.
  Wait for the agent's own report, or do not look.
- **Grepping a minified bundle for a source string will lie to you.** My first
  deploy check came back negative and I nearly reported a failed deploy: shell
  quoting ate the pattern, and the minifier had rewritten `'…'` to backticks.
  Grep your *local* `dist` bundle for the same pattern first — if it is absent
  from a build you know contains the change, the pattern is wrong, not the deploy.
- **`vi.fn()` returning `undefined` silently becomes "override".** The new guard
  tests `=== 'asked'`, so a bare stub makes every governor tap pass through and
  every test go green for the wrong reason — HANDOFF §5's trap, set fresh.
  `interactions.test.ts` now uses a faithful ask-once mock and pins the real
  `main.ts` wiring by source text, as `stretch.test.ts` does for the break.

## Decisions

**Raised this run — JT-013 to JT-019, all `state: "open"` in `joe/tasks.json`:**

- **JT-013** — does 2.0 tiles/pet supersede the shipped 1.5? (Fable: no — 1.5 is re-filed as the crowded wall, because Joe's own "buffer to 2:3" *is* 1.5)
- **JT-014** — the buffer walls as numbers: 1.5 and 3.0, symmetric in animals-per-tile (Fable)
- **JT-015** — escalation `1 + d/4` capped ×3 (Fable; it flagged this as the likeliest of the three to be wrong)
- **JT-016** — the price must start exactly where Fred starts talking (manager; caught the grace-period silent premium)
- **JT-017** — the override is a second tap and Fred asks again every time (manager; shipped in `58425b6`)
- **JT-018 — NEEDS JOE, nothing built on it.** The new corridor sits entirely above the old, so a girl at one tile per animal now pays dearer *eggs*. What she will feel is "reading got more expensive", which may not be the lever he meant.
- **JT-019 — NEEDS JOE, nothing built on it.** Doing one of the thing Fred asks can now fail to silence him; it always worked before. I loosened the test to "at most two, and never via the other governor" rather than papering over it.

**Picked up this run:** none — JT-012 was already ruled, and is what this run built.
