/**
 * The rat's assembly, as a definition — a fancy rat, and the animal that has to
 * prove it is not the Garden mouse.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do
 *
 * A child names a fancy rat by five things: **a long BARE tail as long as its
 * body, a blunt heavy muzzle, rounded ears, bright dark eyes, and very often a
 * HOODED marking — a dark head and shoulders on a white body.** Four of those are
 * buildable. The fifth is not, and it is why this species carries a `flag`.
 *
 * `collections/home-pets.ts` argues the six-rodent problem in its own header and
 * assigns this one its axis in a single line: *"thin / round … bare and long; the
 * one everyone can name"*, and the record itself says the rat is *"separated from
 * the gerbil by that tail being BARE where the gerbil's is tufted, which is the
 * difference a child actually points at."* So the tail is the animal, and the
 * separation inside the collection is:
 *
 *   - **the hamster** has a stub, **the guinea pig** has none, **the chinchilla**
 *     has the brush and the enormous ears, **the gerbil and the degu** own the
 *     TUFT — and this one has the bank's only BARE whip, in a colour of its own.
 *
 * ## BUT THE ANIMAL IT REALLY HAS TO SEPARATE FROM IS THE GARDEN MOUSE
 *
 * `animal-mouse` is signed off and shipped, and a fancy rat is the same animal
 * one size up: long-tailed rodent, blunt face, round ears. A rat that is just the
 * mouse again would be a silhouette twin ACROSS TWO COLLECTIONS, which is worse
 * than one inside a collection because no collection test looks for it. So every
 * divergence is deliberate and every one of them is a measurement:
 *
 * | | `animal-mouse` | this |
 * |---|---|---|
 * | hull | `box-03`, 1.250 cube, 60 tris | `box-41`, 1.350 x 1.300 x 1.350 — `OTHER_HULLS.bigger`, **1.213x the volume** |
 * | tail | `wedge-07` unspun, hung at y 0.90, and its arc sweeps **UP** | the same shape spun `z 180`, so the arc is **INVERTED** and it falls away behind |
 * | tail colour | `limb` — the same dark as its legs and muzzle | **its own palette slot**, pink-grey, shared only with the feet and the nose |
 * | ears | `box-25`, 0.7427 across, on the head's SIDE, 0.346 proud | `box-02`, 0.3150 across, on the crown, 0.070 proud — **2.36x smaller** |
 * | muzzle | `tube-01`, 0.312 x 0.193 x 0.172 | `tube-07`, 0.532 x 0.300 x 0.266 — **1.71x wide, 1.55x tall, 1.55x deep** |
 * | nose | `box-09`, 0.182 x 0.137 x 0.080 | `box-32`, 0.242 x 0.164 x 0.171 — **2.14x the projection** |
 * | legs | one hue | two-tone under JT-044: **pale paws**, off the tail's own slot |
 * | height | 1.4312 | 1.5512 |
 *
 * **The one thing it does NOT diverge on is the tail SHAPE, and that is a finding
 * rather than laziness.** The bank holds three thin tails and only two of them are
 * bare: `wedge-07` (the cat's and the monkey's) and `wedge-18` (the tiger's). They
 * are the same shape — 0.2000 x 1.046587 x 0.555215 on both, identical to six
 * decimals, and their outlines differ by 0.006 at the very tip. Taking `wedge-18`
 * because the mouse took `wedge-07` would have changed the pinned part id and
 * nothing a child can see, which is a naming trick and not a separation. So this
 * wears the same whip and separates on the four things above instead — and the
 * one that does the work is the SPIN, because it turns one shape into two
 * opposite silhouettes for no geometry at all.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-41`, the TIGER's — `OTHER_HULLS.bigger`.** 1.350 x 1.300
 *     x 1.350 against the cube's 1.250, which is 1.213x the volume, and it is the
 *     only shell in the bank that is bigger than the cube on all three axes.
 *     `hulls.ts` is explicit that taking a different authored hull is NOT a
 *     stretch and needs no excuse: the pack drew ten and using one unmodified is
 *     rule 1's purest case. It is here because the collection assigned this
 *     species its size — *"the biggest rodent bar the guinea pig"*, and *"a degu
 *     is roughly rat-sized and a gerbil is not"* — and because a stretch is
 *     unsayable, so a bigger animal is a bigger SHELL or it is nothing.
 *
 *     Two measured consequences, both of which this build then leans on:
 *
 *       - **Its REAR face is the cube's own rear face, exactly.** `box-41` sits at
 *         z = +0.050, so its rear plane is 0.05 - 0.675 = **-0.625**, which is
 *         `box-03`'s -0.625; and the flat part of that face runs y 0.49375 to
 *         1.11875 and x +/-0.3125 on BOTH shells, to the last decimal. The animal
 *         is bigger everywhere except where the tail joins, so the mouse's tail
 *         and this one hang off the same plane and are directly comparable.
 *       - **Its FRONT face is 0.100 further forward** — `HULL_FRONT_Z['box-41']`
 *         is 0.725 against the usual 0.625 — so every face part transfers onto it
 *         0.100 ahead of its donor's recorded offset. That is not drift; it is the
 *         hull being deeper, and the test pins the 0.100 rather than the sum.
 *
 *   - **The legs are the leg row and the eyes are the eye plane**, because
 *     nothing below moves them: four `box-01` sunk 0.408163 at y = 0.18125, and
 *     two `plate-01` at the card's own recorded (0.2625, 0.933646) on the absolute
 *     z = 0.6350. **The eye card is the TIGER's own, on the TIGER's own hull** —
 *     `plate-01`'s sixteen donors include the tiger and `box-41` is the tiger's
 *     shell — so the default here is a recovery, not a default. On this hull the
 *     card's inner-lower corner tucks behind the muzzle bulge, because the front
 *     face is 0.725 and the card is at 0.635; that is Kenney's arrangement of his
 *     own tiger's face and it is not corrected. `EYE_CARD_Z` carries the rule.
 *
 *   - **THE TAIL IS `wedge-07`, SPUN A HALF TURN ABOUT Z, AND THAT IS THE ANIMAL.**
 *     Three separate claims, all measured:
 *
 *       - **It is BARE.** Of the bank's seven tails, four are 0.589 to 0.744 thick
 *         and are plumes; `wedge-15` is 0.280; and `wedge-07` and `wedge-18` are
 *         0.200, the thinnest in the pack. Of those three thin ones — the only
 *         three that could read as bare at all — `wedge-07` is the one Kenney did
 *         NOT cut: **one band over all 212 of its triangles**, so it is one colour
 *         root to tip with nothing to redirect, which is exactly what a bare tail
 *         is. The other two each carry a second band at their FAR END, which is
 *         the tuft on one and the tiger's dark tip on the other, and either would
 *         have to be painted over to read as bare.
 *       - **The spin INVERTS the arc.** This shape is a hook, not a rod: its root
 *         cross-section sits at y = -0.368 of its own centre and it sweeps back
 *         and UP to +0.523. `{ axis: 'z', deg: 180 }` maps (x, y, z) to (-x, -y, z),
 *         so it is the ONLY axis-aligned half turn that leaves the facing on z -1
 *         — a turn about x or y would point the tail forwards — and it takes the
 *         root to +0.368 and the sweep DOWNWARD. The mouse's tail is carried up
 *         behind it; this one leaves the top of the rump and falls away to within
 *         0.039 of the floor. Same 212 triangles, opposite silhouette.
 *       - **Its height is forced to a single value, and it is on the pack's own
 *         grid.** Turned, the tail can only hang in a window with a hard edge at
 *         each end. Below **0.5232935** — its own half height, 1.046587 / 2 — its
 *         lowest point goes under y = 0, and `buildAssembly` grounds the whole
 *         group on its minimum, so the FEET would leave the floor. Above
 *         **0.5954565** — the flat rear face's own top of 1.11875 less that same
 *         half height — the topmost point of the join cross-section leaves the
 *         flat face and lands on a chamfer that has fallen away, which is §3's
 *         "nothing floats". **The only point on the pack's 1/16 grid inside
 *         [0.5233, 0.5955] is 9/16 = 0.5625**; 8/16 is under it and 10/16 is over
 *         it. So the one hand-written coordinate in this file is the only one the
 *         pack's own units allow, which is the same argument the belly line makes
 *         at 8/16. Its z is `box-41`'s own rear plane, -0.625, and its sink is the
 *         shape's own measured 0.159043.
 *
 *   - **The ears are `box-02`, the BEAVER's and the polar bear's**, at the
 *     beaver's own (0.4475, 0.2475) and sunk its own 0.777778. Three reasons and
 *     the last one is the honest cost:
 *
 *       - **It is round.** Taper 1.000 and `radial` symmetry: only three ears in
 *         the bank are both, and the other two are the koala's 0.7427 dish (the
 *         mouse's, and the collection gives huge ears to the chinchilla) and the
 *         bee's 0.2206 button, which the pack sinks 0.000 and which therefore
 *         floats clean off a hull as chamfered as this one.
 *       - **It is the pack's one RODENT's ear.** The beaver is the only rodent
 *         among the 24 and this is what it wears, twice.
 *       - **It only stands 0.070 proud**, because 0.777778 of 0.315 is 0.245 and
 *         that is the burial the pack itself used four times over. Said out loud
 *         rather than tuned away: this is not the species in this collection whose
 *         ears are the point, the chinchilla is, and a rat's ears reading as two
 *         small round bumps against a chinchilla's and a mouse's is the separation
 *         working rather than failing. It is genuinely EMBEDDED for all that:
 *         seven of its 48 vertices are inside the hull, against two for the lion's
 *         `box-30` and two for the cat's `wedge-06` placed the same way on this
 *         same shell, because `box-41`'s flat top face is only 0.655 x 0.515 and
 *         most ear donors put their x and z outside it.
 *
 *     **"Set well back" is the one word of the description that has no referent
 *     here, and it is rule 3 rather than a shortfall.** One mass means there is no
 *     head for an ear to be set back ON. Measured against what there is, the ear
 *     runs z 0.145 to 0.350 and the eye plane is 0.635, so it does sit 0.285
 *     behind the face — but the mouse's is at z 0.126, which is FURTHER back
 *     still. Depth is not what separates these two ears; 0.3150 against 0.7427 is.
 *
 *   - **The muzzle is `tube-07`, the GIRAFFE's, and the burial is what makes it
 *     fit.** All three of the bank's 0.532-wide barrels are the same box —
 *     `tube-03` the deer's, `tube-06` the fox's, `tube-07` the giraffe's — and
 *     only the giraffe's was ever SUNK: 0.37594 of its 0.266, which is 0.100.
 *     That matters on this hull and on no other, because **`box-41`'s flat front
 *     face is only 0.400 across** (x +/-0.200, y 0.494 to 0.894) where the cube's
 *     is 0.625 square. A 0.532-wide muzzle laid flush on it would overhang the
 *     flat patch by 0.066 a side and show daylight at both corners; buried 0.100
 *     it stays embedded to 0.200 + 0.100 = 0.300, past its own 0.266 half width,
 *     and 16 of its 24 vertices are inside the hull. It is 1.71x the mouse's
 *     `tube-01` across at the same taper 1.000 — the same blunt barrel, one size
 *     up, which is the hull's argument again on the face.
 *
 *   - **The nose is `box-32`, the LION's and the TIGER's**, on the muzzle's own
 *     front plane by `on: 'snout'` rather than by an arithmetic this file would
 *     carry a copy of — the builder puts it at z = 0.891 and a nose that floats or
 *     buries is then a thing that cannot happen quietly. It is sunk its own
 *     0.292906, which beds 0.050 of it into the muzzle so there is no seam, and it
 *     is the bank's biggest plain button: 2.14x the projection of the mouse's
 *     `box-09`. It is deliberately not `wedge-10`, which is measurably the better
 *     nose tip on every axis the classification has and reads as a TONGUE — Joe
 *     rejected that one by name on the hedgehog and the lesson is not the
 *     hedgehog's alone.
 *
 *   - **The paws are pale, under JT-044, and they cost no geometry.** Joe ruled
 *     the two-tone leg for hooves and it is equally a rat's bare pink foot:
 *     `legs: { paint: { base: 'limb', patch: { below: 'bare', at: 0.25 } } }`.
 *     `at` is a fraction of the LEG's own height and must sit on the 1/16 grid;
 *     0.25 is 4/16, and 0.25 x 0.30625 puts the boundary 0.0766 above the sole.
 *     The leg is sunk 0.408163, so only 0.18125 of it is ever visible, and 0.0766
 *     of that 0.18125 is **42% of the leg a child can actually see** — a paw and
 *     the ankle over it. It is safe on all three of the ruling's counts: the legs
 *     carry no `byBand`, they are not spun, and the only other patch on this
 *     animal is the belly, which is on the `coat` slot and not on `limb`.
 *
 *   - **The belly is PAINTED at 8/16**: the tiger's own mammal line made exact,
 *     the only point on the pack's 1/16 grid inside the 0.4808-0.5481 zone its
 *     split-triangle boundary wanders across. `box-41` IS the tiger's hull, so
 *     here that line is not carried over from anywhere — it is this shell's own.
 *
 *   - **The palette is five slots and one of them is new.** `bare` is a colour of
 *     its OWN, and it is the capability that landed hours before this build: a
 *     rat's tail is pink-grey scaly skin and is emphatically NOT its coat, which
 *     is the whole reason a child can name it. The same slot paints the paws and
 *     the nose, because those are the same bare skin on the same animal — one
 *     colour doing three jobs off one biological fact, rather than three slots.
 *
 * ## `pets:creature` MARKS THREE PARTS **THIN**, and all three are the pack's own
 *
 * The tail at 0.088, the muzzle at 0.100 and the nose at 0.050 all print `THIN`,
 * which is the harness saying they are buried less than the 0.125 §3 asks of an
 * EAR. Not one of them is a shortcut: the tail is `wedge-07`'s own measured mean
 * over its two donors and is the number the mouse carries too; the muzzle is the
 * giraffe's own 0.37594, and it is the DEEPEST any of the bank's three 0.532
 * barrels is buried, the other two being 0.000; the nose is the lion's and the
 * tiger's own 0.292906, against the mouse's `box-09` at 0.000. And the mark is
 * worth less than it looks, because a part sunk 0.000 prints as `flush` and is not
 * marked at all — so this animal is flagged for burying things the pack itself
 * buries and the mouse's face, buried nothing, is not. Not a `flag`, looked at,
 * and written down here so nobody re-derives it.
 *
 * ## CONSIDERED AND REFUSED, so the next builder does not helpfully add them back
 *
 *   - **`wedge-15`, the LION's tail — REFUSED, and this is the important one.**
 *     It is the longest tail in the bank (1.0824 against 1.046587) and it looks
 *     like the obvious pick for "long". **It is the TUFTED one.** Measured along
 *     its own length its section is 0.100 to 0.200 like the other two whips for
 *     most of the way and then swells to **0.280 near its far end** — the only
 *     tail in the bank that gets THICKER towards its tip — and Kenney paints that
 *     swelling separately, band 5, 40 triangles, at y 0.290 to 0.541. It is a
 *     lion's tuft, geometry and colour both. The gerbil and the degu own the tuft
 *     in this collection and a rat's tail is bare, so the longest tail in the bank
 *     is the wrong one and the 0.0358 of extra reach is not worth the tuft.
 *   - **`wedge-18`, the tiger's — refused, but only as a name.** See above: it is
 *     `wedge-07` to within 0.006 at the tip, so swapping to it would have bought a
 *     different pinned id and no visible difference.
 *   - **`box-25`, the koala's dish — refused twice over.** It is the mouse's whole
 *     silhouette argument, and inside this collection the chinchilla is the one
 *     given the ears. At 0.7427 it is also not a rat's ear.
 *   - **`box-18` the stub (the hamster's), and `box-23`, `box-38` and `wedge-03`,
 *     the three plumes at 0.589 to 0.744 thick (the chinchilla's)** — refused on
 *     the collection's own matrix.
 *   - **`plate-10` and `plate-11`, the flank cards — refused for the hood.** They
 *     are the only marking cards in the bank, they mount on the hull's SIDE at
 *     x = 0.635, and they are 0.244 x 0.253 and 0.400 x 0.433. A hood has to cross
 *     the top of a 1.350-wide animal; two side blotches are not that, and pinning
 *     them on would read as a spotted rat, which is a different animal.
 *
 * ## THE ACCOUNTING, because this is the most expensive animal built so far
 *
 * 945 triangles of the pack's measured 951, and every one of them is spent where
 * the animal is: hull 262, tail 212, ears 184, legs 176, eyes 54, nose 29, muzzle
 * 28. There are **six triangles of headroom**, which is why there is no mouth card
 * — `plate-13` is 14 and does not fit. That is a decision and not an oversight,
 * and it is recorded here so nobody spends the last six on something small.
 *
 * **FLAGGED**, and only for the hooded marking. Nothing else strained: 590
 * vertices and 945 triangles inside the pack's 405-1626 and 422-951, 462 body
 * vertices inside 236-1114, height 1.5512 inside 1.43-2.02, keep-out 1.052
 * against the fox's 1.15, one mass, no stretch anywhere, nothing authored, and
 * every number but one the pack's own.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const RAT_ASSEMBLY = defineCreature('animal-rat', {
  palette: {
    coat: 0x736658,    // proposed coat: agouti grey-brown, the wild-type fancy rat above
    belly: 0xeae2d5,   // proposed belly: the painted underside and the sclera
    bare: 0xd9b2a9,    // proposed, and the reason this species has a fifth slot:
    //                    BARE PINK-GREY SKIN. The tail, the paws and the nose — one
    //                    colour for one fact, and the thing a child names a rat by.
    limb: 0x4b423a,    // proposed accent: the legs above the paws, and the muzzle
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The tiger's own shell — OTHER_HULLS.bigger, 1.213x the cube's volume. A rat is
   * a mouse one size up and a stretch is unsayable, so it is a bigger SHELL. Its
   * rear face is the cube's own -0.625; its front face is 0.100 further out. */
  hull: 'box-41',

  /* The mammal belly line at 8/16, made exact. On this hull it is not carried over
   * from the tiger — box-41 IS the tiger, so this is the shell's own boundary. */
  belly: 0.5,

  /* JT-044, and not as a hoof: a rat's bare pink foot. 0.25 is 4/16 of the leg's
   * own 0.30625, which is 42% of the 0.18125 that is not buried in the belly. */
  legs: { paint: { base: 'limb', patch: { below: 'bare', at: 0.25 } } },

  /* The beaver's own round ear — the pack's one rodent's — at the beaver's own x
   * and z and its own burial. Round (taper 1.000, radial) and small: 0.3150 across
   * against the mouse's 0.7427 dish, which is what separates the two heads. */
  ears: { part: 'box-02', paint: 'coat' },

  /* THE ANIMAL. The bank's only single-band tail — one colour root to tip, which
   * is what BARE means — turned a half turn about z, the one axis-aligned half
   * turn that leaves its facing on z -1, so its arc falls away behind instead of
   * sweeping up. 0.5625 is 9/16 and the only grid point between the floor and the
   * top of the flat rear face; -0.625 is that face. */
  tail: {
    part: 'wedge-07',
    paint: 'bare',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, 0.5625, -0.625],
  },

  /* The giraffe's barrel: the only one of the bank's three 0.532-wide muzzles its
   * donor SANK, and the 0.100 of burial is what keeps its corners inside a front
   * face that is only 0.400 across. 1.71x the mouse's, same taper 1.000. */
  snout: { part: 'tube-07', paint: 'limb' },

  /* The lion's and the tiger's button, on the muzzle's own front plane, bedded
   * 0.050 into it. Pink, because a rat's nose is the same bare skin as its tail.
   * Not `wedge-10`: that one is measurably a nose TIP and reads as a tongue. */
  nose: { part: 'box-32', paint: 'bare' },

  flag: 'THE HOODED MARKING CANNOT BE EXPRESSED, and on a fancy rat it is the '
    + 'marking a child points at: a DARK HEAD AND SHOULDERS on a WHITE BODY, the cap '
    + 'running from the nose over the crown and down between the front legs. Every '
    + 'mechanism we have falls short of it in a different way, and none of them is '
    + 'close. `Paint.patch` takes one number and that number is a HEIGHT — it paints '
    + 'ONE LEVEL BOUNDARY across a part and has no z term at all, so it can say '
    + '"pale underneath" (which is what the belly line here is) and it cannot say '
    + '"dark at the front end"; and rule 3 is one mass, so there is no separate head '
    + 'to paint instead. `byBand` can only cut where Kenney already cut, and this '
    + 'hull\'s three bands are the tiger\'s: a lower-front chest patch, an upper-back '
    + 'saddle, and the remainder — a saddle over the MIDDLE of the back is very '
    + 'nearly the opposite of a hood. And the bank has no card that could carry one: '
    + 'its only marking cards are the flank blotches the cow, the dog and the '
    + 'giraffe share, `plate-10` (0.244 x 0.253) and `plate-11` (0.400 x 0.433), '
    + 'both side-mounted at x = 0.635 and both far too small to cross the top of a '
    + '1.350-wide animal. '
    + 'So what is here is an AGOUTI rat — grey-brown above, pale below, the wild type '
    + 'a fancy rat also comes in — which is true of the animal and is not the '
    + 'photograph on the packet. Nothing was authored to fake the hood. Also worth '
    + 'your eye, because it is the one place this animal shares a part with a species '
    + 'you have already signed off: its tail is the SAME `wedge-07` the Garden mouse '
    + 'wears. The bank has exactly two bare whips and they are the same shape to six '
    + 'decimals, so picking the other one would have changed a name and nothing you '
    + 'can see. It is separated instead by being SPUN a half turn — the arc falls '
    + 'away behind where the mouse\'s sweeps up — by carrying its own pink-grey '
    + 'colour where the mouse\'s is painted the same dark as its legs, and by hanging '
    + 'off a hull with 1.213x the volume.',
})
