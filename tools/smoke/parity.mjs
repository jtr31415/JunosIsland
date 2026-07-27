/**
 * Automated parity check: the rebuilt game vs the frozen original.
 *
 * Boots BOTH v0/junos-words.html and dist/words/junos-words.html in jsdom
 * under an identical seeded Math.random, drives the same scripted interaction
 * through each, and diffs the rendered #words DOM at every step.
 *
 * This is the machine half of M0's "plays identically" gate. It catches
 * anything that changes what gets rendered — word choice and order, class
 * names, segment markup, the number track, tile trays, slot filling.
 *
 * WHAT IT CANNOT CATCH, and why a human still has to play it once:
 *   - anything visual: CSS, layout, animation, the juice
 *   - anything audible: TTS voice and pacing, the sound effects
 *   - real timing and feel — jsdom has no frame loop
 *   - touch behaviour on an actual tablet
 *   - the battery, which is deliberately absent from the rebuild
 *
 * So: identical DOM here means the LOGIC ported faithfully. It does not mean
 * the game feels the same. Treat a pass as necessary, not sufficient.
 */
import { JSDOM, VirtualConsole } from 'jsdom'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const SEED = 20260726

/** Same PRNG as src/core/rng.ts and the golden harness. */
const seededSource = `
let __s = ${SEED} >>> 0;
Math.random = () => {
  globalThis.__draws = (globalThis.__draws || 0) + 1;
  __s = (__s + 0x6d2b79f5) >>> 0;
  let t = __s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
`

function boot(html, { isModule }) {
  const errors = []
  const vc = new VirtualConsole()
  vc.on('jsdomError', e => errors.push(e.message))

  let script = null
  let shell = html
  if (isModule) {
    const m = html.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/)
    if (!m) throw new Error('no inlined module script')
    script = m[1]
    shell = html.replace(m[0], '')
  } else {
    // The original's script is a classic script at the end of <body>; jsdom
    // will run it during parse, so seed Math.random before it.
    shell = html.replace('<script>', '<script>' + seededSource)
  }

  const dom = new JSDOM(shell, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      w.HTMLCanvasElement.prototype.getContext = () => ({
        clearRect() {}, save() {}, restore() {}, beginPath() {}, arc() {}, fill() {}, stroke() {},
        moveTo() {}, lineTo() {}, closePath() {}, fillRect() {}, setTransform() {}, scale() {},
        translate() {}, rotate() {}, ellipse() {}, quadraticCurveTo() {},
        createRadialGradient: () => ({ addColorStop() {} }),
      })
      // The stub MUST fire onfinish. flyStar banks the point in its onfinish
      // (v0:956); a stub that swallows it leaves scoring, reward, hatch and
      // album identically dead on both sides — green over an unrun economy.
      w.Element.prototype.animate = () => {
        const anim = { cancel() {}, finish() {} }
        let cb = null
        Object.defineProperty(anim, 'onfinish', {
          get: () => cb,
          set: fn => { cb = fn; if (fn) w.setTimeout(() => fn(), 0) },
        })
        return anim
      }
      // v0:1625 spectacle() reads matchMedia; without it the first reward
      // crashes the original's realm only.
      w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} })
      w.requestAnimationFrame = () => 0
      // A fake en-GB voice in BOTH realms. Without it both sides take the
      // no-voice fallback and the listen-then-tap loop — the actual game —
      // is never exercised. The spoken stream is then diffable, which catches
      // wrong targets, wrong Fred sequences and wrong praise copy.
      w.__spoken = []
      w.SpeechSynthesisUtterance = class {
        constructor(t) { this.text = t; this.onend = null; this.onerror = null }
      }
      w.speechSynthesis = {
        getVoices: () => [{ name: 'Sonia', lang: 'en-GB' }],
        speak(u) { w.__spoken.push(u.text); if (u.onend) w.setTimeout(() => u.onend(), 0) },
        cancel() {},
        onvoiceschanged: null,
      }
      // Count RNG draws so a divergence can be localised to a step rather
      // than presenting as a wall of downstream noise.
      w.__draws = 0
    },
  })

  if (isModule) {
    // Seed before the deferred module runs, matching the original's ordering.
    dom.window.eval(seededSource)
    dom.window.eval(script)
  }
  return { dom, errors }
}

/**
 * The comparable surface. Deliberately wider than #words: a wrong score
 * amount, toast, spoken word or hatched sticker all live outside the play
 * area, and diffing only #words would pass straight over the economy.
 */
function snapshot(dom) {
  const d = dom.window.document
  return [
    'words:' + playArea(dom),
    'score:' + (d.getElementById('scoreTxt')?.textContent ?? ''),
    'spoken:' + (dom.window.__spoken ?? []).join('>'),
    'toast:' + (d.getElementById('toast')?.textContent ?? ''),
    'target:' + (d.getElementById('targetCard')?.textContent ?? ''),
    'hint:' + (d.getElementById('hint')?.textContent ?? ''),
  ].join(String.fromCharCode(10))
}

function playArea(dom) {
  const box = dom.window.document.getElementById('words')
  if (!box) return '<no #words>'
  const walk = el => {
    const kids = [...el.children]
    const cls = el.className || ''
    const txt = kids.length ? '' : (el.textContent || '')
    return `${el.tagName.toLowerCase()}[${cls}]${txt ? '{' + txt + '}' : ''}` +
      (kids.length ? '(' + kids.map(walk).join(',') + ')' : '')
  }
  return [...box.children].map(walk).join('|')
}

const clickId = (dom, id) => {
  const el = dom.window.document.getElementById(id)
  if (el) el.dispatchEvent(new dom.window.Event('click', { bubbles: true }))
}
const forward = dom => {
  const scene = dom.window.document.getElementById('scene')
  scene?.dispatchEvent(new dom.window.MouseEvent('pointerdown',
    { bubbles: true, clientX: dom.window.innerWidth - 5, clientY: 300 }))
}

const original = boot(readFileSync(resolve(root, 'v0/junos-words.html'), 'utf8'), { isModule: false })
const rebuilt = boot(readFileSync(resolve(root, 'dist/words/junos-words.html'), 'utf8'), { isModule: true })

/** Same script through both. Mode switches, level switches, and new items. */
const STEPS = [
  ['initial reading round', () => {}, 0],
  ['forward to round 2', d => forward(d)],
  ['forward to round 3', d => forward(d)],
  ['reading level 2 (alien)', d => clickId(d, 'btnL2')],
  ['back to level 1', d => clickId(d, 'btnL1')],
  ['build mode', d => clickId(d, 'btnBuild')],
  ['forward a build word', d => forward(d)],
  ['build level 2', d => clickId(d, 'btnL2')],
  ['add mode', d => { clickId(d, 'btnL1'); clickId(d, 'btnAdd') }],
  ['forward a sum', d => forward(d)],
  ['add level 2', d => clickId(d, 'btnL2')],
  ['sub mode', d => { clickId(d, 'btnL1'); clickId(d, 'btnSub') }],
  ['sub level 3', d => clickId(d, 'btnL3')],
  ['back to reading', d => { clickId(d, 'btnL1'); clickId(d, 'btnRead') }],
  // The game IS listen-then-tap. Wait for the prompt, then tap the word that
  // was spoken — this drives flyStar -> onfinish -> addScore, the economy the
  // narrower diff would have skipped entirely.
  ['hear the target', null, 1300],
  ['tap the spoken word', d => tapSpokenWord(d), 900],
  ['tap the next word', d => tapSpokenWord(d), 900],
  ['tap the last word', d => tapSpokenWord(d), 900],
]

/**
 * jsdom timers are REAL timers, so the only way to let them fire is to yield
 * to the event loop. A busy-wait blocks it and nothing ever runs — which is
 * how the first version of this harness "passed" fourteen steps without ever
 * driving a single spoken word or scored tap.
 */
const wait = ms => new Promise(r => setTimeout(r, ms))

/**
 * Wait until a DOM has stopped changing of its own accord.
 *
 * The fix for the flake. Each step used to settle on a fixed sleep and then
 * snapshot both DOMs — but they are two independent jsdom instances running
 * REAL timers, so a scheduling hiccup on either one (a GC pause, a loaded
 * machine) left one finished and the other still mid-way. That reports several
 * steps as differing at once and then passes cleanly next run, which is
 * exactly the signature that was seen and exactly the kind of gate people stop
 * trusting.
 *
 * The nominal settle time is kept as a MINIMUM — it is part of the script's
 * meaning, not padding — and each DOM is then polled until its own snapshot
 * holds still. A DOM that never stops moving hits the cap and is compared
 * anyway, turning a hang into a visible diff rather than a stuck run.
 */
async function quiesce(dom, { quietFor = 3, poll = 25, cap = 3000 } = {}) {
  let last = snapshot(dom)
  let stable = 0
  const until = Date.now() + cap
  while (Date.now() < until) {
    await wait(poll)
    const now = snapshot(dom)
    if (now === last) {
      if (++stable >= quietFor) return true
    } else {
      stable = 0
      last = now
    }
  }
  return false
}

/** Tap whichever rendered word matches the most recently spoken text. */
function tapSpokenWord(dom) {
  const d = dom.window.document
  const spoken = dom.window.__spoken ?? []
  const want = spoken[spoken.length - 1]
  if (!want) return
  const el = [...d.querySelectorAll('#words .word')].find(w => w.textContent === want)
  if (el) el.dispatchEvent(new dom.window.MouseEvent('pointerdown', { bubbles: true }))
}

let mismatches = 0
console.log('step                        original vs rebuilt')
console.log('------------------------------------------------')
let restless = 0
for (const [name, act, settleMs] of STEPS) {
  if (act) { act(original.dom); act(rebuilt.dom) }
  if (settleMs) await wait(settleMs)
  /*
   * Both, concurrently, and only then compare. Waiting for them to AGREE would
   * mask the very differences this gate exists to find — each is waited out on
   * its own behaviour alone.
   */
  const settled = await Promise.all([quiesce(original.dom), quiesce(rebuilt.dom)])
  if (settled.includes(false)) restless++
  const a = snapshot(original.dom)
  const b = snapshot(rebuilt.dom)
  const same = a === b
  if (!same) mismatches++
  console.log(`${same ? 'ok  ' : 'DIFF'}  ${name}`)
  if (!same) {
    console.log('        original: ' + a.slice(0, 220))
    console.log('        rebuilt : ' + b.slice(0, 220))
  }
}

if (restless) {
  console.log('')
  console.log('note: ' + restless + ' step(s) never went quiet within the cap.'
    + ' If this is not zero, the comparisons above were read mid-flight.')
}

if (original.errors.length) console.log('\noriginal boot errors:', original.errors.join(' | '))
if (rebuilt.errors.length) console.log('rebuilt boot errors :', rebuilt.errors.join(' | '))

// Self-checks. A harness that silently stops exercising the real path is this
// project's known failure mode — green while proving nothing has happened
// twice already. Assert the speech and scoring channels actually ran.
const spokenA = original.dom.window.__spoken || []
const spokenB = rebuilt.dom.window.__spoken || []
const scoreA = original.dom.window.document.getElementById('scoreTxt').textContent
const scoreB = rebuilt.dom.window.document.getElementById('scoreTxt').textContent
console.log('')
console.log('self-check  spoken utterances : ' + spokenA.length + ' / ' + spokenB.length)
console.log('self-check  first spoken      : ' + JSON.stringify(spokenA.slice(0, 4)))
console.log('self-check  score bar         : "' + scoreA + '" / "' + scoreB + '"')
if (!spokenA.length || !spokenB.length) {
  console.log('SELF-CHECK FAILED: no speech occurred, so the listen-then-tap loop was never driven')
  mismatches++
}
if (!/[1-9]/.test(scoreA) || !/[1-9]/.test(scoreB)) {
  console.log('SELF-CHECK FAILED: score never moved, so flyStar -> addScore never ran')
  mismatches++
}

console.log(mismatches
  ? `\n${mismatches} step(s) differ — the port is NOT faithful`
  : '\nevery step renders identically')
process.exit(mismatches || rebuilt.errors.length ? 1 : 0)
