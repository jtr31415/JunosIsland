/**
 * The kinkajou's assembly, as a definition — the golden rainforest procyonid, and
 * the one animal in this batch with no marking problem at all.
 *
 * ONE SPECIES, ONE FILE. `index.ts` says why one appended line is the whole of
 * the wiring, and it says why the line never precedes the file.
 *
 * ## What this animal has to do
 *
 * **Round and friendly is the whole read.** A kinkajou is a round head, small
 * round ears set low, big dark forward eyes, a short muzzle, a uniform golden
 * coat and **a fully prehensile tail** — the only carnivoran in the Americas with
 * one. There is no stripe, no mask, no blotch and no ring anywhere on it, so
 * nothing here is flagged and nothing is approximated: every part of this animal
 * is a shape, and the bank has all of them.
 *
 * ## THE PANDA'S WHOLE FACE, TRANSFERRED ONTO THE PANDA'S OWN SHELL
 *
 * The hull, the ears, the eye cards and the nose are all the panda's, and that is
 * the design rather than a coincidence. §8's donor transfer is *"if a shape's
 * donor wears it on THIS hull, join the copy at the face the donor joined it to
 * and sink it by the donor's own `sunkFraction`"*, and it says the transfer is
 * exact when the donor and the hull agree and an INFERENCE when they do not.
 * Taking four parts from one donor onto that donor's own shell makes every one of
 * them exact, with nothing left to argue about — and the panda is, measurably,
 * the roundest and friendliest face the pack drew.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-36`, the panda's cube.** It is the same 1.250 cube
 *     silhouette as `box-03` — §7 classifies it *(a) cube + 6* — and it is worn
 *     for two reasons, both measured. First, it is the shell the other three
 *     panda parts were drawn against, which is what makes their transfers exact.
 *     Second, it is **72 triangles against `box-03`'s 60**, and on a light animal
 *     it is rule 9's FLOOR that binds first, not its ceiling: `budget()` in
 *     `assembly-assert.ts` enforces 422 triangles and 405 vertices with no escape
 *     hatch on that side, where `overBudget` forgives only a ceiling.
 *
 *     **The panda's own band cut was considered and REFUSED.** `box-36` arrives
 *     pre-split into band 3 (28 triangles, the upper shell) and band 15 (44), and
 *     §4's first way to two-tone would take it for free. It is refused because it
 *     is a BLACK AND WHITE BEAR'S cut and a kinkajou is one uniform gold; both
 *     bands take the coat, and the only boundary on this animal is the painted
 *     belly line below, which is §4's second way and is exact where Kenney's own
 *     wanders (§7 measured his mammal boundary across a 0.067 zone).
 *
 *   - **THE EARS ARE `box-34`, THE PANDA'S OWN, AND THE TRANSFER RECOVERS THE
 *     BANK'S NUMBER EXACTLY.** Joined at this hull's top face
 *     y = 0.80625 + 0.625 = 1.43125 and sunk the panda's own 0.777778, the shift
 *     is 0.1575 - 0.245 and the centre lands on **y = 1.3437204 against the
 *     bank's recorded 1.3437500** — 3.0e-5, which is as close as a solve running
 *     through `bank.generated.ts`'s four-decimal positions can get to a
 *     six-decimal `offset`, and is the same residual the fire salamander's own
 *     tail recovery records. x = 0.4475 and
 *     z = 0.3475 are untouched by the join and are therefore the panda's own as
 *     well. Nothing here was chosen; three numbers were recovered.
 *
 *     They are buried 0.245 of their own 0.315 — nearly four fifths — so only
 *     0.070 stands proud, and that is the animal: a kinkajou's ears are small,
 *     round and set so low on the sides of the head that they barely break the
 *     outline. §3's "nothing floats" is not close; the ear is almost entirely
 *     inside the mass.
 *
 *     **`box-02` was considered and refused.** It is the beaver's and the polar
 *     bear's, and it is the SAME bounding box (0.315 x 0.315 x 0.205), the same
 *     `y +1` axis and the same 0.777778 burial — a genuine near-duplicate. It is
 *     refused on two counts: `animal-dormouse.ts` already spends it, and it is 92
 *     triangles against the panda's 116, which is 48 fewer over the pair on an
 *     animal whose binding budget is a floor.
 *
 *   - **THE EYES ARE `plate-14`, THE BIGGEST IN THE PACK, AND THEY ARE UNSPENT.**
 *     0.435472 x 0.442601 against the default card's 0.400 x 0.320208. The pack's
 *     whole eye range is only 1.44x and **rule 5 makes stretching one unsayable**
 *     — there is no `stretch` field on an eye and its z is `EYE_CARD_Z` and not a
 *     parameter — so this is as big as a nocturnal animal's eye is allowed to
 *     get, and there is nothing above it to reach for. A kinkajou's huge dark
 *     forward eyes are its whole face, so this is the species that should have
 *     them.
 *
 *     Placed at the card's OWN recorded (0.258676, 0.920023) on the absolute
 *     z = 0.6350 — the definition names the part and nothing else, because the
 *     bank records the point. It arrives pre-split into band 3 and band 15, so
 *     the sclera and the measured pupil cost no geometry.
 *
 *   - **The snout is `tube-01`, the beaver's, and a kinkajou's muzzle is SHORT.**
 *     0.311961 long against the deer's and the fox's 0.532 — it is the small end
 *     of the muzzle family, a rounded barrel at taper 1.000 that does not narrow.
 *     Placed entirely by the donor transfer: joined at this hull's front face
 *     z = 0.625, sunk the beaver's own measured 0.000, so its centre lands on
 *     **z = 0.710803, the beaver's own recorded offset to six decimals**, and its
 *     height is the beaver's own 0.815078. `animal-squirrel.ts` and
 *     `animal-mouse.ts` wear the same shape; ours is painted from the limb slot
 *     rather than the coat, so the short muzzle reads as a darker face on a
 *     golden head.
 *
 *   - **The nose is `tube-08`, the panda's own nose-tip**, anchored with
 *     `on: 'snout'` so the builder puts it on the muzzle's placed front plane
 *     measured off the built vertices. It is 0.233877 wide against the muzzle's
 *     0.311961 front face, so it is backed everywhere — which is not automatic,
 *     and `animal-mole.ts` refuses a nose button for the opposite reason (its
 *     snout is `cone-06`, whose anchor is an apex with no width at all).
 *
 *     **`box-26` was considered and refused.** The koala's broad pad is 0.278
 *     wide and would still fit, but it is a DIGGING animal's nose and it is
 *     already the badger's and the dormouse's. A kinkajou's is small and dark,
 *     and the panda's completes the family.
 *
 *   - **THE TAIL IS CARRIED UP THE REAR CHAMFER, AND THAT IS THE ANIMAL.** A
 *     kinkajou's tail is as long as its body and it is fully prehensile: it is
 *     held curled up and over, not trailed. §8's chamfer idiom is exactly that
 *     placement and `chamfer: true` is the whole of saying it — the builder
 *     solves `box-36`'s own +y/-z edge chamfer midpoint AND the 45-degree turn
 *     onto its outward normal together, and it REFUSES a hand-written `spin` or
 *     `at` beside it, because giving one without the other is how a tail floats.
 *
 *     The numbers, none of them chosen: the chamfer midpoint is
 *     **(0.46875, -0.46875)** off the hull centre — measured off the shell's own
 *     vertices, not the (0.5625, 0.5625) you get by assuming a 1.000-wide face,
 *     which §8 says costs a whole row — so the join is (0, 1.27500, -0.46875).
 *     `{ axis: 'x', deg: 45 }` takes the rope's own `z -1` facing to
 *     (0, 0.7071, -0.7071). Sunk its own measured mean 0.159043, the centre lands
 *     at (0, 1.40885, -0.60260) and the plume tops out at **1.8568**.
 *
 *     **`box-23` chamfered was considered and refused.** It is the fox's brush,
 *     it is what `animal-squirrel.ts` carries up this same chamfer, and on this
 *     hull it would put the animal at **1.9763** — the same number the squirrel
 *     measures and flags. It is refused on the animal rather than on the height:
 *     a kinkajou's tail is a long thin prehensile rope, not a plume, and `box-23`
 *     is 1.67x the volume of any other tail in the bank with a round section that
 *     barely tapers.
 *
 *     **The overlap, said out loud.** The bank has exactly two thin ropes,
 *     `wedge-07` and `wedge-18`, identical to six decimals in every dimension.
 *     `animal-mouse.ts`, `animal-newt.ts` and `animal-opossum.ts` wear this one;
 *     `animal-salamander.ts` and `animal-civet.ts` wear its twin. Every one of
 *     those five TRAILS it off the rear face. This one is the only one that goes
 *     UP, and that single placement is worth more than a different shape would
 *     be: it is the same argument §8 makes for the squirrel against the fox —
 *     *"the same shape, joined to the back of the same cube, carried up instead
 *     of trailing"* — and it is cheaper front to back as well, because a tail
 *     that rises does not spend keep-out, which `pets.ts` charges from
 *     `max(width, depth) / 2`.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way — no second shape and no
 *     split triangle. The tiger's own mammal line made exact: §7 measured the
 *     pack's boundary wandering across 0.4808-0.5481 and 8/16 is the only point
 *     on the pack's 1/16 grid inside that zone, as well as this hull's own
 *     equator. A kinkajou is gold above and paler gold beneath, and that is the
 *     only boundary on the animal.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * There is no `collections/night-time.ts` record carrying colours for this
 * species, so the five below are the first ever proposed for it and every one is
 * marked UNREVIEWED. **Joe should look at them.** Gold is the whole animal and
 * there is nothing else on it to hide behind.
 *
 * **No flag.** Nothing was strained. Nothing is stretched, one thing is spun and
 * the test says how many, no part is authored, the hull is the shell at its own
 * size, and every join point above is either a recovered donor offset or the
 * chamfer midpoint the builder measured off the shell's own vertices. It is the
 * tallest of the three long-tailed climbers at 1.8568 against a 2.02 ceiling, and
 * that height is the raised tail rather than a choice: burying it deeper than the
 * cat and the monkey did would bring it down at the cost of the tail standing
 * clear of the back, which is the thing it is for.
 *
 * Measured on the built model: **height 1.8568** inside the pack's 1.43-2.02,
 * feet on y = 0; **852 triangles** inside 422-951; **602 vertices** inside
 * 405-1626 and 474 in the body inside 236-1114; **keep-out 0.883** against the
 * fox's own 1.15 — 1.250 wide by 1.766 deep, and the most compact of the three
 * long-tailed climbers built in this batch, precisely because the tail goes up
 * where the opossum's and the civet's go back.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const KINKAJOU_ASSEMBLY = defineCreature('animal-kinkajou', {
  /* NEW AND UNREVIEWED. Night Time has no collection record carrying colours for
   * this species, so these five are the first ever proposed for it. */
  palette: {
    coat: 0xc08b3e,    // UNREVIEWED: the golden brown, and the raised tail
    belly: 0xe4c184,   // UNREVIEWED: the paler gold underside, and the sclera
    limb: 0xa1702c,    // UNREVIEWED: the legs and the short muzzle, a shade under
    dark: 0x453a30,    // UNREVIEWED: the small nose, and nothing else
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's cube. The same 1.250 silhouette as `box-03`, worn because it is
   * the shell the other three panda parts were drawn against — which is what
   * makes their transfers exact rather than inferences — and because 12 extra
   * triangles count toward a FLOOR on an animal this light. The panda's own band
   * split is deliberately unused: it is a black-and-white bear's cut. */
  hull: 'box-36',

  /* The tiger's mammal line made exact — the only 1/16 point inside the pack's
   * own measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* The panda's own ear on the panda's own shell: the transfer recovers the
   * bank's recorded 1.343750 to 3.0e-5, and buries four fifths of it, which is
   * why a kinkajou's ears barely break its outline. Not `box-02` — the same box
   * to the millimetre, but the dormouse's, and 24 triangles cheaper on a species
   * that needs them. */
  ears: 'box-34',

  /* THE FACE. The pack's biggest eye card, unspent until now, at its own recorded
   * point on the absolute eye plane. Rule 5 makes stretching one unsayable, so
   * this is as big as a night animal's eye is allowed to get. */
  eyes: { part: 'plate-14' },

  /* The beaver's short barrel muzzle, entirely by the donor transfer — its centre
   * recovers the beaver's own recorded 0.710803 — painted a shade under the coat
   * so the short face reads on a golden head. */
  snout: 'tube-01',

  /* The panda's own small nose-tip, on the muzzle's placed front plane. 0.234
   * wide on a 0.312 face, so it is backed everywhere. */
  nose: { part: 'tube-08', paint: 'dark', on: 'snout' },

  /* THE ANIMAL. A prehensile tail is CARRIED, not trailed, and `chamfer: true` is
   * the whole of saying so: the builder solves this shell's own +y/-z chamfer
   * midpoint (0.46875, -0.46875) and the 45-degree turn onto its outward normal
   * together, and refuses either given by hand without the other. Sunk the cat's
   * and the monkey's own mean 0.159043; nothing about it is chosen. Five other
   * assembled species wear one of the bank's two thin ropes and every one of them
   * trails it; this is the only one that goes up. */
  tail: { part: 'wedge-07', chamfer: true },
})
