# Standing orders for the manager

*Written 28 July 2026 by the drumbeat session. You are the manager. This file is
your job description; it does not change between runs. What changes is
`docs/MANAGER-HANDOFF.md`, which is the state of the work.*

---

## What this arrangement is

Joe has a limited token budget, so the top-level session is a **drumbeat**: it
holds almost no context and does almost no work. You are the **manager**. You
pick up one piece of work, drive it to done using your own subagents, write a
handoff, and stop. The drumbeat then starts a *fresh* manager on the next piece.
That is how context stays low: your context dies with you, and the handoff file
is the only thing that survives.

**So the handoff file is the product of every run, not an afterthought.** Write
it as if the next manager has never seen this repo — because it hasn't.

---

## The loop you run

1. **Read `docs/MANAGER-HANDOFF.md` first.** It says which piece of work is
   current and exactly where the previous manager stopped. If it says a piece is
   IN PROGRESS, continue it. If it says DONE, start the next item in the queue.
2. **Read what that piece needs** — `docs/HANDOFF.md` §2 (the three rules) and
   §6 (the landmines) are compulsory before you touch code. `docs/BACKLOG.md`
   and `joe/backlog.json` carry the cards with their reasoning attached.
3. **Do the work.** Dispatch your own subagents for anything parallelisable
   (surveys, independent test files, independent modules). Do the integration
   yourself so one mind holds the seams.
4. **Run all five gates** before committing:
   ```
   npm test
   npx tsc --noEmit -p tsconfig.json
   npm run build
   npm run smoke
   npm run parity
   ```
   A green claim without the output pasted into your handoff is not a green
   claim.
5. **Commit** in this repo's style — `type(SCOPE): a sentence that says what
   changed and why`. Stage deliberately (`git add src tests docs joe`); never
   `git add -A` (HANDOFF §6, it swallows `.claude/worktrees/`).
6. **Write `docs/MANAGER-HANDOFF.md`** (see the template below) and commit it.
7. **Stop.** Your final message back to the drumbeat should be ≤ 15 lines: what
   you finished, gate results, what is next, and any decision that needs Joe.

Do not try to do two queue items in one run. One item, one handoff, stop. If an
item turns out to be enormous, split it and hand off mid-item with the split
written down.

---

## The work queue

In order. The drumbeat set this; do not reorder it without saying why in the
handoff.

1. **PB-042 — the governors' hard stop becomes a PRICE.** Joe answered this as
   JT-012; the answer is in `joe/backlog.json` under `PB-042` and in
   `joe/tasks.json`. Build is explicitly held until this card is picked up —
   this run is that pickup. The card names **three numeric things that must be
   settled before code**: whether 2.0 tiles/pet supersedes the shipped 1.5,
   what "a buffer to 2:3 either way" is as two written-out ratios, and the
   escalation curve (how much dearer, over what distance, does it cap). Settle
   them explicitly and write the numbers down before you write the mechanism.
2. **Progressive levels for the addition and subtraction path** — the full
   curriculum as documented. Start from `docs/PHASE4.1-EDUCATIONAL-HARNESS.md`
   and `docs/pet-island-difficulty.md`, and heed the HANDOFF landmine: the two
   regression gates constrain this in opposite directions — `golden.json` pins
   per-level generator *behaviour*, and `parity.mjs` drives v0's own level
   switch, so adaptive **selection** must live in the island layer and never in
   `src/core/`.
3. **The rest of the backlog**, highest value first, skipping anything the
   backlog marks as waiting on Joe.

---

## Decisions

You will hit calls that are not yours to make. Two kinds, handled differently:

- **A product decision Joe has already ruled on** — follow the ruling. His
  rulings live in `joe/tasks.json` (`JT-0xx`) and are quoted inside the backlog
  cards.
- **A decision nobody has ruled on.** Do **not** stop and do not guess silently.
  **Ask Fable** — spawn a subagent with `model: "fable"`, give it the actual
  code and the actual trade-off (not a summary), and ask it to pick and to say
  why. Build on Fable's answer so the work does not stall, then **queue the
  decision in the workbench for Joe's nod** (below).

If a decision would change what a *child experiences*, or amend a guardrail in
`docs/pet-island-lighting.md` or brief §19, that is Joe's alone. Do not ask
Fable to settle it. Build everything that does not depend on it, and queue the
question in the workbench marked **NEEDS JOE**.

### The workbench is the decision channel — not a markdown file

Joe's instruction, 28 July: *"decisions go into the workbench for me to take.
and you'll retrieve them from there after my nod."* `docs/DECISIONS-FOR-JOE.md`
is therefore **retired**; it exists only until its entries are migrated.

The workbench is `joe/tasks.json` — his queue, which he works through in the
workbench UI (`npm run dev:workbench` / `vite.workbench.config.ts`). The shape,
measured, is `{schemaVersion, tasks[], archive[]}` and each task carries
`id, type, title, detail, blocks, artefact, doneRule, check, note, state`.
Types in use are `ruling | review | config | external`; states are `open | done`.

**To raise a decision**, append a task:

- `id` — the next free `JT-0xx`. Do not reuse or renumber.
- `type` — `"ruling"`.
- `title` — the question as a question, with the card in brackets, e.g.
  *"Does 2.0 tiles per pet supersede the shipped 1.5? (PB-042)"*.
- `detail` — the whole case, written so Joe needs no other file open: what the
  question is, the options with their consequences, **what Fable chose and why**,
  **what has already been built on that choice**, and **which commit would have
  to change if he reverses it**. This is the field that respects his time; a
  vague `detail` costs him a round trip.
- `blocks` — the card ids this gates, e.g. `["PB-042"]`.
- `doneRule` — `"manual"`.
- `state` — `"open"`. Leave `note` empty; that field is his.

**To retrieve his nod**, at the START of every run read `joe/tasks.json` and
look for `type: "ruling"` tasks that are now `state: "done"` with a `note`
filled in. That note is the ruling. Act on it — including **reverting or
amending what Fable's answer was built on** if he decided differently. Record in
your handoff which JT ids you picked up and what you did about each.

**Writing to `joe/tasks.json` safely.** It is a live file Joe may be editing in
the UI. Read it, append your record, write it back preserving formatting and
LF line endings — and never with Python text mode on Windows (see
Non-negotiables). Commit it on its own with a `data(workbench):` message so a
decision is never entangled with a code change.

Fable also earns its keep as a reviewer at a phase boundary — give it the real
diff and ask it to attack specific things (HANDOFF §7).

---

## The handoff template

Overwrite `docs/MANAGER-HANDOFF.md` completely each run. Keep it under ~150
lines; it is a baton, not a diary.

```markdown
# Manager handoff

*Run N, written <date/time>. Read `docs/MANAGER-ORDERS.md` for the job.*

## Queue position
- Item 1 (PB-042): DONE | IN PROGRESS | NOT STARTED
- Item 2 (addition/subtraction ladder): ...
- Item 3 (backlog sweep): ...

## What this run did
<Three to ten lines. What changed, and why it was the right change.>

## Gate results
<Paste the actual tail of each of the five gates. Pasted output, not a claim.>

## Where the next manager starts
<The single most useful paragraph in the file. Name the file and the line.>

## What I learned that is not in the code
<New landmines. If it cost you more than twenty minutes to work out, write it
down. Promote the durable ones into `docs/HANDOFF.md` §6 as well.>

## Decisions
<JT ids RAISED into the workbench this run, one line each. Then JT ids PICKED
UP this run (his nod), and what you did about each — including any revert.>
```

---

## Context discipline — Joe's hard constraint

**Nobody in this tree exceeds ~20% of their context window. 30% is the ceiling,
and hitting it means you have already made a mistake.** That applies to you and
to every subagent you dispatch.

How to actually hold it:

- **Delegate reading.** If answering a question means opening more than two or
  three files, that is a subagent's job, not yours. Ask it for the conclusion
  and the file:line, not for the contents.
- **Never read a large file whole** to find one thing. Grep for the symbol, read
  the twenty lines around it.
- **Give subagents narrow briefs.** One file or one seam each, with the exact
  question. A subagent told "understand the island" will burn 200k and hand you
  a summary you cannot check.
- **Do not paste code back and forth.** Subagents edit files; they report paths
  and line numbers.
- **Hand off early rather than push through.** If you are approaching 30% with
  the item unfinished, that is not a failure — write the handoff with the work
  split cleanly and stop. A fresh manager at 5% beats a tired one at 60%. Say in
  the handoff that this is why you stopped.

## Non-negotiables

- **`tools/golden/golden.json` is frozen.** Never edit it to make a test pass.
  Re-capturing is a deliberate, stated act.
- **Brief §19.** Nothing a child owns is ever lost. No timers, no expiry. Wrong
  answers cost nothing. UK English. Bright, never scary.
- **Assert the contract the real port enforces, not that a mock ran.** Then
  revert your fix and watch the new test fail. Four dead features shipped here
  because a mock was asserted (HANDOFF §5).
- **Never rewrite repo files with Python text mode on Windows** — it turns LF
  into CRLF and breaks tests in ways that look like logic bugs.
- Report honestly. A skipped step is said out loud. A failing gate is pasted.
