/**
 * The bald eagle — a white head on a dark body, which nothing in this project
 * had been able to say until the belly patch was turned upside down.
 *
 * **THE WHITE HEAD IS `Paint.patch` INVERTED, and it is the collection's best
 * find.** `belly` paints everything BELOW a fraction of the hull's height from
 * the pale slot. Every animal before this one used it the obvious way round —
 * dark above, pale under. Put the WHITE in `coat` and the brown in `belly` and
 * set the line at 13/16, and the top three-sixteenths of the shell go white:
 * the head, and only the head. No card, no geometry, no second mass.
 *
 * `animal-owlet.ts` and `animal-vulture.ts` both record that a bald head cannot
 * be painted because the patch "takes a HEIGHT with no z term". That is true and
 * it is the wrong conclusion — a height with no z term is exactly a CAP, and a
 * cap is what this bird is. The vulture wanted a bare head and neck, which is a
 * different shape; this one wanted a white crown and got it for nothing.
 *
 * The tail is `coat` and therefore white as well, which is the bird's other
 * half. Everything else — hull, hook, talon, wing — is `animal-golden-eagle.ts`
 * unchanged, deliberately: these two are the same eagle in two palettes and the
 * separation is entirely colour.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.15345

export const BALD_EAGLE_ASSEMBLY = defineCreature('animal-bald-eagle', {
  palette: {
    coat: 0xf6f4ef,    // UNREVIEWED: the white head and tail — the TOP of the patch
    belly: 0x3b2c1c,   // UNREVIEWED: the dark brown body, under the 13/16 line
    /* The coat's own colour under a second name, and it exists because
     * `belly` splits the CELL of the slot the HULL is painted from — so a
     * part that also said `coat` was reading the wrong half of it. See
     * `animal-stoat.ts`'s header and the note in `collections/raptors.ts`. */
    fan: 0xf6f4ef,     // UNREVIEWED: the white tail — the coat's white, under its own name
    flight: 0x33261a,  // UNREVIEWED: the wings, darker again
    limb: 0xf0c22e,    // UNREVIEWED: the yellow foot
    bill: 0xf0c22e,    // UNREVIEWED: the same yellow — this bird's bill is its foot's colour
    hook: 0xd8ac21,    // UNREVIEWED: the tip, a shade deeper so the bend still reads
    eye: 0xd9c98a,     // UNREVIEWED: pale straw
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The same tall fox shell as the golden eagle. These two are one bird. */
  hull: { part: 'box-21' },
  /* 13/16, INVERTED — see the header. Three-sixteenths of white on top is a head. */
  belly: 0.8125,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },

  /* The same white as the head, from a slot of its own rather than from `coat`
   * — `coat` is the slot the patch splits, so a tail painted from it would read
   * whichever half of the cell it happened to sample. See the palette. */
  tail: { part: 'box-38', paint: 'fan' },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 55 }] },
    { name: 'talon', part: 'wedge-11', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' as const },
  ],

  flag: 'THE WHITE HEAD IS THE BELLY PATCH UPSIDE DOWN and it is worth a minute of your eye, '
    + 'because two other files in this repo say it cannot be done. Paint.patch paints below a '
    + 'height from the pale slot; put the WHITE in coat and the brown in belly and set the line '
    + 'at 13/16, and the top three-sixteenths of the shell — the head — goes white with no card '
    + 'and no geometry. animal-owlet.ts and animal-vulture.ts both concluded a bald head was '
    + 'unsayable because the patch has no z term. It has no z term, and a cap does not need '
    + 'one. THE LINE IS THE ONE DIAL: 13/16 is a head, 12/16 is a head and shoulders, 14/16 is '
    + 'a skullcap. It must stay on the pack\'s 1/16 grid or the builder throws. THIS BIRD IS '
    + 'animal-golden-eagle IN ANOTHER PALETTE, on purpose — same shell, same hook, same talon, '
    + 'same wing — so if you want them further apart, the lever is the tail, not the body. '
    + 'NEW PALETTE, UNREVIEWED.',
})
