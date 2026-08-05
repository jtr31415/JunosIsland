/**
 * The snow leopard — the seventh cat in the project, and the first on a TALL
 * shell.
 *
 * Six cats are already built and two of them are FROZEN. `animal-lion` and
 * `animal-tiger` cannot be edited; `animal-cheetah`, `animal-lynx` and
 * `animal-wildcat` sit on the plain 1.250 cube; `animal-jaguar` took `box-12`,
 * the widest, for a short broad heavy cat. **That leaves the one direction no cat
 * has gone: UP.** `box-21` is the fox's shell, 1.505075 tall against the cube's
 * 1.250, and only `animal-gibbon` wears it. A snow leopard is the
 * high-shouldered, deep-chested one — it lives on cliffs — so the shell is the
 * first separation and it is a real shape rather than a number anyone tuned.
 *
 * The other three are measured, not felt:
 *
 *   - **The belly line runs at 9/16, not 8/16.** Every other cat here paints the
 *     tiger's own mammal line at 0.5. A snow leopard's white runs high up the
 *     flank, and 9/16 is the next point on the pack's own grid above it.
 *   - **`box-05`, the SMALLEST ear in the bank** (0.221 x 0.232), painted dark
 *     rather than coat — a snow leopard's ears are small, round and black-backed,
 *     which is the opposite end of the ear bank from `animal-lynx`'s tufts.
 *   - **The rosettes go on the BACK as well as the flank.** `animal-civet.ts`
 *     found the reason and it is worth repeating: the island's camera looks DOWN,
 *     and a flank card is edge-on from up there. Four pairs on the flank and two
 *     singles turned onto the spine.
 *
 * The tail is `box-23`, the fox's brush and the thickest in the bank — which
 * `animal-jaguar` also wears. It is hand-placed HIGH at y = 1.05 rather than
 * taken by donor transfer, and that is the difference: the transfer recovers the
 * bank's own -0.918642 at the fox's y = 0.86875, which is where the mongoose and
 * the jaguar carry theirs. A snow leopard carries its tail off the top of the
 * rump.
 *
 * ## `fur` EXISTS BECAUSE A BELLY LINE ABOVE 8/16 REPAINTS EVERYTHING ELSE IN
 * ## ITS SLOT, AND THIS IS THE SECOND ANIMAL EVER TO HIT IT
 *
 * `animal-stoat.ts` found this and its finding is general: **a `patch` is a
 * property of the SLOT, not of the part that declared it**, so `belly` splits
 * the CELL the hull is painted from — here `coat` — and every other part painted
 * from that slot reads the split too, at the cell's own centre.
 *
 * The centre is row 8/16. A split BELOW it leaves that centre in the coat half
 * and nothing happens, which is why every species at `belly: 0.5` or `0.4375` is
 * untouched. **A split ABOVE it puts the centre in the PALE half and quietly
 * repaints every part sharing the slot.** The stoat is at 10/16 and this animal
 * is at 9/16, and those are the only two above the line in the whole project —
 * so the tail here rendered white, which no line of this file asked for, and
 * `tests/tools/editor-own-colour.test.ts` is what caught it, by sampling the
 * real atlas at each mesh's own baked UV rather than trusting the definition.
 *
 * The fix is the stoat's: the tail takes a slot of its own, seeded with the
 * coat's own grey. The belly stays at 9/16 where the header argues it belongs,
 * and the hull is the only thing reading it. The ears, the nose and the ten
 * rosettes are all `mark` and were never affected.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s own crown: offset 0.933788 plus half of 1.505075. */
const CROWN_Y = 1.686326

/** The pack's own flat-card shell — `box-21`'s side 0.625 plus the 0.010 of
 * daylight `plate-10`'s and `plate-11`'s recorded x already contains. */
const CARD_X = 0.635

/** The same shell on the other axis: 0.010 above the crown. */
const BACK_Y = CROWN_Y + 0.01

/** Four flank stations, well inside `box-21`'s flat flank plate. */
const ROSETTE: readonly [number, number][] = [
  [1.15, 0.22], [1.15, -0.22], [0.72, 0.22], [0.72, -0.22],
]

export const SNOW_LEOPARD_ASSEMBLY = defineCreature('animal-snow-leopard', {
  palette: {
    coat: 0xb9bcc0,    // UNREVIEWED: smoke grey, the first ever proposed for this species
    belly: 0xf4f6f7,   // UNREVIEWED: the white underside, and the sclera
    /* The coat's own smoke grey, under a second name. It exists so the TAIL can
     * be that colour at all — see the header's last section. */
    fur: 0xb9bcc0,
    mark: 0x2c2b2c,    // UNREVIEWED: the rosettes, the ear backs and the nose
    limb: 0xa2a6ac,    // UNREVIEWED: the legs, a shade under the coat
    eye: 0x9fb46a,     // UNREVIEWED: pale green, which is this cat's own and no other's
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE TALL SHELL. 1.505075 against every other cat's 1.250, and the only one
   * of the pack's ten that is taller without being bigger everywhere. */
  hull: { part: 'box-21' },

  /* 9/16, where every other cat here is at 8/16. A snow leopard's white climbs
   * the flank; the tiger's line is the mammal norm and this is one grid step
   * above it. */
  belly: 0.5625,

  /* Wide and short: the paws are the animal's other famous feature and a wide
   * stance is the only way this mechanism can say so. */
  legs: { x: 0.34, z: 0.28 },

  eyes: { paint: 'eye' },

  /* THE SMALLEST EAR IN THE BANK, hand-placed on the crown and bedded in.
   * `box-05`'s own recorded z is 0.572516, which is off the front of a 1.250
   * crown's flat plate, so the transfer is refused here for the reason
   * `animal-bear.ts` refused the panda's. */
  ears: { part: 'box-05', paint: 'mark', sink: 0.35, at: [0.28, CROWN_Y, 0.15] },

  /* The polar bear's nose — 0.400 across, the broadest true nose-tip in the
   * bank, which is what a snow leopard's big pad is. No muzzle: the cats in this
   * project wear none and a snow leopard's face is famously flat. */
  nose: { part: 'box-40', paint: 'mark' },

  /* THE BRUSH, CARRIED HIGH. Same shape as animal-jaguar's; the placement is the
   * separation, which is §3.1 taken seriously. */
  tail: { part: 'box-23', paint: 'fur', at: [0, 1.05, -0.625] },

  extras: [
    ...ROSETTE.map(([y, z], i) => ({
      name: `rosette-${i}`,
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'mark',
      at: [CARD_X, y, z] as [number, number, number],
    })),
    /* ON THE SPINE, where the island's camera can actually see them. The card is
     * turned onto the top face — `{ z, 90 }` takes an `x +1` part to `y +1` —
     * and is `single` because a spine is on the midline. */
    { name: 'spine-fore', part: 'plate-11', paint: 'mark', kind: 'single' as const,
      spin: [{ axis: 'z' as const, deg: 90 }], at: [0, BACK_Y, 0.22] },
    { name: 'spine-aft', part: 'plate-11', paint: 'mark', kind: 'single' as const,
      spin: [{ axis: 'z' as const, deg: 90 }], at: [0, BACK_Y, -0.22] },
  ],

  flag: 'THE ROSETTES ARE FLAT CARDS AND A SNOW LEOPARD\'S ARE OPEN RINGS. That is '
    + 'animal-jaguar.ts\'s finding on a second cat and the cause is the same: colour is a '
    + 'texture LOOKUP with no positional information, Paint.patch takes one HEIGHT, and byBand '
    + 'cuts only where Kenney already cut — so a ring cannot be said and ten plate-11 at their '
    + 'own size are the honest approximation. WHAT IS NEW HERE IS WHERE THEY SIT: four pairs on '
    + 'the flank and TWO ON THE SPINE, turned onto the top face, because the island\'s camera '
    + 'looks down and a flank card is edge-on from up there (animal-civet.ts). THE SHELL IS THE '
    + 'SEPARATION THAT DOES THE WORK: box-21 at 1.505075 tall is the only one of the pack\'s ten '
    + 'that is taller without being bigger everywhere, and no cat in the project is on it — the '
    + 'cheetah, lynx and wildcat are on the 1.250 cube and the jaguar took the widest. THE TAIL '
    + 'IS THE JAGUAR\'S OWN SHAPE, box-23, AND THE PLACEMENT IS THE DIFFERENCE: the donor '
    + 'transfer recovers the bank\'s own -0.918642 at y = 0.86875, which is where the fox, the '
    + 'mongoose and the jaguar carry it; this one is hand-placed at y = 1.05, off the top of the '
    + 'rump, which is how a snow leopard carries its. THE BELLY IS 9/16 and every other cat here '
    + 'is 8/16 — WHICH COST THIS ANIMAL A PALETTE SLOT. A patch is a property of the SLOT and '
    + 'not of the part that declared it, so a split ABOVE row 8/16 quietly repaints everything '
    + 'else painted from `coat`; animal-stoat.ts found that at 10/16 and this is the second '
    + 'animal ever to hit it. The tail rendered WHITE until it was given a `fur` slot of its '
    + 'own, seeded with the coat\'s grey. NOTHING IS STRETCHED. NEW PALETTE, UNREVIEWED — and the PALE GREEN EYE is the '
    + 'one to look at, because it is this cat\'s own and no other animal in the project has it.',
})
