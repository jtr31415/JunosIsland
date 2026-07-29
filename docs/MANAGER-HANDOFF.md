# Manager handoff

*Run 6, written 29 July 2026. Read `docs/MANAGER-ORDERS.md` for the job — the
queue changed TWICE mid-run (`c432b3f`, `02e5f6b`) and now has five items.*

## Queue position

- Item 1 (PB-042): **DONE** (run 4).
- Item 2 (PB-030, the addition/subtraction ladder): **DONE.** B1 `1cf4e71`,
  B2 `ad848e4`, **B3 `9138176` this run.** Run B is complete.
- Item 3 (**hold the work, reconcile the backlog**): **NOT STARTED — yours.**
- Item 4 (PB-036, themed animal collections): NOT STARTED.
- Item 5 (the reading progression curriculum): NOT STARTED.

**Joe's instruction is that item 3 is a real queue item, not housekeeping.** Do
not start item 4 before it is done.

## What this run did

**Slice B3, the last of Run B** — the 65/35 weakness lean, invisible in-session
mercy runs, whisper retirement, and the month-walk. The commit message on
`9138176` carries the full reasoning; the three things worth knowing here:

1. All three mechanisms had to reach into ONE function, `dealMaths`, whose
   uniform draw *is* Joe's JT-010(1). It became a **cumulative weighted walk
   over the same pool, in the same order, on the same single roll** — with all
   weights equal, the same selection down to the boundary case. That identity is
   a test, and it is what keeps every pre-existing test a test of the new code.
2. **The line that protects JT-010** is `harness.ts:878-892`: stage weights are
   renormalised *within* a path before its path weight multiplies them, so mercy
   and retirement cannot move the sums-versus-taking-away share at all.
3. **The lean bounds its own strength, not the share** (Fable's option C, raised
   as **JT-026**), because a tick is the parent's statement and must always
   outrank an estimate. Mercy and retirement persist **nothing**, and waking a
   retired rung needed no new state — its ewma falls, `solid` goes false by
   itself, and nothing unticks.

## Gate results

Every subagent had **REPORTED** before a single gate ran, and the tree hash
either side of the gate run is identical.

```
### HASH BEFORE   54d69a97b0cdff07f1bf16c0e90bff81
$ npx vitest run
 Test Files  74 passed (74)
      Tests  1509 passed (1509)      (baseline 1475 / 73 files)
   Duration  30.35s
$ npx tsc --noEmit -p tsconfig.json
TSC OK exit=0                        (no output)
$ npm run build
PWA v1.3.0 · mode generateSW · precache 8 entries (773.59 KiB)
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
### HASH AFTER    54d69a97b0cdff07f1bf16c0e90bff81   → TREE DID NOT MOVE
```

`git diff --stat tools/golden/golden.json src/core v0` is empty. All three
changed files checked `CR=0`.

**§5 discipline — I claim none of it as mine.** I ran no mutation myself. The
build agent reports 13 and the month-walk agent 11; **those are their claims,
not mine**, and are not claimed in the commit either. Two are worth repeating
because they are honest against interest: the build agent found one mutation
that **cannot be made red** (the all-zero-weight fallback is genuinely
unreachable) and said so rather than pretending; the month-walk agent had **two
mutations come back GREEN**, found its own tests were measuring the wrong thing,
and fixed the tests rather than the mutation.

**Deploy: DONE and VERIFIED FROM THE SHIPPED BUNDLE.** CI green (1m52s), Pages
rebuilt `index-x2R0Wd-P.js` → **`assets/index-Cb--qzwE.js`**. Grepped the live
JavaScript (method at the foot of this file):

```
settledStages       1   ← whisper retirement's public read, B3-only
65/35               1   ← LEAN_MAX, survives minification, B3-only
trickier questions  1   ← B2 still shipped
honeymoonTiles      1   ← B2 still shipped
```

## Where the next manager starts

**Item 3: stop building and reconcile the backlog.** I surveyed the ground for
you, scoped to Run B only, so you should not need a survey of your own:

- **`joe/backlog.json` PB-030 is `"state": "planned"` and that is now wrong** —
  all eight behaviours in its `detail` have shipped. The file's own convention
  for this is PB-033 (`"state": "done"` plus a "BUILT 28 Jul" note); PB-042 uses
  a **`progress` field** instead, which is the existing precedent if you would
  rather record delivery than close the card.
- **The honeymoon is not named in PB-030's `detail` at all.** It shipped in B2.
  That is a gap in the card, not a staleness — the card under-describes what was
  built.
- **`docs/BACKLOG.md` has no PB-030 card and never mentions Run B.** Grep for
  `PB-030|Run B|B1|B2|B3` returns nothing. Its staleness is total omission, so
  it cannot be reconciled line-by-line — it has to be written.
- **A live file-to-file disagreement, and it touches the signal Run B gates on:**
  `docs/BACKLOG.md` `#44` describes adaptive difficulty reading "pages passed" as
  an open, undecided question, while `joe/backlog.json` PB-007 marks that same
  `#44` card `"state": "done"` under Run A.
- `joe/backlog.json` `nextId` is **43**.
- **JT-025's note is a NEW requirement that arrived on the wrong card** and must
  become a card of its own, or it will be lost inside a closed ruling. It is
  queue item 5.

## What B1–B3 established about a progression — for the reading ladder

The coordinator asked for this, and it is the cheapest thing in this file:
**which parts of the maths ladder are general, and which were about maths.**

**General — copy these.** (1) *Selection lives in the island layer, never
`src/core/`.* This is structural, not stylistic: `golden.json` pins per-level
generator behaviour and `parity.mjs` drives v0's own level switch, so the two
regression gates constrain a ladder from opposite directions and only the island
layer is free. (2) *Nothing demotes, ever* — and the cheapest way to honour it is
to make regression **emergent from the estimate** rather than a stored flag.
Whisper retirement needed no `settled` field at all; a rung wakes because its
ewma fell, so there is no state that can disagree with the evidence. (3) *One
offer a session, and a decline costs nothing but a cooldown.* (4) *A capability
tick is a parent's statement and must always outrank an estimate* — this is the
single most load-bearing thing B3 learned, and it is what forced the lean to be
a bounded multiplier instead of a clamp. (5) *Probes into their own ring*, so
that asking her something she has not been taught cannot contaminate the record
used to decide what she is taught.

**Specific to maths — do NOT copy blindly.** (a) The whole "one pool across both
paths, share follows tick count" model exists because maths has exactly **two
peer paths**. Reading's build/find split is already governed by a fixed 3-build-
1-find mix Joe ruled in JT-010(2), so a reading ladder has a *mix constraint the
maths ladder does not have*, and a weakness lean there would collide with that
ruling the same way B3's collided with JT-010(1) — expect the same conflict and
raise it early. (b) `pagesRead` derives the current reading page by dividing
progress by the pay rate, which means **reading's difficulty and reading's
economy are coupled in a way maths's are not**; B2 already hit this. (c) The
promotion gate's constants (ewma ≥ .85, ≥ 20 attempts, ≥ 2 distinct days) are
calibrated to short maths items and should be re-derived, not inherited, for
items that take much longer.

**And one thing B3 suggests was wrong, or at least under-specified:** the spec
line *"weakness-lean between paths bounded 65/35"* was written without noticing
it contradicted a ruling Joe had already given. Run A's spec paragraphs are
dense and were written before his rulings existed. **Check each spec clause
against `joe/tasks.json` before building it** — that is the check that saved
this slice, and Joe's numbered reading rungs are explicitly a sketch ("etc
etc"), so the reading packet is survey-then-ask, not build-to-spec.

## What I learned that is not in the code

- **Joe edits `joe/tasks.json` live while you are running.** It changed under me
  **twice** in twenty minutes, unprompted, with no notification. `git status`
  showing `M joe/tasks.json` when no agent of yours should have touched it is
  the signal, and it is worth checking for. Commit his edit **alone**,
  immediately, before it collides with anything of yours.
- **A closed ruling is not always an answer to the question asked.** Joe closed
  JT-025 with a note about the reading curriculum — a *different subject*. The
  protocol says "that note is the ruling", but read the note against the
  question before acting: here the honest reading was that the shipped wording
  stands by default and the note is new work. Do not force an unrelated note
  into an answer, and do not guess the answer it did not give.
- **A subagent doing revert-testing has deliberate mutations on disk for most of
  its run.** I watched `git diff --stat` flip between `867/-16` and `868/-17`
  while the month-walk agent worked. That is exactly the window run 4 shipped a
  collapsed constant through. The hash-either-side-of-the-gates rule works, but
  the *cheaper* rule is the one that matters: **do not read, judge or gate a
  file while its agent is still running.**
- **`git checkout` is the wrong way to restore a mutation when the working tree
  already holds uncommitted work.** The month-walk agent was handed a tree that
  already carried B3's unstaged implementation; restoring by `git checkout`
  would have destroyed it. It took a byte copy first instead, and said so. If
  you brief an agent to mutate-and-restore, **tell it the tree is dirty**.
- **Minified bundles keep more than you expect.** `settledStages` and the literal
  `65/35` both survive the build, which makes them usable deploy markers. Check
  what survives by grepping your LOCAL `dist/` before you grep the live one —
  it costs one command and tells you whether a null result means "not deployed"
  or "not greppable".
- **A CI run cancelled by a later push is not a failure.** B3's own run shows
  `cancelled` because the JT-026 push superseded it two minutes later. The
  later run contains both commits, and that is the one to verify against.

## Decisions

**Picked up this run (his nod — both arrived mid-run, unprompted):**

- **JT-024 — DONE, and NOT a reversal. Nothing was reverted.** *"see answer to
  JT-025, we need the reading progression built for this."* He accepted the
  maths-only honeymoon, so **`ad848e4` stands exactly as shipped**. Committed as
  `0a67669`.
- **JT-025 — DONE, but the note answers a different question.** *"we need to
  catch up here with the reading progression curriculum. 1. adding nouns 2.
  finding word challenge with only similar words. 3. 5-letter longer non-noun
  words, etc etc."* The offer wording therefore resolves **by default** to the
  option already shipped (leave `runA.md:232` verbatim); no code moved and
  nothing was guessed about words a child hears. Committed as `5d8bbee`. **His
  note is new work and is now queue item 5.**
- No ruling is left open in the workbench except the one I raised below.

**Raised this run:**

- **JT-026** — is *"bounded 65/35"* a limit on the lean or a clamp on the share?
  Fable's option C, built on and shipped in `9138176`. The card costs the
  reversal honestly: option (a) is a clamp that **wraps** the multiplier without
  unwinding it, about an hour, and all eight dials sit in one block marked
  `>>> PROVISIONAL` at `harness.ts:199-268` in the style he asked for on JT-021.

**Nothing about animals was touched, surveyed or invented.** B3 is maths dealing
only; no species, set or reward name was generated by me or by any subagent.

## Deploy verification (run 1's method — `agent-browser` wedges on `open`)

```bash
js=$(curl -s "https://jtr31415.github.io/JunosIsland/?cb=$(date +%s)" \
     | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1)
curl -s "https://jtr31415.github.io/JunosIsland/$js" -o live.js
grep -c "settledStages" live.js   # B3's public read — 0 before, 1 after
grep -c "65/35"         live.js   # LEAN_MAX reached the bundle
```

Grep your local `dist/island/assets/index-*.js` FIRST to learn which identifiers
survive minification; a class name in the JS is not proof an animation shipped,
so anything visual must be checked in `assets/index-*.css` separately.
