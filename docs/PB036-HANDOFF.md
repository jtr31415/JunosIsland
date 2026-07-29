# PB-036 handoff — themed animal collections

*Run 13 (PB-036 manager, phase 5), written 29 July 2026. Read
`docs/MANAGER-ORDERS.md` for the job. This file is PB-036's baton only —
`docs/MANAGER-HANDOFF.md` belongs to the queue manager and was not touched.*

## Queue position

- **Phases 1–3: DONE.** Species-as-data, roster, quadruped + songbird kits, name
  table, Joe's audit bench, 72 species.
- **Phase 4: DONE.** Raptor kit built, no species. Four measurement passes over
  the 24 GLBs, eight-row primitives bench, `docs/how-the-animals-are-made.md`.
- **Phase 5 (this run): the decomposition question is ANSWERED with numbers, and
  the answer changes the architecture.** Nothing was re-tuned, nothing rebuilt.
- Nothing is wired to a child yet, on purpose. Unchanged since phase 2.

## What this run did

Joe rejected the phase-4 primitives as *"most of them are not that"* and asked:
*"the original animals decomposed into their constituent parts. we then use those
parts to build new animals as far as we can, either by new assembly or by
adjusting a copy of a primitive. we should not create our own primitives. is this
doable?"* Phase 4 had answered a smaller question — it counted **node names** and
concluded `body` was atomic. This run counted **connected components inside the
meshes**, which nobody had done.

**1. The component census.** 24 bodies → **206 position-welded components**, 4–12
each, median 9. (A first pass said 3,217; that is UV-seam vertex splitting, not
structure. Weld first.)

**2. A head does NOT separate from a torso — 0 of 24.** Every body has exactly one
hull spanning the head zone and the torso zone. **Joe's "head = body" axiom is the
pack's topology.** The kits emit head and body as two boxes and never merge them
(`quadruped.ts:229`/`:269`, `raptor.ts:289`/`:372`, `songbird.ts:205`/`:268`), so
**all 72 built species differ structurally**, not by tuning.

**3. But 182 feature parts across ~25 kinds DO separate** — 48 eye cards, 42 ears,
25 noses/snouts, 22 antler/horn/ossicone/crest, plus teeth, claws, torso bands, and
zero left unnamed.

**4. The finding nobody expected: Kenney already builds them Joe's way.** The hull
is the **identical 1.250 cube in 13 of the 24** — same 60 triangles, same 120
points. Only **10 distinct body shells exist**, not 24. His instruction is not a
new method; it is the pack's method.

**5. Portability.** One jig: same axes, ground at y=0 in 20/24, rear plane
z=−0.625 in 23/24. **The eye card sits at z = 0.6350 with standard deviation
0.0000 across all 24** — face parts drop in on an absolute translate. Ears scatter
~0.15 units either way and must be placed by hand; snouts need z re-fitted to body
depth. Ears vary 2.97× and snouts 2.90× naturally, so stretching copies is safe;
**eye cards (1.44×) and face plates (1.07×) are fixed and must never be stretched.**
Every eared species embeds its ear *into* the hull, minimum margin 0.125.

**6. Colour on lift.** The set recolour is **not** a UV shift — it repaints the
atlas (`recolour.ts:381`). Sub-node retargeting already ships per-vertex-run
(`facedecals.ts:119-127`). The breaker: **39% of liftable components span more than
one palette band**, minority colour at a median 37%, so a lifted head is two-tone
and one column shift moves both halves to unrelated colours. JT-029 (*"we drop the
colours"*) softens this for most of the roster.

**7. Honest reach.** ~**2,100** distinguishable creatures from geometry alone,
~300–600 reading as a different animal. **186 of 296 buildable from real parts; 64
impossible** (Ocean, Critters, Dinosaurs, Raptors — no fin, insect wing, frill or
hooked beak); **46 partial** (Birds, Outback, Legendary). **Phase 4's "24 faces is
the ceiling" was wrong** — it assumed the head was atomic. It is, but the face is
not part of it.

**8. Joe's four axioms, pinned as tests over the real GLBs**
(`tests/island/pack-axioms.test.ts`, 16 tests / 52 assertions, 0.58s, no fixture):
head=body **24/24**, eyes flat **48/48** (exactly zero thickness), legs under body
**23/23**. The sclera axiom is **refuted as stated** — five outlines, not two — but
his two families cover **42 of 48 eyes on 21 of 24 species** and all three
exceptions sit *between* the two he named. Note the legs deliberately **sink into
the belly** (worst 0.225, lion), so "under the body" means under its middle; the
stricter reading fails 22/23 and that refutation is pinned too.

**9. The Anatomy gallery — what Joe asked to see.** `npm run workbench`, third tab.
Decodes the real `.glb` in the browser and splits `body` live; nothing baked. Fox
= 10 labelled parts, deer = 15. **Kenney's node names plain, our names amber and
prefixed `our name:`** — he must always be able to tell a measurement from an
opinion. Sizes in model units, so the eye cards visibly read `0.000` on an axis.
Wrong labels being worse than none, the split is asserted against the census table
and falls back to `unnamed component N`.

## Gate results

Run by me on `0369387`, all five, back to back:

```
$ npm test        Test Files 97 passed (97)   Tests 2046 passed (2046)
$ npx tsc --noEmit -p tsconfig.json           exit 0, zero output
$ npm run build   precache 8 entries (773.57 KiB), files generated
$ npm run smoke   all boot checks passed
$ npm run parity  every step renders identically
```

Agent revert-checks reported to me, **not watched by me**: weld tolerance
1e-5 → 0 gave 31 red of 152; `packsFor('anatomy')` returning `['pets']` gave 3 red
including the cross-gallery guard; flipping the eye-outline count 10 → 11 gave 1
red of 16. All restored green.

## Where the next manager starts

**Read JT-034 first. It supersedes the premise of JT-032**, which is still open.
JT-032 asks him to sign off primitives the kits build *from*; JT-034 tells him the
kits are assembled the wrong way round regardless of which primitives they use, and
gives three options with the rebuild cost. **Do not start a kit, and do not fan out
species, until JT-034 is answered** — 72 species already exist against these kits.

If JT-034 comes back A or C, the first real build is **one new species assembled
entirely from lifted, adjusted original components**, on the Anatomy bench beside
the live 24. **I did not get to that** — Joe redirected mid-run to the exploded
view and asked to hold everything else. It remains the honest proof and it should
be the next thing built.

The measurement artefacts are in the session scratchpad and will not survive:
`component-census.json` (3.7 MB, every component of every body) and
`portability.json`. **`tools/workbench/public/anatomy-names.ts` is the durable
distillation** — 290 lines, generated by `tools/workbench/anatomy-names.mjs`. If
the census is needed again, re-run the generator, do not hand-edit the table.

The three wiring seams remain unwired and unchanged: `pets.ts prototype()`,
`atlas.ts dress()` early-returning for built species, and `main.ts:1174` swapping
`petName(defaultRng)` for `givenName(species)` — one argument, not two.

## What I learned that is not in the code

- **Counting node names is not counting parts.** Phase 4 concluded the body was
  atomic from the node list and was wrong for four passes. A mesh with one name can
  hold twelve disconnected islands. Always weld by position first — the raw index
  graph reports 3,217 components where there are 206, because the exporter splits
  vertices at UV seams.
- **Rank components by bounding-box volume, never by triangle count.** In 6 of 24
  the largest-by-triangles part is an *ear*, not the body. A panda ear is 116
  triangles against a body shell of 72.
- **`git add <paths>` does not protect you from another manager's staged work.**
  I staged my eight files, but the PB-052 manager had already `git add`-ed theirs
  into the same index, and my commit swept up `flow.ts`, `world/props.ts`,
  `world/mountains.ts`, `world/walk.ts` and three test files under my message.
  Nothing was lost and all five gates are green, but their work is now attributed
  to my commit. **Run `git diff --cached --name-only` and READ IT before
  committing, not in the same `&&` chain** — mine ran in the same command, so the
  commit had already happened by the time I saw the list. In a shared tree, check
  the index is empty first.
- **A screenshot is the only proof a viewer renders.** I looked at the image
  myself rather than accepting "it renders", per the precedent that the last viewer
  shipped verified and showed the wrong gallery.

## Decisions

**RAISED this run:**
- **JT-034** — *NEEDS JOE: the kits build head and body as two shapes; every
  original is ONE. Do we rebuild the 72? (PB-036)* Three options with cost. Fable
  was not asked — this changes what a child sees.

**PICKED UP this run:** none. **JT-030 and JT-032 remain open**, and JT-032 is now
partly overtaken by JT-034.

**NOT ACTED ON, deliberately, and inherited intact:** the wider half of JT-029 —
*"we drop the colours"* — which touches pets Juno already owns. Phases 2–4 left it
and so did I. It needs Joe, and no subagent should tidy it away.
