# PB-028 — Fred's voice is baked

*Written 2 August 2026. Read `docs/MANAGER-ORDERS.md` for the job, and
`docs/pet-island-voice.md` for the spec this implements — §3 is the splice law
and it governs everything below.*

---

## START HERE

**41 clips of Fred exist on disk. Nothing in the game plays them.** That is the
honest state, and the next piece of work is the player, not more baking.

- **Tests:** `tests/tools/voice-script.test.ts` — 29 tests. Gates on the final
  tree: **129 files / 2888 tests**, tsc 0, build/smoke/parity green.
- **Clips:** `src/island/public/voice/script/*.opus` — 41 files, 547 KB,
  66.2 seconds of speech, Ogg-encapsulated Opus straight from Azure.
- **Manifest:** `src/island/public/voice/manifest.json` — `id → {file, ms,
  bytes, hash, character, voice, rate}`, 41 entries, every `ms` measured.
- **Command:** `npm run voice:bake` (`--dry-run`, `--force`, `--only <prefix>`).
- **Scope:** Fred only. Joe: *"only bake Fred's voice please."* The teacher's
  one line and her three families (`name.` ~1000, `word.` ~700, `species.` 24)
  are untouched, and so is `phoneme.` (dad, blocked on Joe).

---

## What was actually built, and why it was a build job

`bake.mjs` **did not read `voice/scripts.json` at all.** The bake console was
wired to LESSONS (`tools/workbench/lessons.mjs`), and the ledger of every spoken
line in the game had no consumer whatsoever — it was written, kept current by
tests, and never rendered. **PB-028's card said the voice half needed "this bake
pipeline and Joe's key". The key was never the only blocker and the card is
wrong to imply it was; the pipeline had no path from the ledger to Azure.**

Three files carry the change:

- **`tools/workbench/script.mjs` (new)** — turns `voice/scripts.json` into bake
  units of exactly the shape `bakeOne` already took, so the staleness contract,
  the manifest and the measured `ms` all applied for free.
- **`tools/workbench/bake.mjs`** — generalised in three small ways: `castFor`
  picks the cast entry by the unit's `character` (a lesson has none and defaults
  to `fred`, so console behaviour is unchanged); `outPath` accepts a full
  repo-relative `out`; and `ssml` now trims Azure's silence (below).
- **`tools/workbench/bake-script.mjs` (new)** — the CLI.

### The two templates, which are the interesting part

`gov.spaceSurplus` and `gov.nurseryQueue` are **never baked as written**. Each
cuts into a head, a spliced numeral, and a tail — **and the tail bakes twice:**

| id | text |
|---|---|
| `gov.spaceSurplus.head` | "Let's read with the egg —" |
| `gov.spaceSurplus.tail.one` | "more friend will fill it up!" |
| `gov.spaceSurplus.tail.many` | "more friends will fill it up!" |
| `gov.nurseryQueue.head` | "They need homes!" |
| `gov.nurseryQueue.tail.one` | "more tile will do it." |
| `gov.nurseryQueue.tail.many` | "more tiles will do it." |

The singular form is not decoration. **"1 more friends will fill it up" is a
sentence a child learning to read must never be shown**, which is why the ledger
spells the noun out as `{friend|friends}` rather than the code bolting on an
`s` — a plural rule in code is a rule that will one day meet a word it is wrong
about, in front of her. `splitTemplate` throws if a brace survives the cut, so a
clip can never be baked with `{n}` inside it.

The seams sit on natural pauses per §3: the em dash, and the exclamation.

### The numerals are Fred's, and that is a law not a preference

`count.1` … `count.20`, twenty clips, baked from the WORDS ("one" … "twenty")
rather than from digits, so what is synthesized is what was audited. They are
Fred's because §3 forbids cross-voice splices and the teacher counting inside
Fred's sentence would be exactly the splice the law forbids.

**The family is unbounded in principle.** Twenty covers every count the corridor
can ask for in ordinary play; a number with no clip must fall back to Web Speech
(§6), not fail. Nothing enforces that yet because nothing plays clips yet — it
is the player's job and it is listed below.

### Arithmetic, verified rather than trusted

18 lines in the ledger, 17 of them Fred's (`open.nameSlot` is the teacher's).
Of Fred's 17: **15 whole sentences + 2 templates → 6 pieces + 20 numerals = 41.**
`npm run voice:bake -- --dry-run` prints the list; a test pins the count at 41
against the real file.

---

## Five things I had to fix that were not in the brief

### 1. Azure pads every clip with about a second of silence

Measured: a bare "one" came back **1454 ms** for roughly 450 ms of speech.
Baked as whole lines that is merely wasteful. Baked as the numerals that get
SPLICED into Fred's governor sentences it is **fatal** — "Let's read with the
egg —" [a second of nothing] "three" [a second of nothing] "more friends will
fill it up!" is not a sentence anyone would recognise as speech.

`ssml()` now emits `<mstts:silence type="Leading-exact" value="0ms"/>` and
`Tailing-exact`, which hands the whole of the timing to the player — where §3
puts it, since the ~120 ms slot gap is the player's to insert and it cannot
subtract a gap Azure has already baked in. **"one" went 1454 ms → 320 ms.**

**Landmine for whoever edits `ssml()` next: `bakeHash` covers script, voice,
rate and pitch — NOT the shape of the SSML.** Change the markup and nothing goes
stale on its own. Re-bake with `--force`, deliberately.

### 2. `.gitattributes` had no rule for `*.opus`

It pins `*.glb`, `*.bin` and `*.png` as binary but everything else falls through
to `* text=auto eol=lf`. An untagged `.opus` on Windows is how a clip reaches CI
unplayable — the exact shape of the landmine already in `MEMORY.md` about LF and
CRLF. `*.opus binary` and `*.ogg binary` are now declared. **This had to land
before the first clip did.**

### 3. `ms` looked wrong, and was not

Several clips reported an identical `1720 ms / 14237 B`, which is not credible
for texts of different lengths. I checked rather than assumed: a scratch script
walked every Ogg page forward in all 41 files and compared against
`opusDurationMs`. **All 41 agree exactly**, the backward scan finds the true
last page in every file (no false `OggS` match inside payload data), and every
file's pages consume exactly its byte length. The coincidence is Azure emitting
fixed 4213-byte pages, so page count quantises duration and length together.
`opusDurationMs` is sound and `ms` is trustworthy.

### 4. `splitTemplate` could still let a brace reach Azure

The "a slot survived the cut" sweep only ran inside the noun-pair branch. A
template whose tail had no `{a|b}` returned early, so a slot in the **head** was
never checked — `splitTemplate('{who} says — {n} more friends arrive.')` handed
back `head: '{who} says —'` and Azure would have read the braces out loud.
Both of today's templates happen to carry noun pairs, so both reached the guard.
**That is luck, not correctness**, and it is the exact shape of hole that stays
invisible until the line nobody has written yet arrives. The sweep now runs over
every piece on every path.

### 5. `opusDurationMs` could return a confident wrong answer, or throw

Three faults in one backwards byte-scan, all of them contradicting the
function's own docstring:

- It searched raw bytes for `OggS` from the end and trusted the first hit.
  Opus payload is arbitrary compressed data, so a payload containing that
  sequence was read as the final page header and a **garbage granule taken out
  of the audio** — a plausible-looking wrong `ms` in the manifest.
- A truncated download whose last `OggS` fell within 14 bytes of the end made
  `readBigUInt64LE` raise a **RangeError** rather than return null, by which
  point the clip is already on disk.
- A final granule of `-1` — legal Ogg for a page completing no packet — became
  `1.8e19`, which `Math.max(0, …)` does not catch.

It now walks pages **forward**, following each page's own declared segment
table, and returns null for anything that is not a clean chain ending exactly at
the last byte. A page's length is declared rather than searched for, so it
cannot be fooled. **Verified equivalent on all 41 real clips** before and after.

---

## The casting was wrong, and the mechanism that should have caught it did

Mid-run correction from the drumbeat: **Fred is `en-GB-OliverNeural`**, not
`en-GB-RyanNeural`. Joe: *"no, I have specified the voices! fred is oliver"*.

His casting was recorded on **JT-003's `note`** — *"oliver as Fred, olivia as
the teacher and thomas as the owl"* — and JT-003's `state` was already `done`.
**The task was ticked; its artefact (`joe/voices.json`) was never written.** Only
the owl happened to match. I baked 41 clips as Ryan before the correction
arrived; `bakeHash` covers the voice, so all 41 were stale by the pipeline's own
contract and were discarded and re-baked. That is the mechanism working.

**The `check` field on JT-003 is `voicesCast`. I was asked whether it verifies
the casting landed. It does — and it fired, and it was overridden.**

- `tools/workbench/checks.mjs:40-46` reads `joe/voices.json` and returns
  `{ok: false, warn: "still on placeholder voices: …"}` for every entry whose
  `cast` flag is falsy. All three were `cast: false`, so it was returning
  `ok: false` continuously.
- `tools/workbench/public/app.js:79` surfaces it as a blocking confirm:
  `if (t.state !== 'done' && t.warn && !confirm(\`${t.warn}\n\nMark it done anyway?\`)) return`.

**So the hole is not detection. It is three other things**, and they are worth a
card:

1. **`doneRule: "manual"` means the check is advisory.** Nothing prevents a task
   sitting at `state: "done"` while its own `check` says `ok: false`. The
   contradiction is computed on every page load and displayed, and no one is
   told to look at a task that is already ticked.
2. **Dismissing the confirm leaves no trace.** There is no record that a task
   was completed over a live warning, so the fact is unrecoverable afterwards.
3. **`voicesCast` checks a PROXY, not the ruling.** It tests the `cast` boolean,
   which is independent of the voice NAME beside it — a name can be right with
   the flag false, or the flag flipped with the name stale, and only the second
   is caught. It never compares `joe/voices.json` against the `note` that
   settled the question.

**The defect class, stated generally: a task marked `done` whose artefact was
never written.** This repo has now produced it at least once. The finding is
recorded here; no fix was built, on instruction.

---

## Does anything at runtime play these clips? No.

Plainly, and this is the next piece of work:

- **Nothing loads the manifest.** There is no `fetch`, `XMLHttpRequest`,
  `new Audio`, `decodeAudioData` or `createBufferSource` anywhere in `src/`.
  The only code that touches `manifest.json` is Node-side tooling.
- **The `say(id, {slot})` player of voice.md §6 does not exist.** Every spoken
  line in the game goes through `src/platform/speech.ts` → `speechSynthesis`
  (`createSpeaker` at :45, `speak` at :69). The island calls it via
  `src/island/main.ts:154` and the `Presenter.speak` port
  (`src/island/interactions.ts:83`). The album's speak button chains two
  utterances on `onend` (`src/island/album.ts:704`) because `speak()` cancels.
- So the game currently says Fred's lines in **whatever robotic voice the
  device has**, while 41 clips of Oliver sit unread beside it.

### Four things the player will hit, all known now

1. **The manifest's `file` is a REPO path** (`src/island/public/voice/…`), not a
   URL. The manifest itself ships — it is inside Vite's `publicDir` — so a page
   that reads it must map `src/island/public/X` → `X` against the base, which is
   `/JunosIsland/` (`vite.island.config.ts:40`). I left the field alone rather
   than inventing a second contract for a consumer that does not exist; decide
   it when you write the consumer, and change `bakeOne` once, not at both ends.
2. **Workbox precaches no audio.** `vite.island.config.ts:69` is
   `globPatterns: ['**/*.{js,css,html,woff2}']`. Voice is meant to be precached
   (voice.md §5.5, ~5 MB); it is not, today. Note pet models are also
   deliberately excluded and warmed at runtime, so copy that decision knowingly
   rather than by default.
3. **The fallback chain is required, not optional** — baked clip → Web Speech →
   visual only (§6). `count.` is unbounded in principle, so a number past 20 is
   a NORMAL event and must reach Web Speech rather than fail.
4. **The player enforces the splice law** (§6): it refuses a slot insert whose
   `character` differs from the template's. The manifest now records `character`
   on every clip precisely so it can.

---

## Where the next manager starts

**Build the player, or do not claim the voice works.** `tools/workbench/script.mjs`
already knows how the two governor templates cut, and the manifest already
carries `ms` and `character` for every piece — the timing information a splice
needs is present. The seam to write against is `Presenter.speak`
(`src/island/interactions.ts:83`), which today is `text => speech.speak(text)`
at `src/island/main.ts:2021`; that is one port, and it is where a baked clip
would displace `speechSynthesis` without touching the flow.

**Do not bake anything else first.** The teacher's ~1,700 clips are gated on the
name audit (`joe/names-audit.json`) and on Joe's word lists, and `phoneme.` is
his sound booth. `scriptUnits` throws by design if asked for them, naming the
family, rather than silently baking nothing.

## Gotchas that cost me time

- **`.env` is not in a worktree.** It is gitignored, so it exists only in the
  main checkout at the repo root. `readEnv(root)` reads `<root>/.env` and a
  worktree has none, so the bake fails with "add AZURE_SPEECH_KEY to .env" while
  the key is sitting there perfectly valid one directory up. `process.env` wins
  over `.env` in `bakeOne`, so the fix is to inject it for the one command —
  never to copy the file into the worktree, where it would be a second copy of a
  live credential on disk. The key was never printed, logged, or written
  anywhere by this run.
- **`joe/voices.json` is a live file Joe edits in the workbench UI**, and the UI
  saves the whole file. Treat it like `joe/tasks.json`.
- **Run the gates on the tree you are actually going to commit.** I ran tsc,
  build, smoke and parity while a subagent was still writing the test file, so
  four of the five gates never saw it — and the version I committed **failed
  tsc**, because importing the workbench's untyped `.mjs` from a `.ts` test is
  `TS7016` under this repo's settings (no `allowJs`). Two `@ts-expect-error`
  directives at the imports fix it, which is the precedent in `tests/island/*`.
  A gate run that predates the code it is meant to cover is not a gate run.
- **Do not commit while a subagent is mid revert-check.** I committed in a
  window where the agent had deliberately broken `script.mjs` to watch a test go
  red. The commit happened to catch the intact version and I verified the blob,
  but that was luck. Wait for the agent to report before staging.

## Decisions

**Baked audio is COMMITTED, deliberately.** The repo already tracks its runtime
binaries — `git ls-files src/island/public` counts 138 `.bin`, 136 `.gltf`, 24
`.glb` and 7 `.png` — and `.gitignore`'s own comment says runtime assets live in
`src/island/public/` for exactly this reason. 547 KB is a fifth of one pet pack.
The manifest records a `hash` per clip, so a clip that disagrees with its script
is detectable in a diff rather than only on a machine that has the key.

**RAISED into the workbench:** none — I may not write `joe/tasks.json` while
other managers are live. Two items are in my report to the drumbeat for central
application: the `voicesCast` finding above, and whether `-8%` is still the right
rate now Fred is Oliver rather than Ryan (Oliver is 155 wpm against Ryan's 161,
so he is already marginally slower). **That is Joe's ear and I did not tune it.**

**PICKED UP:** JT-003's note, which was already `done` and whose artefact had
never been written. `joe/voices.json` was corrected by the drumbeat, not by me.
