/**
 * The hyacinth macaw — the biggest parrot in the world, and the first bird in
 * this project whose tail is not a FAN.
 *
 * Five parrots are already built: the FROZEN `animal-parrot`, and Birds'
 * cockatoo, cockatiel, lovebird and budgie. Every one of them wears `cone-06`
 * for a bill and `box-38` — the parrot's own tail fan — or a spun copy of it for
 * a tail, because that is what the pack gave a parrot. A macaw is the one parrot
 * that cannot: **its tail is longer than its body and it is two straight
 * streamers, not a fan.**
 *
 * `wedge-15` is the lion's tail, and at **1.0824 of reach it is the longest
 * thing in the tail bank** — 1.19x `box-38`'s 0.912 and, more to the point, a
 * completely different silhouette: a long taper rather than a spread. No bird in
 * the project wears it. Taken by the donor transfer alone onto this cube's rear
 * face, it trails a full body-length behind the animal, which is what a macaw
 * looks like from the side and is the whole reason to build one.
 *
 * ## The bill is stretched, and it is stretched DEEP rather than long
 *
 * `animal-toucan.ts` stretches `cone-06` 3x along its reach and asks Joe to rule
 * on it, because a toucan's bill is about LENGTH. **A macaw's is about DEPTH** —
 * it is a short, immensely deep hook, and a hyacinth's is the largest bill of any
 * parrot. So this one is `[1.3, 1.5, 1.5]`: half again as tall, half again as
 * long, a third again as wide. §3 measured the pack's own snouts varying 2.90x
 * naturally, so all three numbers are well inside what Kenney himself drew, and
 * the toucan's 3x is the one that needs the ruling rather than this.
 *
 * **The HOOK itself is missing and cannot be had.**
 * `docs/how-the-animals-are-made.md` §14 names the hooked beak as the one shape
 * of its four headline gaps that is still clearly absent, and it is right: all
 * 100 baked shapes are straight or tapered along a single axis, and rule 4 as
 * amended bakes a ROTATION into a copy's vertices — it turns a part and cannot
 * bend one. This is the same wall the seahorse, the flamingo, the Dall ram and
 * the snail are behind, and it is a CURVE.
 *
 * ## The yellow is two cards and the ring is unsayable
 *
 * A hyacinth macaw is cobalt all over with two patches of bare yellow skin: a
 * ring round the eye and a crescent at the base of the lower mandible. The
 * crescent is a card. **The ring is not** — a ring is a boundary that closes on
 * itself, `Paint.patch` takes one height, `byBand` cuts only where Kenney cut,
 * and the eye card is 0.400 across where the biggest thing that could sit
 * outside it and still be a ring is smaller than the eye. So the ring is a patch
 * BESIDE the eye, and it says so.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The pack's absolute card plane — `EYE_CARD_Z`, and where the skin patches sit. */
const FACE_Z = 0.635

/**
 * DEEP, not long. `cone-06` is 0.400 x 0.401 x 0.287; this takes it to 0.520 x
 * 0.602 x 0.430, which at its own 0.360878 burial stands 0.275 proud and 0.602
 * tall. A macaw's bill is a short block, not a spear — that is the difference
 * from `animal-toucan.ts`'s 3x along the reach and it is why this one is not
 * asking to be ruled on.
 */
const BILL_STRETCH: [number, number, number] = [1.3, 1.5, 1.5]

export const HYACINTH_MACAW_ASSEMBLY = defineCreature('animal-hyacinth-macaw', {
  palette: {
    coat: 0x2f5fc4,    // UNREVIEWED: cobalt, and this bird is one colour all over
    belly: 0x2a55b0,   // UNREVIEWED: barely under the coat — a macaw has no pale front
    flight: 0x1f3f8c,  // UNREVIEWED: the folded wing and the tail, a shade deeper
    bill: 0x1b1a1e,    // UNREVIEWED: the great black bill
    skin: 0xefc326,    // UNREVIEWED: THE BARE YELLOW SKIN, and the only other colour on it
    limb: 0x54524e,    // UNREVIEWED: the scaled feet
    eye: 0x161418,     // UNREVIEWED: the dark iris
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fish's plain 1.250 cube. A macaw is a big bird but a hull is never
   * scaled, so the size is carried by the TAIL and the file does not pretend the
   * shell is doing it. */
  hull: { part: 'box-20' },

  /* The pack's round bird card, worn by every bird in the project. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE BILL. See BILL_STRETCH — deep rather than long, and the hook is the
   * missing shape named in the header. */
  snout: { part: 'cone-06', paint: 'bill', stretch: BILL_STRETCH },

  /* THE STREAMERS. The longest reach in the tail bank at 1.0824, on the donor
   * transfer alone, and no other bird here wears it. */
  tail: { part: 'wedge-15', paint: 'flight' },

  legs: false,
  extras: [
    /* Two legs on the pack's own row at box-01's own recorded x — the only
     * station a biped's legs can be at. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The nine-bird folded flank wing, on the donor transfer. It flaps without
     * being asked to: `withDefaultFlap` triggers on the bank's `wing` role. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' },

    /* THE BARE SKIN. Two patches, both the pig's own nostril card — the smallest
     * flat shape in the bank — stretched to a plausible size. The eye one sits
     * BESIDE the eye rather than round it; see the header. */
    {
      /* `lore` and not `eye-anything`: `assembly-assert.ts` gathers eye meshes
       * by NAME PREFIX, so a feature called `eye-skin` is checked against the
       * eye card's absolute size and fails rule 5 for a part that is not an eye
       * at all. Naming is load-bearing here. */
      name: 'lore',
      part: 'plate-16',
      paint: 'skin',
      kind: 'pair',
      stretch: [2.4, 1.6, 1],
      at: [0.2625, 0.735, FACE_Z],
    },
    {
      name: 'chin',
      part: 'plate-16',
      paint: 'skin',
      kind: 'pair',
      stretch: [1.8, 1.4, 1],
      at: [0.12, 0.60, FACE_Z],
    },
  ],

  flag: 'THE TAIL IS THE ANIMAL AND IT IS THE FIRST BIRD TAIL IN THIS PROJECT THAT IS NOT A FAN. '
    + 'Five parrots are built and every one wears box-38, the pack\'s own parrot fan, or a spun '
    + 'copy of it. A macaw cannot: its tail is longer than its body and it is two straight '
    + 'streamers. wedge-15, the lion\'s tail, is the LONGEST reach in the tail bank at 1.0824 — '
    + '1.19x the fan and a completely different silhouette — and it goes on by the donor '
    + 'transfer alone. No bird in the project has worn it. THE BILL IS STRETCHED [1.3, 1.5, 1.5] '
    + 'AND IT IS STRETCHED DEEP, WHICH IS THE POINT: animal-toucan.ts stretches the same shape '
    + '3x along its REACH and asks you to rule on that, because a toucan is about length. A '
    + 'macaw\'s bill is a short immensely deep hook, so the depth carries it and no number here '
    + 'goes past 1.5 — well inside the 2.90x §3 measured the pack\'s own snouts varying by. THE '
    + 'HOOK ITSELF IS MISSING AND IT IS A CURVE. docs §14 names the hooked beak as the one of '
    + 'its four headline gaps still clearly absent and it is right: all 100 baked shapes are '
    + 'straight or single-axis tapered, and rule 4 bakes a rotation into a copy — it turns a '
    + 'part, it cannot bend one. This is the same wall the seahorse, the flamingo, the Dall ram '
    + 'and the snail are behind. THE YELLOW EYE RING IS A PATCH BESIDE THE EYE: a ring is a '
    + 'boundary that closes on itself, Paint.patch takes one height, byBand cuts only where '
    + 'Kenney cut, and the eye card is 0.400 across — bigger than anything that could ring it. '
    + 'NEW PALETTE, UNREVIEWED, and it is two colours and no more, because a hyacinth macaw is '
    + 'cobalt and yellow and nothing else.',
})
