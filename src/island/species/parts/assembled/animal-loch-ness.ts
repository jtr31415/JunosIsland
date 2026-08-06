/**
 * Loch Ness — humps and a long neck, which is the whole of what the photograph
 * everybody has seen actually shows.
 *
 * §14 lists "no long neck" among the shapes the pack does not have, and that
 * line is now three collections out of date. `animal-terrapin.ts:443` established
 * that `box-18` — the ELEPHANT'S TRUNK, the bank's only tail attaching `z +1` —
 * worn forwards is a turtle's neck, and `animal-goose.ts` §3 stood it on END,
 * overriding the recorded axis to `y +1` so it runs along its 0.623 of height
 * instead of its 0.425 of depth, stretched, leaned, and sunk deep enough that the
 * leaned root face stays inside the crown. This animal is that idiom and one
 * other, and it needed nothing new.
 *
 * **THE NUMBERS ARE RE-DERIVED, NOT COPIED.** The goose is on `box-41` with legs
 * and had to lean 60 degrees because the pack's height ceiling admitted nothing
 * else. This is on the cube and is LEGLESS, which is worth 0.18125 of headroom
 * on its own: `buildAssembly` grounds on the lowest point, so with no leg row
 * the hull's own bottom becomes the floor and everything above it drops by the
 * leg row's height. Spending that on the neck instead of on a lean:
 *
 *       stretch 1.6, lean 25 deg    the neck stands 0.62 clear, animal 1.83
 *
 * A lake monster's neck is HELD UP, not carried forward — that is the difference
 * between the silhouette everybody knows and a goose grazing — so the lean is as
 * little as the ceiling allows rather than as much as it forces.
 *
 * **THE HUMPS ARE THE KOALA'S EAR, AND THAT IS §3.1 AT ITS PUREST.** `box-25` is
 * 0.743 x 0.743 x 0.348, radial, and the pack sank it 0.53 of its own extent into
 * the koala's head. Three of them in one `ridge` row along the spine, each buried
 * 0.394, present as three low rounded mounds — which is the closest thing to a
 * DOME this bank contains and is why this species is not the fourth to ask for
 * one. A part filed as "koala ear" would never have been reached for; a part
 * filed by shape was.
 *
 * The row is placed BY HAND at `z = -0.15` rather than solved, because the neck
 * takes the crown's front and the humps have to sit behind it. `span: 0.28`
 * puts the three at z +0.13, -0.15 and -0.43, all inside the flat top's own
 * +/-0.3125, so every one of them is joined to flat geometry.
 *
 * **THE EYES ARE ON THE BODY AND THAT IS RULE 5, NOT A SHORTCUT.** `EYE_CARD_Z`
 * is 0.635 and `CreatureDef.eyes` has no `z` field; this animal's head is at
 * y 1.8 and z 0.6 to 0.9, so there is no placement at which a card lands on it.
 * `animal-goose.ts` §4 and `animal-terrapin.ts` shipped the same compromise and
 * Joe passed both. If the eye should follow the head, rule 5 has to change and
 * that is his call rather than this species'.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z. */
const CROWN_Y = 1.43125

/**
 * 3/16 forward of the midline — `animal-goose.ts`'s station, and the lowest at
 * which the whole leaned root face is still on the crown's flat square.
 */
const NECK_Z = 0.1875

/** `box-18`'s own 0.623 becomes 0.997, of which about 0.62 stands clear. */
const NECK_STRETCH = 1.6

/**
 * 25 degrees, and it is as LITTLE as the ceiling allows rather than as much as
 * it forces — which is the opposite of the goose, and it is the difference
 * between a lake monster and a goose grazing. Being legless pays for it.
 */
const NECK_LEAN = 25

/**
 * 6/16 — the goose's solve, and the rule generalises: a leaned root face rides
 * UP as it leans, so the burial has to keep up with it or the rear-top corner
 * stands proud of the crown it is joined to.
 */
const NECK_SINK = 0.375

/**
 * The hump row, placed by hand behind the neck. At `span: 0.28` the three sit at
 * z +0.13, -0.15 and -0.43, all inside the flat top's own +/-0.3125.
 */
const HUMP_Z = -0.15
const HUMP_SPAN = 0.28

export const LOCH_NESS_ASSEMBLY = defineCreature('animal-loch-ness', {
  palette: {
    coat: 0x4a5f52,    // UNREVIEWED: peat-water green, the colour of the loch
    belly: 0xbfc9ba,   // UNREVIEWED: a pale underside
    hump: 0x3a4d42,    // UNREVIEWED: the humps and the neck, a shade under
    eye: 0xe4d9a8,     // UNREVIEWED: pale, so it reads at all on a dark animal
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: 'box-03',
  belly: 0.4375,
  /* Legless, and it pays twice: the animal reads as being IN water, and
   * grounding on the hull's own bottom rather than on a leg row gives the neck
   * 0.18125 of headroom that would otherwise have to be bought with a lean. */
  legs: false,

  /* Rule 5 puts the card at an absolute z and this animal's head is 1.2 above
   * it — see the header. High on the front plate, at the neck's root. */
  eyes: { part: 'plate-08', paint: 'eye', x: 0.2625, y: 1.05 },

  /* THE NECK: the elephant's trunk stood on end, the goose's idiom with every
   * number re-derived for a legless animal on the cube. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'hump',
    axis: 'y',
    dir: 1,
    stretch: [0.9, NECK_STRETCH, 0.9],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, CROWN_Y, NECK_Z],
  },

  /* THE HEAD: the fox's muzzle on the neck's own built tip, which is
   * `animal-terrapin.ts`'s and `animal-goose.ts`'s substitution — a pure donor
   * transfer with no `at`, no `sink` and no `spin`. It is 0.532 wide against the
   * neck's 0.31, which is what makes it a head rather than a knot. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'hump' },

  /* THE HUMPS: three of the koala's ear along the spine, each buried 0.394 of
   * its own extent so it presents as a low rounded mound. The base spin turns
   * the shape's recorded `x +1` attachment onto `y +1` so the row stands up. */
  ridge: {
    part: 'box-25',
    paint: 'hump',
    name: 'hump',
    count: 3,
    rows: ['top'],
    spin: [{ axis: 'z', deg: 90 }],
    span: HUMP_SPAN,
    place: { top: [0, CROWN_Y, HUMP_Z] },
  },

  flag: '§14 SAYS THIS PACK HAS NO LONG NECK AND THAT LINE IS THREE COLLECTIONS OUT OF '
    + 'DATE. The neck is box-18, the ELEPHANT\'S TRUNK, stood on END — axis overridden to '
    + 'y so it runs along its 0.623 of height rather than its 0.425 of depth — which is '
    + 'animal-goose.ts\'s idiom and animal-terrapin.ts\'s substitution before it. EVERY '
    + 'NUMBER IS RE-DERIVED RATHER THAN COPIED, and the interesting one is the LEAN: the '
    + 'goose is forced to 60 degrees by the height ceiling, and this animal is LEGLESS, '
    + 'which is worth 0.18125 of headroom because buildAssembly grounds on the lowest '
    + 'point and there is no leg row under it. So the lean is 25 degrees — as little as '
    + 'the ceiling allows rather than as much as it forces — because a lake monster\'s '
    + 'neck is HELD UP and a goose\'s is carried forward, and that is the whole difference '
    + 'between the silhouette everybody knows and a bird grazing. THE HUMPS ARE THE '
    + 'KOALA\'S EAR: box-25, radial, 0.743 across, which the pack itself sank 0.53 of its '
    + 'own extent into the koala\'s head. Three in one ridge row buried 0.394 each present '
    + 'as low rounded mounds, and they are the closest thing to a DOME this bank holds — '
    + 'which is why this species is NOT the fourth to ask you to author one. The row is '
    + 'hand-placed at z -0.15 because the neck has the crown\'s front. THE EYES ARE ON THE '
    + 'BODY AND THAT IS RULE 5: EYE_CARD_Z is absolute, this head is 1.2 above it, and on '
    + 'a long-necked animal there is no placement at which a card lands on the head. '
    + 'animal-goose.ts and animal-terrapin.ts shipped the same compromise and you passed '
    + 'both; if the eye should follow the head, rule 5 has to change and that is yours. '
    + 'NEW PALETTE, UNREVIEWED.',
})
