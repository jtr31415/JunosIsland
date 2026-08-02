# PB-062 — a save overwrites, and the Animal list says what still needs doing

*Written 2 August 2026. Read `docs/MANAGER-ORDERS.md` for the job and
`docs/handoffs/PB-062-push-to-game.md` for the button this list feeds.*

Joe, 2 August: *"when i save an animal in the editor, it needs to just overwrite
what there is already and i need to see and filter by status, so i can tell from
the list what still needs doing. no saving of drafts in the bottom of the list"*
— and a minute later: *"also group them by collection, so i can prioritize."*

Four requests, one change. The Animal list is now the animals: one row each,
under a header per collection in ship order, every row carrying a derived status,
with a filter that narrows to one of them.

---

## START HERE if you have never seen this

- The editor is `tools/workbench/public/editor/`. `npm run workbench` serves it
  at `/editor/index.html`. **Port 4173 is Joe's** — this run used `--port 4188`.
- The list, the statuses and every count are `editor/status.ts`, a pure module
  with no DOM and no three.js. `main.ts` paints what it returns and decides
  nothing.
- `joe/species-edits.json` is now keyed by `speciesId`. There is no `SD-nnn` and
  no counter. `merge.mjs`'s `migrate` folds old files forward on read.
- **`signedOff()` in `status.ts` is the one call that answers "may this creature
  reach the game".** Read that file's header before touching it.

---

## 1. A save OVERWRITES — the record is keyed by the animal

`MERGEABLE.edits` in `tools/workbench/merge.mjs` was `key: 'id'` with a
`counter: { field: 'nextId', prefix: 'SD-', pad: 3 }`. Every Save dealt a fresh
id, so saving the squirrel twice left two records and the list grew a
`draft:SD-002` row underneath the animals each time.

It is now `key: 'speciesId'`, with no counter and no `id` field at all.
`speciesId` left `owns`, because a record's key is not a field the page edits.

### The id race is GONE, not moved — and here is the argument

The counter existed because ids were **dealt** from a pool, and the page once
dealt itself a stale one and cost a card twice (`needsAnId`'s whole docblock is
that autopsy). A `speciesId` is not dealt, it is **derived** — from the species,
which is the thing itself. There is no pool, so there is nothing for two writers
to take the same number out of, and `needsAnId` returns false immediately without
a counter. That is precisely the `names` and `primitives` case two specs up in
the same file, neither of which has ever needed one.

What is *left* is a plain content collision — Joe and an agent editing the same
animal's `def` at the same moment — and that was never the counter's problem. It
is `fold`'s, it always was, and a `json` disagreement still throws `Conflict` and
answers 409 rather than guessing. Nothing about that changed. The KEEP rule is
unchanged and still tested: a record appended to the file after the page loaded
survives a save that has never heard of it.

**One thing that DID move**, and it is worth knowing: `api.mjs` reported
`patched: body.patch.id`, hard-coded to `.id`. That answered `undefined` after
the re-key, so it now reads `body.patch[keyOf(body.what)]` off the spec.

---

## 2. What happened to the three records — nothing was lost, and nothing was staged

`joe/species-edits.json` **in git is empty and always has been**. The three
legacy records live in Joe's *uncommitted working copy* in the shared checkout:
`SD-001` `animal-squirrel`, `SD-002` `animal-goldfish`, `SD-003`
`animal-fennec-fox` — and `SD-003` carries the given name **Neegab** and the
collection `night-time`.

So they were migrated **in code, not in data**:

- `foldOntoSpecies` in `merge.mjs` folds a legacy file forward. It drops each
  record's `id`, keys by `speciesId`, and deletes the envelope's dead `nextId`.
- `migrate('edits', …)` runs in `api.mjs` on **both** reads — `/api/state`, so
  the page shows the right thing immediately, and the disk copy inside
  `/api/save`, so the file is healed and written back the next time he saves.
  `nextFree` already worked this way for the counter, for the same reason: a
  migration nobody has to remember to run is the only kind that gets run.
- It is idempotent, and a file already in the new shape comes back as the *same
  object*, asserted by identity.

**Two records for the same animal fold field by field, never record-wins-record.**
Later wins on a field it has an opinion about; a later record saying nothing
(`''`, `[]`, `{}`, absent) never blanks what an earlier one said. That rule is
there for exactly one reason: a name Joe typed once and never retyped. A record
with no `speciesId` at all is passed through untouched, id and all — the page
cannot produce one, and tidying it away would be the very subtraction this
function exists to prevent.

**Verified against his real bytes.** His file was copied into this worktree, the
workbench served on 4188, and the page read: three records, species-keyed, no
`id` on any of them, **Neegab intact with `night-time`**, each animal appearing
exactly once in the list. The copy was then removed; `joe/` is untouched by this
branch.

### Why the committed file was left alone — a decision, not an omission

`joe/species-edits.json` still carries a dead `nextId: 1` in git. Committing its
removal would have staged a change to a file Joe has **uncommitted work in right
now**, and merging this branch would then have refused with "your local changes
would be overwritten". A one-line tidy is not worth putting his three records in
the path of a merge conflict. It disappears the first time he presses Save.

`seed.mjs` no longer writes `nextId` for a fresh checkout.

**The `SD-nnn` ids themselves are dropped, not parked in a `legacyId`.** Nothing
outside that file has ever held one — checked across the code, `docs/`, and every
commit message including `git log --grep=SD-0`. `merge.mjs` used to claim a draft
"is referred to by that id forever"; the repo never bore that out. The mapping is
in the commit that made the change, which is the only reader it will ever have.

---

## 3. The status set — four, derived, never stored

In `status.ts`. Each answers "what do I do next" with a *different* answer, which
is the test a fifth would have to pass:

| status | label he reads | what it means | what he does |
|---|---|---|---|
| `untouched` | not started | no record saved for it | open it and draw |
| `started` | in progress | saved, but something still blocks a push | finish the Name and fact panel |
| `ready` | ready to sign off | name and fact settled, nothing blocking | take it to the bench |
| `signed` | signed off | **his tick is on it** | nothing. This is the only one that is done |

**Nothing is stored.** A `status` field on a draft would be a second opinion
about facts that already have an owner — whether a fact passes belongs to
`signoff.ts`, whether a creature is ticked belongs to `joe/names-audit.json` — and
a copy of either is right on the day it is written and wrong the first time
anything else moves, with nothing to say which is the truth. HANDOFF §6 records
the same class in `flow.tileOffer`, restating `tileTypeFor`'s conditions behind
"a promise a comment cannot keep". So every status is computed on every draw.

`started` is in practice "no fact yet": `save()` records the **resolved** name
whether or not Joe typed one, so the name half is rarely what blocks.

**`signed` outranks everything, including having no draft at all.** A creature
can be ticked on the bench without ever being opened here, and a list that then
called it "not started" would be telling him to redo finished work.

### There is deliberately no fifth status for "not in the roster"

A species the ratified roster has never heard of can never be `ready` —
`signoffView` blocks it and says why. It gets no status of its own: a status says
how far along an animal is, being off the roster says which *shelf* it is on, and
that is what the "Not in the roster" group is for. Folded together, filtering to
`in progress` would hide an animal that genuinely is in progress.

---

## 4. WHERE A GATE READS "SIGNED OFF"

> **`signedOff(audit, speciesId)` — `tools/workbench/public/editor/status.ts`.**
> One call. It is the only place in the workbench that decides this.

Joe ruled on 2 August that **only animals he has signed off reach the game, local
or live**, retroactively — so all thirty that exist today are unsigned, and a
test in `tests/tools/editor-status.test.ts` asserts exactly that against the real
`joe/names-audit.json`. It is worded to go red *as news* the day he ticks his
first animal, which is the signal the gate-builder wants.

**The underlying truth, for a gate that cannot import this file:**

```
joe/names-audit.json  →  the row whose  speciesId  is the species
                      →  field  signoff  ===  'ok'
```

That field is `approver.ts`'s and only `approver.ts` writes it — one creature,
one judgement, over the model, the name and the fact together (JT-031). A gate in
`tools/` should import `signedOff` (`species-signoff.test.ts` is the precedent
for importing editor modules under node). A gate in `src/` **may not** —
`npm run channel` forbids `src/ → workbench` — and must read that field, by that
name, itself.

`signedOff` matches on `speciesId`, not on the row id. Row ids are
`natural/<speciesId>` today, but the set is a *name* set and one creature may one
day carry a name per colour set, while the tick is on the creature. Asking "is
there a row for this animal that he has ticked" survives a second set arriving.

### "Signed off" and "approved" are the SAME thing. "Ready" is not

Say it plainly, because the next reader will assume otherwise:

- **`signoff: 'ok'` IS the approval.** There is one, it is on the Animals bench,
  and `approver.ts` is the only thing that writes it.
- **This editor still has no tick and must not grow one** (`signoff.ts`, JT-031).
  The furthest it can move an animal is `ready`.
- **`ready` is the state immediately BEFORE approval and must never be mistaken
  for it.** A gate that shipped everything `ready` would ship animals Joe has
  never looked at whole. `ready` means "the push will not refuse"; `signed` means
  "he said yes".

---

## 5. The from-scratch case — the awkward one, and why it is not a case

The objection: a brand-new animal has no `speciesId` until it is named, so it
cannot be keyed by one, so it must go on being keyed by something dealt — and the
pile at the bottom of the list comes back wearing a hat.

**That state does not exist in this page, and `#new-animal` is why.** It demands
the species name FIRST and derives the id before anything is drawn: "Fen Hare"
becomes `animal-fen-hare` at the moment he presses the button, and `show()` sets
`speciesId` before there is a definition on screen at all. There is no path to a
`def` without one — `save()` returns early on `!def`, and `def` is only ever set
through `show()`. A scratch animal is keyed exactly as a shipped one is, from the
instant it exists, and saving it twice overwrites.

The alternative — let an animal be started unnamed under a temporary key — was
rejected. A temporary key is a dealt key wearing a hat: it brings back the
counter and the race, and it would put half-drawn nameless things in the list,
which is the pile he asked to be rid of.

**The cost, said out loud: renaming a scratch animal makes a second record.**
Type "Fen Hare", save, then type "Fen Hair", and there are two animals — because
to this page they *are* two, `animal-fen-hare` and `animal-fen-hair`. Both appear
as one row each under "Not in the roster", visible and deletable by hand, rather
than a silent rename that would have to guess which of the two he meant. It is
the same trade every shipped id already makes.

---

## 6. Grouping — collections, ship order, and no empty headers

`<optgroup>` per collection, ordered by `ship`, which is the order Juno meets
them and the only non-arbitrary order this repo has. Note `ship` is marked
PROVISIONAL in `types.ts` and nothing unlocks off it; it is used here purely as
an ORDER, which is all it claims to be, and if Joe reorders the queue the list
follows for free. `COLLECTIONS` is declared in the brief's table order and says
so, so it is sorted rather than read as-is — Home Pets is declared eighth and
ships second, which the test pins.

**The counts are in the header** for the reason `groupShapes` puts one there: he
is scanning, and knowing the size of a drawer before opening it is the difference
between reading the list and hunting through it. The second number is the one he
actually asked for — `Garden (14) — 14 to do`, or `— all signed off` when a
collection is finished.

**An empty group never appears**, filtered or not. `library.ts` already settled
that: a header over nothing is a scroll stop that teaches Joe the library has a
drawer he cannot open. It is live rather than hypothetical — Birds, Ocean, Farm
and Critters have no built species today and simply do not render.

**Grouping and filtering compose.** Filtering narrows the rows; the headers
survive over whatever is left, with counts over the *filtered* view (a header
claiming the whole collection's totals would be describing a list that is not on
screen); a group whose every row went disappears. Filter options carry counts of
their own — `in progress (3)` — so the question is answered before the list is
opened.

**A filter narrows the list; it never closes the animal.** When the open animal's
status moves it out of view, the picker shows nothing selected and the note says
*"squirrel is open but this filter hides it"*. Losing an hour's work because a
save changed a status is not a trade worth making.

---

## Gates

Baseline on local `main`: tsc 0, 152 files / 3373 tests. This adds one test file
(`editor-status.test.ts`, 36) and seven to `species-edits.test.ts`.

```
$ npm test
 Test Files  153 passed (153)
      Tests  3416 passed (3416)

$ npx tsc --noEmit -p tsconfig.json
TSC exit 0

$ npm run build
precache  50 entries (1856.73 KiB)
files generated  ../../dist/island/sw.js

$ npm run smoke
all boot checks passed

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically

$ npm run channel
Joe's workbench      absent from production, as it must be
channel check passed
```

No flake seen this run; `coast`, `sealing` and `facedecals` all passed first
time on an otherwise idle machine.

**Also verified in the real page**, because none of the above drives the DOM:
workbench on `--port 4188`, thirty animals in four ship-ordered groups with no
empty headers; two saves of the squirrel left exactly one record with no `id`;
the filter narrowed to `ready to sign off` leaving `Garden (1) — 1 to do`; and
filtering to `signed off` returned nothing and said why. No console errors.

---

## Where the next person starts

**Build the gate.** `signedOff` is waiting and it currently answers `false` for
all thirty, which is the ruling working as intended. Decide first whether the
gate lives in `src/` or in `tools/`, because that decides whether it can import
`status.ts` at all (§4).

## Three things found on the way that are NOT fixed here

1. **`mergeWhole` and unkeyed records.** `foldOntoSpecies` deliberately preserves
   a record with no `speciesId`; `mergeWhole` then keys it as `undefined`, so two
   of them would collide on that one key. Unreachable from the page — insurance
   meeting insurance — but if it ever needs to be airtight, `mergeWhole` should
   pass keyless records straight through the way the fold does.
2. **`statusOf('', draft, [])` returns `'started'`.** A draft saved with an empty
   `speciesId` would show as an in-progress row with an empty name.
   `signedOff` guards `''` explicitly; `statusOf` does not. Not reachable today.
3. **`pushRequest` lost its `draftId` parameter** and `recordFor` with it. The
   record used to read "pushed from the species editor as SD-003"; with the key
   being the species, it would have read "as animal-fennec-fox" two lines above
   the id itself. No test held the old text.
