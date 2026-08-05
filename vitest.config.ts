import { defineConfig } from 'vitest/config'

// Vitest 4 removed environmentMatchGlobs. Tests needing a DOM declare it
// per-file with a `@vitest-environment jsdom` docblock instead.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    /*
     * A CEILING ON WORKERS, BECAUSE THE SLOWEST TESTS HERE ARE CPU-BOUND SEARCHES.
     *
     * Vitest's default is one worker per core, and this machine has eighteen.
     * Every one of them is then competing for CPU, so a test's WALL CLOCK — which
     * is what the 5s deadline measures — stretches even though its work has not
     * changed. `coast.test.ts`'s "never walls their island in" is an exhaustive
     * search that costs ~7.7s of real compute alone; `sealing.test.ts`'s ring
     * search is the same shape. Oversubscribed, they timed out in five full-suite
     * runs out of six while passing every time on their own.
     *
     * NO TIMEOUT WAS RAISED, here or per-test. That is the distinction the
     * standing rule (PB-082's card) actually draws: widening a deadline hides a
     * test that has genuinely got slower, whereas this stops the machine from
     * making a correct test look slow. Measured over three full runs at this cap:
     * green every time, 60-79s, against ~80s uncapped and red five times in six.
     *
     * It is a no-op on CI, whose runners have two cores and would never have
     * spawned more than two workers anyway.
     */
    maxWorkers: 4,
  },
})
