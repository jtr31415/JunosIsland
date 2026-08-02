/**
 * The aye-aye's assembly, as a definition. Night Time's third of three big-eyed
 * nocturnal primates, the strangest animal in the collection, and the one that
 * needs a part the pack never drew.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What an aye-aye IS, and the one thing this bank cannot say
 *
 * Six things make an aye-aye: **enormous bat-like ears, a shaggy black coat,
 * big orange eyes, ever-growing rodent incisors, a tail longer than its body,
 * and a skeletal elongated MIDDLE FINGER** which it taps along a branch and
 * hooks grubs out with. Five of the six are here and they are here honestly.
 *
 * **The sixth does not exist in the bank and nothing was improvised for it.**
 * The `claw` role is declared in `bank.generated.ts` and occurs **zero times in
 * all 94 records**, alongside `wing` and `horn`; there is no finger, no digit,
 * no hand and no limb shape either — `box-01`, the pack's one leg, is a 0.375
 * stub used 86 times and it is never resized. The nearest thing by proportion is
 * `cone-01`, the bee's antenna, at 0.160 x 0.400 with taper 0.000, and it is
 * roughly three times too thick, has no hand to grow out of, and would read as a
 * spike on a shoulder. So the finger is **flagged by name** rather than faked.
 * §2's escape clause is exactly this case: the best honest attempt, and Joe told
 * where it fell short.
 *
 * ## The readability problem this species shares, and its share of the answer
 *
 * A tarsier, a bushbaby and an aye-aye are three small nocturnal primates with
 * enormous eyes, big ears and a long tail. **Built from the same parts they are
 * one animal three times**, so the three are separated structurally — a
 * different eye card, a different ear and a different tail each. This one's
 * share is **the biggest ear in the bank, the biggest tail in the bank, and a
 * pair of front teeth.** Read the three apart at pet scale: the tarsier is all
 * eyes with two small buttons on its crown; the bushbaby has tall thin flaps on
 * the sides of its head; this one has two round dishes 0.743 across — 59% of its
 * own body width — a plume behind it 1.67 times the volume of any other tail in
 * the pack, and white incisors under its muzzle.
 *
 * ## AND WHAT MAKES IT NOT A MOUSE
 *
 * `animal-mouse.ts` already wears `box-25` and calls it "the biggest ears in the
 * bank", so the repeat is deliberate and has to earn itself. Four things separate
 * them and none of them is colour:
 *
 *   - **The tail.** The mouse wears `wedge-07`, the 0.200-thin rope, carried low
 *     so the animal measures a bare cube. This wears `box-23`, the fox's brush:
 *     0.744 x 0.910 x 0.910, round in section, **1.67 times the volume of any
 *     other tail in the bank**. Side by side that is the whole silhouette.
 *   - **The teeth.** A mouse has none; this has the beaver's own front pair under
 *     its muzzle, painted pale.
 *   - **The ear's colour job.** The mouse splits `box-25` at Kenney's own band 1
 *     to get a pink inner disc. An aye-aye's ears are naked black leather all the
 *     way through, so this one is painted flat from the darkest slot on the
 *     animal — one shape, opposite treatment.
 *   - **The coat.** The mouse carries the pack's mammal belly line at 8/16. This
 *     one is dark almost to the floor, at 4/16.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-33`, THE MONKEY's** — the pack drew one primate and this
 *     is its body, so all three of these animals wear it. §7 classifies it (a),
 *     "cube + 34": measured, 66 welded points against `box-03`'s 32, the extra
 *     being the monkey's own cheek and face geometry round the front side edges.
 *     **Every number a placement needs off it is the cube's** — half extents
 *     0.625 on all three axes, every flat face inset 0.3125, top y = 1.43125,
 *     front z = 0.625, recorded offset `[0, 0.80625, 0]` — so every donor
 *     transfer below lands where it would land on `box-03`. Not a stretch:
 *     `hulls.ts` is explicit that one of the pack's ten authored shells is rule
 *     1's purest case.
 *
 *   - **THE EARS ARE `box-25`, THE KOALA'S DISH, AND THEY ARE THE BIGGEST THING
 *     IN THE EAR BANK.** 0.742676 across — nothing else is half that. Its
 *     measured attachment is `x +1`, the head's SIDE, so the donor transfer joins
 *     it at THIS hull's side face x = 0.625 and takes the two coordinates the
 *     join does not move from the bank's record: y = 1.056956, z = 0.126002.
 *     **The koala wears this ear on the 1.250 cube**, and this hull's faces are
 *     that cube's, so the transfer is exact rather than an inference. Sunk its own
 *     measured 0.533662, which buries 0.396 of it — more than three times §3's
 *     0.125 floor. Painted flat from `limb`: an aye-aye's ears are naked black.
 *
 *   - **The eye card is `plate-01`, the pack's own default oval**, at its own
 *     recorded (0.2625, 0.933646) on the absolute z = 0.6350, `sink: 0`, no
 *     stretch. This is the one of the three whose eyes are NOT its headline — its
 *     ears and its finger are — so the biggest card went to the tarsier and the
 *     round one to the bushbaby, and this takes the shape sixteen of the pack's
 *     own species wear. Its band 3 is painted from `inner`, a burnt orange: an
 *     aye-aye's eye is orange and that is a colour decision, not a geometry one.
 *
 *   - **THE TAIL IS `box-23`, THE FOX'S BRUSH, AND IT IS THE ANIMAL'S SECOND
 *     HEADLINE.** §7 measured it as the pack's one true plume: round in section
 *     (y and z both 0.910248), barely tapering (0.961), and **1.67 times the
 *     volume of any other tail**. An aye-aye's tail is longer and bushier than
 *     its own body, and this is the only shape in the bank that says so. Pure
 *     donor transfer — the fox's own recorded y = 0.86875, its own `z -1`
 *     facing, its own 0.177404 burial, no spin, no stretch. `animal-dormouse.ts`
 *     and `animal-squirrel.ts` also spend it; the squirrel carries it UP the rear
 *     chamfer and this deliberately does not, because an aye-aye's tail trails
 *     behind it and a raised brush is a squirrel.
 *
 *   - **It costs a keep-out of 1.132, and that is the price of the animal.**
 *     `pets.ts:652` charges keep-out from `max(width, depth) / 2` and this is a
 *     0.910 plume behind a 0.265 muzzle. It is still inside the fox's own 1.15 —
 *     the pack's worst, and the number the island already copes with — and it is
 *     the cost of the one feature a child would name this animal by after its
 *     ears. Nothing was shortened to buy it back.
 *
 *   - **The snout is `tube-01`, the beaver's**, and the beaver is the pack's one
 *     rodent — a rounded barrel muzzle, taper 1.000, which is the blunt gnawing
 *     face this animal has. `snout: 'tube-01'` is the whole of it: the transfer
 *     joins it at the cube's front face z = 0.625 and takes y = 0.815078, the
 *     beaver's own, which transfers with certainty because `box-03`'s recorded
 *     offset IS the beaver's hull centre.
 *
 *   - **The nose is `box-10`, the cat's and the polar bear's**, on the muzzle's
 *     own front plane via `on: 'snout'` rather than by an arithmetic this file
 *     would otherwise carry a copy of — so a nose that floats or buries cannot
 *     happen quietly. It is the third different nose across these three primates
 *     and nothing had spent it. Deliberately not `wedge-10`, which is measurably
 *     the better nose tip and reads as a tongue; Joe ruled on that by name.
 *
 *   - **THE INCISORS ARE `wedge-01`, MIRRORED — the beaver's own front pair.**
 *     The bank files this shape under `nose`, and §3.1 is that a part's identity
 *     is its PLACEMENT: the beaver wears two of them at x = +/-0.073, y = 0.561,
 *     which is BELOW its own muzzle at y = 0.815. Two lobes under a muzzle are
 *     incisors, and `animal-shrew.ts` and `animal-vole.ts` already read them that
 *     way. Rule 6 gets them from one mesh — `kind: 'pair'` mirrors the +x copy,
 *     which is exactly `wedge-02`, the bank's own left-hand record.
 *
 *     They are here because an aye-aye is the only primate with ever-growing
 *     rodent incisors and it is the field mark it is named for after the finger.
 *     Placed by pure transfer: the beaver's own x and y, this hull's front face,
 *     sunk the shape's own 0.219. Painted pale so they read at 0.16 scale against
 *     a black face. **A rodent incisor, not a fang** — brief §19 is "bright,
 *     never scary", which is why the crocodile has no teeth at all, and the
 *     distinction is the shape: these are two blunt lobes 0.200 tall, not the
 *     0.445 forward-pointing tusks the bank also has.
 *
 *   - **The belly is PAINTED at 4/16, not the pack's 8/16.** §4's second way, and
 *     the number is a real difference rather than a default: §7 measured the
 *     pack's mammal boundary wandering across 0.4808-0.5481 and every Garden
 *     mammal sits at 8/16 inside it. An aye-aye is dark shaggy brown-black almost
 *     to the ground with only a grizzled underside, so the line drops to the
 *     lowest quarter — 0.25, on the pack's own 1/16 grid, which `assemblyTexture`
 *     requires and throws without.
 *
 *   - **The legs are never mentioned**, so they are the pack's own: four `box-01`
 *     sunk 0.408163 on the row at y = 0.18125 that never moves, at the default
 *     0.27 x 0.25.
 *
 *   - **The per-mesh table reads THIN on the nose (0.016) and on each incisor
 *     (0.028), and both are the shapes' OWN recorded burials.** Nothing was
 *     shallowed to make them fit: `box-10` and `wedge-01` are pure donor
 *     transfers at the values the pack itself measured, and `animal-shrew.ts` and
 *     `animal-vole.ts` already ship the same teeth at the same depth. §3's 0.125
 *     is the ear's floor, not every part's.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * Night Time has never carried a collection record with colours in it, so these
 * five are the first ever proposed for this animal and every one is UNREVIEWED.
 *
 * **FLAGGED, and for the finger.** Nothing else strained: 722 triangles against
 * the pack's 422-951, 512 vertices against 405-1626 (body 384 against 236-1114),
 * height 1.4312 — the bare hull on standard legs, because nothing this animal
 * wears stands above its own back — keep-out 1.132 against the fox's 1.15, every
 * part joined at a face its donor joined its own to, one mass, no stretch
 * anywhere on the animal, and nothing authored.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const AYE_AYE_ASSEMBLY = defineCreature('animal-aye-aye', {
  palette: {
    coat: 0x3c342d,    // UNREVIEWED: shaggy black-brown, the body and the plume
    belly: 0xb5a894,   // UNREVIEWED: the grizzled underside and the pale incisors
    inner: 0xdd8730,   // UNREVIEWED: the orange eye — an aye-aye's is genuinely orange
    limb: 0x1f1b18,    // UNREVIEWED: the naked black ears, the legs and the nose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The pack's ONE primate body. Its faces, chamfers and recorded offset are the
   * 1.250 cube's to the millimetre, so every transfer below is the cube's. */
  hull: 'box-33',

  /* NOT the pack's 8/16 mammal line. An aye-aye is dark almost to the ground, so
   * the boundary drops to the lowest quarter of the hull — 4/16, on the grid. */
  belly: 0.25,

  /* THE ANIMAL, part one. The koala's dish — 0.743 across, 59% of this body's own
   * width, and nothing else in the bank is half of it — at the koala's own
   * recorded height and depth on this same cube. Painted FLAT from the darkest
   * slot: the mouse splits this shape's band 1 for a pink inner disc, and an
   * aye-aye's ears are naked black leather all the way through. */
  ears: { part: 'box-25', paint: 'limb' },

  /* The pack's own default oval, with its band 3 painted burnt orange. The
   * biggest card went to the tarsier and the round one to the bushbaby; this is
   * the one of the three whose eyes are not its headline. */
  eyes: { part: 'plate-01', paint: 'inner' },

  /* THE ANIMAL, part two. The fox's brush — round in section, barely tapering,
   * 1.67x the volume of any other tail in the bank — trailing at the fox's own
   * recorded height, NOT carried up the rear chamfer, which is the squirrel. It
   * is what the 1.132 keep-out is spent on and it is worth it. */
  tail: 'box-23',

  /* The beaver's muzzle — the pack's one rodent's — and the cat's small nose on
   * its own front plane. Not `wedge-10`: that one reads as a tongue. */
  snout: 'tube-01',
  nose: { part: 'box-10', paint: 'limb' },

  /* THE RODENT INCISORS. The beaver's own front pair, which the bank files under
   * `nose` and which §3.1 says is defined by where it goes: two lobes below a
   * muzzle. Pure donor transfer, mirrored from one mesh per rule 6, painted pale
   * so they read against a black face. A blunt incisor, never a fang — brief §19
   * is "bright, never scary". */
  extras: [{ name: 'tooth', part: 'wedge-01', paint: 'belly', kind: 'pair' }],

  flag: 'THE MIDDLE FINGER IS MISSING AND IT IS WHAT AN AYE-AYE IS. The animal\'s '
    + 'whole character is a skeletal elongated third finger, twice the length of the '
    + 'others and about a third their thickness, which it taps along a branch and '
    + 'hooks grubs out with — and the bank has nothing that could be one. Measured, '
    + 'not assumed: the `claw` role is declared in the bank and occurs ZERO TIMES in '
    + 'all 94 records, alongside `wing` and `horn`, and there is no finger, digit, '
    + 'hand or arm shape either — `box-01` is the pack\'s one leg, a 0.375 stub used '
    + '86 times, and it is never resized. The nearest proportion in the whole bank is '
    + '`cone-01`, the bee\'s antenna, 0.160 x 0.400 with taper 0.000, which is about '
    + 'three times too thick and has no hand to grow out of. WHAT IT WOULD NEED: one '
    + 'bespoke thin tapering rod, roughly 0.06 across and 0.35-0.45 long, plus '
    + 'somewhere to mount it, since this kit has a fixed four-leg row and no forelimb '
    + 'to hang a hand off. Everything else about the animal IS here and is honest — '
    + 'the biggest ears in the bank at 0.743 across, the bank\'s one true plume of a '
    + 'tail, the beaver\'s rodent incisors under a gnawing muzzle, an orange eye and a '
    + 'coat dark to the lowest quarter. NOTE ALSO the palette is new and UNREVIEWED: '
    + 'Night Time has never had colours signed off for any of its species.',
})
