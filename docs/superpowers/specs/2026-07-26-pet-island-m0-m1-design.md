# Pet Island — M0 + M1 Design

Date: 2026-07-26
Status: design agreed in conversation; spec awaiting review
Scope: M0 (extraction) and M1 (island) only. M2–M4 get their own specs.
Source of truth: `pet-island-brief.md` (§ references throughout), and `v0/junos-words.html`
for all learning behaviour.

---

## 1. Decisions taken

| Question | Decision |
|---|---|
| First chunk | M0 + M1 in one spec. M0 alone has no visible payoff, and §17 says the pivot lives or dies on how M1 feels. |
| Language | TypeScript throughout. |
| Extraction approach | **C** — pure logic properly extracted and tested; the three renderers moved verbatim with mechanical dependency injection only. |
| Repo | Single package (no workspaces), two Vite configs. Public at `github.com/jtr31415/JunosIsland`. |
| Hosting | GitHub Pages. Both asset packs verified CC0, so a public repo is clear. |
| Existing saves | Not preserved. Clean slate; free to change save schema. |
| Persistence | localStorage now, **async interface from day one** so a DB can replace it without touching call sites. |
| Iteration | Vite dev server + `--host`. No Docker. |

### Amendments to the brief

Two points where this design knowingly departs from `pet-island-brief.md`. The brief
should be updated so it does not contradict the build.

1. **§18 "no accounts, no network calls beyond static hosting" / "no server, no
   accounts, no telemetry, ever."** Superseded by owner decision: if the game is ever
   deployed publicly it will need user management and a database. This spec does not
   build a backend, but it does not preclude one (§6 below).
   *If that happens, children's data protection law applies (UK Age Appropriate Design
   Code, GDPR, COPPA for US children). The cheapest compliant posture is parent-held
   accounts holding no child PII.*
2. **§17 "M1 — Island grey-box."** M1 ships dressed, not grey-boxed (§7 below).

---

## 2. Repository and tooling

Single npm package. Workspaces would add ceremony without buying isolation we need.

```
JunosIsland/
  package.json  tsconfig.json  vitest.config.ts
  vite.words.config.ts     -> dist/words/junos-words.html   (single inlined file)
  vite.island.config.ts    -> dist/island/                  (PWA)
  src/
    core/          pure TS - ported learning logic. No DOM, no browser APIs,
                   no module-level mutable state.
    platform/      thin wrappers over speechSynthesis / WebAudio / storage
    challenges/    DOM-coupled, extracted verbatim + injected deps
    ui/            design tokens and shared chrome, used by both apps
    words2d/       the 2D shell: html, css, ambience, spectacles, album, profiles
    island/        Pet Island (M1)
  assets/          derived runtime assets only (glTF, atlases)
  docs/superpowers/specs/
  tests/
```

`Assets/*.zip` and the KayKit `.blend` sources are gitignored. CC0 permits republishing
them; we decline as a courtesy to KayKit, and it keeps the repo lean.

**`v0/` is preserved untouched and committed.** §1.4 of the brief makes
`junos-words.html` the reference implementation for all learning behaviour, outranking
the brief itself where they disagree. It must remain readable in its original form for
the life of the project — it is the arbiter every future question about learning logic
gets settled against. `src/words2d/` is the *rebuilt* game; `v0/junos-words.html` is the
original and is never edited.

The repo does not exist locally yet and `github.com/jtr31415/JunosIsland` is empty, so
Phase 0 includes `git init`, first commit (brief, `v0/`, `docs/`), and adding the remote.
Node 20+, npm.

**`core/` means "ported learning logic", not "everything pure."** Island modules such as
`hex.ts` and `grid.ts` are equally pure and equally unit-tested, but they live in
`island/`.

### Two builds

- **2D game.** `vite-plugin-singlefile` inlines every module and stylesheet into one
  self-contained `junos-words.html` with zero external requests, so it still opens from
  `file://` exactly as today. This is what makes §17's "the 2D game keeps shipping from
  these modules" true rather than aspirational: if a refactor breaks the port, her game
  breaks, and we find out immediately.
- **Pet Island.** `vite-plugin-pwa` -> `dist/island/`, deployed to Pages.

Pages layout: island at `/`, 2D build at `/words/junos-words.html` so re-downloading the
latest 2D file to the tablet is a URL rather than a cable.

**`vite-plugin-pwa` uses `registerType: 'autoUpdate'` from day one.** A service worker
will otherwise serve stale assets indefinitely after a fix is pushed.

### Testing and CI

Vitest (shares Vite's config and TS handling — no second toolchain). jsdom only for
`challenges/` tests. GitHub Actions: typecheck -> test -> both builds -> deploy island
to Pages.

---

## 3. Development workflow

| Need | Tool |
|---|---|
| Everyday iteration | `npm run dev` — HMR, ~50ms, no state loss |
| On the tablet | `vite --host`, tablet hits `http://192.168.x.x:5173` |
| Service worker / PWA / devtools on tablet | USB + `chrome://inspect` port-forward 5173, so the tablet sees `localhost` (a secure context) |
| Testing the built artifact | `npm run preview` |
| Sharing a build / home screen icon | Push to main -> Pages, ~60–90s plus CDN propagation |

No Docker. There is no server, no database and no services to orchestrate; on Windows a
container bind mount degrades or breaks Vite's file watching. Docker earns its place the
day the backend in §6 exists.

A plain-http LAN address is not a secure context, so service workers will not register
over `--host`. That is what the USB port-forward is for.

---

## 4. `core/` — module inventory

Pure TypeScript. No DOM, no browser APIs, no module-level mutable state.

| Module | From `junos-words.html` | Change |
|---|---|---|
| `rng.ts` | `ri`, `shuffle` | Takes an `Rng`; defaults to `Math.random` |
| `wordlists.ts` | `GREEN`, `RED`, `CONFUSABLE`, `groupOf` | None. Distinct types for marked (`"s[ai]d"`) vs plain words |
| `segmentation.ts` | `plainWord`, `parseMark`, `GRAPHS`, `markDigraphs` | None |
| `neighbours.ts` | `lev1`, `NEIGH` builder | Builder becomes a function, not a load-time side effect |
| `alien.ts` | `AL_*` pools, `alienWord`, `REAL_BLOCK` | RNG injected |
| `names.ts` | *new, wraps `alien.ts`* | Pet-name generator (§5 of brief). M1 uses the full pool; band-constrained in M3 |
| `decks.ts` | `makeDeck` | RNG injected |
| `generators/{read,build,add,sub}.ts` | `generateRead` etc. | Per-mode state passed in instead of read from the global `store` |
| `themes.ts` | `THEMES` | None |

### The one deliberate change to ported code

`ri()` and `shuffle()` call `Math.random()` directly. §17 requires unit tests on deck
dealing and alien-word generation, and neither is testable while randomness is ambient.
`core/` therefore takes an injectable RNG defaulting to `Math.random` — production
behaviour is identical, tests pass a seeded generator.

### Deliberately not shared

`STICKERS` and the album machinery stay in `words2d/`. §7 wants them rethemed to pets,
but Pet Island's collection is built on 3D variants; sharing now would mean designing
M2's data model blind. It gets its own module in M2.

---

## 5. `platform/` and `challenges/`

### `platform/`

- `speech.ts` — `pickVoice` (en-GB ranking), `speak(txt, rate, onend)` preserving `onend`
  chaining and the 2.5s stuck-engine fallback, voice toast.
- `audio.ts` — `note`, `popSound`.
- `storage.ts` — see §6.

Thin enough to stub in tests.

### `challenges/`

DOM-coupled, extracted verbatim. The only change is mechanical dependency injection:
`$('words')` becomes a passed-in element; `addScore` / `celebrate` / `reward` / `burst`
become injected callbacks.

- `wordFind.ts` — `renderSet`, `wordTap`, `speakTarget`
- `build.ts` — `renderBuild`, `fredTalk`, `FRED_SOUNDS`
- `sum.ts` — `renderSum`, number pad, dot hints, fives colour-blocking
- `deadzone.ts` — `inDeadZone` (already standalone)
- `mount.ts` — container contract: `mount(el, item, deps)` where `deps` supplies
  `speech` (the whole `Speaker`, since renderers need `cancel()` and the shared
  voice-notice flag), `sfx`, `holds`, `isActive`, `flyToScore`, `onWrong`, `onAdvance`,
  `showTarget`/`hideTarget`, `toast`, `celebrate`, `burst`

  `holds` matters more than it looks: `rewardUntil` and `quietUntil` are written by the
  *host* (`reward()`, `befriend()`) and only read by the renderers, which use them to
  avoid auto-advancing over a spectacle or speaking across a celebration. They cannot
  become renderer-local state — nothing inside a renderer ever sets them.

  Scoring stays with the host too: the star animation's `onfinish` is where points are
  actually awarded, and literacy pays 2 while maths pays 1.

**Explicitly not done in M0:** the mash counters (`round.wrongs` in the word-find,
`wrongsB` in `renderBuild`) stay as inline counters in their own renderers. Unifying them
into a shared rule is tempting and is exactly where field-tested behaviour would quietly
drift. They are unified in M3 or never.

**The one sanctioned deletion is the battery** (brief §4, §7 — "the battery is retired;
do not port it"). It is the sole exception to the verbatim rule and it lives *inside*
these renderers, so the plan names the exact lines rather than leaving it to judgement.
The Phase 3 gate reads "plays identically **except the retired battery**", and the parity
checklist has a line confirming maths advances with no charge gate — an intended
difference stated out loud beats a gate that is quietly false.

---

## 6. Persistence

localStorage now; designed so a database can replace it without touching call sites.

**The interface is async from day one.** localStorage is synchronous, so the natural port
returns values directly and every call site then assumes synchronous reads. Retrofitting
`await` into those call sites later is the viral refactor that makes people bolt a
backend on sideways. Promises now cost nothing — the localStorage implementation resolves
immediately.

```ts
interface SaveStore {
  get<T>(profileId: string, doc: DocKey): Promise<T | null>
  put<T>(profileId: string, doc: DocKey, value: T): Promise<void>
  list(): Promise<ProfileMeta[]>
}
```

Three supporting rules:

- **Documents, not scattered keys.** Each save is a plain JSON document carrying
  `schemaVersion` and `updatedAt`, written as a whole-document replace. That is what
  localStorage needs anyway for versioned evolution, and exactly the shape a DB row or
  document takes. `updatedAt` is the difference between "sync is possible later" and
  "sync needs a rewrite".
- **Profile ids stay opaque.** Today `'p' + Date.now()`; later a server-issued user id.
  Nothing outside `storage.ts` may parse or generate one. One accessor for the current
  profile, not `curProf` reads scattered through the code.
- **Local remains the source of truth.** The brief requires offline-capable, so even with
  a database the server is a replica that local syncs to, never a dependency the island
  waits on.

**Not built now:** no auth, no DB adapter, no sync engine, no server, no user table.
Those are guesses until public deployment is real. The above is roughly thirty lines of
shape, not a subsystem.

---

## 7. M1 — the island

### Layer boundary

The world raises intents; it never knows what a challenge is. `flow.ts` mediates:

```
world ("egg tapped") -> flow -> overlay mounts challenge -> challenge reports completion
                                                          -> flow applies world effect
```

The overlay never touches Three.js. The world never reaches into challenge internals.
Everything crossing that line is a plain serialisable event, which also makes the flow
testable without a GPU.

### `src/island/`

| Module | Responsibility |
|---|---|
| `world/hex.ts` | Axial coordinates, neighbours, axial <-> world conversion. Pure, unit-tested |
| `world/grid.ts` | Owned coords, tile type per coord, socket computation (empty coords adjacent to owned). Pure, unit-tested |
| `world/tiles.ts` | One `InstancedMesh` per tile type |
| `camera.ts` | Orbit + pinch zoom with gentle limits |
| `picking.ts` | Tap raycast -> tile / socket / pet / egg / Fred |
| `pets.ts` | Wander on owned hexes, idle bob, tap response |
| `fred.ts` | Code-built primitives + procedural animation (hop, talk jaw-flap, blink, lean) |
| `egg.ts` | Egg object, wobble when workable, crack/hatch sequence |
| `juice.ts` | Sky gradient, fog, blob shadows, warm key light, vignette |
| `debug.ts` | Free cam, inspector panel |
| `overlay/` | DOM learning overlay; mounts `challenges/` modules |
| `flow.ts` | State machine: opening -> free play -> challenge -> reward -> placement |

### M1 ships dressed, not grey-boxed

§17 calls M1 a grey-box, but it also says the pivot lives or dies on how M1 feels, and
Cube Pets and the KayKit hexagons are already downloaded, CC0 and in hand. Judging feel
through untextured placeholder boxes risks a false negative from the one reviewer who
matters.

M1 therefore ships with real hex tiles, one real cube pet, code-built Fred, and the juice
pass already on. Placeholders only for what genuinely does not exist yet: biome props,
decorations, seasonal variants.

The juice pass is pulled forward to Phase 4. Sky gradient, fog, key light and blob
shadows are perhaps twenty lines, and they change every judgement anyone makes about the
scene from that point on.

### UI style

The chunky KayKit/Kenney language is built in CSS, not sourced as bitmaps: flat saturated
fill, generously rounded corners, a *hard* offset shadow in a darker shade of the fill
(the underside of a plastic block) rather than a soft blur, thick borders, no gradients.
This lives in `src/ui/tokens.css`.

CSS beats Kenney's UI Pack bitmaps here: it stays crisp at any DPI, reflows around
variable-length UK spellings and long decodable pet names, and keeps the learning overlay
as real text — which matters for Andika and for the accessibility the brief wants from
DOM.

- **Icons:** download Kenney Game Icons (CC0), retint per theme. Hand-drawing 40–50
  mutually consistent icons is the one expensive job here.
- **Pet and Fred imagery: render it, don't draw it.** Album portraits and speech-bubble
  faces come from offscreen Three.js renders of the live models — fixed camera, fixed key
  light, transparent background. Hand-drawn art for a 768-variant space is impossible and
  would drift from the models. Undiscovered-species silhouettes are the same render
  flat-filled. The Pet-o-matic dev page (§14) and the album share one code path.
- **Caveat:** CSS gets the chunky *language* — shapes, weights, colours, shadows. It will
  not produce illustrated flourishes such as a hand-painted wooden signpost. If a screen
  later needs that, source it then rather than blocking M1.

Downloads still outstanding: **Andika** (OFL, self-hosted — required for M1 learning
text) and **Kenney Game Icons** (CC0) now; UI Audio, Music Jingles and Particle Pack at
M2/M4.

### Out of scope for M1

No album, no variants or palettes, no habitat coupling or nursery, no pet quests, no
bands, no scheduler, no Owl's Book, no dashboard, no profiles, no seasons.

---

## 8. Proving the port is faithful

Three layers, weakest to strongest.

1. **Unit tests on `core/`** — the §17 list, made deterministic by the seeded RNG. Decks
   exhaust before repeating; `parseMark`/`plainWord` round-trip; `markDigraphs` covers the
   `GRAPHS` inventory; `alienWord` never emits a `REAL_BLOCK` word and stays decodable;
   the neighbour map yields true single-edit pairs (sat/sit) while excluding same-group
   clashes; generators produce the expected count, red/green ratio and neighbour-injection
   rate.
2. **The rebuild is the integration test.** The 2D game ships from these modules. An
   unfaithful port is a visibly broken game.
3. **Golden-output diff — the one that settles it.** A harness slices the *pure* line
   ranges out of the frozen original verbatim, runs them under Node with `Math.random`
   replaced by a seeded PRNG, and dumps the generated items to JSON. After extraction,
   `core/` regenerates the same items with the same seed and the two are diffed.

   Running the original's own source text — rather than a hand-patched copy — is what
   makes this a reference rather than a second port. Nothing is written to `v0/`.

   Its sharp edge: this pins the *order* of RNG calls, not just behaviour. Restructure a
   generator equivalently and the diff lights up. That is mostly a feature — it catches
   accidental reordering.

   **It is nonetheless a hard CI gate.** A failing golden diff fails the build. The
   "restructured equivalently" case is real but rare, and the correct response is to
   justify the change and re-capture deliberately — not to let a red diff be waved
   through as probably-fine. A soft gate on the project's only real fidelity proof is
   no gate at all.

   The capture covers **every level the shipped UI can reach**, not just level 1:
   reading and building at levels 1–2 (so `alienWord`'s RNG stream is pinned),
   addition at 1–2 (the bridging branch), subtraction at 1–3.

---

## 9. Sequencing

| Phase | Work | Gate |
|---|---|---|
| 0 | Repo, TS, Vitest, both Vite configs, CI, Pages — proven with a trivial build | Pipeline green before any porting |
| 1 | Golden-output capture by slicing the frozen original under a seeded RNG | Nine datasets on disk — every level the UI can reach |
| 2 | `core/` extraction bottom-up (`rng` -> `wordlists` -> `segmentation` -> `decks` -> `neighbours` -> `alien`/`names` -> `generators`), tests alongside | Golden diff clean |
| 3 | `platform/` + `challenges/`, 2D shell reassembled, single-file build | **The 2D game plays identically, except the retired battery** |
| 4 | Island skeleton: canvas, orbit camera, hex grid, raycast, juice v0 | Deployed to Pages, opened on the tablet |
| 5 | The loop: word challenge -> hatch -> pet wanders; sum -> pick-of-three -> socket -> tile drops | |
| 6 | Fred, opening script, TTS | Checked on the tablet, not assumed |
| 7 | Debug tooling: free cam, inspector | |
| 8 | Add to Home Screen on the tablet | **QA verdict** |

"Install" throughout means the PWA Add to Home Screen step — an icon that opens the game
in standalone mode, no URL bar, no tabs. Still Chrome's engine; no APK, no store, no
native code. Optional: the same URL works in an ordinary tab.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Tablet performance unknown until something runs on it | Phase 4 deploys and opens on the device, while the scene is still cheap enough to fix |
| TTS voice availability differs between desktop and her Android tablet | The en-GB ranking is already field-tested on that device, but the opening leans on it entirely — checked on device at Phase 6 |
| Golden diff flags equivalent restructuring | Hard build failure. The fix is to justify the change and re-capture deliberately — a soft gate on the only real fidelity proof is no gate at all |
| A test encodes a value the frozen original contradicts | Every DOM/timing/class/audio assertion cites the `v0` line it encodes; review gates diff assertion against cited line first. Two plan revisions shipped such tests before this rule existed |
| M1 feels flat and gets a false-negative verdict | Ship dressed, not grey-boxed; juice pass pulled forward to Phase 4 |
| Service worker serves stale assets after a fix | `registerType: 'autoUpdate'` configured from day one |
