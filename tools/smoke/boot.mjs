/**
 * Boot smoke test for the built 2D game.
 *
 * The unit tests prove the modules; this proves the ARTIFACT — that the
 * single-file build actually starts, wires itself to the DOM, and renders a
 * playable first round. It is the automated half of M0's integration proof
 * ("the 2D game keeps shipping from these modules"); the manual parity check
 * against v0/junos-words.html is the other half.
 *
 * Run after `npm run build:words`.
 *
 * Note on how the script is executed: vite-plugin-singlefile inlines the
 * bundle as <script type="module"> in <head>. jsdom does not execute module
 * scripts, and `defer` is ignored on inline scripts, so neither can be used to
 * fake it. Instead the script is extracted and evaluated once the DOM exists —
 * which is exactly what a deferred module script does in a browser.
 */
import { JSDOM, VirtualConsole } from 'jsdom'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const artifact = resolve(here, '../../dist/words/junos-words.html')

const raw = readFileSync(artifact, 'utf8')
// Must be type="module": that is what makes the inlined script deferred, and
// therefore what makes it safe for the build to place it in <head>. A classic
// inline script there would run before the DOM exists and crash on $('fx') in
// a real browser, while this harness — which evals post-parse — would still
// pass. Assert the property rather than assume it.
const match = raw.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/)
if (!match) {
  console.error('FAIL: no inlined <script type="module"> in the build')
  process.exit(1)
}

const errors = []
const vc = new VirtualConsole()
vc.on('jsdomError', e => errors.push(e.message))

const dom = new JSDOM(raw.replace(match[0], ''), {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(w) {
    // jsdom implements neither canvas nor the Web Animations API.
    w.HTMLCanvasElement.prototype.getContext = () => ({
      clearRect() {}, save() {}, restore() {}, beginPath() {}, arc() {}, fill() {}, stroke() {},
      moveTo() {}, lineTo() {}, closePath() {}, fillRect() {}, setTransform() {}, scale() {},
      translate() {}, rotate() {}, ellipse() {}, quadraticCurveTo() {},
      createRadialGradient: () => ({ addColorStop() {} }),
    })
    w.Element.prototype.animate = () => ({ onfinish: null, cancel() {}, finish() {} })
    w.requestAnimationFrame = () => 0
  },
})

try {
  dom.window.eval(match[1])
} catch (e) {
  errors.push('eval: ' + e.message)
}

/**
 * Walk the wiring paths the unit tests cannot reach, because shell.ts is a
 * single @ts-nocheck module with no unit tests of its own. Two regressions
 * (the help buttons, the gear menu) hid in exactly this gap.
 */
function click(d, id) {
  const el = d.getElementById(id)
  if (!el) throw new Error('missing element: ' + id)
  el.dispatchEvent(new dom.window.Event('click', { bubbles: true }))
}

setTimeout(() => {
  const d = dom.window.document

  // Drive forward two rounds before asserting anything about red words.
  // Round 1 is n=3, reds=1, but the neighbour substitution can replace the
  // sole red with a green-classed twin (v0:822-828) — the frozen original's
  // own first round under the golden seed is has/him/his, all green. By round
  // 3 (n=5, reds=2) at least one red always survives.
  const scene = d.getElementById('scene')
  const fwd = () => scene.dispatchEvent(new dom.window.MouseEvent('pointerdown',
    { bubbles: true, clientX: dom.window.innerWidth - 5, clientY: 300 }))
  fwd(); fwd()

  // Capture BEFORE the wiring walk: it ends with btnReset, which wipes history
  // and returns the game to round 1, where a red word is not guaranteed.
  const trickyByRound3 = d.querySelectorAll('#words .tk').length
  const wordsInRound3 = d.querySelectorAll('#words .word').length

  const wiringErrors = []
  const tryIt = (name, fn) => { try { fn() } catch (e) { wiringErrors.push(name + ': ' + e.message) } }
  tryIt('mode build', () => click(d, 'btnBuild'))
  tryIt('mode add', () => click(d, 'btnAdd'))
  tryIt('mode sub', () => click(d, 'btnSub'))
  tryIt('level 3', () => click(d, 'btnL3'))
  tryIt('level 1', () => click(d, 'btnL1'))
  tryIt('mode read', () => click(d, 'btnRead'))
  tryIt('say again', () => click(d, 'btnSay'))
  tryIt('theme space', () => click(d, 'btnSpace'))
  tryIt('theme ocean', () => click(d, 'btnOcean'))
  tryIt('sound toggle', () => { click(d, 'btnSound'); click(d, 'btnSound') })
  tryIt('book open', () => click(d, 'btnBook'))
  tryIt('book close', () => click(d, 'bkClose'))
  tryIt('reset', () => click(d, 'btnReset'))

  const checks = [
    ['no runtime errors on boot', errors.length === 0, errors.join(' | ')],
    ['renders a growing reading round', wordsInRound3 === 5, `round 3 had ${wordsInRound3} words, expected 5`],
    ['marks the tricky bit of a red word by round 3', trickyByRound3 >= 1,
     'no .tk span after two forward taps'],
    ['every wiring path runs without throwing', wiringErrors.length === 0, wiringErrors.join(' | ')],
    ['builds the ambience layer', (d.getElementById('ambience')?.children.length ?? 0) > 0, 'ambience empty'],
    ['battery is retired', d.getElementById('battery') === null, 'battery element still present'],
    ['reading mode is active', d.getElementById('btnRead')?.classList.contains('on'), 'read button not on'],
    ['score bar initialised', /\d/.test(d.getElementById('scoreTxt')?.textContent ?? ''), 'no score text'],
  ]

  let failed = 0
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : ' — ' + detail}`)
    if (!ok) failed++
  }
  console.log(failed ? `\n${failed} check(s) failed` : '\nall boot checks passed')
  process.exit(failed ? 1 : 0)
}, 900)
