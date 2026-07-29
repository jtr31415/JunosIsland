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
