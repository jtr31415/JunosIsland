# How the animals are made

*Written 29 July 2026 for Joe, who asked: "i have no understanding of how the
asset data is put together. is there a way to split up the primitives of the
original animals?"*

*Short answer: yes, partly — and the part that splits up cleanly is exactly the
part you said was wrong. Everything below is measured off the 24 real files, not
recalled. The numbers are on the primitives bench in the workbench, one row at a
time, for you to tick or strike.*

---

## 1. What is actually on disk

There are two completely different kinds of animal in this game, and almost every
confusion about them comes from not knowing which one you are looking at.

**The live 24 are files.** `animal-fox`, `animal-cow` and the rest are `.glb`
files in `src/island/public/pets/`. A `.glb` is a small 3D scene in a box: a list
of corner points, a list of triangles joining them, a picture to paint on, and a
tree of named parts saying where each piece sits. Somebody at Kenney built them in
a modelling program and exported them. The game opens the file and shows what is
inside. Nothing about them is decided at run time.

**The 72 new ones are not files at all.** There is no `animal-hedgehog.glb`
anywhere and there never will be. Each new species is a short list of *numbers* —
how tall, how long the body, how big the head, which ears, which tail, four
colours — and a piece of code called a **kit** reads those numbers and assembles a
creature out of simple shapes while the game is running. That is why the workbench
viewer can show you a new animal seconds after an agent writes its record, and it
is why there is nothing to re-export when we change one.

The kits own a deliberately tiny vocabulary: a **box**, and a **lump** (a ball
squashed to a given width, height and depth). That is all. No cones, no cylinders,
no sculpting. The rule was written to stop six kits drifting into six different
looks, and it is the rule your "too square" is pushing against.

## 2. What is inside the originals, exactly

I had every one of the 24 files opened and counted. The whole pack contains
**nine part names across 133 pieces**:

| Part name | How many | What it is |
|---|---|---|
| `body` | 24 | one per animal |
| `leg-front-left` and its three siblings | 86 | the legs |
| `tail` | 8 | |
| `wing-left` / `wing-right` | 10 | |
| `Group` | 5 | oddments: cat whiskers, cow muzzle, pig snout, a spare crab cube, the parrot's crest and beak |

And now the thing that matters. **There is no part called head. Or ear, or
muzzle, or nose, or horn, or antler, or beak, or eye.** Not one, in the whole
pack.

That is because `body` is not a body. It is torso, head, ears, muzzle, nose,
eyes, horns, antlers, mane and shell **fused into a single lump of geometry**.
All 24 are different from each other and none can be taken apart at a seam,
because there is no seam. Getting a head out of the fox would mean cutting
triangles out of the middle of a mesh, not copying a labelled piece.

## 3. The good news, and it is very good

**The leg is one single shape, used 86 times.**

All 86 legs across 23 species are the *same 24 corner points* — bounding box
0.375 × 0.306 × 0.375 — sitting at different places. Kenney drew one leg, once,
and re-used it for every animal in the pack. It is centred on its own origin and
placed by nothing more than a move, which means it is **already exactly the kind
of reusable primitive you were asking whether we could split out.** It does not
need splitting out. It is already separate, already portable, and already
identical everywhere.

Tails and wings are nearly as good: **8 real tail shapes** (the fox's brush, the
lion's tuft, the beaver's paddle, the parrot's fan, and a rope shared by cat,
tiger and monkey) and **5 wings**.

So the pack does decompose — it just stops one step short of where a kit would
most like it to, at the body.

## 4. What that means for the animals you did not like

You named three things. Here is what each one turned out to be.

**"Feet and legs are too large."** The kits approximate a leg with boxes. The pack
has a real leg sitting right there, one buffer, used 86 times. We have been
imitating a part we could simply use. **The proposal on the bench is to stop
imitating it** — drop the pack's actual leg in wherever a kit draws a leg, and do
the same for tails and wings. That does not *tune* the problem, it removes it: the
legs stop being approximations and start being the same geometry as the fox's.

**"They are too square."** Measured, and there are two separate causes. I counted
4,354 corners across all 24 pets.

*Cause one: the edges are cut.* **72% of Kenney corners carry a single flat 45°
cut** — a chamfer, not a rounded fillet. 18% use two steps, and 9.7% are
genuinely sharp (mostly where one part is buried inside another, so "round
everything" would be as wrong as "round nothing"). The size of the cut is **not**
a fixed distance: it is about **0.20 to 0.25 of the part's own smallest
dimension**, and it lands on exact fractions — a sixth of the cross-section for
every leg, a quarter for the bodies. The whole pack is hand-authored on a 1/16
grid.

*Cause two, and it is the cheaper fix and probably the bigger one:* **the pack is
smooth-shaded, and our kits are not.** Every corner point in those files carries a
single averaged normal, so light bends across the cut and a hard 45° chamfer
*reads* as a soft round-over. The comment in our own primitives file
(`shared.ts:81`) claims the pack has a "chunky, flat-shaded read". That comment is
simply wrong, and it has been steering the kits since the first one was built.

There is a real cost question here and you should see it before ticking anything.
Using three.js's stock rounded box costs 108 triangles per part against 12 today —
about 1,300 triangles for a quadruped, which is *more* than a real Kenney pet
(they run 422–951 total). A hand-built 60-triangle chamfered box would match the
pack exactly and cost less. That trade is a row on the bench.

One more thing worth knowing, because it puts a limit on how close boxes can ever
get: **most Kenney parts are not boxes at all.** The bodies are sculpted shells of
190–418 triangles, the pig's snout is a twelve-sided cylinder, and the legs are
tapered octagonal frusta. The only true cube in the entire pack is the crab's
claw. This is the strongest argument for adopting the real limbs rather than
rounding our approximations of them.

**"The eye design is inconsistent."** This one has a single clean cause and it is
worth understanding, because it is the clearest example of a kit rule that was
wrong rather than merely untuned.

Every original's face is a **flat cut-out sheet floating exactly 0.01 units in
front of the head** — measured, in 24 files out of 24. There is no eye drawn on
the texture; the picture file has no face on it anywhere. The eye is polygons cut
into an eye shape and flat-shaded from two columns of the colour swatch. The pupil
is part of the same sheet. Only ten distinct outlines exist in the whole pack, and
32 of the 63 faces are literally the same 27-triangle mesh.

Crucially, **the pack's eye is an absolute size — always 0.400 × 0.320, on a face
plate that is 0.625 × 0.625 and identical in all 24 models.** A fox and an elephant
have the same size eye. Relative to the animal, eye size only ever varies by about
1.5×.

The kits made the eye **a fraction of the head** instead. Across the 72 built
species that produces a **2.95× spread** — the hippo's eye against the goose's is
that entire range, and you were looking at both on one screen. On top of that the
kit builds eyes as *protruding balls* with a second ball floating in front for the
pupil, and the bird kit puts them on the *sides* of the head, which no original
does — all 63 face directly forward.

So: not a taste problem. The kits made the eye a function of head size; the pack
made it a constant.

## 5. The choice in front of you

The recommendation is a **hybrid**, and the bench asks you about it row by row.

**Adopt the pack's real parts for limbs** — leg, tail, wing. Real geometry, real
Kenney shapes, no approximation.

**Keep body and head procedural** — permanently, and this one is a firm no rather
than a not-yet. There are 24 faces in the pack and the roster wants 296 species. A
child names an animal by its face. If we built from real bodies we would have 24
animals wearing each other's faces, which is worse than 296 honest approximations.

**One real constraint you should know before ticking anything.** Colour in these
files is welded to the geometry — a lifted fox tail arrives fox-orange. We *can*
re-point it, and that is proven shipped code rather than a hope: the game already
rewrites a named part's colours to a different column of the swatch sheet, for the
set variants. But the sheet has **8 hue columns**, so an adopted part gets about
**six usable colours, not any colour we like.** A procedural box can be any colour
at all. That is the price of using real parts, and it is the one thing that might
make you say no.

## 6. What happens next

Nothing is being re-tuned. No kit changes until you have signed off the primitives
it would be built from — that was your instruction and it is the right one, because
a kit re-tuned before the shapes are agreed is a kit that gets re-tuned twice.

The bench is the fifth tab in the asset viewer (`npm run workbench`). Each row
gives you the measured pack value, what the kits do today, the gap in one line,
and what we would change it to. Tick or strike, one at a time; you can close the
tab and come back. Your verdicts are carried across by row id, so an agent adding
a row later can never cost you one you have already given.

Eight rows are waiting for you: three about the face, two about the edges, and
three about adopting the pack's real limbs. The two to read first are
`edge-shading` — the cheapest fix on the bench — and `leg-adopt`, which is the
one that decides the whole approach. More rows may appear as further
measurements land; they will be added, never substituted, and they can never
cost you a verdict you have already given.

---

# Part two — taking them properly apart

*Written 29 July 2026, after you said: "on the primitives, most of them are not
that. here is what i expect: the original animals decomposed into their
constituent parts. we then use those parts to build new animals as far as we can,
either by new assembly or by adjusting a copy of a primitive. we should not create
our own primitives. they won't look right. is this doable?"*

*You were right to push, and part one was answering a smaller question than the
one you asked. Everything below is measured off the same 24 files. The headline is
that your instruction is not a new idea — it is how Kenney built this pack.*

## 7. There are two different ways to take a model apart, and we had only tried one

Part one counted **names**. A `.glb` file has a list of named parts, and this pack
has nine names: `body`, four legs, `tail`, two wings, and a `Group` for oddments.
On that count `body` is one thing, and one thing cannot be taken apart. That is
what part one told you, and it is why it concluded the head was stuck.

But a name is just a label somebody typed. Underneath, a part is a bag of
triangles, and those triangles can sit in **separate islands** that never touch —
like three stones in one bucket. The bucket has one label; there are still three
stones. Nobody had counted the stones.

We have now counted them, on all 24, twice over, with two different definitions of
"touching" so the number cannot be an artefact of how the file was exported.

**The 24 bodies contain 206 separate islands** — between 4 and 12 per animal,
9 being typical. The fox's `body` is five islands. The deer's is eleven.

(A first pass said 3,217. That number is wrong and it is worth knowing why: where
the colour wraps around a model the exporter splits a corner point in two, so the
triangles look disconnected when they are physically in the same place. Welding
points that sit at the same spot removes that illusion. 206 is the real count.)

## 8. The head does not come off. Not on one of them.

This is the single fact that decides everything, so here it is without hedging.

**In 0 of the 24 does the head separate from the torso.** Every animal has exactly
one big island — its shell — and that one island runs continuously from the tail
end to the nose end. There is no seam at the neck, on any of them, because there
is no neck.

So the axiom you stated is correct, and it is correct more strongly than you put
it: **head = body** is not a stylistic preference in this pack, it is the
topology. A Kenney pet is **one form** with things stuck on it.

And our kits do not do that. All three build a head as its own box and a body as
its own box and sit them next to each other — `quadruped.ts:229` and `:269`,
`raptor.ts:289` and `:372`, `songbird.ts:205` and `:268`. There is no place in
`src/island/species/` that merges them. **All 72 built species are two shapes
where every original is one.** That is a structural difference, not a tuning one,
and no amount of adjusting proportions closes it.

## 9. But nearly everything else does come off

The head being stuck is the bad news and it is the only bad news. Around that one
shell, the pack separates cleanly and generously.

**182 separable feature parts across about 25 kinds**, and every one of them was
identifiable — none were left as "don't know":

| Kind | How many | |
|---|---|---|
| eye card | 48 | two per animal, every animal |
| ear | 42 | |
| nose and nose-tip | 25 | |
| face plate, nostril card, flank marking | 20 | flat cut-out sheets |
| antler, ossicone, horn, crest, brow | 22 | deer, giraffe, cow, parrot |
| tooth, tusk, cheek | 8 | |
| claw, arm, side appendage | 10 | |
| torso band | 5 | the lion's mane, the panda's rump, the bee's abdomen |

So the real vocabulary is not nine parts. Counting properly, it is **about 25
kinds of part in roughly 200 instances** — and that is before the tails, wings and
legs that already had names of their own.

One thing that catches the eye and is worth saying: **on six of the 24, the
biggest piece of geometry is an ear, not the body.** A panda ear is 116 triangles
against a body shell of 72. If you sort the parts by size to find "the main one",
you get the ear. We now sort by how much space a part occupies instead.

## 10. The thing we did not expect: Kenney already builds them your way

This is the finding that changes the answer to your question.

**The body shell is exactly the same cube in 13 of the 24 animals.** Not similar —
identical: 1.250 by 1.250 by 1.250, 60 triangles, 120 corner points, the same mesh
reused. Across the whole pack there are only **10 distinct body shells**, not 24.

The giraffe's body is that cube. So is the elephant's. What makes a giraffe a
giraffe in this pack is not its body — it is the ossicones on top and where the
legs and neck features sit.

Read that back against your instruction. *"The original animals decomposed into
their constituent parts. We then use those parts to build new animals, either by
new assembly or by adjusting a copy of a primitive."* **That is a description of
how this pack was made.** Kenney drew one body, one leg, a handful of ears and
snouts, and made 24 animals by assembling and adjusting them. We are not proposing
a new method; we are proposing to stop ignoring the one already in the box.

It also means the ceiling I gave you in part one was wrong, and wrong in both
directions at once. I said "there are 24 faces in the pack". There are **10 body
forms**, which is worse — but the face is not the body, and the parts that make a
face **are** separable, which is very much better. Section 13 has the real number.

## 11. If we lift a part off one animal and put it on another, does it fit?

Mostly yes, and by design rather than luck. All 24 were built on one jig: the same
axes, the ground at zero on 20 of 24, the back of the animal at the same plane on
23 of 24.

**Parts of the face drop straight in.** The eye card sits at exactly the same
depth on every single animal — the measured spread across all 24 is **zero**. Not
"close": zero. Nostril cards and flank markings are the same. You can take an eye
off the koala, put it on a new animal at the same coordinates, and it is correct.

**Ears need placing by hand.** They are the one kind with no shared convention —
wherever we try to predict an ear's position, we are out by about a third of the
ear's own size. Not a problem, just work: an ear is placed, not dropped.

**Snouts need one adjustment**, in one direction only — side-to-side and height
carry over exactly, but how far forward a snout sits has to follow the depth of the
animal it is going on.

**Stretching is safe where the pack already stretches.** Ears vary by 3× across the
pack and snouts by nearly 3×, so scaling a copy stays inside what Kenney himself
drew. **Eyes and face plates do not vary** — 1.44× and 1.07× across all 24 — so an
adjusted copy of an eye is not a thing we should ever make. That is the same
finding as the eye row on your bench, arrived at from a completely different
direction.

**Nothing floats.** Every eared animal has its ear pushed *into* the body, by 0.125
at the very least. Parts overlap on purpose; we should keep doing that.

## 12. What happens to the colour, which is the real catch

Part one said a lifted fox tail arrives fox-orange and we can re-point it to about
six colours. That was right but it was not the whole problem, and the rest of the
problem is worse.

**39% of the liftable parts are more than one colour.** A head is not "brown" — it
is brown with a white muzzle patch and a pink nose, and those colours come from
different places on the shared picture. The minority colour is typically about a
third of the part. So when we re-point that part to a new colour, **both halves
move together to unrelated colours**, and the detail that made it read as a face
turns to mud.

Two things soften this. First, the machinery to re-colour part of a mesh rather
than a whole one **already ships** — `facedecals.ts:119-127` does it per stretch of
geometry. Second, and more usefully: your JT-029 ruling was *"we drop the colours,
only the sets in their natural colour."* If sets no longer recolour animals, the
six-colour limit stops being a wall for most of the roster.

## 13. So how many animals does this actually make?

Honestly, and counting only what a five-year-old could tell apart on sight:

**About 2,100 distinguishable creatures.** Of those, roughly **300 to 600 read as a
different animal** rather than as a variant of one. The raw number of combinations
is about 86 million, and quoting that would be a lie — most of those differ by a
number, not by anything a child would see.

That comes from the real inventory: 10 body shells, 16 distinct ears, 27 snout
parts, 9 pieces of headgear, 5 eye shapes, 8 tails, 5 wings, 19 oddments — and
exactly **one leg**, which means legs add variety of precisely zero.

**So the ceiling I gave you before was wrong and I should correct it plainly.** I
told you 24 faces was the limit, because I believed the head was one lump. The
head *is* one lump, but the face is not part of it — eyes, ears, snouts and
headgear all come off separately. 296 species is reachable on geometry. It is
reachable with room to spare.

## 14. What the pack simply does not have

Three collections cannot be built from these parts at all, and no amount of
assembly changes that:

- ~~**Ocean (16)** — there is no fin, flipper or fluke in the pack. The fish's are
  fused into its shell.~~ **WRONG SINCE 4 AUGUST 2026, and struck through rather
  than deleted because this sentence did real damage.** Baking the `wing` role for
  the budgie brought `box-42`/`box-43` into the bank — provenance `fish:wing`, a
  handed mirrored pair, the pack's own fish's fins, no longer fused into anything
  — and `blade-06`, the penguin's wing, already is a flipper. Ocean was built out
  on 5 August: twelve animals and four priced placeholders. Nobody carried the
  correction back for a week because this line had already ruled the collection
  out, so nobody looked. **A claim about what the bank does not hold expires the
  moment a role is baked; date it, or it outlives its own truth.**
  `animal-goldfish.ts` still repeats the old claim in its header and still reaches
  for the lion's tail as a caudal fin on the strength of it — a live animal, so
  that is Joe's to change in the editor, not a doc fix.
- **Critters (16)** — no membranous insect wing, no segmented leg.
- **Dinosaurs (16)** — no frill, no plate, no spine.
- **Raptors (16)** — no hooked beak, no talon, no spread wing.

**Birds (18)** is partial: there are two beak designs in the whole pack, against a
list that wants a swan, a heron, a flamingo, a pelican and a toucan. **Legendary
(12)** and **Outback (16)** are near-total failures for the same reason.

Also missing, in case it matters later: no hoof, no trunk (the elephant's is fused
in), no shell or carapace, no long neck, no tentacle, no quill.

That is **64 of the 296 impossible** from lifted parts, **46 more only partly
served**, and **186 that this vocabulary can carry**. We have not invented any of
the missing parts and we will not; you asked for that explicitly and it is the
right rule.

## 15. Your four axioms, checked against the files

- **"Head = body."** **Confirmed, 24 of 24.** Nothing separates at the neck. Our
  kits break this on all 72 built species.
- **"All eyes are flat."** **Confirmed, 48 of 48.** Every eye has exactly zero
  thickness — not nearly zero, zero. Of the 315 parts in the whole pack, not one
  forward-facing sheet has any depth at all. Our kits build eyes as protruding
  balls with a second ball in front for the pupil.
- **"All legs under the body."** **Confirmed, 23 of 23.** All 86 legs sit at one of
  six positions, always at the same height, always inside the body's footprint with
  0.375 to spare. Worth knowing: legs are deliberately **sunk into the belly** — by
  0.225 on the lion — so "under the body" means under its middle, not under its
  bottom edge.
- **"Two sclera shapes, an oval and a round one."** **Refuted as stated, but right
  about the look.** There are **five** eye outlines, not two: an oval (0.400 ×
  0.320, on 16 species), a round one (0.400 × 0.400, on 5), and one-off shapes for
  the cat, the caterpillar and the panda. But your two families cover **42 of the
  48 eyes on 21 of the 24 animals**, and all three exceptions sit *between* the two
  you named. So as a rule for building, two shapes is very nearly the truth.

These four are now locked as tests over the real files —
`tests/island/pack-axioms.test.ts`, 16 tests and 52 assertions, run against the 24
`.glb`s themselves rather than a copied table, so a future measurement cannot
quietly contradict them.

## 16. So: is it doable?

**Yes — for 186 of the 296, from real parts, with no invented geometry.** 64 are
impossible from this pack and 46 are partial. Those numbers are honest and they
are the answer to your question.

But it costs something, and you should see the bill before you decide.

The 72 species that exist today are built the wrong way round — two shapes where
the pack has one, ball eyes where the pack has flat cards, approximated legs where
the pack has a real one. **Building your way means those 72 are rebuilt**, not
tuned. The species records themselves (the numbers: proportions, palette, which
ears) largely survive; what gets replaced is the machinery underneath them.

Nothing has been rebuilt and nothing has been deleted. That call is yours and it
is sitting on `JT-032` with the rest of the primitives sign-off.

## 17. Go and look at one

Reading measurements about geometry is a poor substitute for seeing it. There is
now an **anatomy view** in the asset viewer that takes a real original apart on
screen — every part pulled away from the middle on a slider, with a label against
each one saying what it is, how big it is, and how many triangles it has.

The labels are marked two ways, and the distinction matters: **Kenney's own names**
are shown plainly, and **names we invented** are shown differently and say so. The
file calls something `body`; *we* call the island inside it a "nose". You should
always be able to tell a measurement from an opinion.

Start on the fox — five parts inside its body plus four legs and a tail. Then
switch to the deer, which comes apart into eleven and shows you antlers as real
separable objects, and to the panda, whose ears are bigger than its body.
