/**
 * The Farm collection — roster row 12, `ship: 5`, name band `short`.
 *
 * PB-036 phase 3. `roster.ts` says which species exist; this file says what all
 * SIXTEEN of Farm's sixteen ARE, as build data. Nothing here builds geometry —
 * every number is a multiplier off the one reference silhouette in its kit, so
 * retuning the whole collection is an edit to a `REF` and not to this file.
 *
 * SHIPS COMPLETE — 16 OF 16, WITH NO HOLE IN IT. Every collection built before
 * this run ships partial: Garden waits on `bespoke`, Home Pets on songbird and
 * swim, Woodland on two game birds, Africa on a raptor. Farm is the first
 * collection whose ENTIRE membership was buildable the moment the songbird kit
 * landed — nine quadrupeds and seven songbirds — which is why it was written as
 * one piece, and `tests/island/species-farm.test.ts` asserts 16 of 16 outright
 * rather than counting.
 *
 * Not necessarily the only complete one by the time you read this: PB-036 phase
 * 3 ran three agents in parallel and Woodland's two game birds were being built
 * on the same new kit while this file was written. The claim made here is Farm's
 * own completeness, not primacy. Either way it is the moment
 * `species-registry.test.ts`'s "no collection is 100% shipped" claim stops being
 * true — that test's own comment says it goes red the day a second kit lands —
 * and JT-030 (may a collection unlock with a hole in it?) stops being the
 * blocking question for at least one collection.
 *
 * WHY THE NUMBERS ARE STOCKIER THAN THE ANIMALS. Same reason the other three
 * collections give: all 24 live GLBs were measured (the `REF` comment in
 * `kits/quadruped.ts`) and the pack is 1.43–2.02 tall, mean 1.65, mean
 * width/height 0.97. A shire horse at true anatomical proportions beside
 * `animal-fox` is a stranger, which roster §1 forbids. So this collection's
 * horse and its quail differ by far less than reality — 2.30 against 1.30 — and
 * that is correct for this pack.
 *
 * THE COROLLARY THAT COST THREE COLLECTIONS A RETUNE, and which bites Farm
 * harder than it bit Woodland. The quadruped kit's `>>> <<<` block states it:
 * the fit is UNIFORM and solves for `height`, so dropping `legs` lowers the raw
 * silhouette, RAISES the fit scale, and stretches the body in world units.
 * "Long and low is free" is false. Farm's heavy animals are also its tall ones —
 * an ox and a water buffalo are wide AND big — and height multiplies the whole
 * rig, so the keep-out (`pets.ts:652`, `max(width, depth) / 2`) is charged twice
 * over. Every number below is tuned against the MEASURED keep-out, and the
 * collection's worst is the water buffalo at 1.379 with the horse just behind it
 * at 1.371, inside the 1.6 ceiling with real room to spare. Those two are what
 * Farm's ratchet is set from, at 1.38.
 *
 * The single most expensive thing measured while tuning this file: `snout` on a
 * big-headed animal. A water buffalo wearing one measured 1.59 against 1.38
 * without — the snout is a two-box taper standing forward of the
 * muzzle and every unit of it is depth the keep-out charges for. That is why the
 * buffalo has no snout and the goat, whose head is 0.86, can afford one.
 *
 * The second half of the kit's block bites the equids: `ears: 'long'` inflates
 * the pre-fit height, so the donkey and the mule silently measure SLIM. Both
 * were checked against the W/H floor of 0.5 rather than assumed; the donkey is
 * the narrowest quadruped here at 0.60 and the mule at 0.70.
 *
 * WHY THERE ARE NO `threat` RECORDS. Roster §5 wants statuses "true,
 * checkable", and `Threat.checkedDate` exists so a status is a dated reading of
 * the Red List rather than a memory. Writing categories here from recall would
 * produce records that LOOK checked. Absent means "not recorded yet", which is
 * honest; `registry.ts` holds the same line for the base 24.
 *
 * ROSTER §4 IS THE WHOLE JOB HERE. Farm is the densest collection in the roster
 * for look-alikes, and four of its groups reach OUTSIDE this file into species
 * that cannot be edited:
 *
 *   - FOUR EQUIDS. horse / donkey / mule here, plus `animal-pony`, already built
 *     in `home-pets.ts` (1.95, `legs: 1.55`, pointed ears, tuft tail, mane and
 *     snout, chestnut). Plus `animal-zebra` in Africa (2.10, mane, chalk-white).
 *   - THREE BOVINES. ox / water buffalo here, plus `animal-cow`, one of the
 *     FROZEN base 24 — and, discovered while writing this file, `animal-buffalo`
 *     in Africa (2.15, horns, round ears, tuft tail, near-black 0x413a36), which
 *     is the Cape buffalo and is a fifth animal in the same shape. See the water
 *     buffalo's own note: that pair is the one I would put in front of Joe first.
 *   - TWO CAMELIDS. llama / alpaca, separated on height, leg, face and fleece.
 *   - THREE GALLIFORMS. rooster / chicken here, plus `animal-chick`, frozen.
 *     Turkey, guinea fowl and quail are galliforms too and are held apart from
 *     the pair on size and marking rather than on anything the pair does.
 *   - ONE ANATID WITH A GHOST. The goose has to leave room for `animal-duck`,
 *     which is rostered in Birds and is NOT built yet. A goose that reads as a
 *     large duck today becomes a duplicate the day Birds ships, so it is built
 *     deliberately big (2.20, the tallest bird here) and long-necked (1.30),
 *     which is the separation a duck cannot later take away.
 *
 * Each separation is written down at the species it belongs to.
 */
import { defineSpecies } from '../define'
import type { Species } from '../types'

/** All sixteen of Farm's sixteen, in the roster's own member order. */
export const FARM_SPECIES: readonly Species[] = [
  /*
   * SHEEP — the collection's woolly one, and the kit has no fleece.
   *
   * So the fleece is spent twice over: `hump`, which the kit builds as a rounded
   * lump sitting proud of the back (`quadruped.ts`), reads as the fleece over
   * the shoulders and is the cheapest true read available; and the palette is a
   * cream coat with a DARK face and legs, which is what a child draws when they
   * draw a sheep. `legs: 0.52` is the shortest leg in the collection and
   * `body: 0.92` keeps it short and deep rather than long — a sheep is a barrel
   * on four pegs. `head: 0.78` is small: almost all of a sheep is fleece.
   *
   * Against the ALPACA, which also wears `hump` for its fleece: the sheep is
   * round-eared where the alpaca is pointed, 1.70 against 1.85, and its legs are
   * half the alpaca's (0.52 v 1.00). A sheep has no daylight under it.
   */
  defineSpecies('animal-sheep', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.70, body: 0.92, head: 0.78, legs: 0.52,
      ears: 'round', tail: 'stub', extras: ['hump'],
      palette: { coat: 0xf3ead7, belly: 0xfffdf6, detail: 0x3b3430, accent: 0x241f1c },
    },
  }),

  /*
   * GOAT — leaner than the sheep, horned, upright.
   *
   * The two are the pair a child meets side by side in the same field, so they
   * are separated on every axis at once: the goat stands on 0.92 legs against
   * the sheep's 0.52, carries `horns` which the sheep has not got, wears
   * `pointed` ears rather than round, and swaps the fleece lump for nothing at
   * all — a goat's read is a bare, angular animal. `head: 0.86` against the
   * sheep's 0.78 with a `snout` for the long straight face.
   *
   * Against the HORNED BOVINES below (ox, water buffalo) it is simply small:
   * 1.80 against 2.05 and 2.25, `head: 0.86` against 1.15 and 1.05, and it is
   * the only horned animal here with `pointed` ears and a `stub` tail.
   */
  defineSpecies('animal-goat', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.80, body: 0.98, head: 0.86, legs: 0.92,
      ears: 'pointed', tail: 'stub', extras: ['horns', 'snout'],
      palette: { coat: 0xd9c7a4, belly: 0xf6efdd, detail: 0x6b5a3f, accent: 0x2e2519 },
    },
  }),

  /*
   * HORSE — equid one of four, and the one that has to carry "big".
   *
   * Roster §1 offers "pony from horse" as a starting point and `animal-pony` is
   * ALREADY BUILT (`home-pets.ts`, 1.95). Its own comment says why it stopped
   * there: "a horse would want to break that ceiling and a pony must not". So
   * this is the animal that breaks it. 2.30 is the tallest quadruped in the
   * game — above Africa's hippo at 2.20, which called itself the biggest thing
   * in that collection — and still 0.30 under the clamp, because 2.6 is "at the
   * edge of the family" by the kit's own note. Against the pony that is a 0.35
   * gap, and the field scales every pet by the same 0.16 (`pets.ts:643`), so
   * height IS size on screen: these two stand next to each other and one is
   * plainly the big one.
   *
   * `legs: 1.70` is the leggiest thing in Farm and 0.15 above the pony's, which
   * is the other half of "bigger": a horse is tall because its legs are long,
   * not because its barrel is deep. `head: 0.82` is smaller than the pony's
   * 0.85 — a horse's head is small against its body and a pony's is famously
   * not. Palette is a DARK bay — near-black points, since the mane, the tail
   * brush and the nose all take `accent` — over a deep chocolate red-brown. It
   * started lighter and was darkened on measurement: against the pony's light
   * chestnut it was only 40 apart summed per channel, which is two horses of the
   * same colour, and it is now 127. Against `animal-zebra`'s chalk white the
   * separation was never in doubt.
   */
  defineSpecies('animal-horse', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.30, body: 1.08, head: 0.82, legs: 1.70,
      ears: 'pointed', tail: 'tuft', extras: ['mane', 'snout'],
      palette: { coat: 0x4a2f1e, belly: 0x8a6242, detail: 0x241810, accent: 0x120d09 },
    },
  }),

  /*
   * DONKEY — equid two of four, and the smallest of them.
   *
   * `ears: 'long'` is the whole animal and it is the one field neither the horse
   * nor the pony may have: the kit's long ear is a tall box laid back over the
   * skull (`quadruped.ts`), which is exactly a donkey from three metres. It
   * costs something, and the cost is documented — the kit's `>>>` block records
   * that long ears inflate the pre-fit height, so the uniform fit shrinks
   * everything else and a long-eared species measures SLIM. This one is the
   * narrowest quadruped in the collection at W/H 0.60, checked rather than
   * assumed, and above the 0.5 floor `species-silhouette.test.ts` holds — but
   * only by 0.10, which is why the donkey's legs stop at 1.05 and not higher.
   *
   * Everything else is "smaller than a horse, and rounder": 1.75 against 2.30,
   * `legs: 1.05` against 1.70, `head: 0.96` against 0.82 — a donkey's head is
   * genuinely big for its body, which is the opposite of the horse and is the
   * proportion a child notices. NO `mane`: a donkey's mane is a short upright
   * brush, not a horse's fall, and leaving the part off is both true and the
   * cheapest separation from the mule below. Mouse-grey with a pale muzzle.
   */
  defineSpecies('animal-donkey', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.75, body: 1.02, head: 0.96, legs: 1.05,
      ears: 'long', tail: 'tuft', extras: ['snout'],
      palette: { coat: 0x8d8b86, belly: 0xe8e4da, detail: 0x56534e, accent: 0x2f2d2a },
    },
  }),

  /*
   * GOOSE — the first of seven songbirds, and the one with a ghost to avoid.
   *
   * `animal-duck` is rostered in Birds and is NOT BUILT. Whoever builds it will
   * reach for `beak: 'flat'`, `webbed-feet` and `tail: 'short'`, because that is
   * what a duck is — and the songbird kit's own comments name the duck for all
   * three. So the goose cannot be separated from the duck by parts, and it must
   * not try. It is separated by SIZE and by NECK: 2.20 is the tallest bird in
   * Farm and `neck: 1.30` is the longest neck, which is a shape a duck can never
   * be given without becoming a swan. Build the duck small and short-necked and
   * the two are never confused.
   *
   * Calibrated against the kit's own swan (`kit-songbird.test.ts`: height 2.50,
   * body 1.50, neck 1.60, flat/short/broad, keep-out 0.92, W/H 0.552). This is
   * deliberately a step down from that in every one of those fields, because a
   * goose is a smaller, shorter-necked, heavier-bodied swan and the swan is a
   * real rostered species in Birds that this must also not become.
   *
   * A white domestic goose: `coat` white, `detail` orange (the kit paints the
   * beak and the legs with it) and `accent` a deeper orange, which is what the
   * `webbed-feet` paddles take. That orange bill on white is the read.
   */
  defineSpecies('animal-goose', 'songbird', {
    build: {
      kit: 'songbird',
      height: 2.20, body: 1.30, head: 0.72, legs: 0.80, neck: 1.30,
      beak: 'flat', tail: 'short', wings: 'broad', extras: ['webbed-feet'],
      palette: { coat: 0xf7f4ec, belly: 0xfffdf6, detail: 0xe08a2b, accent: 0xbf6510 },
    },
  }),

  /*
   * TURKEY — big, bulky, fan tail, wattle.
   *
   * The heaviest bird here and the only one that is BOTH big and short-necked:
   * 2.02 tall on `neck: 0.45`, where the goose is 2.20 on 1.30. `body: 1.25`
   * with `head: 0.66` is the whole silhouette — a turkey is a barrel with a
   * small bare head stuck on the front of it — and `wings: 'broad'` keeps the
   * mass out to the sides rather than in the depth the keep-out charges for.
   *
   * `tail: 'fan'` is the displaying tail, cocked hard upward by the kit so its
   * length is spent in height rather than in keep-out. `wattle` is the red lobe
   * under the beak and `ruff` is the breast feathering where the neck meets the
   * body; both take `accent`, which is why the accent is the one bright red in
   * the collection against a bronze-black coat.
   *
   * `height: 2.02` and not 2.00 for a reason worth stating, because it looks
   * like a fidget: the mule is 2.00, and `species-farm.test.ts` holds every
   * member to its own height on the ground that the field scales every pet by
   * the same 0.16 (`pets.ts:643`), so two species sharing a height are two
   * species that are exactly the same size on screen.
   *
   * Against the ROOSTER, the other wattled bird: the turkey is 0.12 taller, far
   * heavier (1.25 v 0.92 body), much smaller-headed (0.66 v 0.86), wears a fan
   * where the rooster wears the long arched tail, and carries no comb.
   */
  defineSpecies('animal-turkey', 'songbird', {
    build: {
      kit: 'songbird',
      height: 2.02, body: 1.25, head: 0.66, legs: 0.72, neck: 0.45,
      beak: 'stout', tail: 'fan', wings: 'broad', extras: ['wattle', 'ruff'],
      palette: { coat: 0x3b3129, belly: 0x6d5b45, detail: 0x8d8378, accent: 0xb8332a },
    },
  }),

  /*
   * LLAMA — camelid one of two, and the kit has NO NECK.
   *
   * That is the honest problem with putting a llama on the quadruped kit, and it
   * is not solved by inventing a part: `QuadrupedExtra` is closed for exactly
   * this reason (`types.ts`). What is available is height, leg and `mane` — the
   * kit's mane is a collar sitting behind the head (`quadruped.ts`), and on an
   * animal this tall and this small-headed it reads as the thick woolly base of
   * a neck rather than as a lion's fall. Combined with `height: 2.15` and
   * `legs: 1.35` and the smallest head in the collection at `head: 0.68`, the
   * silhouette that comes out is "tall, upright, tiny-headed", which is what a
   * llama is from across a field. `ears: 'pointed'` is the banana ear.
   *
   * `snout` is the long face, and it is the field that separates it from the
   * alpaca as much as the size does — an alpaca's face is short and blunt.
   */
  defineSpecies('animal-llama', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.15, body: 0.88, head: 0.68, legs: 1.35,
      ears: 'pointed', tail: 'stub', extras: ['mane', 'snout'],
      palette: { coat: 0xc9a06a, belly: 0xf2e3c9, detail: 0x7a5836, accent: 0x3a2a1a },
    },
  }),

  /*
   * ALPACA — camelid two of two: smaller, fluffier, shorter in the face.
   *
   * Every one of those three words is a field. Smaller: 1.85 against the llama's
   * 2.15, on `legs: 1.00` against 1.35 — a 0.35 gap in both, which is three
   * times the margin `species-farm.test.ts` calls a real difference. Fluffier:
   * `hump` instead of `mane`, so the fleece sits over the BACK where an alpaca's
   * actually is, rather than at the neck. Shorter in the face: `head: 0.88`
   * against 0.68 and NO `snout`, so the muzzle is the kit's plain short one.
   *
   * The palette is the third separation and the one a child will use: a soft
   * near-white fleece against the llama's warm tan, because the alpaca a child
   * meets is a cream one and the llama in every picture book is brown.
   */
  defineSpecies('animal-alpaca', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 1.85, body: 0.94, head: 0.88, legs: 1.00,
      ears: 'pointed', tail: 'stub', extras: ['hump'],
      palette: { coat: 0xe6dccb, belly: 0xfaf6ec, detail: 0x8f8271, accent: 0x4a4238 },
    },
  }),

  /*
   * ROOSTER — galliform one of three (with the chicken and the frozen
   * `animal-chick`), and the most decorated bird in the collection.
   *
   * The comb is `crest` — the kit builds it as three blades on the crown in the
   * accent colour, which is a cockerel's comb almost exactly — and the `wattle`
   * is the lobe under the beak in the same red. `tail: 'long'` is the arched
   * sickle, lifted hard by the kit so the length is spent in height, and
   * `tail-streamer` adds the two trailing feathers off the tail root. Three
   * extras is the ceiling roster §1 allows and this is the one species here that
   * needs all three: a rooster IS its decorations.
   *
   * `height: 1.90` on `legs: 1.05` and `neck: 0.35` is the upright stance — it
   * stands taller than everything in Farm except the goose and the turkey while
   * being a much lighter animal (`body: 0.92`).
   */
  defineSpecies('animal-rooster', 'songbird', {
    build: {
      kit: 'songbird',
      height: 1.90, body: 0.92, head: 0.86, legs: 1.05, neck: 0.35,
      beak: 'short', tail: 'long', wings: 'folded',
      extras: ['crest', 'wattle', 'tail-streamer'],
      palette: { coat: 0x9c3d1c, belly: 0xd88b3a, detail: 0xe8c25a, accent: 0xc4211b },
    },
  }),

  /*
   * OX — bovine one of three here, and one of FIVE in the game once Africa's
   * Cape buffalo and the frozen `animal-cow` are counted.
   *
   * What an ox is, and what nothing else in that group is, is the working
   * shoulder: `hump` sits the great mass of muscle over the withers where a
   * yoke rides, and it is the only bovine anywhere carrying it. `head: 1.15` is
   * the biggest head in Farm — an ox is mostly head and neck — on `legs: 0.92`,
   * so there is very little daylight under it. `body: 1.00` is not laziness: the
   * kit trades length for girth at roughly constant volume, so the low number is
   * what makes a short deep animal rather than a long one.
   *
   * Against `animal-cow` (frozen, roster §1, so every separation is one-sided):
   * the cow is the pack's black-and-white dairy animal, so this is a solid deep
   * red-brown with no white on it anywhere, it is horned where the frozen cow's
   * silhouette is not, and at 2.05 it is the bigger animal.
   * Against the WATER BUFFALO below: 2.05 against 2.25, `hump` against nothing,
   * a `tuft` tail against a `thin` one, `head: 1.15` against 1.02, and a warm
   * red-brown against a cold slate grey.
   */
  defineSpecies('animal-ox', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.05, body: 1.00, head: 1.15, legs: 0.92,
      ears: 'round', tail: 'tuft', extras: ['horns', 'hump'],
      palette: { coat: 0x7a3f26, belly: 0xb07a4e, detail: 0x4a2617, accent: 0x25150d },
    },
  }),

  /*
   * MULE — equid three of four, and by some distance the hardest animal in this
   * file. It is BETWEEN a horse and a donkey by definition, so every field wants
   * to be an average, and an average is exactly what reads as "one of the other
   * two, slightly off".
   *
   * The decision made instead: take the ears from the donkey and everything else
   * from the horse, which is both what a mule actually looks like and the only
   * combination neither parent owns.
   *   - Against the HORSE: `ears: 'long'` (the horse is `pointed`), 2.00 against
   *     2.30, `legs: 1.40` against 1.70, `head: 0.90` against 0.82.
   *   - Against the DONKEY: `mane` (the donkey has none), 2.00 against 1.75,
   *     `legs: 1.40` against 1.05, and a warm dun coat against mouse grey.
   *   - Against the PONY (`home-pets.ts`, 1.95, pointed, mane, chestnut): the
   *     ears again, and a taller, leggier animal at nearly the same height —
   *     which is why the ears have to be doing real work here.
   *
   * THE PALETTE IS THE THIRD PARENT PROBLEM and it was measured, not eyeballed.
   * The mule started as a second bay and sat 40 per-channel units from the horse
   * and 45 from the pony, which is three brown horses. It is now a pale mousy
   * dun — the colour a mule actually most often is — 214 from the horse's dark
   * bay, 87 from the pony's chestnut and 75 from the donkey's grey.
   *
   * `ears: 'long'` costs the same slimness it costs the donkey (see that record
   * and the kit's `>>>` block); measured, this one sits at W/H 0.70.
   */
  defineSpecies('animal-mule', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.00, body: 1.08, head: 0.90, legs: 1.40,
      ears: 'long', tail: 'tuft', extras: ['mane', 'snout'],
      palette: { coat: 0x9a7b58, belly: 0xd8c3a2, detail: 0x5d4835, accent: 0x2b2118 },
    },
  }),

  /*
   * CHICKEN — galliform two of three: smaller, rounder and plainer than the
   * rooster, which is the brief and is also the truth about a hen.
   *
   * Everything the rooster has, this has less of: 1.55 against 1.90, `legs: 0.68`
   * against 1.05 (a hen crouches, a cockerel struts), `neck: 0.15` against 0.35,
   * a `short` tail against the long arched sickle, and ONE extra — the small
   * `wattle` — against the rooster's three. No comb: a hen's is a fraction of a
   * cockerel's and leaving the part off is the cheapest honest difference there
   * is. `body: 0.86` is the round-ball end of the kit's range.
   *
   * Against the frozen `animal-chick` (roster §1, unbuildable, so one-sided):
   * the chick is the pack's tiny yellow ball of down. This is a full-grown buff
   * brown hen with a red wattle, a real tail and legs under it. The one thing to
   * hold is the COLOUR — a yellow chicken would be a big chick — so the coat
   * here is a warm russet-brown and the belly is a soft buff, nowhere near the
   * chick's yellow.
   */
  defineSpecies('animal-chicken', 'songbird', {
    build: {
      kit: 'songbird',
      height: 1.55, body: 0.86, head: 0.80, legs: 0.68, neck: 0.15,
      beak: 'short', tail: 'short', wings: 'folded', extras: ['wattle'],
      palette: { coat: 0x9a6234, belly: 0xd9b183, detail: 0xc9a05a, accent: 0xb03a2e },
    },
  }),

  /*
   * GUINEA FOWL — round, dark, SPECKLED, tiny head, and the easiest bird in the
   * collection to make unmistakable, because `speckles` exists and nothing else
   * in Farm wears it. The kit builds four lumps along the back in the accent
   * colour, so the accent here is a pale bone-white against a dark slate coat:
   * that is the guinea fowl's whole plumage at three metres.
   *
   * `head: 0.58` is the smallest head in the collection by a distance — a guinea
   * fowl's bare little head on a fat body is the shape people find funny about
   * it — and `cheek-patch` is the white face patch it really has, which doubles
   * as the second separation from the chicken. `body: 1.05` and `legs: 0.62`
   * keep it low and round.
   */
  defineSpecies('animal-guinea-fowl', 'songbird', {
    build: {
      kit: 'songbird',
      height: 1.62, body: 1.05, head: 0.58, legs: 0.62, neck: 0.40,
      beak: 'short', tail: 'short', wings: 'folded', extras: ['speckles', 'cheek-patch'],
      palette: { coat: 0x3f4750, belly: 0xdfe4e8, detail: 0x9a8f84, accent: 0xf0f2f4 },
    },
  }),

  /*
   * QUAIL — the smallest thing in Farm at 1.30, which is close to the kit's own
   * floor of 1.20 and well below the measured pack's smallest (1.43). That is
   * deliberate and it is the one place this collection leaves the pack envelope:
   * a quail beside a horse has to be tiny or the pair is a joke, and the album
   * page needs one animal a child can call "the little one".
   *
   * `plume` is the head plume, which the kit sweeps BACK over the skull so it
   * costs height rather than keep-out, and it is the quail's field mark. The
   * `eye-stripe` is the pale face striping — the kit's own comment calls it the
   * most useful marking it has, and on a small brown bird it is the difference
   * between "quail" and "small brown bird". `neck: 0`, `wings: 'tiny'` and
   * `body: 0.78` make the roundest silhouette in the collection.
   */
  defineSpecies('animal-quail', 'songbird', {
    build: {
      kit: 'songbird',
      height: 1.30, body: 0.78, head: 0.84, legs: 0.50, neck: 0,
      beak: 'short', tail: 'short', wings: 'tiny', extras: ['plume', 'eye-stripe'],
      palette: { coat: 0x8a7351, belly: 0xe4d3ac, detail: 0x4c3f2c, accent: 0xf4ead2 },
    },
  }),

  /*
   * WATER BUFFALO — bovine three of three here, and THE SPECIES IN THIS FILE I
   * WOULD PUT IN FRONT OF JOE FIRST.
   *
   * Not because of the ox or the cow, which it is clearly apart from, but
   * because Africa already ships `animal-buffalo` — the Cape buffalo — at 2.15,
   * `body: 1.00`, `head: 1.10`, `legs: 0.85`, `ears: 'round'`, `tail: 'tuft'`,
   * `extras: ['horns']`, coat 0x413a36. That is a big dark horned bovine with
   * round ears and a tufted tail, and so is this. They are two real animals that
   * genuinely look alike, in two different collections, and no test in the repo
   * compares them by eye.
   *
   * What is done about it here, all of it on this side because Africa's file is
   * not mine to edit: bigger (2.25 v 2.15), deeper-bodied (`body: 1.05` v 1.00,
   * which in this kit means SHORTER AND FATTER, not longer), lower to the ground
   * (`legs: 0.86` v 0.85 — near enough the same, and the one axis that failed to
   * separate them), a `thin` tail against the Cape buffalo's `tuft` — a water
   * buffalo's tail really is a bare rope with a small brush — and a cold
   * blue-slate grey against Africa's warm brown-black.
   *
   * WHAT IT DOES NOT HAVE, AND WHY. It wore `snout` for the huge wet muzzle
   * until it was measured: on a head this big the snout pushed the keep-out to
   * 1.59 against 1.37 without it, because it is a two-box taper standing
   * forward of the face and depth is what `pets.ts:652` charges for. The muzzle
   * was not worth two thirds of the collection's whole keep-out budget.
   *
   * KEEP-OUT: this is the widest animal in Farm at 1.379 — just ahead of the
   * horse at 1.371 — and it is therefore Farm's ratchet. `body: 1.05` at
   * `height: 2.25` is already a lot of animal: the fit is uniform, so the height
   * multiplies the length too, and 1.05 is where it stopped rather than where it
   * would have liked to be.
   */
  defineSpecies('animal-water-buffalo', 'quadruped', {
    build: {
      kit: 'quadruped',
      height: 2.25, body: 1.05, head: 1.02, legs: 0.86,
      ears: 'round', tail: 'thin', extras: ['horns'],
      palette: { coat: 0x515a60, belly: 0x8e979c, detail: 0x333a3f, accent: 0x1a1e21 },
    },
  }),

  /*
   * PIGEON — mid-small, plump, small head, short legs, and the plainest bird in
   * the collection on purpose: it is the one every child has actually met.
   *
   * `tail: 'pointed'` is named for the pigeon in the kit's own switch. The two
   * extras are the two markings a feral pigeon is identified by and both are
   * real parts: `collar` is the iridescent neck ring, worn in the belly colour
   * so it flashes pale against the slate body, and `wing-bar` is the pair of
   * dark bars across the folded wing. `head: 0.70` on `body: 1.00` is the small
   * head on a fat chest, and `legs: 0.52` is nearly the shortest in the
   * collection — a pigeon waddles low.
   *
   * Against the QUAIL, the other small brown-ish ground bird: the pigeon is
   * taller (1.48 v 1.30), longer-bodied (1.00 v 0.78), grey rather than mottled
   * buff, and wears a pointed tail and folded wings against the quail's stub
   * tail and tiny ones.
   */
  defineSpecies('animal-pigeon', 'songbird', {
    build: {
      kit: 'songbird',
      height: 1.48, body: 1.00, head: 0.70, legs: 0.52, neck: 0.25,
      beak: 'fine', tail: 'pointed', wings: 'folded', extras: ['collar', 'wing-bar'],
      palette: { coat: 0x6b737c, belly: 0xc3cbd2, detail: 0xd2626a, accent: 0x2c3238 },
    },
  }),
]
