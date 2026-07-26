import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

/**
 * The 2D game ships as ONE self-contained HTML file, because it is opened
 * from disk (file://) and file:// blocks ES module imports. Everything is
 * inlined so the artifact stays exactly the kind of thing it is today —
 * but generated from src/core/ rather than hand-maintained.
 */
export default defineConfig({
  root: resolve(here, 'src/words2d'),
  plugins: [viteSingleFile()],
  build: {
    outDir: resolve(here, 'dist/words'),
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
})
