# Updating the upstream version

Upstream is the official **`cryptpad/cryptpad`** Docker image, pinned by tag.

The pin lives in **`Dockerfile`**, not in `startos/manifest/index.ts` — the manifest declares
`source: { dockerBuild: {} }` because this package builds a thin layer on top of upstream (it
bakes OnlyOffice in at build time). Nothing in `startos/` names an image tag.

## Determining the upstream version

```bash
gh release view -R cryptpad/cryptpad --json tagName -q .tagName
```

Two tag-format quirks:

- Upstream git tags carry **no `v` prefix** — the tag is `2026.10.0`, and
  `https://github.com/cryptpad/cryptpad/blob/v2026.10.0/...` is a 404.
- The Docker tag **does** carry a `version-` prefix — release `2026.10.0` publishes as
  `cryptpad/cryptpad:version-2026.10.0`.

Confirm the tag publishes both architectures the manifest declares (`x86_64`, `aarch64`):

```bash
curl -s https://hub.docker.com/v2/repositories/cryptpad/cryptpad/tags/version-<X.Y.Z> \
  | python3 -c "import sys,json;[print(i['architecture']) for i in json.load(sys.stdin)['images']]"
```

## Applying the bump

1. `Dockerfile` — edit the `FROM cryptpad/cryptpad:version-X.Y.Z` line.
2. **Re-verify the pinned upstream claims.** This is the part that silently rots. Several files
   cite upstream source at a specific tag (`@2026.10.0`) and encode assumptions about it. Check
   each against the new tag and update the marker. Since 2026.10.0 the server itself is the
   separate `cryptpad-server` npm package (version pinned in upstream's `package-lock.json`); its
   published `build/*.js` bundles are what to read, cited as `cryptpad-server@<version>`:

   | What to check | Upstream file | Why it matters |
   |---|---|---|
   | `[ ! -f /cryptpad/config/config.js ]` and `infra.js` guards | `docker-entrypoint.sh` | Our pre-written files depend on these guards to bypass the entrypoint's copy-the-example branches |
   | Which keys live in `config.js` vs `infra.js`; the `CPAD_MAIN_DOMAIN` override | `lib/load-config.js`, `config/*.example.js` | `startos/cryptpadConfig.ts`; the env override would rebind internal nodes to `0.0.0.0` |
   | `ADD_INSTALL_TOKEN` decree shape; the zero-admins gate; the `/install/#<token>` URL | `cryptpad-server` `build/storage.js` | `startos/setupState.ts` parses the log by hand |
   | `ADD_ADMIN_KEY` is what lands in the log | `cryptpad-server` `build/core.js` (`Admin.addFirstAdmin`, `Admin.sendDecree`) | The wizard sends `['ADD_FIRST_ADMIN', ['ADD_ADMIN_KEY', [key]]]`, but `sendDecree` reads `data[1]`, so the log line is `["ADD_ADMIN_KEY", [key], "", ts]`. That's the completion signal `setupState.ts` keys on — if the envelope handling ever changes, the setup task stops clearing |
   | `/cryptpad_websocket` upgrade on the public port | `cryptpad-server` `build/http.worker.js` | Justifies never binding the `infra.js` node ports externally |
   | `setHeaders` CSP/COEP/CORP behavior | `cryptpad-server` `build/http.worker.js` | Justifies the "no in-container reverse proxy" rule in `Dockerfile` |
   | Every storage path default (`Core.getPaths`, `paths.base` users) | `cryptpad-server` `build/storage.js` | A path left at its `./data/…` default lands in the ephemeral rootfs; `cryptpadConfig.ts` must point each persistent one at `/data/` |
   | `--accept-license` / `--trust-repository`; `dist/` vs `onlyoffice-conf/` split | `install-office.sh` | The office-editor bake and the `onlyoffice-conf` volume mount |
   | UID/GID still 4001 | `Dockerfile` | Every `chown` in `startos/main.ts` and `startos/init/writeLoginSalt.ts` |
   | The IIFE module-factory wrapper | `customize.dist/application_config.js` | `writeLoginSalt.ts` reproduces this shape verbatim; a mismatch throws in the browser and hangs the SPA |
   | Port defaults, `installMethod`, `httpHost`, and every path key | `config/config.example.js`, `config/infra.example.js` | `startos/utils.ts` and `startos/cryptpadConfig.ts` |

3. Update the `@<version>` markers in comments across `Dockerfile`, `startos/utils.ts`,
   `startos/cryptpadConfig.ts`, `startos/setupState.ts`, `startos/main.ts`, `startos/interfaces.ts`.
