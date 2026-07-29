/**
 * Fill `joe/` from what the repo already knows, once.
 *
 * Three of these files are Joe's own working documents from the moment they
 * exist, so seeding is strictly create-if-absent: re-running the server must
 * never walk over a red pen. `--force` exists for the round-trip test, which
 * seeds a throwaway root, and for nothing else.
 *
 *   node tools/workbench/seed.mjs [--force] [--root <dir>]
 *
 * The lesson curriculum is PARSED out of `docs/pet-island-runA.md` Appendix L
 * rather than retyped here. Retyping it would create a second copy that drifts,
 * and the spec is explicit that the appendix is the seed.
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'
import { exists, writeJson, inside } from './repo.mjs'
import { saveLesson, LESSON_DIR } from './lessons.mjs'

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/* ------------------------------------------------------------------ Appendix L */

/**
 * Pull the lesson blocks out of the spec.
 *
 * Deliberately forgiving about the meta line, which is prose in the source —
 * `*Exemplar: 4 + 3 · File: lessons/… · ~13s*`, sometimes wrapped over two
 * lines, sometimes carrying "Requires INTRO-TEN seen." So: gather the italic
 * run, flatten it, and pick fields out by name. A parser that demanded the
 * exact layout would break the first time Joe reflowed a paragraph.
 */
export function parseAppendixL(md) {
  const start = md.indexOf('# APPENDIX L')
  if (start === -1) return []
  const region = md.slice(start)

  const out = []
  const re = /^## ([A-Z][A-Z0-9-]+) — (.+)$/gm
  const heads = [...region.matchAll(re)]

  for (let i = 0; i < heads.length; i++) {
    const [full, id, title] = heads[i]
    const from = heads[i].index + full.length
    const to = i + 1 < heads.length ? heads[i + 1].index : region.length
    const block = region.slice(from, to)

    /*
     * The meta is everything before the first bold heading, flattened.
     *
     * Line-by-line italic matching looked tidier and quietly dropped three
     * lessons' filenames: L-ADD-3's meta wraps mid-emphasis, so its second
     * line does not begin with a `*` and never matched. Take the paragraph,
     * not the lines.
     */
    const flat = block.split('**')[0].replace(/\*/g, '').replace(/\s+/g, ' ').trim()

    const pick = re2 => { const m = re2.exec(flat); return m ? m[1].trim() : '' }

    out.push({
      id,
      title,
      /*
       * Stop at the next FIELD, not at the next punctuation mark.
       *
       * INTRO-TEN's meta is two italic lines — "…Exemplar: ten ones." then
       * "File: …" — with no separator between them once they are flattened, so
       * a `[^·]+` run swallowed the filename into the exemplar. Naming the
       * terminators is what makes both layouts parse.
       */
      exemplar: pick(/Exemplar:\s*(.+?)\s*(?:·|\bFile:|\bRequires\b|$)/).replace(/\.$/, ''),
      file: pick(/File:\s*([^\s·*]+)/),
      approxSeconds: Number(pick(/~(\d+)s/)) || 0,
      requires: pick(/Requires\s+([A-Z][A-Z0-9-]+)\s+seen/),
      status: 'draft',
      beats: section(block, 'Visual beats'),
      script: section(block, 'Script').replace(/^"|"$/g, '').trim(),
    })
  }
  return out
}

function section(block, name) {
  const re = new RegExp(`\\*\\*${name}:\\*\\*([\\s\\S]*?)(?=\\n\\*\\*|\\n---|$)`)
  const m = re.exec(block)
  return m ? m[1].trim() : ''
}

/* ------------------------------------------------------------------ Joe's queue */

/**
 * The seven from the spec's JOE'S QUEUE, as tasks.
 *
 * `doneRule: 'artefact'` means the thing itself decides: the Done button
 * validates and warns rather than overriding, because "I ticked it" and "the
 * file is vetted" are different facts and only one of them unblocks a run.
 * `check` names the validator in `tasks.mjs`.
 */
const TASKS = [
  {
    id: 'JT-001', type: 'review', title: 'Vet the lesson scripts',
    detail: 'Red-pen every lesson in the editor, status draft → vetted. Includes the school-verb check: does her school say "borrow" or "take" for the carry? L-ADD-4 and L-SUB-4 both use "borrow".',
    blocks: ['C.lessons', 'A8.bake'], artefact: 'joe/lessons/', doneRule: 'artefact',
    check: 'lessonsVetted', note: '', state: 'open',
  },
  {
    id: 'JT-002', type: 'config', title: 'AZURE_SPEECH_KEY into .env',
    detail: 'Unblocks the bake console. Add AZURE_SPEECH_KEY=… and, if not uksouth, AZURE_SPEECH_REGION=…. The file is gitignored; the key never enters the page.',
    blocks: ['A8.bake'], artefact: '.env', doneRule: 'artefact',
    check: 'envKey:AZURE_SPEECH_KEY', note: '', state: 'open',
  },
  {
    id: 'JT-003', type: 'external', title: 'Voice casting: audition, then set joe/voices.json',
    detail: 'Placeholder en-GB voices are in place so the pipeline runs. Everything re-bakes on change — casting is data, so changing Fred marks every clip stale and one batch bake fixes it.',
    blocks: ['C.lessons'], artefact: 'joe/voices.json', doneRule: 'manual',
    check: 'voicesCast', note: '', state: 'open',
  },
  {
    id: 'JT-004', type: 'review', title: 'Red-pen joe/noun-candidates.json',
    detail: 'Nouns drafted in editor dialect for the words ladder. Blocks Run D top rungs. The file arrives with Run D; this task is open ahead of it so the queue shows what is coming.',
    blocks: ['D.rungs'], artefact: 'joe/noun-candidates.json', doneRule: 'artefact',
    check: 'fileExists:joe/noun-candidates.json', note: '', state: 'open',
  },
  {
    id: 'JT-005', type: 'review', title: 'Strike the rejects in joe/pairs-audit.json',
    detail: 'Every close-spelled trap pair must be distinct in HER accent, not in a dictionary. Blocks Run D trap rungs. File arrives with Run D.',
    blocks: ['D.traps'], artefact: 'joe/pairs-audit.json', doneRule: 'artefact',
    check: 'fileExists:joe/pairs-audit.json', note: '', state: 'open',
  },
  {
    id: 'JT-006', type: 'external', title: 'Record the 43 phonemes',
    detail: 'Sound booth. Eternal — recorded once, used forever. Unblocks Fred-talk clips.',
    blocks: ['fred-talk'], doneRule: 'manual', note: '', state: 'open',
  },
  {
    id: 'JT-007', type: 'external', title: 'Evening after Run A: hand-tick taking-away 1',
    detail: 'Grown-ups panel → takingAway → Manual → tick stage 1. This is the QA department getting subtraction. Untick is a parent\'s hand, not a demotion, so it is safe to try.',
    blocks: ['A.qa'], doneRule: 'manual', note: '', state: 'open',
  },
]

/* ------------------------------------------------------------------ the backlog */

/**
 * Every open card CC could find, deduped against what has actually shipped.
 *
 * Sources: `docs/BACKLOG.md` (written at the end of the overnight run),
 * `docs/STATUS.md` "Waiting on Joe" and "Scope discovered", and the Run A
 * spec's own deferred lists. Cards that STATUS records as merged — the
 * growable-witness backstop (#41, 7bc3025), the break suggestion (#36,
 * ff665cb), change-your-mind (#32, efff9fa) — are NOT here, because a backlog
 * that lists finished work is a backlog nobody reads.
 *
 * IDs are monotonic and never reused, so a reference in a spec stays valid
 * forever even after a card is closed.
 */
const BACKLOG = [
  ['PB-001', 'The item-13 difficulty currency disagrees with itself', 'pet-island-difficulty.md §5 and slice-1 §4 are in the same currency and disagree. Today one sum banks one unit against a tile costing 1–16. §5 sets easy=2, tricky=3, honeymoon=4; Phase 3 adds mastered=1. Either the cost curve re-bases or session length halves. Run A7 re-bases units ×2 invisibly; this card is the REMAINING question about differential pay.', 'open', 'B'],
  ['PB-002', 'Does v1 ship without adaptive difficulty?', "Fable's view: yes, since today's fixed difficulty is the v0 behaviour she already plays. Joe's call.", 'open', ''],
  ['PB-003', 'The two overlays behave differently', 'Tapping outside a tile offer returns to the island (zero-cost menu). Tapping outside a CHALLENGE does nothing (work in progress). Recorded as a rule in HANDOFF §6, but it is a feel judgement and Juno is the only real judge.', 'open', ''],
  ['PB-004', 'A camera gesture is live that was never ruled on', 'Tapping her own land turns the island about that tile. Costless, cannot start a round, but it is a product change to a gesture Joe had explicitly ruled on. Veto is one line in interactions.ts (the focusOn call in the tile case).', 'open', ''],
  ['PB-005', 'Lighting review, tilt-shift, more fog, visual options menu (#43)', 'END OF PHASE 4. What is missing is measured fps on the actual mid-range Android tablet — nothing in this project has ever been measured there. Order: measure → amend the brief → build. ?flat already exists reserved for this. The DEFAULTS matter more than the options, because she will never open a settings menu.', 'open', ''],
  ['PB-006', 'Get it in front of Juno again (#34)', 'The highest-value action that is not code. Everything she reported on 27 July is fixed. It is also the only way to judge what was decided on a DPR-1 desktop at night by one person: the font, the prop shadows, the tap target, the 3:1 ratio, the camera gesture.', 'open', ''],
  ['PB-007', 'One found word banks the whole page (#44)', 'earned is set by flyToScore, which the word-find fires on EVERY found word, not on completion. Run A1 fixes the scoring semantics; this card closes when A1 lands with its regression test.', 'planned', 'A'],
  ['PB-008', 'void async over a loop — three more sites (#46)', 'props.ts water-piece and cloud load, pets.ts sync(), album.ts portraits.shoot. One rejection abandons every item after it AND surfaces unhandled. Also: the scatter comment claims a lost cover piece is re-dressed next sync — FALSE, placed.add(k) runs before scatter().', 'open', ''],
  ['PB-009', 'A quarter of dead trunks flicker shadowless (#47)', 'VARY has no real floor — (dh >> 13) % span is a signed shift on an unsigned hash, so 48.8% of pieces get a negative term. Do NOT fix by flipping the shift: that re-rolls the size of half the scenery on every island that already exists. Fix by shadowing by KIND, or correct the test.', 'open', ''],
  ['PB-010', 'Batch the blob shadows before the 40-tile island (#47b)', 'createBlobShadow makes fresh geometry AND material per blob; +1 draw call each, ~70 extra at 40 tiles. Must exclude pets, whose castShadow mutates opacity per frame. Natural home: beside the Phase 5 lighting rework.', 'open', ''],
  ['PB-011', 'Album pop-out (#31)', 'Tap a pet for a larger card: rotating pet, NAME, SPECIES, find-it-on-the-map, speak-its-name. Five things already established — see docs/BACKLOG.md. Notably: no display name exists for a species, and a rotating pop-out means a live loop on a second WebGL context.', 'open', ''],
  ['PB-012', 'Pure play elements as a session reward (#39)', 'PARKED — not to be built without Joe. The observation matters as much as the idea: after an hour of earning, the reward she chose for herself was unstructured looking. The cheapest "pure play element" may be to stop obstructing the play she has already invented.', 'parked', ''],
  ['PB-013', 'Release engineering (#35)', 'No item exists for: cutting the first v* tag; verifying npm run channel against a TAGGED build; an on-tablet pass; a pre-session backup from the gear; deleting the redundant docs/nextphase.zip.', 'open', ''],
  ['PB-014', 'Prop glTFs 404 on a texture that is never used (#45)', 'props/*.gltf reference hexagons_medieval.png but the folder ships only the _Summer variant. Harmless, but it has cost two agents time. A clean console is a debugging tool. Cheapest fix is the loading manager.', 'open', ''],
  ['PB-015', "Tablet screenshot wanted: a rim mountain's shadow", 'Hills and mountains throw an ellipse landing ~3.7 units from the base, spanning neighbours and overhanging the sea. Arithmetic is right for a 35° sun. If it reads broken on the tablet, cap stretch/radius for big features rather than inventing clipping.', 'open', ''],
  ['PB-016', 'Progressive album + set unlocks (brief item 7)', 'Owns wiring variants onto live pets, and now owns a SHORTER ladder: 600 creatures, not ~1,000, because the spotted twelve were dropped once it was proved the atlas cannot express a spot. Either a third wearing arrives or the pacing re-bases on 600.', 'open', ''],
  ['PB-017', 'Habitats, nursery, move-in (brief item 8)', 'Phase 5.', 'open', ''],
  ['PB-018', 'Pet quests v1 (brief item 9)', 'Phase 5.', 'open', ''],
  ['PB-019', 'The daily visitor (brief item 10)', 'Phase 5.', 'open', ''],
  ['PB-020', 'Small ports (brief item 11)', 'Phase 5; scope grew. Owns the text half of the splice law — script.ts still speaks [NAME].', 'open', ''],
  ['PB-021', 'Per-item records + scheduler (brief item 12)', 'Phase 5. Overlaps the Run A attempt model — check what A5 persistence already gives this before rebuilding it.', 'open', ''],
  ['PB-022', 'Biome & tile ladder (brief item 14)', 'docs/rock-hexes-proposal.md is a down-payment, and carries two questions: what a rock tile is FOR (if not habitable, choosing it silently slows her pet progress, which a six-year-old cannot weigh), and that "pure grey" is not available — bare mountain variants sample the atlas rock swatch, which Summer renders TAN.', 'open', ''],
  ['PB-023', 'Stardust, the Star Pool, the first wonder (brief item 15)', 'Phase 5.', 'open', ''],
  ['PB-024', 'Persona simulator (brief item 16)', 'Phase 5. Would pay for itself against the Run B progression gates — a simulated child is how you test a ratchet that must never demote.', 'open', ''],
  ['PB-025', 'Blossom enchantment I (brief item 17)', 'Phase 5.', 'open', ''],
  ['PB-026', 'Enclosed ponds are no longer constructible', 'A gameplay change Joe should veto if it is wrong. Confining water to the 19 drawable neighbourhoods is what lets the water cell carry its whole beach — but water now grows as coastline and never as a hole in the middle of her island.', 'open', ''],
  ['PB-027', 'Four things tested but never looked at', 'The rebuilt egg, one-tap tile siting, the grown-ups PIN keypad, and the grown-ups menu. Run A6 adds a great deal to that last one, so the eyeball pass is worth more now than it was.', 'open', ''],
  ['PB-028', 'The splice law has not reached the voice', 'Amended brief §3 rewrites opening beats 6 and 7. The text half folds into item 11 (PB-020); the voice half needs this bake pipeline and Joe\'s key.', 'open', ''],
  ['PB-029', 'The legendary ten sets', 'Deliberately absent — creatures wearing props, around 750 challenges in, belonging with the wonders work.', 'parked', ''],
  ['PB-030', 'Run B — automatic progression', 'Gates on the A6 signals; probes; the universal offer line; taking-away introduced by offer then dealt MIXED; weakness-lean bounded 65/35; invisible mercy runs; whisper retirement; "what Auto would do" goes live. Nothing demotes, ever.', 'planned', 'B'],
  ['PB-031', 'Run C — new maths content + lessons', 'Appended generators; the ten-dot with SNAP and un-SNAP; the box re-order; the lesson player with the ❓ second step and the five-error OFFER. Blocked on JT-001 to JT-003.', 'planned', 'C'],
  ['PB-032', 'Run D — the words ladder', 'word-grades.json tags over frozen arrays; rejection-sampling; close-spelled trap sets; find-before-build debut rule; the accent audit. Blocked on JT-004 and JT-005.', 'planned', 'D'],
  ['PB-033', 'The asset viewer galleries (deferred from A8)', 'DEFERRED OUT OF RUN A, deliberately: three orbitable galleries (24 species, both tile types with every coast variant and plot increment, every FEATURES/COVER prop) reusing the game\'s own loaders and registries. It is a three.js surface, not a form, and it would have eaten the run. The comment box and joe/asset-notes.json ARE built — the notes tab already accepts an ID and a note, so the API half is proved and only the gallery is missing.', 'open', 'B'],
  ['PB-034', 'Story sums as a presentation path', 'A presentation path OVER the arithmetic: numbers always drawn from currently ticked sums/takingAway stages; text always with speech; help step one reveals the translated equation, after which the pure-maths ladder applies; post-reveal answers feed neither estimate. Tickbox slot reserved in Run A.', 'planned', 'C'],
  ['PB-035', 'Fractions, multiplication, division', 'Reserved, greyed tickbox slots only. "Coming later" in the panel.', 'parked', ''],
]

/* ------------------------------------------------------------- primitives */

/**
 * The primitives Joe is being asked to sign off, one at a time, before any kit
 * is re-tuned.
 *
 * PB-036 phase 4. He looked at the 72 procedurally-built animals and said they
 * are too square, that the legs and feet are too big, and that the eyes are
 * inconsistent — and then, of the fix: *"i'd like to sign off the primitives to
 * be used first."* So this is not a bug list. It is the set of shape decisions
 * the kits ride on, each with the measured value from the Kenney pack, what the
 * kits do instead, and the discrepancy. NOTHING is re-tuned until he has ticked
 * the primitive it rides on.
 *
 * WHY THE ROWS ARE HERE AND NOT IN A JSON FILE IN THE REPO. Same reason `TASKS`
 * and `BACKLOG` above are: one copy. A `joe/primitives-audit.json` committed
 * alongside a list in the seeder is two copies of the same eight rows and they
 * drift. The seeder writes the file create-if-absent, so booting the server can
 * never walk over a verdict, and re-measuring later goes through
 * `primitives.ts regenerate()` or `/api/save`, both of which carry `signoff` and
 * `note` across by id.
 *
 * `signoff` and `note` are HIS and are seeded empty. Every other field is
 * measured and belongs to whichever agent last went and measured it. That split
 * is enforced in `merge.mjs MERGEABLE.primitives`, not by anyone remembering.
 *
 * DELIBERATELY INCOMPLETE. Eight rows, and the shape is meant to be obviously
 * extensible — more will land in this same array. What is NOT here is not a
 * lapse: leg length, leg thickness, foot size and head:body have not been
 * measured yet, and inventing plausible numbers for them would be the single
 * worst thing this file could do, because he would sign them off.
 */
const PRIMITIVES = [
  {
    id: 'eye-size',
    group: 'Face',
    title: 'How big an eye is',
    question: 'Should an eye be an absolute size, the same on every animal, instead of a fraction of that animal\'s head?',
    packSays: 'The pack\'s eye is an absolute 0.400 × 0.320 model units, on a face plate that is 0.625 × 0.625 and byte-identical in all 24 models. Eye width is 0.64 of the plate. Relative to model height it stays in a narrow 0.19–0.29 band — a 1.54× spread across all 24.',
    kitSays: 'The kits size the eye as 0.26 × head multiplier (quadruped.ts:296-302) and 0.30 × head (songbird.ts:278-284) — a function of the species\' head, not a constant. Measured across the 72 built species, eye width relative to pet height runs 0.0597 to 0.1603, a 2.95× spread, and animal-hippo against animal-goose is that whole spread inside one viewer screen.',
    gap: 'The kits made the eye a function of `head`; the pack made it a constant. A kit eye is also about 2.4× smaller relative to the animal than any original\'s.',
    proposal: 'Freeze the eye at an absolute pre-fit size (~0.400 × 0.320) rather than a fraction of head. The consequence, said out loud: a small-headed species then gets an eye wider than its head\'s front face. That is canon, not a bug — the pack\'s own eye pair spans 0.925 against a 0.625 plate and overhangs the plate\'s side edges by 0.15 each side.',
    evidence: 'src/island/species/kits/quadruped.ts:296-302 (hd × 0.26 white, hd × 0.14 pupil) · src/island/species/kits/songbird.ts:278-284 (hd × 0.30) · measured over the 24 GLBs in src/island/public/pets/ and over the 72 species SHIPPED_SPECIES builds.',
    signoff: '',
    note: '',
  },
  {
    id: 'eye-relief',
    group: 'Face',
    title: 'Whether an eye sticks out or lies flat',
    question: 'Should the eye be a flat cut-out sheet lying on the face, as every original is, instead of a protruding ball with a second ball in front of it?',
    packSays: 'The face is a flat cut-out sheet exactly 0.0100 units in front of the head, in 24 of 24 models. Every one of the 63 decals faces +Z, with an area-weighted normal z of 1.000000 exactly. colormap.png contains no drawn face at all — the eye is polygons cut to an eye shape, flat-shaded from two swatch columns (u=112 whites, u=496 darks). The pupil is polygons inside the same sheet, not a separate mesh. Only 10 distinct outlines exist in the whole pack, and 32 of the 63 decals are the same 27-triangle mesh.',
    kitSays: 'The kits build protruding spheres — an `eye-*` lump plus a separate `pupil-*` lump floating further forward still. The white protrudes 0.031–0.094 world units off the face and the pupil 0.045–0.137. The songbird kit puts eyes on the ±X faces of the head; no original does this — all 63 decals face +Z.',
    gap: 'Flat cut-out versus protruding ball, and front-facing versus side-facing for 13 of the 72.',
    proposal: 'Place the eye flat, 0.0100 off the head front, as a coplanar sheet. TWO SUB-DECISIONS ARE YOURS. (i) shared.ts:17-22 states that the primitive vocabulary is closed to boxes and lumps and that src/ "must not gain" a third geometry type — a cut-out sheet IS a third type, so this asks you to reopen a rule that was written down deliberately. (ii) Moving 13 songbirds\' eyes to the front is a look change for a fifth of the built roster.',
    evidence: 'src/island/variants/recolour.ts:124-125 (u=112 the pale column, u=496 the dark column) · src/island/public/pets/Textures/colormap.png · src/island/species/kits/shared.ts:17-22 (the vocabulary is closed) · src/island/species/kits/songbird.ts:278-284 (eyes on the ±X faces) · src/island/species/kits/quadruped.ts:290-302.',
    signoff: '',
    note: '',
  },
  {
    id: 'eye-collisions',
    group: 'Face',
    title: 'What else is already sitting inside the eye',
    question: 'Do the four part types that already intersect the eye get re-placed in the same change that flattens it, rather than afterwards?',
    packSays: 'Nothing overlaps a decal. It is a clean sheet on a clean plate.',
    kitSays: 'Four existing part types already intersect the eye\'s bounding box today: `eye-stripe` (quail, songbird.ts:447-456), `cheek-patch` (cockatiel and guinea-fowl, songbird.ts:457-465), `whisker-*-3` (ten quadrupeds — mouse, shrew, chinchilla, rat, otter, chipmunk, lynx, wildcat, coypu, cheetah — quadruped.ts:535-549), and on the quail the eye intersects the `body` itself.',
    gap: 'These are hidden today because the eye is a bulge they can sit inside. A flat decal makes every one of them worse, not better.',
    proposal: 'Re-place those three extras in the same change that flattens the eye. This is a consequence of the other two Face rows and cannot be deferred past them — flattening the eye without it ships thirteen animals with a stripe through the pupil.',
    evidence: 'src/island/species/kits/songbird.ts:447-456 (eye-stripe) · src/island/species/kits/songbird.ts:457-465 (cheek-patch) · src/island/species/kits/quadruped.ts:535-549 (whisker-*-3) · src/island/species/kits/quadruped.ts:296-302 and songbird.ts:278-284 (the eye bounding boxes they intersect).',
    signoff: '',
    note: '',
  },
  {
    id: 'edge-shading',
    group: 'Edges',
    title: 'Whether the pack is flat-shaded (it is not)',
    question: 'Should the kit primitives be smooth-shaded, the way every original actually is?',
    packSays: 'The pack is SMOOTH-shaded. Every vertex normal is the area-weighted average of the faces meeting it — on the crab\'s cube, 32 unique positions each carrying exactly one normal, pure diagonals like (0.577, −0.577, −0.577) at a 3-way corner. Pack-wide the median angle between a vertex normal and its own nearest face normal is 25.2°, and only 13.2% of 25,848 vertices sit within 1° of a face normal. Normal splits exist only at UV/material seams and on the flat face decals.',
    kitSays: 'shared.ts:81 states in as many words that this is "the chunky, flat-shaded read the Kenney pack has". That comment is false, and it has been steering every kit since the first one.',
    gap: 'Averaging normals across a cut is what makes a hard 45° chamfer read as a soft round-over. We are not doing it, so our edges read as hard as they are.',
    proposal: 'Smooth-shade the kit primitives, and correct the comment at shared.ts:81 so the next kit does not inherit the mistake. This is the cheapest change on the whole bench and probably the largest visible win.',
    evidence: 'src/island/species/kits/shared.ts:81 (the false comment) · measured over 25,848 vertices across the 24 GLBs in src/island/public/pets/.',
    signoff: '',
    note: '',
  },
  {
    id: 'edge-bevel',
    group: 'Edges',
    title: 'How a corner is cut',
    question: 'Should a kit box become a chamfered box, cut at 45° by about a fifth of its own smallest dimension — accepting that it ends one-geometry-scaled-per-part?',
    packSays: 'Chamfered, not filleted. 72.0% of corners (3135 of 4354) carry a single flat 45° cut; 18.0% use a two-step round-over; 9.7% are genuinely sharp. Counted once per unique species/part, 111 of 132 parts use one facet, 21 use two, none use three. Median dihedral turn pack-wide is 45.0° exactly. The setback is NOT a constant absolute distance — it spans 35× in model units (cv 0.84) but is tight as a ratio to the part\'s own size (cv 0.25), landing on exact fractions: 1/6 of the cross-section for every leg (96 of 132 parts, cv 0.00) and 1/4 for the bodies. Against min(w,h,d) it is 0.20 for limbs to 0.25 for bodies. Within a part it is isotropic in ABSOLUTE units — the shared leg is cut 0.0625 in x, z and y despite h ≠ w. The pack is hand-authored on a 1/16 grid (0.0625, 0.125, 0.3125; leg width 0.375, body width 1.25).',
    kitSays: '`box()` in shared.ts is a single unit BoxGeometry scaled per part — perfectly sharp, 12 triangles.',
    gap: 'Sharp against a 45° chamfer sized to the part.',
    proposal: 'A chamfered box primitive with r = min(w, h, d) × 0.22. TWO CONSEQUENCES ARE YOURS TO WEIGH. (1) COST: three.js\'s stock RoundedBoxGeometry at its minimum segments=1 is 108 triangles per part against 12 today — roughly 1,300 for a quadruped, which is MORE than a real Kenney pet (422–951 total). A hand-built 60-triangle chamfered box matches the pack exactly and costs less. Both are real options and this is a real trade. (2) IT ENDS ONE-UNIT-GEOMETRY-SCALED-PER-PART: the bevel is isotropic in absolute units, so a unit geometry scaled non-uniformly would give an anisotropic bevel, which the pack never has. It becomes one cached geometry per distinct (w,h,d) — a change to how the kits allocate geometry, and shared.ts:86-88 explains why the present scheme was chosen (one buffer, because a species is cloned per pet).',
    evidence: 'src/island/species/kits/shared.ts:86-88 (one unit BoxGeometry scaled per part, and why) · measured over 4,354 corners across the 24 GLBs. ALSO BOUNDING HOW CLOSE BOXES CAN EVER GET: the corner profile is a superellipse of exponent about 1.36, not circular (arc midpoint at 0.60 of the corner diagonal where a circle is 0.707), and the 3-way corners converge to a single apex vertex rather than a sphere octant — so RoundedBoxGeometry reads slightly rounder than Kenney, which is invisible at the 0.16 field scale and nobody should chase it. And the denominator matters: pet heights run 1.431 (koala) to 2.010 (bunny), median 1.612, so pet height is the WRONG denominator for a bevel (cv 0.86); the part\'s own size is the invariant (cv 0.25).',
    signoff: '',
    note: '',
  },
  {
    id: 'leg-adopt',
    group: 'Limbs',
    title: 'Whether a kit leg should BE the pack\'s leg',
    question: 'Should the kits stop approximating a leg with boxes and drop in the pack\'s actual leg mesh?',
    packSays: 'The leg is ONE shape. All 86 leg instances across 23 species resolve to a single set of 24 unique vertex positions, world bbox 0.375 × 0.3063 × 0.375, identical in every instance — the 43 distinct buffers differ only in vertex order and UV splits. Authored once, re-exported 86 times. It is origin-centred and its placement is a pure node translation, so it is ALREADY a reusable primitive. The whole pack contains only nine node names across 133 mesh nodes — `body` ×24, the four `leg-*` ×86, `tail` ×8, `wing-*` ×10 and five `Group` oddments — and there are ZERO nodes named head, ear, muzzle, nose, horn, antler, beak or eye. The pack decomposes, but it stops exactly where a kit needs it most.',
    kitSays: 'The kits approximate a leg with boxes and lumps (quadruped.ts:248-262 — a `leg-*` box plus a `paw-*` box). This is the exact part Joe pointed at when he said the feet and legs are too large.',
    gap: 'We are approximating with primitives a part the pack already ships as a single reusable buffer. There is nothing to approximate.',
    proposal: 'Use the pack\'s real `leg` buffer wherever a kit draws a leg — one 24-vertex geometry, dropped in with a translation. This DISSOLVES the "too square" read on the limbs rather than tuning it, and it costs one shared buffer.',
    evidence: 'src/island/species/kits/quadruped.ts:248-262 (the box leg and paw) · the `leg-front-left`, `leg-front-right`, `leg-back-left`, `leg-back-right` nodes in src/island/public/pets/*.glb. MOST KENNEY PARTS ARE NOT BOXES, which strengthens this row: bodies are sculpted shells of 190–418 triangles, the pig\'s snout is a 12-sided elliptical cylinder with a chamfered rim, and the legs are tapered octagonal frusta. The only true cube in the pack is the crab\'s claw. COLOUR IS WELDED TO UVs, so a lifted fox tail stays fox-orange — but re-pointing is proven, shipped code: tools/pets/reserve.mjs and src/island/variants/facedecals.ts already rewrite a named node\'s UVs to a different atlas column, idempotently. The atlas is 8 hue columns at u·512 = 48…496, so an adopted part gets about 6 usable hues, NOT arbitrary colour — that is the main constraint on this whole idea. TRANSFORMS: all 133 nodes carry their own, but only ONE node in the pack carries a scale (cow/Group), so measuring cold misreports position everywhere and size almost nowhere — much less dangerous than docs/HANDOFF.md\'s general warning about KayKit transforms implies. OPEN QUESTION, NOT YET SETTLED: the parts inventory reports all 86 leg instances resolving to a single set of 24 unique vertex positions; the edge measurement reports 75 of 86 leg nodes hashing identically (44 triangles, 24 welded positions), with cow and polar carrying their own variant and the deer and fox back legs a 46-triangle variant. Both may be true at once — identical positions, differing triangulation — but that has not been proved, and "one leg" versus "one leg plus three variants" are different propositions to adopt. Settle it before any code is written against this row.',
    signoff: '',
    note: '',
  },
  {
    id: 'tail-wing-adopt',
    group: 'Limbs',
    title: 'Whether tails and wings come from the pack too',
    question: 'Should the kits adopt the pack\'s 8 tails and 5 wings alongside its leg, accepting that some species will share a tail?',
    packSays: '`tail` is 8 real shapes (fox brush, cat/tiger/monkey rope, lion tufted, beaver paddle, elephant rope, parrot fan) and `wing-*` is 5. The five `Group` oddments are cat whiskers, cow muzzle, pig snout, a second crab body cube, and the parrot crest and beak.',
    kitSays: 'The kits build tails and wings from boxes and lumps.',
    gap: '13 authored shapes exist for exactly the parts the kits approximate.',
    proposal: 'Adopt them alongside the leg. The honest limit: 8 tails and 5 wings is a small vocabulary against a 296-species roster, so a kit still needs to scale and tint them, and some species will share a tail.',
    evidence: 'The `tail` and `wing-*` nodes across src/island/public/pets/*.glb (133 mesh nodes, nine distinct names). Colour is welded to UVs and re-pointing gives about 6 usable hues off the 8 atlas columns — see the `leg-adopt` row, which this one rides on.',
    signoff: '',
    note: '',
  },
  {
    id: 'body-stays-procedural',
    group: 'Limbs',
    title: 'The body and head stay procedural — a NO, written down',
    question: 'Do you agree that adopting real parts is a HYBRID — real limbs, procedural body and head — and that the body is never adopted?',
    packSays: '`body` is 24 unique meshes with 24 unique UV buffers, and it carries torso, head, ears, muzzle, nose, eyes, horns, antlers, mane and shell FUSED into one buffer. Lifting a head means triangle-range surgery, not cloning a node.',
    kitSays: 'The kits build body and head procedurally.',
    gap: 'None. This is the part where approximating is correct.',
    proposal: 'Keep body and head procedural, permanently. There are only 24 distinct faces in the pack and the roster wants 296 species, and a child names an animal by its face. Adopting real parts is therefore a hybrid, not a rebuild.',
    evidence: 'The `body` node in each of the 24 GLBs in src/island/public/pets/ · roster §1 (296 new species) · this row exists so the question is not reopened every time someone reads the `leg-adopt` row.',
    signoff: '',
    note: '',
  },
]

/* ------------------------------------------------------------------ voices */

/**
 * Placeholder casting, so the pipeline is provable before the auditions.
 *
 * `outDir` is here rather than hard-coded because the spec asked for
 * `assets/voice/lessons/` and this repo cannot have a root `assets/`: the
 * gitignore records that it case-collides with `Assets/` on
 * case-insensitive Windows against case-sensitive Linux CI. Runtime assets
 * live under `src/island/public/`, which the PWA already precaches, so that
 * is where clips land. One line to change if that ever moves.
 */
const VOICES = {
  outDir: 'src/island/public/voice/lessons',
  manifest: 'src/island/public/voice/manifest.json',
  region: 'uksouth',
  cast: {
    fred: { voice: 'en-GB-RyanNeural', rate: '-8%', pitch: '0%', cast: false },
    teacher: { voice: 'en-GB-SoniaNeural', rate: '0%', pitch: '0%', cast: false },
    owl: { voice: 'en-GB-ThomasNeural', rate: '-4%', pitch: '0%', cast: false },
  },
}

/* ------------------------------------------------------------------ run it */

export function seed(root, { force = false } = {}) {
  const made = []
  const put = (rel, value) => {
    if (!force && exists(root, rel)) return
    writeJson(root, rel, value)
    made.push(rel)
  }

  put('joe/tasks.json', { schemaVersion: 1, tasks: TASKS, archive: [] })
  put('joe/backlog.json', {
    schemaVersion: 1,
    nextId: BACKLOG.length + 1,
    cards: BACKLOG.map(([id, title, detail, state, run]) => ({ id, title, detail, state, run })),
  })
  put('joe/voices.json', VOICES)
  put('joe/asset-notes.json', { schemaVersion: 1, notes: [] })
  /*
   * The name audit arrives empty on purpose.
   *
   * The rows are GENERATED — one per pet name, written by whatever run last
   * built the roster — so seeding them here would create a second copy that
   * drifts from it, which is the same mistake retyping Appendix L would be.
   * What the seed guarantees is the SHAPE: the file exists, so the panel opens
   * and a patch has somewhere to land before the generator has ever run. And
   * create-if-absent means booting the server can never walk over a verdict.
   */
  put('joe/names-audit.json', { schemaVersion: 1, names: [] })

  /*
   * The primitives audit arrives FULL, and that is the difference from the row
   * above.
   *
   * A name is generated from the roster, so seeding names would create a second
   * copy of a table the code already owns. A primitive is not generated from
   * anything — it is a measurement of the Kenney pack written down beside what
   * the kits do, and `PRIMITIVES` above is the only copy of it there is. Seeding
   * it here is what makes the bench resumable with no agent and no manager
   * running, which is the whole requirement.
   *
   * Create-if-absent, like everything else here: re-running the server after he
   * has ticked four of them must never walk over the four.
   */
  put('joe/primitives-audit.json', { schemaVersion: 1, rows: PRIMITIVES })

  /*
   * The species-edit drafts arrive EMPTY, like the names audit and unlike the
   * primitives — there is nothing to seed, because every record in this file is
   * something Joe makes in the editor and a seeded draft would be an animal
   * nobody designed. What the seed guarantees is the SHAPE: the file exists, so
   * the editor opens and a patch has somewhere to land before he has saved his
   * first draft, and `nextId` starts where the ids start.
   *
   * Create-if-absent, like everything else here: re-running the server after an
   * evening of drafting must never walk over the evening.
   */
  put('joe/species-edits.json', { schemaVersion: 1, nextId: 1, drafts: [] })

  /* Lessons come from the spec, and only if the spec is where we expect it. */
  const specPath = inside(REPO, 'docs/pet-island-runA.md')
  if (existsSync(specPath)) {
    for (const lesson of parseAppendixL(readFileSync(specPath, 'utf8'))) {
      const rel = `${LESSON_DIR}/${lesson.id}.md`
      if (!force && exists(root, rel)) continue
      saveLesson(root, lesson)
      made.push(rel)
    }
  }
  return made
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.mjs')) {
  const force = process.argv.includes('--force')
  const ri = process.argv.indexOf('--root')
  const root = ri === -1 ? REPO : resolve(process.argv[ri + 1])
  const made = seed(root, { force })
  console.log(made.length ? `seeded ${made.length} file(s):\n  ${made.join('\n  ')}` : 'nothing to seed — joe/ is already populated')
}
