/**
 * The bat — and the wing is a STAND-IN, so read this before the numbers.
 *
 * `blade-06`/`blade-07` carry `bee:wing-left` AND `penguin:wing-left` as their
 * provenance and the two donors are bit-identical, so the one shape is the pack's
 * insect membrane and the pack's bird flipper at once (§14, and
 * `collections/critters.ts` measured it). **A bat's wing is neither.** It is a
 * hand — four fingers holding a skin — and nothing in the bank has fingers. What
 * is here is the nearest honest thing: one membrane on one spar, which is
 * `animal-pterodactyl.ts`'s reading of the same shape and the only other
 * membrane-winged animal in the project.
 *
 * **The measurement, so the compromise is checkable.** `blade-06` is 0.693 x
 * 0.200 x 0.600 attaching `y +1` at a recorded burial of 0.412890. Declared
 * `axis: 'x', dir: 1` it runs along its 0.693 rather than its 0.200 — 3.5x
 * further, `PartDef.axis`'s sanctioned override — and at `WING_STRETCH` 1.5 it
 * spans 1.0395 a side, standing 0.6103 clear of `box-31`'s 0.625 flank. The
 * animal is **2.4706 across, keep-out 1.2353**, against the fox's 1.15 and
 * Woodland's ceiling of 1.6, and narrower than the pterodactyl's 1.3574 on
 * purpose: a pterosaur is the biggest flying thing in the album and a bat is not.
 *
 * **WHAT TO TRY FIRST.** `WING_STRETCH` is the dial and every 0.1 of it is 0.069
 * more span a side. If the blade reads too round-tipped for a bat, the swap is
 * `wedge-19`/`wedge-20` — the chick's and parrot's wing, 0.573 x 0.200 x 0.600,
 * which attaches `x +1` natively at a sink of 0.175 and needs no axis override at
 * all. It is a FEATHERED wing and this one is not, which is why it was not taken
 * first; on a silhouette at tablet distance that may be the wrong way round.
 *
 * The ears are the other half of the animal and they are not a compromise:
 * `box-06`/`box-07`, the bunny's, 0.913298 tall and the biggest in the pack.
 * `animal-fennec-fox` wears them in this same collection, which is the roster §4
 * pair to watch — and the separation is everything else, since a fennec is a fox
 * on the cube with a brush tail and cream ears and this is a wing animal on the
 * lion's shallow shell with no tail at all.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s own flank, centre and crown — the lion's shell, 1.250 x 1.250 x 1.125. */
const HULL_SIDE_X = 0.625
const HULL_MID_Y = 0.80625
const HULL_MID_Z = -0.0625

/**
 * 1.5 on `blade-06`'s 0.693 of span, giving 1.0395 a side.
 *
 * At its own recorded 0.412890 burial that leaves 0.6103 standing clear, so the
 * animal measures 2.4706 across a 1.250 body and its keep-out is 1.2353. Width is
 * the binding dimension here, as it is on the pterodactyl and on Ocean's ray.
 */
const WING_STRETCH = 1.5

/**
 * The ears are sunk 0.45 rather than the bunny's own 0.366259, and the reason is
 * the ceiling and nothing else.
 *
 * At the donor's own burial `box-06` tops out at 2.0100 on any hull whose crown is
 * 1.43125 — 0.0100 under `PACK_HEIGHT_MAX`, which is where the donkey and the mule
 * already sit. 0.45 buries 0.410984 of the 0.913298 and brings the crown to
 * 1.9336, which is a margin rather than a coincidence. A bat's ear is set deep
 * into the head in life, so the deeper burial costs the animal nothing.
 */
const EAR_SINK = 0.45

export const BAT_ASSEMBLY = defineCreature('animal-bat', {
  /* NEW AND UNREVIEWED — nothing has ever carried a record for this species, so
   * these are the first colours ever proposed for it. Brief §19 is "bright, never
   * scary", so this is a warm brown pipistrelle rather than a black one, and the
   * membrane is a shade under the coat instead of the usual black. */
  palette: {
    coat: 0x7a5a3e,    // UNREVIEWED: a warm mid-brown, the fur
    belly: 0xd8c3a2,   // UNREVIEWED: the paler underside, and the sclera
    wing: 0x5c4433,    // UNREVIEWED: THE MEMBRANE — one tone under the coat, never black
    ear: 0x4a382c,     // UNREVIEWED: the two big ears
    limb: 0xc09a86,    // UNREVIEWED: bare skin — the feet, the muzzle and the nose-leaf
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE LION'S SHELL, 1.250 x 1.250 x 1.125 — the shallowest in the bank. A bat's
   * body is small and short-backed, and at 50 triangles it is also the cheapest,
   * which is what pays for 184 triangles of wing. Its front face is 0.500 and the
   * eye card is still at the absolute 0.6350, so the cards float 0.135 proud
   * exactly as the lion's own do; see `EYE_CARD_Z`. */
  hull: 'box-31',

  /* 8/16 — the tiger's own mammal line made exact, and this shell's own equator.
   * It splits the `coat` cell and nothing but the hull paints from `coat`. */
  belly: 0.5,

  /* THE EARS. The bunny's, the biggest in the pack, sunk 0.45 for the ceiling —
   * see EAR_SINK. One band across all 60 triangles, so there is no inner ear to
   * paint and the whole shell takes one slot. */
  ears: { part: 'box-06', paint: 'ear', sink: EAR_SINK },

  /* The caterpillar's card, the smallest in the pack. A bat's eyes are two small
   * dark beads in a lot of fur, and rule 5 makes the size absolute. */
  eyes: { part: 'plate-06', x: 0.22, y: 1.0 },

  /* THE MUZZLE. The hog's nose-tip, 0.400 x 0.400 x 0.200, worn as a blunt face
   * at its own recorded zero burial. A bat's snout is short and square-ended,
   * which is what this shape is. */
  snout: { part: 'box-24', paint: 'limb' },

  /* THE NOSE-LEAF, and it is the one join on this animal that is exact rather
   * than argued: `blade-04`, the lion's flat round nose plate, is 0.400 x 0.400
   * and `box-24`'s front face is 0.400 x 0.400, so the leaf is backed everywhere
   * by the muzzle it stands on. `on: 'snout'` anchors it to that placed face off
   * the built vertices rather than to arithmetic this file would carry a stale
   * copy of. At the lion's own zero burial, so all 0.100 of it stands proud. */
  nose: { part: 'blade-04', paint: 'limb' },

  /* NO LEG ROW — see the pair below. */
  legs: false,

  extras: [
    /* TWO FEET, at the rear, on the row that never moves. A bat's hind legs are
     * tiny and are behind it; four under the middle would be a mouse's. The pair
     * is `animal-pterodactyl.ts`'s station moved back to z = -0.25. */
    { name: 'foot', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, -0.25] },

    /* THE WINGS. See the header for what they are standing in for. Re-axised to
     * run along the long extent, mirrored, at the shape's own recorded 0.412890
     * burial, centred on this shell's own z. They flap without being asked:
     * `withDefaultFlap` in `creature.ts` triggers on the bank ROLE, and `wing` is
     * what the bank calls this shape. */
    {
      name: 'wing',
      part: 'blade-06',
      paint: 'wing',
      kind: 'pair',
      axis: 'x',
      dir: 1,
      stretch: [WING_STRETCH, 1, 1],
      at: [HULL_SIDE_X, HULL_MID_Y + 0.25, HULL_MID_Z],
    },
  ],

  flag: 'THE WING IS A STAND-IN AND THIS IS THE ANIMAL IT MATTERS MOST ON. blade-06 carries '
    + 'bee:wing-left AND penguin:wing-left and the two donors are bit-identical, so one shape '
    + 'is the pack\'s insect membrane and the pack\'s bird flipper at once. A BAT\'S WING IS '
    + 'NEITHER: it is a hand, four long fingers holding a skin, and nothing in 100 baked '
    + 'records has fingers. What is here is one membrane on one spar, which is what '
    + 'animal-pterodactyl.ts made of the same shape and the only other membrane-winged animal '
    + 'in the project. MEASURED so you can check the trade: 0.693 x 0.200 x 0.600 attaching '
    + 'y +1 at a recorded burial of 0.412890, declared axis x dir 1 so it runs along its 0.693 '
    + 'instead of its 0.200 — PartDef.axis\'s sanctioned override — and at WING_STRETCH 1.5 it '
    + 'spans 1.0395 a side and stands 0.6103 clear of a 0.625 flank. 2.4706 across, KEEP-OUT '
    + '1.2353 against the fox\'s 1.15 and Woodland\'s ceiling of 1.6, deliberately under the '
    + 'pterodactyl\'s 1.3574. TRY FIRST: WING_STRETCH is the dial, 0.1 of it is 0.069 more '
    + 'span a side. If the blade reads too round for a bat, swap to wedge-19/wedge-20, the '
    + 'chick\'s and parrot\'s wing at 0.573 x 0.200 x 0.600, which attaches x +1 natively at a '
    + 'sink of 0.175 and needs no override — it is FEATHERED, which is why it was not taken '
    + 'first, and at tablet distance that may be the wrong way round. ALSO: THE EARS ARE THE '
    + 'FENNEC\'S. box-06 is the biggest ear in the bank and animal-fennec-fox wears it in this '
    + 'same collection; the separation is the shell, the wings and the missing tail, not the '
    + 'ear. ALSO: NO TAIL. A bat\'s tail is inside its uropatagium and there is no membrane '
    + 'between the legs to put one in, so it is left off rather than faked. ALSO: NEW PALETTE, '
    + 'UNREVIEWED, and warm brown rather than black on brief §19\'s "bright, never scary".',
})
