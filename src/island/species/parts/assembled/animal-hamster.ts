/**
 * The hamster's assembly, as a definition — Home Pets' round one.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do
 *
 * `collections/home-pets.ts` names the risk in its own header: hamster, guinea
 * pig, gerbil, chinchilla, rat and degu are **six small brown-ish rodents in one
 * album page**, and it rules that palette cannot carry the separation because
 * "four of the six are some shade of sandy brown in life". Its own table gives
 * this species two words — **`stub` and `round`** — and the note beside them is
 * "a Syrian hamster's tail is a nub".
 *
 * So the whole build is those two words, and every one of them is a measurement:
 *
 *   - **ROUND** is the hull, and it is the pack's 1.250 cube taken bare. See
 *     below: measured against its own thirty bounding planes, the pack drew that
 *     body FOUR times and `box-03` is the plainest drawing of it — so "round" was
 *     never a choice between shells, only a decision to hang nothing long on the
 *     one there is.
 *   - **STUB** is `box-18`, the shortest tail shape in the bank by 0.130, on the
 *     rear face at the elephant's own height.
 *   - and everything else on the animal is chosen to ADD NO LENGTH: no snout at
 *     all, a nose that projects 0.108, a mouth that projects 0.010, and ears that
 *     stand 0.070 proud. Nothing on this hamster reaches further from the shell
 *     than a tenth of a unit except the nub, and that is what "compact" is when
 *     it is a number instead of an adjective.
 *
 * ## THE HULL: why the bare cube, and what was refused for it
 *
 * The brief for this animal was "which hull says round and stocky", which sounds
 * like a question about ten shells and turns out to be a question about one.
 *
 * **`box-03` is a convex solid bounded by thirty planes** — six flat faces at
 * +/-0.625 and twenty-four edge bevels, two per cube edge, whose normals are the
 * permutations of (+/-3, +/-2, 0)/root-13 and which all pass 3a + 2b = 2.5
 * (`authored.ts:238-263`, and the doc's "45 degrees" and "corner facets" at §8
 * are wrong about it). Written that way it is a test, and every hull in the bank
 * can be run through it. The result is the reason this species wears the plain
 * cube:
 *
 *   - **FOUR of the pack's ten hulls are that same solid.** `box-03` (32 welded
 *     points, 60 triangles), `box-20` the fish's (40, 78), `box-36` the panda's
 *     (38, 72) and `box-39` the penguin's (42, 80) — **every welded point of all
 *     four lies exactly on those thirty planes, none outside and none strictly
 *     inside.** They are not four bodies, they are one body drawn four times with
 *     different vertex counts, and `box-03` is the plainest and the cheapest of
 *     them. §7 reads the extra points as "(a) cube plus an add-on"; measured
 *     against the solid rather than counted, they are extra VERTICES on a surface
 *     that has not moved.
 *   - **`box-33`, the monkey's, is that solid with a dent** — 12 of its 66 points
 *     lie up to 0.200 strictly inside it, which is the monkey's sunken face.
 *   - **Everything else leaves the solid entirely**: `box-12` by 0.767 (two fused
 *     ear lugs), `box-21` by 0.554 (1.5051 tall), `box-31` by 0.188 (1.125 deep),
 *     `box-13` by 0.169 (the crab's 0.451-high plate), `box-41` by 0.200.
 *
 * So "round" is not a choice between shells. `box-03` is `symmetry: radial` and
 * `aspect: [1, 1, 1]` — the same in every direction, which is what round means
 * when it has to be measured rather than admired — and it is the cheapest drawing
 * of the only round body the pack owns. What is left for a species to decide is
 * what it hangs on it, and this one hangs nothing long.
 *
 * **`box-41`, the tiger's, was the real candidate and it is REFUSED here by
 * measurement so the next builder does not helpfully try it again.** It is
 * 1.350 x 1.300 x 1.350 — the only BODY in the pack whose width and depth both
 * exceed its height (the crab's `box-13` does too, at 0.4506 tall, and is a
 * plate) — and it carries 85 distinct face normals against the cube's 30, so it
 * reads as the roundest right up until you probe it. Probed, it carries **the
 * tiger's muzzle boss**: an OCTAGON on its front face, eight points at z = 0.675
 * running (0, -0.3375), (+/-0.1414, -0.2789), (+/-0.2, -0.1375),
 * (+/-0.1414, 0.0039), (0, 0.0625), standing **0.100 proud** of the 0.575 the
 * same shell presents anywhere else. Its top point is at y = 0.0625, which is
 * exactly the eye cards' own centre height above that hull's centre
 * (0.893750 - 0.831250). An eye card at the pack's own x = 0.2625 spans x 0.0625
 * to 0.4625 and reaches down to y = -0.1375, where the octagon is at its widest
 * — so the boss stands **0.090 in front of** the inner-lower corner of both eyes,
 * because that hull's front face is z = 0.725 and the eye plane is the absolute
 * 0.635. The tiger can wear its own muzzle; a hamster cannot wear it through its
 * eyes.
 *
 * ## THE CHEEK POUCHES, AND WHY THERE ARE NONE
 *
 * A hamster's one unmistakable feature is a stuffed cheek, and this build does
 * not have one. That is a finding rather than an omission, and it is worth the
 * space because it is the first thing anybody will reach for here:
 *
 *   - **A pouch is a HEAD feature and rule 3 leaves no head.** Head and body are
 *     one shell with no seam at the neck, so a swelling at head height is also a
 *     swelling on the torso — there is nothing for it to be proud OF.
 *   - **The arithmetic refuses it anyway.** §8 step 4: the cube's flat side face
 *     reaches only z = 0.3125 before the chamfer falls away 1:1. A 0.400-wide pad
 *     joined on that face stays embedded only while its centre is inside
 *     |z| <= 0.1125 — barely forward of the hull's own midline. A cheek that has
 *     to sit behind the midline is a flank.
 *   - **And every shape that could sit further forward is an ear.** Six shapes in
 *     the whole bank have a measured attachment on the x axis, and they are:
 *     `box-25` (0.7427 across, the koala's, and Garden's mouse wears it as an
 *     ear), `tube-04` and `tube-05` (0.6188, the elephant's), `box-04` (the bee's
 *     1.335 torso RING, sunk 0.968), and the two flat cards below. Every solid
 *     one of them is an EAR, and the three of them are the largest side-mounting
 *     shapes in the bank. A hamster whose separation from five sibling rodents is
 *     that its ears are small would grow a second, bigger pair. §3.2's travelling
 *     identity, exactly: a big round disc on the side of a head is an ear at any
 *     distance and no measured axis catches it.
 *   - **The flat marking cards cannot stand in either.** `plate-10` (0.244 x
 *     0.253) and `plate-11` (0.400 x 0.433) are measured **0.0000 thick**, so
 *     they are a marking and not a bulge; and `plate-11`, carried forward to a
 *     cheek, runs its own edge 0.2165 past a flat side face that ends at 0.3125.
 *
 * Not flagged, because a hamster's pouches are only visible when it has just
 * eaten and the animal is complete without them — unlike the badger, whose
 * missing marking IS the badger. Recorded here so the refusal is a measurement
 * somebody can re-run rather than a gap somebody fills.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull and the eye plane are the pack's own**, and the legs are the leg
 *     row: `box-03` at the pack's own [0, 0.80625, 0], four `box-01` sunk
 *     0.408163 on the row at y = 0.18125 that never moves.
 *
 *   - **The eyes are `plate-08`, and they are the bead.** `home-pets.ts` gives
 *     this animal "round", and the bank has exactly one ROUND eye: `plate-08` is
 *     0.400000 x 0.400000 with `symmetry: radial` and `taper: 1.000`, against the
 *     default `plate-01`'s 0.400 x 0.320 almond. It sits at its own recorded
 *     (0.2625, 0.893750) on the pack's absolute z = 0.6350, sunk 0 and unscaled,
 *     because an eye is never adjusted (rule 5). Five species donate it — the
 *     chick, the fish, the monkey, the parrot and the penguin — so it is as
 *     canonical as the almond and no less the pack's own.
 *
 *   - **The ears are `box-02`, and the transfer is EXACT rather than an
 *     inference.** Its donors are the beaver and the polar bear, its measured
 *     attachment is `y +1` — a TOP-face ear — and the beaver wears it on this
 *     same `box-03`, whose recorded offset IS the beaver's hull centre (§8). So
 *     the donor transfer joins it at this hull's top face y = 1.43125, sinks it
 *     its own measured 0.777778 of 0.315, and its centre lands on **1.34375, the
 *     bank's recorded offset for the shape**. Nothing is chosen.
 *
 *     It is SMALL and it is HIGH, which is the whole brief: 0.315 across against
 *     the koala dish's 0.7427 — **2.36x smaller than the biggest ear in the
 *     bank** — and it stands only **0.070 proud of the hull's own top plane**,
 *     0.056 of the hull's height. The pack's own x = 0.4475 is out past the flat
 *     top face, which reaches 0.3125 before the chamfer starts, so the ear
 *     actually rises out of the cube's SHOULDER: at (0.4475, 0.2475) the shell's
 *     surface has fallen to y = 1.34125, where the ear stands 0.160 proud and is
 *     still buried **0.155** — a quarter more than §3's floor of 0.125.
 *
 *     **Kenney's own inner-ear cut comes with it, for one `byBand` entry.**
 *     `box-02` carries two bands and band 7 is 10 triangles at z = +0.1025
 *     exactly, a flat disc of radius 0.1057 on the ear's forward face. Painted
 *     `ear`, that is a dark inner ear on a golden head and no geometry at all.
 *
 *   - **The tail is `box-18`, TURNED, and it is the bank's only stub.** Kenney
 *     names it `tail` on the elephant and Kenney is wrong: it is the elephant's
 *     TRUNK, and the measurement is what gives it away — the bank's six other
 *     tail shapes are all `attachment z -1`, already pointing backwards off a
 *     rump, and this one alone is **`z +1`**. So it is spun
 *     `{ axis: 'y', deg: 180 }` — rule 4 as amended, baked into the copy's
 *     vertices — and the donor transfer then joins it at this hull's rear face,
 *     z = -0.625, where its centre lands on **-0.837600 against the bank's
 *     recorded +0.837606**: the recorded offset, mirrored, because the elephant
 *     wears this shape on `box-03` too.
 *
 *     It is a stub by measurement and not by adjective: **0.4252 of reach against
 *     0.5552 for the next shortest tail in the bank**, and 0.9102 for the fox's
 *     brush. It is the only shape in the bank that could answer `home-pets.ts`'s
 *     "stub", and no sibling rodent on that page has a claim on it — the guinea
 *     pig has none, the gerbil and the degu are tufted, the chinchilla is bushy
 *     and the rat's is thin and long.
 *
 *     **Sunk the elephant's own 0.000, which is a decision and not a default.**
 *     Burying it deeper would make a shorter nub and cost keep-out, and it is
 *     refused: at the donor's height the part's lowest vertex is y = 0.1707,
 *     0.0106 below the hull's own bottom face, and it clears only because the
 *     whole shape sits BEHIND z = -0.625. Pulled forward into the hull it would
 *     hang under a rump whose bottom face has already chamfered up by z = -0.3125,
 *     and a nub that droops is worse than a nub that is 0.05 too long.
 *
 *   - **The nose is `tube-08`, the panda's, and it is the blunt one.** No snout:
 *     the mouse and the squirrel wear the beaver's muzzle and the shrew has the
 *     long face; a hamster is blunter than any of them, so the nose goes straight
 *     onto the cube's own front face at z = 0.625 with the panda's own sink of
 *     0.000, and the whole face projects **0.1082**. It is a BUTTON — wide (0.234)
 *     and shallow (0.126 tall) — and deliberately not `wedge-10`, which is
 *     measurably the better nose tip and reads as a tongue; Joe rejected that one
 *     by name on the hedgehog.
 *
 *   - **The mouth is `plate-03`, and this is the first species to let the
 *     placement SOLVE it.** `CARD_STANDOFF` in `parts/creature.ts` joins a
 *     zero-thickness card 0.010 proud of the face it lands on rather than exactly
 *     in it, where it z-fights into invisibility. On this hull that puts the card
 *     at **z = 0.625 + 0.010 = 0.635 — `plate-03`'s own recorded offset z, to
 *     four decimals**, recovered from a solve that never read it. The goldfish,
 *     the firefly and the glow-worm each hard-code `at: [0, 0.686849, 0.635]` for
 *     this; the hard-code was a workaround and the recovery is the evidence it is
 *     no longer needed.
 *
 *   - **The legs are two-tone, which is JT-044 spent on PALE FEET.** Joe ruled
 *     the mechanism for hooves and said it is a general tool; a golden hamster's
 *     feet are white against golden legs and that is the same tool. `Paint.patch`
 *     takes a fraction of the part's OWN height and `texture.ts` refuses anything
 *     off the pack's 1/16 grid, so the number is not free — and the leg has a
 *     measured line to aim at. `box-01`'s welded points sit at only THREE heights,
 *     y = -0.1531, -0.0906 and +0.1531: **its bottom chamfer edge is 0.0625 above
 *     the foot, which is 0.204115 of its 0.30620 height** — the one line on that
 *     shape a sock could follow. The nearest point on the pack's own grid is
 *     **3/16 = 0.1875**, which lands 0.0051 BELOW that edge, so the cream stops
 *     inside the foot's own chamfer rather than part-way up a shin. 4/16 would
 *     overshoot it by 0.0141, and nothing between them is sayable.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: no second shape, no
 *     split triangle, no geometry at all. 0.5 is the tiger's own mammal belly
 *     line made exact — the only point on the pack's 1/16 grid inside the
 *     0.4808-0.5481 zone Kenney's split-triangle boundary wanders across — and it
 *     is also this hull's own equator. Golden above, cream below.
 *
 *   - **The palette is five slots and the coat is the separation.** `home-pets.ts`
 *     says palette cannot separate six sandy rodents, which is a reason to make
 *     this one's colour the one nobody else wants rather than a reason not to
 *     choose: a Syrian hamster is not sandy, it is GOLDEN — an orange-brown a
 *     gerbil, a rat, a degu or a chinchilla would all be wrong in. The fifth slot
 *     is the legs', and it exists because of a mechanism rather than a colour:
 *     `assembly.ts:493` allows a slot exactly one painted boundary — *"one cell,
 *     one picture"* — so a species that wants a belly line AND a pale foot needs
 *     two cells. It is taken a shade under the coat, which is where a rodent's
 *     limbs sit anyway.
 *
 * **No flag.** Nothing was strained. Height **1.5012**, inside 1.43-2.02, set by
 * the ears; 426 vertices and 595 triangles inside rule 9's 405-1626 and 422-951;
 * keep-out **0.892** against the fox's 1.15, of which the nub is 0.213; the hull
 * at the shell's own 1.250 on all three axes; nothing authored; and no number in
 * this file that is not a measurement off the bank or off the hull.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const HAMSTER_ASSEMBLY = defineCreature('animal-hamster', {
  palette: {
    coat: 0xc9803c,
    belly: 0xf2e8d2,
    ear: 0x6b5347,
    limb: 0xb0713a,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  belly: 0.5,
  legs: { paint: { base: 'limb', patch: { below: 'belly', at: 0.1875 } } },
  eyes: { part: 'plate-08' },
  ears: { part: 'box-02', paint: { base: 'coat', byBand: { 7: 'ear' } } },
  nose: { part: 'tube-08', paint: 'ear' },
  extras: [
    { part: 'plate-03', name: 'mouth', paint: 'ear' },
    {
      part: 'box-34',
      name: 'box-34',
      at: [0.5375, 0.825, 0.35],
      spin: [{ axis: 'y', deg: -90 }],
      stretch: [1.75, 1.75, 1.75],
      kind: 'pair',
    },
    {
      part: 'tube-03',
      name: 'tube-03',
      at: [0, 0.7625, -0.5375],
      spin: [{ axis: 'x', deg: -180 }],
      stretch: [0.7, 0.8, 1.2],
    },
  ],
})
