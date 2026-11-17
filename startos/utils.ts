import { decreeLog } from './fileModels/decreeLog'
import { parseSetupState } from './setupState'

/**
 * Constants extracted from upstream's config/infra.example.js at tag 2026.10.1.
 * Re-verify if you bump CryptPad version:
 *   https://github.com/cryptpad/cryptpad/blob/2026.10.1/config/infra.example.js
 *
 * The point of these constants is to make every "magic number" in the wrapper
 * traceable to a specific upstream commit so a future maintainer can grep for
 * the constant name and find both the StartOS-side use and the upstream source.
 */

/** public.httpPort — main HTTP listener; the StartOS edge proxy targets this. */
export const UPSTREAM_HTTP_PORT = 3000 as const

/** public.httpSafePort — upstream's dev-only fallback for serving sandbox content
 *  on a second port when only one domain is available. We have two real
 *  domains via two MultiHosts on different hostnames, so this port is never
 *  reached externally. Documented here for grep-ability. */
export const UPSTREAM_HTTP_SAFE_PORT = 3001 as const

/** Upstream's Dockerfile seds installMethod into the example config.js the
 *  entrypoint would copy. We write our own config.js, so we must preserve this
 *  value ourselves (CryptPad's telemetry uses it). */
export const UPSTREAM_INSTALL_METHOD = 'docker' as const

/** public.httpHost — upstream's lib/load-config.js sets this to 0.0.0.0 for
 *  Docker only when CPAD_MAIN_DOMAIN is set, which we don't pass. */
export const UPSTREAM_HTTP_ADDRESS = '0.0.0.0' as const

/** CryptPad's container user — upstream Dockerfile@2026.10.1:
 *    groupadd cryptpad -g 4001 && useradd cryptpad -u 4001 -g 4001
 *  Any file or directory on the `main` volume that CryptPad needs to read
 *  or write must be chown'd to this UID/GID. The StartOS service runtime
 *  runs as root, so anything we create from package code defaults to root
 *  ownership and is unreadable by the cryptpad user inside the container
 *  unless we explicitly chown it. */
export const CRYPTPAD_UID = 4001 as const
export const CRYPTPAD_GID = 4001 as const

/** CryptPad HTTP server — main app, admin, checkup, sandbox, WebSocket proxy.
 *  Both MultiHost interfaces (ui, sandbox) bind this same port; CryptPad
 *  serves the same content regardless of Host. The browser enforces sandbox
 *  isolation via origin (origin ≠ sandboxOrigin). */
export const uiPort = UPSTREAM_HTTP_PORT

/**
 * Snapshot read of the setup state, for use inside actions.
 *
 * `.once()` rather than `.const(effects)` on purpose: an action wants the
 * current value, not a subscription that would re-trigger its caller. The
 * reactive path — the one that has to notice the daemon creating this file —
 * lives in `init/setup.ts` and reads the same model with `.const(effects)`.
 *
 * The parsing itself lives in `setupState.ts`, which is import-free so it can
 * be unit-tested without the SDK. See the comment there.
 */
export async function readSetupState() {
  return parseSetupState(await decreeLog.read((s) => s).once())
}
