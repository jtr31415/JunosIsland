# PB-028 — Fred's baked voice reaches the page

*Written 2 August 2026. Read `docs/MANAGER-ORDERS.md` for the job,
`docs/pet-island-voice.md` §3 (the splice law) and §6 (the runtime player) for
the spec, and `docs/handoffs/PB-028-fred-bake.md` for the run that baked the
clips this one plays.*

---

## START HERE

**The previous handoff's last line was "41 clips exist on disk, nothing plays
them." That is no longer true.** Eleven of Fred's seventeen ledger lines now
play as `en-GB-OliverNeural`. Everything else in the game — the teacher, every
challenge word, every pet name, and Fred's other six lines — is on
`speechSynthesis` exactly as it was, and is meant to be.

- **Gates on this tree:** 133 files / 2986 tests, tsc 0, build/smoke/parity
  green. Baseline before this run was 131 / 2935; this run adds 2 files and 51
  tests. Output pasted below.
- **Precache: 8 entries (1284.67 KiB) → 50 entries (1833.25 KiB).** That is
  +41 clips +1 manifest. Verified in the built `dist/island/sw.js`, not merely
  in the config.
- **Four new files, two edited.** No clip was re-baked, no ledger changed, no
  wording changed, `joe/*` untouched.

---

## Exactly which line ids play as Oliver

**Nine whole lines, one clip each.** The ledger text is byte-identical to a
string the shipped code speaks, so the clip says the whole sentence:

| id | what she hears |
|---|---|
| `open.intro` | "I'm Fred. It's just me on this little rock." |
| `open.quiet` | "It's ever so quiet out here." |
| `open.egg` | "Ooh! Look! An egg!" |
| `open.fromTheSea` | "Eggs come from far across the sea… and they only hatch for someone who reads to them." |
| `open.askLand` | "Every new friend needs somewhere to live… can you find us some land?" |
| `land.counted` | "You have found some land for your friends!" |
| `gov.wriggleBreak` | "Ooh, my legs have gone all wriggly! …" |
| `offer.trickier` | "You are doing really well! Would you like some trickier questions? …" |
| `offer.takingAway` | "Would you like to do some taking away?" |

**Two templates, three clips each, spliced at play time:**

| id | chain |
|---|---|
| `gov.spaceSurplus` | `gov.spaceSurplus.head` + `count.<n>` + `gov.spaceSurplus.tail.{one\|many}` |
| `gov.nurseryQueue` | `gov.nurseryQueue.head` + `count.<n>` + `gov.nurseryQueue.tail.{one\|many}` |

The tail is baked both ways because *"1 more friends will fill it up"* is a
sentence a child learning to read must never be shown. All three pieces are
Fred, so the splice is legal — §3 forbids only cross-voice splices, and the
player checks `character` on every piece before it will play a chain.

**`count.1` … `count.20` are baked. A count outside that is not an error**, it
is a normal event: `resolveLine` returns null and the whole sentence goes out
synthetically rather than half-spliced. There is no `count.0`, and
`restoreCount` can return 0.

## Exactly which fall back, and why it is not a bug

**Six of Fred's lines stay on `speechSynthesis`, and this is structural.**
`open.greet`, `open.askRead`, `open.foundName`, `open.homeAtLast`,
`hatch.homeAtLast`, `hatch.isHere`. All six have one cause: the shipped code
speaks the CHILD'S or the PET'S name inside Fred's sentence — `'Oh! Hello,
[NAME].'`, `'[PETNAME] has arrived!'` — and a dynamic name cannot be baked,
which is the entire reason the splice law exists. `voice/scripts.json` holds
the post-splice-law TARGET wording; `src/island/script.ts` holds the old
wording. **Bringing the code into line is item 11 / PB-020's job, not this
one.** Do not "fix" it here: changing what Fred calls Juno is a product
decision and it is Joe's.

Note `open.foundName` is subtler than the other five. Its clip says "You found
its name!" — which is only the PREFIX of the single utterance the code actually
speaks at `src/island/script.ts:51`, `'You found its name! [PETNAME] has
arrived.'`. Item 11 splits that one shipped beat into three chained lines
(Fred, then the teacher saying the name, then Fred). So six baked clips sit in
the manifest unreachable until item 11 lands. That is deliberate; an audit of
"baked but never requested" will find exactly those six and nothing else.

**Everything that is not Fred falls back too, and always did.** The teacher has
no clips at all — the bake was deliberately scoped to Fred (Joe: *"only bake
Fred's voice please"*). Challenge words, pet names, species names and the
album's name→species chain are untouched.

## Two corrections to what I was briefed

My brief was measured by hand and was wrong in two places that cancelled out.
Verify before you build on any of it.

1. **`gov.wriggleBreak` is EXACT in the code and plays.** I was told its text
   was not in the code and to find out why. It is, at
   `src/island/governors.ts:110`, byte-identical, and the feature ships end to
   end (`createBreakWatch` at `governors.ts:460`, delivery at `main.ts` via
   `offerAStretch`). The ledger is right, the code is right, and its lack of a
   `port` field is correct. Nothing was stale and nothing needed fixing.
2. **`open.foundName` does NOT play**, though I was told it did. See above.

9 + 2 + 6 = 17. The deliverable count of 11 was right by luck, not by
measurement.

---

## How it works, and where the seam is

**One seam, one line changed.** `src/island/main.ts` used to read
`const speech = createSpeaker()`. It now reads:

```ts
const speech = createBakedSpeaker(createSpeaker())
const voiceLoaded = speech.load()
```

`createBakedSpeaker` is a **decorator, not a replacement**. It returns the same
`Speaker` interface the game has always been handed, so all six Fred call sites
(`main.ts` 1226, 1414, 1583, 1754, 1961, 2012) and the overlay's tally wrapper
(`overlay.ts:380`) are untouched, and any line it cannot play reaches
`createSpeaker` exactly as before.

**Two new modules:**

- **`src/platform/voice-lines.ts`** (157 lines) — the table. `resolveLine(text)`
  maps a finished sentence to the ordered clip ids that speak it, or null. No
  DOM. The ledger IS the contract: a line reworded in code without the ledger
  simply stops matching and falls back to synthesis, which is the correct
  degradation rather than a crash. A test holds every entry byte-identical to
  `voice/scripts.json`.
- **`src/platform/voice.ts`** (384 lines) — the player. Fetches the manifest,
  decodes all 41 clips, plays chains through Web Audio.

**The template match is proved by re-rendering.** `resolveLine` builds a regex
from the ledger template, captures `n`, then re-renders the template with that
`n` and requires an exact string match before it will accept. A loose regex
match would put a wrong number in Fred's mouth; a test pins it, and removing
the proof turns that test red.

## The seven traps, and what happened to each

1. **Manifest `file` is a repo path**, not a URL. The player strips the literal
   `src/island/public/` prefix and prepends `base`, and **skips any clip whose
   `file` lacks that prefix rather than guessing**. `main.ts` passes NO base, so
   URLs stay document-relative — the house pattern (`createPetField(base = '')`
   at `pets.ts:607`, `createPropField(base = '')` at `props.ts:846`), and it is
   what lets the workbench serve the same assets from root. **Do not "fix" this
   to `import.meta.env.BASE_URL`**: it would be the repo's first use of it and
   it would break the workbench. A test pins that too.
2. **Precache. And there was a second trap under the first one.** Adding `opus`
   took it 8 → 49. But `globPatterns` had no `json`, so
   **`voice/manifest.json` was still not precached** — 41 clips would have sat
   in the offline cache with nothing able to find them, because the player
   fetches the index first and gives up silently when it 404s. Precaching the
   audio and forgetting its index is the same trap wearing a second coat, and
   it is invisible everywhere except a tablet in aeroplane mode. Named
   literally (`'voice/manifest.json'`) rather than `**/*.json`, so a data file
   dropped into publicDir later cannot join the offline bundle by accident.
   **50 entries, 1833.25 KiB**, confirmed by reading the built `sw.js`.
3. **Interrupt semantics.** Every `speak()` — clip path or fallback — stops any
   playing chain AND cancels synthesis first, matching `speech.ts:74`. A
   stopped chain **fires its pending `onend`**, because that is what
   `speechSynthesis.cancel()` does to an in-flight utterance and the game
   chains on it (`album.ts:704`). A `done` latch prevents a double fire.
4. **`onend` belt and braces.** Fires on the last source's `onended`, on error,
   and on a backstop timer — but the backstop is **the chain's real decoded
   duration + 750 ms, not `speech.ts`'s fixed 2500 ms**. Several clips are
   longer than 2500 ms (`open.fromTheSea` 4351, `gov.wriggleBreak` 7955); a
   copied backstop would cut two ceremonies short. A test pins it.
5. **`speak` still returns `boolean`** and the contract is preserved. This is
   why clips are decoded EAGERLY: `speak` cannot await, so until `load()`
   finishes every line falls back — the documented fallback chain, not a fault.
6. **Ogg Opus on older Safari/iOS** is feature-detected by letting
   `decodeAudioData` answer. **No `navigator.userAgent` is read anywhere**, and
   a test greps the source to keep it that way.
7. **Autoplay — the genuinely new failure mode.** The player only claims a clip
   when `ctx.state === 'running'`. Suspended means fire off `resume()` and send
   THIS line out synthetically, so the next one is Oliver. Fred in the wrong
   voice beats Fred not heard at all. A one-shot `pointerdown`/`keydown` unlock
   resumes the context. **The first-run path does have a gesture** — the name
   prompt's button or Enter — but **the story-replay-after-wipe path does
   not**: `save.ts:467` clears `openingSeen` while keeping `childName`, so
   `main.ts` skips `askName` and Fred talks with zero taps on that load. That
   path degrades to synthesis and is the one worth testing deliberately.

**One extra thing I added that was not in the brief.** `boot()` now does
`if (!opening.seen()) await Promise.race([voiceLoaded, wait(1500)])` before the
opening. The opening is eight lines in a row and is the one stretch where a
half-loaded voice reads as a bug rather than a graceful fallback — two lines in
Oliver and six in the device's robot is something Joe would report. Raced
against a cap and never awaited bare, because nothing about the story may wait
on a network. On the common path it costs nothing; the clips land while she is
typing her name.

---

## Is it safe to deploy, and what to listen for

**Yes.** The change is additive and every failure mode lands on the voice the
game already shipped with. There is no path where a line goes silent: a missing
manifest, a 404, malformed JSON, no `AudioContext`, no `fetch`, a codec that
cannot decode, a suspended context, a count past 20, or a forbidden splice all
return the sentence to `speechSynthesis`. `load()` cannot reject.

What Joe should listen for, in order of what would worry me:

1. **The opening.** Beat 1 ("Oh! Hello, Juno.") is the robot — expected, it has
   her name in it. Beats 2, 3, 4, 5 should all be Oliver. **If beat 1 is robot
   and 2 onward are robot too, the clips did not load** — that is the thing to
   report.
2. **The two governor lines.** Let the island go out of balance and tap the egg
   or a socket. "They need homes! **three** more tiles will do it." should sound
   like one man saying one sentence, not three clips stuck together. The 120 ms
   gap either side of the number is the thing to judge. **And check the
   singular**: at exactly one it must say "one more tile", never "one more
   tiles".
3. **Aeroplane mode.** Load once with a network, then turn the network off and
   reload. Fred should still be Oliver. This is the reason the precache numbers
   are in this file.
4. **The offer.** Complete enough to trigger "Would you like some trickier
   questions?" — it is the longest clip that matters and the backstop change
   exists for it.
5. **Ceremonies.** "[Pet] has arrived!" stays robot — expected, item 11.
   "You have found some land for your friends!" should be Oliver.

**One behaviour change he may notice and it is not a fault:** the "Voice: X"
toast is fired by `createSpeaker` when synthesis first speaks. A session where
Fred's lines all come from clips will never show it. That is arguably correct —
no synthetic voice was used — but it is new.

---

## Gate results

```
$ npx tsc --noEmit -p tsconfig.json
TSC EXIT=0

$ npm test
 Test Files  133 passed (133)
      Tests  2986 passed (2986)
   Duration  47.80s

$ npm run build
PWA v1.3.0
mode      generateSW
precache  50 entries (1833.25 KiB)
files generated
  ../../dist/island/sw.js
  ../../dist/island/workbox-9c191d2f.js

$ npm run smoke
ok    reading mode is active
ok    score bar initialised
all boot checks passed
SMOKE=0

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  first spoken      : ["run","got","am","a"]
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically
PARITY=0
```

Precache, before and after, from the same command:

```
before   precache   8 entries (1284.67 KiB)
after    precache  50 entries (1833.25 KiB)
```

Revert checks were run on every load-bearing behaviour and each turned a named
test red before being restored: the running-state guard, the `done` latch, the
fixed-2500 backstop, the splice-law character comparison, the template
re-render proof, the ledger-drift assertion, and both precache globs.

---

## Where the next manager starts

**Item 11 / PB-020 is now the thing standing between six baked clips and the
child.** All six are already on disk, already in the manifest, already in
`NOT_PLAYED` with the reason written next to them in
`src/platform/voice-lines.ts`. When `src/island/script.ts:42,50,51` and
`script.ts:73,74` are ported to the splice-law wording, **the only change
needed in the player is moving entries from `NOT_PLAYED` to `VOICE_LINES`** —
plus, for beat 7, a chain of three lines where there is one today
(`main.ts:1754` speaks one utterance; item 11 needs Fred → teacher's name clip
→ Fred). The teacher has no clips, so beat 7 cannot fully land until her bake
does; `open.foundName` and `open.homeAtLast` are gated on that, the other four
are not.

Two smaller things left deliberately undone:

- **Fred's jaw-flap still guesses.** `main.ts:1757` is
  `fred.talk(Math.min(6, text.length * 0.06))` and `main.ts:1584` is a
  hardcoded `fred.talk(2.2)`. voice.md §6 asks the player to expose a
  `speaking` state, and the decoded buffer knows the real duration. Out of
  scope here; it is the obvious next polish and it is cheap.
- **Nothing waits for a clip to finish.** The hatch ceremony's follow-ups are
  wall-clock (`setTimeout(…, 900)` and `2200` at `main.ts:1433,1451`), not
  speech-linked. That was already true with synthesis, but a clip has a known
  length now and could drive it.

## What I learned that is not in the code

- **`docs/handoffs/PB-028-fred-bake.md` did not exist on my worktree branch.**
  The worktree was cut before the bake merged and was 7 commits behind `main`.
  A fast-forward fixed it. If a compulsory-reading file is missing, check
  `git merge-base --is-ancestor` before concluding it was never written —
  `git log --all --grep` finds it in seconds.
- **`vitest.config.ts` has `environment: 'node'` and no `setupFiles`.** DOM
  tests opt in per file with a `@vitest-environment jsdom` docblock. jsdom does
  not implement `AudioContext` at all, and its `HTMLMediaElement.play()`
  returns `undefined` rather than a Promise — so a jsdom audio test would be
  testing the "no clips" path and proving nothing. Inject the context and
  assert on what was scheduled; `tests/platform/audio.test.ts` is the
  precedent and both new test files follow it in the `node` environment.
- **`npm run smoke` and `npm run parity` never load the island.** Both drive
  the 2D words game in jsdom. Island coverage is `tests/island/*` only. A green
  smoke says nothing whatever about island audio.
- **A test that greps its own source can be broken by a comment.** The "never
  reads `navigator.userAgent`" test failed first time because the docblock
  explaining why it does not read one contained the literal string. Worth
  knowing before editing that comment.
- **`src/platform/audio.ts`'s lazy-context pattern cannot be copied wholesale.**
  `decodeAudioData` is a method on a context, so one must exist at load time,
  before any gesture. The laziness is bought back by the unlock listener plus
  the per-line running-state guard, and `voice.ts` says so in a comment.

## Decisions

**RAISED into the workbench: none.** I may not write `joe/tasks.json` while
other managers are live. One item is in my report to the drumbeat for central
application: a card for the jaw-flap and ceremony timing now that clip
durations are known.

**PICKED UP: none.** No `type: "ruling"` task was `done` with a note this run.

**Judgement calls made, in case they need reversing:**

- **Interrupt ordering differs slightly from real `speechSynthesis`.**
  `cancel()` fires the `end` event asynchronously; `stopChain()` fires the
  pending `onend` synchronously, before the replacement line starts. For a
  chain-inside-`onend` (`album.ts:704`) that means the outer `speak` wins where
  today the nested one would. Chosen because `speak` is synchronous and the
  latch bounds it, and `current` is detached before firing so a nested `speak`
  never sees a half-stopped chain. It cannot bite today — the album's chain is
  pet names and species, neither of which has a clip.
- **The 1500 ms opening wait** is mine, not the brief's, for the reason given
  above. Delete the one line in `boot()` if it is not wanted; nothing else
  depends on it.
- **`SLOT_GAP_MS = 120`** is voice.md §3's "~120ms" taken literally.
  **`BACKSTOP_MARGIN_MS = 750`** is slack over the computed chain length for
  output latency; it is a guess and Joe's ear beats it.
- **The manifest's `ms` is not read at play time.** `AudioBuffer.duration` is
  the source of truth for both scheduling and the backstop. `ms` remains a
  bake-time cross-check.
