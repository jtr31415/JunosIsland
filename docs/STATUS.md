# Pet Island — where we are

*Updated 27 July 2026, against `docs/pet-island-phase3-brief.md` and its
numbering. Read `docs/HANDOFF.md` first for how to work on this without
breaking it; this is what has been done. **`docs/BACKLOG.md` is what is LEFT** —
every open card with the measurements and reasoning attached, so a fresh session
does not have to rediscover any of it.*

**PHASE 3 IS COMPLETE — items 0–6.** Its close-out is
`docs/PHASE3-HANDOVER.md`: what exists, how it is wired, and what Phase 4 has to
decide. Item 6's wiring onto live pets is item 7, which is Phase 5.

The
game is deployed at <https://jtr31415.github.io/JunosIsland/> and **the QA
department has now played it** — Joe, 27 July: *"she just did a solid hr of work
and is now enjoying looking at the island and looking for the animals."* Her
verdict outranks every document here (brief §18), and the notes below marked
"playtest" are it.

---

## LATEST — 28 July, evening. Run A is measuring, and subtraction is dealt.

**The LEDGER in `docs/pet-island-runA.md` is authoritative for Run A** — state
per item, plus FIELD NOTES carrying the reasoning and every ruling Joe has
given. This is the summary; that is the record.

**Built: A1 · A2 · A3 · A5 (data half) · A7 · A8.** What changed this evening:

- **A3, the harness** (`src/island/harness.ts`) — the single choke point. The
  hardcoded `level: 1` in `main.ts` is gone, `deal.ts` no longer decides
  anything, and `onAttempt` is wired: **measurement exists for the first
  time**. A2 had been computing every attempt correctly and dropping it,
  by design, because the sink had nowhere to go until this landed.
- **Subtraction is dealt for the first time in the island's life.** The
  generator was already ported with all three v0 levels and `sum.ts` already
  painted the minus sign — only the choice was missing. **JT-007 (Joe's
  hand-tick evening) is now blocked on A4's panel, not on machinery.**
- **A5's data half** — `attainment` persists on the island save. **No schema
  bump**, deliberately against the item titled "schema v3"; the reasoning is in
  FIELD NOTES and it is about not trading a lost report for a lost island.
- **`PB-038` closed** — `readProgress` counts units and was being read as a
  page index, so the reading mix was sampled at every other slot and the find
  pages had quietly doubled. Joe ruled 3 build to 1 find; the data was always
  right.
- **JT-009 and JT-010 answered and closed.** Two flags for Joe are recorded at
  the end of the A3 field note: how JT-010(3) was read (deal moment, not path),
  and why there is no schema v3.

**What is left in this cluster: A4 (the tickbox panel) and A6 (the report).**
The capability model and every statistic they need are built and tested — what
is missing is the panel that shows them. That is the next move, and it is what
unblocks JT-007.

Gates on the last commit: typecheck, 1218 tests, parity renders identically,
smoke, channel, build. All green.

---

## 28 July, afternoon. The spec arrived and the workbench is built.

`docs/pet-island-runA.md` **supersedes `pet-island-phase4-1-spec.md` in full**
and is the standing instrument: Run A to build, Runs B–D as context so Run A's
architecture does not paint into corners, and a ledger at the bottom updated on
every field report.

**A8 — Joe's workbench — is built and green.** `npm run workbench` →
<http://127.0.0.1:4173>. A local node server that reads and WRITES repo files
directly: his task queue (`joe/tasks.json`, seven tasks seeded from the spec's
own queue), the Product Backlog (`joe/backlog.json`, 35 cards seeded from this
file, `BACKLOG.md` and the run spec, deduped against what shipped), the lesson
editor (`joe/lessons/*.md`, seeded by parsing Appendix L), the export to
`docs/fred-lessons-plan.md`, and the Azure bake console. Dev-only and provably
so: `npm run channel` now greps BOTH shipped bundles for its sentinel and greps
`src/` for any reference to `tools/workbench`.

**The asset viewer is built too** (`PB-033` closed), at `/viewer.html`: three
orbitable galleries — 24 species on turntables dressed in any of the 40 sets,
the 6 tile render kinds across all four seasonal atlases, and 130 props across
both packs. It imports `SPECIES`, `FEATURES`, `COVER`, `MOUNTAIN_HEXES`,
`LEAFY_TREES`, `BARE_TREES`, `WATER_PIECES`, `PALETTE`, `INCREMENTS` and
`TILE_URL` straight out of `src/`, and loads every model through the game's own
loader — so an ID it shows is an ID the game deals, and a colour it shows is
under the island's own lighting rig. It reports both directions of drift: a
registry name with no file (none, today) and a file no table names (30 forest
pieces, deliberately). `tests/island/assets.test.ts` now pins the first of
those in CI.

That needed three additive exports in the game — `FEATURES`, `WATER_PIECES`,
`TILE_URL` — plus an optional `grey` argument on `PropField.load`. No
behaviour changed; `npm run parity` is still identical.

Two more things to know:

1. **The Azure key and the voice casting are set from the page**, at Joe's
   instruction, overriding the spec's "never in the page". The key goes in and
   never comes back out: the server writes it to the gitignored `.env` and the
   page only ever sees the last four digits.
2. **Bake output goes to `src/island/public/voice/lessons/`, not
   `assets/voice/`** — a root `assets/` case-collides with `Assets/` on Windows
   against Linux CI, which the gitignore has recorded since Phase 3. Set as
   `outDir` in `joe/voices.json`.

**A1 is built** (28 Jul). A find page now banks when the LAST target is found,
not the first — build and sum still bank the instant the star flies, because
`earned` is what protects the second between that and the auto-advance. And the
voiceless fallback is alive: both in-round floaters carry `.floater` rather than
`.say`, so `body:has(.overlay:not(.hide)) .say { display: none }` no longer eats
the word-to-find and the rescue toast for exactly as long as they are wanted.
Third time that selector has done this; `.offer-ask` was the precedent followed.

**A7 is built** (28 Jul). Costs are denominated in UNITS now, not items: every
price doubled and one completed item pays 2, so Run B can pay 3 for a probe
without inventing a half-answer. Nothing about the pacing moved — the same sums
buy the same tile at every n, which `tests/island/economy.test.ts` proves by
walking a month of play against an independent reimplementation of the old
curve.

Two things the spec did not anticipate, both now handled:

- **The ×2 is not invisible if you do it naively.** `round(2x) ≠ 2·round(x)`, so
  doubling `base`/`cap` and rounding the doubled curve raises ten tile prices
  and five egg prices — the second tile would have gone from 3 sums to 4. `cost()`
  rounds to a whole item and then converts, which makes the doubling exact.
- **Pre-A7 saves are migrated.** Progress is persisted, and it was written in the
  old unit; read at face value she would have paid for the tile she was halfway
  through a second time. `save.pay` records the scale; absent means pre-A7.

**A2–A6 are specced and not yet built.** The harness, the attempt model, the
tickboxes, schema v3 and the grown-ups report interlock and do not split cleanly
— that is the next real run, not a slice.

---

## 28 July, small hours.

**NEXT PHASE IS 4.1, THE EDUCATIONAL HARNESS**, and Joe has said it outranks
more animals: *"its the educational harness and therefore takes prio over more
animals."* He is writing the spec himself from
`docs/PHASE4.1-EDUCATIONAL-HARNESS.md` and will hand it over to build. **Do not
start building it before the spec arrives.**

Correct a mistake carried in these docs for days: **item 13 was never blocked on
a ruling from Joe.** He had said the *spec* for item 13 is essentially the whole
of Phase 4. Anything still describing it as "blocked, needs Joe's ruling on the
difficulty currency" is wrong.

The headline from the survey: **escalation is built, golden-pinned at every
level, and switched off by `level: 1` hardcoded at `main.ts:989` and `:998`.**
`generateSub` has therefore never run — there is no subtraction in the game, and
every sum Juno has done totals ten or less.

### Everything below is now merged and live on `main`

Both branches that were waiting on Joe are in, ratified:

| | |
|---|---|
| growable-witness backstop | merged `7bc3025`. The narrow socket refusal is RATIFIED. Conflict resolved by keeping the branch's single choke point (`landedType`/`landOffer` in coast.ts) and answering rock *before* delegating to it. |
| break suggestion | merged `ff665cb`. Fable reviewed and passed it. |
| mountains as a third tile | `2f9071c`. Native size, centred, base palette so the rock is grey. |
| tile-to-animal ratio 3:2 | `17ad266`. The cause was an ABSOLUTE corridor in governors.ts, never the cost curves. |
| change your mind after siting | `efff9fa`. Tap the half-built plot. |
| shadows pulled away from the sun | `efff9fa`. Joe's rule, as a `max` so hovering pets keep their physical offset. |
| the plot was stranded on the hidden stage | `d3b7b97`. See the landmine in HANDOFF — this is the one worth reading. |

### Three things to know before touching this code

1. **`overlay.close()` must always be preceded by `stageFor(null)`.** One site of
   five was not, and it stranded her half-built tile on the hidden turntable —
   which is why "change your mind" appeared broken (there was no plot on the
   island to tap). Guarded by a source assertion in `tests/island/retype.test.ts`.
2. **Widening a value union is invisible to `tsc`.** Adding `'rock'` to
   `TileType` silently broke eight places that asked `=== 'grass'` and meant
   "land". They now go through `isLand()` in `grid.ts`. Read the note there
   before adding a fourth type.
3. **`isLand` is deliberately NOT the habitability question.** Rock is land for
   the coastline and not lodging for the governors, because a mountain covers its
   own hex. If those two ever agree again, one was changed without the other
   being considered.

**Operational note:** `agent-browser` hung on every command for the last stretch
of this session (three sessions, all wedged on `open`). Screenshots earlier in the
session worked fine, so it is environmental rather than broken usage — but budget
for it failing and have a non-browser way to verify.

---

## Earlier on 28 July

**Live on `main` at `5520da5`, CI green, deployed.** There is still no `v*` tag,
so the Pages root falls back to `main` — which means **whatever is on `main` is
what is on Juno's tablet**, with no release step in between. Worth remembering
before pushing anything half-finished.

**Mountains shipped** (#14, which had been closed on only half its ask). A third
button in the tile chooser once she has placed fifteen tiles of her own — the
home hex does not count. Joe's rules: rock never sits beside water, water never
beside rock; the button withholds itself where the rules would override it.
Threshold is `balance.json`'s `{ type: 'rock', tiles: 15 }`. **979 tests.**

*The feature was easy; the third VALUE was not.* Every coastline rule was written
when `TileType` had exactly two members, so it asks `=== 'grass'` and lets
everything else mean water — right for two, silently wrong for three, and
invisible to `tsc` because these compare values instead of switching
exhaustively. Rock would have presented open sea to the coast mask and cut
beaches through the middle of her island. Eight sites now route through
`isLand()`. **Read the note on `isLand` in `grid.ts` before adding a fourth
type**; rock escaped needing new coast-table entries only because it can never
touch water.

### Two branches are finished, green, and NOT merged

Both are committed so nothing can be lost, and both are waiting on Joe rather
than on work:

| branch | what | why it is waiting |
|---|---|---|
| `worktree-agent-aae322fb0f2816589` → `c7b0097` | the growable-witness backstop: an outward-corridor check that is genuinely inductive, where the one-ply witness rule was not | **needs Joe's ratification.** It reinstates a narrow socket refusal — the shape the project rejected before. It fires only where grass is infeasible *and* water would cut her last corridor (0.012% of taps at full wetness, 0% below) and provably cannot refuse her last way out, but a socket that stops glowing is product-visible. |
| `worktree-agent-a2a932c7076ce661b` → `b1f7656` | Fred suggests a stretch after three rough pages | Fable reviewed it and said **merge**. Deferred only because Joe ran out of usage, not because anything is wrong. |

Both were cut from bases behind current `main`, so each needs a merge and a fresh
six-gate run — not a fast-forward.

**Merge `b1f7656` behind a fix for #49 if you can.** The mash-guard toasts have
never once been visible: `toastEl.className = 'chunk say hide'` reuses `.say`,
which `tokens.css` hides whenever an overlay is open — which is exactly when a
toast fires. The break suggestion delivers on the island with the panel down and
so is safe, but anything routed through a toast is landing in a dead channel.

### Where the ratio work got to

Joe: *"for every tile, there needs to be one animal. we can be a bit more relaxed
with that, say 3 tiles for 2 animals."* **Diagnosed, not implemented** — see #50.
The cause is NOT the cost curves, which is where anyone looks first and where I
wasted twenty minutes: `egg` and `tile` are the same curve to within rounding.
The mechanism is `governors.ts` holding an ABSOLUTE difference (`tiles − pets`
bounded to −3..4), which drives the ratio to 1:1 as the island grows. A ratio
target cannot be expressed as a constant difference; the corridor has to become
proportional. Roughly twenty lines, now that the cause is known.

**The autonomous overnight cron was cancelled** on 28 July. It had gone stale —
it was still naming #33, #28, #29, #30 and #31 as the next work, all of which are
done — and Joe is rationing usage until it refreshes.

---

## The overnight run, 27–28 July

Joe went to bed and asked for autonomous work with Fable reviewing plans and
results. Twenty-seven commits. Every merge was Fable-reviewed first and gated on
all six gates; **917 tests** at the time of writing, up from 739.

**What landed, in the order it did:**

| | |
|---|---|
| Reading | word-build to word-find is now **3:1**, at Joe's request. Overrides slice-1 §3's "roughly 50/50". |
| Typography | **the font was never loading.** `challenges.css` had named Andika since the port with nothing bundled and no `@font-face`, so every word Juno has ever read was Roboto — double-storey `a`, straight `l`, the two shapes she is not taught. Now Edu SA Beginner, bundled and precached. |
| Camera | the pivot was pinned at the origin forever; it eases to the island's centroid and a tap on her own land turns the island about that tile. |
| Hatch | the pet model is **warmed a whole egg ahead**. Measured cold: 569.9 ms → 0.2 ms. |
| Species | a five-deep memory primed from `flow.pets`, so **her island is the memory** and a reload cannot hand her the same animal twice. |
| Coast | a floor of dry connections so she cannot wall herself in. **An empirical margin, not a theorem** — see below. |
| Challenge | a corner ×, and the same card comes back rather than re-rolling. |
| Pets | tap target constant across zoom, `clearOf` converges, both random flakes dead. |
| Scenery | shadows under the larger props, the signpost is solid, and **a regression of mine that had broken most of the island's scenery** is fixed. |

**The two things worth reading twice.**

*I shipped a bug that made the island emptier while claiming to fill it.* The
tree work indexed `LEAFY_TREES[(dh >> 5) % length]`, and `hash` is unsigned, so a
signed shift gave a negative index for half of all hashes → `undefined` → a fetch
for `forest/undefined.gltf` → the loader threw → **and the rejection escaped
`sync()`, which loops over every tile.** One bad tree left every hex after it
bare: a nineteen-hex island with scenery on exactly one. My original test could
not have caught it, because it checked that every name in the catalogue exists
rather than that every name CHOSEN does.

*Fable falsified a guarantee we were about to ship.* The dry-connection floor
claimed the island "can never reach a shape it cannot build out of". Fable
produced a 64-tap counterexample through the real tap path. It is now **pinned as
a test that asserts the failure**, so the limit is known rather than forgotten,
and the structural fix is carded.

**Fable earned its place three more times:** it caught a wiring line that no test
defended, where deleting one line would have silently reverted the whole tap-target
fix with 864 tests still green; it found a test whose name claimed a protection it
was not providing; and it found the same signed-shift bug in a comment of mine that
justified a floor the code does not enforce.

---

## Provenance of the playtest quotes

Fable, reviewing the camera and preload diffs, flagged that quotes attributed to
Joe in code comments — *"zoom to location. at the moment zoom and rotation is
only around the origin tile"*, *"preloaded the animal otherwise there is a render
delay and disappointment"* — appear in **no committed document**, and rightly
refused to take them on trust.

They are verbatim. Joe gave them in session on 27 July 2026, alongside the rest
of the playtest notes: the pet tap target, the 3:1 build-to-find ratio, the
challenge X, and the water snooker. They reached the code without ever landing in
a file, which is exactly the gap Fable found. Recorded here so the next reviewer
can verify them rather than having to trust a comment.

The general lesson is worth keeping: **a quotation in a comment is a claim, and a
claim nobody can check is worth less than no quotation at all.** Direction that
arrives by chat should land in `STATUS.md` on its way to the code.

---

## Fable's review of the Phase 4 plan — Joe has a decision waiting

Reviewed overnight, 27 July, against the code rather than against my summary.
Three findings that change the plan; the full reasoning is in the task cards.

**1. The order is wrong, and the repo says so in three places.**
`PHASE3-HANDOVER` §10, this file, and `HANDOFF` §8 all carry the same sentence:
the QA department has still not played it, and that is the highest-value action
available. Phase 4 then schedules five features and a blocked item ahead of her
first session. **That premise expired the same evening** — she has since played
for an hour, and the notes marked "playtest" in the task list are what came back.
The tag half of that argument is also retired — Joe, 27 July: *"curent live
build is v0 as its a pt"*. The live build is a PROTOTYPE, so shipping to it
unpinned is an accepted cost, not an oversight. Stop raising it.

What that does not retire: the schemaVersion rollback hazard is unchanged
(PHASE3-HANDOVER §6) — being a prototype makes shipping FORWARD cheap, it does
not make going backwards safe, so take a backup from the gear before any
rollback. And her save is not a prototype: brief §19 holds whatever the build is
called. Nothing in #28, #31, #33 or #30 blocks a supervised session —
#33 only matters once the island has grown off-centre, and a first session starts
at one tile. The one item that protects her first hatch is #29, because the pet
GLBs are **not** precached (`vite.island.config.ts` has no `globPatterns`) so her
first hatch is guaranteed cold-cache.

Recommended: **#29 → cut the first `v*` tag → session with Juno → let her session
reprioritise the rest.** The tag must come first regardless: production falls back
to `main` today and the service worker is `skipWaiting` + `clientsClaim`, so every
merge lands on her device mid-week, against an unpinned build.

**2. The item I was most worried about was worth worrying about.** #30's spec as
briefed could not achieve its goal — "cannot ring her island in water" is a global
property, "the mirror of `mustBeWater`" is a local six-neighbour rule, and the
local one never fires while a coastline is being *continued*. It would also have
silently banned digging any bay, which is the shape `COAST_EDGES` variant C exists
to draw. The agent was redirected mid-flight to a placement-time floor instead.

**3. The phase named "the release" contains no release engineering** — no tag, no
`npm run channel` against a tagged build, no on-tablet pass, no pre-session
backup. Carded.

Also unresolved and Joe's: **item 13 is blocked but sits inside the release.**
Either v1 ships without adaptive difficulty — Fable argues it should, since
today's fixed difficulty is the v0 behaviour she already plays — or the whole
release inherits the block.

---

## The phases were re-cut on 27 July

Joe: *"item 13 is now in phase 4, hold that. and i think we shold then look at
tilt shift, which has gone missing and the rest we move to phase 5, as we can
ship for release after phase 4 and then patch in phase 5 after."*

So the shape is now:

- **Phase 3** — items 0–6. Done, bar item 6's wiring.
- **Phase 4 — the release.** Item 13 (adaptive difficulty), plus the playtest
  fixes Joe has ruled into it (27 July): a challenge X button that resumes the
  SAME card, preloading the pet model before a hatch, a floor of two dry
  connections so the island cannot be snookered by water, and the album pop-out.
  Ship after this.
- **Phase 5 — the patch.** Juno's own first feature request is in here — she
  wants to change her mind after picking the wrong tile type, which must carry
  her sums over rather than restart the build (brief §19). Tilt-shift has MOVED
  OUT of Phase 5 to the end of Phase 4 (below) —
  Joe, 27 July: *"hold the tiltshift and pack with a lighting rework. we are not
  quite there yet. we put that in early phase 5."* Then items 7–12 and 14–17.

Two things follow that need Joe rather than me.

**Item 7 falls into Phase 5, so the release ships with every pet in its natural
colours.** The variant engine works and is accepted, but item 7 is what wires it
onto live pets — until then it exists only in the Pet-o-matic, behind a dev flag,
in the preview channel. That is a coherent release and it may well be the right
one; it is worth saying out loud rather than discovering at the tag.

**Tilt-shift did not go missing by accident, and re-adding it is a brief
amendment.** `docs/pet-island-lighting.md` §1 says "No post-processing stack on
tablet", and HANDOFF §2 records a previous attempt that reworded §7 to allow a
tilt-shift pass while §1 sat unedited three sections up — named there as
"rationalising, not engineering". The project's own precedent for amending the
lighting brief (§3's shadow-map amendment) requires **measured fps on the target
tablet** plus **a settings toggle**. `?flat` already exists and is reserved for
exactly this. Joe owns the brief and can have the effect; what he should not get
by accident is the pass landing without the fps measurement that protects Juno's
tablet from it.

---

## Phase 3, item by item

| # | Item | State |
|---|---|---|
| **0** | Spec manifest | **Done** (`5071e41`). |
| **1** | Hard save & restore | **Done**, incl. a Fable review and its five fixes. |
| **2** | Clock service | **Done.** |
| **3** | Parity gate deflake | **Done.** 50/50 green in 399s. |
| **4** | Channels & flags | **Done.** Needs Joe's first release tag to mean anything. |
| **5** | Cube-pet material autopsy | **Done.** `npm run pets:atlas`; finding in HANDOFF §6. |
| **6** | Sets & the variant engine | **Done bar wiring.** Colours **accepted** by Joe; eye-whites and pupils in hand. |
| 7 | Progressive album + set unlocks | **Phase 5.** Owns wiring variants onto live pets, and now owns a **shorter ladder** — see below. |
| 8 | Habitats, nursery, wants | Phase 5. |
| 9 | Pet quests v1 | Phase 5. |
| 10 | Daily visitor | Phase 5. |
| 11 | Small ports | Phase 5 — scope grew, see below. |
| 12 | Per-item records + scheduler | Phase 5. |
| **13** | Adaptive difficulty | **PHASE 4 — next.** One question to settle first, below. |
| — | **Lighting review, tilt-shift, more fog, visual options menu** | **END OF PHASE 4.** Joe, 27 July: *"add to this slice lighting review and tilt shift with a bit more fog, on a visual options menu. end of ph4, not immediatly."* The MENU is the settings toggle the lighting brief's amendment precedent requires — so half the bar is met by this card's own scope. What is still missing is **measured fps on the actual tablet**, which nothing in this project has ever had. |
| 14 | Biome & tile ladder | Phase 5. `docs/rock-hexes-proposal.md` is a down-payment on it. |
| 15 | Stardust, Star Pool, first wonder | Phase 5. |
| 16 | Persona simulator | Phase 5. |
| 17 | Blossom enchantment I | Phase 5. |

---

## Waiting on Joe

1. **The first release tag.** Item 4 built the channel split — root is
   production from the newest `v*` tag, `/preview/` is main — but until a tag
   exists production falls back to main, so the split is real in the machinery
   and not yet in what Juno plays. He has said this is 2–3 days out and to keep
   building meanwhile.
2. **The Pet-o-matic veto is DONE.** Joe's verdict on 27 July: the four
   base-coat faults are fixed and *"rest of the animal colouring slice is
   accepted"*. The remaining eye-white and pupil work is specified and in hand.
3. **Enclosed ponds are no longer constructible**, and that is a gameplay change
   he should veto if it is wrong. Confining water to the 19 drawable
   neighbourhoods is what lets the water cell carry its whole beach, which is
   what keeps her fields from being re-cut — but it means water grows as
   coastline and never as a hole in the middle of her island.
4. **Still unjudged by eye:** the rebuilt egg, one-tap tile siting, and the
   grown-ups PIN keypad and menu. Tested, never looked at.

## One question to settle before item 13

`pet-island-difficulty.md` §5 and slice-1 §4 are in the same currency and
disagree. Today one sum banks one unit against a tile costing 1–16. §5 sets
easy = 2, tricky = 3, honeymoon = 4, and Phase 3 adds mastered = 1. The day
item 13 lands, every tile halves in length for an ordinary child — the eighth
tile drops from eleven sums to six — and only the mastered case restores
today's pace. Either the cost curve re-bases or session length halves. This
wants numbers, not a decision in the abstract.

---

## 27 July: the Pet-o-matic verdict, and the coast settled

Three commits, each with all six gates green.

**The pets take their colour properly now.** Four faults Joe reported — panda,
bee, cow, penguin — had one cause between them, and it was the picker counting
vertices rather than surface area (HANDOFF §6). The penguin was a second bug:
normalising against a hue window rather than its own colours pinned it at the
bottom of the ramp. Fixing that revealed a third, contour banding on solid sets,
because the same normalisation amplifies a narrow-range coat 4.8×. Dots are gone
— provably unbuildable in this atlas — the stripe pitch was chosen against the
measured triangle span, and emerald, sky and bluebell were retuned. Verdict:
*"rest of the animal colouring slice is accepted."*

**The offer can be escaped and can be read.** A backdrop tap returns to the
island without costing a thing. And the question was invisible the whole time the
buttons were up, because the CSS hides the say card while any overlay is open.

**The coastline is settled by placement rather than patched by scoring**, which
is what let Joe's "never a full land tile against a coast tile" hold without
re-cutting land she has paid for. See the limits section for what it costs.

## What the last stretch changed

Almost all of it came from Joe playing and reporting. Each change is committed
with its reasoning; `git log` is the long version.

**Save (item 1).** Two copies, checksum, eight snapshots, migrations,
export/import on the gear, `navigator.storage.persist()`. The barrier is a
TYPE: awarding mints a `Committed` token and `ceremony()` demands one, so a
celebration without a completed save does not compile.

Two near-catastrophes were caught here. Juno's existing save is the
pre-envelope shape and the new reader called it "not one of ours" — deploying
as first written would have **wiped everything she owns**. And two concurrent
saves could claim the same revision, letting the older island win and losing a
just-hatched pet *despite* the awaited receipt. Both fixed, both pinned.

**Collision and clipping.** The egg was in nothing's obstacle list, so pets
walked through the one object she is meant to walk up to and tap. It also
"appeared" rather than arriving, because `arrive()` fired at boot while
`placeEgg` waited on prop loading — so it flew in at the origin and teleported.
Every keep-out radius was a guess and always low; all measured now, at walking
height for pets and full footprint for scenery.

Trees inside rocks took two goes: the first fix went into `props.ts`, but the
tiles she BUILDS come through the growing plot, a second placement path with no
overlap check at all. Eight hex-wide pieces cannot fit round one hex — that is
arithmetic, not taste — so grown pieces have their own smaller size.

**The variant engine (items 5–6).** Colour is entirely a texture lookup, so a
set is one recoloured atlas. Getting "which colour is the coat" right took
three attempts and Joe caught each one: a hue rotation does nothing to a white
animal; per-band base detection lets the pale species lose the vote to the 23
others sharing that band; exact-RGB membership banded every animal like a
deckchair. It is per-species now — from `species-base.json`, generated from the
models' own UVs — over a colour REGION rather than a list.

**Feel.** Tapping Fred restarted the intro mid-game; he greets like any pet now
and the story replay moved behind the PIN. Tapping any grass started a maths
round, which made looking round the island a minefield; land is asked for at a
glowing socket, and the socket she taps is where the tile goes — one question
and one tap fewer. The offer no longer shows grass twice.

**The egg** is ten shell pieces that ease apart with every page and fall away at
the hatch, rather than crack decals on a solid ovoid that could never break.

**The grown-ups dialogs** are in the game's own UI — keypad PIN, a menu of
buttons with their consequences, red buttons for the two irreversible things.

---

## Known limits, honestly

- **The coast ceiling is gone, and the price is enclosed ponds.** The old trade
  — walls against cliffs, one fault surviving on an L-bend — is retired, because
  the shapes that caused it are no longer buildable. Exactly 19 of the 64 water
  neighbourhoods can be drawn cleanly, and placement is now confined to those, in
  both directions: grass that would break a neighbouring pond is refused too, and
  a socket that admits neither kind no longer glows. A played-island test builds
  120 islands through the real tap path and asserts not one bad joint. What it
  costs is a pond in the middle of her fields, which cannot be made at all.
- **The ladder is 600 creatures, not ~1,000.** The twelve spotted sets are gone:
  every one of them rendered as stripes, and the atlas provably cannot express a
  spot (HANDOFF §6). Twenty-five sets across 24 species is 600. Item 7 has to
  face that rather than pad it with dilute palettes — that was the first pass and
  Joe rejected it.
- **Per-species textures.** Item 6 builds one texture per (set, species) on
  demand. Fine for the Pet-o-matic; **watch it on the tablet** once a child owns
  many pets across many sets. If it bites, cap the cache — do not change the
  rule.
- **Eye-whites and pupils — the "forced trade" was not forced.** The old claim
  here was that whites could only stay white by keeping white animals white. That
  is true of every rule expressed in COLOUR: protecting the shared sclera texels
  costs a polar bear 25% of its surface, and protecting achromatic pixels costs
  it 69.7%. It is false of rules expressed in GEOMETRY. The face decals are a
  separate flat sheet in front of the head, selectable by topology and normal with
  huge margins, and two of the nine unsampled atlas swatch columns can be reserved
  for them — ~1.7% of area frozen, zero extra GPU bytes, no shader. Measured 0
  drift across 114,975 checks. Being implemented; **not yet seen in a browser**,
  which is its one real risk.
- **Item 3 fixed the flake but the soak runs nightly**, not per push. A single
  green parity run has never been evidence here.
- **`docs/nextphase.zip`** is still in the repo, uncommitted and now redundant.

## Scope discovered, not in the brief

- **The splice law changes shipped behaviour.** Amended brief §3 rewrites
  opening beats 6 and 7, and `script.ts` still speaks `[NAME]`. Agreed: the text
  half folds into **item 11**; the voice half needs the bake pipeline and is
  blocked on Joe.
- **Names are fixed per variant** (Joe's ruling). Recorded in brief §5 and
  voice.md §2. Consequences for items 6–7: the generator moves to build time,
  there is no hatch-time draw, and set order is a reading ladder that cannot be
  reshuffled freely.
- **The legendary ten sets** are deliberately absent — creatures wearing props,
  around 750 challenges in, belonging with the wonders work.
- `voice/scripts.json` is a running ledger: no spoken line reaches the island
  without an entry.
