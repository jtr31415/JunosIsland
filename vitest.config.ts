import { defineConfig } from 'vitest/config'

// Vitest 4 removed environmentMatchGlobs. Tests needing a DOM declare it
// per-file with a `@vitest-environment jsdom` docblock instead.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
