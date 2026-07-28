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
