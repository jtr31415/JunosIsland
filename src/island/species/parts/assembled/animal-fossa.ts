/**
 * The fossa — Madagascar's own carnivore, and the plainest animal in this
 * collection on purpose.
 *
 * It walks into the most crowded ground in the project. `animal-mongoose`,
 * `animal-civet`, `animal-meerkat`, `animal-ferret`, `animal-pine-marten`,
 * `animal-stoat`, `animal-mink` and `animal-kinkajou` are all built, all
 * roughly cat-sized, all long-bodied, and several are on this same cube. A fossa
 * looks like every one of them.
 *
 * **So the separation is SUBTRACTION, which `animal-emu.ts` calls the sharpest
 * separator this bank has, and here it is true rather than convenient.** A fossa
 * is the one carnivore in that list with no marking of any kind: no mask, no
 * blotches, no rings, no dark tail tip, no belly line, no stripe. It is uniform
 * russet from nose to tail, above and below, and every one of its neighbours has
 * spent something on a marking:
 *
 *   - `animal-civet` has ten `plate-10` blotches and a dark-tipped `wedge-18`;
 *   - `animal-mongoose` has a `box-23` brush and a banded ear;
 *   - `animal-stoat` has the black tail tip and a belly line at 10/16;
 *   - `animal-pine-marten` has a bib.
 *
 * **THE TAIL IS `wedge-07` AND IT IS CHOSEN FOR ITS SINGLE BAND.**
 * `animal-civet.ts` measured the two thin ropes carefully: `wedge-07` and
 * `wedge-18` are identical to six decimals in every dimension and differ only in
 * mesh and in BANDING — `wedge-18` arrives pre-split with band 3 covering the
 * third furthest from the join, which is why the civet, the stoat and the ocelot
 * all take it for a dark tip. This animal wants the opposite: a rope with
 * nothing on it, and `wedge-07`'s one band 13 is exactly that. The civet's
 * finding, used the other way round.
 *
 * At **1.0466 of reach it is as long as the body**, which is the one proportion
 * a fossa is actually known for, and it goes on by the donor transfer alone.
 *
 * **`box-27` is the ear, and this is its first use anywhere.** It is the koala's
 * inner ear at 0.233 x 0.281 x 0.244 — small, round and blunt — and its recorded
 * attachment is `z +1` sunk 0.933187, which is a part designed to be almost
 * entirely buried in a face. Overridden to `y +1` and sunk 0.45 it is a small
 * round ear set high on the skull, which is a fossa's. §3.1 in one part: the
 * identity is the placement.
 *
 * The wheelbase goes to 5/16, which is `animal-civet.ts`'s own number and its
 * own reasoning — the hull is never scaled and `pets.ts` charges keep-out from
 * `max(width, depth) / 2`, so length is expressed by the legs. The stance is
 * NARROW at 0.24 where the civet's is the builder's default, because a fossa is
 * a slender animal that runs along branches.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s crown — the cube's own 1.43125. */
const CROWN_Y = 1.43125

export const FOSSA_ASSEMBLY = defineCreature('animal-fossa', {
  palette: {
    coat: 0xa5713f,    // UNREVIEWED: uniform russet, the first ever proposed for this species
    pale: 0xead9c2,    // UNREVIEWED: the sclera. There is NO pale underside on this animal
    muzzle: 0x8d6238,  // UNREVIEWED: the short muzzle, barely under the coat
    mark: 0x2b201a,    // UNREVIEWED: the nose pad, and the only dark thing on it
    limb: 0x93643a,    // UNREVIEWED: the legs, a shade under the coat
    eye: 0xc79a3a,     // UNREVIEWED: amber, wide and forward — a fossa's eyes are its face
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  /* NO BELLY LINE, and that is the design rather than an omission. A fossa is
   * one colour all the way round; painting the mammal line on it would be
   * inventing a marking to make it look like the eight animals it must not. */
  under: 'pale',

  /* Long and NARROW. 5/16 is animal-civet.ts's own solve — each leg's outer face
   * lands on 0.500, a full chamfer inside the hull's 0.625, and it costs no
   * keep-out because the legs stay inside the body's own box. The 0.24 across is
   * this animal's: a fossa is slender where a civet is not. */
  legs: { x: 0.24, z: 0.3125 },

  eyes: { paint: 'eye' },

  /* THE KOALA'S INNER EAR, first used here. Its own attachment is `z +1` sunk
   * 0.933 — a part meant to be buried in a face — overridden to `y +1` and sunk
   * 0.45 on the crown, where it is a small round high-set ear. */
  ears: { part: 'box-27', paint: 'coat', axis: 'y', dir: 1, sink: 0.45, at: [0.28, CROWN_Y, 0.12] },

  /* The beaver's nose-tip as a short muzzle — the smallest in the bank at 0.312
   * x 0.193, on the donor transfer, which recovers the beaver's own z = 0.710803
   * because both animals are on a 1.250 cube. */
  snout: { part: 'tube-01', paint: 'muzzle' },

  /* The cat's own nose-tip on the muzzle's placed front plane. */
  nose: { part: 'box-10', paint: 'mark', on: 'snout' },

  /* THE ROPE WITH NOTHING ON IT. See the header: wedge-07 and wedge-18 are the
   * same shape and differ only in banding, and this animal is the first to pick
   * the one WITHOUT a second band. Donor transfer alone, 1.0466 of reach. */
  tail: { part: 'wedge-07', paint: 'coat' },

  flag: 'THIS ANIMAL IS SEPARATED BY SUBTRACTION AND THAT IS THE THING TO JUDGE. Eight built '
    + 'carnivores are its neighbours — mongoose, civet, meerkat, ferret, pine marten, stoat, '
    + 'mink, kinkajou — most of them cat-sized, long-bodied and several on this same cube, and '
    + 'EVERY ONE of them has spent something on a marking: the civet has ten blotch cards and a '
    + 'dark tail tip, the mongoose a fox brush and a banded ear, the stoat a black tip and a '
    + '10/16 belly line, the pine marten a bib. A fossa has none of those, in life, and this '
    + 'file refuses to invent one. There is no belly line at all. IF IT READS AS A BLANK ANIMAL '
    + 'RATHER THAN AS A PLAIN ONE, that is the failure to look for, and the cheapest fix is a '
    + 'belly line at 8/16 — which would be a lie, so it is yours to take rather than ours. THE '
    + 'TAIL IS wedge-07 AND IT IS CHOSEN FOR ITS SINGLE BAND: animal-civet.ts measured that '
    + 'wedge-07 and wedge-18 are identical to six decimals and differ only in banding, and that '
    + 'wedge-18 arrives pre-split for a dark tip. Three species take the split one; this is the '
    + 'first to want the unsplit one, and at 1.0466 of reach it is as long as the body, which is '
    + 'the one proportion a fossa is known for. THE EAR IS box-27 AND THIS IS ITS FIRST USE '
    + 'ANYWHERE — the koala\'s inner ear, recorded as `z +1` sunk 0.933187 because it was drawn '
    + 'to be buried in a face, overridden to `y +1` and sunk 0.45 on the crown, where it is a '
    + 'small round high-set ear. §3.1 in one part. NOTHING IS STRETCHED. NEW PALETTE, '
    + 'UNREVIEWED.',
})
