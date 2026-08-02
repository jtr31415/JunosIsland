# Pet Island — Voice Architecture (fully pre-rendered)

Decision: **no runtime neural synthesis.** Every utterance in the game is either
baked at build time, recorded by a parent, or procedurally beeped. Rationale, in
order: (1) baked audio can be pronunciation-audited against the graphemes —
decodable pet names spoken wrongly would teach wrong phonics; (2) identical
quality on every device, offline, forever; (3) the whole corpus fits in ~5MB of
Opus — smaller than one asset pack; (4) removes an 82MB model download and a
WebGPU compatibility surface from a children's product.

---

## 1. Corpus inventory & source

| Content | Count / size | Source | Voice |
|---|---|---|---|
| Fred script + barks | ~60 lines | Build-time premium TTS | Fred (warm, playful, slower) |
| Owl's Book lines, pings, ceremonies | ~80 lines | Build-time premium TTS | Owl (measured, warm) |
| Praise & system lines | ~40 lines | Build-time premium TTS | Teacher voice |
| Challenge words (band packs 1–8) | ~700 words | Build-time premium TTS, **audited** | **Teacher voice — one voice, never varies** |
| Pet name table | ~1,000 names, one per variant | Generated at build → audited → baked | Teacher voice |
| Phoneme sounds (Fred talk) | 43 clips | **Dad, via the sound booth** | Dad |
| School-list imports | ~10 words/week | **Dad, booth-style flow at paste time** | Dad |
| Child's name | n/a | **Print only** — audio says "friend" (native takes) | — |
| Pet ambient chatter | procedural | Animalese blips from name letters, species-seeded pitch | n/a |

Pedagogical law: the **challenge-word voice is a single consistent clear
British voice** — consistency is part of the listening task. Characters get
flavour; the words themselves never do.

## 2. The name table (replaces live generation) — *amended 27 Jul*

**A name belongs to a variant, not to a hatch.** Every `{setId, speciesId}`
has exactly one name, the same on every island, forever — the polar bear is
always Bimo. Collections are therefore comparable between friends, which is
the point of the ruling.

- The alien-word generator runs **at build time**, emitting candidates
  constrained per band tier (only taught graphemes), deduplicated against
  real words and against the tricky list, and assigns them one-to-one across
  the ~1,000 variants. The result is a committed data table, not a runtime
  pool.
- **Graded by set, not by child.** Set 1's twenty-four names sit at band 1
  and each later set climbs toward band 8. Sets unlock over weeks, so the
  names a child meets track their reading in practice while the name itself
  never depends on who is hatching it. Set order is consequently a reading
  ladder and cannot be reshuffled without reshuffling difficulty.
- Bake pass renders each with the teacher voice; an **audit pass** flags
  mispronunciations (automatic: forced-align phonemes vs expected GPCs; plus
  a human skim of the flagged set). A rejected name is **replaced at
  authoring time** — the table stays complete, and every name that can ever
  be spoken has been audited before it ships. This is stronger than the old
  pool, which was sampled at runtime and could only be trimmed.
- There is no draw, no exhaustion and no recycling. A variant is owned at
  most once, so the roman-numeral rule ("Bimo II") is retired.

## 3. Names & the splice law

- **The splice law: slot parts and their inserts must share one voice.**
  Same-voice splices are invisible; cross-voice splices are uncanny and are
  forbidden everywhere.
- **Pet names & challenge words** splice legally: templates and the name/word
  pool are all the teacher voice — "You found… Bimo!" is one larynx
  throughout. Slot gaps ~120ms, seams on natural pause boundaries by script
  design.
- **The child's name is print, not speech.** Audio uses the baked
  **"friend"** takes (full native lines, never spliced). It appears
  wherever print is meaningful: the greeting card ("Hello JUNO!"), the
  island's welcome sign, the album cover — a child's own name is the first
  word they learn to read, and print personalisation is itself literacy
  content.
- Parent-recorded name inserts are **parked as a v2 flag**, permitted only in
  a future non-character context (never from a character's mouth).

## 4. School imports

- When a parent pastes the week's list, the import flow offers a 90-second
  booth pass: each word shown → record → trim/normalise → stored with the
  pack. Skipped words fall back to Web Speech at play time (flagged in the
  dashboard so the parent knows which words sound robotic).

## 5. Bake pipeline (repo tooling, runs in CI or locally)

0. **Provider adapters & draft mode.** `bake.mjs` speaks three providers:
   `google-draft` (en-GB WaveNet, free tier — renders the ENTIRE corpus for
   playtesting), `azure-teacher` (frozen teacher voice, free tier), and
   `elevenlabs-character` (Fred/Owl, the only paid pass). `--draft` fully
   voices the game for iteration at £0; drafts never ship. The manifest
   records provider + voice + text-hash per line, so final passes re-render
   only changed lines. **Corpus freeze gate:** the character pass may not run
   until the table-read, line laws, name-pool audit, and a field-trial week
   on drafts are done — the premium bake fires once, at the end.

1. `voice/scripts.json` — every line, IDs, slot cuts, character, rate.
2. `bake.mjs` — batch-renders via the chosen premium TTS API (key in env, a
   build step, **never** shipped or called at runtime), outputs mono Opus
   24kbps, loudness-normalised (EBU R128-ish single pass).
3. Audit pass for the name pool (§2).
4. `manifest.json` — id → {file, ms}; audio grouped into a few sprite files
   per category to keep request counts down.
5. Output lands in `assets/voice/`; the PWA precaches it all (~5MB).

## 6. Runtime player

- One tiny module: `say(id, {slot?})` — resolves manifest, plays via Web
  Audio (not `<audio>`, for splice timing), chains slot parts, exposes
  `speaking` state for Fred's jaw-flap. The player enforces the splice law:
  it refuses a slot insert whose voice differs from the template's.
- Priority ducking: challenge words > ceremonies > barks; a new challenge word
  interrupts chatter, never vice versa.
- **Fallback chain:** baked clip → Web Speech (ranked en-GB picker, ported) →
  visual-only. No network path exists.

## 7. Guardrails compliance

No runtime TTS API calls, no audio uploaded anywhere, recordings live in
localStorage/OPFS per profile and die with it, exportable only inside the
existing save-export blob. The premium TTS key exists only in the build
environment.
