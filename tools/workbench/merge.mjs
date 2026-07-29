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
   */
  names: {
    list: 'names', key: 'id',
    owns: {
      verdict: { kind: 'flag', idle: '' },
      replacement: { kind: 'text' },
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

/** Nothing said. An empty string, an absent key, or the value a record is born with. */
const idle = (v, field) => v === undefined || v === null || v === '' || v === field.idle

/** Two meaningful values, no third version to break the tie. */
const CLASH = Symbol('clash')
/** Leave the disk copy alone. */
const KEEP = undefined

/** One field, four cases, no guessing. */
function fold(field, was, now) {
  if (was === now) return KEEP
  /* The page says nothing here. An echo of an absence is not an instruction to
   * blank something — a stale page carries an empty note simply because it
   * never saw the one that was written after it loaded. */
  if (idle(now, field)) return KEEP
  /* Nothing on disk to lose: the page's edit lands. This is Joe answering a
   * ruling, which is the common case and must always work. */
  if (idle(was, field)) return now
  /* Both sides mean something, and they differ. */
  return field.kind === 'text' ? CLASH : now
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
