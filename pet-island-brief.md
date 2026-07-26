# Pet Island — Build Brief (consolidated, final)

The single founding document. Its only companion is **`junos-words.html`** — the
field-tested 2D game that is the **reference implementation for all learning
logic**. Where this brief and that file disagree on learning behaviour, **the
file wins**. No other document is required.

Audience: ages 5–10, UK English, Read Write Inc school context, multiple player
profiles. Platform: browser — Vite + Three.js, PWA (installable, offline-capable,
hosted URL). No server, no accounts, no telemetry, ever.

---

## 1. Vision & principles

1. **Diegetic learning.** Reading and maths are not chores that earn rewards;
   they are the mechanism of the world. Eggs hatch when read to; land exists
   because it was counted up.
2. **Bright, never scary.** Cosy diorama warmth. Spooky ceiling = Scooby-Doo.
3. **Ownership, never FOMO.** No timers, no streaks, no expiring content, no
   loss mechanics. Collection and visible growth are the engagement engine.
4. **Port, don't rewrite.** `junos-words.html` holds months of field-tested
   logic and the child's exact curriculum state. Extract it into modules (§7);
   never re-derive it from prose.
5. **Systems over content.** Longevity comes from the curriculum ladder, the
   mastery scheduler, the variant pet space, and player-built land — not from
   hand-authored levels. There is no level designer; there is a generator.
6. **One art director.** The Kenney/KayKit flat chunky language rules (§15).

## 2. The game in one paragraph

One orbitable diorama island built from hex tiles. Eggs arrive — from reading
rewards, the daily visitor, and rare tile events — and **reading challenges
hatch them** into cube pets that live on the island forever: wandering,
tappable, name-sayable, dressable. **Maths challenges earn hex tiles** which the
child places herself, growing the island and forming biomes. Pets have home
biomes: a freshly hatched shark waits hopefully in the nursery until a water
hex exists for it. Pets ask for words in speech bubbles. The album records
everything. No levels, no doors, no navigation — the island *is* the
progression. There is no player avatar: **the finger is the player.**

## 3. The opening — Fred's Lonely Rock

Twenty seconds, tap-to-advance, fully TTS-voiced, plays once per profile,
skippable, replayable forever by tapping Fred ("tell me again?").

Scene: calm sea, one hex, Fred the frog sitting, gentle waves.

1. "Oh! Hello, [NAME]."
2. "I'm Fred. It's just me on this little rock."
3. "It's ever so quiet out here."
4. *(an egg bobs ashore — plink)* "Ooh! Look! An egg!"
5. "Eggs come from far across the sea… and they only hatch for someone who
   **reads to them**."
6. "Will you read to it, [NAME]?" → first word-find (one word) → the egg cracks.
7. "You found its name! **[PETNAME] was coming home all along.**"
8. "Every friend you read home needs somewhere to live… can you **count us up
   some land**?" → first sum → first pick-of-three tile → placement → move-in
   celebration → free play begins.

**Standing world-law vocabulary** (all first-use lines, hatch lines,
want-bubbles): eggs *hatch when read to*; pets *come home* when their name is
read; land is *counted up*. Hatch variants: "[PETNAME]! Home at last!",
"Another friend, home safe!"

**Fred: the asset.** Built in code from primitives in the Cube Pets design
language (CC0 derivative): green body cube, two protruding eye-cubes on top
(the frog silhouette), painted wide-smile face decal, stubby feet, Kenney
palette greens. Slightly larger than collectible pets + a small leaf hat so he
reads as *character, not catchable*. Procedural animation for free: hop =
squash-stretch, talk = jaw-flap while TTS speaks, blink = eye scale, point =
lean. Fallback: 30-minute Blender kitbash from a cube-pet template. Fred is
unique and never appears in the album; a hatchable frog *species* may arrive
later as a special event.

## 4. Core loop & economy

- **Reading / word-building → eggs hatch.** The 2D game's egg-progress mechanic
  becomes literal: find/build words to crack the current egg (~10–15 correct
  answers per hatch, tunable).
- **Maths → hex tiles.** Each solved sum banks a tile. Spending it: the child is
  offered **three tile types, picks one**, then taps any pulsing empty socket
  adjacent to the island. Tile drops in with bounce + particles.
- **Habitat coupling.** Every pet has a home biome. No suitable tile yet → the
  pet waits visibly and cheerfully in the nursery with a want-bubble ("Sharky
  needs water!"). A want, never a punishment. Placing the right tile → move-in
  celebration. *(This coupling replaces the 2D game's lantern/battery economy —
  the battery is retired; do not port it.)*
- **Pet quests.** Resident pets periodically raise speech bubbles requesting a
  word ("find me *jump*!"), a built word, or a sum ("I'm hungry for **7 + 5**
  berries!"). Completing = affection hearts, occasional gifts (hats,
  decorations, rare eggs).
- **Biomes.** Three or more same-type adjacent tiles form a biome with an
  upgraded look (water cluster → cove with waves, blossom cluster → unicorn
  glade). Biomes map to the seven established themes; halloween/christmas tile
  types and visitors ride the real calendar.

## 5. The pet system

- **Variants, not meshes:** base = Kenney Cube Pets (24 species). Identity =
  species × palette (8) × pattern (plain/spotty/stripy/starry) = **768 pets**
  before sizes, golden/sparkle rarities and hats. Palette + pattern are
  shader/texture parameters on flat-faced cubes; the face decal (the soul)
  stays constant per species.
- **Procedural decodable names** from the child's *taught graphemes* (reuse the
  alien-word generator): every pet is a Bimo, a Sheptun, a Corbell. The name is
  shown large at hatch, spoken via TTS, tappable forever after.
- **Album** = the sticker book grown up: silhouettes for undiscovered species,
  variant galleries, counts. Pets are never lost or taken.
- **Behaviour:** simple wander on owned hexes constrained to home biome, idle
  bobs, tap → bounce + name speech + affection. No needs decay, no hunger
  timers, no death — wants only ever add, never subtract.

## 6. Architecture

```
┌─────────────────────────────────────────────┐
│  World layer (Three.js canvas)              │  hex island, pets, eggs,
│  orbit camera, tap raycast, celebrations    │  seasons, Fred
├─────────────────────────────────────────────┤
│  Learning layer (DOM overlay)               │  ported 2D engine: word-find,
│  opens over the canvas at challenge points  │  tiles, number pad, Fred talk
├─────────────────────────────────────────────┤
│  Data layer                                 │  curriculum packs, mastery
│  content packs (JSON), saves, scheduler     │  store, island state, profiles
└─────────────────────────────────────────────┘
```

Stack: Vite + Three.js + vanilla TS/JS, GLTF assets, no physics engine, no
shadow maps, no post-processing. The learning overlay stays ordinary DOM
(accessibility, infant font, existing components). Saves: per-profile JSON in
localStorage, versioned keys, plus export/import blob behind the grown-up gear.

## 7. Port map from `junos-words.html`

Extract these as tested modules, preserving behaviour exactly:

| Module | Source in the 2D file | Notes |
|---|---|---|
| `wordlists` | `GREEN`, `RED` (bracket markup), `CONFUSABLE` | Bracket = tricky bit. Keep the editor-JSON round trip. |
| `segmentation` | `parseMark`, `plainWord`, `GRAPHS`, `markDigraphs` | Powers underlines AND grapheme tiles. |
| `decks` | `makeDeck` + draw functions | No-repeat-until-exhausted dealing. |
| `neighbours` | `lev1`, `NEIGH` builder | Near-twin distractors (sat/sit). |
| `alien` | `AL_*` pools, `alienWord`, `REAL_BLOCK` | Screening-check pseudo-words — now ALSO the pet-name generator. |
| `speech` | `pickVoice` (en-GB ranking), `speak(txt, rate, onend)` | Keep onend chaining + the 2.5s stuck-engine fallback. |
| `fred` | `FRED_SOUNDS`, `fredTalk` | Sequential grapheme sounding with paced highlights. |
| `challenges` | word-find round, `renderBuild` tiles, `renderSum` + number pad + dot hints | Become overlay screens. Keep: neighbour injection, mash detection (3 wrongs → mode-specific rescue + input lock), dead-zone philosophy, auto-advance with reward-hold sequencing. |
| `profiles` | `PROF_KEY`, per-player save keys, picker, avatar chip, gear delete | Each player owns an island. |
| `collection` | `STICKERS` machinery, hatch/visitor/befriend/day-latch, album | Retheme: stickers → pets; visitor waits in its home biome. |
| `celebration` | particle engine, spectacles, praise banner, spoken names | Particles port to a screen-space canvas above the 3D view. |
| `economy` | battery functions, PIN gear (daily DDMM) | Battery **retired** (§4); the PIN gear pattern ports for the dashboard. |

## 8. The curriculum ladder ("quest level")

Bands gate which generators and pools the scheduler may use. Bands are **data,
not code** — each is a JSON content pack (word pools with tricky-bit markup,
grapheme inventory, fact families, sentence templates).

| Band | Reading | Maths |
|---|---|---|
| 1 | Phase 2–3 decodables + first tricky words (current lists) | Add/sub within 10 |
| 2 | Phase 3–4, digraph-heavy, alien CVC | Bridging 10, add/sub to 20 |
| 3 | Phase 5 alternatives (ai/ay/a-e…), Y1 exception words, alien CCVC | Bond fluency, missing-number sums (3 + ▢ = 8) |
| 4 | Two-syllable words, suffix basics (-s, -ing, -ed) | Doubles/halves, counting in 2/5/10 |
| 5 | Y2 common exception words, simple sentences ("read and do") | 2, 5, 10 times tables; simple money |
| 6 | Y2 spelling rules, sentence comprehension | 3, 4, 8 tables; division as sharing |
| 7 | Polysyllabic decoding, homophone choice (their/there) | All tables to 12; fractions ½ ⅓ ¼ |
| 8 | Short passage + question | Time, mixed word problems |

**School-list import:** the word-list-editor JSON pattern extends to packs —
paste the week's spelling list from school and it becomes a featured quest
strand that week. Headline feature; build the import UI early.

## 9. The mastery scheduler

Per-item record: `{id, seen, correct, streak, avgMs, lastSeen}` for every word,
grapheme and number fact. Selection weighted: due-for-review items
(Leitner-style boxes, intervals ~1/3/7/21 sessions) mixed ~70/30 with new items
from the active band. Mastered items (streak ≥ 4, fast) retire to rare review;
struggling items resurface in gentler contexts first (a struggled word appears
as a *tile-build* before it reappears as a *find*). Never show the child
failure statistics — the world simply keeps offering the right practice.

## 10. Learning engine screens (ported, unchanged)

All challenges open as the DOM overlay: word-find with neighbour distractors,
alien words, grapheme-tile building with Fred talk, number pad with fives
colour-blocking and dot hints, tricky-bit wavy underlines, digraph solid
underlines, frustration-mash rescues, input dead zones, TTS throughout.
Curriculum bands, scheduler and school-list import (§8–9) govern content;
automatic escalation (§12) governs progression.

## 11. Learning tricks & the Owl's Book

A friendly owl on the island keeps the reference book — diegetic, tappable,
spoken.

- **Maths fact families:** *ten pairs* (number-bond rainbow, 0–10), *five
  pairs*, *doubles* (1+1…10+10), *near-doubles* (double ± 1, Band 3+),
  *make-ten bridging* (8 + 5 → 8 + 2 + 3, short animation). **Reading walls:**
  the sound wall (taught graphemes, tap to hear) and the tricky-word wall.
- **Reference = progress artefact.** Family pages colour in as the scheduler
  confirms each fact; completing a family triggers a **golden egg ceremony**
  ("You know ALL the ten pairs!").
- **Solution pings.** When a correct answer instantiates a family fact:
  "7 + 3 — a ten pair! ⭐" with jingle, rainbow flash, TTS. Rules: correct
  answers only; max ~1 ping per 2–3 sums; auto-dismiss ~2s; never blocks flow;
  tone = *naming a superpower*, never instruction. Bridging sums may ghost the
  make-ten decomposition for 1.5s. Wrong answers never ping.
- **Scheduler hook:** families are tags; an in-progress family gets a gentle
  generation bias so its rainbow visibly advances.

## 12. Parent dashboard & automatic escalation

- **Escalation is automatic by default.** The scheduler promotes sub-skills and
  bands on mastery thresholds (≥90% of a family at speed → next strategy;
  phonics phases graduate by grapheme coverage). Every promotion is date-logged.
- **Parent modes behind the PIN** (daily DDMM, ported): *Auto* (default) ·
  *Hold* (consolidate) · *Manual* (pin a band). School-list import runs as a
  parallel strand in every mode.
- **The dashboard** (PIN-gated, strictly local): band position + promotion
  timeline, per-family coverage rainbows, wobbliest-items list,
  challenges-per-session trend, reading/maths balance, per profile; JSON/CSV
  export via download. **No server, no accounts, no telemetry** — a feature.
- **Child-facing escalation** is quiet and positive only ("new kinds of sums
  have appeared on the island!") plus golden-egg ceremonies. The child never
  sees levels, percentages, or failure statistics.

## 13. Attention economy — no idle faucets

- **Time on the island produces nothing.** No passive income, no background
  eggs, no offline progress, no breeding. Watching is lovely and economically
  sterile; the island cannot grow without a completed challenge.
- **Watch-mode is the invitation surface:** pets raise quest bubbles, the
  nursery want is visible, the current egg wobbles when workable, visitor
  offers are challenge-gated. The island continuously, gently *asks*.
- **The richest moments are post-challenge afterglow** — happy dances, gifts,
  move-ins.
- Tuning knobs (bubble frequency, egg cadence) and the challenges-per-session
  metric live in the gear/dashboard.

## 14. World tech

Hex grid on axial coordinates; tiles as instanced meshes. Camera: orbit +
pinch-zoom with gentle limits; tap-raycast for tiles/pets/eggs/sockets. The
**juice pass is mandatory art direction**: gradient sky per season, soft fog,
blob shadows, warm key light, vignette. Perf: mid-range Android tablet at
60fps; instancing keeps hundreds of tiles and dozens of pets cheap (batch per
biome, or one mega-atlas with per-instance palette offset). Week-one dev
tooling: debug free-cam, inspector panel, and the **Pet-o-matic** (a dev page
cycling every species × palette × pattern for human veto).

## 15. Art direction & assets (procurement decided)

**Style bible** — every asset, sourced or generated, must pass all of: chunky
low-poly with rounded silhouettes, readable at arm's length on a 10" tablet;
flat colour / simple gradient-atlas texturing (no photo textures, no PBR); 
friendly by default (faces smile; strip or ignore weapon content in packs);
saturated-but-soft per-theme palettes inherited from the 2D game; one warm key
light; one foundation style — anything off-style is retinted to match or
rejected.

**Purchased/downloaded (final list):**
- Kenney **Cube Pets** (core pet species, free, CC0)
- KayKit **Medieval Hexagon Pack — Source tier ($15)** (world tiles; .blend
  sources for shoreline splits and seasonal variants)
- KayKit free tiers: **Forest Nature, Holiday Bits, Halloween Bits, Space Base
  Bits** (biome props)
- Kenney: **UI Pack, Game Icons, Particle Pack, UI Audio, Music Jingles**
- **Andika** font (OFL; single-storey *a*) for all learning text
- **Fred is code-built, not purchased** (§3)

**Recolour pipeline (P0 tooling):** KayKit's gradient-atlas convention means
recolouring = repainting swatch rectangles — map swatch regions once, define
per-biome palettes in JSON, script mints atlas variants (grass→sand/snow/pink).
Cube-pet variants = per-pet {base colour, pattern mask, pattern colour}
composited in-shader or onto a canvas texture at spawn. gltf-transform
optimisation pass on all imports.

## 16. Perpetuity summary

Curriculum ladder (years of material) × mastery scheduler (self-tuning) ×
768-pet variant space × player-authored island growth × seasonal calendar ×
verb unlocks over time (new tile types, decorations, pet interactions,
**archipelago**: new islands at band milestones). No content treadmill.

## 17. Milestones

- **M0 — Extraction.** The §7 module list out of the 2D file into a tested
  `core/` package; **the 2D game keeps shipping from these modules** — that is
  the proof the port is faithful. Unit tests: deck dealing, segmentation,
  alien/name generation, neighbour map, scheduler.
- **M1 — Island grey-box.** Hex place loop (earn → pick-of-three → socket →
  bounce), one cube pet wandering, one egg hatching via a word challenge,
  code-built Fred v0, the opening script wired (text + TTS), orbit camera,
  juice pass v0, debug tooling. *The pivot lives or dies on how M1 feels.*
- **M2 — Pets & wants.** Variant system + Pet-o-matic + name generator +
  album, habitat coupling, nursery, pet quests v1, daily visitor egg,
  celebrations ported.
- **M3 — The ladder.** Bands + automatic escalation, mastery scheduler, the
  Owl's Book with fact families and solution pings, parent dashboard,
  school-list import, profiles/islands, save export.
- **M4 — Dress & seasons.** Biome art pass, seasonal tiles/visitors, audio
  pass, tablet perf pass, archipelago hook.
- Ship M1 to the QA department immediately; her verdict outranks this document.

## 18. Guardrails (non-negotiable)

- No time-limited content, no streak loss, no dark patterns of any kind; §13
  applies in full.
- Wants never decay into needs; no timers on eggs, tiles or quests; nothing a
  child owns can be lost, stolen or expired; sibling profiles cannot affect
  each other's islands.
- Wrong answers cost nothing but a wobble; three stumbles summon help, never
  shame. The child never sees failure statistics.
- No darkness-as-threat; no peril in story or art.
- All child-facing text UK English, reading-age appropriate; name
  personalisation per profile.
- localStorage saves + manual export; no accounts, no network calls beyond
  static hosting, no analytics.
- **The 2D game stays installed and working until the QA department voluntarily
  migrates.** Do not Osborne the incumbent product.
