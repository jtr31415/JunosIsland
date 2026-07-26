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
const match = raw.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/)
if (!match) {
  console.error('FAIL: no inlined module script in the build')
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

setTimeout(() => {
  const d = dom.window.document
  const checks = [
    ['no runtime errors on boot', errors.length === 0, errors.join(' | ')],
    ['renders the first reading round', d.querySelectorAll('#words .word').length === 3,
     `got ${d.querySelectorAll('#words .word').length} words, expected MIN=3`],
    ['marks the tricky bit of a red word', d.querySelectorAll('#words .tk').length >= 1, 'no .tk span'],
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
