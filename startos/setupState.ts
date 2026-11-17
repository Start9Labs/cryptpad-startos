/**
 * Setup-token state derived from CryptPad's decree log.
 *
 * # Why this file has no imports
 *
 * Deliberately dependency-free. The parser is the one piece of hand-rolled,
 * upstream-version-sensitive logic in this package, and it has already caused a
 * real bug once, so it carries a regression test (`setupState.test.ts`). Keeping
 * it free of imports means the test runs under plain `node --test` without
 * pulling in the SDK, the manifest, or any StartOS runtime.
 *
 * The I/O half lives in `utils.ts`, which reads the file through the
 * `decreeLog` file model and hands the raw contents here.
 *
 * # Decree shape
 *
 * Verified against `cryptpad-server@1.0.7` (the server CryptPad 2026.10.1
 * ships) — the token is 32 random bytes as 64 hex characters, emitted as:
 *
 *     ["ADD_INSTALL_TOKEN", [token], "", +new Date()]
 *
 * The log is newline-delimited JSON at `/data/decrees/decree.ndjson`.
 *
 * # Completion signal — verified against a real wizard run
 *
 * CryptPad does NOT emit a paired RM_INSTALL_TOKEN decree when the install
 * wizard finishes; the token line stays in the log forever. A real log after a
 * successful wizard run looks like:
 *
 *     ["ADD_INSTALL_TOKEN", ["<64-hex-token>"], "", t0]  ← from boot
 *     ["ADD_ADMIN_KEY",     ["<44-char-key=>"], "", t1]  ← from wizard
 *     ["SET_INSTANCE_NAME",   …]                         ← wizard customization
 *     ["SET_INSTANCE_DESCRIPTION", …]
 *     …
 *
 * The storage node only emits ADD_INSTALL_TOKEN when the instance has zero admins;
 * once an admin exists the existing token is simply never referenced again. So
 * "setup is done" is the presence of any ADD_ADMIN_KEY decree, not the removal
 * of the token.
 *
 * Note the envelope subtlety: the wizard's first-admin path sends
 * `['ADD_FIRST_ADMIN', ['ADD_ADMIN_KEY', [key]]]`, but `Admin.sendDecree` reads
 * `data[1]`, so what actually lands in the log is `["ADD_ADMIN_KEY", [key], …]`.
 * Scanning for ADD_ADMIN_KEY is therefore correct.
 *
 * Why it matters: the original RM_-scan parser would have left the setup task
 * pending forever regardless of wizard completion, and combined with the prior
 * 'critical' severity that produced an unrecoverable startup deadlock.
 */
export type SetupState =
  | { kind: 'waiting-for-daemon' }
  | { kind: 'pending'; token: string }
  | { kind: 'done' }

/**
 * Parse the decree log's raw contents into setup state.
 *
 * `raw` is null when the file does not exist or is empty — the decree file is
 * not created until CryptPad has bootstrapped at least once, so both URLs may
 * be set while the daemon has not yet emitted ADD_INSTALL_TOKEN. That is
 * 'waiting-for-daemon'.
 *
 * Tolerant by design: rows whose args are not an array (upstream really does
 * emit `["PROOFS_MIGRATED", 1, "server", t]`) and malformed trailing lines from
 * a partial append are skipped rather than throwing.
 */
export function parseSetupState(raw: string | null): SetupState {
  if (raw === null || raw.trim() === '') return { kind: 'waiting-for-daemon' }

  const lines = raw.split('\n').filter((line) => line.trim() !== '')
  let hasAdmin = false
  let liveToken: string | null = null
  for (const line of lines) {
    let parsed: unknown
    try {
      parsed = JSON.parse(line)
    } catch {
      // Skip malformed lines defensively — the decree log is append-only and a
      // partial write at the end could leave one bad line. Don't let it break
      // the whole parse.
      continue
    }
    if (!Array.isArray(parsed) || parsed.length < 2) continue
    const verb = parsed[0]
    const args = parsed[1]
    if (typeof verb !== 'string' || !Array.isArray(args)) continue

    if (verb === 'ADD_ADMIN_KEY') {
      // Wizard completed (or an admin was added through the in-app /admin/
      // panel). Either way: setup is done — no further token needed.
      hasAdmin = true
    } else if (verb === 'ADD_INSTALL_TOKEN' && typeof args[0] === 'string') {
      // Latest token wins. The log is append-only, so the last
      // ADD_INSTALL_TOKEN is the active one.
      liveToken = args[0]
    }
  }

  if (hasAdmin) return { kind: 'done' }
  if (liveToken !== null) return { kind: 'pending', token: liveToken }
  return { kind: 'waiting-for-daemon' }
}
