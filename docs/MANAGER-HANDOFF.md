# Manager handoff

*Run 7, written 29 July 2026. Read `docs/MANAGER-ORDERS.md` for the job — Joe
amended it MID-RUN (`8189a5e`), so read it fresh rather than trusting run 6.*

## Queue position

- Item 1 (PB-042): **DONE** (run 4).
- Item 2 (PB-030, the addition/subtraction ladder): **DONE** (run 6). Run B complete.
- Item 3 (**hold the work, reconcile the backlog**): **DONE — this run.**
- Item 4 (**PB-036, themed animal collections**): **NOT STARTED — yours, and it
  is now UNBLOCKED.** Joe's brief landed mid-run.
- Item 5 (the reading progression curriculum): NOT STARTED. Now carded as `PB-043`.

## What this run did

No source was touched. Two commits, deliberately separate: `1339916`
`data(backlog):` and `b74a5b6` `docs(backlog):`.

**`joe/backlog.json`** — eleven cards were describing work that is already live.
`PB-030` was `planned` with all eight of its behaviours shipped, and its detail
never named the honeymoon economy that B2 built. `PB-042`'s `progress` still said
the escalating price "IS NOT BUILT YET" three runs after it shipped, and still
cited a `balance.json` `tilesPerPet` field that no longer exists. `PB-039`,
`PB-011`, `PB-002` closed. `PB-001` and `PB-040` narrowed rather than closed.
Three cards created for shipped work that had **never had a card** (`PB-044` the
placement backstop, `PB-045` change-your-mind, `PB-046` the break suggestion) —
they lived in `docs/BACKLOG.md` alone. `PB-043` created for Joe's reading
curriculum, rescued from the JT-025 note it would have died inside. `nextId`
43 → 47. Card count 42 → 46. **Where a card was superseded the reasoning stays
and the supersession is stated** — nothing was silently deleted.

**`docs/BACKLOG.md`** — it had zero hits for `PB-0`, `Run B`, `PB-030`, `PB-042`
and `JT-0`, and contradicted the JSON on `#44`. It is now explicitly the **prose
annex**, with `joe/backlog.json` declared authoritative for state, every heading
stamped with its PB id, and seven dated status notes added over the original
cases rather than replacing them.

## Gate results

Docs and data only; `git diff --stat src v0 tools/golden/golden.json tests` is
empty, both files verified LF.

```
$ npx vitest run
 Test Files  74 passed (74)
      Tests  1509 passed (1509)        (unchanged from run 6 — nothing was code)
   Duration  35.52s
$ npx tsc --noEmit -p tsconfig.json
TSC OK exit=0
$ npm run build
PWA v1.3.0 · mode generateSW · precache 8 entries (773.59 KiB)
$ npm run smoke
ok  builds the ambience layer / battery is retired / reading mode is active
ok  score bar initialised
all boot checks passed
$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically
```

No deploy this run — nothing shipped to deploy.

## Where the next manager starts

**Item 4, PB-036, and the blocker run 6 warned you about is GONE.** Joe committed
`8189a5e` at 10:50 while I was mid-reconciliation: his roster landed as
**`docs/pet-island-species-roster.md`** (142 lines, ratified, not a draft) and
`docs/MANAGER-ORDERS.md` item 4 was rewritten around it. **Read the roster in
full and build to it, not to a summary — including not to my `PB-036` card.**

The one thing to get right first, ahead of any species work, is the naming
migration, because it is a **brief §19 trap**. Roster §3 makes given names
deterministic, seeded from `species + set`. Today `petName(defaultRng)` at
`src/island/main.ts:1167` draws from unseeded `Math.random` (`src/core/rng.ts:5`),
the name is **persisted** into the save (`flow.ts:311-312`, `save.ts:171`/`226`),
**and the pet's `id` embeds it** (`'pet' + n + '-' + name`). So Juno already owns
randomly-named pets and a naive switch renames them. Existing pets keep their
names; determinism applies to new hatches only. Write that test first.

Architecture is **kits before species** (six kits, then a species is data), the
**live 24 are frozen**, and collections ship **one at a time** on the 85% unlock
cadence — the ~296 builds are not a build order. Roster §6 holds Joe's own open
questions (ship order, whether Prehistoric ships, IUCN wording): **those are his,
raise them in the workbench, do not settle them with Fable.**

## What I learned that is not in the code

- **The `gitStatus` block in the session prompt can be flatly wrong.** Mine
  listed five recent commits, none of which were on `main`. My own `git log`
  disagreed from the first command. **Trust the live command, never the
  snapshot** — and the shas in that block did all resolve, so `git cat-file -t`
  is not enough to catch it.
- **HEAD moves under you, not just `joe/tasks.json`.** Run 6 warned that Joe
  edits the workbench live; he also *commits* live. `8189a5e` landed mid-run and
  changed my own orders. Re-check `git log -1` before you commit, and re-read
  `MANAGER-ORDERS.md` if it moved. The cheap tell is that `git rev-parse HEAD`
  differs from what you saw at start-up.
- **A file can be cited as landed and still be untracked.** The roster was
  `?? docs/pet-island-species-roster.md` while the orders described it as the
  spec. One `git status --porcelain` caught it; it is committed now. **When a doc
  tells you a file has arrived, check it is in git.**
- **`joe/backlog.json` has two conventions for delivery and they mean different
  things.** `PB-033` uses `state: "done"` with a `"BUILT <date>"` prefix in the
  detail; `PB-042` uses a separate `progress` field and keeps `state`. The
  `progress` field is the one that rots, because nobody re-reads it. I used the
  `BUILT` convention for closures and only edited `progress` where it existed.
- **Edit JSON with the Edit tool or Node, never in bulk.** Both files are LF and
  `file` confirmed they stayed LF; the memory note about Python text mode on
  Windows applies to Node's `writeFileSync` too if you ever normalise strings.

## Decisions

**Picked up this run (his nod):** none. **`JT-026` is still `open`** — I checked
`joe/tasks.json` first thing and no `type: "ruling"` task has gained a note since
run 6. **So nothing was reverted, and B3's lean stands exactly as shipped.** The
reversal remains costed at about an hour in `PB-030`'s card, with all eight dials
in one `>>> PROVISIONAL` block at `harness.ts:199-268`.

**Raised this run:** none. Reconciliation surfaced no question that needed Joe —
every correction was a fact the repo already settled.

**Still open in the workbench and worth knowing:** `JT-001`, `JT-004`, `JT-005`
(reviews, and `JT-004`/`JT-005` are the pattern to copy for PB-036's audit
surface), `JT-006`, `JT-007`, `JT-023`, `JT-026`.

**Two things I decided rather than asked**, both recorded in the commits: that
`PB-002` closes by delivery even though Joe never ruled on it (the card says so
explicitly), and that `docs/BACKLOG.md` becomes a prose annex rather than being
rewritten as a second full backlog — which preserves Joe's and Fable's reasoning
instead of duplicating 46 cards in prose. Reverse either freely; both are docs.

**Nothing about animals was invented.** No species, collection or name was
generated by me or by any subagent; `PB-036` cites only Joe's roster and measured
facts about the existing 24 species and 25 sets.
