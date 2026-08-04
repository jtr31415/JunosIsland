/**
 * The duck — and the thing it has to stay clear of was planned for a year ago.
 *
 * `collections/farm.ts` built `animal-goose` deliberately big and long-necked
 * *"because `animal-duck` is rostered in Birds and is NOT built yet. A goose
 * that reads as a large duck today becomes a duplicate the day Birds ships."*
 * This is that day, and the room it left is spent: the goose stands 1.9560 on
 * `box-41`; this bird is `box-39`, the small shell the passerines share, and
 * stands under 1.60. Size is the separation, and it is the one the goose chose.
 *
 * **`tube-02` IS THE DUCK BILL, and it is the closest the bank comes.** 0.460
 * across by 0.252 by 0.200 — the broadest, flattest, bluntest nose of the 28,
 * and the only one that is a BAR rather than a point or a barrel. A real
 * spatulate bill is wider than it is deep and rounded at the tip, which this is
 * not; but it is the right family, and §5 forbids inventing the missing shape.
 *
 * Band 3 goes chestnut for the drake's breast — the forward-facing band
 * `animal-robin.ts` paints red — and the green head does not happen. Rule 3 is
 * one mass: there is no head to paint on its own, `Paint.patch` takes a height
 * with no z term, and a green boundary across the neck is the same thing the
 * badger's stripes and the civet's mask are. It is the drake's whole identity
 * and it is flagged as absent.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — see `animal-robin.ts`. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

/** 4/16, derived off `box-01`'s own bevel in `animal-chicken.ts` §5. */
const FOOT_AT = 0.25

export const DUCK_ASSEMBLY = defineCreature('animal-duck', {
  palette: {
    coat: 0x8c9098,
    breast: 0x8a5230,
    pale: 0xe6e2d6,
    flight: 0x5a6068,
    bill: 0xd8b03c,
    limb: 0xdc8a30,
    foot: 0xb46a1c,
    eye: 0x191512,
    pupil: PACK_PUPIL,
  },

  /* The forward band as the drake\'s chestnut breast, over the finely vermiculated
   * grey that a mallard\'s body actually is and that this mechanism can only give
   * as a flat mid-grey. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'breast' } } },

  /* Named, because there is no `belly` slot to default to — a mallard has no
   * pale underside worth painting, but the sclera still needs somewhere to come
   * from. */
  under: 'pale',

  eyes: { part: 'plate-08', paint: 'eye' },

  /* The bank\'s broadest, flattest, bluntest nose, and the only one that is a
   * BAR. See the header for what it is not. */
  snout: { part: 'tube-02', paint: 'bill' },

  /* The bank\'s only stub, at the rear plate\'s own centre. A duck\'s tail is
   * short and cocked and the drake\'s curl is a single feather nothing here can
   * express. */
  tail: {
    part: 'box-18',
    paint: 'flight',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
    },
  ],

  flag: 'THE GREEN HEAD IS NOT HERE AND IT IS THE WHOLE OF WHAT A CHILD DRAWS. Rule 3 is one '
    + 'mass — head and body are a single form and there is no seam at the neck on any of the 24 '
    + 'originals — so there is no head to paint on its own; Paint.patch takes a HEIGHT with no z '
    + 'term, so it cannot say "the front top is green"; and box-39\'s two bands are the pale '
    + 'front and the rest, with the front spent on the chestnut breast. This is '
    + 'animal-badger.ts\'s flag again, on the animal where it costs most, and it is the reason '
    + 'this drake reads as a grey duck with a brown chest. THE WHITE NECK RING fails for the '
    + 'same reason. If a mallard matters more than a duck, the honest alternative is to build '
    + 'the FEMALE — flat mottled brown, which this mechanism can carry completely — and that is '
    + 'a call rather than a fix. THE BILL IS tube-02 AND IT IS THE CLOSEST THE BANK COMES: 0.460 '
    + 'x 0.252 x 0.200, the broadest, flattest, bluntest of the 28 noses and the only one that '
    + 'is a BAR rather than a point or a barrel. A real spatulate bill is wider than it is deep '
    + 'and rounded at the tip; this is the right family and not the right shape, and §5 forbids '
    + 'inventing the missing one. THE SEPARATION FROM animal-goose IS SIZE AND IT WAS PLANNED '
    + 'FOR: farm.ts built that bird deliberately big and long-necked "because animal-duck is '
    + 'rostered in Birds and is NOT built yet". The goose is 1.9560 on box-41; this is box-39 '
    + 'and stands under 1.60. NEW PALETTE, UNREVIEWED.',
})
