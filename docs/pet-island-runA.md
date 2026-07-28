# Pet Island — The Build Cannon: Run A (+ context for B–D)

**Supersedes `pet-island-phase4-1-spec.md` in full** (rulings changed in
conversation: no aliens, tickbox stages, universal offer line, lessons,
tens box). This file is the standing instrument: Run A is specced to
build; B–D are context so Run A's architecture doesn't paint into
corners; the ledger at the bottom is updated on every field report.

Survey constraints stand: harness = thin policy layer in the island;
`core/` untouched; golden.json never edited; new tiers only appended;
word arrays frozen, order sacred. All existing gates stay green.
Committed-token law on any new ceremony or once-flag.

**Doctrine update (27 Jul, ratified by Joe):** v0 (`junos-words.html`)
is **no longer concept-canon** — "the HTML wins disputes" is retired;
these conversation-derived specs are the sole authority on learning
behaviour, and they already consciously overrule v0 (aliens retired,
ladder reordered, mixed operations, the attempt model). The freeze in
the paragraph above is **engineering regression discipline, not
concept authority**: existing generator tiers stay bit-identical so
the goldens keep their teeth, and every designed change is reachable
by appending. Parity stays while it costs nothing; it may be retired
by a future ruling if it ever blocks legitimate work.

---

# RUN A — Measure + Manual Dial + Workbench (~8h autonomous)

Goal for the morning after: honest measurement flowing, Joe hand-ticking
taking-away for Juno, and Joe's workbench managing his queue and baking
narration straight into the repo.

## A1. Prerequisite fixes
- **Find-page scoring**: a page completes when ALL targets are found
  (v0's own semantics), not on the first. Per-target events logged
  (A2). Regression test named for the survey card.
- **Dead voice channel**: `targetCard` fallback visibility repaired so
  voiceless devices SHOW the target; the mash-guard toast visibility
  fixed in the same pass. Acceptance: with `speechSynthesis` stubbed
  absent, target text visible, rescue toast renders.

## A2. The attempt model
- One attempt per TARGET: find = each target word, correct iff its
  first tap is right · build = one per word, correct iff completed
  with zero wrong tile taps · sum = one, correct iff first pad tap is
  right.
- **Help is free but uncounted**: any attempt where dot-hints were
  opened or Fred-talk invoked is correct-if-completed, pays normally,
  and is excluded from every estimate. Attempts during a rescue
  context likewise excluded.
- Latency captured per attempt (question-shown → first tap), stored
  raw; correct-only medians are computed by the report, never the mean
  (butterfly-gap immunity). Per-session accuracy snippets kept for the
  last 6 sessions per stage (consistency raw material).

## A3. The harness (single choke point, `src/island/harness.ts`)
```ts
levelFor(path): StageSet          // consults tickboxes + mode
recordAttempt(evt: AttemptEvent)  // updates stage stats
noteRescue(path)                  // transient, in-session only
// Declared for Run B, inert in Run A (tests assert inertness):
probeWanted(path), offerDue(path), noteOffer(path, accepted)
```
All three deal paths take content selection from `levelFor` and route
every outcome through `recordAttempt`. No renderer computes policy.
Selection draws uniformly across ticked stages in Run A (weighting,
leans and whispers are Run B policy).

## A4. Tickboxes (the capability model)
- Paths: `sums`, `takingAway`, `reading`, `building`, plus **reserved,
  greyed, empty**: `storySums`, `fractions`, `multiplication`,
  `division` ("coming later" in the panel; slots only).
- Run A stages = built generators only: sums [1 to-ten, 2 to-twenty
  bridging] · takingAway [1, 2, 3 as v0] · reading [1] · building [1].
  The v0 alien level exists but is never listed or dealt (ruling: no
  aliens; the generator stays golden-pinned and dormant).
- Auto only ever ticks (Run B); Manual may tick or untick any built
  stage; Hold pins. Mode per path. Untick is a parent's hand, not a
  demotion — no child-facing anything.
- **Story-sums slot doctrine** (for B/C architects): story sums are a
  presentation path OVER the arithmetic — their numbers always draw
  from currently ticked sums/takingAway stages; text always shown with
  speech; help step one reveals the translated equation, after which
  the pure-maths help ladder applies; post-reveal answers feed neither
  estimate.

## A5. Persistence — schema v3
`attainment: { [path]: { mode, stages: { [stageId]: { ticked, attempts,
ewma (α .15), latencies (ring 30), sessions (last 6 {date, correct,
total}), rescues (ring 10 timestamps) } } } }` + reserved
`onceFlags` space (INTRO-TEN arrives Run C). Migration v2→v3: existing
saves get sums 1 ticked, everything else honest zeroes. Fixtures both
directions. The tick action persists via Committed token before any
announcement plays.

## A6. Grown-ups panel
- Per path: mode switch, tickbox list (built stages interactive;
  reserved paths greyed), and the report per stage: **accuracy /
  speed / consistency** as filled-dot tiers with soft words
  (settling · steady · solid), computed as: accuracy = EWMA (< .70 /
  .70–.85 / ≥ .85); speed = recent correct-median vs the stage's own
  early-attempt baseline (settling until trend flattens ≥ 15% below
  baseline... thresholds in balance, tunable); consistency = last 3
  sessions each ≥ .75 AND no rescue in them AND ≥ 2 distinct days.
- **Small-sample honesty**: dashes until ≥ 15 attempts (accuracy),
  ≥ 10 correct (speed), ≥ 3 sessions (consistency).
- "What Auto would do" line per path — in Run A it reads "watching"
  (the gate logic ships in B; the line's plumbing ships now).
- Attempt counts, last-active date. No colours-as-verdict, no
  child-visible anything, strictly local.

## A7. Economy re-base (invisible)
Units ×2: tile `{base 2, cap 32, tau 6}`, egg `{base 2, cap 28, tau
5}`; every item pays 2. A scripted month-walk asserts sums-per-tile
and pages-per-egg identical to pre-Run-A values at every n. (Pay 3
for probes/honeymoon is Run B.)

## A8. Joe's Workbench (`npm run workbench`)
A local single-page tool served by a tiny node server (static page +
JSON API) so it reads and writes REPO FILES directly — no uploads, no
copy-paste. Dev-only; never bundled; `npm run channel` extended to
prove it unreachable from any shipped bundle. **The lightweight law:
this is a utility, not a software project** — plain HTML + small
TS/JS, no framework, no styling ambitions, one round-trip smoke test
and nothing more; if it grows past ~1,500 lines total it is
over-built and the excess comes out.

- **Task queue**: renders `joe/tasks.json` (seeded below) — status,
  notes, done-toggles; CC and Joe both edit it; the ledger below
  mirrors it at each respec.
- **Lesson editor**: loads `joe/lessons/<id>.md`, one file per
  lesson, **seeded at build time from Appendix L below** (statuses
  start at `draft` — they are proposals awaiting Joe's red pen);
  inline editing of script + beats + exemplar, status draft → vetted. **Export**: one click emits
  `docs/fred-lessons-plan.md` with context brackets per lesson —
  `<lesson id="..." exemplar="..." file="...">script…</lesson>` — the
  exact input the bake and the Run C lesson player consume.
- **The Product Backlog (PB) lives here.** `joe/backlog.json`: cards
  with running IDs (`PB-001`, `PB-002`… monotonic, never reused, so a
  reference stays valid forever), title, detail, state (open / planned
  / in-run / done / parked), optional run assignment. Joe adds cards
  in the workbench; specs, reports and tasks cite cards by ID; run
  planning reads this file. **Seed**: CC populates it from every open
  card in STATUS/handovers plus this document's deferred lists,
  deduped against what actually shipped, and presents the seeded list
  in the first report for Joe's triage.
- **Asset viewer** (`assetViewer` flag, dev-channel, Pet-o-matic's
  sibling — reuses the game's own loaders and registries so every ID
  is canonical by construction): three galleries — **species** (all
  24, turntables), **tiles** (both types, every coast variant, the
  plot increments), **props** (every FEATURES/COVER entry from both
  packs) — each labelled with the exact ID the code uses, searchable,
  orbitable. A comment box per asset POSTs to the workbench API →
  `joe/asset-notes.json` keyed by canonical ID; the workbench lists
  all notes; PB cards and tasks may cite asset IDs. Acceptance: Joe
  orbits a prop, reads its ID, writes "this one clips into rocks",
  and CC finds it keyed correctly in the notes file.
- **Bake console**: lists every narration item the game needs
  (lessons now; corpus rows as they're added), status unscripted /
  vetted / baked / stale (script changed since bake). Per-item and
  batch **Bake** buttons POST to the local server, which calls Azure
  Speech (key from `.env`, never in the page; SSML with per-character
  voice + rate from `joe/voices.json`), requests
  `ogg-24khz-16bit-mono-opus` directly, writes
  `assets/voice/lessons/<id>.opus`, updates the voice manifest with a
  content hash. Re-bake overwrites and bumps. Casting is data: change
  Fred's voice in `voices.json` → everything shows stale → one batch
  re-bake. Errors surface in the console with Azure's message
  verbatim.
- Acceptance: round-trip edit → export → bake writes a playable opus
  into the repo with the manifest updated; key absent → clear "add
  AZURE_SPEECH_KEY to .env" instead of a stack trace.

### A8a. Standing instruction — the Joe-work protocol (all runs, forever)
Any run item that generates manual or external work for Joe MUST land
it in the workbench as a task — never as loose prose in STATUS. Rules:
- `joe/tasks.json` schema, extensible: `{id, type, title, detail,
  blocks: [runItemIds], artefact?: path, doneRule: 'artefact' |
  'manual', note, state}`. A new kind of Joe-work = a new `type` plus
  its small renderer in the workbench, added in the same run that
  creates it.
- **Done is evidence-based where an artefact exists**: artefact tasks
  derive state from the thing itself (lesson vetted, file baked with a
  fresh hash, audit file saved); the Done button validates and warns
  ("3 lessons still draft") rather than overriding. External tasks
  (school checks, auditions, purchases) are `manual` — Done button
  plus a **note field**, because outcomes feed decisions and the note
  routes them into the pipeline without a chat round-trip.
- Tasks declare what they `block`; the workbench surfaces "Run D
  waits on N of your tasks" and run-planning reads the same file the
  ledger mirrors.
- Completed tasks archive, never delete — history is respec context.
- The workbench is local HTML/TS/JS, dev-only, **never deployed**:
  no route to it from any shipped bundle, `npm run channel` proves it
  in both directions.

## A9. Verification
Existing six gates green (parity by construction). New: attempt-model
unit tests per page type; hint-exclusion end-to-end; harness
single-instance assertion; B-function inertness tests; migration
fixtures; month-walk economy assertion; tier computation tests incl.
small-sample dashes; workbench round-trip test (scripted, headless
server). STATUS.md updated against A-numbering; Fable-5 review with
attack orders: attempt exclusions, tick-persistence token, re-base
maths, workbench file-write safety (path-jailed to repo),
B-inertness.

---

# CONTEXT — the later runs (architecture must anticipate, not build)

## Run B — automatic progression
Gates on the A6 signals (EWMA ≥ .85, ≥ 20 attempts, probe accuracy
≥ .70 over ≥ 8, zero-rescue recent sessions, ≥ 2 distinct days);
probes 1-in-8 from the next untucked stage once EWMA ≥ .75; **the
offer** at completion highs, max 1/session, universal line: *"You are
doing really well! Would you like some trickier questions? They will
get you eggs and tiles faster."* — decline = nothing + 2-session
cooldown; accept = tick + honeymoon (pay 3, 2 sessions, cost-index
frozen); taking-away introduced by offer (*"Would you like to do some
taking away?"*) then dealt MIXED with the minus sign popping on debut;
weakness-lean between paths bounded 65/35 on persistent estimates
only; invisible in-session mercy runs; whisper retirement (1–2 items
per session from mastered stages, feeding the settled-✓ that can
quietly wake); "what Auto would do" goes live; refusal-inertness and
ratchet asserted in the month-walk. Nothing demotes, ever.

## Run C — new maths content + lessons
Appended generators (never edits): sums teens-no-carry, sums
multiples-of-ten, taking-away mirrors; **the ten-dot** with SNAP and
un-SNAP animations; box order becomes 1 to-ten · 2 teens-no-carry ·
3 tens (ten-dot debuts, INTRO-TEN autoplays once, Committed-before-
play) · 4 carry · (existing to-twenty content re-mapped under the new
order — mapping specced at C); **the lesson player**: ❓ second step
"Fred, show me?", the 5-error help OFFER (*"Would you like me to help
and explain how to solve it?"* — never autofire; 3 quick wrongs still
open dots), fixed-exemplar clips from the workbench bake, beats timed
in data landing on the SNAPs, live-TTS placeholder until baked clips
exist.

## Run D — the words ladder
`data/word-grades.json` tags over frozen arrays (length band +
structure sort within); graded dealing by rejection-sampling;
close-spelled trap sets (known friend beside near-twin stranger);
same-onset then medial-vowel rungs; find-before-build debut rule
(recognition leads, production trails); accent-audit file
(`joe/pairs-audit.json`) — every pair distinct in HER accent, Joe
strikes rejects; noun candidates drafted to `joe/noun-candidates.json`
in editor dialect for red-pen; sentences remain a reserved slot.

---

# JOE'S QUEUE (seeds `joe/tasks.json`)
1. Vet lesson scripts (workbench after Run A; the plan doc meanwhile) —
   includes the school-verb check: "borrow" vs "take" for carry.
2. `AZURE_SPEECH_KEY` into `.env` (unblocks the bake console).
3. Voice casting: audition + set `joe/voices.json` (placeholder en-GB
   until then; everything re-bakes on change).
4. Red-pen `joe/noun-candidates.json` (blocks Run D top rungs).
5. Strike `joe/pairs-audit.json` rejects (blocks Run D trap rungs).
6. The 43 phonemes (booth; eternal; unblocks Fred-talk clips).
7. Evening after Run A: hand-tick taking-away 1 for the QA department.

# FIELD NOTES — A1 (surveyed, then built, 28 Jul)

Both A1 faults were traced to the line before the session was cleared, then
built from that survey in the next one. **Both are now fixed exactly as
written below** — the survey held, no surprises at the edit. Kept in full
because the reasoning is the reason the fixes are the shape they are, and
the trap in fault 1 is the kind of thing a later run would walk into again.

### A1 fault 1 — one found word banks the whole page (`PB-007`, BACKLOG #44)

`overlay.ts`, in the `deps()` block: `flyToScore: () => { earned = true }`.
`wordFind.ts:64` calls `flyToScore` on **every** correct word and
`celebrate()` (`:67`) only when `round.ti` reaches the end — so a five-word
page banks on the first word.

**The fix is NOT to move banking to completion for all three renderers**,
and this is the trap. `build.ts:131` and `sum.ts:117` call `flyToScore`
and then `onAdvance` a second or two later (`SUM_ADVANCE_MS`), and
`earned` is exactly what protects that gap — she has answered, the star
has flown, and tapping the X must not discard it (§18, and the comment
above `let earned` says so). Moving it would trade one bug for a worse one.

Shape that works: track which renderer is mounted (`'find' | 'build' |
'sum'`, set in the three `open*()` methods at `overlay.ts:462-492`) and
make `flyToScore` set `earned` only when it is **not** `'find'`.
`celebrate()` already sets it, which is the find page's completion.
One target → bank at once; several → bank when the last lands.

### A1 fault 2 — the dead voice channel is a CSS rule, not missing logic

The fallback logic already exists and is correct: `wordFind.ts:45-52`
calls `deps.showTarget()` and `deps.toast()` when `speech.speak()` returns
false. What kills it is `tokens.css:115-117`:

```css
body:has(.overlay:not(.hide)) .say { display: none; }
```

`overlay.ts:264` and `:269` give **both** `toastEl` and `targetCard` the
class `chunk say hide`. A challenge IS an `.overlay`, so both are
`display: none` for exactly as long as a round is open — which is the only
time either is ever used. This is the third time this selector has eaten a
element; `tokens.css:153` documents the same fault being fixed for the tile
offer's question by giving it its own class (`.offer-ask`).

Follow that precedent: give the two floaters a class that is not `.say`
(e.g. `.floater`) carrying `.say`'s layout — `position: fixed; left: 50%;
transform: translateX(-50%); width: min(92vw, 46rem); text-align: center;
font-size: clamp(1.2rem, 3.4vmin, 2rem); font-weight: 800; line-height:
1.35; z-index: 12`. Stacking is already fine: `.overlay` is z-index 10,
so 12 sits above it. `toastEl`'s inline `bottom:auto; top:4vh` still applies.

Acceptance is the spec's: with `speechSynthesis` stubbed absent, the
target text is visible and the rescue toast renders. `tests/island/
overlay.test.ts` is the right home — jsdom, and it already stubs
`Element.prototype.animate` and fakes timers.

### A7 — the "exact doubling" was not exact (corrected 28 Jul, at the build)

The survey said: `{2, 32, 6}` / `{2, 28, 5}` with every item paying 2 is a
clean ×2 on both sides, so the month-walk holds "by construction rather than
by tuning. No open question here."

**That was wrong, and the arithmetic says so.** Rounding does not commute with
scaling: `round(2x) ≠ 2·round(x)`. Doubling `base` and `cap` and then rounding
the doubled curve moves **ten** prices on the tile curve and **five** on the
egg curve — and the worst is the second tile, the most visible price in the
game, which goes from 3 sums to 7 units, i.e. **4 sums**. A 33% rise, in the
first ten minutes of play, from a change specced to be invisible.

The fix is one line in `cost()`: round to a whole ITEM, then convert to units.
`exact / pay` is identically the old pre-A7 exact curve, so the result is `2 ×`
the old cost at every n — a real exact doubling, this time genuinely by
construction. Every cost is an even number of units, so nothing ever asks for
half an answer, and Run B's pay-3 items spend against the same units without
moving a price.

Two consequences worth carrying forward:

- **Costs are denominated in UNITS now, not items.** `tileCost`/`eggCost` and
  `sumsForTile`/`pagesForEgg` return units; `itemsFor(curve, n)` converts back
  to the number a child actually answers. Anything asserting pacing should ask
  in items, or it is asserting the denomination instead. Four existing tests
  were pinning units-as-items and were re-expressed, not relaxed.
- **A pre-A7 save needed migrating**, which the spec did not anticipate.
  Progress is persisted, so a save holding `sumProgress: 3` would have been
  read as 1½ sums against a doubled price — she pays for the same tile twice
  (§18). `save.pay` records the scale the numbers were written in; absent means
  pre-A7. Kept as the scale rather than a version number so the next re-base is
  the same one-liner. Additive and tolerant: a rolled-back build still reads
  the save, just generously, which is the safe direction.

# FIELD NOTES — A2 (surveyed 28 Jul, not yet built)

Same discipline as A1: traced to the line before the session was cleared, so
the next one starts at the edit. Nothing below is built yet.

### The finding that shrinks A2: correctness is already on the wire

The attempt model's three correctness rules can be derived **entirely from
deps signals that exist today**, with no edit to any ported renderer:

| Path | Rule | Signals it falls out of |
|---|---|---|
| find | one attempt per TARGET, correct iff its first tap is right | `flyToScore` fires per correct word (`wordFind.ts:64`), `onWrong` per wrong tap (`:75`). Target *k* is correct iff no `onWrong` landed between its start and its `flyToScore`. |
| build | one per word, correct iff completed with zero wrong tile taps | `onWrong` per wrong tile (`build.ts:149`), one `flyToScore` at completion (`:131`). Correct iff the wrong-count is zero at that point. |
| sum | one, correct iff the first pad tap is right | `onWrong` per wrong chip (`sum.ts:136`), `flyToScore` on the right one (`:117`). Same test. |

`overlay.ts:288` already tracks `mounted: 'find' | 'build' | 'sum'` (A1 put it
there), which is exactly the discriminator the tally needs. So A2's counter is
a small host-side state machine in the overlay, fed by hooks already wired.

### The one thing NOT on the wire: help

The exclusion rule ("help is free but uncounted") is the part that needs new
plumbing, because every help affordance is **private to the renderer** and
never surfaces:

- `sum.ts:69-73` — tapping a `helper` toggles its dot-box open. Local `shown`.
- `sum.ts:74` — `dotOpeners`, fired by the 3-wrong mash rescue (`:141`).
- `build.ts:70` — `fredTalk()`, reachable via the returned `fred()` handle.
- `wordFind.ts` — **no help affordance exists at all.**

So A2 adds exactly one optional dep, `onHelp?(kind)`, to `ChallengeDeps`,
fired at those three sites. **This is parity-safe by the same argument that
sanctioned `onWrong`** (`mount.ts:52-57`): `tools/smoke/parity.mjs` boots v0
against `dist/words/junos-words.html` and diffs the rendered `#words` DOM;
words2d passes no `onHelp`, an unpassed optional dep is a no-op, and no
attribute changes. The hook is additive observability, the established
pattern, not a port deviation.

### Rescue context is already computed

`overlay.ts:321` (`breaks`, governors.ts) and the `stretch` flag at `:434` are
the cross-page mash memory; the renderers' own 3-wrong guards write
`holds.lockInput`. A2's "attempts during a rescue context are excluded" reads
these — it does not need a new notion of rescue. Note that a mash-rescued SUM
is excluded twice over (rescue *and* help), since `:141` opens the dots.

### Open questions — Joe's call, not mine

1. **The peek.** `sum.ts:92-98`: tapping the grey `?` reveals the answer, sets
   `solved`, and then the round is inert — no `flyToScore`, no `onAdvance`, it
   just sits until she leaves. The spec's attempt model has no case for it: it
   is not help-then-completed (she never answers), and it is not a wrong
   answer. Three readings: (a) no attempt at all, as if the page never
   happened; (b) an attempt, excluded like help; (c) counted incorrect. The
   comment at `:91` says peeking is "free, not profitable", which argues (a)
   or (b) — but which one changes whether a peeked stage looks *unpractised*
   or looks *fine*, and that is a judgement about what you want the report to
   tell you.
2. **Is `sayAgain` help?** The spec names dot-hints and Fred-talk. `btnSay`
   (`overlay.ts:451`) just repeats the prompt. If it is not help, then find
   pages — which have no other affordance — are never help-excluded at all.
   Reading again is arguably the task rather than a hint, but it is a ruling.
3. **Abandonment.** She taps the X mid-page. Absent a ruling I will record
   nothing (an unresolved attempt is discarded, not a failure) — silence is
   not evidence of getting it wrong, and the alternative punishes leaving.
   Flagged rather than assumed silently; say if you want it counted.

### Mechanical calls made at the survey (no ruling needed)

- **Latency starts when the question is actually PUT, not at mount.** On find
  and build the prompt is spoken from a timer that `quietUntil` can defer
  (`wordFind.ts:37-42`, `build.ts:55-59`), so mount-time would measure the
  timer, not the child. Clock starts when `speak()` is issued — or, on a
  voiceless device, when `showTarget()` paints. For sum the question is on
  screen at mount, so mount-time is correct there.
- Per-target latency on a find page restarts at each target's own prompt
  (`wordFind.ts:68`, the 800ms re-speak), not once per page.

### Where the level is pinned

`main.ts:923` — `{ rng: defaultRng, drawGreen, drawRed, neigh, level: 1 }`.
STATUS quotes `:989`/`:998` from an older tree; the line has moved. This is
the single choke point A3's `levelFor` replaces.

---

# LEDGER (updated on every field report)
| Item | State |
|---|---|
| A1 | **BUILT** (28 Jul, `PB-007` closed) — find pages bank on completion; both in-round floaters are `.floater`, out of the `.say` hiding rule. Four regression tests in `tests/island/overlay.test.ts`. Six gates green. |
| **A7** | **BUILT** (28 Jul) — costs now in units at 2/item, provably invisible: `tests/island/economy.test.ts` walks a month and pins items-per-tile and items-per-egg to the pre-A7 values at every n. The spec's "×2 is exact by construction" was **false** and is corrected in FIELD NOTES; `cost()` rounds in items, and a pre-A7 save is migrated by `save.pay`. |
| **A2** | **SURVEYED** (28 Jul) — see FIELD NOTES. Correctness for all three paths falls out of `flyToScore`/`onWrong`/`mounted`, which already exist: no ported renderer changes for the tally. Help is the only new plumbing — one optional `onHelp?` dep, parity-safe on the `onWrong` precedent. **Three questions await Joe** (the sum peek, whether `sayAgain` is help, abandonment). |
| A3 · A4 · A5 · A6 | SPECCED — awaiting build. These four interlock (harness, tickboxes, schema v3, report) and do not split cleanly; A2 feeds them. |
| **A8 Workbench** | **BUILT** (28 Jul) — `npm run workbench`. Queue, backlog, lesson editor, export, bake console, voices & key. |
| **A8 asset viewer** | **BUILT** (28 Jul, `PB-033` closed) — `/viewer.html`. Three galleries, orbitable, searchable, every ID canonical by construction. |
| A8a Joe-work protocol | **IN FORCE** — `joe/tasks.json`, seven tasks seeded, evidence-based Done. |
| A9 | Partial — workbench round-trip test green, `npm run channel` extended both ways. The rest lands with A1–A7. |
| Run B | Context-specced; blocked on Run A |
| Run C | Context-specced; lessons blocked on Joe #1–3 |
| Run D | Context-specced; rungs blocked on Joe #4–5 |
| Joe #1–7 | Open — now **JT-001…JT-007** in the workbench, not in prose |
| Product Backlog | Seeded, 35 cards, `PB-001…PB-035`. Awaiting Joe's triage. |
| Superseded docs | `pet-island-phase4-1-spec.md` (rulings changed) |

**A8 ruling changed by Joe, 28 Jul.** The spec says the Azure key comes from
`.env` and is *"never in the page"*. Joe: *"regarding azure key and voice
model, make that definable UI side pls."* Done — the Voices & key tab sets
both. What survives of the original rule is the direction of travel: the key
goes IN from the page and never comes back out. The server writes it to the
(gitignored) `.env`, `/api/state` reports only the last four digits, and the
bake still happens server-side, so a screenshot of the workbench cannot leak
the account. Voices are picked from Azure's own catalogue when a key is set,
from a built-in en-GB shortlist before that.

**Also grown past the lightweight law, with cause.** The spec caps the
workbench at ~1,500 lines. It is now ~2,100, and Joe lifted the cap
explicitly for the viewer (*"there can be more than 1500 lines"*). The
non-viewer workbench is unchanged at ~1,250; the galleries are the excess.

**One deviation from A8, deliberate.** The spec says clips land in
`assets/voice/lessons/`. This repo cannot have a root `assets/`: the
gitignore records that it case-collides with the existing `Assets/` on
case-insensitive Windows against case-sensitive Linux CI, which is why
runtime assets live under `src/island/public/` — where the PWA already
precaches them. Clips therefore land in
`src/island/public/voice/lessons/`, set as `outDir` in `joe/voices.json`
so it is one line to move.


---

# APPENDIX L — Lesson curriculum seed (workbench splits this into `joe/lessons/`)

Each `##` block below becomes one `joe/lessons/<id>.md`, status `draft`.
The laws and trigger rules apply to the Run C lesson player and travel
with the seed.

# Fred's Little Lessons — Concept & Lesson Plan (for vetting, then Azure bake)

Laws that govern every lesson: Fred teaches the METHOD, never the live
answer — every lesson runs on its FIXED exemplar, deliberately different
from the question on screen, and always ends with the handover ("Now you
try yours!"). The exemplar's own answer IS completed (it is the
demonstration). One baked clip per lesson, no name slots, no number
splices. Voice: Fred. Rate: slightly slow. Scripts are written for the
ear — punctuation is the prosody; read each aloud once before blessing.

Triggers: a lesson never autoplays over her thinking. Routes in: (1) the
❓ hint, second step — "Fred, show me?"; (2) the five-error offer —
"Would you like me to help and explain how to solve it?" — accepted; (3)
INTRO-TEN only: plays once automatically at its box's debut, then joins
the on-demand library. Watching is free; the answer afterwards still
pays and is excluded from attainment, as agreed.

Ladder placement (sums): 1 sums to ten · 2 teens, no carry · **3 tens —
the ten-dot debuts** · 4 carry to twenty · 5 three numbers.
(Taking away): 1 counting back · 2 teens minus bits · 3 taking away
tens · 4 breaking open ten.

---

## INTRO-TEN — the big dot (place value)
*Plays once at sums box 3 debut; forever on demand. Exemplar: ten ones.*
*File: lessons/intro-ten.opus · ~16s*

**Visual beats:** ten ordinary dots march into a line → a counting
sweep highlights each as Fred counts → they squeeze together → SNAP:
one large glowing dot with a soft sparkle → the big dot bounces once.

**Script:**
"Look at these little dots! One, two, three, four, five, six, seven,
eight, nine… ten! Now watch. When ten little dots hold hands… SNAP!
They turn into one BIG dot. One big dot is worth ten little ones. So
when you see a big dot — you say TEN!"

---

## L-ADD-1 — counting on (sums to ten)
*Exemplar: 4 + 3 · File: lessons/add-counting-on.opus · ~13s*

**Visual beats:** four dots settle on the left, three on the right →
the four glow as a group → hops land on the three, one at a time, as
Fred counts on.

**Script:**
"Here's a trick for adding! Four… plus three. Keep the four safe in
your head — four! Now count on: five… six… seven! Four plus three
makes seven. Now you try yours!"

---

## L-ADD-2 — ten and a bit (teens, no carry)
*Exemplar: 10 + 4 · File: lessons/add-ten-and-a-bit.opus · ~13s*

**Visual beats:** one big dot on the left, four little dots on the
right → the big dot holds still and shines → the four slide up beside
it → the pair frame the answer together.

**Script:**
"Teen numbers are just ten — and a bit! Ten… plus four. The ten stays
whole, and the four sits right next to it. Ten and four… fourteen!
Now you try yours!"

---

## L-ADD-3 — big-dot sums (tens)
*Exemplar: 20 + 30 · Requires INTRO-TEN seen. ·
File: lessons/add-tens.opus · ~15s*

**Visual beats:** two big dots drop in, then three more → they line up
as a five → a gentle count sweep → the row shines as fifty.

**Script:**
"Big dots make this easy! Twenty is two big dots. Thirty is three big
dots. Two big dots plus three big dots… five big dots! And five big
dots are worth… fifty! Now you try yours!"

---

## L-ADD-4 — the fill-up-ten trick (carry to twenty)
*Exemplar: 8 + 5 · File: lessons/add-make-ten.opus · ~17s*

**Visual beats:** eight dots left, five right → the eight-group shows
two empty spaces pulsing → two dots slide across from the five → SNAP
into one big dot → three little dots remain, standing proud → big dot
plus three frame thirteen.

**Script:**
"Here's the fill-up-ten trick! Eight plus five. Eight wants to be ten —
it needs two more. Borrow two from the five… SNAP! That's ten. And
there are three left over. Ten and three… thirteen! Now you try
yours!"

---

## L-ADD-5 — friendly pairs (three numbers)
*Exemplar: 7 + 3 + 4 · File: lessons/add-friendly-pairs.opus · ~15s*

**Visual beats:** three dot-groups appear → the seven and the three
glow together and drift toward each other → SNAP into a big dot → the
four slides in beside it.

**Script:**
"When there are three numbers, look for friends that make ten! Seven…
three… and four. Seven and three are friends — SNAP, they make ten!
Then ten and four… fourteen! Now you try yours!"

---

## L-SUB-1 — counting back (taking away, to ten)
*Exemplar: 7 − 2 · File: lessons/sub-counting-back.opus · ~13s*

**Visual beats:** seven dots → the last two dim one at a time as Fred
counts back, each giving a little wave as it fades.

**Script:**
"Taking away means counting back! Seven take away two. Start at seven
and hop back: six… five! Seven take away two leaves five. Now you try
yours!"

---

## L-SUB-2 — take from the bit (teens minus units, no borrow)
*Exemplar: 14 − 3 · File: lessons/sub-teens.opus · ~15s*

**Visual beats:** one big dot and four little ones → the big dot holds
still and shines → three of the little dots fade → one little dot
remains beside the untouched big dot.

**Script:**
"Remember — fourteen is ten and a bit! The bit is four. Take the three
away from the four bit: four take away three leaves one. The ten
didn't move! Ten and one… eleven! Now you try yours!"

---

## L-SUB-3 — big dots hop away (taking away tens)
*Exemplar: 50 − 20 · Requires INTRO-TEN seen. ·
File: lessons/sub-tens.opus · ~14s*

**Visual beats:** five big dots → two hop away together, waving →
three remain and shine as thirty.

**Script:**
"Big dots again! Fifty is five big dots. Take away twenty — that's two
big dots hopping away. Five take away two leaves three big dots…
thirty! Now you try yours!"

---

## L-SUB-4 — breaking open ten (borrowing)
*Exemplar: 13 − 5 · Requires INTRO-TEN seen. ·
File: lessons/sub-break-ten.opus · ~18s*

**Visual beats:** one big dot and three little ones → the three fade
first → the big dot wobbles → SNAP in reverse: it bursts gently into
ten little dots → two of them fade → eight remain and shine.

**Script:**
"Here's the break-open-ten trick! Thirteen take away five. Thirteen is
a big dot and three. Take the three away first… but we need to take
two more! Break open the big dot — pop! — ten little dots. Take two
away… that leaves eight! Now you try yours!"

---

## Bake & wiring notes
One Opus clip per lesson, filenames above, Fred's cast voice, rate
~0.92, loudness-matched to the existing corpus. The `SNAP` moments in
scripts should land on the snap animation beat — the runtime cues the
visual sequence from clip start, beats timed in data per lesson.
INTRO-TEN's debut autoplay persists a once-flag (Committed before it
plays, per the one-shot lesson learned on openingSeen). Lessons appear
in the ❓ second step only for their own stage's items. Nothing here
ever speaks the live question's numbers or answer.
