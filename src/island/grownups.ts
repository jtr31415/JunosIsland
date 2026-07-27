/**
 * The grown-ups' dialogs, in the game's own interface.
 *
 * These were `prompt()` and `confirm()`, which is fine for a debug affordance
 * and wrong for something a parent is meant to use. A browser dialog on a
 * tablet is a grey system slab in a different typeface, it cannot be styled,
 * it looks like the page has broken, and `prompt()` for a PIN shows a text
 * keyboard when what is wanted is four digits.
 *
 * So: the same panel the name prompt already uses, a real keypad, and buttons
 * big enough for a thumb. Everything here resolves a promise, so the calling
 * code reads exactly as it did with the browser dialogs.
 *
 * Deliberately NOT part of `overlay.ts`. That owns the challenge surface —
 * what the child sees while she is working — and this is the one part of the
 * game she is not meant to be using.
 */

/** A modal panel over the world, dismissible by tapping outside it. */
function panel(root: HTMLElement, build: (box: HTMLElement) => void,
  onDismiss: () => void): () => void {
  const wrap = document.createElement('div')
  wrap.className = 'overlay grownups'

  const box = document.createElement('div')
  box.className = 'chunk overlay-panel grownups-panel'
  build(box)

  wrap.append(box)
  root.append(wrap)

  const close = (): void => { wrap.remove() }
  wrap.addEventListener('pointerdown', e => {
    // Only a tap on the backdrop itself, never one that bubbled from a button.
    if (e.target === wrap) { close(); onDismiss() }
  })
  return close
}

const heading = (text: string): HTMLElement => {
  const h = document.createElement('div')
  h.className = 'grownups-title'
  h.textContent = text
  return h
}

const note = (text: string): HTMLElement => {
  const p = document.createElement('div')
  p.className = 'grownups-note'
  p.textContent = text
  return p
}

/**
 * Four digits, on a keypad.
 *
 * The PIN is the day and month (v0:2095-2122) — a grown-up knows today's date
 * and a six-year-old does not reliably, and it needs no account, no server and
 * no secret to store. A keypad rather than a text field because that is what
 * four digits deserve, and because a text input summons a full keyboard over
 * half the screen on the device this actually runs on.
 *
 * Resolves true when the PIN is right, false if she backs out. A wrong PIN
 * shakes and clears rather than closing: mistyping is not the same as changing
 * your mind, and a parent should not have to start the journey again.
 */
export function askPin(root: HTMLElement, expected: string): Promise<boolean> {
  return new Promise(resolve => {
    let entered = ''
    let dots: HTMLElement
    let close: () => void

    const render = (): void => {
      dots.textContent = '••••'.slice(0, entered.length) + '––––'.slice(entered.length)
    }

    const press = (digit: string): void => {
      if (entered.length >= 4) return
      entered += digit
      render()
      if (entered.length < 4) return
      if (entered === expected) { close(); resolve(true); return }
      // Wrong: say so without scolding, and let them try again.
      dots.classList.add('grownups-wrong')
      setTimeout(() => {
        entered = ''
        dots.classList.remove('grownups-wrong')
        render()
      }, 450)
    }

    close = panel(root, box => {
      box.append(heading('Grown-ups'))
      box.append(note('Today’s date — day then month, four digits.'))

      dots = document.createElement('div')
      dots.className = 'grownups-dots'
      box.append(dots)
      render()

      const pad = document.createElement('div')
      pad.className = 'grownups-pad'
      for (const key of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']) {
        if (key === '') { pad.append(document.createElement('span')); continue }
        const b = document.createElement('button')
        b.className = 'chunk chunk-button grownups-key'
        b.textContent = key
        b.onclick = () => {
          if (key === '⌫') { entered = entered.slice(0, -1); render(); return }
          press(key)
        }
        pad.append(b)
      }
      box.append(pad)

      const back = document.createElement('button')
      back.className = 'chunk chunk-button overlay-back'
      back.textContent = 'never mind'
      back.onclick = () => { close(); resolve(false) }
      box.append(back)
    }, () => resolve(false))
  })
}

export interface Choice { id: string; label: string; detail?: string }

/**
 * A list of things a grown-up might do, one button each.
 *
 * Replaces a numbered `prompt()`, which asked someone to read a list and then
 * type a digit — two steps and a chance to mistype, where a tap is neither.
 */
export function askChoice(
  root: HTMLElement, title: string, choices: readonly Choice[],
): Promise<string | null> {
  return new Promise(resolve => {
    const close = panel(root, box => {
      box.append(heading(title))
      const list = document.createElement('div')
      list.className = 'grownups-list'
      for (const choice of choices) {
        const b = document.createElement('button')
        b.className = 'chunk chunk-button grownups-choice'
        const label = document.createElement('span')
        label.className = 'grownups-choice-label'
        label.textContent = choice.label
        b.append(label)
        if (choice.detail) {
          const d = document.createElement('span')
          d.className = 'grownups-choice-detail'
          d.textContent = choice.detail
          b.append(d)
        }
        b.onclick = () => { close(); resolve(choice.id) }
        list.append(b)
      }
      box.append(list)

      const back = document.createElement('button')
      back.className = 'chunk chunk-button overlay-back'
      back.textContent = 'close'
      back.onclick = () => { close(); resolve(null) }
      box.append(back)
    }, () => resolve(null))
  })
}

/**
 * Yes or no, with the consequence spelled out.
 *
 * `danger` colours the confirming button, because the two questions asked
 * through this — replace an island from a backup, wipe one — are the only
 * irreversible things in the whole game, and they should not look like the
 * same button as "back up to a file".
 */
export function askConfirm(
  root: HTMLElement, title: string, body: string,
  yes: string, danger = false,
): Promise<boolean> {
  return new Promise(resolve => {
    const close = panel(root, box => {
      box.append(heading(title))

      const text = document.createElement('div')
      text.className = 'grownups-body'
      // Line by line, so a summary of what is about to be replaced reads as a
      // summary rather than as one long sentence.
      for (const line of body.split('\n')) {
        const row = document.createElement('div')
        row.textContent = line
        if (line === '') row.className = 'grownups-gap'
        text.append(row)
      }
      box.append(text)

      const row = document.createElement('div')
      row.className = 'overlay-controls'

      const go = document.createElement('button')
      go.className = `chunk chunk-button ${danger ? 'grownups-danger' : 'overlay-again'}`
      go.textContent = yes
      go.onclick = () => { close(); resolve(true) }

      const back = document.createElement('button')
      back.className = 'chunk chunk-button overlay-back'
      back.textContent = 'cancel'
      back.onclick = () => { close(); resolve(false) }

      row.append(go, back)
      box.append(row)
    }, () => resolve(false))
  })
}
