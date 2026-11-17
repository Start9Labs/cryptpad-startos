import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, List, Value } = sdk

const KEY_FORMAT_HINT =
  'a CryptPad public signing key is exactly 44 characters ending in "=". Copy it from CryptPad under Settings → Account, or paste the whole profile link in the form [username@instance/key=].'

/**
 * Extract and canonicalize a CryptPad public signing key, from either a
 * profile-link (`[name@host/keyValue=]`) or a bare key.
 *
 * # Semantics are copied from upstream, not invented
 *
 * Mirrors `Keys.canonicalize` / `parseNewUser` in
 * src/common/common-signing-keys.js@2026.10.1. Two rules matter:
 *
 *   1. **Length is fixed at 44 characters** (an Ed25519 public key: 32 bytes
 *      base64 = 43 chars + '='). Upstream's `canonicalize` accepts a bare key
 *      only when `input.length === 44`, and its profile-link parser only
 *      matches `/([a-zA-Z0-9+-]{43}=)$/`.
 *   2. **`-` is the escaped form of `/`.** Profile links escape `/` to `-` so
 *      the key survives being embedded in a URL-ish string; upstream's
 *      `unescape` maps it back. We store the unescaped (canonical) form, which
 *      is what CryptPad's own `Env.admins` holds and what the /admin/ panel
 *      shows.
 *
 * There is **no `_` in this alphabet.** A previous revision of this function
 * accepted base64url `_` on the theory that "keys in the wild use both" — that
 * is wrong; upstream never produces or accepts `_`.
 *
 * # Why the length check is load-bearing
 *
 * The previous version validated the character set but not the length, so any
 * alphanumeric string (e.g. `notarealkey`) was accepted and written into
 * config.js. CryptPad does not grant that entry any access — its core node maps
 * config.adminKeys through `Keys.canonicalize` and `.filter(Boolean)`, so a
 * malformed key is dropped from `Env.admins` — but it is kept verbatim in
 * `Env.adminsData`, which is what the /admin/ panel renders. The visible
 * result is a junk row with a blank key that cannot be removed from the UI.
 * Worse, a user who merely typos a real key sees the action succeed while the
 * administrator silently has no access. Caught in v1 testing (checklist #10).
 */
const unescapeKey = (k: string) => k.replace(/-/g, '/')

/** 43 base64 chars + '='. `-` permitted as the escaped form of `/`. */
const KEY_BODY = /^[A-Za-z0-9+/-]{43}=$/

function extractKey(raw: string): string {
  const trimmed = raw.trim()

  // Profile-link form: [username@domain/<key>]
  // Upstream gates on /^\[.*?@.*\]$/ before extracting, so a bracketed string
  // without an '@' is a malformed link rather than a bare key.
  if (/^\[.*?@.*\]$/.test(trimmed)) {
    const m = trimmed.match(/\/([A-Za-z0-9+-]{43}=)\]$/)
    if (m) return unescapeKey(m[1])
    throw new Error(
      i18n('Invalid admin key:') + ' ' + raw + ' — ' + i18n(KEY_FORMAT_HINT),
    )
  }

  // Bare-key form.
  if (KEY_BODY.test(trimmed)) return unescapeKey(trimmed)

  throw new Error(
    i18n('Invalid admin key:') + ' ' + raw + ' — ' + i18n(KEY_FORMAT_HINT),
  )
}

const inputSpec = InputSpec.of({
  adminKeys: Value.list(
    List.text(
      {
        name: i18n('Administrator Public Keys'),
        description: i18n(
          "Each row is one administrator's public signing key, found in CryptPad under Settings → Account. Accepts either a bare key (e.g. CU6kIC-J4zPUqkXuWcxCApSvT4JkhpfBNbf13Mz+Vg4=) OR the full profile-link format ([username@instance.example.com/CU6k...]). This list is the complete new state, not a delta — to remove an administrator, delete its row and submit. Starts empty on a new install even if you already have an administrator: the setup-wizard admin is not stored here.",
        ),
        default: [],
      },
      {
        // Inline validation so a malformed key is caught before submit rather
        // than by the handler afterwards. Mirrors what `extractKey` enforces:
        // either a bare 44-char key, or a profile link whose trailing segment
        // is one. `extractKey` remains the authority — this is feedback, not a
        // replacement, and the two must be kept in step.
        patterns: [
          {
            regex: '^(\\[.*?@.*\\/[A-Za-z0-9+-]{43}=\\]|[A-Za-z0-9+/-]{43}=)$',
            description: i18n(
              'Must be a 44-character key ending in "=", or a full [username@instance/key=] profile link.',
            ),
          },
        ],
        placeholder: 'base64Key  or  [user@host/base64Key]',
      },
    ),
  ),
})

/**
 * This action is for first-admin emergency access (when the install token
 * URL was missed) and bulk add/remove from outside the running app. The
 * day-to-day path for managing admins is CryptPad's in-app /admin/#support
 * panel — see README.
 */
export const addAdminKey = sdk.Action.withInput(
  'add-admin-key',

  async ({ effects }) => ({
    name: i18n('Add Administrator by Public Key'),
    description: i18n(
      'CryptPad keeps TWO separate administrator lists, and this action manages only one of them: the keys written into config.js. Administrators created by the setup wizard, or promoted from inside CryptPad, live in a different list — they will NOT appear here, and this action cannot remove them (use CryptPad\'s own /admin/ panel for those). In the reverse direction, keys added here show up in /admin/ marked "added into config.js" with no Remove button, because re-running this action with the row deleted is the only way to revoke them. So an empty list here is normal on a new install, even when you already have a working administrator.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  // Pre-fill with the current saved keys so removal is obvious: edit the
  // list, delete a row, submit — the saved list IS the new state.
  async ({ effects }) => ({
    adminKeys: (await storeJson.read((s) => s.adminKeys).once()) ?? [],
  }),

  // Returns a result rather than completing silently. Without one, submitting
  // gives no confirmation of what was saved and the only way to check is to
  // reopen the action — and because the keys landing in config.js do not show
  // a Remove button in CryptPad's /admin/ panel, a user has no obvious way to
  // tell an accepted key from a dropped one.
  async ({ effects, input }) => {
    const cleaned = Array.from(
      new Set(input.adminKeys.map((raw: string) => extractKey(raw))),
    )
    await storeJson.merge(effects, { adminKeys: cleaned })

    return {
      version: '1' as const,
      title: i18n('Administrator List Updated'),
      message:
        cleaned.length === 0
          ? i18n(
              'All config.js administrator keys have been revoked. CryptPad is restarting to apply the change. Administrators created by the setup wizard or from inside the app are unaffected.',
            )
          : i18n(
              'CryptPad is restarting to apply the change. These keys will appear in the /admin/ panel marked "added into config.js"; to revoke one, re-run this action with its row deleted.',
            ),
      // A 'group' result, one member per key — not a single joined string.
      // Joining with newlines rendered as one run-on blob in the UI, which is
      // unreadable and un-copyable per key (reported in v1 testing).
      result:
        cleaned.length === 0
          ? {
              type: 'single' as const,
              value: i18n('(none)'),
              copyable: false,
              masked: false,
              qr: false,
              launchable: false,
            }
          : {
              type: 'group' as const,
              value: cleaned.map((key, i) => ({
                name: `${i18n('Administrator')} ${i + 1}`,
                description: null,
                type: 'single' as const,
                value: key,
                copyable: true,
                masked: false,
                qr: false,
                launchable: false,
              })),
            },
    }
  },
)
