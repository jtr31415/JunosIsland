/**
 * The bushbaby's assembly, as a definition. Night Time's second of three
 * big-eyed nocturnal primates, and the one whose character is its EARS.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## The readability problem this species shares, and its share of the answer
 *
 * A tarsier, a bushbaby and an aye-aye are three small nocturnal primates with
 * enormous eyes, big ears and a long tail. **Built from the same parts they are
 * one animal three times**, so the three are separated structurally — a
 * different eye card, a different ear and a different tail each — exactly as
 * `garden.ts` separates its four small brown rodents.
 *
 * This one's share is **tall thin ears on the SIDES of its head, a perfectly
 * round eye, a short muzzle and a full fan of a tail**. Read the three apart at
 * pet scale: the tarsier is all eyes with two small buttons on its crown and no
 * muzzle at all; this one has flaps twice as tall as they are wide standing off
 * the sides of its head; the aye-aye has two round dishes each 0.743 across, more
 * than half its own body width.
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
 *     transfer below lands where it would land on `box-03`. It is not stretched:
 *     `hulls.ts` is explicit that taking one of the pack's ten authored shells is
 *     rule 1's purest case.
 *
 *   - **THE EARS ARE `tube-04`, THE ELEPHANT'S TALL SIDE FLAP, AND NOTHING HAD
 *     SPENT IT.** 0.359219 wide, 0.618750 tall, 0.277301 deep — **1.72 times as
 *     tall as it is wide, and the only shape in the ear bank with that
 *     proportion.** Every other big ear in the bank is round: the koala's dish is
 *     0.743 x 0.743 and the bunny's upright is 0.482 x 0.913 but is a solid slab.
 *     A galago's ear is a thin membranous flap, taller than it is broad, carried
 *     off the side of the head and folded flat when it moves — and this is the
 *     one shape that says it.
 *
 *     It is also only the second SIDE-mounted ear in the bank. Its measured
 *     attachment is `x +1` (and `tube-05` is the same shape recorded `x -1`), so
 *     the donor transfer joins it at THIS hull's side face x = 0.625 and takes
 *     the two coordinates the join does not move from the bank's own record:
 *     y = 0.809375, z = 0.147998.
 *
 *   - **The ear is sunk to §3's own floor, 0.125, and that IS the one overridden
 *     number in the file.** The transfer is checked before it is overridden: at
 *     the elephant's own measured 0.126087 the centre lands on x = 0.759317, the
 *     bank's recorded offset to six decimals, which is the evidence (§8) that the
 *     transfer is legitimate at all. But that burial is only **0.045 units** —
 *     the shallowest of any ear in the pack, and the one measured counter-example
 *     to §3's "every eared species embeds its ear by at least 0.125". The
 *     elephant can afford it because its ear sits against a head that is most of
 *     its front; on a 1.250 cube it is a twelfth of the ear's own thickness and
 *     the per-mesh table calls it THIN. So `sink` is `0.125 / 0.359219`, which is
 *     §3's floor made exact and pulls the flap 0.080 further in. Both its y and z
 *     are still the elephant's own.
 *
 *   - **The inner ear is Kenney's own cut.** Band 13 is a seventeen-triangle
 *     patch on the flap's forward face (x -0.141 to 0.089, z 0.032 to 0.139), so
 *     one `byBand` entry gives a two-tone ear and no geometry — §4's first way.
 *     It is deliberately asymmetric, and rule 6 gets the left ear by mirroring
 *     the right, which is precisely `tube-05`, the bank's own left-hand record.
 *
 *   - **The eye card is `plate-08`, THE PACK'S ONE PERFECT CIRCLE** — 0.400 x
 *     0.400, the only card whose two axes are equal, against the default oval's
 *     0.400 x 0.320 and the panda's 0.435 x 0.443. A galago's eye is round and
 *     forward and enormous, and roundness is what the pack can actually say about
 *     it. Placed by pure transfer at the card's own recorded (0.2625, 0.89375) on
 *     the absolute z = 0.6350; `sink: 0`, no stretch, rule 5. The panda's bigger
 *     card was NOT taken here — the tarsier has the stronger claim on it, and
 *     leaving it there is half of what keeps these two animals apart.
 *
 *   - **The tail is `box-38`, THE PARROT'S FAN, and nothing had spent it.**
 *     0.625879 x 0.912191 x 0.642124, tapering to 0.839 of itself. §7 splits the
 *     seven tails on THICKNESS and this is one of the three THICK ones — and,
 *     measured by bounding volume, it sits squarely between its two siblings':
 *     **0.367, against the aye-aye's fox brush at 0.616 and the tarsier's rope at
 *     0.116.** Three times the rope and three fifths of the brush. Fuller than a
 *     tarsier's, and nothing like an aye-aye's plume.
 *
 *   - **The tail is a pure donor transfer and chooses nothing.** Its own `z -1`
 *     facing, its own 0.269738 burial, no spin, no stretch, and the parrot's own
 *     recorded y = 1.099846. That puts its top at 1.5559, 0.125 above the line of
 *     the back — a tail held out and slightly up, which is what a leaper going
 *     between two trunks does with a metre of tail. It is also the whole of this
 *     animal's height.
 *
 *   - **The snout is `tube-01`, the beaver's**, and the beaver is the pack's one
 *     rodent: a rounded barrel muzzle, taper 1.000. `snout: 'tube-01'` is the
 *     whole of it — the transfer joins it at the cube's front face z = 0.625 and
 *     takes y = 0.815078, the beaver's own, which transfers with certainty
 *     because `box-03`'s recorded offset IS the beaver's hull centre. A galago
 *     has a short blunt muzzle where a tarsier has none.
 *
 *   - **The nose is `tube-08`, THE PANDA'S, on the muzzle's own front plane.**
 *     Nothing had spent it. 0.233877 x 0.125898 x 0.108111 — broader than it is
 *     tall, which fits a 0.312 x 0.193 barrel muzzle with room at every edge, and
 *     it is the third different nose across these three primates. Anchored with
 *     `on: 'snout'` rather than by an arithmetic this file would otherwise carry
 *     a copy of: the builder puts it on the muzzle's placed front plane,
 *     z = 0.796603, so a nose that floats or buries cannot happen quietly.
 *     Deliberately not `wedge-10`, which is measurably the better nose tip and
 *     reads as a tongue — Joe ruled on that by name on the hedgehog.
 *
 *   - **The legs and the belly are the pack's own.** The legs are never mentioned,
 *     so they are four `box-01` sunk 0.408163 on the row at y = 0.18125 that never
 *     moves, at the default 0.27 x 0.25. The belly is PAINTED at 8/16 — §4's
 *     second way, the pack's own mammal line made exact, the only point on the
 *     1/16 grid inside the 0.4808-0.5481 zone Kenney's split-triangle boundary
 *     wanders across, and also this hull's own equator.
 *
 * ## Considered and refused
 *
 *   - **`box-25`, the koala's dish**, is the biggest ear in the bank and was the
 *     obvious reach. It is REFUSED here for two reasons that both bite: the mouse
 *     already wears it (`animal-mouse.ts` calls it "the biggest ears in the
 *     bank"), and the aye-aye needs it more — an aye-aye's ears are its headline
 *     and a bushbaby's are tall rather than broad. Taking it here would have made
 *     this animal a large mouse and left the aye-aye with nothing to be.
 *   - **`cone-02` / `cone-03`, the dog's and pig's floppy forward ear**, is
 *     unspent and the right size, and is refused because it is measurably FLOPPY:
 *     taper 0.223, mounted `y +1` and hanging forward. A galago's ears are erect
 *     and mobile; a drooping ear is a different animal.
 *   - **`box-23`, the fox's brush**, is the only truly round-sectioned tail in the
 *     bank and it goes to the aye-aye, whose tail is bigger than its own body.
 *     Two of these three animals wearing the same plume would have thrown away
 *     the separation the ears just bought.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * Night Time has never carried a collection record with colours in it, so these
 * five are the first ever proposed for this animal and every one is UNREVIEWED.
 * The `inner` slot does two jobs on purpose — naked ear skin and the iris — since
 * both are the same warm amber on a real galago, and it keeps the palette to the
 * five slots the Garden animals use.
 *
 * **No flag.** Nothing was strained: 560 triangles against the pack's 422-951,
 * 468 vertices against 405-1626 (body 340 against 236-1114), height 1.5559 inside
 * 1.43-2.02, keep-out 0.999 against the fox's 1.15, every part joined at a face
 * its donor joined its own to, one mass, no stretch anywhere on the animal, and
 * every sink the pack's own measured value but one.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * §3's own floor, 0.125, as a fraction of `tube-04`'s own 0.359219 thickness.
 *
 * The elephant's recorded 0.126087 buries only 0.045 units — the shallowest ear
 * burial in the pack — and it is checked first: at that value the centre recovers
 * the bank's recorded x = 0.759317 exactly, which is what makes the transfer
 * evidence rather than a guess. This then pushes the flap 0.080 further in.
 */
const EAR_SINK = 0.125 / 0.359219

export const BUSHBABY_ASSEMBLY = defineCreature('animal-bushbaby', {
  palette: {
    coat: 0x8e7f6c,    // UNREVIEWED: a soft grey-brown, a galago's back
    belly: 0xefe6d3,   // UNREVIEWED: the pale underside and the sclera
    inner: 0xd9924f,   // UNREVIEWED: naked ear skin, and the amber iris
    limb: 0x4e4238,    // UNREVIEWED: legs, the fan tail and the nose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The pack's ONE primate body. Its faces, chamfers and recorded offset are the
   * 1.250 cube's to the millimetre, so every transfer below is the cube's. */
  hull: 'box-33',

  /* The pack's own mammal belly line, made exact. One number, no geometry. */
  belly: 0.5,

  /* THE ANIMAL. The elephant's tall side flap — 1.72 times as tall as it is wide,
   * the only ear in the bank with that proportion, and unspent. Joined at this
   * hull's side face at the elephant's own y and z, and sunk to §3's own 0.125
   * floor rather than to the elephant's 0.045, which is the shallowest ear burial
   * in the pack. Band 13 is its own inner patch, two-tone for free. */
  ears: { part: 'tube-04', sink: EAR_SINK, paint: { base: 'coat', byBand: { 13: 'inner' } } },

  /* The pack's one perfectly round eye card — 0.400 x 0.400, the only one whose
   * two axes are equal — at its own recorded place. The panda's bigger card is
   * left for the tarsier deliberately. */
  eyes: { part: 'plate-08', paint: 'inner' },

  /* The parrot's fan, unspent: one of the pack's three THICK tails, and by
   * bounding volume squarely between its two siblings' — 0.367 against the fox
   * brush's 0.616 and the cat's rope at 0.116. A pure donor transfer, the
   * parrot's own height and burial, and it is this animal's whole height. */
  tail: { part: 'box-38', paint: 'limb' },

  /* The beaver's muzzle — the pack's one rodent's — and the panda's small nose on
   * its own front plane. Not `wedge-10`: that one reads as a tongue. */
  snout: 'tube-01',
  nose: { part: 'tube-08', paint: 'limb' },
})
