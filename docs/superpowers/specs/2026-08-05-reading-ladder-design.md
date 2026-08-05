# The reading ladder — design

*5 August 2026. Joe: **"expand the reading difficulty and add reading rungs."***

## What this is, and what it deliberately is not

`STAGES.reading` is `[1]`. `STAGES.building` is `[1]`. Sums has seven rungs and
taking-away has three, so reading — the path this game is named for — is the only
one a child cannot climb.

This spec is the **word-level ladder**: ten rungs from single sounds to
two-syllable words, plus the dials that run across all of them.

**Short sentences are NOT in this spec.** Joe wants the ladder to reach fluent
sentence reading, and it will, but a sentence is not a longer word: the find page
deals word tiles she taps and the build page deals grapheme tiles she drags, and
neither shape carries. That is a new generator and a new renderer, and folded in
here it would be the paragraph at the end of a document whose easy half took
twenty pages. It gets its own spec, written directly after this one, and its
rungs append to **this** array rather than starting a second ladder.

## The rule that constrains everything below

`GREEN` and `RED` are **frozen — not reordered, not appended to, not resorted.**

`wordlists.ts` says it outright: *"Array ORDER is load-bearing: makeDeck deals
from these arrays, so reordering changes every generated round and fails the
golden diff."* `golden.json` pins generator streams and
`docs/MANAGER-HANDOFF.md` records that it **may never be re-blessed**. Two
changes on 4 August had to route around it, and this one does too.

So: **every new rung draws from its own new list.** Rung 3 keeps dealing exactly
what it deals today, from exactly the arrays it deals from today. No new word is
ever inserted into a list an existing rung reads.

The same rule governs the rung ids. `STAGES` is ordered so that **the number is a
generator id and the array position is the rung** — `sums: [4, 1, 3, 5, 2, 6, 7]`
is not untidy, it is that invariant. New rungs take new ids and append to the id
space. Nothing is renumbered, so no child moves and the golden still anchors.

## The ladder

| rung | id | what it adds | hardest word |
|---:|---:|---|---|
| 1 | 3 *new* | CVC only — no blends, no digraphs | `sun` |
| 2 | 4 *new* | + the taught digraphs `ch sh th ck ll ng` | `fish` |
| **3** | **1** *unchanged* | **today's page — green words + 35% tricky** | `jump` |
| 4 | 5 *new* | 3- and 4-letter nouns | `frog` |
| 5 | 6 *new* | two-word phrases — pronoun/noun + verb | `he has` |
| 6 | 7 *new* | five-letter words, no new graphemes | `plant` |
| 7 | 8 *new* | five-letter nouns, and phrases built from them | `the plant` |
| 8 | 9 *new* | split digraphs `a-e i-e o-e u-e` | `bike` |
| 9 | 10 *new* | alternative spellings `ai/ay oa/ow igh ee/ea` | `night` |
| 10 | 11 *new* | two-syllable | `playground` |
| 11+ | — | short sentences — **its own spec** | — |

**Rungs 1 and 2 sit below where anyone starts**, unticked, exactly as `within
five` does on the sums ladder. `STARTS_TICKED` is untouched, so the cadence never
walks a child down onto them; they exist for a grown-up who needs to go gentler
than today's page, which is the one direction this ladder cannot currently go.

**Juno does not move.** She is ticked on id 1, id 1 keeps its meaning and its
generator, and everything new is above or below her.

### Why rung 4 exists at all

`GREEN` is 55 words and contains **two** concrete nouns: `dad` and `mum`. The
list was built for sentence utility — `and`, `but`, `from`, `just`, `when`,
`with` — which is the right list for building sentences and the wrong one for a
page where a word is *heard* and *found*. A child can picture a frog. She cannot
picture `just`. This rung is not padding the ladder; it fills a hole that has
been there since v0.

### Why rung 5 costs nothing to stock

Joe's own examples — `I go`, `I went`, `he has` — are built entirely from words
already in the vetted lists (`[I]`, `g[o]`, `h[e]`, `has`, `went`). A phrase rung
made of mastered words adds **tracking** load without adding **decoding** load,
which is what makes it a gentle step rather than a cliff.

### Why rung 6 is defined by code and not by length

Joe's handle is letter count and it is a good handle for a person. It is a bad
one for a generator, because letters are not sounds: `night` is five letters and
three sounds, `stamp` is five letters and five sounds and is far easier. The
common five-letter words are `plate`, `smile`, `train`, `house`, `green`,
`night` — every one of them a split digraph or an alternative spelling, i.e. the
code that rungs 8 and 9 exist to introduce. A rung bounded by length would teach
the two rungs above it, and the ladder would invert.

So the rung is bounded by **code** and presented by **length**: five letters,
adjacent consonants, no new graphemes — `stand`, `crisp`, `plant`, `blink`,
`frost`, `champ`. That is a real phonics step (Phase 4) and a large enough pool.

## The dials — properties of every rung, not rungs of their own

### 1. Twin density

Joe: *"there is evidence of her searching for the first word only."*

`neighbours.ts` already builds near-twins one edit apart (`sat`/`sit`) so that
"first-letter guessing loses", and `read.ts` already plants them. It plants
**two**: `pairTarget = min(2, max(1, floor(n / 4)))`. On a twelve-word page that
is two twins and ten words winnable on the first letter. The observation is not
evidence of a missing rung; it is evidence of a dial set too low.

Twin density therefore **ramps across the whole ladder** — roughly two per page
at rung 1, most of the page by rung 10 — rather than becoming a rung of its own.
The reason is that rungs are exclusive: a child is dealt from one generator at a
time, so a "whole word reading" rung is one she meets and then *climbs past*, and
the habit returns on the next rung where the words are least familiar. A habit is
not a stage.

This also collapses Joe's spiral from ~13 rungs to 10, which halves the vetting.

### 2. Build tile granularity

The build tray currently holds digraphs as single tiles (`ch`, `sh`, `th`, `ee`,
`oo`, `or`, `ck`, `ll`, `ng`) and `markDigraphs` keeps them whole in the target.

Joe: *"eventually drop buttons with digraphs in favour of just letters and she
builds the digraphs herself, but not until we are a much higher rung."*

So granularity is a second dial on the build path, independent of which words she
is given: grapheme tiles up to a high rung, then letters only, so she assembles
`sh` from `s` and `h`.

**It switches at rung 10 (two-syllable), and that number is a default, not a
finding.** An implementation needs one, and "much higher rung" is not one — but
nobody has watched a child do this yet, so it is written as a single constant
with this sentence beside it, to be moved once Joe has seen a real page. Moving
it is a one-line change and moves no child, because granularity is a property of
the tray rather than of the ladder.

### 3. Finger space

Joe: *"include a button with a finger for 'finger space' for a new word."*

On phrase rungs the build tray carries a finger-space tile, and the gap between
words must be placed rather than assumed. This teaches the writing convention
inside the game instead of beside it.

## The build path

**Build follows reading, one rung behind.** Not a second ladder to manage, and
not level with reading either.

Spelling lags reading in every reader — she will read `night` months before she
can spell it. Level-pegged, the day she climbs to split digraphs she is asked to
*spell* `bike`, and the build page becomes the thing that makes her stop. One
rung behind means she spells what she read last week and reads something new this
week, which is the shape the gap actually has.

`building` keeps its own tick, so a grown-up can still hold building back or turn
it off — `deal.ts` records that a parent who says their child cannot build words
yet outranks the data file, and a tick that collapsed into a switch would lose
that.

## Where the words come from

Five new lists, roughly 150–200 words, drafted by agents and **vetted by Joe**
before any of them reaches Juno.

The mechanism already exists and works: a ledger file, one row per word, with the
human verdict field left empty — the shape `joe/names-audit.json` uses for the
266 pet names. Agents own the draft; Joe owns the verdict; nothing is dealt from
an unvetted row. The parallel is exact and the tooling is already written.

## What this does not change

The find and build renderers; the `MIN` 3 → `MAX` 12 page ramp; the confusable
guard (`to`/`too`/`two` never on one page); the save format; `STARTS_TICKED`;
`golden.json`; and every word `GREEN` and `RED` deal today.

## One addition, offered rather than assumed

A wrong tap that shares an initial letter with the target **is** first-letter
guessing, and `onWrong` already fires on every wrong tap. Counting those
separately would let the grown-ups panel show whether raising twin density
actually killed the habit, rather than leaving Joe and me to assume it did. It is
a small instrument on a mechanism this spec is otherwise tuning blind.

## Risks

- **Vetting is the critical path, not code.** Five lists is more of Joe's time
  than of anyone's compute. If it stalls, ship the rungs whose lists are done —
  the ladder is an array and a short one is valid.
- **One ladder, split later.** Joe chose this knowingly. The mitigation is the id
  scheme above: because position is the rung and the number is a generator, an
  axis can be lifted into its own path later without renumbering anything a save
  has recorded.
- **Rung 7 is the softest.** "Repeat the escalation" collapsed into one rung once
  twin density became a dial. If it reads as a repeat of rung 6 rather than a
  step, it is the one to cut.
