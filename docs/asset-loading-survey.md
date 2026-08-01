# Asset loading — the survey PB-048 asked for

*Written 1 Aug 2026 by the drumbeat. PB-048 says **"investigation/discussion
first on how to cleverly serve the game to balance memory and runtime load lag,
given all the audio, flora and fauna."** So this file measures the ground and
ends in questions. **Nothing here was built.** The decisions are Joe's.*

Measured against the real `npm run build` output, not estimated.

---

## 1. What ships today

`dist/island` is **7.5 MB across 321 files**.

| Category | Size | What it is |
|---|---:|---|
| `pets/` | 3.38 MB | 24 Kenney animal GLBs + textures |
| `forest/` | 1.54 MB | bushes, trees, ground cover |
| JS (one chunk) | 1.26 MB raw / **297 KB gzipped** | the whole game, including the parts bank |
| `props/` | 730 KB | hexes, mountains, hills, clouds |
| `tiles/` | 108 KB | the four seasonal atlases |
| **audio** | **0 bytes** | — see below |

### The card's premise is out of date in one respect: there is no audio

PB-048 says *"given all the audio, flora and fauna"*. **No audio ships at all.**
`voice/` contains `scripts.json` and nothing else; there is not one `.mp3`,
`.wav`, `.ogg` or `.m4a` anywhere in `src/` or `dist/`. Speech is synthesised
through Azure at runtime (JT-002, JT-003), and the 43 recorded phonemes are
**JT-006, still open**.

So audio is not a current weight — it is a **future** one, and it is the only
category whose size is still entirely in Joe's gift. That matters for the
questions at the end: decisions taken now about how models are served will be
much harder to revisit once a few hundred voice clips exist alongside them.

---

## 2. The scale question, which is the one that actually matters

The roster targets **~296 new species on top of the live 24**. The natural fear
is that this multiplies the 3.38 MB `pets/` folder by twelve. **It does not, and
the kit architecture is why.**

- The 24 live species are Kenney GLBs: `3.38 MB ÷ 24 ≈ **141 KB each**`.
- New species are **not GLBs**. They are assembled from a shared parts bank:
  `bank.generated.ts` is 500 KB of source, shared by everything, and each
  species is a definition file. There are 16 in
  `src/island/species/parts/assembled/`, averaging **~9.9 KB of source each**.

| Route | Marginal cost per species | 296 species |
|---|---:|---:|
| A Kenney GLB each | ~141 KB | **~41.7 MB** |
| A parts definition each | ~9.9 KB source | **~2.9 MB source** |

**So the expensive problem is already solved**, and it was solved by the kits
rather than by anything to do with loading. Roughly a fourteenfold saving, and
the gzipped share is smaller again — the definitions are repetitive source, which
compresses far better than binary geometry.

**But it lands in the wrong place.** Those definitions compile into the **single
eager JS chunk**. `dist/island/assets/` holds exactly one `.js` file. So today
every species she has never unlocked is parsed at boot — and JT-027 caps her at
**four open collections**, meaning the overwhelming majority of that work is for
animals she cannot see.

Projected onto today's shape, ~2.9 MB of extra source in one eager chunk is the
thing to worry about, not the megabytes. **This is the first real question for
Joe** — though note it is a question about *when*, since the code-splitting seam
(a collection) already exists and is already the unit she unlocks.

---

## 3. The finding that was not on the card: the game does not work offline

`vite.island.config.ts:69` precaches:

```
globPatterns: ['**/*.{js,css,html,woff2}']
```

There is **no `runtimeCaching` block at all**. Confirmed against the built
service worker: **8 precache entries** — 2 JS, 1 HTML, 1 CSS, 3 fonts, 1
manifest.

**Not one 3D model is cached, by either route.** So on a tablet with no
connection the app boots to a shell — the JS, the CSS and the fonts are
there — and then cannot load a single animal, tile, tree or mountain. The
5.7 MB that *is* the game is fetched from the network every time it is not in
the browser's own HTTP cache.

This is stated as a measurement, not a bug report, because whether it matters
depends entirely on how Joe expects her to play (question 3 below). It is
recorded here rather than filed as a card so as not to invent work he has not
asked for — but if the answer to question 3 is "she plays offline", this is the
single most important thing in this document.

---

## 4. Where the time actually goes on a cold boot

Worth stating plainly, because it shapes which fix is worth anything:

- **297 KB gzipped of JS** must arrive and parse before anything renders. That is
  the floor on first paint and it is the number that grows with the roster.
- **`pets/` is 3.38 MB and she can hold at most a few animals early on.** A new
  child needs one animal, not 24. This is the largest single category and the
  one with the loosest coupling to what is on screen.
- **`forest/` at 1.54 MB is loaded for scenery**, which appears on every tile
  and so is genuinely needed early.
- PB-055 has already removed one duplicate loader here: the album was re-fetching
  up to 3.26 MB of GLBs the island already held in memory. **Worth checking for
  siblings of that bug before adding machinery** — it cost nothing to fix and
  bought more than any strategy below would.

---

## 5. The questions for Joe

Each is meant to be answerable in a sentence. Nothing is built on any of them.

1. **Does an unopened collection ship to the device at all?** Today everything
   ships and is parsed at boot, and she can only ever have four collections open.
   The alternative is to split each collection so it arrives when it unlocks —
   which trades a smaller boot for a wait at the moment a new album opens. That
   moment is a reward, so a spinner on it is a real cost, not a technical detail.

2. **Is a longer first boot acceptable in exchange for no waiting later?** The
   opposite trade: fetch more up front while she is still being introduced to the
   island, so nothing ever stalls mid-play. This suits a tablet that is set up
   once by an adult and then handed over.

3. **Do you expect her to play with no connection?** This decides whether the
   §3 finding above is a defect or a non-issue. If yes, models need caching and
   that is a real piece of work. If she is always on wifi at home, today's
   behaviour is fine and nothing needs doing.

4. **When the recorded voice arrives (JT-006, 43 phonemes), does it ship with
   the app or stream?** Best answered now rather than after the recordings exist,
   because it is the one category whose shape is still entirely open — and
   phonemes are small, numerous, and needed with low latency, which is a
   different problem from a big model loaded once.

5. **Is there a device you are actually targeting?** Every trade above is
   different on a 2019 iPad than on a current one. A single named device turns
   most of these from opinions into measurements.

---

## 6. What a future run should NOT do

- **Do not add a caching or splitting strategy before question 3 is answered.**
  Offline support and lazy-loading pull in opposite directions; building either
  first makes the other more expensive.
- **Do not assume the roster needs a loading strategy at all.** The kits already
  turned ~41.7 MB into ~2.9 MB of source. The remaining problem is *eager
  parsing*, which is a bundling question, not a serving one.
- **Do look for more duplicate loaders first.** PB-055's was worth 3.26 MB for a
  few lines, which is better than any architecture in this document.
