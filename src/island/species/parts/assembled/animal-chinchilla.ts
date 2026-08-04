/**
 * The chinchilla's assembly, as a definition — **Home Pets' ear animal**, and the
 * species that carries the six-rodent separation.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## THE EARS ARE THE SEPARATION. DO NOT TRIM THEM.
 *
 * `collections/home-pets.ts` states the problem in its own header: hamster,
 * guinea pig, gerbil, chinchilla, rat and degu are **six small rodents on one
 * album page**, and colour cannot tell them apart because *"four of the six are
 * some shade of sandy brown in life, and making them different colours to tell
 * them apart would be a lie a child can check against a picture book."* So the
 * separation is carried by PART CHOICE, and this animal's share of it is the one
 * entry the other five cannot take: **the biggest ears in the bank, worn at full
 * size**. The collection's own row for this species reads "bushy / round — the
 * squirrel-thick tail, **and huge ears**".
 *
 * Two things follow, and they are addressed to whoever edits this file next:
 *
 *   - **`box-25` is SPENT by this species inside Home Pets.** Any other rodent on
 *     that page wearing it makes two of six unreadable at 0.16 scale, which is
 *     precisely the failure roster §4 exists to prevent. The degu is the one at
 *     risk — the collection header describes its ears as "big and round" — and the
 *     degu's separation is assigned to proportion and its pale eye-ring, not to
 *     this shape.
 *   - **Nothing here may be made smaller to buy width, height or triangles back.**
 *     The ear is 0.742676 across on a 1.250 hull — 0.594 of the body's whole width
 *     — and the pair spans 1.9426, which is 1.55x the hull. That width IS the
 *     animal. If this species ever has to give something up, it gives up the tail,
 *     the muzzle or the nose, in that order, and never the ear.
 *
 * This is also **the only naturally grey one of the six**, so colour is a free
 * second axis here where it is a lie everywhere else on the page: a standard
 * chinchilla is blue-grey with a white belly, and no sandy-brown sibling wants
 * that. It is taken, and it is taken honestly.
 *
 * ## THE EAR, MEASURED — and why it is not stretched
 *
 * **`box-25`, the koala's dish.** Measured over every one of the bank's 23 ear
 * shapes:
 *
 *   - **It is the biggest, by bounding volume: 0.19194**, against the bunny's
 *     upright `box-06` at 0.13462 — **1.43x** — and the beaver's round button
 *     `box-02` at 0.02034, which is a *ninth* of it. `animal-fennec-fox.ts` calls
 *     `box-06` "the biggest ear in the pack by a distance" and is right, on
 *     HEIGHT (0.913298). This is right on VOLUME and on roundness. The two claims
 *     are on different measured axes and neither has to give way.
 *   - **It is the only LARGE round one.** Three ears in the bank record
 *     `symmetry: 'radial'` — `box-25`, `box-02` and `box-05` — and the other two
 *     are 0.315 and 0.2206 across, each **less than half** this one's diameter.
 *     Its x and y are equal to six decimals (xy-ratio 1.000000) and its `taper` is
 *     **1.000**, so it does not narrow along its own axis: a DISC, not a cone.
 *     Round, and nearly the size of the head, is the whole of what a child names a
 *     chinchilla by, and this is the one shape in the pack that says it.
 *   - **It is already thin.** Aspect `[1, 1, 0.46857]` — 0.347996 thick against
 *     0.742676 across, so it is under half as deep as it is wide before anything
 *     is done to it.
 *
 * **A `stretch` was considered and is REFUSED, and this is the measurement that
 * refuses it.** `stretch` is legal on an ear (§3 measured the pack's own ears
 * varying 2.97x, which is why), and the obvious reach was to thin the dish
 * further and round it more. It buys nothing that is not already there: the
 * roundness is exactly 1.000 and cannot improve, and the thinning is a
 * NON-UNIFORM stretch, which is the one thing Joe currently has three unruled
 * examples of in front of him (`animal-goldfish.ts`, `animal-corn-snake.ts`,
 * `animal-crocodile.ts`). Spending a fourth on an ear that measures right at its
 * authored size would cost his review and buy the animal nothing. A UNIFORM
 * stretch was considered too and refused for a different reason: it would put the
 * ear's crown above the hull and make the height a tuned number, where at the
 * koala's own size the animal's height is the pack's own.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube, the legs are the leg row.** Neither is mentioned
 *     below, because both are what `defineCreature` gives a definition that says
 *     nothing: `box-03` at the pack's own `[0, 0.80625, 0]`, and four `box-01`
 *     sunk 0.408163 on the row at y = 0.18125 that never moves, at the default
 *     0.27 x 0.25. The cube is chosen and not merely defaulted to: **the koala,
 *     the beaver and the giraffe all wear their own parts on this same 1.250
 *     shell**, so every transfer below is a recovery on the donor's own hull
 *     rather than a carry-over between two — and this file therefore contains not
 *     one hand-chosen coordinate.
 *
 *   - **THE EARS ARE A PURE DONOR TRANSFER.** `box-25`'s measured attachment is
 *     `x +1` — the head's SIDE. Only two shapes in the ear bank mount there at
 *     all: this and the elephant's flap `tube-04`/`tube-05`, which is a third of
 *     its volume and is `animal-bushbaby.ts`'s; every other ear stands on the top
 *     face or points forward. So the join is at this cube's side face
 *     x = 0.625, and the two coordinates the join does not move are the bank's own
 *     recorded y = 1.056956 and z = 0.126002. Sunk the koala's own measured
 *     0.533662, which on an extent of 0.742676 buries **0.396338** — more than
 *     three times §3's 0.125 floor, so nothing floats — and the centre lands back
 *     on **the bank's own recorded x = 0.600000**, recovered off a join that never
 *     used it, which is §8's evidence that the transfer is legitimate rather than
 *     a guess.
 *
 *     **Band 1 is Kenney's own inner disc**, 10 of the 92 triangles. Painted
 *     `inner` that is a two-tone ear for one `byBand` entry and no geometry at all
 *     — §4's first way, the pack's own.
 *
 *     **What the ears cost is WIDTH and not height**, and it is worth stating
 *     because it looks the other way round: the dish tops out at
 *     1.056956 + 0.371338 = 1.428294, which is 0.003 UNDER the bare cube's own
 *     1.43125, so a pair of ears three fifths of the body's width adds nothing to
 *     the silhouette's height. `animal-opossum.ts` measured the same thing on the
 *     same shape. The height below is the tail's.
 *
 *   - **THE EYES ARE `plate-14`, THE PANDA'S — the biggest card in the pack — AND
 *     ITS BANDS ARE THE OTHER WAY ROUND.** 0.435472 x 0.442601 against the default
 *     oval's 0.400 x 0.320208. On `plate-01` band 15 is a small PUPIL and band 3
 *     the sclera around it; on this card it is inverted — **band 15 is 40 of its
 *     57 triangles and spans the whole card, and band 3 is a 17-triangle patch off
 *     centre and high**. The builder always sends band 15 to `PACK_PUPIL`, so this
 *     card builds a **nearly all-dark eye with one pale glint in it**, which is
 *     exactly the huge dark eye of a crepuscular rodent — for no geometry, no
 *     stretch and no new mechanism. The derivation is `animal-fennec-fox.ts`'s and
 *     is not re-argued here. `sink: 0`, absolute z = 0.6350, no stretch: rule 5 is
 *     not obeyed here, it is unsayable here.
 *
 *   - **THE TAIL IS `wedge-03`, THE BEAVER'S, AND IT IS SHORT AND THICK.** §7
 *     splits the seven tails on THICKNESS rather than length, and this is one of
 *     the three THICK ones at 0.726 across — but it is the shortest-reaching of
 *     the three, 0.588533 against the parrot fan's 0.642124 and the fox brush's
 *     0.910248, and by bounding volume it is **0.368 against the brush's 0.616**.
 *     A chinchilla's tail is about a third of its body and bushy; a squirrel's is
 *     its whole body. That is the distinction, and it is a measurement.
 *
 *     It is a pure donor transfer and chooses nothing: its own `z -1` facing, its
 *     own 0.294300 burial, no spin, no `at`. **The beaver wears it on `box-03`**,
 *     so joining at this cube's rear face z = -0.625 recovers the bank's recorded
 *     **z = -0.746061 exactly**, and the beaver's own y = 1.050919 comes with it
 *     untouched. That height is a gift: it puts the tail's crown at 1.482015,
 *     0.051 ABOVE the line of the back, which is a tail carried UP — which is how
 *     a chinchilla carries its own, and the number was the beaver's, not ours.
 *
 *     It is also the pack's ONE RODENT's tail, on a rodent.
 *
 *   - **`box-23`, the fox's brush, was CONSIDERED AND REFUSED**, and it is
 *     recorded here so nobody helpfully puts it back on the strength of the
 *     collection header's word "bushy". It is the bank's only round-sectioned tail
 *     (y and z both 0.910248) and §7 measured it at 1.67x the volume of any other
 *     — and that is the objection, not the recommendation. At 0.616 of bounding
 *     volume it is **3.2x the ear's own 0.192**, so the animal whose headline is
 *     its ears would walk around behind the biggest tail in the game. The rule
 *     this species is built under is that nothing may out-read the ear.
 *
 *   - **The muzzle is `tube-07`, THE GIRAFFE'S, and nothing had spent it.**
 *     0.532 x 0.300 x 0.266 — the broad end of the nose family, and the widest
 *     muzzle that is still nearly buried: its measured sink is 0.375940, so joined
 *     at the front face z = 0.625 its centre lands on **z = 0.658000, the bank's
 *     own recorded offset**, and it stands only 0.166 proud. A chinchilla's face
 *     is BROAD and BLUNT — a wide whisker pad and almost no projection — and that
 *     is a shape statement no sibling rodent on this page makes: the mouse, the
 *     squirrel, the bushbaby and the fennec all wear the beaver's little barrel
 *     `tube-01`, which projects further and is 0.586 as wide.
 *
 *     Painted from the PALE slot, because a chinchilla's muzzle and chin are the
 *     same white as its belly. `tube-07` carries one atlas band over all 28 of its
 *     triangles, so it is one colour whatever is done to it.
 *
 *     `pets:creature` marks it **`sunk 0.100 THIN`**, which is right to print and
 *     wrong to read as a fault — the same note `animal-vole.ts` and
 *     `animal-fennec-fox.ts` both carry. 0.1249 is §3's floor for an EAR, and this
 *     is the giraffe's own measured burial of its own muzzle, so it is the pack's
 *     number and not a shortcut. Said out loud here so nobody has to re-derive
 *     that it was looked at.
 *
 *   - **The nose is `blade-01`, THE BEAVER'S OWN, unspent**, on the muzzle's own
 *     placed front plane. It is anchored with `on: 'snout'` rather than by an
 *     arithmetic this file would otherwise carry a copy of: the builder puts it on
 *     z = 0.791000, so a nose that floats or buries cannot happen quietly. A flat
 *     broad plate 0.4 x 0.2598 on a 0.532 muzzle, which is the pack's one rodent's
 *     nose on a rodent, and it is deliberately not `wedge-10` — measurably the
 *     better nose tip, and it reads as a TONGUE, which Joe ruled on by name on the
 *     hedgehog.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: no second shape, no split
 *     triangle, no geometry at all. 0.5 is the tiger's own mammal line made exact
 *     — the only point on the pack's 1/16 grid inside the 0.4808-0.5481 zone
 *     Kenney's split-triangle boundary wanders across — and it is also this hull's
 *     own equator. A standard chinchilla is slate above and white below and the
 *     line sits about there.
 *
 * ## WHAT THE BANK CANNOT SAY ABOUT THIS ANIMAL
 *
 * Two of the six things a child would name a chinchilla by are not expressible,
 * and both are recorded rather than faked. Neither is flagged, because neither is
 * the animal — the ears are, and the ears are said in full.
 *
 *   - **THE WHISKERS.** A chinchilla's whiskers are a third of its body long and
 *     hair-thin, which at this scale is roughly 0.5 long by 0.005 thick — 1:100.
 *     `animal-badger.ts` already measured the ceiling on thin things: **no card in
 *     the bank is thinner than about 1:2.5**, and the only two zero-thickness dots
 *     are `plate-12` (0.08 x 0.08) and `plate-16` (0.113 x 0.113), which are
 *     square nostrils. `bespoke-circle-01` stretched to a rod was considered and
 *     refused twice over: it is a twelve-sided chamfered prism and six of them
 *     would cost more triangles than the rest of the animal put together, and at
 *     the island's 0.16 pet scale a 0.005 rod is well under one pixel, which
 *     rule 10 answers on its own.
 *   - **THE OUTSIZED HIND FEET.** The bank holds **one leg shape**, `box-01`,
 *     used 86 times across 23 species, and `CreatureDef.legs` is a single ROW —
 *     there is no per-station size and no way to say "the back two are bigger".
 *     Two extra copies doubled onto the rear stations were considered and refused:
 *     at pet scale a near-miss reads as SIX LEGS, which is a worse error than
 *     small feet. **JT-044's two-tone leg was also considered and refused**, and
 *     this is the more interesting refusal: a pale patch on the leg is entirely
 *     available and would look fine, but it says "pale foot" and the animal's
 *     feature is a BIG foot. Painting size is the kind of fake `animal-badger.ts`
 *     refused for its face stripes, and it is refused here for the same reason.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * `collections/home-pets.ts` carries no colours for this species — its record is
 * one line — so these five are the first ever proposed for it and every one is
 * UNREVIEWED. They are the one place on this animal where a sibling builder is
 * free to disagree; the shapes above are not.
 *
 * **No flag.** Nothing was strained: **482 vertices** against the pack's 405-1626
 * (354 in the body against 236-1114), **679 triangles** against 422-951, height
 * **1.4820** inside 1.43-2.02, keep-out **0.9746** against the fox's own 1.154,
 * every part joined at a face its donor joined its own to, every sink the pack's
 * own measured value, one mass, no stretch anywhere on the animal, nothing
 * authored, and not one hand-chosen coordinate in the file.
 *
 * The keep-out is worth one line because of how narrowly it is decided: the ears
 * make this animal **1.9426 wide** and the muzzle and the tail make it **1.9492
 * deep**, so depth wins by 0.0066 and `pets.ts:652`'s `max(width, depth) / 2`
 * charges for the tail rather than for the ears. Trimming the ear would not buy a
 * millimetre of it back.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const CHINCHILLA_ASSEMBLY = defineCreature('animal-chinchilla', {
  palette: {
    coat: 0x8d949c,
    belly: 0xf3f1ec,
    inner: 0xb28f8f,
    limb: 0x5b6068,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  belly: 0.5,
  eyes: { part: 'plate-14' },
  ears: { part: 'box-25', paint: { base: 'coat', byBand: { 1: 'inner' } } },
  tail: { part: 'wedge-03', paint: 'limb' },
  snout: { part: 'tube-07', paint: 'belly' },
  nose: { part: 'blade-01', paint: 'limb' },
})
