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
      w.Element.prototype.animate = () => ({ onfinish: null, cancel() {}, finish() {} })
      w.requestAnimationFrame = () => 0
      // DELETE, not set-undefined: the speech wrapper checks
      // `'speechSynthesis' in window`, which is true for a property that
      // exists holding undefined (v0:745). Both games then take the
      // no-voice path, which is what we want for a headless diff.
      delete w.speechSynthesis
    },
  })

  if (isModule) {
    // Seed before the deferred module runs, matching the original's ordering.
    dom.window.eval(seededSource)
    dom.window.eval(script)
  }
  return { dom, errors }
}

/** The comparable surface: what the child actually sees in the play area. */
function snapshot(dom) {
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
  ['initial reading round', () => {}],
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
]

let mismatches = 0
console.log('step                        original vs rebuilt')
console.log('------------------------------------------------')
for (const [name, act] of STEPS) {
  act(original.dom)
  act(rebuilt.dom)
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

if (original.errors.length) console.log('\noriginal boot errors:', original.errors.join(' | '))
if (rebuilt.errors.length) console.log('rebuilt boot errors :', rebuilt.errors.join(' | '))

console.log(mismatches
  ? `\n${mismatches} step(s) differ — the port is NOT faithful`
  : '\nevery step renders identically')
process.exit(mismatches || rebuilt.errors.length ? 1 : 0)
