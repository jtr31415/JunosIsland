/**
 * Fred's script, from the ledger to the clip.
 *
 * `voice/scripts.json` is the running record of every spoken line on the
 * island, and until the bake was wired to it the file had no consumer at all.
 * What these tests defend is the narrow path between the two: which lines a run
 * is allowed to touch, what a template is cut into before it is synthesized,
 * and whether the milliseconds in the manifest are measured from the audio or
 * guessed from the words.
 *
 * The REAL ledger is read wherever the claim is about the script Juno will
 * actually hear, because a throwaway copy would only prove the copy. Everything
 * that WRITES uses a temporary root, and the one test that bakes injects its own
 * `fetchImpl` returning a buffer built here — so nothing in this file reaches
 * Azure, and nothing reads a key out of the repo.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/*
 * The workbench is plain ESM with no build step and no declarations, and
 * `tsconfig.json` does not turn on `allowJs`, so importing it from a `.ts` test
 * is an implicit `any` that `tsc --noEmit` refuses. Suppressed at the import
 * rather than papered over with a hand-written `.d.ts`, which would be a second
 * description of these modules that could quietly stop matching them.
 */
import { REPO } from '../../tools/workbench/seed.mjs'
// @ts-expect-error — see above; `script.mjs` ships no types.
import { scriptUnits, splitTemplate, ScriptError, DEFAULT_SCRIPT_DIR } from '../../tools/workbench/script.mjs'
// @ts-expect-error — see above; `bake.mjs` ships no types.
import { bakeHash, bakeOne, bakeState, castFor, outPath, ssml, readClip, opusDurationMs, BakeError } from '../../tools/workbench/bake.mjs'

/** The ledger itself, so the expectations below cannot rot away from it. */
const ledger = JSON.parse(readFileSync(join(REPO, 'voice/scripts.json'), 'utf8'))

/** Fred's units, off the real file — the default ask, and the only safe one. */
const fred = scriptUnits(REPO)
/*
 * Named rather than found, so that a unit going missing reads as a missing unit
 * instead of arriving here as a `TypeError` on the next property access.
 */
const byId = (id: string) => {
  const unit = fred.find((u: any) => u.id === id)
  if (!unit) throw new Error(`no unit with the id ${id} — the enumerator no longer produces it`)
  return unit
}
const has = (id: string) => fred.some((u: any) => u.id === id)

/** The placeholder casting from `seed.mjs`, which is what a run uses today. */
const CAST = {
  fred: { voice: 'en-GB-RyanNeural', rate: '-8%', pitch: '0%' },
  teacher: { voice: 'en-GB-SoniaNeural', rate: '0%', pitch: '0%' },
}

describe('the ledger, enumerated', () => {
  it('offers Fred and nobody else, unless a caller says otherwise out loud', () => {
    /*
     * The count is pinned rather than derived because the whole point of the
     * default is that it is NARROW: the same file holds ~1,700 teacher clips and
     * dad's booth recordings, and a change that quietly widened the default
     * would show up here as a number nobody meant to change.
     */
    expect(fred).toHaveLength(41)
    expect(fred.every((u: any) => u.character === 'fred')).toBe(true)

    /*
     * `from` names the ledger entry a unit came from, which is what lets the
     * three kinds be counted apart without re-deriving them: a whole line is its
     * own source, a template piece hangs off its line's id, and a numeral comes
     * from the generated family rather than from `lines[]` at all.
     */
    expect(fred.filter((u: any) => u.id === u.from)).toHaveLength(15)
    expect(fred.filter((u: any) => u.from !== 'count.' && u.id !== u.from)).toHaveLength(6)
    expect(fred.filter((u: any) => u.from === 'count.')).toHaveLength(20)

    /*
     * `open.nameSlot` is the teacher announcing a pet's name, and it is the one
     * line in the opening that Fred must never be given: a name is the teacher's
     * always, so the beat is three chained clips rather than one spliced line.
     */
    expect(fred.some((u: any) => u.id.startsWith('open.nameSlot'))).toBe(false)

    /* Every unit is addressed as a script clip, which is how `bakeOne` tells it from a lesson. */
    expect(fred.every((u: any) => u.out === `${DEFAULT_SCRIPT_DIR}/${u.id}.opus`)).toBe(true)
  })

  it('never hands Azure a line with a brace still in it', () => {
    /*
     * A brace reaching the synthesizer is not a crash, which is what makes it
     * worth a test: Azure would cheerfully read the word "n" aloud and the clip
     * would sit in the manifest sounding almost right.
     */
    for (const u of fred) expect(u.script, u.id).not.toMatch(/[{}]/)

    expect(byId('gov.spaceSurplus.head').script).toBe("Let's read with the egg —")
    expect(byId('gov.spaceSurplus.tail.one').script).toBe('more friend will fill it up!')
    expect(byId('gov.spaceSurplus.tail.many').script).toBe('more friends will fill it up!')

    expect(byId('gov.nurseryQueue.head').script).toBe('They need homes!')
    expect(byId('gov.nurseryQueue.tail.one').script).toBe('more tile will do it.')
    expect(byId('gov.nurseryQueue.tail.many').script).toBe('more tiles will do it.')

    /* The whole template is gone from the bake — only its pieces are baked. */
    expect(has('gov.spaceSurplus')).toBe(false)
    expect(has('gov.nurseryQueue')).toBe(false)
  })

  it('bakes the singular and the plural as two different clips', () => {
    /*
     * This is the law the double bake exists for. "1 more friends will fill it
     * up!" is a sentence a child learning to read must never be shown, and the
     * only way to be sure she is not is for the singular tail to be its own
     * recording rather than the plural one with a hopeful `s` rule in front of
     * it — a plural rule in code is a rule that one day meets a word it is
     * wrong about, in front of the child who is reading it.
     */
    for (const line of ['gov.spaceSurplus', 'gov.nurseryQueue']) {
      const one = byId(`${line}.tail.one`).script
      const many = byId(`${line}.tail.many`).script
      expect(one, line).not.toBe(many)
    }

    expect(byId('gov.spaceSurplus.tail.one').script).toMatch(/\bfriend\b/)
    expect(byId('gov.spaceSurplus.tail.one').script).not.toMatch(/\bfriends\b/)
    expect(byId('gov.nurseryQueue.tail.one').script).toMatch(/\btile\b/)
    expect(byId('gov.nurseryQueue.tail.one').script).not.toMatch(/\btiles\b/)
  })

  it("counts to twenty in Fred's own larynx, in words", () => {
    const numerals = fred.filter((u: any) => u.from === 'count.')
    expect(numerals).toHaveLength(20)
    expect(numerals.map((u: any) => u.id)).toEqual(
      Array.from({ length: 20 }, (_, i) => `count.${i + 1}`),
    )
    expect(byId('count.1').script).toBe('one')
    expect(byId('count.20').script).toBe('twenty')

    /*
     * Words, never digits. Azure normalises "3" itself and its choice is neither
     * visible in the ledger nor stable across voices, so what is audited has to
     * be what is synthesized.
     */
    for (const u of numerals) expect(u.script, u.id).toMatch(/^[a-z]+$/)

    /* And they are Fred's, because they are spliced into Fred's own sentences. */
    expect(numerals.every((u: any) => u.character === 'fred')).toBe(true)
  })

  it('bakes the wording the ledger holds now, never the wording it replaced', () => {
    /*
     * Several lines carry a `was`: the pre-splice-law wording that spoke the
     * child's name aloud. Baking one of those would put "[NAME]" in Fred's mouth
     * literally, so the assertion is made against the file rather than against a
     * remembered string, and it goes red the moment the two are confused.
     */
    const askLand = ledger.lines.find((l: any) => l.id === 'open.askLand')
    expect(askLand.was, 'open.askLand has lost its `was`, so this test proves nothing').toBeTruthy()
    expect(byId('open.askLand').script).toBe(String(askLand.text).trim())
    expect(byId('open.askLand').script).not.toBe(askLand.was)

    const retired = new Set(ledger.lines.map((l: any) => l.was).filter(Boolean))
    for (const u of fred) expect(retired.has(u.script), u.id).toBe(false)
  })

  it('refuses a family whose words live somewhere else, rather than baking nothing', () => {
    /*
     * Silence is the dangerous failure here. A run asked for the teacher that
     * returned an empty list would report success, and the ~1,700 clips it was
     * supposed to produce would simply not exist — so the ask fails loudly and
     * says where the words actually come from.
     */
    expect(() => scriptUnits(REPO, { characters: ['teacher'] })).toThrow(ScriptError)
    expect(() => scriptUnits(REPO, { characters: ['teacher'] })).toThrow(/name\./)
    expect(() => scriptUnits(REPO, { characters: ['dad'] })).toThrow(/phoneme\./)
    expect(() => scriptUnits(REPO, { characters: ['dad'] })).toThrow(/source/)
  })

  it('reports a missing ledger as a missing ledger', () => {
    const empty = mkdtempSync(join(tmpdir(), 'voice-noledger-'))
    try {
      expect(() => scriptUnits(empty)).toThrow(/voice\/scripts\.json/)
    } finally {
      rmSync(empty, { recursive: true, force: true })
    }
  })
})

describe('cutting a template', () => {
  it('gives back a head and both tails', () => {
    expect(splitTemplate('They need homes! {n} more {tile|tiles} will do it.')).toEqual([
      { suffix: 'head', script: 'They need homes!' },
      { suffix: 'tail.one', script: 'more tile will do it.' },
      { suffix: 'tail.many', script: 'more tiles will do it.' },
    ])
  })

  it('gives back one tail when the tail has no noun to agree with', () => {
    expect(splitTemplate('You have {n} friends now!')).toEqual([
      { suffix: 'head', script: 'You have' },
      { suffix: 'tail', script: 'friends now!' },
    ])
  })

  /*
   * Everything below is a wording nobody could bake correctly, and the point of
   * each is that it fails at the cut rather than at the microphone. A template
   * with no seam, or with a seam at one end, has no legal splice in it at all;
   * a slot the cutter does not recognise would otherwise be read out loud.
   */
  it('refuses a template with no numeral slot', () => {
    expect(() => splitTemplate('More friends will fill it up!')).toThrow(ScriptError)
    expect(() => splitTemplate('More friends will fill it up!')).toThrow(/\{n\} slot/)
  })

  it('refuses a template with nothing before the slot', () => {
    expect(() => splitTemplate('{n} more friends will fill it up!')).toThrow(/nothing to bake before/)
  })

  it('refuses a template with nothing after the slot', () => {
    expect(() => splitTemplate("Let's read with the egg — {n}")).toThrow(/nothing to bake after/)
  })

  it('refuses a slot it does not know how to fill', () => {
    /* A lone `{friend}` is not a noun pair, so there is no singular and plural to bake. */
    expect(() => splitTemplate('Here — {n} more {friend} will arrive.')).toThrow(/unrecognised slot/)
    /* And a second pair, left standing after the first was replaced, is caught by the sweep. */
    expect(() => splitTemplate('Here — {n} more {friend|friends} in the {home|homes}.'))
      .toThrow(/a slot survived the cut/)
    /* A slot in the HEAD is the same failure from the other end. */
    expect(() => splitTemplate('{who} says — {n} more {friend|friends}.')).toThrow(/a slot survived the cut/)
  })
})

describe('what a clip is baked from', () => {
  const script = "Let's read with the egg —"

  it('is the same hash for the same script and the same casting', () => {
    expect(bakeHash(script, CAST.fred)).toBe(bakeHash(script, { ...CAST.fred }))
    expect(bakeHash(script, CAST.fred)).not.toBe(bakeHash('They need homes!', CAST.fred))
    /* Trimmed, so a stray space in the ledger is not a re-bake of the whole script. */
    expect(bakeHash(`  ${script}  `, CAST.fred)).toBe(bakeHash(script, CAST.fred))
  })

  it('changes for every clip when Fred is recast', () => {
    /*
     * Casting is data, and this is the property that makes it cheap: when JT-003
     * settles and Fred stops being Ryan, nobody has to remember which clips to
     * re-render — all forty-one of them stop matching their manifest hash and
     * the next run picks them up on its own.
     */
    const recast = { ...CAST.fred, voice: 'en-GB-OliverNeural' }
    for (const u of fred) {
      expect(bakeHash(u.script, recast), u.id).not.toBe(bakeHash(u.script, CAST.fred))
    }
  })

  it('changes for a new rate or a new pitch', () => {
    expect(bakeHash(script, { ...CAST.fred, rate: '-4%' })).not.toBe(bakeHash(script, CAST.fred))
    expect(bakeHash(script, { ...CAST.fred, pitch: '+2%' })).not.toBe(bakeHash(script, CAST.fred))
    /* An absent pitch is 0%, so adding the default explicitly is not a change. */
    const { pitch: _pitch, ...noPitch } = CAST.fred
    expect(bakeHash(script, noPitch)).toBe(bakeHash(script, CAST.fred))
  })
})

describe('who says it and where it lands', () => {
  const voices = { outDir: 'src/island/public/voice/lessons', cast: CAST }

  it('takes the voice off the character on the unit', () => {
    /* The splice law turns on this: four voices share one ledger, and a clip
     * spliced into a sentence spoken by somebody else is the uncanny result §3
     * forbids. */
    expect(castFor(voices, { id: 'open.nameSlot', character: 'teacher' }).voice).toBe('en-GB-SoniaNeural')
    expect(castFor(voices, { id: 'count.3', character: 'fred' }).voice).toBe('en-GB-RyanNeural')
  })

  it('treats a lesson with no character as Fred, because every lesson is Fred teaching', () => {
    expect(castFor(voices, { id: 'L-ADD-1' }).voice).toBe('en-GB-RyanNeural')
  })

  it('refuses to guess at an uncast character', () => {
    /* `dad` is the sound booth and is blocked on Joe, so there is no voice to
     * fall back to — and falling back to Fred's would put the wrong larynx in
     * the phoneme clips without anybody noticing. */
    expect(() => castFor(voices, { id: 'phoneme.sh', character: 'dad' })).toThrow(BakeError)
    expect(() => castFor(voices, { id: 'phoneme.sh', character: 'dad' })).toThrow(/dad/)
  })

  it('lets a script unit name its own path and puts a lesson under the out dir', () => {
    /* A script unit's path is derived from its id, so it arrives whole; a
     * lesson's is typed by Joe in the console as `lessons/<name>.opus`, and the
     * prefix is the console's label rather than part of the location. */
    expect(outPath(voices, byId('count.7'))).toBe(`${DEFAULT_SCRIPT_DIR}/count.7.opus`)
    expect(outPath(voices, { id: 'L-ADD-4', file: 'lessons/add-make-ten.opus' }))
      .toBe('src/island/public/voice/lessons/add-make-ten.opus')
    expect(outPath(voices, { id: 'L-ADD-4', file: 'add-make-ten.opus' }))
      .toBe('src/island/public/voice/lessons/add-make-ten.opus')
    expect(() => outPath(voices, { id: 'L-ADD-4' })).toThrow(/no file field/)
  })
})

describe('the SSML handed to Azure', () => {
  it('asks for no padding at either end, which is what makes a splice possible', () => {
    /*
     * Azure pads every utterance with about a second of silence at each end.
     * Baked as whole lines that is merely wasteful; baked as the numerals that
     * get spliced into Fred's governor sentences it is fatal, because a second
     * of nothing either side of "three" is not a sentence anyone would hear as
     * speech. The ~120ms slot gap is the player's to insert and it cannot
     * subtract a gap that is already in the file.
     */
    const out = ssml('three', CAST.fred)
    expect(out).toContain('<mstts:silence type="Leading-exact" value="0ms"/>')
    expect(out).toContain('<mstts:silence type="Tailing-exact" value="0ms"/>')
    /* Those tags are in Microsoft's own namespace, so the document must declare it. */
    expect(out).toContain('xmlns:mstts="http://www.w3.org/2001/mstts"')
    expect(out).toContain('<voice name="en-GB-RyanNeural">')
    expect(out).toContain('<prosody rate="-8%" pitch="0%">three</prosody>')
  })

  it('escapes the script, so an ampersand is read rather than parsed', () => {
    /* The script is XML content, and a lesson about "3 & 4" would otherwise
     * make the request itself malformed rather than making a bad clip. */
    const out = ssml('Tom & Jerry <3 > 2', CAST.fred)
    expect(out).toContain('Tom &amp; Jerry &lt;3 &gt; 2')
    expect(out).not.toContain('Jerry <3')
  })
})

/**
 * The bake itself, against a fake Azure and a real file on disk.
 *
 * The clip the fake returns is a hand-built Ogg Opus stream, so `ms` in the
 * manifest is measured from a granule position this file chose and can compute
 * the answer for by hand. That is the whole point of the fixture: an estimate
 * from the length of the script would land nowhere near it.
 */
describe('baking one clip', () => {
  let root: string

  /** Ogg's CRC32 — polynomial 0x04c11db7, unreflected, no final xor. */
  const oggCrc = (bytes: Buffer) => {
    let crc = 0
    for (const b of bytes) {
      crc = (crc ^ (b << 24)) >>> 0
      for (let i = 0; i < 8; i++) {
        crc = ((crc & 0x80000000) ? ((crc << 1) ^ 0x04c11db7) : (crc << 1)) >>> 0
      }
    }
    return crc
  }

  /** One Ogg page carrying one segment. Payloads stay under 255 bytes, so nothing continues. */
  const page = (headerType: number, granule: bigint, seq: number, payload: Buffer) => {
    const p = Buffer.alloc(28 + payload.length)
    p.write('OggS', 0, 'latin1')
    p[4] = 0                              // stream structure version
    p[5] = headerType                     // 0x02 first page, 0x04 last
    p.writeBigUInt64LE(granule, 6)
    p.writeUInt32LE(0x4a554e4f, 14)       // bitstream serial number
    p.writeUInt32LE(seq, 18)
    p[26] = 1                             // one segment...
    p[27] = payload.length                // ...this long
    payload.copy(p, 28)
    p.writeUInt32LE(oggCrc(p), 22)        // over the whole page with the field zeroed, as above
    return p
  }

  const opusHead = (preSkip: number) => {
    const h = Buffer.alloc(19)
    h.write('OpusHead', 0, 'latin1')
    h[8] = 1                              // version
    h[9] = 1                              // mono, which is the format the bake asks Azure for
    h.writeUInt16LE(preSkip, 10)
    h.writeUInt32LE(24_000, 12)           // original sample rate
    h.writeInt16LE(0, 16)                 // output gain
    h[18] = 0                             // channel mapping family 0
    return h
  }

  const opusTags = Buffer.concat([
    Buffer.from('OpusTags', 'latin1'),
    Buffer.from([4, 0, 0, 0]), Buffer.from('test', 'latin1'),
    Buffer.from([0, 0, 0, 0]),            // no user comments
  ])

  /**
   * A stream whose last page claims `granule` samples.
   *
   * Granule positions are counted at 48kHz whatever the coded rate, and the
   * pre-skip is priming samples that are not audio, so the duration is
   * `(granule - preSkip) / 48` milliseconds. The audio payload is a stub: the
   * container is what `opusDurationMs` reads, and a real Opus packet would make
   * the fixture longer without making the assertion stronger.
   */
  const PRE_SKIP = 312
  const clipOf = (granule: bigint) => Buffer.concat([
    page(0x02, 0n, 0, opusHead(PRE_SKIP)),
    page(0x00, 0n, 1, opusTags),
    page(0x04, granule, 2, Buffer.from([0xfc, 0xff, 0xfe, 0x01])),
  ])

  /* 24312 − 312 = 24000 samples at 48kHz, which is 500ms. Worked out by hand. */
  const HALF = clipOf(24_312n)
  /* And 48312 − 312 = 48000, which is 1000ms — twice the length, same script. */
  const WHOLE = clipOf(48_312n)

  /** Azure, replaced by a function that hands back a buffer we built. */
  const azureReturning = (body: Buffer) => async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
  })

  const voices = {
    outDir: 'src/island/public/voice/lessons',
    manifest: 'src/island/public/voice/manifest.json',
    region: 'uksouth',
    cast: CAST,
  }

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'voice-bake-'))
    /*
     * A key has to exist for the bake to get as far as the network, and this is
     * a throwaway root — the repo's own `.env` is never read, and the fake never
     * looks at what it was sent anyway.
     */
    writeFileSync(join(root, '.env'), 'AZURE_SPEECH_KEY=not-a-real-key\n')
  })

  afterAll(() => {
    if (root) rmSync(root, { recursive: true, force: true })
  })

  it('writes the clip and records what it actually is', async () => {
    const unit = byId('gov.spaceSurplus.tail.one')
    const entry = await bakeOne(root, unit, voices, { fetchImpl: azureReturning(HALF) })

    expect(entry).toEqual({
      file: 'src/island/public/voice/script/gov.spaceSurplus.tail.one.opus',
      ms: 500,
      bytes: HALF.length,
      hash: bakeHash(unit.script, CAST.fred),
      character: 'fred',
      voice: 'en-GB-RyanNeural',
      rate: '-8%',
    })

    /* The bytes on disk are the bytes Azure sent, unaltered — no transcode step. */
    expect(readClip(root, entry.file).equals(HALF)).toBe(true)

    /* And the manifest is the file the player reads, so it has to be there too. */
    const manifest = JSON.parse(readFileSync(join(root, voices.manifest), 'utf8'))
    expect(manifest.clips['gov.spaceSurplus.tail.one']).toEqual(entry)
  })

  it('measures the duration from the audio rather than estimating it from the script', async () => {
    /*
     * The same script twice, against two clips of different lengths. A wrong
     * `ms` is worse than an absent one — the player uses it to time the gap
     * between a head, a numeral and a tail — so nothing about the sentence may
     * be allowed to stand in for the file.
     */
    const unit = byId('count.3')
    const first = await bakeOne(root, unit, voices, { fetchImpl: azureReturning(HALF) })
    expect(first.ms).toBe(500)

    const second = await bakeOne(root, unit, voices, { fetchImpl: azureReturning(WHOLE) })
    expect(second.ms).toBe(1000)
    expect(second.hash).toBe(first.hash)      // the script never changed
    expect(second.bytes).toBe(WHOLE.length)
  })

  it('calls a clip stale when the voice that made it is recast', async () => {
    /*
     * The console's own definition, end to end: the clip is on disk and its hash
     * matches, so it is baked; recast Fred and the very same clip is stale,
     * without anybody having marked it. This is what makes JT-003 cost one
     * command instead of an audit.
     */
    const unit = byId('gov.nurseryQueue.head')
    await bakeOne(root, unit, voices, { fetchImpl: azureReturning(HALF) })
    const manifest = JSON.parse(readFileSync(join(root, voices.manifest), 'utf8'))

    expect(bakeState(root, unit, voices, manifest)).toBe('baked')

    const recast = { ...voices, cast: { ...CAST, fred: { ...CAST.fred, voice: 'en-GB-OliverNeural' } } }
    expect(bakeState(root, unit, recast, manifest)).toBe('stale')

    /*
     * And a line nobody has baked is `vetted`, not `unscripted`. The distinction
     * is the lesson vocabulary — a lesson is drafted and then vetted by Joe's red
     * pen — and it is simply untrue of the ledger, where a line only appears once
     * it IS the agreed wording.
     */
    expect(bakeState(root, byId('open.greet'), voices, manifest)).toBe('vetted')
  })

  it('says what to do when there is no key, rather than throwing a stack trace', async () => {
    const bare = mkdtempSync(join(tmpdir(), 'voice-nokey-'))
    const hadKey = process.env.AZURE_SPEECH_KEY
    delete process.env.AZURE_SPEECH_KEY
    try {
      await expect(bakeOne(bare, byId('count.1'), voices, {
        fetchImpl: async () => { throw new Error('the network must not be reached') },
      })).rejects.toThrow('add AZURE_SPEECH_KEY to .env (repo root) and bake again')
    } finally {
      if (hadKey !== undefined) process.env.AZURE_SPEECH_KEY = hadKey
      rmSync(bare, { recursive: true, force: true })
    }
  })
})

/*
 * Two holes found while reviewing the file above, both fixed, and both about
 * the same thing: a WRONG answer reaching the manifest or the clip rather than
 * an error. `opusDurationMs`'s own docstring says a wrong `ms` is worse than an
 * absent one, and a brace read aloud to a child is worse than a bake that
 * refuses to run.
 */
describe('the two ways a bad clip used to get through', () => {
  /** One Ogg page, built the same way the fixture above builds them. */
  const pageOf = (type: number, granule: bigint, seq: number, body: Buffer) => {
    const p = Buffer.alloc(28 + body.length)
    p.write('OggS', 0, 'latin1')
    p[4] = 0
    p[5] = type
    p.writeBigUInt64LE(granule, 6)
    p.writeUInt32LE(0x4a554e4f, 14)
    p.writeUInt32LE(seq, 18)
    p[26] = 1
    p[27] = body.length
    body.copy(p, 28)
    return p
  }

  const opusHeadOf = (preSkip: number) => {
    const h = Buffer.alloc(19)
    h.write('OpusHead', 0, 'latin1')
    h[8] = 1
    h[9] = 1
    h.writeUInt16LE(preSkip, 10)
    return h
  }

  it('refuses a slot left in the HEAD, not only in the tail', () => {
    /*
     * The sweep used to sit inside the noun-pair branch, so a template whose
     * tail carried no `{a|b}` returned before the head was ever checked. Both
     * of today's templates happen to carry noun pairs, which is exactly the
     * luck that keeps a hole like this invisible until a new line arrives.
     */
    expect(() => splitTemplate('{who} says — {n} more friends arrive.'))
      .toThrow(/a slot survived the cut/)

    /* The legitimate single-tail template still cuts cleanly. */
    expect(splitTemplate('Ready! {n} to go.')).toEqual([
      { suffix: 'head', script: 'Ready!' },
      { suffix: 'tail', script: 'to go.' },
    ])
  })

  it('returns null rather than a duration it cannot stand behind', () => {
    const head = opusHeadOf(312)

    /* A page whose declared body runs off the end: a truncated download. */
    const truncated = Buffer.alloc(27 + 1 + 19)
    truncated.write('OggS', 0, 'latin1')
    truncated[4] = 0
    truncated[5] = 0x02
    truncated.writeBigUInt64LE(0n, 6)
    truncated[26] = 1
    truncated[27] = 200 /* claims 200 bytes of body that are not there */
    head.copy(truncated, 28)
    expect(opusDurationMs(truncated)).toBeNull()

    /* -1 is legal Ogg for a page completing no packet, and is not a duration. */
    expect(opusDurationMs(Buffer.concat([
      pageOf(0x02, 0n, 0, head),
      pageOf(0x04, 0xffffffffffffffffn, 1, Buffer.from([0])),
    ]))).toBeNull()
  })

  it('is not fooled by the bytes OggS appearing inside the audio', () => {
    /*
     * The scan used to run BACKWARDS for the bytes `OggS` and trust the first
     * hit. Opus payload is arbitrary compressed data, so a payload containing
     * that sequence was read as the final page header and a granule taken out
     * of the audio — a plausible-looking wrong `ms` in the manifest, which is
     * the one outcome the function is written to avoid.
     */
    const decoy = Buffer.concat([
      pageOf(0x02, 0n, 0, opusHeadOf(312)),
      pageOf(0x04, 24_312n, 1, Buffer.concat([Buffer.from('OggS', 'latin1'), Buffer.alloc(10)])),
    ])
    /* Followed forward, the true final granule is 24312 − 312 = 24000 → 500ms. */
    expect(opusDurationMs(decoy)).toBe(500)
  })
})
