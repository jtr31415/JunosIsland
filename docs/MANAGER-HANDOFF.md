# Manager handoff

> ## ⚠⚠ NEXT SESSION'S JOB — DRAFT MORE ANIMALS. 4 Aug 2026
>
> *Joe, at the end of a long day: **"get ready for context clear, then you draft
> some more animals."** The build-optimisation job below this block is DONE and
> shipped; this replaces it.*
>
> ### Draft WOODLAND. Sixteen members, zero built.
>
> `PIPELINE_ORDER` (`unlock.ts`) is the album cadence now and it runs
> `base, garden, home-pets, woodland, farm, birds, ocean, night-time, africa, …`
> The first three are released; **woodland is the next collection a child will be
> offered and it has nothing in it.** Farm (16), Night Time (13) and Africa (1)
> are already BUILT and merely unpushed — Joe can release those whenever he likes
> without anyone building anything.
>
> ### How to build one, in 2026 terms
>
> An animal is ONE file — `src/island/species/parts/assembled/animal-<id>.ts` —
> plus a line in `parts/assembled/index.ts`, a record in
> `collections/woodland.ts`, and a `MOVES` entry. `docs/how-the-animals-are-made.md`
> and `building-animals-from-parts.md` are the method.
>
> **DO NOT WRITE A TEST FOR AN ANIMAL.** Joe, 4 Aug: *"we do not need to test the
> animals. if they look good in the editor, they go. its costing a shit ton of
> time for needless tests."* Sixty per-animal test files — 24,324 lines — were
> deleted that day. `tests/island/assembly-engine.test.ts` sweeps the BUILDER's
> invariants over every species automatically, so a new animal is covered the
> moment its file exists and needs nothing written for it. Adding a per-animal
> test file is undoing a ruling.
>
> **Prose in a species file is now ~15 lines, not ~220** (3 Aug ruling). Say what
> the animal is and why any strained rule was strained. Nothing else.
>
> ### What Joe does next, not you
>
> He opens the workbench (`npm run workbench`), looks at each animal, edits it,
> and presses push. **His eyes are the gate** — `signed-off.json` is where that is
> recorded and `pool.ts` enforces it. Nothing you build reaches Juno until he
> pushes it, and nothing you think about how it looks outranks him.

---

## 4 August 2026 — what shipped, and the rulings behind it

Seven deploys, all green, all live. `git log 8ad1e21..` is the record; this is
what a reader needs that the diffs do not say.

### Joe's rulings that day, in the order he gave them

1. **"i have completed the garden collection"** — Garden 14/14, then Home Pets
   15/16 (`animal-rat` still to come). 29 species signed off.
2. **"i only want to see in the album the silhouette cards for the animals that
   have successfully pushed."** REVERSES his 2 Aug ruling that a slot appears
   when a species is BUILT. `built.ts:isReleased` is the predicate now.
3. **"we do not need to test the animals ... they should turn from the editor
   into code pretty much the instant i press the button."**
4. **"we rename once, kids will live through it"** — the one save migration.
5. **"i need the 20 word limit in the editor gone ... let me worry about length."**
6. **"keep them the same size"** (album pages) and **"have 3 albums on the go"**
   with a set order, 50/35/15.
7. **"add some more summation levels"**, then **"switch rung 4 and 5."**

### Landmines found and closed — read these before touching the same ground

- **Baking a parts-bank role RENUMBERS THE BANK.** Ids are `<form>-<NN>` from a
  running counter over the groups that bake, so adding `wing` moved `box-31` from
  the lion's hull to its mane band and `blade-03` from the dog's nose to the
  bee's wing. Nothing fails to compile; the newt's crest silently becomes bee
  wings. `NUMBERING_FROZEN_BY` in `parts-bank.ts` now pins the order and new
  roles can only append. `parts-bank-wing.test.ts` holds the three anchors.
- **The push tool orphaned constants on every push.** It replaces the object
  literal and carries the rest of the file over — correct — but inlines the
  values, leaving `const`s unread and `tsc --noEmit` red, which gates the deploy.
  Thirteen pushes left 39 of them. `withoutStaleBindings` cuts them now, keeping
  each comment with the old value written in.
- **`golden.json` may never be re-blessed.** It pins generator streams. Two
  changes that day had to route around it: new sum levels got NEW ids (1 and 2
  untouched), and the find-page cap is applied to the dealt page in `deal.ts`
  rather than to `generateRead`'s `n`, which would move every number in the
  pinned stream.
- **`pages.wordsPerFindPage` was dead config** — declared, typed, read by
  nothing. Replaced by `maxFindWords`, which is wired.
- **`core/names.ts`'s forbidden list still lacks `fuck`, `cunt` and `vag`.** That
  gap is how a six-year-old got a rabbit called *Defuck* (one accepted draw in
  678). The base 24 and every deployed name are now PINNED in `name-pins.json`,
  so they cannot drift — but the 266 unpushed species still draw through that
  gap. Joe knows and is vetting them himself.

### Open, and all Joe's

- `animal-rat` (Home Pets 16th), and the two names he has not looked at:
  everything outside base/garden/home-pets is unpinned by his choice.
- Farm, Night Time, Africa: built, unpushed. One push each makes them albums.
- The bat, sugar glider, ostrich and vulture are UNBLOCKED by the wing but
  unbuilt — a bat's membrane is not a bird's wing and that is his call.
- S4 missing-number (`4 + ? = 9`) is specced and not built: `mountSum` computes
  `a + b`, so it is a renderer change before it is a generator one.


---

> ## ⚠⚠ NEXT SESSION'S JOB — OPTIMISE THE BUILD. Build no animals. 3 Aug 2026
>
> *Joe's instruction: the next session **focuses on optimising our build, not
> building anything specifically.** Do not start a collection. Do not push
> animals. The work below IS the work.*
>
> ### Why, in his words
>
> *"yesterday i blew 40% of a max 20 subscription and all i really have to show
> for it is 5, maybe 11 new animals on the game. it also took like 12 hours...
> fundamentally, we need to look at the project settings to make this more
> efficient, **im building a kids game, not a banking OS**."*
>
> He is right and the numbers agree with him. Measured from the agents' own
> reports: **~2.25M output tokens over 14 agent runs**, and only **~535k of it
> built animals** (30 of them). ~1.2M went on discovering the pipeline was broken
> in five separate SILENT ways — invisible mouth, pet that 404s and is dropped
> without a word, push that writes nothing and reports success, an obscenity
> generator, an unlocker that would never open the next collection. ~500k went on
> merge reconciliation and test surgery.
>
> **That pipeline work was real and it is now DONE.** Steady-state an animal is
> ~18k tokens, not 75k. The rest is the five changes below.
>
> ### The five changes. He reviewed them and said "that is all good and correct."
>
> **1. Worker agents run on a cheaper model.** Top model for design and diagnosis
> only. Building an animal from a pre-measured digest, updating a stale test,
> writing a collection record — none of it needs Opus. **Single biggest lever.**
>
> **2. Stop fingerprint-pinning individual animals.** `assembly-fingerprint.test.ts`
> and the per-species world-space pins. Test the ENGINE instead — feet on the
> ground, one hull, triangle budget, every mesh traces to the bank. He is the
> reviewer and the editor shows him the animal. Per-animal pins tax every edit he
> makes and are exactly what reported six of his own deliberate changes as damage.
>
> **3. Pack norms become warnings, never failures.** `PACK_HEIGHT_MIN`, rule 9's
> 405-vertex floor, the leg-sink range — all measurements of Kenney's twenty-four,
> written when the job was MATCHING that pack. He is designing now.
> `AssemblyClaims.outsideHeightBand` and `legRowMoved` are the started version;
> finish the job so a norm reports rather than fails.
>
> **4. Species prose drops to a short rationale**, ~15 lines rather than ~220. The
> essays existed because context died between sessions under the manager
> arrangement, which is now stood down. Keep the reasoning for a genuinely
> surprising choice; drop the per-number justification.
>
> **5. One agent per collection, ONE wave, with a pre-measured digest.** Measured
> on Farm: a wave costs whatever its slowest agent costs, so sixteen animals in one
> wave is ~45 min regardless of how many run beside each other. Handing every
> worker one digest instead of letting each re-read the specs killed the largest
> single cost of the Home Pets run.
>
> ### What NOT to cut
>
> **The gates.** Full suite, `tsc`, build, smoke, parity, channel. They are cheap
> in TOKENS — they cost CPU, not context — and they stopped a broken build reaching
> Juno more than once. Cutting them would be optimising the wrong axis.
>
> ### The target
>
> A 16-animal collection for roughly **a fifth** of what Farm cost. Farm was 132
> minutes and ~195k tokens for sixteen.
>
> ### Where to start
>
> The 8 remaining red tests are the perfect first case, because they are the tax
> this whole plan is about: dormouse 4, vole 2, mole 1, squirrel 1, all of them
> pack norms or world-space pins failing on Joe's deliberate edits. Fixing them by
> DELETING the per-animal pins rather than re-pinning them is change 2 and change 3
> done on a live example.

---

> ## ⚠⚠ START HERE — 3 Aug 2026, morning. THE MANAGER ARRANGEMENT IS OVER.
>
> *Joe: **"stop the manager rule, you can resume your usual job of running
> things."** The drumbeat/manager split is stood down. Work directly; use
> subagents when they help, not as a required layer. **Keep the isolated
> worktrees** — they were the one unambiguous win.*
>
> ### Where the tree is
>
> `main` and `origin/main` level, deployed. `tsc` **0**; build, smoke, parity,
> channel green. **4530-odd passing, 8 failing** — and read the next section
> before touching those 8.
>
> ### JUNO CAN NOW MEET ELEVEN HAND-ASSEMBLED ANIMALS
>
> badger · dormouse · hedgehog · mole · mouse · salamander · slow-worm · squirrel
> · toad · tortoise · vole. Signed off, dealable, live. Every animal she had met
> before today was one of Kenney's original twenty-four.
>
> Frog, newt and shrew are Garden's remaining three and are NOT pushed. Home Pets
> 16/16 and Farm 16/16 are BUILT but unsigned, so they cannot be dealt — 60
> species in the tree, 35 of them awaiting his push.
>
> ### THE MISTAKE THIS SESSION MADE, AND IT COST A WHOLE EVENING
>
> A manager reported **six of Joe's eleven animals as "damaged by the push tool"**,
> with measured numbers. It was relayed to him as fact, five animals were withheld
> from shipping, and a 19-test "damage guard" was left red to protect his daughter
> from them.
>
> **Every one was his own deliberate edit.** He replaced the dormouse's and
> tortoise's tails with other parts, re-sited the squirrel's tail (his own SD-001
> draft), repainted the vole's, changed the mole's feet and rotated its claws, and
> turned the slow worm's coil onto its back — *"i decided that snake like animals
> are extended to the back and not propped up at the bottom."* His reply: **"all
> my decisions. why am i being second guessed here?"**
>
> **The cause is structural and it will recur.** The assembly tests assert
> `PACK_HEIGHT_MIN` 1.43, rule 9's 405-vertex floor and the pack's leg-sink range.
> Those are **measurements of Kenney's twenty-four**, written when the job was
> making new animals sit beside that pack. He is DESIGNING now. So a deliberate
> silhouette arrives looking like a regression with an authoritative number
> attached, and a manager reading only the failure calls it damage.
>
> **`git show <commit> -- <file>` BEFORE calling anything damaged.** Replaced-and-
> substituted reads nothing like dropped. If it was his, the TEST is wrong.
>
> ### The two sanctioned opt-outs, and how to add more
>
> `AssemblyClaims.outsideHeightBand` and `AssemblyClaims.legRowMoved`
> (`tests/island/assembly-assert.ts`). Each takes a written reason and is **checked
> in BOTH directions** — bring the animal back inside the norm and the claim fails,
> so an opt-out cannot rot into a lie. Copy that shape for any further pack norm.
>
> **Feet on y = 0 is never waived**, because it is a real invariant rather than a
> description: `buildAssembly` grounds every species by translating its lowest
> point to the floor on every build. Measured across all 60 — every one sits at
> exactly 0.000000. **Nothing in this game is floating, and the auto-reground Joe
> asked for already exists.**
>
> ### The 8 remaining reds — descriptions, NOT guards
>
> dormouse 4 · vole 2 · mole 1 · squirrel 1. Same class: pack norms against his
> decisions, plus world-space pins. **No animal is broken behind them.** Joe:
> *"dont burn tokens on tests that fails stuff that shouldnt be failed."* Rewrite
> them to describe the animals he built, or declare the opt-out; delete outright
> any test pinning a decision he has overturned.
>
> One fix worth copying: the squirrel's ear, muzzle and eye all failed by an
> identical 0.00628 because they compared WORLD positions against bank offsets —
> silently asserting where the animal's floor happens to be. A `local()` helper
> takes the grounding translation back off. Three "wrong" parts that had not moved.
>
> ### Still open for Joe
>
> **JT-045** rename Juno's `Defuck` pet or leave it · **JT-049** water buffalo vs
> Africa's Cape buffalo · **JT-050** eyes on a long neck · **PB-079** the
> see-through hole in the shrew and newt (27% and 31% of their album portraits are
> sky) · the budgie's blue-or-green contradiction · **PB-082** the round-trip
> guard's 5s budget, now at 60 species · **PB-077**, whose named fix at
> `def.ts:1313` turned out to be a NO-OP — the real fix changes the push wire
> format, and it is what truncates his geometry to six decimals.
>
> ### Two measurements worth keeping
>
> **A collection is about an hour.** Farm: 132 min for 16. Handing every worker ONE
> pre-measured digest killed the biggest cost; fanning out in waves did not help,
> because a wave costs whatever its slowest agent costs.
>
> **Seven card-id collisions in two days**, every one from parallel agents dealing
> out of a single `nextId`. The rule that works: the record already on `origin`
> keeps its id, the newer one moves and says so in its own text.

---

> ## ⚠⚠ DRUMBEAT — WHY LOCAL `main` IS NOT PUSHED, 3 Aug 2026 (small hours)
>
> *Written by the drumbeat as it stood down. **Read this before you push anything.**
> Everything below is the managers' own blocks and remains true.*
>
> ### The state
>
> Local `main` is **`ea9d733`**, and `origin/main` is **`c6cb2e3`** — a long way
> behind. Six merges are local-only. `tsc` **0**; build, smoke, parity and channel
> green; **4521 passing and 19 failing.**
>
> ### THE 19 RED TESTS ARE A GUARD. DO NOT MAKE THEM GREEN.
>
> `assembly-squirrel` 7 · `assembly-dormouse` 4 · `assembly-slow-worm` 3 ·
> `assembly-vole` 2 · `assembly-mole` 1 · `assembly-corn-snake` 1 ·
> `gallery-source` 1.
>
> Joe pushed eleven Garden animals from the editor and **the push tool damaged
> six of them.** Measured: the slow-worm is 1.3312 against `PACK_HEIGHT_MIN` 1.43
> **and off the ground**; the mole is 389 verts against rule 9's floor of 405; the
> squirrel's tail joined **0.1375 inside its body**; the dormouse and tortoise lost
> their tails; the vole's tail sits 0.24 off the bank.
>
> **Sign-off now means dealable** (his ruling: pressing "push to game" IS signing
> off), and all eleven are signed off. So these 19 tests are the only thing between
> a broken animal and his six-year-old daughter. **A green suite here would mean
> the guard was removed, not that the animals were fixed.**
>
> Nothing was reverted, deliberately: telling a tool artefact from Joe's own edit
> is the guess that destroys his work — he removed a bespoke nose on purpose the
> same night and it was indistinguishable from a regression in the code. The
> measured numbers and one-line fixes are in **JT-048**.
>
> ### The decision the next session is waiting on — Joe's, not yours
>
> Put to him and unanswered when the session ended:
>
> 1. **Fix the six**, then push all eleven. Highest-value single repair is the slow
>    worm's coil (`animal-slow-worm.ts:171-174`) — it clears **5 of the 19** at once,
>    and `assembly-corn-snake` and `gallery-source` clear with it, because both read
>    the slow worm's module as their oracle rather than being damaged themselves.
> 2. **Ship the clean five** — hedgehog, badger, mouse, salamander, toad — and
>    withhold the six until fixed.
> 3. **Hold everything** until he has looked at them.
>
> ### What is waiting to go live the moment that clears
>
> Home Pets 16/16 and **Farm 16/16** (both unsigned, so neither reaches a child);
> the album showing only built animals; the unlocker counting built rather than
> rostered, with unlocks ratcheted so a content push can never take back an album;
> push writing sign-off; and the obscenity fix — **already pushed**, that one.
>
> ### Also open for him
>
> **JT-045** rename Juno's `Defuck` pet, or leave it · **JT-047** ruled, note still
> empty · **JT-049** water buffalo vs Africa's Cape buffalo · **JT-050** eyes on a
> long neck · **PB-079** the see-through hole in the shrew and newt · the budgie's
> blue-or-green contradiction · **PB-082** the round-trip guard's budget, now at 60
> species · **PB-077**, whose named fix was a NO-OP: `defineCreature` has registered
> every def since `2b320ab`, and registration cannot help because it receives an
> already-evaluated object. The real fix changes the push wire format.
>
> ### Operational, learned the hard way
>
> **Seven card-id collisions in two days.** Every parallel manager deals itself an
> id from one `nextId` and they collide every time. The rule that works: the record
> already on `origin` keeps its id, the newer one moves and says so in its own text.
> **Isolated worktrees fixed the shared-tree contention** and should stay.
>
> **A collection takes about an hour, not two, and here is the measurement.** Farm:
> 132 min for 16 — orientation 7.5, wave 1 45, wave 2 46, integration 6, fixes 13,
> gates 8. Handing ONE pre-measured digest to every worker killed the biggest cost.
> **Fanning out in waves did not help**: a wave costs whatever its slowest agent
> costs, and builds ran 10–46 min regardless of how many ran beside them. Next
> collection: one digest, ONE wave of sixteen.

---

> ## ⚠ START HERE — state at handover, 3 Aug 2026 (merge-fallout run)
>
> *Written by the manager that separated the merge fallout from the real damage.
> **This block is the current one.** Everything below it is history, including
> the ones that call themselves current — they were, earlier.*
>
> ### The one thing to understand before you touch anything
>
> **19 tests are RED ON PURPOSE and they are the only thing standing between a
> broken animal and a six-year-old.** They are JT-048 — six animals the push tool
> damaged, which are now *signed off*, and sign-off means dealable. Do not fix
> them, do not skip them, do not soften an assertion, and above all **do not
> re-pin their fingerprints**: re-pinning certifies the damage as intended and
> the guard is gone. JT-048 carries the measured numbers and awaits Joe's ruling.
>
> ### Branch and state
>
> Branch **`worktree-agent-ae0827dceef35af96`**, branched at `3a27980` (local
> `main`, the Farm merge). **Nothing is pushed and nothing is merged.** Two
> commits: `1a2fedd` (the sixteen Farm pins) and `01bd0ac` (counts, album table,
> stand-ins), plus this handoff.
>
> ### The arithmetic, which is the whole report
>
> | | before | after |
> |---|---|---|
> | failing tests | **29** | **19** |
> | failing files | 12 | 7 |
> | passing tests | 4495 | **4521** |
>
> +26 passes = 10 repaired + **16 brand-new** per-species pin assertions.
>
> **Every one of the 19 remaining reds is JT-048, by name:** `assembly-squirrel`
> 7, `assembly-dormouse` 4, `assembly-slow-worm` 3, `assembly-vole` 2,
> `assembly-mole` 1, `assembly-corn-snake` 1, `gallery-source` 1. That is exactly
> the tally the sign-off manager left. **No Group B test went green.**
>
> ### ⚠ TWO CORRECTIONS TO THE SPLIT I WAS HANDED — both established from evidence
>
> **1. `tests/tools/gallery-source.test.ts` is NOT merge fallout. It is JT-048.**
> My brief listed it as Farm fallout, "likely the same cause". It is not, and I
> did not touch it. The failing quantity is `h * shared > 0.85` at
> `gallery-source.test.ts:417`. `shared` is **not** derived from the species set
> — it is `1 / PACK_HEIGHT_MEDIAN`, regex-read out of a hardcoded `1.611185` in
> `tools/workbench/public/viewer.ts:301`, untouched since 30 July. So the failing
> number is one species' height times a constant:
> `1.3311521428883073 × 0.620661190366097 = 0.8261944735634377` — **the damaged
> slow-worm**. Measured four ways: all 60 species `0.8261944735634377` (FAIL);
> **excluding Farm's 16, bit-identical `0.8261944735634377` (FAIL)**; excluding
> the slow-worm alone `0.8883030117690841` (PASS). Farm changes it by *nothing*.
> Farm's tallest (donkey, mule at 2.009953) merely tie the pre-existing fennec-fox
> maximum, so they do not widen the band either. **This test was already red
> before Farm merged.**
>
> **2. `assembly-corn-snake` is JT-048 collateral, not a damaged animal.** The
> corn snake was never pushed and never touched: `git log --follow` on
> `animal-corn-snake.ts` shows **one commit ever**, `b687fc9`, predating the
> sign-off merge; it appears in no diff of `6413d21`. **19 of its 20 assertions
> pass** — its own height 1.5504, feet on y=0, 502 verts. The single red,
> `assembly-corn-snake.test.ts:136`, is a *cross-species agreement* test whose
> EXPECTED side is read live out of the slow worm's module. The corn snake is the
> surviving correct copy of that coil; the oracle moved, not the animal. The diff
> is a readout of the damage: `stretch` z `1 -> 1.1`, x/y truncated
> `0.7490636704119851 -> 0.749064`, and the 90° spin **duplicated** to 180°.
>
> **Both of these go green the moment the slow-worm's coil is repaired, and that
> is exactly why neither may be touched now.** They are two independent witnesses
> to one fault. Repair the slow worm when Joe rules, and they clear themselves.
>
> ### What I actually changed — five test files, no source file
>
> **The sixteen Farm pins** (`assembly-fingerprint.test.ts`). The Farm manager
> was forbidden from touching this file and left the pins in its handoff block.
> **I did not paste them on trust.** Each was re-read off `npm run pets:creature`
> on the merged tree and compared *programmatically*, not by eye — 16/16 agreed,
> 60 species parsed. Then the file's own generated per-species assertions
> (`expect(creatureFingerprint(id)).toBe(want)`) verified them a second time and
> independently by building each creature in-process. A mistyped pin would have
> gone red by name. 63 passing where there were 60.
>
> **The counts** (`species-built.test.ts`): farm 0 -> 16, total 68 -> 84 of an
> unchanged roster of 320, five collections with frames -> six.
>
> **The album** (`album-built.test.ts`): six pages, `[24, 14, 16, 1, 13, 16]` =
> 84. Note this table test was **passing while its premise was false**, because
> it hard-codes its openable list — which is why it is updated here rather than
> left alone.
>
> **The stand-ins, and this is the part worth reading.** Five tests used `farm`
> as their example of *a collection with nothing built* — it was the case they
> were written against before Farm existed. `woodland` takes the role: sixteen
> rostered, none built, not on `HELD_BACK_BY_JOE`. The `animal-sheep` pet fixture
> became `animal-bear` for the same reason — a sheep has a frame now and can no
> longer stand for a species the album refuses to draw.
>
> ### What I learned that is not in the code
>
> **A test can pin the wrong world and still be green.** Three of the tests I
> touched were passing on stale premises: the album table (hard-coded openable
> list), and two `farm`-as-empty tests whose assertions happened to survive. Only
> the ones that read live counts went red. **When a collection lands, grep the
> tests for its id — the red ones are not the whole of it.**
>
> **`species-unlock.test.ts` predicted this exact day and got the shape wrong**,
> so I recorded the correction in the file rather than overwriting it quietly. It
> expected sixteen records then zero models, which would have reddened its FIRST
> assertion. Records and models landed together, so `shippedIn` and `builtIn`
> still agree and the THIRD assertion went red instead. It was right about what
> mattered: the hold is arithmetic over live built counts, so sixteen new species
> released Farm on their own and `unlock.ts` was never edited.
>
> **PB-082 (`editor-round-trip.test.ts`) did not flake this run**, nor did
> `coast`, `sealing`, `facedecals`. It is a timeout under CPU load whose cost
> scales with species count and is now at 60 species. Do not widen its budget; if
> it goes red, re-run it alone.
>
> ### Gate results — all six green, on the final tree
>
> ```
> npm test    Test Files  7 failed | 184 passed (191)
>             Tests      19 failed | 4521 passed | 1 skipped (4541)
>             (the 19 are JT-048, named above, and are red on purpose)
> tsc         TSC_EXIT=0
> build       BUILD_EXIT=0   PWA precache 50 entries (1924.99 KiB)
> smoke       all boot checks passed
> parity      every step renders identically
> channel     channel check passed — workbench absent from production
> ```
>
> ### Where the next manager starts
>
> **JT-048 is the blocker and it is Joe's, not ours.** Six signed-off animals are
> damaged and sign-off means dealable, so until he rules, that red suite is the
> guard. The single highest-value repair is **the slow worm's coil** in
> `src/island/species/parts/assembled/animal-slow-worm.ts:171-174`: restoring
> `stretch: [COIL_STRETCH, COIL_STRETCH, 1]`, one 90° spin, and
> `at: [0, HULL_BOTTOM_Y, 0]` would clear **5 of the 19** at once — its own 3,
> plus corn-snake and gallery-source — and restore its 1.43 height and put it
> back on the ground. **Do not do it on a guess.** Telling a tool artefact from
> Joe's own deliberate edit is precisely the call that destroys his work; he
> removed a bespoke nose on purpose last night and it looked identical to a
> regression from inside the code.
>
> ### Decisions
>
> Raised this run: **none.** Picked up: **none.** `joe/tasks.json` was not
> written, and `joe/species-edits.json` was not touched.
>
> ---
>
> ## Previous block — Farm (PB-074), superseded by the run above
>
> *Written by the manager that built Farm. Its one outstanding item — "paste
> sixteen fingerprint pins" — **is now done**, verified rather than pasted; see
> `1a2fedd`. The rest stands as history.*
>
> ### What this run did
>
> **PB-074 is DONE: Farm is 16 of 16**, every member hand-assembled on the parts
> route. Branch **`worktree-agent-ab284976d3cdaf177`**, branched at `382e9a9`.
> **Nothing is pushed and nothing is merged** — that is the drumbeat's job.
>
> sheep · goat · horse · donkey · goose · turkey · llama · alpaca · rooster · ox ·
> mule · chicken · guinea fowl · quail · water buffalo · pigeon
>
> The roster goes **44 → 60 built species**, and Farm is the **third complete
> collection** after Garden and Home Pets.
>
> ### Gate results, on the final tree, working tree clean
>
> ```
> npm test    Test Files 2 failed | 186 passed (188)
>             Tests      7 failed | 4427 passed | 1 skipped (4435)
> tsc         TSC_EXIT=0
> build       BUILD_EXIT=0   PWA precache 50 entries (1922.61 KiB)
> smoke       all boot checks passed
> parity      every step renders identically
> ```
>
> **The 7 reds are accounted for and NONE is Farm's.** Six are the stale
> hedgehog six that were already red at `382e9a9` and belong to another manager
> (5 in `assembly-hedgehog.test.ts`, plus the `animal-hedgehog` pin, which now
> builds `1d26c188381e9eba` against a pinned `a839dd97acf556e9`). The seventh is
> the one below, and it is the one thing I owe you.
>
> ### ⚠ THE ONE THING YOU MUST DO: paste sixteen fingerprint pins
>
> `assembly-fingerprint.test.ts:145` asserts `assembledSpecies()` equals
> `Object.keys(PINNED)` **exactly**, so sixteen new species make it red. **My
> brief forbade me from touching that file — two other managers held it — so I
> did not.** The values are computed and verified off `npm run pets:creature`;
> 43 of the other 44 pins agree with the tool exactly, so the pipeline is sound.
> **Paste this after `'animal-canary': '0bd1e23f74d0038d',` and the seventh red
> goes green.**
>
> ```ts
>   /* FARM (PB-074), 16 of 16 — the first collection to arrive whole in a single
>    * run on the parts route, where Home Pets needed two earlier assembly passes
>    * before PB-073 closed it. Read off `npm run pets:creature` in one pass on
>    * 3 Aug once every species file existed.
>    *
>    * Every one of these is a FIRST PIN: the hash of the animal as it was built,
>    * recorded rather than chosen, so none is evidence of anything yet. What they
>    * buy is the second run.
>    *
>    * These animals are UNSIGNED. Joe reviews in the editor and that gate is his
>    * alone, so a pin moving here before he has ever seen the animal is not a
>    * regression — it is a build still being worked on. After his sign-off it is a
>    * regression, and the pin is what makes the difference detectable at all. */
>   'animal-sheep': '5f1fefecf7c5f032',
>   'animal-goat': 'ea8ac91fe1c45d1d',
>   'animal-horse': 'e833919f2c6e5fb1',
>   'animal-donkey': '3e3e33680bb1fe06',
>   'animal-goose': '5a2c31673b14dc99',
>   'animal-turkey': 'c9e10147a68d4655',
>   'animal-llama': '172901245825fdb2',
>   'animal-alpaca': '17f8669554583993',
>   'animal-rooster': 'bb77a76cf94ea1de',
>   'animal-ox': '35423cfe21a9d770',
>   'animal-mule': 'ea1c9d9fb2ce2445',
>   'animal-chicken': '770e38cf0aa4a57d',
>   'animal-guinea-fowl': 'a4c6a14f9e298169',
>   'animal-quail': '8a6ff2e001f60872',
>   'animal-water-buffalo': 'ae7b17cefb787da8',
>   'animal-pigeon': 'c5a8365d6074be93',
> ```
>
> ### SPEED: 132 minutes for 16, and the honest lesson is NOT "fan out wider"
>
> My brief said Home Pets' 119 minutes for 14 was too slow and told me to
> measure. Farm: **132 minutes for 16 plus full integration** — 8.25 min/animal
> against Home Pets' 8.5. **A marginal win, and the four changes I was told to
> make did not do what was expected.** The breakdown:
>
> | phase | wall | note |
> |---|---|---|
> | orientation (2 agents, parallel) | 7.5 min | **this worked — do it again** |
> | `farm.ts` + writing the digest | 5 min | |
> | **wave 1 — 4 exemplars** | **45 min** | |
> | digest update from wave 1 | 2 min | |
> | **wave 2 — 12 siblings** | **46 min** | |
> | integration data (registry, names-audit) | 6 min | |
> | first gate + diagnosis | 3 min | |
> | fixing 5 real regressions (2 agents) | 13 min | |
> | final five gates | 5 min | |
>
> **What actually worked: measuring once.** One digest written to a scratchpad
> file and handed to all sixteen builders removed the single biggest cost of the
> last run — fourteen agents each independently reading the spec, the exemplars
> and the parts bank. Every builder started from measured numbers. **Do this
> every time; it is the whole of the improvement.**
>
> **What did NOT work: two waves.** The exemplar-then-sibling structure cost a
> full extra wave — 45 minutes — and by then the digest was already carrying
> most of what an exemplar provides. **A wave costs whatever its SLOWEST agent
> costs**, and individual builds ran 10–46 min no matter how many ran beside
> them. Sixteen at once would have finished in roughly one wave.
>
> **So the recommendation for the next collection is: orientation digest, then
> ONE wave of all sixteen. Expect ~60 minutes.** Batching was never the
> bottleneck; single-agent depth is, and that depth is the quality Joe praised,
> so do not cut it.
>
> **Gating once at the end was right** and cost 8 minutes total against Home
> Pets' ~16 in repeated cycles. `editor-round-trip.test.ts` did NOT time out
> this run, because nothing competed with it for CPU.
>
> ### THE IMPROVISED PARTS — the thing Joe inspects first
>
> Every one of these is a bank shape worn as something it was never named for.
> Under his 3 Aug ruling (*"we can continue building the collections just like
> that"*) none was queried mid-run.
>
> - **HORN — there is no horn in the bank at all.** `wedge-11`, the ELEPHANT'S
>   TUSK, becomes the ox's horn (one a side, stretched `[1.125, 1.125, 1.5]`)
>   and the water buffalo's (**three segments a side, six meshes**, rolled `z
>   +135` so the tusk's own −43.99° centreline bend does the curving). The goat
>   instead takes `wedge-13`, the HOG'S TUSK, splayed 25°.
> - **COMB — none in the bank.** `cone-01`, the BEE'S ANTENNA: the hen stands
>   three on her crown buried 8/16 and spaced 2/16 so the points MEET into one
>   serrated blade; the rooster stands **five**, unburied, for 2.571× the blade.
> - **WATTLE / SNOOD** — the same `cone-01`, spun `{x, 180}` so it hangs
>   point-down. The turkey hangs one off the bill tip as a snood; the hen
>   REFUSED one with arithmetic and left it to the rooster.
> - **CASQUE** — the guinea fowl's helmet is one `cone-01` buried 12/16, exactly
>   half the hen's proud height.
> - **TOPKNOT** — the quail's is one `cone-01` spun `{x, 60}` so it curls
>   forward rather than standing up. That spin is the whole difference from a comb.
> - **WING — there is no wing in the bank.** `box-06`, the BUNNY'S EAR, worn as
>   a SOLID along the flank on all five birds, never a card.
> - **NECK — there is no neck.** `box-18`, the ELEPHANT'S TRUNK, stood on end.
>   The goose leans it 60°, the llama 30°.
> - **HEAD** — `tube-06`, the FOX'S MUZZLE, worn `on: 'neck'` (goose, llama).
> - **BEAK** — `tube-02`, the CHICK'S BILL, on every bird.
> - **FAN** — `box-38`, the PARROT'S TAIL, spun `{x, +30}` to stand exactly
>   vertical for the turkey. The horse wears the same part flipped 180° as a
>   hanging switch.
> - **SICKLE TAIL** — `wedge-15`, the LION'S TAIL, facing overridden to `y +1`
>   and spun `{x, −45}` up the rooster's rear chamfer.
> - **TAIL** — `box-18` again, spun `y 180`, on six animals. The donkey instead
>   spins `wedge-07`, the CAT'S TAIL, 180° on z so it hangs instead of curling up.
> - **BEARD** — the goat's chin tuft is `cone-01` spun `{x, 135}`; its raised
>   tail is the SAME part spun `{x, −45}`, 180° opposite.
> - **EARS** — `box-06`, the bunny's, as the donkey's and mule's long pair (the
>   ear `animal-pony.ts` refused by name for reading as *"a donkey's silhouette
>   on a Shetland"*). `cone-02`/`cone-04`, the DOG'S and HOG'S ears, worn on
>   their X axis so they point OUT. `tube-04`, the ELEPHANT'S SIDE FLAP, stood on
>   end and spun 90° for the llama.
> - **CERE** — the pigeon's is `box-09`, the BUNNY'S NOSE-TIP, as a pair above
>   the bill.
> - **NO EARS AT ALL** on the ox and water buffalo: `box-12`'s extra 0.289 of
>   width **already is two fused ear lugs**, and band 5 is Kenney's own inner-ear
>   cut, so a painted band gives them ears for zero triangles.
> - **HOOVES, per JT-044**, are a painted two-tone leg on every ungulate — no
>   part at all.
> - **FLEECE cannot be built.** No bumped or relief shape exists and JT-041
>   forbids authoring one, so the sheep and alpaca carry wool in PALETTE and
>   silhouette alone. This is stated plainly in both files rather than faked.
> - **Two authored JT-041 primitives**, both allowed without a flag: the horse's
>   mane and forelock (`bespoke-square-01` re-cut) and the donkey's dorsal stripe.
>
> ### What I learned that is not in the code
>
> - **`box-03` has exactly ONE band; `box-41` is cut 3/7/15.** The horse's and
>   sheep's "band 3 is the muzzle AND the underline in one free entry" trick is
>   **`box-41`-only**. A species on the plain cube has **no head colour at all**
>   and must buy its markings with geometry. This caught the donkey mid-build.
> - **`byBand` cannot draw spots, and now we know why.** Most parts carry a
>   single band across every triangle — `box-06` is one band over all 60
>   triangles, so the pigeon's wing bars are **impossible**, not merely awkward.
>   `box-41` gives three regions and no more, so the guinea fowl's "spots" are
>   two contiguous patches. Both said so honestly in prose and in a `flag`.
>   **Do not promise a speckled animal on this pack.**
> - **The kit WELDS.** Never price an animal off `bank.generated.ts`'s `verts`
>   field — the goose's raw part sum was 1253 and it built as 541. **Triangles
>   are the binding budget**, and `box-41` alone is 262 against `box-03`'s 60.
> - **`PACK_HEIGHT_MAX` is 2.02 and it binds hard on tall animals.** The goose
>   could not stand its neck upright (2.2626) and leans 60°. The mule and donkey
>   both land at 2.0100 — 0.0100 of margin — because the bunny's ear is tall
>   enough that joining at `box-41`'s crown rather than its flat top plate puts
>   the animal over. **The ear against the ceiling is the constraint, not the body.**
> - **`box-41`'s recorded centre 0.83125 is NOT its flank plate's centre
>   0.80625.** Copy the cage-birds' wing line onto `box-41` unmodified and the
>   wing is wrong. The guinea fowl hit this exactly.
> - **`box-41` IS available to animals with eyes** — the pony's, degu's and
>   ferret's refusal was measured off `offset + size/2` and is wrong. The boss
>   stops 0.039896 below the eye card and occludes 3.61% of `plate-01`.
> - **`creature.ts:440`'s `chamXY` solve is wrong on `box-12`**: `half[0]` is the
>   ear lug, so it returns a point 0.065761 clear of the mass and anything on the
>   `chamfer` ridge row floats. **Unraised as a card — worth one.**
> - **`assembly-assert.ts`'s thousandth-snap is fragile**: `wedge-11` has two
>   points at x = 0.1215, exactly a snap boundary, so at cross-section 16/16 the
>   lineage check fails on a provably correct shape.
> - **Sixteen agents sharing one git index WILL commingle commits.** Three pairs
>   of files landed under a sibling's commit message because `git add` and `git
>   commit` are not atomic across agents. Nothing was lost and the tree is
>   coherent, but **one species / one commit did not fully hold** — the guinea
>   fowl rides in the ox's commit and the pigeon in the donkey's. If that matters,
>   commit centrally; if it does not, ignore it.
> - **PB-056 bites species prose.** `pronouns.test.ts` scans **string literals**,
>   so a `flag:` field calling the hen "she" is a shipped-copy violation. Fifteen
>   offences across four Farm files. Comments are not scanned; `flag` is.
>
> ### Where the next manager starts
>
> **Paste the sixteen pins above** — that is five minutes and it takes the tree
> to 6 red, which is the untouched hedgehog baseline. Then the queue is the next
> collection, and the method is now proven: **write the orientation digest, then
> fan out all sixteen in ONE wave.** Read this run's digest structure before
> writing the next one; it is the artefact that made the difference.
>
> **These sixteen are UNSIGNED and must stay so.** No `signoff` field was
> written anywhere, nothing was added to a deal pool, and `joe/names-audit.json`'s
> signoff fields were not touched. Joe signs off in the editor; that gate is his.
>
> **Every palette in these sixteen is NEW and UNREVIEWED.**
>
> ### Decisions
>
> **Raised:** `JT-047` — is the water buffalo / Cape buffalo pair acceptable, or
> must Africa's buffalo move off `box-12`? (Free to answer: Africa's buffalo is
> unbuilt, so no commit changes either way.) `JT-048` — should a long-necked
> animal be able to carry its eyes on its head? (Not blocking; reversing it would
> change the builder and re-pin every fingerprint.)
>
> **Picked up:** Joe's ruling on the Home Pets improvisations — *"all the animals
> are great so far, needing only minor adjustments at best. some more, some none.
> we can continue building the collections just like that."* **That closed JT-046
> and JT-040's anxiety**, and Farm was built on it without stopping to ask once.
> `JT-044` (*"just use a two tone leg for hooves"*) was applied throughout, and
> the sheep extended it into a general derivation: **only `k` in 4..9 draws
> anything** — below 4 the boundary sits inside the foot bevel, at 10 it is
> inside the hull.

---

> ## Previous block — state at handover, 3 Aug 2026 (early hours)
>
> *Written by the manager that built Home Pets. **Superseded by the block above**,
> but its measurements are still good and Farm relied on them heavily.*
> ## ⚠ START HERE — the push button is now Joe's sign-off, and the push tool is damaging his animals, 3 Aug 2026
>
> *Written by the manager that wired sign-off to the push. **This block is the
> current one.** Everything below it is history, including the ones that call
> themselves current — they were.*
>
> Branch **`worktree-agent-ae4fae222d5966016`**, branched at **`84cd17a`** (local
> `main`, correctly — not `origin/main`). Eight commits; this block is the ninth.
> **Nothing pushed, nothing merged** — that is the drumbeat's job.
>
> ### THE ONE THING TO READ IF YOU READ NOTHING ELSE
>
> **Six of the eleven animals Joe pushed are DAMAGED, by the push TOOL and not by
> him, and two of them cannot ship.** The slow-worm measures **1.3312 against
> `PACK_HEIGHT_MIN` 1.43** — shorter than anything the pack has ever shipped — and
> no longer stands on the ground. The mole is **389 verts against rule 9's floor
> of 405**, having lost `box-24`, the spade hands its own header calls "the
> animal". **19 tests are red and every one is a RULE, not a measurement.** They
> are left red ON PURPOSE; that red suite is what stops a 1.33-tall slow-worm
> reaching Juno. **Do not go green by re-pinning them.**
>
> The question is **`JT-048`**, raised in the workbench with the measured numbers,
> the one-line fix for each, and four options. **It needs Joe before those two
> animals can ship.** Do not answer it for him — telling a tool artefact from a
> deliberate edit is the guess that destroys his work.
>
> ### What this run did
>
> Joe: *"there is no way for me to change it to status 'sign-off' when i hit the
> 'push to game' button, that is me signing it off. get those animals onto the
> game please once the unlocker has landed."*
>
> **1. The push now writes the sign-off.** `signoffPatch` in
> `tools/workbench/public/editor/push.ts`, fired from the tail of `push()` in
> `main.ts`. It closes a gap that had silently stopped every animal: the gate was
> real, PB-070's wiring to `signoff === 'ok'` was right, and the button that opens
> it lived on `approver.ts`, a page Joe does not use.
>
> **`signoffPatch` takes a `PushOutcome`, never a `PushReply`, and that is the
> whole design.** PB-076 was a well-formed 200 that wrote nothing and said "in the
> game" in green. There is exactly ONE `if (!outcome.ok) return null` and no other
> input from which success could be recomputed, so the two rules cannot drift —
> there is only one of them. Seven tests over REAL server replies prove it,
> including the PB-076 reply itself, plus an **if-and-only-if invariant over 19
> reply shapes** that also asserts both branches occur, so neither "always null"
> nor "always ok" could pass.
>
> **2. Eleven animals backfilled**, established from git and not from a brief:
> hedgehog (`382e9a9`), badger, dormouse, mole, mouse, salamander, slow-worm,
> squirrel, toad, tortoise, vole (`84cd17a`). **frog, newt and shrew are NOT
> signed** — one commit each, `b4f24da`, the PB-036 hand build. Outside Garden no
> `animal-*.ts` has ever been rewritten after its creation commit, so nothing else
> can have been pushed and nothing else is signed.
>
> **3. `84cd17a` repaired.** `tsc` is 0. Eight fingerprints re-pinned deliberately;
> mouse and toad did NOT move, which is the evidence it was not a blanket
> re-capture.
>
> ### PB-077: THE NAMED FIX WAS A NO-OP. Do not spend a run on it.
>
> The card said the route was `def.ts:1313` — have `defineCreature` register the
> def. **It is already done** (`creature.ts:947,961`, since `2b320ab`) **and it
> could never have helped**: registration hands the editor a JavaScript OBJECT,
> and `sink: LEG_ROW.sink` was evaluated to `0.408163` by the engine before
> `defineCreature` was called. The loss happens at evaluation time, upstream of
> every register. The stale comment is corrected in place and the card is
> rewritten; a card pointing at a no-op costs a whole run to disprove.
>
> **What is actually lost is TEXT, and it is worse than constants.** Three kinds:
> constants flattened (`tsc` catches it); **precision lost** — the round-trip is
> SIX DECIMAL PLACES, so `1/1.335` returns `0.749064`, and the naive repair of
> putting the identifier back **silently moves the animal**; and **solver flags
> resolved** — `chamfer: true` became a literal `at` and put the squirrel's tail
> 0.1375 inside its body; a single 90° spin came back DUPLICATED and stood the
> slow-worm's coil on end. None of that strands a binding, so `tsc` is silent.
>
> **NOT STARTED, deliberately.** The real fix sends the def AS LOADED beside the
> emitted module so `push.mjs` restores expressions BY TEXT when the pushed number
> is unchanged — no arithmetic evaluated, so it never crosses the line `push.mjs`
> may not cross. ~150–250 lines. It changes the push wire format, which is the
> path Joe is using right now, so it wants a run of its own and should not ride
> alongside a change to what a push writes. **Do not widen `withRestoredConstants`
> to evaluate arithmetic — that refusal is correct.**
>
> ### Gate results
>
> `npx tsc --noEmit` **0 errors**. `npm run build`, `npm run smoke`,
> `npm run parity`, `npm run channel` — **all pass** (`channel`: 363 files,
> workbench absent from production, as it must be).
>
> `npm test`: **19 failed | 4048 passed | 1 skipped (4068), 7 files** — squirrel 7,
> dormouse 4, slow-worm 3, vole 2, mole 1, corn-snake 1, gallery-source 1. **All
> nineteen are JT-048**, and none is a flake. `editor-round-trip` (PB-082) PASSED
> this run, as did `coast`, `sealing` and `facedecals`.
>
> ### Where the next manager starts
>
> **Read `JT-048` and see whether Joe has answered it.** If he has, his note says
> which of the six animals to repair and how, and that work turns the 19 red tests
> green — `gallery-source.test.ts:417` and `assembly-corn-snake.test.ts:136` go
> green on their own the moment the slow-worm's coil is fixed, because both are
> that one fault surfacing elsewhere. If he has NOT answered, do **not** start
> PB-077 route 1 on top of unrepaired animals; take an unrelated queue item.
>
> ### What I learned that is not in the code
>
> - **A pushed animal is not a reviewed animal.** Sign-off records that Joe looked
>   at it; it never claimed the tool wrote down what he saw. Sign-off and the
>   harness are INDEPENDENT gates and both must pass. That is why signing off a
>   broken slow-worm is safe: the red suite stops it shipping.
> - **The per-species suites are the only thing that caught any of this.** `tsc`
>   saw 3 errors; the real damage was 19 rules across 7 files. Anyone tempted to
>   thin those suites should read this paragraph twice.
> - **The inherited brief said the baseline was "8 fingerprint failures plus
>   `editor-round-trip`". It was 51.** Measure the tree you inherit; never take a
>   failure count on trust.
> - **Restoring a flattened binding is not always safe.** One of the three —
>   `COIL_STRETCH` — did not match its expression to the bit, and substituting the
>   identifier would have moved the coil by 3.3e-7. Check the arithmetic against
>   the pushed decimal EVERY time; where it differs, redefine the constant to Joe's
>   number rather than putting the name back.
>
> ### Decisions
>
> - **RAISED `JT-048`** — what to do about six animals the push tool damaged.
>   Blocks PB-077 and PB-062. Two signed-off animals cannot ship until he answers.
> - **PICKED UP: none.** No `type: "ruling"` task was newly `done` with a note this
>   run. Joe's sign-off ruling arrived through the run brief, not the workbench,
>   and is fully built.


> ## ⚠ START HERE — the album stops showing animals nobody built, 3 Aug 2026
> ## ⚠ START HERE — the unlocker counts the animals that exist, 3 Aug 2026
>
> *Written by the JT-047 manager. **This block is the current one.** Everything
> below it is history, including the ones that call themselves current.*
>
> Branch **`worktree-agent-aed7f7adf06d658d3`**, branched at **`c6cb2e3`** (local
> `main`, verified an ancestor of HEAD before the first edit). Three commits:
> `64ca164` the change, `bc8a56b` the backlog card, `26a83ca` a regression fix
> found in review. This block is the fourth. **Nothing pushed, nothing merged.**
>
> ### Gates — all six green, run after the last commit
>
> ```
> npm test    175 files, 4077 passed | 1 skipped, 0 FAILED
> tsc         0 errors
> build       ok (PWA precache 50 entries)
> smoke       all boot checks passed
> parity      every step renders identically
> channel     channel check passed
> ```
>
> Baseline was 4055/4053 with `editor-round-trip` (PB-082) expected to fail. **It
> passed both full runs here** — it is a load-dependent timeout, not a real
> failure, and its budget was NOT widened.
>
> ### What completion reads now, and for whom
>
> Joe: *"the unlocker and counters on the page should go of the number of animals
> pushed on that collection at any one time. i might make some more, needs to be
> dynamic."*
>
> `completion()` divided by the ROSTER. `album.ts:874` already counted the BUILT
> members, so the album said Night Time was **"13 of 13"** while the unlocker read
> **13/16 = 81%**, never completed it, never freed its slot, and never opened her
> next album. Africa was 1 of 16 and uncompletable by any amount of play.
>
> It now divides by `UnlockState.built`. **`completion()` has no caller in `src/`
> outside `unlock.ts`** — it feeds exactly two things, and both are gates, not
> displays: `isComplete()` (which frees an active slot) and rule 2 of
> `nextToOpen()` (the 80% trigger). Nothing else in the tree keys off a collection
> being finished — no ceremony, no reward, no biome ladder. That was surveyed, not
> assumed.
>
> **THE SEAM, AND DO NOT COLLAPSE IT.** `built.ts` costs three.js twice over
> (`kit.ts` and `registry.ts`), and `save.ts` imports `opened.ts` — so importing
> it into `unlock.ts`/`opened.ts` puts a renderer in the save path. The counts are
> **injected**: `main.ts` fills a `Record<collectionId, count>` from `builtIn()`
> on every arrival and threads it through. That is the seam `UnlockState.roster`
> has used since phase 2. There is still exactly one predicate.
>
> ### Could an unlock be lost? Yes — and it is the thing to re-check
>
> The unlock itself was **already safe**: `openCollections` is a real persisted
> save field, appended to and never recomputed (`save.ts` says why — recomputing
> would deal a different three albums every load).
>
> But two real losses were found and closed:
>
> 1. **The earned SLOT was not ratcheted.** `built` can FALL as well as rise, so a
>    collection is 14 of 14 and COMPLETE today and 14 of 16 tomorrow. It would
>    become active again, the count would return to `MAX_ACTIVE`, and `nextToOpen`
>    would return null **forever** until she caught up. That lands at the moment
>    the feature exists for: she finishes an album, and the one rule the game
>    teaches — finish one, a new one appears — silently fails because of a content
>    push nobody at the screen can see. `Opened.completed` is now an append-only
>    record, persisted as `completedCollections`, cleared by a wipe. `isComplete()`
>    is "complete now OR ever", which ratchets the slot AND the 80% trigger in one
>    place so they cannot disagree. **Joe raised this exact worry himself in
>    JT-030** — *"a finished thing becoming unfinished may still feel like a
>    loss"*.
> 2. **Deriving the hold broke forward compatibility, and I nearly shipped it.**
>    See `26a83ca`. `heldBack()` says true for any id with no built count —
>    including a collection from a LATER build. `advance()` pruned it, and
>    `main.ts` writes the result back through `toSave`, so it was gone from disk
>    **forever**. The old hand-written list held only known ids, so this could not
>    happen before. The prune now refuses to judge an id this build does not know.
>
> ### What a child sees when a completed album gains a new animal
>
> **The counter moves and everything she earned stays.** She is honestly shown
> "13 of 14" and can go and collect the new ones; the album reopens visibly. Only
> the slot accounting ratchets. New animals in a finished album are a gift on top
> of her trophy, never a lien against her next one. This is a DECISION and it is
> tested — `tests/island/species-completion.test.ts` asserts both halves, and one
> test builds the same state with and without the record so the ratchet is proved
> to be the thing doing the work.
>
> ### `NOT_BUILT_YET` is deleted, and this was urgent
>
> Its tripwire measured `shippedIn()` — REGISTERED RECORDS, and **a record is not
> an animal**. Collections are built by committing all sixteen records in one
> commit and the species files afterwards, one at a time. **On the day Farm's
> records land, that test would have gone red telling the Farm manager to release
> Farm to the cadence with zero animals built** — an album whose every frame the
> album view refuses to draw. The hold is now `heldBack()`, derived live. Build an
> animal and the cadence offers the collection; there is no string to remember.
>
> ### Stale claims: three fixed, two left deliberately
>
> - **FIXED** `collections/africa.ts` — claimed "FOURTEEN of sixteen" while
>   holding **one**. `eedb6ef` deleted thirteen quadruped records and left the
>   prose; the test it cited (`species-africa.test.ts`) does not exist either.
> - **FIXED** `unlock.ts` `fillToCap` — pool said six collections wide; it is
>   **four** (`garden`, `home-pets`, `night-time`, `africa`). Farm makes it five.
> - **FIXED** `built.ts` — still described the divergence this run closed.
> - **LEFT** `collections/farm.ts` — the live Farm manager owns that file, and its
>   claim is already hedged correctly.
> - **LEFT** `types.ts:202` / `roster.ts:63` — both still say "85% cadence" where
>   the shipped dial is 80. `roster.ts` is forbidden to edit and neither was in
>   scope. Small, real, and still open.
>
> ### Where the next manager starts
>
> **`joe/tasks.json` is UNTOUCHED and JT-047 is still `open` with an empty
> `note`.** The ruling reached this run through the drumbeat, not the workbench,
> and that note field is Joe's. Somebody should close it. **JT-030 is also worth
> his eye**: its wedge half ("a partial collection holds a slot forever") is now
> dissolved by arithmetic — Night Time is 13 of 13, completes, and frees its slot
> — so what remains of JT-030 is purely the LOOK question of whether a partial
> album should be offered at all. That is cheaper than when he was asked it.
>
> `docs/HANDOFF.md` §6 gained three landmines from this run: `shippedIn` vs
> `isBuilt`, why `unlock.ts`/`opened.ts` must stay three-free and how to feed
> them, and that completion can fall so anything it pays for must ratchet.

> ## Superseded — the album stops showing animals nobody built, 3 Aug 2026
>
> *Written by the manager that fixed the empty slots. **This block is the current
> one.** Everything below it is history, including the ones that call themselves
> current — they were.*
>
> Branch **`worktree-agent-abea6830dd6e44e25`**, branched at **`382e9a9`** (local
> `main`, correctly — not `origin/main`). Three commits: `55084ee` the change,
> `ecd82d2` the backlog card, `6671ac4` the workbench raise. This block is the
> fourth. **Nothing pushed, nothing merged** — that is the drumbeat's job.
>
> ### What this run did
>
> Joe: *"i can still see all the empty slots from the blocky animals in the
> albums by the way. we should remove them all and they get built up as soon as i
> push new animals to the game."*
>
> `album.ts` drew one frame per ROSTER member, so PB-036 deleting the fifty-nine
> kit-built species left their frames behind. The album now filters its **view**
> through a new one-line-answer module, **`src/island/species/built.ts`**.
>
> **THE ALBUM AS IT NOW STANDS — 68 frames, five possible pages:**
>
> | page | name | frames | rostered |
> |---|---|---|---|
> | 1 | Base Set | **24** | 24 |
> | 2 | Garden | **14** | 14 |
> | 3 | Home Pets | **16** | 16 |
> | 4 | Africa | **1** | 16 |
> | 5 | Night Time | **13** | 16 |
>
> Sixteen collections — Farm, Woodland, Birds, Ocean, Critters, Ice, Outback,
> Jungle, Raptors, Dinosaurs, Prehistoric, Legendary and the four Red List tiers
> — have nothing built and now have **no page, no name and no count** at all.
> Africa loses 15 frames and Night Time 3; those 18 are the empty slots Joe was
> looking at. `tests/island/album-built.test.ts:450-453` **asserts** this table —
> the page names, the per-page cells `[24, 14, 16, 1, 13]` and the total 68 — so
> it goes red the day an animal lands rather than merely describing today. It
> also `console.log`s it for eyeballing, though vitest's default reporter does
> not surface that through a pipe; the assertion is the part to trust.
>
> **A child sees at most FOUR of those five at once** — `MAX_ACTIVE` is 4 and
> `base` is forced open, so the fifth only ever arrives after a completion.
>
> ### What "built" resolves to, and the trap you must not fall into
>
> **NOT `shippedIn`.** It counts REGISTERED records, and a record is not an
> animal: `define.ts:60` looks an assembly up off the register and silently omits
> it when there is none. That is not hypothetical — **the method the last three
> collections were built by writes ALL of a collection's records first, in one
> commit**, and the species files afterwards one at a time. Filtering on
> `shippedIn` would put sixteen empty Farm frames back the day that first commit
> landed: the same bug through a different door. (A manager already mis-measured
> this once, reporting 100 built of 320 against a true 17.)
>
> `isBuilt` instead mirrors `album.ts`'s own `shapeOf` exactly — the only honest
> question is *is there a picture to put in the frame*: an `assembly`, **or** a
> `build` whose kit is one of the three actually written (`KITS`, **not**
> `BUILT_KITS`, which lists three kits that throw by name), **or** the frozen
> `kit: 'kenney'` pack. **Garden's thirteen quadrupeds are why clause two is not
> dead code** — "no more blocky ones" is true of the build order, not of the data.
>
> **ONE PREDICATE, FOUR CALLERS.** The count at `:831` and the frames at `:836`
> were two separate walks of `set.members` three lines apart; the page list and
> the prefetch were two more. All four read `builtIn(id)` now, so the heading
> cannot promise a number the grid below it does not show.
>
> **`roster.ts` IS UNTOUCHED and must stay so.** `naming.ts:218` allocates given
> names across all 320 of it precisely so building a new animal cannot rename one
> a child already owns. `builtIn` filters that order and never reorders it: a new
> animal only ever INSERTS a frame.
>
> ### The brief §19 proof, because it was proved rather than asserted
>
> `shown` is built from the same filtered lists, so **a pet whose frame went away
> falls to the "More friends" page** with its name, its portrait, its pop-out and
> "find on the map" intact. That is a **third live route** into `orphans`, not a
> defensive one. `album-built.test.ts` proves all three cases — a rostered but
> unbuilt species, a species in a now-hidden collection, and a species not in the
> roster at all — and asserts the general form: **the number of pets reachable in
> the card is never less than the number passed to `open()`**. Juno's own 24 are
> base species, all built, all still on page one; nothing of hers moved.
>
> **Filtering the cells without filtering `shown` would have lost her a friend
> silently.** If you touch this file, that is the pair to keep together.
>
> ### The prefetch, which was the silent-bug risk
>
> `warmNext` reads `builtIn(pages[at + 1])`. `pages` is filtered **first**, so
> `at + 1` still means the page she is one tap away from, and a hidden collection
> sitting in the `albums` argument no longer shifts what gets warmed. The old
> `album-portraits.test.ts` "warms ONE page ahead" fixture contained `birds`
> (0 built) and had quietly stopped testing a three-page book — a near-miss worth
> knowing about.
>
> ### Gate results — 4053 tests, 6 failing, and the arithmetic
>
> Baseline at `382e9a9` was **4001 with 6 failing**. This run is **4053 with the
> same 6 failing**: `4046 passed + 6 failed + 1 skipped = 4053`, and `4053 − 4001
> = 52` new tests, all green. **The 6 are the stale hedgehog ones**
> (`assembly-hedgehog.test.ts` ×5, `assembly-fingerprint.test.ts` ×1) — another
> manager's live work, not touched.
>
> A second full run additionally showed `coast`, `sealing` and
> `editor-round-trip` ×2 — the documented PB-082 load flakes. **Re-run, never
> widened:** the three files pass alone, `75 passed | 1 skipped`.
>
> `tsc` **0 errors** · `build` OK (`precache 50 entries`) · `smoke` "all boot
> checks passed" · `parity` "every step renders identically" · `channel`
> "channel check passed".
>
> ### Where the next manager starts
>
> **`JT-047` is open and it is the consequence of this change.** The album says
> Night Time is "13 of 13"; `unlock.ts:292`'s `completion()` still divides by the
> **roster**, so the same collection is 81% to the unlocker and **the next
> collection never opens**. Africa is 6% and can never be finished by any amount
> of play. Masked today because `NOT_BUILT_YET` holds most collections back and
> Garden and Home Pets are genuinely complete; it bites the first time Night Time
> or Africa is the collection in progress. **The unlocker was deliberately left
> untouched** — it decides what a child experiences, so it is Joe's alone and was
> not put to Fable. Three options with costs are written out in the card.
>
> Otherwise the queue is unchanged: **PB-074, Farm** — and **JT-046** (the
> substitutions, raised as JT-045 in its own commits) is still unanswered, so
> sixteen Farm animals still risk being built twice.
>
> ### What I learned that is not in the code
>
> - **`unlock.ts` cannot import `built.ts`.** `built.ts` reaches `KITS` and
>   therefore three.js; `unlock.ts` is deliberately three-free (`unlock.ts:109`).
>   That is why `NOT_BUILT_YET` is still a hand-written list where the truth is
>   now derivable. Recorded as PB-083; a mirror in the `signed-off.ts` style is
>   the shape of the fix if anyone wants it.
> - **Three headers are now provably stale and I left them alone on purpose**
>   (they belong to files a live manager may be in): `collections/africa.ts` says
>   *"ships PARTIAL, FOURTEEN of sixteen"* when it is **one**; `unlock.ts`'s
>   `fillToCap` note says the pool is *"six collections wide"* when it is **four**
>   (woodland and farm are in `NOT_BUILT_YET` further up the same file); and
>   `eedb6ef`'s *"Garden is the only complete collection left"* was already wrong
>   — **Home Pets is 16 of 16** and is the album's second-biggest page.
> - **`shapeOf` still fetches for a rostered-but-unregistered id.** `if (record &&
>   ...)` falls through to `preview(species)` when there is no record, so the
>   comment claiming no request is made for a species the roster knows and cannot
>   build was never quite true. Harmless now — the grid no longer asks for those
>   at all — but it is the path an orphan pet takes.
> - **Test fixtures naming a zero-built collection now fail loudly**, which is
>   good, but two of them (`birds` in `album-roster` and `album-portraits`) had
>   been silently testing one page fewer than they claimed. If you write an album
>   test, name a collection that has animals in it.
>
> ### Decisions
>
> **Raised:** `JT-047` — the album and the unlocker disagree about Night Time;
> which number is right? Blocks PB-083. Also flagged inside it, not as a
> question: the album now shows 68 animals while the sign-off gate still lets her
> hatch only the base 24 — his ruling working as designed.
>
> **Picked up:** none. No `type: "ruling"` task moved to `done` with a note since
> the last run. `JT-046` (the substitutions) and `JT-040` remain **open**.
>
> **Cards:** PB-083 raised, `nextId` 83 → 84.

> ## ⚠ START HERE — state at handover, 3 Aug 2026 (PB-062, the hedgehog's nose)
>
> ***This block is the current one.** Everything below it is history, including
> every block that calls itself current — each one was, at the time.*
>
> ### What this run did, in one line
>
> **The six tests `382e9a9` left red are green, and the hedgehog's flag no longer
> describes geometry that does not exist.** Branch
> **`worktree-agent-a93924107db779e82`**, branched at `382e9a9`, two commits,
> **nothing pushed and nothing merged**. All five gates green plus `npm run
> channel`.
>
> ### THE THING THE NEXT MANAGER MUST NOT UNDO
>
> Joe changed the hedgehog's nose himself on 2 August, **through the editor**, and
> pushed it into the game — the first animal ever to make that trip. The nose was
> `bespoke-sphere-01`, authored geometry he had overruled rule 1 for on 29 July.
> It is now **`box-09`, and `box-09` is the BUNNY'S OWN NOSE** from the pack
> (`roles: ['nose']`, `provenance: ['bunny']`, `sunkFractionMean` 0 — so its sink
> of 0 is the pack's own burial for the shape, not a preference).
>
> **Its colour is byte-identical to `coat`. That is intended.** Asked directly:
> *"yes i have used the same colour."* Asked whether the sphere had gone by
> accident: *"yes, i changed the nose to something more fitting."* From inside the
> code a deliberate deletion and a regression look identical, which is why
> `assembly-hedgehog.test.ts` now pins `palette['box-09'] === palette['coat']` as
> an EQUALITY with his words in the comment. **Do not repaint it pink. Do not
> restore the sphere.**
>
> ### Test arithmetic, stated so nobody has to guess
>
> Baseline at `382e9a9`: **4001 tests, 6 failing.** Now: **4003 tests, 0 failing**
> (`4002 passed | 1 skipped`, 172 files). The change is **+2**, made of:
> - **2 deleted outright** — `builds the authored sphere at the authored radius,
>   to its own count`, and `sits with its CENTRE on the snout's own measured
>   apex`. Deleted, not mended, because the decision they pinned was overturned by
>   its own author. Both deletions leave a comment in the file saying so.
> - **1 rehomed** — `is a real sphere, generated rather than typed, and small`
>   moved to `tests/island/authored-primitives.test.ts`. The sphere still exists;
>   no species wears it; a test of a part no species wears belongs there.
> - **1 rewritten in place** — the PINK test became `is the SAME TAN as the coat,
>   and that is Joe's answer, not a mistake`.
> - **4 added**, describing the nose that IS there: the bank part in the nose
>   role, the geometry unaltered, the pack's own burial, and standing proud of the
>   beak without floating.
>
> Counts moved **754 verts / 1,046 tris -> 744 / 1,021**. RULE 9 STRAINED still
> holds (1,021 against the pack's 422-951), so the declaration stays and its
> number was corrected rather than the budget relaxed.
>
> **The fingerprint was re-pinned deliberately**: `a839dd97acf556e9` ->
> `1d26c188381e9eba`, with the reason written beside the entry.
>
> ### `bespoke-sphere-01` IS NOT DEAD — do not delete it
>
> Checked properly, because the obvious answer is wrong:
> - **No shipped species uses it.** The hedgehog was its only consumer.
> - **It is still a selectable row in Joe's editor** —
>   `tools/workbench/public/editor/library.ts:145` spreads `AUTHORED_PARTS` into
>   `ALL_SHAPES`. He can still reach for it for another animal.
> - **The RULE 1 guard is NOT guarding nothing.** `creature.ts:623` still throws,
>   and **two tests exercise it** using the sphere as their fake:
>   `authored-primitives-assembly.test.ts:151` and `assembly-creature.test.ts:299`.
>   Both build throwaway defs, so they hold the guard independent of the roster.
> - Deleting it would be **zero TypeScript errors** and about five runtime test
>   failures. **It is Joe's part to retire, not ours.**
>
> ### The orphaned `nose: 0xe792bd` slot — PROVEN safe, and LEFT IN PLACE
>
> Nothing paints it. It costs one atlas row. I did not remove it, and the answer
> is Joe's — but the claim is now **measured rather than assumed**, so he can
> decide cheaply. Built the animal twice, with and without the slot, and sampled
> the material's map at every mesh's own UV:
>
> ```
> ATLAS with nose: 4x112   without: 4x96
> MESHES IDENTICAL: 29/29
> NO COLOUR DIFFERENCES
> ```
>
> So for THIS species the `palette-order` axiom's scare story does not bite: the
> name-to-row map is rebuilt from the same palette object in the same call that
> bakes the texture (`assembly.ts:504` -> `:361`, `texture.ts:167`), so dropping a
> slot renumbers rows consistently. **UVs DO move** (every one — `n` goes 7 to 6),
> so removing it costs a SECOND deliberate fingerprint re-pin. Colours do not
> move at all. The reasoning is now written into `animal-hedgehog.ts` beside the
> palette so the next reader does not have to re-derive it.
>
> **I did not raise this as a `JT-0xx`.** One texture row on one species is too
> small to spend his attention on alone, and `joe/` is live tonight with four id
> collisions already. The version that IS worth his time is the general one —
> *when an editor edit orphans a palette slot, should it be swept?* — because it
> will recur on every editor edit from here. A future manager should raise THAT,
> not this.
>
> ### A landmine that cost me a gate, and will cost the next person too
>
> **`tests/copy/pronouns.test.ts` (PB-056) checks EVERY STRING LITERAL
> SEPARATELY**, and excuses one literal in `animal-hedgehog.ts` by the exact text
> `His words,`. A species `flag` is a `+`-concatenation of many literals, so:
> re-wrapping a line can split `His words,` across two chunks and fail the gate
> TWICE — once for the new unexcused offence and once for *"every excuse is still
> earning its place"*, which asserts the allowlisted text is still present. **When
> you edit a `flag` containing a quotation attributed to Joe, keep `His words,`
> intact inside a single literal, and put no second gendered pronoun in any other
> chunk.** The allowlist is at `tests/copy/pronouns.test.ts:113`.
>
> ### The editor names a feature after its SHAPE, and it shows
>
> Worth a card, not fixed here because it is Joe's pushed data. The extras entry
> the editor wrote is `{ part: 'box-09', name: 'box-09', paint: 'box-09' }`, so
> the animal now has a feature called `box-09`, a mesh called `box-09` and a
> palette slot called `box-09` where the old one said `nose-tip` and `nose`.
> It builds correctly and reads badly — the file no longer says what the part IS
> FOR. Renaming it would change the fingerprint again, so it wants his nod.
>
> ### Where the next manager starts
>
> **Not here.** This item is closed. The queue's real front is still what the Home
> Pets block below says: **JT-040/JT-045 are OPEN and Farm should not be built
> until they are answered**, and **PB-075** (the `box-31` open shell showing sky
> through the shrew's and newt's heads) is a live defect on two signed-off
> animals awaiting his call.
>
> ---
>
> ## Previous block — state at handover, 3 Aug 2026 (early hours)
>
> *Written by the manager that built Home Pets. It was the current one until the
> block above.*
>
> ### What this run did
>
> **PB-073 is DONE: Home Pets is 16 of 16**, and every member is hand-assembled.
> Fourteen species built, one commit each. Branch
> **`worktree-agent-a9e00de76daaef78b`**, branched at `ce919c2`. **Nothing is
> pushed and nothing is merged** — that is the drumbeat's job.
>
> hamster · guinea pig · budgie · gerbil · pony · ferret · gecko · chinchilla ·
> canary · cockatiel · terrapin · rat · lovebird · degu
>
> **All five gates green on the final tree**, working tree clean:
> `npm test` **3861 passed / 165 files** (baseline was 3362 / 151) · `tsc` **0
> errors** · `build` OK · `smoke` "all boot checks passed" · `parity` "every step
> renders identically".
>
> ### DO THIS FIRST: get JT-045 answered, before building Farm
>
> **JT-040 — "does the lion's tail read as a goldfish's fin?" — is still OPEN.**
> My brief told me it was Joe's own settled precedent. It is not; he was asked and
> has not answered. Fourteen animals are now built on that licence and Farm would
> be sixteen more.
>
> **JT-045** puts the whole class in front of him at once, worst-first, so one
> answer settles all of it: the WING that is the bunny's ear (`box-06`, all four
> cage birds), the MANE that is a re-cut primitive, the CREST that is the bee's
> antenna, the NECK that is the elephant's trunk worn forwards, the SHELL that is
> the caterpillar's body segment, the gecko's SMILE of two mouth cards abutted,
> and nine TUBERCLES that are the bunny's muzzle. It asks him to name individually
> any he rejects, because they are independent choices.
>
> Building Farm before that answer risks doing sixteen animals twice.
>
> ### A LIVE DEFECT ON TWO SIGNED-OFF ANIMALS — PB-075
>
> **`box-31` is an OPEN SHELL.** Four of its 77 edges are used by one triangle,
> forming a **1.000 x 1.000 aperture in the FRONT of the head** where the lion's
> `blade-05` plate belongs. The material is `THREE.FrontSide`
> (`assembly.ts:509-511` never sets `side`), so it is **see-through to the sky**.
>
> In the album portrait (6.4 degrees elevation, 32.4 yaw — the picture a child
> looks at) **27.2% of the shrew and 30.9% of the newt is background.** The frog
> is safe; it already wears `blade-05`. The terrapin was fixed the same way this
> run for eighteen triangles.
>
> **I did not touch the shrew or the newt.** They are signed off, and changing a
> signed-off animal is Joe's call. The fix is known and costs 18 triangles.
>
> Why nothing caught it: `assembly-assert.ts` reads bounding boxes, matches
> vertices against the bank, and counts triangles. The hull IS a faithful
> `box-31`, hole and all, so a missing face moves none of the three, and
> `groupFingerprint` froze the hole rather than reporting it. **The suite checks
> that a thing is where it was put, never that it can be seen** — the same
> blindness as the mouth that z-fought into invisibility for weeks. A sweep found
> this is the only hull in the pack that renders a hole; 55 of 94 bank parts have
> open edges, so open edges are not the signal, an EXPOSED one is.
>
> ### Bounding boxes lie on this pack — it cost three builders real time
>
> **A hull's bounding box is not its surface.** Measured this run:
> - **`box-41`'s FRONT** — its 0.725 belongs only to a muzzle boss spanning
>   |x| <= 0.200. Three builders refused the hull believing eye cards would sit
>   0.090 inside the head; they land on the flat plate behind it at 0.625,
>   clearing by exactly `CARD_STANDOFF`. Pinned in `assembly-guinea-pig.test.ts`.
> - **`box-41`'s SIDES** — reaches 0.675 only on two pads; the flank is 0.625.
> - **`box-41`'s CROWN** — 1.43125 on the midline but 1.48125 over two pads at
>   |z| 0.20-0.25, so a back card at 1.44125 buries from |z| 0.07 out.
> - **`box-21` is NOT "TALLER, and nothing else"** as `hulls.ts:189` claims. Below
>   local y +0.4975 it IS the cube; above are two LUGS at |x| 0.218-0.454 — the
>   fox's ears, exactly what `box-12` was for the badger. That is **PB-076**.
> - Useful the other way: **`box-41`'s six flat plates ARE `box-03`'s six flat
>   plates** at identical world coordinates, so joins transfer between them.
>
> ### What Farm can take straight off the shelf
>
> - **HOOVES (JT-044) are built.** `animal-pony.ts` is the precedent and
>   `assembly-pony.test.ts` is the documentation. `at: 0.25` is derived, not
>   preferred: `box-01`'s foot bevel is 0.0625 tall and it reaches full width at
>   0.204082 of its height, so 3/16 lands inside the bevel and 4/16 clears it by
>   0.014 onto the straight shank. **Caveat:** `patchUv`'s half-texel end clamp
>   puts the DRAWN boundary at 0.07712 against the ideal 0.076563. Recognise it.
> - **It is also right to REFUSE a two-tone leg.** The ferret declined with
>   arithmetic — a sable ferret's leg carries no boundary, so any stocking the
>   tool can draw is a marking the animal does not have. Farm's ox and water
>   buffalo should think the same way.
> - **The WING idiom**, if JT-045 survives: `box-06` along the flank as a SOLID,
>   `axis:'z', dir:-1`, `spin:[{z,-90},{y,-90}]`, `sink: 0.5`,
>   `at:[0.625, 0.80625, 0]`. **Never a flat card** — the cards are zero-thickness
>   and the island camera looks DOWN, so a card wing is edge-on and gone. Farm has
>   seven birds.
> - **`cone-06` is the parrot's own hooked beak.** **`box-18` is the elephant's
>   TRUNK**, the only `z +1` tail, and worn forwards it is a neck.
> - **A `ridge` cannot wear a JT-041 primitive** (`creature.ts:761` resolves with
>   `partById` alone). That is **PB-077**, and Farm wants three manes and a crest.
>
> ### SHIPPING A SPECIES IS MORE THAN BUILDING IT — budget for this
>
> The fourteen builds took most of the run; the last hour was integration nobody
> had written down. **A species commit is FOUR files** — the species file, its
> test, its `index.ts` line, and **its pin in `assembly-fingerprint.test.ts`**,
> which fails outright on a species with no pin. And **completing a collection
> then demands**:
> - `joe/names-audit.json` — one row per BUILT species. All generator output;
>   `naming.test.ts` re-derives every name, so the test IS the verification. Write
>   **no `signoff` key** — no existing row has one.
> - `joe/species-facts.json` — one CHECKED fact per species, with a real source.
>   This is genuine research, not bookkeeping. The schema will accept
>   `check: "flagged"` with an empty source and go green, which is the trap:
>   it looks finished and puts unchecked rows in front of Joe.
> - `tests/island/species-registry.test.ts` — four counts move.
>
> ### How to run fourteen builders without collisions
>
> - **Write ALL the collection records FIRST, in one commit.** `define.ts` looks
>   the assembly up off the register and omits it when absent, so a record can
>   precede its species file harmlessly. This is the OPPOSITE of
>   `assembled/index.ts`, where a line before its file breaks the module graph and
>   blanked Joe's viewer once. Do not confuse them.
> - **Let each worker append its OWN `index.ts` line, last, at the anchor.** My
>   brief said do it centrally; there is no route by which a worker can then
>   verify its own animal, because the test imports through the barrel. Zero
>   collisions occurred in fourteen.
> - **To still commit one species at a time**, stage a CONSTRUCTED blob so no
>   commit references a file it does not contain:
>   `git cat-file -p HEAD:<index> | sed "/append the next species/i <line>" | git hash-object -w --stdin`
>   then `git update-index --cacheinfo 100644,<sha>,<index>`. Commit in
>   working-tree line order and the tree converges exactly.
>
> ### Two things for Joe, neither blocking
>
> - **I restored one of his verdicts.** The chinchilla generates as `Boopvi` — the
>   name he already rejected ("the pv sound is too hard", replacement `Boovip`),
>   parked in `retiredVerdicts` when the kit species were deleted. A blank row
>   would have asked him to rule twice or let a rejected name ship. His words are
>   back on the live row; the retired entry is left in place for him to prune.
> - **`home-pets.ts:101` says the budgie is BLUE, `:194` calls it "the only green
>   one".** The budgie followed :194 and the lovebird is green in life, so two of
>   the four cage birds are now green. Line 101's own answer is that the budgie
>   should move.
> - Every palette in these fourteen is NEW and UNREVIEWED.
>
> ### Where the next manager starts
>
> **PB-074, Farm, all sixteen — but read JT-045 first.** If Joe has answered and
> the substitutions stand, Farm is a straight repeat of this method and most of
> its hard problems are solved above. If he rejected some, fix those in Home Pets
> before building sixteen more the same way.
>
> **These fourteen are UNSIGNED and must stay so.** Nothing was added to a deal
> pool, no `signoff` field was touched, `joe/names-audit.json`'s signoff fields
> were not written. Joe signs off in the editor; that gate is his alone.
>
> ### Cards raised: PB-075 (the hole), PB-076 (`box-21`), PB-077 (ridge/primitive). Closed: PB-063.

> ## ⚠⚠ READ THIS FIRST — PB-076, a live obscenity in a child's game, 2 Aug 2026 (night)
>
> *Branch `worktree-agent-a6c245a1c33091f68`. Four commits: `69eb970`, `075c565`,
> `43e5a8d`, `1b9fc1b`. Not pushed, not merged — the drumbeat merges. **This one
> jumps the queue; Joe wants it shipped.***
>
> ### What happened
>
> Joe's six-year-old was dealt a rabbit called **Defuck**. His rule: *"nothing
> that contains the letter combination fuck, cunt or shit, or homophones
> thereof."* His ruling on the fix: *"no dont change the generator, we hard fix
> the first 24 animals instead."*
>
> ### The brief I was given was premised on something false, and this is the correction
>
> I was told to compute the Base 24's allocated names, find the offending ones,
> and pin replacements in `name-pins.json`. **There was nothing to pin.** All 320
> allocated names are clean — zero hits for the three roots or any homophone.
> `Defuck` was never in the allocation.
>
> **The fault was that the live game never used the allocation at all.**
> `main.ts` hatched with `petName(defaultRng)` — unseeded `Math.random`. The
> deterministic 320-name allocation, the bands, the pin table and the whole audit
> apparatus were wired to the workbench and the tests, and to nothing a child
> touches.
>
> And it was far worse than one rabbit. Exact enumeration of the generator, not a
> sample: `src/core/names.ts`'s `FORBIDDEN` list carries `shit`, `cock`, `dick`,
> `piss`, `arse` — **and not `fuck`, and not `cunt`**. So **2,108 of its
> 1,429,287 accepted draws contain a banned root. 640 distinct names. One hatch
> in 678.** Over 100 hatches, a 13.7% chance of at least one. `Defuck` is
> `d`+`e` then `f`+`u`+`ck`, concatenated — routine output, not bad luck.
>
> ### What shipped
>
> Joe's ruling read correctly once you know the above: the hard fix for an animal
> IS its frozen name. So `main.ts` now names a hatching friend with
> `givenName(species)`. The bunny is **Chudup**. No pin was invented (`naming.ts`
> says invent nothing, and nothing needed inventing), `name-pins.json` is
> untouched and still empty, and its tripwire test still passes. **`src/core/`
> and `tools/golden/golden.json` have an empty diff** — `parity` is byte-identical.
>
> Plus `src/island/species/name-screen.ts` — Joe's rule as 57 data patterns,
> deliberately over-broad — and `tests/island/name-screen.test.ts`, the standing
> gate that fails loudly if any of the 320 ever offends. Proved to bite by
> injecting `Defuck` as a species name.
>
> ### THE HALF THAT IS STILL OPEN — JT-045, and do not let it get lost
>
> **The fix is forward-only, and Juno's existing pet is still called Defuck.**
> `save.ts:301` reads pets back verbatim; every display path reads `pet.name` off
> the stored record; nothing derives a name from the species at read time; and
> `Pet.id` embeds the name (`pet3-Defuck`). So a pin or a rewiring cannot reach a
> pet already in a save — that is brief §19 working exactly as designed, and it is
> also the honest limit of what shipped tonight.
>
> **JT-045 asks Joe whether he wants it renamed in place.** Nothing is built on
> either answer. If he says yes, it is the only code in the project that would
> ever edit a name a child already owns — and the pet must never be lost,
> replaced or re-hatched to achieve it.
>
> ### Two things worth knowing before you touch naming again
>
> - **A name is now per SPECIES, not per pet** (roster §3's intent). The deck
>   deals without replacement for the first 24 pets, so nothing changes until a
>   child owns 25; after that two pets of a species share a name. Ids stay unique
>   and the album already routes duplicates to "More friends". JT-027 (new
>   collection at 80%) pushes it further out and JT-029 has Joe's own fix ready
>   ("add something like 'the great'"). Raised in JT-045, not built.
> - **Three live names are borderline and NOT gated**, by a judgement written
>   down rather than hidden: `Fickji`, `Nefack`, `Chashet`. They are exported as
>   `WATCHLIST` in `name-screen.ts` with the reasoning and the reversal path.
>   Overturning one is a pin, never a stream filter.
> - **The hatch is not drivable end to end.** `handleChallengePassed` takes the
>   name as an *input*, so a flow-driving test proves nothing about the wiring.
>   `hatch-naming.test.ts` asserts at source level and says so. If you want that
>   behavioural, extract a `hatchName(species)` seam.
>
> ### Gates — all six, on the final tree
>
> ```
> npm test    157 files, 3456 tests, all passed   (baseline 155 / 3413)
> tsc         TSC_EXIT=0
> npm run build    files generated, sw.js + workbox
> npm run smoke    all boot checks passed
> npm run parity   every step renders identically
> npm run channel  channel check passed
> git diff src/core/ tools/golden/   (empty)
> ```

> ## ⚠ START HERE — state at handover, 2 Aug 2026 (night)
> ## ⚠ START HERE — state at handover, 2 Aug 2026 (late night)
>
> *Written by the manager that made Push actually push (PB-076). Read this
> block, then the PB-070 block below it, then the mouth manager's — all three
> are current. History starts at the block marked `Superseded`.*
>
> ### The headline: Push wrote nothing, for every animal, and said it worked
>
> Joe edited the hedgehog in the species editor, pressed **Push it to the game**,
> and was told in green that it was in the game. **It was not.** No error was
> raised, because there was never an error. What happened:
>
> `push.mjs` sets `alreadyBuilt = exists(modulePath)`, and **all thirty
> assembled species are already built**, so every push took the already-built
> branch. With a locomotion set it wrote the MOVES table, marked places 1, 2, 3,
> 4, 8 and 9 *skipped*, and returned **HTTP 200**. On every retry after that
> `withMovesEntry` returned `null` too, so the reply wrote **nothing at all** and
> was **still a 200**. The client judged success by the absence of an `error`
> key, so it printed "animal-hedgehog is in the game" over a reply whose own
> `say` field read *"Nothing was written."* `8f380a1` — Joe's `moves.ts` row —
> is the one real thing any push of his ever wrote, and it is the independent
> confirmation of this whole account.
>
> **The editor could not re-push a change to ANY animal.** Joe's editing time
> had been producing nothing but drafts.
>
> ### The suspicion that the editor eats authored geometry is REFUTED
>
> Do not act on it, and do not "restore" anyone's part. His hedgehog draft holds
> `{ part: 'box-09', name: 'box-09', at: [...] }` where the shipped file holds a
> `bespoke-sphere-01` nose — **because Joe swapped it deliberately.** He said so:
> *"i changed the nose to something more fitting."* The code agrees independently:
> that key order is `insertPart`'s literal signature (`def.ts:856`), whereas
> `setPartShape` spreads the old object first and would have kept `name`, `paint`
> and `sink`. Load is a `structuredClone` off `CREATURE_DEFS` with **no filter**,
> `ALL_SHAPES` includes `AUTHORED_PARTS`, and the goldfish draft round-tripped
> `bespoke-triangle-01` with its stretch and spin intact. The orphaned `nose`
> palette slot is expected residue: **there is no `removePaletteSlot` anywhere**,
> by design.
>
> ### TELL JOE: his new nose will be coat-coloured
>
> His `box-09` carries **no `paint` key**, and an `extras` entry with no paint
> falls back to `coat` (`creature.ts:882`, resolved by `paintOf` at
> `creature.ts:539`). So it renders **`#b2946c`, the hedgehog's buff coat tan** —
> the pink `#e792bd` still sitting in the orphaned `nose` slot is never reached.
> **He gets no warning of any kind**: `warningsFor` has no axiom for an unpainted
> part or an unreferenced slot, and sign-off says nothing either. It is his
> animal and his call — the "own colour" row added earlier tonight is how he
> paints it. Deleting the orphan slot to tidy up is the one dangerous gesture:
> palette insertion order IS the atlas layout, so removing a slot repaints
> everything after it.
>
> ### What shipped, three commits
>
> - **`684655b`** — the emitter was **lossy**. `numLit` was `String(round6(n))`,
>   so **9 of 30 species did not survive their own round trip**: slow-worm,
>   corn-snake, goldfish and crocodile lost precision on a `stretch`, which
>   *multiplies* geometry, and bushbaby on a `sink`. Now emits the shortest
>   decimal that parses back to exactly the same double — tidy numbers on disk
>   are untouched, so a re-save churns nothing. **21/30 → 30/30.** Also
>   `CreatureDef.motion` was missing from `DEF_KEYS` and was being silently
>   deleted; the first animal given a wingbeat would have lost it on first save.
> - **`bfad6c8`** — the push writes, and the client stops lying. An explicit
>   `replace` intent (set from `defs.has(speciesId)` — "this came out of the
>   game") opens the guard *only* for an edit; a new species colliding with a
>   built id still hits the original refusal word for word.
> - **`a871169`** — card PB-076. **`PB-075` was taken while I held it** — fourth
>   id collision tonight.
>
> ### The thing that nearly went wrong, and the number that proves it didn't
>
> **`defToModuleSource` is byte-identical to 0 of 30 shipped files.** The
> generator writes an 11-line placeholder where the real files carry their
> derivations — `animal-hedgehog.ts` is **286 lines on disk against 50 emitted**.
> A push that regenerated the file would have deleted **236 lines of argued
> reasoning, including Joe's own 29 July ruling quoted verbatim.** That is worse
> than the no-op it replaces: the no-op cost him an hour, this would have cost
> the project its memory.
>
> So an update **splices**: `withUpdatedDefinition` brace-matches the single
> `defineCreature('<id>', {...})` literal and replaces only that, refusing rather
> than guessing on zero or multiple matches. Proved over the real files, not in a
> fixture: **30/30 re-splice their own literal as a byte-exact no-op, and 30/30
> preserve every byte outside the span.** The hedgehog's definition opens on line
> 223 and all **222 lines above it survive verbatim**.
>
> One trap worth knowing: all thirty files write `pupil: PACK_PUPIL`, which the
> editor emits as a hex because `def.ts` is deliberately three.js-free. Without
> `withRestoredConstants` every update would have left an unread import and
> **`noUnusedLocals` would have turned `tsc` red on a push that otherwise
> worked**. A value Joe genuinely changed keeps its new literal and the dead
> binding is *named* for him, never deleted.
>
> ### Gate results — full tree, rebased onto `8f380a1`
>
> ```
> npm test    Test Files 156 passed (156)   Tests 3458 passed | 1 skipped (3459)
> tsc         0 errors
> build       precache 50 entries (1845.22 KiB), files generated
> smoke       all boot checks passed
> parity      every step renders identically
> channel     channel check passed  (src/ → workbench: no references, as it must be)
> ```
> Baseline at `8f380a1` was 3413/155; this run adds 45 tests and one file. The
> single skip is deliberate — the byte-fidelity case, kept un-weakened with its
> 0/30 finding written above it, because that measurement is *why* push splices.
>
> ### PB-077 — the finding that will matter more than the one I was sent to fix
>
> **The editor round-trips through EVALUATED numbers, so any expression in a
> definition is lost on any edit — splice or regenerate, it makes no
> difference.** 14 of the 30 files bind file-local constants to expressions:
> `const EAR_SINK = 0.125 / 0.359219`, `const COIL_SINK = (COIL_THICK -
> HULL_BOTTOM_Y) / COIL_THICK`, `at: [0, HULL_MID_Y + 0.1, 0.5]`. A push flattens
> them to literals and leaves the locals unread, so the *derivation* — the thing
> that says why a number is that number — is gone even though the geometry is
> perfect. The 14: **bushbaby, civet, corn-snake, crocodile, firefly, glow-worm,
> goldfish, kiwi, mole, nightjar, opossum, raccoon, slow-worm, tarsier.** The
> other 16 are clean.
>
> `staleBindings` **names the exact dead lines** rather than deleting them, and
> that mitigation is what made turning the push on safe tonight. It is not a fix.
> The route is **`def.ts:1313`**: have `defineCreature` register the `def` beside
> the build it returns, so the editor opens the SOURCE definition rather than a
> reconstruction — that closes all 14 at once. **Do not start it on your own
> authority.** It changes what an edit *means* and the blast radius is different
> from PB-076; it is Joe's to begin.
>
> ### Where the next manager starts
>
> **Joe can now push, so the next thing he hits is the loop around it.** Two
> concrete gaps, both his words: `insertPart` names a part after its bank shape
> id (`box-09` where he expects `mouth`), which needs a **rename-a-part control
> that does not exist** — that one is already with Joe, do not invent it. And an
> unpainted inserted part silently takes the coat, with no warning; an axiom in
> `warningsFor` (`def.ts:1051`) would be cheap and is not yet raised as a card.
> Otherwise the queue is **PB-073 (Home Pets, 14 to build)** and **PB-074 (Farm,
> all 16)**, both unblocked, both carrying the JT-041 amendment.
>
> ### Landmines paid for this run
>
> - **A 200 is not a success.** `push.mjs` has *six* `return null` "already
>   there, not an error" no-ops. Collectively they let a push report 200 having
>   written literally nothing. Anything reading that reply must judge it by
>   **what it says it WROTE** — `pushOutcome` in `push.ts` is the seam, and place
>   1 is the species module.
> - **`docs/HANDOFF.md`'s say-card trap does not apply in the workbench.**
>   `body:has(.overlay:not(.hide)) .say` lives in `src/ui/tokens.css`; the editor
>   loads only `editor/editor.css` and has no overlay. The editor's own failure
>   was different and worse: `main.ts` set `className = 'note warn'` on the
>   **success** path too, so success and failure were the *same string*. There
>   was no red note class at all until this run.
> - **Do not measure "was this file written" from `git status` alone.** I
>   concluded the 400 refusal had fired because `moves.ts` was clean — it was
>   clean only because the drumbeat had already committed it as `8f380a1`. The
>   commit log is part of the evidence.
>
> ### Decisions
>
> **No JT raised, deliberately, and this is the one thing to check.** The open
> question is whether an update push should ask Joe to confirm before it
> overwrites a built animal. I shipped **no confirm** — the refusal's own comment
> says replacing a species is *"a thing to do on purpose, in an editor, with git
> watching"*, and a confirm on his primary workflow is friction. Joe is live in
> the workbench right now, so a fifth whole-file id collision tonight is a real
> risk against near-zero benefit; the drumbeat is relaying to him directly
> instead. **If he wants a confirm, it is one branch in `push()`.**

> ## ⚠ ALSO CURRENT — the PB-070 manager's handover, 2 Aug 2026 (night)
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
