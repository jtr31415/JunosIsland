/**
 * Two writers, one file — the merge that stops the last save winning.
 *
 * JOE_WORKBENCH_ONLY
 *
 * `joe/tasks.json` has two authors. Joe answers rulings in the page; agents
 * append new ones to the same file from the other side. Both used to POST the
 * WHOLE file, so whoever saved last silently overwrote the other. It has cost
 * real work twice:
 *
 *   - an agent appended JT-020, Joe saved from a page loaded before it existed,
 *     and JT-020 was gone (recovered later out of a commit blob — 3c364b4);
 *   - the same collision the other way round destroyed his answer to JT-016,
 *     and he had to type it again.
 *
 * `joe/backlog.json` is written from both sides too, so it is merged on the
 * same terms. It cost work a third time, in the same shape but through the ID
 * SPACE rather than the records: the page dealt card ids out of its own stale
 * `nextId`, so Joe's new card arrived carrying an id an agent had already given
 * the live-bug card, and a merge that protects the list but not the counter
 * folded his card into that one and lost it — twice, which is why the live bug
 * ended up carded as PB-050 while every commit for it says PB-048. Ids are now
 * dealt server-side, inside the request; see `needsAnId` and `nextFree`.
 *
 * The fix is not a procedure for people to remember. The server re-reads the
 * file inside the request and merges, so correctness does not depend on anyone
 * being careful. Two rules carry almost all of it:
 *
 *   KEEP  a record on disk that the payload has never heard of is an append
 *         that happened after the page loaded. It survives, always. A save may
 *         not delete a task by being ignorant of it.
 *   OWN   only the fields the page actually edits are taken from the payload.
 *         Everything else — title, detail, blocks, the archive, schemaVersion —
 *         comes off the disk copy the server just read.
 *
 * What is left is the genuinely ambiguous case: the page and the disk both
 * carry a meaningful value for the same field of the same record, and there is
 * no third version to tell which is newer. A whole-file payload cannot express
 * intent — it carries every field of every record whether Joe touched it or
 * not — so this module never guesses about text. See `fold` for the four cases.
 *
 * The page therefore no longer saves whole files for edits: `app.js` sends a
 * PATCH naming the one record and the one field it changed (`applyPatch`), for
 * which intent IS unambiguous and Joe's note always wins, per his rule. The
 * whole-file path stays for appends — the backlog's Add card — and as the
 * safety net under any page that loaded before this change.
 */

/** A collision this module refuses to resolve by guessing. The API answers 409. */
export class Conflict extends Error {
  constructor(clashes) {
    const [first] = clashes
    super(
      `${first.id}.${first.field} was changed by something else while your page was open — ` +
      `nothing was saved. Reload and re-enter it.` +
      ` (on disk: ${JSON.stringify(first.disk)} · your page: ${JSON.stringify(first.page)})` +
      (clashes.length > 1 ? ` …and ${clashes.length - 1} more.` : ''))
    this.clashes = clashes
  }
}

/** A patch that named a field the page does not own, or a record that is not there. */
export class Refused extends Error {}

/**
 * Per mergeable file: where the records live, what identifies one, and what the
 * page is allowed to change about it.
 *
 * `kind` is the whole judgement call, written down:
 *
 *   text  Free text Joe typed. Losing it costs him the thinking, not just the
 *         keystrokes, so it is never overwritten on the strength of a guess.
 *   flag  A tick or a short token. Visible when wrong and a second's work to
 *         redo, so the page may set one — but `idle` is the ABSENCE of a
 *         decision ('open' is what every record is born as), and an absence
 *         never unticks anything.
 *   json  A whole object or array carried as the field's value. Judged exactly
 *         as `text` is — a genuine two-sided disagreement is refused, never
 *         guessed at — but compared by CONTENT rather than by identity, because
 *         two parses of the same bytes are never `===` and a re-ordered key is
 *         not a change. See `stable` and `nothing` for the two halves of that.
 */
const MERGEABLE = {
  tasks: {
    list: 'tasks', key: 'id',
    owns: { note: { kind: 'text' }, state: { kind: 'flag', idle: 'open' } },
    /* No counter. JT ids are dealt by agents editing the file, and the page
     * cannot add a task at all — there is no allocation here for two writers to
     * race over. If it ever grows an Add task, it needs a `counter` too. */
  },
  backlog: {
    list: 'cards', key: 'id',
    owns: { state: { kind: 'flag', idle: 'open' }, run: { kind: 'flag', idle: '' } },
    /* Ids are dealt from here, never reused and never renumbered once written.
     * See `nextFree` for what the counter is worth, and `needsAnId` for the
     * case the counter cannot cover on its own. */
    counter: { field: 'nextId', prefix: 'PB-', pad: 3 },
  },
  /*
   * `joe/names-audit.json` is the same two-writer shape from the other
   * direction, and the worse one: the LIST is generated — an agent rewrites
   * every row of it whenever the roster changes — while three fields of each
   * row are Joe's judgement, made once, by reading the name out loud.
   *
   * `verdict` is a flag: '' is the absence of a decision, which is what every
   * name is born with and what a regenerated file carries, so it can never
   * untick an 'ok'. `replacement` and `note` are his own words — the name he
   * wants instead of the generated one, and why — so they are text and a
   * genuine disagreement is refused rather than guessed at.
   *
   * No counter: ids are `setId/speciesId`, derived from the roster and never
   * dealt, so there is no id space for two writers to race over.
   *
   * `signoff`, `factVerdict` and `factNote` arrived with the built-animal
   * viewer, and they are Joe's ruling of 29 July written down: *"have an agent
   * create the facts and fact check them. they then become part of my final sign
   * off for each animal along with its name."* (JT-031.) So a row is ONE
   * ANIMAL's whole bench — the model, the collection, the name and the fact —
   * and there is exactly ONE gate over all of it.
   *
   *   signoff      THE gate, and the only one. 'ok' means "this creature may
   *                ship": model, collection, name and fact together. A flag,
   *                because it is one click and visibly wrong when wrong.
   *
   *                Deliberately NOT `verdict`. `verdict` is the name-only
   *                judgement made by reading a word aloud in the names panel,
   *                and folding the two together would let a name ticked in a
   *                list count as an animal he had actually looked at.
   *
   *   factVerdict  Per-field, not a second gate: 'reject' is him striking the
   *                FACT while the name may be fine, which is the case his ruling
   *                needs a way to express. Same shape `verdict` already has for
   *                the name, for the same reason.
   *   factNote     Why he struck it, or the wording he wants instead. His words,
   *                so text, so a genuine disagreement is refused not guessed at.
   *
   * THE FACT ITSELF IS NOT HERE, and that is deliberate. It is drafted and
   * checked by an agent into `joe/species-facts.json`, a file of its own, so the
   * drafting side and the judging side never write the same file and there is
   * nothing for this merge to arbitrate. The viewer reads that file and shows
   * what it contains; only Joe's verdict on it lands here.
   *
   * All three are absent from every row the generator has written so far, and
   * `idle` treats an absent key exactly as it treats an empty one — so the
   * generator running again over a signed-off row keeps the tick, without the
   * generator needing to know the field exists.
   */
  names: {
    list: 'names', key: 'id',
    owns: {
      verdict: { kind: 'flag', idle: '' },
      replacement: { kind: 'text' },
      note: { kind: 'text' },
      signoff: { kind: 'flag', idle: '' },
      factVerdict: { kind: 'flag', idle: '' },
      factNote: { kind: 'text' },
    },
  },
  /*
   * `joe/primitives-audit.json` — PB-036 phase 4, and the same two-writer shape
   * as the names above, sharpened.
   *
   * Joe, on the fix for 72 animals that are too square: *"i'd like to sign off
   * the primitives to be used first."* So a row is one SHAPE DECISION — how big
   * an eye is, how a corner is cut, whether a kit leg should be the pack's real
   * leg — carrying the measured value from the Kenney pack, what the kits do
   * instead, and the gap. Eight of the fields on a row are MEASUREMENTS and are
   * rewritten wholesale whenever anyone measures the pack again. Two are his.
   *
   *   signoff  THE gate, and the only one. '' is not-yet-judged, 'ok' is "the
   *            kits may build out of this", 'reject' is "they may not". A flag:
   *            one click, visibly wrong when wrong. `idle: ''` is what makes a
   *            regenerated row — which carries '' or carries no such key at all
   *            — incapable of unticking one he has made.
   *   note     His words, so text: a genuine disagreement is a 409 rather than a
   *            guess. Losing it costs him the thinking, not the keystrokes.
   *
   * NOTHING ELSE IS OWNED, and that is the load-bearing half. `packSays`,
   * `kitSays`, `gap`, `proposal` and `evidence` are measurements with file:line
   * provenance; a page that could overwrite one could quietly change what he
   * signed off after he signed it off.
   *
   * No counter. Ids are slugs an agent writes deliberately (`eye-size`,
   * `leg-adopt`), not numbers dealt from a pool, so there is no id space for two
   * writers to race over — which is exactly the `names` case and not the
   * `backlog` one. If a page ever grows an "add a primitive" button it will need
   * a `counter` and everything `needsAnId` does; today nothing adds a row from
   * the page at all.
   */
  primitives: {
    list: 'rows', key: 'id',
    owns: {
      signoff: { kind: 'flag', idle: '' },
      note: { kind: 'text' },
    },
  },
  /*
   * `joe/species-edits.json` — the visual editor's draft store, and the first
   * file here whose payload is not words but a DEFINITION.
   *
   * A draft is one new species Joe is making in the page: what it was copied
   * from, what collection it joins, what it is called, the fact that goes under
   * its name, and `def` — a CreatureDef, carried as JSON. The server never looks
   * inside `def` and must not: what a valid definition is belongs to the kits and
   * the axioms in `src/`, which move, and a validator here would be a second
   * opinion that quietly disagrees with the one the page actually builds against.
   * Opaque, whole, and merged by content.
   *
   *   def         `json`, not `text`. It is the payload and it is an OBJECT, so
   *               `text`'s `===` would call every save a disagreement — two
   *               parses of the same bytes are never the same object — and 409
   *               the page out of its own drafts. `json` compares a stable
   *               stringify instead and then refuses a real clash exactly as
   *               `text` does, because a lost def is a lost animal.
   *   warnings    `json` too, for the same reason and one more: it is an ARRAY,
   *               and `[]` is the absence of a save-time axiom check rather than
   *               a claim that there were no warnings. `nothing` treats it as
   *               idle, so a stale page cannot blank the warnings recorded beside
   *               a draft an agent re-checked after it loaded.
   *   state       `flag`, idle `'draft'`. 'draft' is what every record is born
   *               as, so a stale page carrying it can never un-ready a draft Joe
   *               marked ready; marking it back down is a patch, said out loud.
   *   everything
   *   else        `text`. `givenName` and `fact` are his own words in the most
   *               literal sense — the fact is the sentence a six-year-old will
   *               hear read aloud — and `speciesId`, `from`, `fromKind`,
   *               `collection` and `factSource` are short strings whose loss is
   *               silent rather than visible, which is the test `flag` fails.
   *
   * THE RECORD IS KEYED BY THE ANIMAL, and there is no counter at all.
   *
   * Joe, 2 August 2026: *"when i save an animal in the editor, it needs to just
   * overwrite what there is already … no saving of drafts in the bottom of the
   * list"*. It used to be keyed by a dealt `SD-nnn`, so saving the squirrel twice
   * left two records and the editor's Animal list grew a `draft:SD-002` row under
   * the animals every time he pressed Save. One animal is one record.
   *
   * **The id race the counter existed to manage is GONE, not moved**, and the
   * reason is worth stating because it is the second time this file has reached
   * it. A `speciesId` is not DEALT, it is DERIVED — from the species, which is
   * the thing itself. There is no pool, so there is nothing for two writers to
   * take the same number out of, and `needsAnId` cannot fire because it returns
   * false without a counter. That is exactly the `names` and `primitives` case
   * two specs up, and it is why neither of those has a counter either.
   *
   * What is left is a plain content collision — Joe and an agent editing the
   * same animal's `def` at once — and that was never the counter's problem. It
   * is `fold`'s, it always was, and a `json` disagreement still 409s rather than
   * guessing. Nothing about that changed.
   *
   * `SD-nnn` ids that already exist on disk are folded away by `migrate` below,
   * NOT deleted. Nothing outside this file has ever referred to a draft by one —
   * checked across the code, the docs and every commit message — so the id
   * itself is dropped while every field on the record is kept.
   */
  edits: {
    list: 'drafts', key: 'speciesId',
    migrate: foldOntoSpecies,
    owns: {
      from: { kind: 'text' },
      fromKind: { kind: 'text' },
      collection: { kind: 'text' },
      givenName: { kind: 'text' },
      fact: { kind: 'text' },
      factSource: { kind: 'text' },
      def: { kind: 'json' },
      warnings: { kind: 'json' },
      state: { kind: 'flag', idle: 'draft' },
      note: { kind: 'text' },
    },
  },
}

/*
 * `voices` and `notes` are deliberately NOT here. `joe/voices.json` is a map
 * keyed by character rather than a list of records, and nothing but this page
 * has ever written it — no agent appends a voice, so it has no second writer to
 * collide with. `joe/asset-notes.json` is only ever written through
 * `/api/note`, which already appends server-side rather than replacing. Both
 * keep the plain whole-file write. If either grows a second author, it belongs
 * in this table and the merge will cover it.
 */

export const mergeable = what => Object.hasOwn(MERGEABLE, what)

/** What identifies a record in this file. `undefined` for a file with no spec. */
export const keyOf = what => MERGEABLE[what]?.key

/**
 * Bring a file forward to the shape its spec describes, on the way in.
 *
 * Read-time, not a script. A file on disk was written by whatever the server was
 * the day it was written, and the two places that read one — the state endpoint
 * and the save path — are the only two that matter; healing there means the file
 * is right on screen immediately and right on disk at the next save, with no
 * migration step anybody has to remember to run. `nextFree` already works this
 * way for the counter, for the same reason.
 *
 * Idempotent by construction: every migration below returns its input untouched
 * when there is nothing to do.
 */
export function migrate(what, file) {
  const spec = MERGEABLE[what]
  if (!spec?.migrate || !file || typeof file !== 'object') return file
  return spec.migrate(file)
}

/**
 * `joe/species-edits.json` from dealt `SD-nnn` ids to one record per animal.
 *
 * The failure to avoid here is not a crash, it is a quiet subtraction: the three
 * records this was written against carry a `givenName` Joe chose — `SD-003` is
 * the fennec fox and it is called **Neegab** — and a migration that keyed by
 * species and kept "the first one" would have thrown that away with a 200 and no
 * error anywhere. `merge.mjs` and the names audit have both been bitten by that
 * exact class before, which is why folding is field by field and never
 * record-wins-record.
 *
 * Two rules, and between them nothing filled in is ever lost:
 *
 *   LATER WINS   records are in save order, so a later record for the same
 *                animal is a later save of it and its values are the current
 *                ones. This is the only guess the fold makes.
 *   NEVER BLANKS a later record that says nothing about a field — '', [], {},
 *                absent — leaves what the earlier one said standing. That is
 *                `nothing`, the same test `json` fields already use, and it is
 *                what protects a name recorded once and never retyped.
 *
 * The `id` is dropped rather than parked in a `legacyId`, because nothing has
 * ever held one: no commit message, no doc, no code path outside this file
 * refers to a draft by its `SD-nnn`, so a field preserving them would be
 * archaeology with no reader. The mapping is in the commit that made this change.
 *
 * A record with no `speciesId` cannot be keyed and is passed through EXACTLY as
 * it stands, id and all. The page cannot produce one — it refuses to open an
 * animal without an id — so this is insurance rather than a case, and dropping
 * such a row to tidy the file would be the very subtraction this function exists
 * to prevent.
 */
function foldOntoSpecies(file) {
  const rows = Array.isArray(file.drafts) ? file.drafts : []
  const stale = Object.hasOwn(file, 'nextId') || rows.some(r => r && Object.hasOwn(r, 'id'))
  if (!stale) return file

  const bySpecies = new Map()
  const unkeyed = []
  for (const row of rows) {
    const speciesId = row?.speciesId
    if (typeof speciesId !== 'string' || speciesId === '') { unkeyed.push(row); continue }
    const { id: _dropped, ...fields } = row
    const was = bySpecies.get(speciesId)
    if (!was) { bySpecies.set(speciesId, fields); continue }
    const out = { ...was }
    for (const [name, value] of Object.entries(fields)) if (!nothing(value)) out[name] = value
    bySpecies.set(speciesId, out)
  }

  const folded = { ...file, drafts: [...bySpecies.values(), ...unkeyed] }
  /* The counter's own field, and the counter is gone. Left behind it is a number
   * that nothing reads and nothing advances, which is exactly the sort of thing
   * the next reader spends twenty minutes deciding is not load-bearing. */
  delete folded.nextId
  return folded
}

/** Nothing said. An empty string, an absent key, or the value a record is born with. */
const idle = (v, field) => v === undefined || v === null || v === '' || v === field.idle

/**
 * A string that is the same whenever the VALUE is, whatever shape it arrived in.
 *
 * `JSON.stringify` alone is not that: it preserves insertion order, and a def
 * that has been through a form, a structuredClone or another agent's rewrite
 * carries the same fields in a different order as a matter of course. Comparing
 * those with `===` — which is exactly right for a string, and is what `text`
 * does — would read every such save as a two-sided disagreement and 409 Joe out
 * of a draft he has not changed. Keys sorted at every depth, so the comparison
 * is about what the object SAYS.
 */
function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']'
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}'
  }
  /* `undefined` stringifies to nothing at all, which would collide with the
   * empty string. Say null out loud instead. */
  return JSON.stringify(v) ?? 'null'
}

/**
 * Nothing said, in JSON.
 *
 * An absent key, an empty array, an empty object — all of them are a payload
 * that has no opinion rather than one asserting emptiness. A stale page carrying
 * `warnings: []` never saw the check that filled them in, exactly as a stale
 * page carrying `note: ''` never saw the note.
 */
const nothing = v =>
  v === undefined || v === null || v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && Object.keys(v).length === 0)

/**
 * What each kind actually does, in one table: how two values are compared, what
 * counts as nothing said in it, and whether a genuine disagreement is refused
 * rather than resolved by guessing.
 */
const KINDS = {
  text: { same: (a, b) => a === b, idle, refuses: true },
  flag: { same: (a, b) => a === b, idle, refuses: false },
  json: { same: (a, b) => stable(a) === stable(b), idle: nothing, refuses: true },
}

/** Two meaningful values, no third version to break the tie. */
const CLASH = Symbol('clash')
/** Leave the disk copy alone. */
const KEEP = undefined

/** One field, four cases, no guessing. */
function fold(field, was, now) {
  /* A kind this table has never heard of is treated as `text`, the strictest of
   * them: a typo in a spec above should cost a 409, never a silent overwrite. */
  const kind = KINDS[field.kind] ?? KINDS.text
  if (kind.same(was, now)) return KEEP
  /* The page says nothing here. An echo of an absence is not an instruction to
   * blank something — a stale page carries an empty note simply because it
   * never saw the one that was written after it loaded. */
  if (kind.idle(now, field)) return KEEP
  /* Nothing on disk to lose: the page's edit lands. This is Joe answering a
   * ruling, which is the common case and must always work. */
  if (kind.idle(was, field)) return now
  /* Both sides mean something, and they differ. */
  return kind.refuses ? CLASH : now
}

/** The number inside a dealt id — `PB-048` → 48 — or NaN if it was never dealt from the counter. */
function serial(counter, id) {
  if (typeof id !== 'string' || !id.startsWith(counter.prefix)) return NaN
  const tail = id.slice(counter.prefix.length)
  return /^\d+$/.test(tail) ? Number(tail) : NaN
}

const dealId = (counter, n) => counter.prefix + String(n).padStart(counter.pad, '0')

/**
 * The lowest id that is certainly free, across every copy of the file in play.
 *
 * Past both counters — a stale page's counter may never drag the file's back
 * down — and past every id ACTUALLY PRESENT, which is the half a counter alone
 * cannot give you. A counter that has fallen behind the cards it dealt (an
 * agent appending straight to the file without bumping it, a card restored from
 * a commit blob) would otherwise deal the same id a second time. Reading the
 * ids means the file heals itself on the next save instead.
 */
function nextFree(spec, ...files) {
  const { list, key, counter } = spec
  let n = 1
  for (const f of files) {
    if (!f) continue
    n = Math.max(n, Number(f[counter.field]) || 0)
    for (const r of Array.isArray(f[list]) ? f[list] : []) {
      const s = serial(counter, r?.[key])
      if (Number.isFinite(s)) n = Math.max(n, s + 1)
    }
  }
  return n
}

/**
 * Is this incoming record a card the page is ADDING, rather than its copy of a
 * card the file already holds?
 *
 * The page deals ids itself, out of the counter as it stood when the page
 * LOADED, so by the time a save lands the id may already belong to a card the
 * page never heard of. That is how the live-bug card was dealt `PB-048` twice
 * over: each collision arrived looking like an edit of the card already at that
 * id, was folded into it, and the new card vanished with a 200. Merging the
 * list while leaving the id space unguarded protects the cards and loses the
 * one being added.
 *
 * The counter is now dealt server-side (`app.js` sends no id), which removes
 * the race by construction. This covers the pages that still deal their own —
 * any tab loaded before that change, which is exactly the tab this happened to.
 * Two signals, and both must agree:
 *
 *   DEALT HERE  the payload's own counter sits exactly one past this id, which
 *               is what a page does when it deals one and saves immediately.
 *               A card it merely loaded sits far below its counter.
 *   DIFFERENT   the two disagree about a field the page cannot edit. Edits go
 *               out as patches now, so a whole-file payload never carries a
 *               changed title — a title that differs is a different card.
 *
 * Neither alone would do. The first also fits the newest card of a page that
 * saves whole without adding anything; the second also fits a stale echo of a
 * card an agent retitled. Where they still disagree the choice is between
 * showing a card twice and losing one silently, and this module loses nothing.
 */
function needsAnId(spec, onDisk, incoming, now) {
  const { key, owns, counter } = spec
  if (!counter) return false
  const id = now?.[key]
  /* No id at all: the page left the dealing to the server, where it belongs. */
  if (typeof id !== 'string' || !id) return true
  const was = onDisk.get(id)
  if (!was) return false                      // nothing to collide with
  const dealtHere = Number(incoming?.[counter.field]) === serial(counter, id) + 1
  const different = [...new Set([...Object.keys(was), ...Object.keys(now)])].some(f =>
    f !== key && !Object.hasOwn(owns, f) && JSON.stringify(was[f]) !== JSON.stringify(now[f]))
  return dealtHere && different
}

/**
 * Merge a whole-file payload onto the copy the server just read from disk.
 *
 * `disk` is the truth about everything the page does not own. `incoming` is
 * consulted only about the fields it does, plus records it is adding.
 */
export function mergeWhole(what, disk, incoming) {
  const spec = MERGEABLE[what]
  if (!spec) return incoming
  const { list, key, owns, counter } = spec

  /* Nothing on disk yet (first boot, before the seed): the payload is all there
   * is, and there is nothing it could destroy. */
  if (!disk || !Array.isArray(disk[list])) return incoming
  if (!incoming || !Array.isArray(incoming[list])) {
    throw new Refused(`a ${what} save needs a ${list} array`)
  }

  const onDisk = new Map(disk[list].map(r => [r?.[key], r]))
  /* Classified before a single field is folded: a card that needs an id is not
   * an edit of whatever happens to be sitting at the id it arrived with. */
  const fresh = new Set(incoming[list].filter(r => needsAnId(spec, onDisk, incoming, r)))
  const sent = new Map(incoming[list].filter(r => !fresh.has(r)).map(r => [r?.[key], r]))
  const clashes = []
  const seen = new Set()

  /* Disk order first, so the file's ordering is the file's, not the page's. */
  const merged = disk[list].map(was => {
    const id = was?.[key]
    seen.add(id)
    const now = sent.get(id)
    if (!now) return was                       // KEEP: appended after the page loaded
    const out = { ...was }
    for (const [name, field] of Object.entries(owns)) {
      const v = fold(field, was?.[name], now?.[name])
      if (v === CLASH) clashes.push({ id, field: name, disk: was?.[name], page: now?.[name] })
      else if (v !== KEEP) out[name] = v
    }
    return out
  })

  /* Records the page has and the disk does not: the backlog's Add card. One
   * that needs an id is dealt the next free one HERE, inside the request,
   * against the file as it stands this instant — never the id it arrived with,
   * and never at the cost of the card already holding it. Ids are sticky once
   * written: the newcomer moves, the card on disk never does. */
  let free = counter ? nextFree(spec, disk, incoming) : 0
  for (const now of incoming[list]) {
    if (fresh.has(now)) merged.push({ ...now, [key]: dealId(counter, free++) })
    else if (!seen.has(now?.[key])) merged.push(now)
  }

  if (clashes.length) throw new Conflict(clashes)

  const out = { ...disk, [list]: merged }
  /* Never backwards, and never behind the ids it allocates into. */
  if (counter) out[counter.field] = nextFree(spec, disk, incoming, out)
  return out
}

/**
 * Apply one named change to one named record of the copy just read from disk.
 *
 * This is the path the page uses now, and it is the one that carries intent:
 * `{ id: 'JT-016', note: '…' }` means Joe changed that note and nothing else,
 * so his note wins outright — including when he clears it, which a whole-file
 * payload could never say out loud.
 */
export function applyPatch(what, disk, patch) {
  const spec = MERGEABLE[what]
  if (!spec) throw new Refused(`${what} is not patchable — send the whole file`)
  const { list, key, owns } = spec

  const id = patch?.[key]
  if (!id || typeof id !== 'string') throw new Refused(`a ${what} patch needs an ${key}`)

  const fields = Object.keys(patch).filter(k => k !== key)
  const stray = fields.filter(f => !Object.hasOwn(owns, f))
  if (stray.length) throw new Refused(`the page does not own ${stray.join(', ')} on a ${what} record`)
  if (!fields.length) throw new Refused(`a ${what} patch changes nothing`)

  const rows = Array.isArray(disk?.[list]) ? disk[list] : []
  if (!rows.some(r => r?.[key] === id)) throw new Refused(`no such ${key} in ${what}: ${id}`)

  return {
    ...disk,
    [list]: rows.map(r => r?.[key] === id
      ? { ...r, ...Object.fromEntries(fields.map(f => [f, patch[f]])) }
      : r),
  }
}
