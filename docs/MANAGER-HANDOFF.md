# Manager handoff

> ## ⚠ START HERE — state at handover, 2 Aug 2026 (night)
>
> *Written by the manager that shipped PB-070. Read this block, then the mouth
> manager's block immediately below it, which is still current for the species
> layer. The PB-068 block after that is now history — this run did the thing it
> told you to do.*
>
> ### The headline: a signed-off animal now reaches the island
>
> **PB-070 is done.** Sign-off and shipping are now one act. Until tonight Joe
> could have signed off all thirty hand-assembled animals and Juno would still
> never have met one — the deck dealt only the 24 Kenney ids, and even had it
> dealt an assembled one `pets.ts` would have 404'd and dropped it in silence.
> Three commits, each a coherent slice:
>
> - **`b427cac`** — `pets.ts` `prototype()` forks: if `speciesRecord(id)?.assembly`
>   answers, it calls the synchronous `buildAssembly(spec)` and **makes no network
>   request at all**; otherwise the GLB path is untouched. Assembly-then-GLB is
>   copied from `album.ts:176-186` rather than invented. The built group enters the
>   SAME promise cache, so one prototype per species and `model()` still clones it.
>   `sync()`'s `.catch(() => null)` becomes `reportDrop` — one `console.error` per
>   species, retry intact.
> - **`d0865de`** — `src/island/species/signed-off.{ts,json}`, a generated mirror of
>   `joe/names-audit.json`'s `signoff === 'ok'`, written by `tools/species/signoffs.mjs`
>   (`npm run signoffs`) **and by `/api/save` whenever the names file is saved**.
> - **`e7fe6e3`** — `dealPool(base, signedOff)` in `species/pool.ts`; `main.ts:482`
>   now passes `dealPool(SPECIES)` where it passed `SPECIES`.
> - **`59242dc`** — backlog.
>
> **Nothing changes for anyone today.** The mirror is empty — 0 of 30 rows carry
> `signoff`, because Joe's ruling is retroactive — so the pool is still the 24 and
> the deck deals exactly what it dealt yesterday. **The moment he ticks one row in
> the workbench, that animal is in the pool.** No flag, no regeneration to
> remember, no approval step. Tell the drumbeat: the standing order can now be
> honoured, and PB-067's second half (the editor preview) is what stands between
> Joe and doing it.
>
> ### How it was proved, and why you should believe it
>
> `tests/island/deal-assembled.test.ts` drives the real chain, each stage handing
> the value it produced to the next: the real `makeCollectionDeck` **deals** the
> assembled id (not "contains" — dealt, on all 25 seeds); the real hatch path puts
> it in `flow.pets`; a real `createPetField` renders it with the mesh count of an
> independent `buildAssembly`, non-zero vertex and index counts, feet on y=0, and
> **zero network requests**; 600 seeded frames move it horizontally; the real
> `saveIsland`/`loadIsland` put the id in the actual localStorage bytes; and a
> brand-new pet field — which is what a reload really is — renders and walks it
> again off the same shared texture, nothing disposed.
>
> **Every production change was reverted and watched to fail** (HANDOFF §5).
> `pool.ts → return base` fails six links plus five unit cases. The assembly fork
> returning null fails render, reload and walk while deal, hatch and save stay
> green — the chain isolating the break rather than smearing it. The loader stub
> **works** for `animal-cow`, hatched in the same file, so "never asked" is a
> measured fact about `pets.ts` and not an artefact of a dead double.
>
> ### Where the next manager starts
>
> **PB-067's second half — the editor preview.** Its first half is gone: `pets.ts`
> can build all thirty, so the wander loop has something true to show. The one real
> problem is unchanged and is the actual design work: the editor shows an **unsaved
> draft** (`def` in `joe/species-edits.json`), not a registered species, so
> `prototype()`'s id lookup will not find the draft geometry. Expect to need a
> "build this exact spec" injection point beside the id lookup in `pets.ts:~707`.
> The PB-068 block below still has the rest of the map for that card and it is
> accurate.
>
> ### Landmines paid for this run
>
> - **`buildAssembly` grounds its result by writing `group.position.y` on the group
>   it RETURNS** (`assembly.ts:617-619`). A node's own `position` is not scaled by
>   its own `scale`, so `sync()`'s `root.scale.setScalar(0.16)` shrinks the geometry
>   and leaves the lift at full size. `prototype()` therefore returns a plain
>   **wrapper Group** with the assembly as its only child. It looks removable and is
>   not. Measured across all thirty, the lift is float dust (largest `-2.951e-5`),
>   so the symptom today is a pet 2.5e-5 above the grass — invisible, and a real bug
>   the first time a species is authored below zero. The test pins the cancellation
>   at `|min.y| < 1e-9`.
> - **`main.ts:482`'s deck line carries THREE source-text guards and no behavioural
>   one** — `collection.test.ts`, `preload.test.ts` and `species.test.ts` each grep
>   for the literal. All three had to be updated in lockstep for a one-line change.
>   `main.ts` self-boots into WebGL and exports nothing, so no test can construct its
>   deck; making it observable means lifting the deck construction into an importable
>   factory. Worth doing, not worth doing inside this card.
> - **`npm run channel` greps `src/` for the workbench path as raw TEXT**, so a
>   comment mentioning it fails the gate exactly as an import would. `signed-off.ts`
>   says "the workbench" in prose for this reason. (The PB-068 block already had
>   this; it caught a second manager tonight.)
> - **`.mjs` under `tools/species/` needs a sibling `.d.mts`** or `tsc` rejects a
>   test importing it with TS7016 — while `tools/workbench/*.mjs` is somehow exempt
>   and nobody worked out why. `tools/workbench/api.d.mts` is the precedent followed.
> - **`joe/backlog.json`'s `nextId` was 71 in my brief and 75 on disk.** Re-read
>   immediately before writing, always; two managers and Joe were all dealing ids
>   tonight.
>
> ### The id mapping (bookkeeping, done)
>
> `58f3ef7` says `fix(PB-069)` and `6d672e6` says `fix(PB-070)`. Neither is the card
> it names — both are the flat-card standoff and card-drawer work, which is
> **PB-071**. History is NOT rewritten. PB-071 said so from its side; PB-069 and
> PB-070 now carry the pointer too, so a reader arriving from the commit finds it.
>
> ### Gate results — full tree, after the last commit
>
> ```
> npm test        Test Files 155 passed (155)   Tests 3413 passed (3413)
> npx tsc --noEmit -p tsconfig.json             exit 0, no output
> npm run build   PWA v1.3.0  precache 50 entries (1845.22 KiB)  files generated
> npm run smoke   all boot checks passed
> npm run parity  every step renders identically
> npm run channel files 363 (7 searchable) ... channel check passed
> ```
>
> Baseline at the start of the run was 3339 tests across 150 files. No flakes were
> seen; `coast`, `sealing` and `facedecals` were green first time, run serially.
>
> ### What is blocked on Joe, and what is not
>
> - **Nothing in PB-070 is blocked on him.** No new JT was raised: the pool rule was
>   already ruled twice ("unsigned animals never ship, signed ones always do") and
>   inventing an approval step would have contradicted it.
> - **Thirty animals are waiting for his tick and can now be dealt the moment they
>   get it.** He should probably not tick until PB-067's preview lands, since that is
>   how he wants to judge them — but the machinery no longer makes him wait.
> - **PB-075 raised** (not a decision, an observation): `fromSave` trusts every
>   record in `save.pets` while every other field it reads is sanitised. Harmless
>   while a species could only be one of 24; not any more.

> ## ⚠ ALSO CURRENT — the mouth manager's handover, same evening
>
> *Written by the manager that made the mouth placeable, concurrently with the
> PB-068 manager. **Three managers wrote a block in this one worktree tonight.**
> Still current for the species layer: its two rulings (JT-041 amended, JT-043)
> govern the next thirty animals. Retitled from `START HERE` by the PB-070
> manager so the file keeps one entry point; nothing in it is stale.*
>
> ### The two rulings that change what the next run does
>
> **1. JT-041 IS AMENDED — a species run no longer stops.** This is the single
> most important line in this file, because the old rule would halt the next
> thirty animals on their first missing part. Joe: *"i am pretty sure i can
> build in the missing bits with what we have otherwise. bit of clever sizing
> and rotation will get a lot done."*
>
> So the rule now has two halves and you must keep them apart:
> - **Never AUTHOR a named part.** No invented fin, wing, talon, frill, hoof or
>   trunk. JT-041 stands in full on this and it has not moved.
> - **DO improvise missing anatomy** by sizing and rotating what the bank
>   already holds, rather than stopping and reporting a blocker. The precedent
>   is Joe's own and already shipped: the goldfish's tail is `wedge-15`, the
>   lion's tail, worn as a fin.
>
> What catches a substitute that reads badly is **his sign-off in the editor** —
> that is what the gate is for, so a builder no longer needs to stop and ask.
> Recorded as **JT-043**, and `JT-041`'s own record now points at it so a reader
> arriving there does not act on the stale paragraph.
>
> **2. Hooves are a two-tone leg, not a part (JT-044).** Joe: *"just use a two
> tone leg for hooves"*. `legs` already takes a paint and `Paint.patch` is
> `{ below, at }` — the base slot's cell is drawn as two colours and the part's
> vertices read across it by their own height, so **no triangle edge and no
> geometry are needed**. A hooved species is one line:
>
> ```ts
> legs: { paint: { base: 'limb', patch: { below: 'hoof', at: 0.25 } } }
> ```
>
> Three constraints the code will otherwise enforce the hard way: `at` is a
> fraction of the part's OWN height and must sit on the pack's **1/16 grid**
> (0.125, 0.1875, 0.25) or `texture.ts` refuses it; the patch applies to the
> **base slot only**, so never combine it with `byBand`; and a spun patched part
> spins its boundary with it (safe today — legs are not spun).
>
> **Treat this as a general tool, not a hoof workaround.** The same line is fur
> socks, pale paws, a bird's feet against its legs, a dark-stockinged fawn.
>
> ### What this run fixed, and what it really was
>
> Joe asked for the smiley mouth as a placeable part. He was right that we
> already had it. **It was never missing, never filtered out of the editor, and
> the schema always expressed it** — five species already carry a `mouth` extra.
>
> The fault was the **donor transfer** (`src/island/species/parts/creature.ts`).
> A flat card has no extent along its facing, so the solved shift was 0 and the
> card landed **exactly coplanar with the hull's front face**, where a
> zero-thickness single-sided plane z-fights into invisibility. The proof it was
> the fault and not a theory is written in the species files by four different
> hands: goldfish, firefly and glow-worm all hard-code `at: [0, 0.686849, 0.635]`
> on their mouths, and the shrew — the one animal that trusted the default —
> **has had an invisible mouth since it was built**. Four authors worked around
> this independently rather than reporting it.
>
> Fixed with `CARD_STANDOFF = 0.01`, a number **recovered three ways rather than
> chosen**: `EYE_CARD_Z` (0.635) minus box-03's front face (0.625); Kenney's own
> face decals sitting on a sheet 0.01 in front of the head; and `plate-03`'s
> recorded bank offset, so the transfer plus the standoff puts the shape back
> where Kenney had it in all three coordinates.
>
> **It is NOT the same fault as PB-064.** That card is real and stays open on
> its own terms — its assert filters on role `eye`, and a face-plate's role is
> `card`, so §3 has never once seen one.
>
> **Then Joe hit the second half:** *"i dont seem to be able to colour a mouth
> with the colour i want."* The engine always supported per-part colour —
> `palette` is an open Record and the texture is generated at `slots.length` —
> but the colour panel's entire vocabulary was the slots already present, and
> `addPaletteSlot` **existed in `def.ts` with zero callers in the UI**. An
> inserted part arrives painted from the coat, so the only way to recolour it
> repainted the body. There is now an "own colour" row that appends a slot and
> repoints just that part. **Append only** — insertion order IS the texture
> layout, slot *n* is atlas rows *n*·16…*n*·16+15, so appending leaves every
> existing index untouched. Verified at pixel level across all 24 shipped
> species that not one mesh changes colour (brief §19).
>
> **Known and deliberately not invented away:** `insertPart` names an extra
> after its bank shape id, so a mouth inserted from `cone-02` gets the slot name
> `cone-02`. Deterministic and collision-free, but not readable. Readable names
> need a rename-a-part control, which does not exist.
>
> ### Where the next manager starts
>
> **Home Pets and Farm — thirty animals, now unblocked.** Cards `PB-073` (Home
> Pets, ship 2, 2/16 — 14 to build) and `PB-074` (Farm, ship 5, 0/16 — all 16).
> Both carry the JT-041 amendment; PB-074 carries the hoof ruling in full. Build
> by hand assembly in `src/island/species/parts/assembled/`; **the Garden
> fourteen are the exemplars.** Do NOT copy the corn snake, goldfish or crocodile
> as a standard — all three carry a non-uniform stretch Joe has flagged.
>
> ### Landmine this run paid for: TWO MANAGERS, ONE WORKTREE, ONE `nextId`
>
> Two managers ran concurrently in this checkout, dealing card ids from the same
> `nextId`. **`PB-069` and `PB-070` were taken out from under this run between
> its commits and its card write**, so the ids in this run's commit messages do
> not match the ids of its cards. Each card says which id its commits call it;
> the other manager's cards keep their numbers. If you are ever one of two: **do
> not hold a green tree** — commit the slice the moment it passes, stage by path,
> and re-read any `joe/*.json` from disk in the same breath as writing it. This
> file was also edited by the other manager mid-write; re-read before editing.

> ## Superseded — the PB-068 manager's handover, same evening
>
> *Written by the manager that shipped PB-068. Its `Where the next manager
> starts` is DONE — PB-070 gave pets.ts the assembly path it asked for, and its
> `discovery that matters` is the bug that run fixed. Kept because its map of
> PB-067’s SECOND half is still accurate and still the next piece of work.
> Everything below THIS block is older history.*
>
> ### What this project is, in four lines
>
> A 3D island game for Joe's six-year-old daughter Juno. She does maths and
> reading challenges, hatches animals, builds tiles. Joe writes the specs and
> judges by playing; agents build. `docs/MANAGER-ORDERS.md` is the manager job
> description and does not change — read it before this file.
>
> ### What this run shipped
>
> **PB-068 — `45c4f8b`.** Whether an animal flies was a hardcoded `Set` of two
> ids (`FLYERS`, `pets.ts:51`). It is now one word per species that Joe sets in
> the workbench editor. `FLYERS` is gone.
>
> - The field lives in **`src/island/species/moves.ts`**, a leaf module importing
>   nothing. `Locomotion` is `'land' | 'air' | 'water' | 'amphibian'`, absent
>   means `land`. Predicates `flies`, `mayEnterWater`, `mustStayInWater`.
> - **It is a lookup table by id, NOT a field on the species record.** This was
>   forced, not chosen: `push.mjs`'s `withRecord` refuses by design to touch a
>   `defineSpecies(...)` record that already exists, and thirty animals are
>   already pushed. On a record, Joe could have marked the nightjar a flyer,
>   pressed push and watched nothing happen. `push.mjs` now has a moves-only
>   bypass so an already-built species accepts the value.
> - **PB-069 (water) is NOT built** — Joe said later. But it reads this same
>   field; `mayEnterWater`/`mustStayInWater` are stated and consulted by nothing.
>   No migration will be needed.
> - Bee and parrot carry over unchanged, pinned by a test named as the migration
>   guard. **Nothing else is seeded** — goldfish, crocodile, nightjar and kiwi are
>   Joe's to rule on, and guessing would invent the judgement the file protects.
>
> **`0cbbc55`** updates the backlog: PB-068 done, PB-067 amended, PB-070 raised.
>
> ### The discovery that matters more than the card that found it
>
> **No hand-assembled animal can be a live pet on the island today.** Measured
> twice, not inferred:
>
> - `pets.ts` `prototype()` (~line 658) builds a pet ONLY from
>   `${base}pets/<id>.glb`. There is no assembly path. An assembled species 404s,
>   and `sync()` at **`pets.ts:777`** does `.catch(() => null); if (!root)
>   continue` — so the pet is never added to `live`, never gets a proxy or a
>   shadow, and silently never appears. Not a crash, not a blocky cube. Nothing.
> - Dealing draws from `SPECIES`, the 24 Kenney ids, at **`src/island/main.ts:481`**
>   — never from the 54-record registry. **No test asserts the two pools agree.**
> - Only `src/island/album.ts:179` renders an assembled species, via
>   `buildAssembly(record.assembly)`.
>
> So the thirty animals awaiting Joe's sign-off have never wandered anywhere, and
> **signing them off will not by itself put them in the game.** The standing order
> — a signed-off animal ships with the next push, always — cannot currently be
> honoured. That is PB-070, and Joe should be told plainly rather than discovering
> it after he spends an evening signing off thirty animals.
>
> ### Where the next manager starts: PB-067, and it is two halves
>
> PB-067 is Joe's sign-off preview: *"i need to see the animals in the game
> environment, so in the editor i need to see it on like 7 hex tiles bouncing
> around like it would in the game. the it gets signed off."* It GATES sign-off.
>
> **Do the halves in this order and do not skip the first.**
>
> **Half one — give `pets.ts` an assembly path.** Until this exists there is
> nothing true to preview. The seam is narrow and already isolated: `prototype()`
> is the ONLY thing that turns a species id into a model, and `model()` just
> clones it. It needs to try the assembly first and fall back to the GLB — the
> fallback order `album.ts:176-186` already uses (assembly → kit → GLB) is the
> precedent, so copy that rather than inventing one. Note `buildAssembly` pulls
> `texture.ts` and therefore three.js, which `pets.ts` already imports, so there
> is no new weight — but check for an import cycle, because `pets.ts` deliberately
> imported nothing from `species/` until this run.
>
> **Half two — the editor preview.** This is far cheaper than it sounds and the
> plumbing all exists:
>
> - The editor **already imports from `src/` by plain relative path** — no alias,
>   no build step. `tools/workbench/public/editor/stage.ts:29` imports
>   `buildAssembly`/`creatureSpec`; `viewer.ts:59-60` already calls
>   `loadTileModels` and `createPropField`. Vite serves the workbench's TypeScript
>   raw (`npm run workbench`).
> - **`Island` is trivial to fake**: `src/island/world/grid.ts:46` is just
>   `{ tiles: ReadonlyMap<string, TileType> }`. Seven entries is a seven-hex
>   island. `createTileField` (`src/island/world/tiles.ts:146`) renders it
>   standalone — `viewer.ts` already does exactly this.
> - **The wander loop needs no extraction.** `createPetField(base, rng)`
>   (`pets.ts:607`) already takes `island`, `hexSize`, `dt` and `t` *injected* per
>   call — `sync(pets, island, hexSize)` and `update(dt, t, island, hexSize)`. The
>   editor just drives it. **Do not write a second loop**, and you should not need
>   ports either; if you think you do, say why in the commit.
> - The one real problem: the editor shows an UNSAVED draft (`def` in
>   `joe/species-edits.json`), not a registered species, so `prototype()`'s id
>   lookup will not find the draft geometry. Expect to need a "build this exact
>   spec" injection point beside the id lookup. That is the actual design work of
>   half two.
>
> **Direction of dependency is fixed:** the workbench may import `src/`; `src/`
> may never import the workbench.
>
> ### Landmines paid for this run
>
> - **`npm run channel` greps `src/` for the workbench's directory name
>   TEXTUALLY.** A mention in a *comment* fails the gate exactly as an import
>   would. My marker comment tripped it. The note is now in `moves.ts` itself.
> - **The base SHA in a brief can be a stale amend.** I was given `46b6a5c`; HEAD
>   was `657802a` — same message, same parent, different object. Check ancestry
>   before believing you are on the wrong tree.
> - **Two managers shared this worktree all evening.** Staging by explicit path
>   is what kept the commits clean; `git status` showed 22 modified files of which
>   only 17 were mine. Do not `git add -A`, and do not assume a modified file is
>   yours because you expected to touch it.
> - `push.mjs` `withRecord` **skips rather than updates** an existing record. Any
>   future per-species value authored in the editor hits this same wall. A
>   workbench-owned lookup table is the way round it.
>
> ### Gate results, on the full tree, before both commits
>
> ```
> tsc      0 errors
> npm test 150 files, 3339 tests passing   (baseline was 3310)
> build    PWA generateSW, precache 50 entries, 1844.65 KiB
> smoke    all boot checks passed
> parity   every step renders identically
> channel  channel check passed
> ```
>
> ### What is blocked on Joe
>
> - **Signing off the thirty** (Garden 14, Night Time 13, corn snake, goldfish,
>   crocodile) — still blocked, because PB-067's preview is the gate and it is not
>   built. He can now set each animal's `moves` in the editor, which was the other
>   half of what he asked for.
> - **PB-070**: tell him that sign-off alone will not make an animal appear.
> - Everything in the previous block's "blocked on Joe" list still stands: JT-040
>   the goldfish tail, the five non-uniform stretches, ostrich/vulture wings,
>   Oliver's −8%, JT-030 Night Time's three unfillable frames.
>
> ### Decisions
>
> - **RAISED into `joe/tasks.json`: none.** The one design fork this run (union
>   vs. boolean bag) was put to Fable, which judged it an engineering call rather
>   than Joe's, on the grounds that his judgement is *which word per animal* and
>   the union preserves that exactly. Made it, recorded the reasoning in `45c4f8b`.
> - **PICKED UP: none.** No `type: "ruling"` task was newly `done` with a note.
>
> ### One loose end for the drumbeat — an orphaned card reference
>
> A manager running in parallel with me committed **`6d672e6` "fix(PB-070): the
> card drawer names all four of its shapes"**, which changes
> `tools/workbench/public/editor/library.ts`. **It never added a PB-070 card**,
> and by the time I dealt an id from `nextId` the slot was free, so `PB-070` in
> the backlog is now *"a signed-off animal still cannot be dealt"* — an unrelated
> card.
>
> There is no duplicate: one card, one id, `nextId` is 71. But `6d672e6`'s subject
> line points at a card that does not describe it. I left my card alone rather
> than renumbering, because moving it would have falsified two of my own commit
> messages and left `6d672e6` orphaned regardless. **The fix is to raise the card
> drawer work as its own id and note the mismatch** — it is not mine to write,
> because I do not know what that manager intended it to say.

> ## Superseded — state at handover, 2 Aug 2026 (evening)
>
> *Written by the drumbeat for a FRESH SESSION, at Joe's request, immediately
> before a context clear. HISTORY as of the late-evening block above; kept for its
> reasoning. The block below it is the morning's handover, and everything under
> that is older still.*
>
> ### Where the tree is
>
> **`main` at the tip, PUSHED, `origin/main` level.** Deployed and verified live:
> bundle `index-32T4lIwv.js`. All five gates green on the pushed tree — `tsc` 0,
> **3310 tests**, build, smoke, parity.
>
> **This is the first push in a while that made the game SMALLER, on purpose.**
>
> ```
>   Base Set    24/24   Kenney's own pack, never ours
>   Garden      14/14   hand-assembled — the only complete collection
>   Night Time  13/16   bat, sugar glider, scorpion want shapes the bank lacks
>   Home Pets    2/16   corn snake, goldfish
>   Africa       1/16   crocodile
>   Farm         0/16   all sixteen were kit-built
>   Woodland     0/16   all sixteen were kit-built
> ```
>
> Registry went **113 -> 54**. The 59 kit-built species are deleted. `roster.ts`
> is UNTOUCHED and must stay so: it says what a collection WILL hold, the
> collection files say what is BUILT, and "rostered but not built" is the
> ordinary state. A deleted species renders as an unmet frame, NOT as a blocky
> model — verified against the live bundle, not assumed.
>
> **The kit machinery is now dead code.** `src/island/species/kit.ts` and
> `kits/*` still exist and nothing uses them. Removing them was deliberately not
> done in the same change as the deletion; it is a clean follow-up.
>
> ### The one thing that changes everything else
>
> **Joe retired the KIT route and set a SIGN-OFF GATE.** Two rulings, both made
> today, and together they mean the game's animal roster is deliberately about to
> shrink to almost nothing so it can be rebuilt properly:
>
> 1. **JT-034 / JT-042 — the kit-built species are rejected work.** *"only the
>    garden animals have been built to spec. the ones i can see in outline in the
>    album for africa and home pets are the old blocky ones that can be deleted to
>    be honest. do not build any more of them."* Then, explicitly: *"remove all the
>    blocky ones from the game completely, including the album. get that shipped"*,
>    and — the reason deletion became safe — *"delete, the blocky ones, she has not
>    collected any of them yet."*
> 2. **The sign-off gate, RETROACTIVE.** *"only animals that i have signed off in
>    the editor end up on the game, local or live."* Asked whether that binds the
>    30 already built, he chose retroactive: unsigned means not in the game.
>
> **He confirmed the resulting empty album is INTENTIONAL:** *"noted on the album
> state after all the pushes. that is intentional. it needs a clean baseline so i
> can get on with building and deploying all the new animals."* Do not treat the
> shrunken roster as a regression and do not "restore" anything.
>
> ### What counts as a real animal now
>
> **Only the hand-assembled ones**, in `src/island/species/parts/assembled/`.
> The Garden fourteen are the exemplars — match those. The corn snake, goldfish
> and crocodile are also on the assembly route but are newer and less reviewed,
> and all three carry a non-uniform stretch Joe has flagged, so do NOT copy them
> as a standard.
>
> **Beware `shippedIn()`.** It counts REGISTERED species and cannot tell a
> hand-assembled animal from a kit-built one. It reported 100 of 320 this morning
> and the true figure to spec was 17. That mistake was made and corrected in this
> session; do not make it again.
>
> ### The other rulings made today
>
> - **JT-038 — the shape dropdown groups by ROLE**, not form. Shipped.
> - **JT-041 — primitives only.** Triangle, circle and square are authorised and
>   shipped; nobody authors a named fin, wing, talon, frill, hoof or trunk. So
>   Ocean, Critters, Dinosaurs and Raptors stay unbuildable (64 species) and
>   Birds, Outback and Legendary stay partial. A species run meeting one of those
>   **stops and names the missing part** rather than substituting.
> - **Fred does not splice a name.** *"fred doesnt splice, kids names are just not
>   mentioned, just shown via text."* The child's name is print-only.
>   **UNRESOLVED and worth asking:** whether a PET's name is still spoken by the
>   teacher as its own chained clip (which `voice/scripts.json`'s law 3 says) or
>   is also print-only. This was never put to him.
> - **The owl is PARKED.** PB-056 says she is female, `joe/voices.json` casts
>   Thomas. Joe: *"owl is parked."* Leave the contradiction alone.
>
> ### Where the work stands
>
> **Two managers were in flight at the clear and MUST be checked first:**
> deleting the 59 kit-built species, and the editor's save/status/grouping work.
> If their branches are unmerged, merge, gate and push them — that is the
> outstanding work, and Joe expects it shipped.
>
> **The sign-off gate is NOT BUILT.** It is the next real piece. Joe's rule is
> retroactive, but §19 says nothing a child owns can be lost, and she very likely
> owns Garden pets. The resolution agreed with him: **gate the point where a
> species is DEALT** — nothing unsigned can arrive — **while a pet she already
> owns stays visible and hers.** He was told this and did not object; if he wants
> owned pets to vanish too he will say so.
>
> **Thirty animals need Joe's sign-off** before they are back in the game:
> Garden 14, Night Time 13, corn snake, goldfish, crocodile.
>
> ### STANDING ORDER — a signed-off animal ships with the next push, always
>
> Joe, 2 Aug: *"as a standing order, if there is a new animal that is signed off
> by me, it goes live with the next push, always."* Now written into
> `docs/MANAGER-ORDERS.md`, which is the permanent file — but repeated here
> because it is the half of the sign-off gate that is easy to forget.
>
> **Check for newly signed-off animals before every push and include them.** Not
> to be asked about, deferred, or held back because the rest of a collection is
> unfinished. Unsigned animals never ship; signed ones always do. Sitting on one
> spends the scarcest thing in the project — his attention — and returns nothing.
>
> ### What the editor still needs before sign-off means anything — Joe, 2 Aug
>
> > *"i need to see the animals in the game environment, so in the editor i need
> > to see it on like 7 hex tiles bouncing around like it would in the game. the
> > it gets signed off. editor also needs to let me decide if it flys or bounces
> > on land. later we will confine sea creatures to water tiles only and stop
> > land animals from going into the water."*
>
> Three things, and the first two gate his sign-off rather than following it.
>
> **1. A preview IN THE GAME ENVIRONMENT, not on the stage.** About seven hex
> tiles, the animal wandering and bouncing exactly as it does on the island.
> **This is part of the sign-off flow** — "then it gets signed off" — so it is not
> a separate viewer to be built later and bolted on. He cannot judge an animal
> standing still on a grey turntable; he judges it moving, at distance, on
> ground. The behaviour already exists in `src/island/pets.ts` (`goal`,
> `restFor`, `bounce`, the hover for flyers); the editor stage is
> `tools/workbench/public/editor/stage.ts`. The work is bringing the island's own
> wander loop to the editor rather than writing a second one — a second one would
> drift, and then he would be signing off a thing that does not exist.
>
> **2. Fly or bounce, as HIS decision per species.** Today this is
> `FLYERS` at `pets.ts:51`, a hardcoded `Set` of exactly two ids — `animal-bee`
> and `animal-parrot`. Read the comment above it before touching it: it argues,
> correctly, that this must be a LIST and not a rule, because *"a rule that said
> 'has wings' would put a penguin in the canopy, and every rule anyone could
> write to exclude it is this list wearing a disguise."* That reasoning is
> exactly why it should be a field Joe sets, not a constant a builder edits — it
> is a judgement, and he is the judge.
>
> **The immediate consequence, which is already biting:** no hand-assembled
> species can be marked as flying at all, because the set names only two Base Set
> ids. Night Time's **nightjar** is a bird that cannot fly, and the **kiwi**
> correctly should not — but nothing can currently express the difference.
>
> **3. LATER, explicitly his word: water.** Sea creatures confined to water
> tiles, land animals kept out of the water. Not now. It belongs with habitats
> (PB-017) and the biome ladder (PB-022), and it will want the same per-species
> field the fly/bounce decision creates — so design that field with this coming,
> rather than as a boolean that has to be widened later.
>
> ### What is blocked on Joe
>
> - Signing off those 30, in the editor.
> - **JT-040** — the goldfish's tail is `wedge-15`, the LION's tail, because the
>   bank has no fin, flipper or fluke at all. Whether it reads as a fan is a look.
> - **Five non-uniform stretches, not three.** Goldfish fin, crocodile snout, corn
>   snake coil, firefly lantern ring — and the **Garden tortoise**, which has
>   carried the identical `[1, 1, 0.5]` since long before the others. Rule on the
>   set.
> - **Ostrich and vulture** need a look decision: `wing`, `horn` and `claw` occur
>   **zero** times in the bank, measured, and the pack's own birds have no wings.
> - Whether **−8%** is still the right rate for Oliver (155wpm, against Ryan's 161
>   that it was tuned for).
> - **JT-030** — Night Time ships 13 of 16 and can never complete, so it holds an
>   album slot with three unfillable frames.
>
> ### Operational, and each of these cost real time today
>
> - **Agent worktrees branch from `origin/main`, not local `main`**, and local
>   main runs far ahead because Joe does not push. Fixed by
>   `worktree.baseRef: "head"` in `.claude/settings.local.json`, which applies at
>   SESSION START — so it should be live for you. **Still tell every agent to
>   fast-forward onto local `main` before its first edit**, and give it the SHA
>   and the test baseline. When an agent disputes a baseline, check its branch
>   point before assuming either of you is wrong.
> - **Ban `git stash`, `git checkout <path>` and `git reset --hard` in worker
>   briefs.** Two workers wiped siblings' uncommitted work this way today.
> - **The subagent and web-search caps are session-scoped**; raised to 2000/1000
>   in the same settings file.
> - **Three exhaustive tests flake under CPU contention** — `coast`, `sealing`,
>   `facedecals`. Measured: the coast test is 8.8s alone against a 30s budget and
>   fails past 34s only when the suite competes with a build. **Re-run; do not
>   widen a budget.** PB-065 carries the two honest options.
> - **Joe's LAPTOP cannot play the game's audio** — its Web Audio output is dead
>   while media elements work. The game is fine; the tablet plays both synth and
>   baked. Do not debug the game from his laptop. The two review pages
>   (`fred-voice.html`, `voice-auditions.html`) use media elements and DO work
>   there.
>
> ### Cards raised today, none of them built
>
> **PB-063** the chamfer doc is wrong · **PB-064** bank precision makes two eye
> cards unwearable · **PB-065** the flaky exhaustive tests · **PB-066** one broken
> audio path silences the whole game with no error.

---

> ## Superseded — state at handover, 2 Aug 2026 (morning)
>
> *Written by the drumbeat at Joe's request, for a FRESH SESSION. HISTORY: two
> handovers have replaced this one — see the block at the top of this file. Read
> this block, then Run 15 below for the detail.*
>
> ### Where the tree is
>
> - **`main` at `851b12f`, working tree CLEAN, all five gates green** — verified
>   at that exact commit: `tsc` exit 0, **128 test files / 2859 tests**, build ok,
>   smoke "all boot checks passed", parity "every step renders identically".
> - **34 commits ahead of `origin/main`, and NOTHING IS PUSHED.** That is Joe's
>   instruction, not an oversight — *"keep things local, dont push."* Do not push
>   without asking, and see the Sassoon licence item before you ever do.
> - **Backlog: 31 open / 21 done / 4 parked / 3 planned** (was 39/13 at the start
>   of Run 15). `joe/backlog.json` is authoritative for state.
> - **14 open questions in `joe/tasks.json`.** Five are live and were raised by
>   this run: **JT-030, JT-037, JT-038, JT-039**, plus PB-009's dead-trunk taste
>   note on the card itself.
>
> ### One branch that is deliberately NOT merged
>
> **`pb-051-sassoon-font` (`f0f36b8`)** — PB-051 is BUILT and GREEN and is being
> held off `main` on purpose. The repo is PUBLIC, the zip's `COPYRIGHT.txt` says
> Sassoon is *"licensed, not sold"*, the License Agreement is not on disk, and
> `.gitignore:16` already keeps `Assets/*.zip` out. Merging would be the first
> time the binaries entered public git history, which is the part that survives
> deleting the file later. **This is JT-037 and it is Joe's.** Note the important
> distinction, since it is easy to get wrong: buying a licence would likely permit
> SHIPPING the font, but essentially no commercial font licence permits
> REDISTRIBUTION, and a public repo is redistribution. Free alternatives with the
> same teaching letterforms (single-storey `a`, open-tailed `g`) are **Andika**
> and **Edu QLD/NSW/VIC Beginner**, both OFL, which permit bundling outright.
>
> ### What to work on next
>
> **The no-ruling defect slate is EXHAUSTED.** What remains needs a Joe ruling,
> belongs to a later phase, or is a feature card wanting a spec. So the next work
> is **new species**, which is where Joe pointed when the slate ran dry:
>
> > *"i can see a number of animals in the editor, the garden ones. they are
> > generally good drafts to start manual finishing with. build the remainder in
> > that same style. deterministically, like those."*
>
> **Four are outstanding**, and building all four takes Home Pets and Africa to
> 16/16 — which also unwedges the two permanently-held album slots in JT-030:
> `animal-goldfish` (Home Pets — **the easy one**, the bank has a real fish hull
> `box-20` and its shell-band `box-19`), then `animal-crocodile`,
> `animal-ostrich`, `animal-vulture` (Africa, 13 of 16).
>
> **Read `PB-036`'s note in `joe/backlog.json` before starting.** It carries the
> recipe and the three traps, the sharpest being: **a donor's burial only
> transfers if its attachment axis does** (a shape picked on a 0.933 burial
> predicted 0.019 proud and delivered 0.141, because it was a forward-facing ear
> and a ridge mounts radially — only `y +1` shapes carry a usable number), and
> **"a species is a file and a line" is optimistic — it is eight places.**
>
> **Two things are Joe's before the birds get built:** the bank has **no `wing`,
> `horn` or `claw` shapes at all**, and the pack's own birds (parrot, chick,
> penguin) have no wings either — they are a fused hull plus beak, legs and eye
> cards. So how the ostrich and vulture should read is a look decision, not a
> measurement.
>
> ### Operational, and it cost this run real capacity
>
> **The 200-subagent and 200-web-search caps are SESSION-scoped, and `/clear`
> does NOT reset them.** Run 15 proved it: zero web searches were made all run,
> yet the budget was already 200/200 from earlier work in the same terminal. Both
> ran out mid-run and the drumbeat had to build in its own context, which is
> exactly what the manager arrangement exists to avoid. **Start long runs in a
> FRESH terminal**, or raise `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` and
> `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`.
>
> ### Where the detail lives
>
> `docs/handoffs/` — one per card: `PB-052-053`, `PB-058-055`, `PB-054-009`,
> `PB-047`, `PB-036-editor`, `PB-051`. `docs/asset-loading-survey.md` is PB-048's
> deliverable. `docs/PB036-HANDOFF.md` is the species baton.
>
> ### To see the animals
>
> `npm run workbench`, then `http://127.0.0.1:4173/editor/`. `strictPort` is on:
> if 4173 is taken it fails loudly — kill that PID rather than accept a fallback,
> or you will be looking at a stale tree. There are **15 definitions** now.

---

## Run 15 (drumbeat, parallel defect burn-down) — 1 Aug. PREPENDED, NOT OVERWRITTEN.

*Joe went away for ten hours with one instruction: pick pieces that can be
built independently, keep it local, don't push, don't make more work, burn the
backlog down. Six managers ran in isolated git worktrees; the drumbeat merged
each one and kept `joe/*.json` centrally so parallel runs could not conflict.*

**Backlog moved 39 open / 13 done → 31 open / 21 done. Nothing pushed.
`origin/main` is behind on purpose.**

*The run continued past this entry's first draft: after the six managers came
PB-014 (done directly, once the subagent cap blocked dispatch), the PB-010 and
PB-048 surveys, and then — on a later instruction from Joe — the restart of
species building with `animal-corn-snake`. The START HERE block at the top of
this file is the current state; this section is how it got there.*

### Shipped and merged, all five gates green on the MERGED tree

| Card | What actually happened |
|---|---|
| PB-052 | Sealed pet now **relocated**, per Joe's JT-033 ruling. The card's walkability layer was NOT built. |
| PB-053 | Refused mountain gets a second try with a narrower peak. 2763 refusals before and after, 0 bare hexes. |
| PB-055 | **There are no JPGs and never were.** Real cost was a duplicate `GLTFLoader` re-fetching 3.26 MB. |
| PB-058 | `HELD_BACK` derived from `shippedIn()` with a tripwire test; `advance()` prunes, but only when she owns nothing. |
| PB-054 | Rng threaded through `pets.ts`; test seeds it. 1-in-14 failures → 0 in 16. |
| PB-009 | Test corrected, render deliberately untouched. Dead trunks **do not flicker**. |
| PB-047 | Wipe becomes three tick-boxes. Nearly deleted her name — see below. |
| PB-036 ph.7 | All five editor notes + the `CREATURE_DEFS` debt. Snap bug was **arithmetic**, not the gizmo. |
| PB-014 | Prop 404 silenced with a `LoadingManager`. **The broken reference is load-bearing** — see below. |
| PB-036 | `animal-corn-snake` built on the assembly route. **Home Pets 14 → 15 of 16.** |

**Also surveyed and deliberately NOT built: PB-010 and PB-048.** Both have their
findings on their cards; PB-048's survey is `docs/asset-loading-survey.md` and
its five questions are JT-039. Neither should be built before those are answered.

### The three things a future manager most needs to know

1. **Merging three green worktrees produced a RED suite.** Every manager was
   green alone; together, `sealing.test.ts` and `governors.test.ts` timed out at
   the 5s default (9.2s and 5.5s). Fixed in `3c29614` by giving both a real time
   budget, not a smaller job. **Always run the full suite after a merge — a
   green worktree is not evidence about the merged tree.**
2. **`fromSave` treats an empty tile list as "no save at all"** and its fresh
   branch returns `childName: ''`. The obvious spelling of an island wipe would
   therefore have destroyed her name with nobody ticking the name box — a §19
   violation arriving through the one feature allowed to delete her things. A
   fresh island is now written as `createFlow()`'s single grass tile. Pinned by
   a test named after the landmine.
3. **Cards were wrong about themselves, repeatedly, and the corrections are on
   the cards.** PB-054's "load-sensitive" diagnosis was wrong (the test reset
   position while `goal`/`restFor` are pet state too) and its claim that
   `governors.test.ts` shares the cause was false. PB-009's trunks don't
   flicker. PB-055's JPGs don't exist. PB-058's list of six buildable
   collections was stale. **Re-measure a card's premise before building to it.**

4. **Two fixes that look obvious and are wrong.** PB-014: deleting the missing
   texture from the 37 prop glTFs removes the `baseColorTexture` declaration,
   which is what compiles the map define into the shader — and nothing calls
   `needsUpdate` after assigning `.map`. The broken reference is load-bearing;
   strip it and every prop renders untextured. PB-010: sharing the blob-shadow
   material removes **zero** draw calls, because three.js counts them per mesh.

### The scale question is already answered, and it was not answered by loading

From the PB-048 survey: a Kenney GLB costs ~141 KB per species, so 296 would be
~41.7 MB. A parts-bank definition costs ~9.9 KB of source, so 296 are ~2.9 MB.
**The kits solved it.** What remains is eager *parsing* — one JS chunk, so every
unlocked-never species is parsed at boot while JT-027 caps her at four open
collections. Do not design a loading strategy on the assumption the roster will
not fit; it already does.

Also measured, and not previously known: **the game does not work offline.**
`vite.island.config.ts:69` precaches js/css/html/woff2 with no `runtimeCaching`
— 8 entries, not one 3D model. Whether that is a defect is Joe's JT-039 q3.

### Blocked on Joe, not on us

- **JT-037 — the Sassoon licence.** PB-051 is BUILT AND GREEN but deliberately
  **not merged**, held on branch `pb-051-sassoon-font`. The repo is public,
  Sassoon is "licensed, not sold", the agreement is not on disk, and
  `.gitignore:16` already keeps `Assets/*.zip` out. Merging would be the first
  time the binaries entered public git history, which is the part that survives
  deleting the file later. Retreat is three edits.
- **JT-030 now wedges the ladder, not just the look.** `completion()` divides by
  ROSTER size, so home-pets (14/16) and africa (13/16) can never complete and
  never free their slot — two of four held forever. Option (c) already needed
  the 80% counted against BUILT members, and that same change unwedges it.
  `completion()` was left alone deliberately; the denominator is Joe's ruling.
- PB-009 taste question: does a 0.25-unit dead trunk want a blob shadow?
  Shadow-by-kind would add blobs to islands that already exist.

### Operational note that cost this run real capacity

**The 200-subagent session cap was hit** partway through, with the PB-047
manager reporting it too. After that the drumbeat did the merge-regression fix
directly. If a run like this is repeated, raise
`CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` first.

### Where the next manager starts

**The no-ruling work is exhausted.** Everything still open either needs a Joe
ruling (JT-030, JT-037, JT-038, JT-039, and PB-009's dead-trunk shadow), belongs
to a later phase (PB-010 beside the Phase 5 lighting rework, PB-005 itself), or
is a feature card that needs a spec first.

So the next run is **new species**, which is where Joe pointed when the defect
slate ran dry — built deterministically the way Garden was. Two things govern it:
the standing verdict in `docs/PB036-HANDOFF.md` that **the editor outranks
building animals** (now partly discharged, since phase 7 shipped all five of his
notes), and the fact that **14 Garden animals and 96 facts still sit unapproved**
in the approver bench. His sign-off is the gate on those, not our throughput.

**Check JT-030 before starting.** If the answer makes `completion()` count built
members rather than rostered ones, that changes which collection is worth
building next — and it is what unwedges home-pets and africa.

---

## Run 10 (ladder manager) — 29 July, ~18:30. PREPENDED, NOT OVERWRITTEN.

*Two managers were live in this tree at once. Run 9's baton below is still
current (JT-033 open, PB-053 unfixed), so overwriting it as the template says
would have destroyed real state. Read both. My ground was `src/core/`,
`src/challenges/`, `src/island/harness.ts` and `joe/`.*

**Joe's fast-track, verbatim:** *"can we fast track some additional summing
levels. it needs at least one between the basic <=10 and the carry level. and
some 3 & 4 letter nouns."*

**Shipped: `521b744`, `1a8fef5`, `9c78b1c` — all pushed, `origin/main` level.**

**The new sums rung is "teens plus units", generator id 3.** The gap was
provable from the sibling path rather than inferred: `STAGE_LABELS.takingAway`
climbs *to ten → teens minus units → anything to twenty*, while addition jumped
from `a+b<=10` straight to a level that ALWAYS bridges ten. The missing step was
addition's own non-regrouping teens rung: `a in [10,18]`, `b in [1, 9-units(a)]`,
sum 11..19, `(a%10)+b <= 9` always.

**The one thing a future reader will want to "tidy" and must not.**
`STAGES.sums` is `[1, 3, 2]` (`harness.ts:63`). The NUMBER is a generator id;
the ARRAY POSITION is the rung. It is not `[1,2,3]` because `golden.json` pins
what level 2 produces, so renumbering reddens a frozen file. There is a comment
saying so at the declaration. Adding a rung is therefore always: append a new
generator id, insert it in `STAGES` at the right ladder position.

**A latent bug this surfaced, now fixed.** `settledOn` compared stage ids
numerically (`s < top`) while `topTicked`/`nextStage` used array order. Harmless
while the two agreed; the moment ladder order diverged from numeric order, a
retired middle rung would never retire. Now compares by ladder index
(`harness.ts:830`). **Anything else that orders stages must use array position.**

**Nobody is demoted, and nobody could have been.** Joe confirmed mid-run: *"no
one is on the next level yet anyway, only in the first on everything."* So no
migration machinery was built. The guarantee is kept in tests instead —
`harness.test.ts` covers ladder order (1→3→2→none), no-demote, `settledOn`
ordering, and Juno's shape of save round-tripped through `toSave`→`fromSave`
with her stage-1 ewma/attempts/ticks intact and stage 3 arriving fresh.

**v0 was edited** (`v0/junos-words.html:981`) — the identical branch, no DOM
touched. Parity therefore still proves both that the two sides agree and that
levels 1 and 2 are unchanged. Say this out loud in any future v0 edit.

**The noun question had a different answer than expected.**
`joe/noun-candidates.json` did not exist and never had — `JT-004` has been open
since the workbench was seeded, waiting on a file that "arrives with Run D", and
Run D never happened. So his red pen had nothing to review. It is now written:
88 clean words (44 three-letter, 44 four-letter), 23 flagged, 35 rejected with
reasons, every word checked against `segmentation.ts` `GRAPHS`, all `verdict`
and `note` fields empty. **This is his twenty minutes, and it now unlocks.**

**But approving them is not shipping them — `JT-035` raised, NEEDS JOE.** GREEN
(`wordlists.ts:17`) cannot be appended to. `makeDeck` deals from the array in
order, `capture.mjs:37` pins the v0 word literals, and `alien.ts:25` spreads
GREEN into `REAL_BLOCK` — so **one extra noun shifts the rng stream behind
`read`, `readL2` AND `build` at once.** Choice is (a) a new list behind a new
reading rung, or (b) a deliberate stated golden re-capture. Nothing is built on
either; a reversal costs nothing today.

**Where the next manager starts:** if `JT-035` has a note, build it — option (a)
is also the front half of queue item 5 (the reading curriculum), since JT-025's
step 1 is literally "adding nouns". If it is still open, the sums ladder now has
three rungs and `takingAway` still has an untouched `else` catch-all at
`sums.ts:48` that silently serves level 3 — the same shape of gap, one path over.

**Gates, run by the manager on the final tree, all five green:** `npm test`
100 files / **2124 passed**, golden included and untouched; `tsc --noEmit` exit
0; `build` ✓ 8 precache entries; `smoke` "all boot checks passed"; `parity`
"every step renders identically", spoken 4/4, score bar `🐚 6`/`🐚 6`.
**Revert-checks went red as required:** reverting the `settledOn` fix failed
*"settles rung 3 as well as rung 1"* (`expected [1] to equal [1,3]`); reverting
`STAGES.sums` failed 18 tests including *"offers 3 above rung one"*. Reported
honestly: the three no-demote tests stay green under both reverts — they guard
the migration invariant, not the ordering, which the block above guards.

---

*Run 9, written 29 July 2026, ~16:20. Read `docs/MANAGER-ORDERS.md` for the job.*

## Queue position

- Items 0-3: DONE (runs 4-8). Do not re-do them.
- Item 4 (**PB-036**): **NOT MINE.** Its own manager is live in this same tree
  right now — see `docs/PB036-HANDOFF.md`. Read the first landmine below before
  you commit anything while it is running.
- **PB-052 (the sealing defect): the buildable half is DONE. The remedy is held
  on `JT-033`, which is still `open` with an empty note.** Detection is built,
  tested, shipped and called by nothing. Nothing here is waiting on me.
- **PB-053: detection built (`bareRockHexes`), cause explained, not fixed.**
- Item 5 (`PB-043`, the reading progression curriculum): NOT STARTED. Still a
  survey-then-ask item, not a build-it item.

## What this run did

Reproduced PB-052 and stopped cleanly at the seam Joe has not ruled on.

**The reproduction, watched failing.** `tests/island/walk.test.ts` measures the
real `props/mountain_*.gltf` geometry off disk, places grass at the origin and
rock on all six neighbours, and asserts a pet of radius **zero** is in a walkable
region that is not the island's. It was red before `walk.ts` existed. The
revert-check is the honest one: making the pinch test ignore the radii turns 6 of
19 red — including `walkableRegions` collapsing to a single region — while all 13
negative controls stay green, so the test is driven by the geometry and not by
bookkeeping.

**The detection is topological, not a constant.** `src/island/world/walk.ts`
models the free space *between* keep-out circles as the hex lattice's **corner
graph**: every side of the lattice is flanked by exactly two adjacent hexes, and
is passable iff the gap between their obstacles leaves `2 * petRadius`. Flood
the corners; a pet is sealed when its component is not the island's. It rests on
one premise — only *adjacent* hex obstacles can pinch, since non-adjacent centres
are 3.4641 apart — and a test asserts that premise against every measured radius,
so a fatter prop one day is a red test rather than a silently under-reporting
model.

**`src/island/world/mountains.ts`** is the pure half of `props.ts` lifted out
(`hash`, `pick`, `MOUNTAIN_HEXES`, `mountainHexFor`, `mountainSpinFor`, all
re-exported from `props.ts` so no importer changed) so that `flow.ts` can ask the
question without importing THREE. It carries the root cause written down as two
measured tables, both re-measured from the real glTF by the tests so neither can
drift: placement uses `MOUNTAIN_FOOTPRINT` (0.938 for A/B, 1.011 for C), pets
collide on `MOUNTAIN_KEEPOUT` (1.027-1.062), adjacent centres are 2.0000.

**PB-053 is now explained rather than counted.** Only C-beside-C is wide enough
to collide; the C models carry 8 of 21 weight; (8/21)² = 14.51%, against 14.40%
measured over 19,182 pairs. And phase 4's warning is confirmed and worse: the
revert-check shows that tightening placement to the walking metric makes
**100%** of rock hexes with a rock neighbour bare, not 14%.

**No remedy was picked.** `sealsAPet` and `sealedLand` are exported, tested, and
called by nothing. The seam is one marked comment block in `tileTypeFor` with all
three of Joe's options costed where each would go.

## Gate results

Tree hash before the gate run and after: **`e05f6106...` both times, identical.**
`git status --porcelain` on `tools/golden/golden.json`, `src/core` and `v0` was
empty at both ends. All five new/changed files are `eol: lf` per `.gitattributes`.

```
$ npx vitest run
 Test Files  97 passed (97)
      Tests  2046 passed (2046)
   Duration  32.10s

$ npx tsc --noEmit -p tsconfig.json
TSC exit=0

$ npm run build
PWA v1.3.0 · mode generateSW · precache 8 entries (773.57 KiB)
files generated  ../../dist/island/sw.js

$ npm run smoke
ok    builds the ambience layer
ok    reading mode is active
all boot checks passed          SMOKE exit=0

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically  PARITY exit=0
```

Those counts (97 files / 2046 tests) include the PB-036 manager's concurrent
uncommitted work, which was in the tree when I gated. It was green too.

**Revert-checks, mine reported separately from my agents'.** Mine: none — I wrote
no test myself; I wrote the seam in `flow.ts` and its comment. My agents watched
four, all reported with the failing messages: (1) `gapBetween` ignoring the radii,
6 of 19 red; (2) `bareRockHexes` on the walking metric, which quantified the 100%
figure above; (3) `sealsAPet` forced `false`, 4 red, two of which only went red
after the agent strengthened two of its own tests it had found vacuous; (4)
`sealedLand` forced `[]`, 3 red — needed because the two functions share no code
path at the flow level. `flow.ts` was confirmed restored by `git hash-object`
before and after each.

**`origin/main` is level.** Confirmed with `git rev-list --count origin/main..HEAD`.

## What happens to an island that is ALREADY sealed

**It cannot be repaired by the child, and this is the finding that should shape
the ruling.** Once a rock tile is committed it can never be retyped
(`askToRetype` only touches the half-built plot, never `island.tiles`) and no
code path anywhere removes a tile — `grid.place` has no inverse. A pet is
re-sited on load at its recorded *hatch* hex (`pets.ts:661-662`), which is the
pocket, and nothing in the game ever moves a pet across a barrier. **A test
round-trips a sealed island through the real save layer and confirms
`sealedLand` still finds the trapped hex, so a rescue can find them.** But there
is no rescue, because writing one *is* Joe's option (c).

So Joe's options A (silent grass) and B (refuse the socket) are **preventive
only** — they do nothing for a girl who has already built the ring. Only (c)
reaches an island in the wild. That is in the JT-033 addendum in his own words'
place, not decided here.

**Worse, and needing no ruling: a new pet can be hatched INSIDE an existing
sealed pocket.** `firstFreeSpot` takes the first tile key no other pet's
*recorded hatch hex* occupies — no tile type check, no reachability check — and
`tests/island/sealing.test.ts` demonstrates a real hatch landing on `0,0` while
`sealedLand` names it. One condition on one loop, about ten minutes. **Not
applied**, because where an animal appears is something a child sees.

## Where the next manager starts

**If `JT-033` has a note, the whole job is at `src/island/flow.ts`, in the
comment block beginning `>>> REMEDY SEAM` immediately above the `if (chosen ===
'rock')` return in `tileTypeFor`.** It names each of Joe's three options and
where each goes; (a) is one line there, (b) additionally needs
`buildableSockets` to drop the hex or she taps a dead socket, and (c) changes
nothing there at all and lives at the pet layer. `sealsAPet(f, a, t)` and
`sealedLand(f)` are ready and tested. Whichever he picks, `tests/island/
sealing.test.ts` has an assertion that `tileTypeFor` still says `'rock'` today —
**update it, do not delete it.**

If `JT-033` is still open, **do not start it**, and do not start a kit either
(`JT-032` gates all kit work and is also open). PB-053 is the honest next piece
of ground: `bareRockHexes` in `mountains.ts` already detects it, and the trap is
written into the code — do not fix it by making placement use the walking metric.

## What I learned that is not in the code

All three are now in `docs/HANDOFF.md` under "Landmines added 29 July"; short
form here:

- **Staging is not a lock.** I staged seven files deliberately, gated them, and
  in the window before `git commit` the parallel PB-036 manager committed with a
  broad add **and pushed**. All my work is in `0369387`, whose message is about
  taking an animal apart. I did **not** rewrite history — it was already on
  `origin/main` and the other manager was still live; rebasing under a running
  agent is a worse fault than an untidy log. **Find PB-052's code by symbol, not
  by commit message.** When another manager is live, commit the instant the
  gates go green.
- **The two "she cannot wall herself in" invariants are different theorems.** The
  corridor one is about building and is true; the walking one had never been
  stated. Neither implies the other, and `flow.ts:524`'s rock exemption is exactly
  where they diverge.
- **The pet radius is provably not a dial.** Every gap on the island is either
  mountain-beside-mountain (already shut at −0.054 to −0.125) or has a mountain
  on one side only (0.937 wide), and the fattest animal needs 0.38. The band a
  radius could act in is empty. I had written the opposite into a comment on the
  strength of it "reading true" and an agent's measurement corrected me; the
  comment now says so.

## Decisions

**RAISED this run:** none — no new `JT` id was minted.

**AMENDED this run:** `JT-033`'s `detail` (the agent-owned field;
`note` and `state` are Joe's, per `tools/workbench/merge.mjs:79-81`). His note
was empty and stayed empty; all 33 notes and states were re-parsed from disk and
confirmed intact, LF preserved, one line of the file changed, committed alone as
`data(workbench)`. The addendum tells him the four measured things, the two that
bear on his choice, and explicitly that **nothing has to be reverted whichever he
picks**.

**PICKED UP this run (his nod):** none. `JT-030`, `JT-032` and `JT-033` are all
still `open` with empty notes — checked at the start of the run. Nothing was
reverted.

**Decided rather than asked:** that detection defaults to `petRadius = 0`, the
strongest form of the claim. It is not a product choice today because the radius
cannot change any answer (above), and the reasoning is in the doc comment on
`sealsAPet`.

**Still open in the workbench:** `JT-001`, `JT-004`, `JT-005`, `JT-006`,
`JT-007`, `JT-023`, `JT-030`, `JT-032`, `JT-033`.
