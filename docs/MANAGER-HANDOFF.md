# Manager handoff

*Run 1, written 28 July 2026, evening. Read `docs/MANAGER-ORDERS.md` for the job.*

## Queue position

- **Item 1 (PB-042): IN PROGRESS — split, and the urgent half is SHIPPED AND LIVE.**
  - Half A, the override — **DONE, committed `58425b6`, pushed, deployed, verified
    in the live bundle.** This is the half Juno was stuck on.
  - Half B, the escalating price — **NOT COMMITTED.** All three numbers are
    settled and written down; see below for exactly where to pick it up.
- Item 2 (addition/subtraction ladder): NOT STARTED
- Item 3 (backlog sweep): NOT STARTED

## What this run did

Joe reported mid-run that the deployed build was *"erroneously forcing tile
building"* with Juno frustrated by it right now, so PB-042 stopped being a
tidiness card. I cut scope rather than the fix: shipped the half that unblocks
her and left the price for a second commit, which is what the drumbeat authorised.

The bug was exactly as the card described. `governors.ts` has said since slice 1
that the governors are *"INVITATIONS, never lockouts... the child may ignore
him"*, and both call sites in `interactions.ts` invited and then returned the
flow unchanged forever. Nothing greyed out, nothing was taken away, and the tap
could be repeated all day — but the round she asked for never opened. Ignoring
Fred was the one thing she could not do.

`invite()` now returns `'asked' | 'again'`. The first tap on a paused egg or
socket spends itself on Fred's line; the very next tap on the same thing opens
the round regardless. Fred's memory clears **on** the override, so the sequence
is ask, override, ask, override — every override costs one extra tap and is
preceded by the announcement, which is what keeps it from being the silent
wave-through Joe ruled out. Fred stays silent on the override itself because the
round is about to speak its own prompt (HANDOFF §5, speech cancels speech).

The three numeric questions the card said had to be settled before code were put
to Fable with the real source, and all three are answered in
`docs/DECISIONS-FOR-JOE.md` (new file this run) with the reasoning and the
commit that would have to change to reverse each.

## Gate results

All five, on the committed tree:

```
$ npm test
 Test Files  71 passed (71)
      Tests  1308 passed (1308)
   Duration  26.22s

$ npx tsc --noEmit -p tsconfig.json
TSC OK                                    (no output; exit 0)

$ npm run build
PWA v1.3.0
mode      generateSW
precache  8 entries (765.92 KiB)
files generated
  ../../dist/island/sw.js
  ../../dist/island/workbox-9c191d2f.js

$ npm run smoke
ok    battery is retired
ok    reading mode is active
ok    score bar initialised
all boot checks passed

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  first spoken      : ["run","got","am","a"]
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically
```

And the §5 discipline, done properly: I reverted the egg guard back to
`if (p.eggsPaused(flow)) { p.invite(...); return flow }` and re-ran — two of the
four new tests failed (`opens the egg on the second tap even while the nursery is
queued`, `asks again next time rather than waving her through in silence`), then
restored it. The tests bite.

## Deploy

**Shipped and verified.** Push to `main` triggered CI run `30387358836`; jobs
`build: success`, `deploy: success`. Live at <https://jtr31415.github.io/JunosIsland/>.

Verified from the artefact rather than by trusting the green tick, and **without
a browser** — `agent-browser` was reported wedging, so I did not risk it. I
fetched the live root page, followed it to `assets/index-DtQqyC4m.js`, and found
the minified override byte-identical to my local build:

```
let L=null;function Pe(e){if(e!==`wriggle-break`){if(L===e)return L=null,`again`;L=e}...
```

That is the ask-once memory, the `'again'` return, and the wriggle-break
exemption, all in the deployed bundle.

**Landmine for whoever verifies a deploy next:** the workflow builds the site
root from *the newest `v*` tag*, and `/preview/` from `main`. There are **no tags
yet**, so production currently falls back to `main` and the root URL is what a
push to main deploys. The moment somebody cuts a `v1` tag that stops being true,
and pushing to main will only move `/preview/`. See
`.github/workflows/*.yml` lines 93-106 and 116-121.

## Where the next manager starts

**Finish PB-042 half B, the escalating price.** The design work is done — do not
re-derive it, and do not re-litigate the numbers with Fable, because Joe has not
seen them yet and a second opinion now just muddies the record. Read
`docs/DECISIONS-FOR-JOE.md` §D1–D4 for the settled values and §N1–N2 for the two
things that need Joe's eyes.

The build, in one paragraph so it does not need re-surveying: the walls are
**crowded at 1.5 tiles per pet** (`T < 1.5P`) and **empty at 3.0** (`T > 3P`);
the surcharge is `mult(d) = 1 + d/4` capped at ×3, applied to the exact curve
value *before* the round-to-a-multiple-of-two, so
`pay * Math.round(exact * mult / pay)`. Past the empty wall the **tile** gets
dearer; past the crowded wall the **egg** does. The seam is
`src/island/flow.ts` L29-31 — `pagesForEgg(f)` and `sumsForTile(f)` already take
the whole `Flow` and every caller goes through them. Do **not** make
`cost(curve, n)` in `src/island/balance/index.ts` L205-210 ratio-aware: it is
called where there is no `Flow`, and `tests/island/economy.test.ts` and
`balance.test.ts` pin its present behaviour hard. Put the surcharge maths
somewhere that takes plain numbers, because `governors.ts` imports `Flow` as a
*type only* and a value import back the other way would be a genuine cycle.
`activeGovernor` in `src/island/governors.ts` (around L185-220 now) must have its
two thresholds moved onto the same walls — that is decision D4, and the reason is
that Joe asked for an announcement, so the price must not begin anywhere Fred
does not speak. Budget for rewriting most of `tests/island/governors.test.ts`;
roughly twenty of its tests pin the old numbers.

## What I learned that is not in the code

- **The deploy root is tag-driven with a fallback.** Written up above; it is the
  thing most likely to make a future manager verify the wrong URL and declare
  success. Worth promoting into `docs/HANDOFF.md` §6.
- **Grepping a minified bundle for a source string will lie to you.** My first
  check for the fix in the live bundle came back negative and I nearly reported a
  failed deploy. Two separate causes: shell quoting ate the pattern, and the
  minifier had rewritten `'...'` to backticks so `!=="wriggle-break"` appears
  nowhere. The reliable method is to grep the *local* `dist` bundle for the same
  pattern first — if the pattern is absent from a build you know contains the
  change, the pattern is wrong, not the deploy. Then diff a window of context
  around a nearby literal.
- **`vi.fn()` returning `undefined` silently becomes "override" here.** Because
  the new guard tests `=== 'asked'`, a bare stub makes every governor tap pass
  through and every test go green for the wrong reason — the §5 trap, set fresh.
  `tests/island/interactions.test.ts` now uses a faithful ask-once mock and pins
  the real `main.ts` wiring by source text, the way `stretch.test.ts` already
  does for the wriggle-break.

## Open decisions

- **D1** — 2.0 tiles per pet is the target; the shipped 1.5 survives as the crowded wall. (Fable)
- **D2** — the buffer walls are 1.5 and 3.0 tiles per pet, symmetric in animals-per-tile. (Fable)
- **D3** — escalation `1 + d/4`, capped ×3, applied before rounding. (Fable; flagged as the likeliest to be reversed)
- **D4** — the invitation thresholds move onto the price walls, so no surcharge is ever silent. (Manager)
- **D5** — the override is a second tap on the same thing, and Fred asks again every time. (Manager; shipped in `58425b6`)
- **N1 — NEEDS JOE.** The new corridor sits entirely above today's, so a girl at
  one tile per animal is permanently past the crowded wall and pays dearer eggs.
  Intended pedagogy, or a wall that wants moving?
- **N2 — NEEDS JOE.** Whether a price rise can make a progress bar move backwards
  mid-payment, and if so whether to quote-and-hold the price at round open.
