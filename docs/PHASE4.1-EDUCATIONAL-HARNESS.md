# Phase 4.1 — the educational harness

*Written 28 July 2026 for Joe, who is writing the spec. This is not a spec and
not a plan. It is the survey underneath one: what is already built, what is built
but switched off, the decisions only he can make, and the implementation traps I
can see from here.*

*Everything below with a `file:line` was measured today, not remembered.*

---

## 1. The headline

**The escalation machinery exists, is regression-tested, and is switched off by a
hardcoded constant in two places.**

```
src/island/main.ts:989   { rng: defaultRng, drawGreen, drawRed, neigh, level: 1 }
src/island/main.ts:998   const item = dealSum(sumStore, defaultRng, 1, state.sumHeld)
```

Every generator takes a `level`. Every level is pinned in `tools/golden/golden.json`.
The 2D original even has a UI control for it. The island passes `1` and always has.

Two consequences worth stating plainly, because they are invisible from the
outside:

- **There is no subtraction in the game.** `dealSum` only ever calls
  `generateAdd` (`src/island/deal.ts:79`). `generateSub` is written, tiered,
  golden-pinned — and never invoked from the island.
- **Every sum Juno has ever done totals ten or less.** Level 1 addition is
  `a = 1..9`, `b = 1..(10-a)`.

---

## 2. What is already built and running

### Reading content

| | |
|---|---|
| `GREEN` | 55 fully decodable words (`src/core/wordlists.ts:17`) |
| `RED` | 40 exception words, tricky grapheme in brackets — `s[ai]d`, `w[a]s`, `th[ey]` (`:27`) |
| `CONFUSABLE` | 4 groups never shown together: `to/too/two`, `of/off`, `an/and`, `then/them` (`:38`) |

The GREEN/RED split is a real phonics distinction and it is already wired: both
decks are drawn from. Words are dealt by `makeDeck` — a shuffled deck, so no
repeats until exhausted.

### The one live progression

`src/core/generators/read.ts:45`

```
const n = Math.min(MAX, MIN + s.history.length)      // MIN 3, MAX 12
```

The child's first page has three words, the second four, up to twelve.

**It resets on every reload.** `readStore` is created fresh at
`src/island/main.ts:158`, and `save.ts` deliberately does not persist generator
history (see its note at `:129`). So the ramp is per-sitting and starts again
from three words each time the child opens the game. **Whether that is a bug or
a feature is a spec decision, not an implementation detail.**

### Pacing knobs that already exist in `balance.json`

- `pages.mix: ["find","build","build","build"]` — the 3:1 you asked for
- `pages.wordsPerFindPage: 3`
- `tile` / `egg` cost curves
- `governor.tilesPerPet: 1.5`

---

## 3. What is built but unreachable

The tiers behind `level`, all golden-pinned:

| generator | level 1 | level 2 | level 3 |
|---|---|---|---|
| `generateAdd` | within ten, `a+b ≤ 10` | **bridges ten**, `a+b ≥ 11` | — |
| `generateSub` | within ten | teens minus units, `a = 11..20` | anything to 20 |
| `generateBuild` | real words from the deck | **alien / pseudo-words** (`alienWord`) | — |
| `generateRead` | full path, up to 12 words | shorter path, capped at 8 | — |

`src/core/generators/sums.ts`, `build.ts:25`, `read.ts:29`.

---

## 4. What does not exist at all

**No proficiency measure.** There are exactly two wrongness signals and both are
deliberately short-lived:

- `round.wrongs` in each renderer — **consecutive** wrongs, zeroed on any correct
  answer. Drives the rescue/hint only.
- the break watch (`governors.ts`) — **cumulative per page**, in memory, lost on
  reload. Deliberately: a rough patch must not be persisted and served back to
  the child tomorrow.

Neither is a competence estimate and neither feeds difficulty. Note the two count
*different things* — a detail that matters if the spec reuses either.

**No reporting.** The grown-ups menu is a PIN keypad plus backup / restore /
reset. No accuracy, no history, nothing for you to read.

**No word-difficulty grading.** `GREEN` is one flat list. Lengths run 1–5
letters but selection is uniform, so "bigger words" is not modelled anywhere.
The only length control in the game is how *many* words a page holds.

**No persistence of anything about the child's performance.** Save schema is at
version 2.

---

## 5. The regression gates, and what they will and will not allow

**This is the most important section for whoever implements the spec.**

### `tools/golden/golden.json` — already covers every level

`capture.mjs` runs 500 items per generator per level and stores the output:
`read`, `readL2`, `add`, `addL2`, `sub`, `subL2`, `subL3`, `build`, `buildL2`.
Its own comment says why: *"Every level the shipped UI can reach... otherwise
alienWord's RNG stream, the bridging-addition branch and subtraction levels 2-3
would all go unpinned."*

**The rule, which has not changed: `golden.json` may never be edited to make a
test pass.** What follows:

- **Changing level SELECTION is free.** The generators' behaviour per level is
  what is pinned, not which level gets used. Adaptive selection breaks nothing.
- **Changing a generator's internals is not free** — it invalidates the anchor
  and there is no legitimate way to re-bless it.
- **Adding a level 4 is possible** but must be *appended* as a new key, with the
  existing entries untouched.

So: **the spec can freely decide when levels change; it should avoid redefining
what a level is.** If a tier genuinely needs different arithmetic, that is a new
tier, not an edit.

### `npm run parity` — the 2D shell must stay in step with v0

`parity.mjs` boots `v0/junos-words.html` and `dist/words/junos-words.html` side
by side under one seed and diffs every step. Its script *includes a level
switch*: `['reading level 2 (alien)', d => clickId(d, 'btnL2')]`.

Two consequences:

- v0 has a manual level control (`setLevel`, v0:2055-2061). Levels are part of
  the frozen original, not a new invention.
- **Adaptive selection must NOT go into `src/core/`.** Anything that changes how
  `core/` behaves for a given seed and level will diverge from v0 and redden
  parity. The selection logic belongs in the island layer — `deal.ts` /
  `main.ts` — which v0 has no counterpart to and parity does not compare.

That constraint is a gift, not an obstacle: it forces the harness to be a thin
policy layer over frozen, pinned content.

---

## 6. Decisions only you can make

Listed as questions a spec has to answer, roughly in dependency order.

### The measurement

1. **What is the unit of competence?** Per operation (add / subtract)? Per
   grapheme or phonics feature? Per word class (green / red)? One global number?
   The finer the unit, the more data each estimate needs and the slower it moves.
2. **Over what window?** Last N answers, last N pages, exponential decay?
3. **What counts as an attempt?** See the blocker in §7.1 — for find pages the
   game currently cannot tell you.

### The policy

4. **What promotes?** A threshold on accuracy, a run of clean pages, something
   else?
5. **Does anything demote?** Brief §19 says nothing the child has is taken
   away. A visible drop in level is arguably a thing taken away. If the answer
   is yes, the spec should say how it is framed so it cannot read as punishment.
6. **Per-skill or global?** Can a child be level 2 at reading and level 1 at maths?
   (The generators already allow it — `dealReading` and `dealSum` take separate
   levels.)
7. **Does it survive a reload?** This is the sharpest tension in the whole
   feature: the break watch is deliberately transient so a bad afternoon is not
   remembered, but a competence estimate is worthless if it resets. The spec
   needs to separate *struggle* (transient, by design) from *attainment*
   (persistent, or pointless).

### The content ladder

8. **Introduce subtraction — when, and how?** It is fully built and unused. Mixed
   into the same deck as addition, or its own kind of page?
9. **Alien / pseudo-words: yes or no?** They are a legitimate phonics assessment
   tool (they force decoding rather than recall) and they can also baffle a
   six-year-old who thinks they have misread. Your call, and it is a judgement
   about Juno, not about software.
10. **"Bigger words" needs defining.** Nothing currently grades word difficulty.
    Options: grade the existing 95 words by length or grapheme complexity; add
    longer lists; or treat "more words per page" as the only axis (which is what
    happens today). If new words are wanted, the lists are the frozen v0 content
    — see §7.3.
11. **Should the reading page-size ramp persist across sessions?**

### The surface

12. **Does the child see their level?** Any visible ladder invites comparison
    and failure-reading; hiding it entirely means they never feel promoted.
13. **Do you see it?** A grown-ups report is new UI and needs its own thought
    about what is honest to show.
14. **Do you get a manual override?** v0 has one. It is the cheapest possible
    version of this whole feature and would let you set the level by hand
    tonight.

### The economy

15. **Does price move with difficulty?** Right now a tile costs N sums regardless
    of how hard a sum is. Promote the child and land silently gets dearer in
    wall-clock terms. Either the curve compensates, or it does not and that is a
    stated choice. This interacts directly with the 3:2 ratio work just landed.

---

## 7. Implementation issues I can see

### 7.1 Find pages cannot currently be scored — this blocks the honest version

Open card: **one found word banks the whole page.** So for a find page the game
records "passed" after a single correct tap out of three targets. Any rule of the
form *"promote at 80% correct"* would be reading a number that does not mean what
it says, and it would over-promote the child specifically on the page type
that is easiest to get one lucky tap on.

**This needs fixing before, or as part of, the measurement.** It is small work
and it is a prerequisite, not a nicety.

### 7.2 One choke point, or it will drift

This codebase has been bitten three times by the same shape: two paths that must
agree, kept in agreement by hand. Props vs the growing plot (trees inside rocks,
reported twice). The tile offer vs what actually lands (fixed by making
`landOffer` derive from `landedType`). The mountain on the plot vs the mountain
planted (fixed with one shared `mountainHexFor`).

There are **three generator paths** — read, build, sum — each with its own
renderer. A difficulty rule applied in three places will disagree within a month.
The spec should be implementable as *one* function answering "what level, for
what skill, right now", with all three asking it.

### 7.3 The word lists are frozen content

`wordlists.ts` header: *"Array ORDER is load-bearing: makeDeck deals from these
arrays, so reordering changes every generated round and fails the golden diff."*

So: **new words may be appended; existing words may not be reordered or
removed.** A graded ladder therefore has to be expressed as a *view* over the
existing arrays — an index or a per-word tag — rather than as re-sorted lists.

### 7.4 Persistence means a schema migration

Save is at `schemaVersion 2`. Storing attainment means version 3 plus a
migration, and `MIGRATIONS` in `platform/envelope.ts` is the existing mechanism.
Straightforward, but it is real work and it must be written so an old save
arrives with a sensible default rather than at level 1 having earned better.

### 7.5 Difficulty must not become a lockout

Brief §19 and the governors' own doctrine: invitations, never lockouts; nothing
expires; nothing is taken back. A harness that decides the child is "not ready"
for something they were doing yesterday breaks that. The safest shape is that
difficulty changes what is *offered*, never what is *permitted*.

### 7.6 Harder reading leans on the voice, and the voice has a dead channel

Open card: the `targetCard` fallback — the text shown when no UK voice is
available — is styled `chunk say`, and `tokens.css` hides `.say` whenever an
overlay is open, which is exactly when it fires. On a device without a UK voice
the find target is neither spoken nor shown. Latent on Juno's tablet, which has
a voice. **If reading escalates, this stops being latent** — harder words are
precisely when hearing the target matters.

### 7.7 Mid-session level flips are already exercised

Good news, so it does not need re-proving: `capture.mjs` deliberately carries
generator state across the level flip, and the anti-repeat guard compares a
level-2 item against the last level-1 one. Flipping level between pages is a
tested path, not new ground.

---

## 8. The cheapest useful first slice

Offered only as a sighting shot for the spec, not as a recommendation to skip it:

1. Wire a manual level, per skill, behind the grown-ups PIN. Uses everything that
   already exists; you could set it by hand this evening; it makes subtraction and
   bridging-ten reachable immediately.
2. Fix find-page scoring so accuracy means something.
3. Log attempts (in memory) and show them in the grown-ups panel, so you can
   *see* what an automatic rule would have decided before one is built.
4. Then automate, with the policy from your spec.

Steps 1–3 are individually small, break nothing, and turn the automatic version
from guesswork into tuning.

---

## 9. Related open cards

| card | why it matters here |
|---|---|
| one found word banks the whole page | **prerequisite** — §7.1 |
| mash-guard toasts never visible | §7.6, becomes release-blocking on voiceless devices if reading escalates |
| tile-to-animal ratio (landed) | §6.15, difficulty and price interact |
| pure play as session reward (parked) | if attainment becomes visible, reward framing is adjacent |
