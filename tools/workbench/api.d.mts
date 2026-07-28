/**
 * Types for the one workbench module a TypeScript file imports.
 *
 * `vite.workbench.config.ts` is inside the typecheck, so its imports need
 * declarations. Deliberately thin — the API is plain JavaScript and stays
 * that way (the spec's lightweight law), and a full hand-written .d.ts would
 * be a second copy of it to keep in step.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

export declare function createApi(
  root: string,
): (req: IncomingMessage, res: ServerResponse, next?: () => void) => Promise<void>

export declare function serveStatic(
  dir: string, req: IncomingMessage, res: ServerResponse,
): boolean
