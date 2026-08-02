/**
 * Home Pets — the animals a child might actually keep, as build data.
 *
 * PB-036 phase 2, roster row 7, ship 2 (Joe's own proposed order puts this
 * second, behind Garden), name band `short`. `registry.ts:16-23` states the
 * recipe this file follows: one `Species` record per member, each with a `build`
 * its kit understands, and every printed name pulled out of the roster by
 * `defineSpecies` so a typo is a thrown error at module load rather than a pet
 * called "Hamstre" forever.
 *
 * THIS COLLECTION IS COMPLETE — sixteen of sixteen, since 2 August 2026. It was
 * not, for most of its life, and the way it closed is worth keeping.
 *
 * It shipped at fourteen. PB-036 phase 3 built the songbird kit and with it the
 * four cage birds, which left two, and both were absent because their kits did
 * not exist (`kit.ts:66-74`) rather than because they were forgotten:
 *
 *     animal-corn-snake  -> legless; roster §1 puts the snake in `bespoke`
 *     animal-goldfish    -> swim kit, unbuilt
 *
 * NEITHER kit was ever built. Both animals left that list the only honest way,
 * by being BUILT on the route they were actually waiting for — the assembly kit,
 * which places bank parts one at a time and can therefore say "no legs" and "no
 * quadruped anything" without lying about the animal. Each carries `bespoke`, an
 * `assembly` and no `build`. The rule that governed the wait still governs: a
 * member is never forced onto a kit that would misdescribe it.
 *
 * `tests/island/species-home-pets.test.ts` keeps the invariant that outlived
 * both of them — that NO member of this collection resolves to a frozen pack
 * animal or to the wrong kit. The day someone rebuilds the goldfish as a
 * quadruped the suite says so. `registry.ts:11-14` — "do not finish this file"
 * — applied here until the day it was finished properly, and the assertion that
 * replaced it is stronger, not weaker.
 *
 * NO THREAT STATUS IS RECORDED. Same reason as `registry.ts:55-76`: roster §5
 * wants facts that are "true, checkable", and `Threat.checkedDate` exists so a
 * status is a dated reading of the Red List rather than a memory. None of these
 * ten has been read off the Red List, so none carries a status. An absent status
 * means "not checked yet", which is honest; a remembered one only looks checked.
 *
 * ---------------------------------------------------------------------------
 * THE HARD PART OF THIS COLLECTION IS THE SIX RODENTS.
 *
 * Hamster, guinea pig, gerbil, chinchilla, rat and degu are six small brown-ish
 * rodents in one album page, and roster §4's warning about confusable
 * silhouettes applies to them even though it does not list them by name. Palette
 * cannot carry it — four of the six are some shade of sandy brown in life, and
 * making them different colours to tell them apart would be a lie a child can
 * check against a picture book.
 *
 * So the separation is carried by PART CHOICE first, because that is what
 * survives being seen at 0.16 scale from the island's three-quarter camera, and
 * the tails genuinely differ in the real animals:
 *
 *     hamster     stub    round     a Syrian hamster's tail is a nub
 *     guinea pig  none    round     the only tailless rodent here, and famously so
 *     gerbil      tuft    pointed   thin, furred, with a brush on the end
 *     chinchilla  bushy   round     the squirrel-thick tail, and huge ears
 *     rat         thin    round     bare and long; the one everyone can name
 *     degu        tuft    round     tufted like a gerbil's, but a bigger animal
 *
 * Gerbil and degu are the one genuine tail collision, and they are separated by
 * the ear (a degu's are big and round, a gerbil's are small and folded back) and
 * by size — a degu is roughly rat-sized and a gerbil is not. Every pair is then
 * separated a SECOND time by proportion, with real margins, and the test asserts
 * both halves rather than trusting this comment.
 * ---------------------------------------------------------------------------
 * THE SECOND HARD PART IS THE FOUR CAGE BIRDS, AND IT IS HARDER.
 *
 * Budgie, canary, cockatiel and lovebird are four small perching birds on one
 * album page, three of them parrots, and there is a fifth bird in the same game
 * they must not read as either: `animal-parrot`, one of the frozen Kenney 24
 * (`registry.ts:55`), 1.55 tall and the shortest of the pack. Roster §4 does not
 * list this group — it predates the songbird kit — but it is precisely the
 * failure §4 describes, and a child who hatches a budgie and then a lovebird has
 * to see two animals or the album is a lie.
 *
 * So all six separable axes are spent, deliberately, and no two of the four
 * share a value on any of the part axes:
 *
 *     budgie     1.42  long/pointed  speckles+wing-bar   blue    slim, longest tail
 *     canary     1.24  fan/folded    none                yellow  smallest, roundest
 *     cockatiel  1.52  pointed/broad crest+cheek-patch   grey    biggest, the crest
 *     lovebird   1.34  short/tiny    collar              green   stub tail, big head
 *
 * Read down the columns: four heights spaced 0.10 apart or more, four tail
 * enums, four wing enums, four extras sets, four hues. The proportions are
 * separated a second time — `body` runs 0.58 (lovebird) to 1.20 (budgie) and
 * `head` runs 0.85 (budgie) to 1.28 (lovebird), which is the widest spread this
 * kit is asked for outside the heron — and the test asserts both halves.
 *
 * AGAINST THE FROZEN PARROT the lever is size and colour. Every one of the four
 * is SHORTER than the parrot's 1.55, the cockatiel by only 0.03 but wearing a
 * crest and painted grey, and none of the four is the parrot's saturated
 * red-and-green. A cockatiel genuinely is smaller than the parrot a child
 * pictures, so this costs no honesty.
 *
 * ON THE BEAK, stated once because it is the one thing in these four records
 * that is not what life says. Three of them are parrots and a parrot's beak is
 * hooked; `types.ts:172-180` withholds `'hooked'` on purpose, because a hooked
 * beak is the strongest read of a bird of prey and the raptor kit owns it. They
 * are built `'stout'`, which is the kit's finch-and-parrot beak: short, deep and
 * blunt. It carries "seed-eater" and it does NOT carry "parrot" — the downward
 * curve is the whole signature and a box cannot fake it. The canary is a finch
 * and takes `'short'`, which is both true and one more axis of separation.
 * ---------------------------------------------------------------------------
 *
 * ON THE NUMBERS. Every field except `height` is a multiplier off its kit's
 * reference silhouette — `kits/quadruped.ts:80-94`, which is fox-shaped, for the
 * ten quadrupeds, and `kits/songbird.ts:72-106`, which is a robin, for the four
 * birds. Two consequences worth stating once, because they explain nearly every
 * number below:
 *
 *   - THESE ARE CUBE PETS, NOT ANIMALS. The measured pack is 1.43-2.02 tall with
 *     a mean width/height of 0.97 (quadruped.ts:56-74). A hamster at true
 *     anatomical proportions is a stranger beside `animal-fox`, which roster §1
 *     forbids, so every rodent here is short-bodied, chunky and big-headed
 *     relative to life. `head` above 1 on the small rodents is doing exactly
 *     that work — it is also, per `types.ts:118`, "the single strongest read of
 *     what animal is this".
 *   - LENGTH IS CHARGED FOR. `pets.ts:652` makes the obstacle keep-out
 *     `max(width, depth) / 2`, and the kit's fit scales the whole rig up to
 *     `height` — so a long, low animal built by pushing `body` and dropping
 *     `legs` gets scaled up hard and walks around with a badger's keep-out.
 *     `quadruped.ts:104-110` says the same thing. The ferret is the animal that
 *     wants that treatment most and it is the one whose `body` is held back and
 *     whose `height` is dropped instead; the test measures the keep-out rather
 *     than taking this paragraph's word for it.
 *   - THE BIRDS COST ALMOST NOTHING, and that is measured, not assumed. The four
 *     cage birds run keep-out 0.54 (lovebird) to 0.83 (budgie) against this
 *     collection's ratchet of 1.28 (`species-silhouette.test.ts:88-93`, held by
 *     the ferret), so the widest thing on this page is still the ferret and the
 *     ratchet does not move. The budgie is the widest of the four because a
 *     `'long'` tail is swept up and BACK and depth is what the keep-out charges
 *     for; it is the one bird here whose depth, not width, sets its radius.
 */
import { defineSpecies } from '../define'
/*
 * Evaluated for its SIDE EFFECT, not for a name: each species module under
 * `parts/assembled/` registers its own build as it defines it, and
 * `defineSpecies` picks that up by id. Without this line the corn snake below
 * would find no assembly and would build as a bare hull.
 * `tests/island/assembly-constants.test.ts` fails loudly if it is ever dropped.
 */
import '../parts/assembled'
import type { Species } from '../types'

export const HOME_PETS_SPECIES: readonly Species[] = [

  /*
   * THE CORN SNAKE — the fifteenth, and the collection's first legless member.
   *
   * It has no `build` and no numbers here at all, which is the whole point: the
   * quadruped kit builds four legs unconditionally and clamps them at 0.25, so
   * it cannot say "snake" without lying about the animal, exactly as it could
   * not say "slow worm" for Garden. `bespoke` sends it to the assembly kit, and
   * `parts/assembled/animal-corn-snake.ts` carries every measurement with the
   * reason beside it — including why the coil is the slow worm's own transform
   * and why the saddles are not.
   *
   * Its palette is proposed there rather than agreed here, because this species
   * was never in this file to be given one. It is FLAGGED and Joe has not seen it.
   */
  defineSpecies('animal-corn-snake', 'bespoke'),

  /*
   * THE GOLDFISH — the sixteenth, and the one that CLOSES this collection.
   *
   * Like the corn snake it has no `build` and no numbers here, and for the same
   * reason: `bespoke` sends it to the assembly kit and
   * `parts/assembled/animal-goldfish.ts` carries every measurement with the
   * reason beside it. What differs is what it was waiting FOR. The corn snake
   * wanted a kit that could say "no legs"; this one was rostered against the
   * `swim` kit, which is declared in `types.ts`, has never been built, and turns
   * out not to be needed — every part of a fish this pack owns was donated by
   * the pack's own fish, and the assembly kit can place all of them.
   *
   * Its palette is proposed there rather than agreed here, because this species
   * was never in this file to be given one. It is FLAGGED and Joe has not seen
   * it — along with the tail, which is the LION'S standing in for a caudal fin,
   * because the bank has no fin, flipper or fluke at all.
   */
  defineSpecies('animal-goldfish', 'bespoke'),

]
