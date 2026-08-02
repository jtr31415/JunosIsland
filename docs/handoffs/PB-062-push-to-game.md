# PB-062 — sign off the name and the fact, then push it to the game

*Written 2 August 2026. Read `docs/MANAGER-ORDERS.md` for the job and
`docs/handoffs/PB-036-goldfish-crocodile.md` for the nine places a species
costs, which is the spine of everything below.*

Joe, 2 August: *"in the editor i also want to sign off on the name and the fact
line and then with one button push it to the game thats where we need to get
to."*

Two pieces, two commits. The first fills four fields the draft store has always
carried and the UI never showed. The second is the button.

---

## START HERE if you have never seen this

- The editor is `tools/workbench/public/editor/`. Open it with
  `npm run workbench` (Vite) and go to `/editor/index.html`. **Port 4173 is
  Joe's.**
- `Save` writes a draft to `joe/species-edits.json`. It always did.
- `Push it to the game` is new. It writes **six of the nine places a species
  costs** and reports the other three plus two shared counts back on the page,
  by path, with the reason each is not a machine's to write.
- **`npm test` is RED straight after a push, on purpose.** The species is in the
  game; the tests that describe it are not written. The reply says so.

---

## 1. Sign-off — `tools/workbench/public/editor/signoff.ts`

A new pure model (no three.js, no DOM), drawn by a `Name and fact` panel in the
right-hand rail. `tests/tools/species-signoff.test.ts`, 24 tests.

**Almost nothing is typed.** The roster already knows the species' printed name
(`SPECIES_NAMES`), its collection (`SPECIES_COLLECTION`) and its band, and
`naming.ts`'s `givenName` already draws the given name deterministically and
collision-free across all 320. The panel shows all of it and asks Joe for the one
thing nothing can derive: the fact.

**The fact has rules, and they are `tests/island/species-facts.test.ts` read
backwards.** Six to twenty words, one or two sentences, ends with a full stop, no
American spellings. `factProblems` is the same check at the keyboard, where it
costs a second, instead of an hour later in a gate against a file he can no
longer see. The test proves the agreement by running `factProblems` over **all
100 sentences already in `joe/species-facts.json`** and requiring it to refuse
none of them — the corpus is the assertion, so the bounds are never restated in
two places.

**There is no box for a source URL and no `verified` path.** The gate allows
`check` to be only `verified` or `flagged`, and `verified` costs more than a
link: it also demands a `sourceNote` saying what the source actually *says*. A
box that took a URL and synthesised that note would be manufacturing the one part
of the record that carries the meaning. So a fact Joe writes lands `flagged`,
with `UNSOURCED_NOTE` giving the reason, and the bench already renders flagged
rows differently. `factSource: 'joe'` marks it as his.

### THE APPROVE TICK IS NOT IN THE EDITOR, AND MUST NOT BE

There is already exactly one approval per creature and it is `approver.ts`'s:
`signoff`, with `verdict` and `factVerdict` beside it, one click writing all
three (JT-031). `merge.mjs` spells out why `verdict` and `signoff` are separate —
folding them would let a name ticked in a list count as an animal he had actually
looked at — and a second tick in the editor would recreate that confusion at a
larger size.

So the editor is the **drafting** gesture and the bench is the **gate**. What
changes is that an animal now reaches that bench COMPLETE rather than nameless
and factless: the bench's own `unsignable` count exists precisely for creatures
with no row in `joe/names-audit.json`, and the push is what stops them arriving
that way.

### The trap in the name box, and what it actually does

`tests/island/naming.test.ts` asserts, row by row, that every
`joe/names-audit.json` `name` equals `givenName(speciesId)`. And `merge.mjs`
records that the row list is **regenerated** whenever the roster moves, with only
`verdict`, `replacement` and `note` surviving.

So a name Joe types over the generated one goes to **`replacement`**, never to
`name`. Parked in `name` it would fail the gate that day and be silently erased
the next time the audit file was regenerated. (This was written the wrong way
round first; the test agent caught it before it shipped.)

**And an override does not rename the animal in the game.** The game reads
`NAME_PINS`, which `naming.ts` keeps deliberately empty until Juno's save
arrives, with a test standing over it. The panel says this out loud rather than
claiming "it would be called X" when the game will say Y.

---

## 2. The push — `tools/workbench/push.mjs`, `POST /api/species/push`

### What the button writes — SIX of the nine

| # | place | |
|---|---|---|
| 1 | `src/island/species/parts/assembled/animal-<id>.ts` | the definition, straight out of `defToModuleSource` |
| 2 | `src/island/species/parts/assembled/index.ts` | one export line, appended above the sentinel |
| 3 | `src/island/species/collections/<c>.ts` | the `defineSpecies(id, 'bespoke')` record, in ROSTER order |
| 4 | `src/island/species/collections/<c>.ts` | `import '../parts/assembled'` — the ninth place |
| 8 | `joe/names-audit.json` | one row, every field derived |
| 9 | `joe/species-facts.json` | one fact, plus `coveredCollections` if the collection was not claimed |

### What it does NOT write — THREE, plus the two shared counts

| # | place | why not |
|---|---|---|
| 5 | `tests/island/species-<c>.test.ts` | a rework. The deferred-list test has to be *inverted* by somebody who can say what it now means. |
| 6 | `tests/island/assembly-<id>.test.ts` | the things only this animal can say. `npm run pets:creature -- animal-<id>` prints every measured number; the invariants around them are a human's. |
| 7 | `tests/island/assembly-fingerprint.test.ts` | the pin. It must be READ off the built model. A fingerprint this code generated would only ever agree with this code. |
| + | `tests/island/naming.test.ts`, `tests/island/species-registry.test.ts` | the two shared counts. **Both carry numbers in `it()` titles as well as in the assertions** — a search-and-replace on the expectation leaves the title lying, and line 84 of the registry test is lying already. |

**The button was not made to do all nine and it was not made to pretend.** A
generated test that asserts whatever the code currently does is worth less than
no test at all, so items 5, 6 and 7 are reported as *not a machine's to write*
rather than as *not implemented yet*.

### How it tells Joe the difference

The reply is three lists and one sentence, and all four are drawn every time —
including on a completely clean push, because "what is left" is the half a green
tick would otherwise hide:

- **written —** one line per place, path and what landed;
- **already there —** what was skipped, and why (a re-run after a half-landed
  push finishes the job rather than refusing it);
- **yours —** the three tests and the two counts, in `--warn`, with the reason;
- and the sentence: *"N of the nine places written … `npm test` is RED until
  those are written, and that is on purpose."*

### What refuses, and where each refusal lives

**The page owns the RULES; the server owns the FILESYSTEM.** That split is not a
compromise, it is the only honest one available: `creatureSpec` decides whether a
definition is a legal animal, and it is TypeScript that the plain-`.mjs`
workbench server cannot import (`server.mjs` runs under bare node; only
`pets:creature` has the `--experimental-strip-types` shim). Under
`npm run workbench` the page is served by Vite, which is the one place that both
holds the definition Joe just edited and can execute the rules against it.

- **Page** (`editor/push.ts`): runs `creatureSpec(speciesId, def)` before a byte
  is sent, and lets its refusal through **unwrapped** — it names the axiom, the
  offending value and the fix, which is more use than anything a wrapper could
  say. Also refuses on `view.ready`, which covers an id not in the roster, a
  collection that does not resolve, an empty name and a bad fact.
- **Server** (`push.mjs`): the id must be shaped like `animal-corn-snake`; the
  collection file must exist; the export name must end `_ASSEMBLY`; the module
  text must contain `defineCreature('<that id>'` and export that name; the record
  must name that id; the files must be LF.
- **And the one that matters: it will not write over an existing species file.**
  No force flag, deliberately. The live twenty-four are frozen and the Garden
  fourteen are Joe's approved work; clobbering `animal-hedgehog.ts` because an id
  collided is unrecoverable in a way a draft is not.

**Every path is derived from `speciesId` and `collection`. Not one comes from the
payload**, so a caller cannot name a file at all — and every write still goes
through `repo.mjs`'s `inside()` jail, unwidened.

### Three things that will bite the next person

1. **`joe/species-facts.json` is still not writable through `/api/save`, and that
   test still passes verbatim.** JT-031 gave that file one author and `api.mjs`
   keeps it out of `WRITABLE`. The push is not `/api/save`; it **appends** a row
   that did not exist and leaves an existing one exactly as its author wrote it.
   What was being protected — that the two sides can never overwrite each other —
   is preserved literally. This was the sharpest judgement call in the run.
   *It could not simply be skipped:* `species-facts.test.ts` requires every
   shipped species in a covered collection to have a fact, so a push that wrote
   nothing there would turn the gate red by itself.
2. **The record goes in above the next member's COMMENT BLOCK, not above its
   `defineSpecies(` line.** `edc6e48` had to go back and fix exactly this by
   hand: a fifteen-line explanation of a terrapin ended up introducing a corn
   snake. `recordStart` in `push.mjs` is that fix, and the push test asserts it.
3. **Order is a safety property.** The species FILE is always written before the
   export LINE that names it. `parts/assembled/index.ts` line 28 is the incident
   that bought this rule — thirteen export lines for five files that did not
   exist, the module graph failed, and Joe's live viewer went blank. The whole
   plan is therefore built in memory first, so a refusal at the last step leaves
   the tree exactly as it was.

Small, known, and not worth fixing: writing `joe/species-facts.json` reformats
its one inline array (`coveredCollections`) onto separate lines, because
`repo.mjs`'s `writeJson` is `JSON.stringify(v, null, 2)` for every `joe/` file.
One-off churn on the first push, then stable.

---

## Gates, on the final tree

```
$ npm test
 Test Files  135 passed (135)
      Tests  3030 passed (3030)

$ npx tsc --noEmit -p tsconfig.json
TSC exit 0

$ npm run build
precache  50 entries (1833.25 KiB)
files generated  ../../dist/island/sw.js

$ npm run smoke
all boot checks passed

$ npm run parity
every step renders identically

$ npm run channel
src/ → workbench  no references, as it must be
channel check passed
```

**The baseline quoted to me was wrong and I could not reproduce it.** The brief
said 148 files / 3290 tests on `main`; this tree has 135 test files on disk
(`find tests -name '*.test.ts' | wc -l`) and ran 3003 before this work and 3030
after (+24 sign-off, +20 push, minus the arithmetic of a run I did not
double-count). Whoever writes the next brief should re-measure rather than copy
that number forward.

**The coast flake is real and it has two friends.** Under CPU contention —
specifically, another agent running vitest at the same time — `coast.test.ts >
never walls her island in` timed out at 62s, and so did
`facedecals.test.ts > nothing in the pack samples the reserved columns today`
and `sealing.test.ts > a search over every ring configuration finds no
radius-sensitive tap`. All three passed in 18.9s when re-run together on an idle
machine. Do not widen any of their budgets; do not run two vitest processes at
once.

## Three things found on the way that are NOT fixed here

1. **`tests/island/species-registry.test.ts:84`'s `it()` title says 222 while
   the test asserts 220.** Already lying before this run. Both that file and
   `naming.test.ts` carry counts in titles as well as assertions, which is why
   the push refuses to touch either.
2. **`src/island/species/parts/assembled/index.ts`'s header is stale** — it says
   a species module is defined through `defineAssembly('animal-<name>', {...})`,
   while every real module and `push.mjs`'s own guard use `defineCreature`.
3. **Writing `joe/species-facts.json` reflows `coveredCollections`** from one
   inline array onto separate lines, because `repo.mjs`'s `writeJson` is
   `JSON.stringify(v, null, 2)` for every `joe/` file. One-off churn on the first
   push; harmless, and not worth a special-case serialiser.

## Where the next person starts

`joe/backlog.json` **has no PB-062 card** — `nextId` is 61 and the highest card
is PB-060. The card text is in the run report; this manager does not edit that
file.

The obvious next move is to take one species through the whole loop for real:
draw it in the editor, settle its name and fact, push it, then write places 5, 6
and 7 by hand and watch the suite go from red to green. Until somebody does that
end to end, the button is proven by tests and not by use.
