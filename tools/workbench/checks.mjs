/**
 * Done is evidence-based where an artefact exists.
 *
 * The Done button never refuses — Joe knows things this process does not, and a
 * tool that argues with its owner gets closed. It WARNS. "3 lessons still
 * draft" is information; blocking the tick on it would be the tool deciding
 * what counts as finished, which is not its job.
 *
 * Each validator returns `{ ok, warn }`. `ok` false with no warn means "no
 * evidence either way" — a manual task, where the answer is simply Joe's word.
 */
import { exists, readEnv, readJson } from './repo.mjs'
import { allLessons } from './lessons.mjs'

export function checkTask(root, task) {
  if (task.doneRule !== 'artefact') return { ok: true, warn: '' }
  const check = task.check ?? ''

  if (check === 'lessonsVetted') {
    const lessons = allLessons(root)
    const draft = lessons.filter(l => l.status !== 'vetted')
    if (!lessons.length) return { ok: false, warn: 'no lesson files found in joe/lessons/' }
    return draft.length
      ? { ok: false, warn: `${draft.length} of ${lessons.length} lessons still draft: ${draft.map(l => l.id).join(', ')}` }
      : { ok: true, warn: '' }
  }

  if (check.startsWith('envKey:')) {
    const key = check.slice(7)
    return readEnv(root)[key]
      ? { ok: true, warn: '' }
      : { ok: false, warn: `${key} is not in .env — the bake console cannot run without it` }
  }

  if (check.startsWith('fileExists:')) {
    const rel = check.slice(11)
    return exists(root, rel) ? { ok: true, warn: '' } : { ok: false, warn: `${rel} does not exist yet` }
  }

  if (check === 'voicesCast') {
    const v = readJson(root, 'joe/voices.json', { cast: {} })
    const placeholder = Object.entries(v.cast ?? {}).filter(([, c]) => !c.cast)
    return placeholder.length
      ? { ok: false, warn: `still on placeholder voices: ${placeholder.map(([k]) => k).join(', ')} (set cast: true when auditioned)` }
      : { ok: true, warn: '' }
  }

  return { ok: true, warn: '' }
}

/**
 * "Run D waits on N of your tasks."
 *
 * Read off the tasks' own `blocks` arrays rather than a second list, so a task
 * added in a later run announces what it holds up without anything else being
 * edited.
 */
export function blocking(tasks) {
  const out = {}
  for (const t of tasks) {
    if (t.state === 'done') continue
    for (const b of t.blocks ?? []) (out[b] ??= []).push(t.id)
  }
  return out
}
