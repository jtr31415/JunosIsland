/**
 * The skunk — and the mammal belly line RUN BACKWARDS, which is the one new
 * thing on this animal.
 *
 * Every other species in the project sets `belly` to paint a PALE underside
 * under a dark coat. A skunk is the opposite animal: dark below, white above.
 * `Paint.patch` does not care which way round the two slots are, so `coat` is
 * the white and `under` is the black and the same 8/16 line does the work
 * upside down. No second shape, no split triangle, no geometry at all — and it
 * is the first time this mechanism has been asked to invert.
 *
 * That gets the halves right and it does NOT get the two dorsal stripes: a
 * stripe is a boundary that runs front-to-back and `patch` takes one number and
 * that number is a height. `animal-badger.ts` established the flag for this and
 * `animal-ferret.ts` and `animal-civet.ts` carry it too; this is the fourth.
 *
 * The white blaze down the muzzle IS sayable, and it is Kenney's own cut:
 * `tube-06` is the only two-band muzzle in the bank, and painting its upper
 * band white on a black muzzle is the front end of the stripe for one entry.
 *
 * The tail is `box-23`, the fox's brush, carried UP the rear chamfer — the
 * squirrel's placement, on the one other animal whose tail is its whole
 * silhouette — and painted white entire.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const SKUNK_ASSEMBLY = defineCreature('animal-skunk', {
  palette: {
    coat: 0xf4f1e8,
    dark: 0x1c1a1d,
    sclera: 0xe8dcc6,
    limb: 0x1c1a1d,
    pupil: PACK_PUPIL,
  },

  /* `coat` is the WHITE here and `dark` is the underside, which is the whole
   * trick: the pale slot is normally the belly and on this animal it is the
   * back. `under` has to be named because there is no `belly` slot to default
   * to, and naming it is what makes the inversion explicit rather than lucky. */
  under: 'dark',

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. Run
   * backwards: white above it, black below. */
  belly: 0.5,

  /* The sclera cannot take `under` here, because `under` is now the black.
   * `animal-ferret.ts` measured what a dark sclera does — PACK_PUPIL (0x4c4f5e)
   * is lighter than any near-black, so the pupil reads as a catch-light and the
   * eye inverts. One named slot avoids it. */
  eyes: { paint: 'sclera' },

  /* The chick's, monkey's and penguin's ear: small, plain, and dark against a
   * white crown. */
  ears: { part: 'wedge-04', paint: 'dark' },

  /* THE BLAZE. `tube-06` is the ONLY muzzle in the bank Kenney split — band 3 is
   * its lower 20 triangles and band 7 its upper 14 — so a white stripe over a
   * black muzzle is one entry and no geometry. It is the front end of the
   * marking, and as far back as the marking gets. */
  snout: { part: 'tube-06', paint: { base: 'dark', byBand: { 7: 'coat' } } },

  /* The dog's own nose, on the muzzle's placed front plane. */
  nose: { part: 'box-15', paint: 'dark' },

  /* THE PLUME, carried UP. `chamfer: true` solves the rear-top chamfer's
   * midpoint AND the 45-degree turn onto its own normal together; giving one by
   * hand and not the other is how a tail floats. Same placement as
   * `animal-squirrel.ts` and for the same reason — this is the other animal
   * whose tail is the whole of its silhouette — and painted white entire. */
  tail: { part: 'box-23', paint: 'coat', chamfer: true },

  flag: 'THE MAMMAL BELLY LINE IS RUN BACKWARDS HERE AND THAT IS THE THING TO LOOK AT. Every '
    + 'other species paints a PALE underside under a dark coat; a skunk is dark below and white '
    + 'above, so `coat` is the white, `under` is the black, and the same 8/16 line — the only '
    + '1/16 point inside the pack\'s measured 0.4808-0.5481 mammal zone — does the work upside '
    + 'down for no geometry. First time the mechanism has been asked to invert, and if the '
    + 'proportion is wrong it is one number. THE TWO DORSAL STRIPES ARE NOT HERE AND CANNOT BE: '
    + 'a stripe runs front-to-back and `Paint.patch` takes one number and that number is a '
    + 'HEIGHT, `byBand` can only cut where Kenney already cut and box-03 has one band, and rule '
    + '3 is one mass so there is no back to paint on its own. This is animal-badger.ts\'s flag '
    + 'on a FOURTH animal (badger, ferret, civet, skunk) and it is worth your eye as a pattern '
    + 'rather than as one species — every marked mammal we build hits it. WHAT IS HERE INSTEAD '
    + 'is the white half, a WHITE BLAZE down the muzzle from Kenney\'s own upper band on '
    + 'tube-06 (the one two-band muzzle in the bank), and the white PLUME. The tail is box-23, '
    + 'the fox\'s brush, carried up the rear chamfer with `chamfer: true` — the squirrel\'s own '
    + 'placement, spent here because this is the other animal whose tail IS its silhouette, and '
    + 'painted white entire. It makes this the tallest animal in the collection at about 1.98. '
    + 'NEW PALETTE, UNREVIEWED. Nothing is stretched and nothing is authored.',
})
