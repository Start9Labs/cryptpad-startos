import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.10.1:0',
  releaseNotes: {
    en_US: `Updated CryptPad to 2026.10.1, which includes security fixes.

- Deleting a team or account no longer hangs on an endless spinner.
- Uploaded files can be shared with teams.

[Full upstream release notes](https://github.com/cryptpad/cryptpad/releases/tag/2026.10.1)`,
    es_ES: `Actualiza CryptPad a 2026.10.1, que incluye correcciones de seguridad.

- Eliminar un equipo o una cuenta ya no se queda cargando indefinidamente.
- Los archivos subidos se pueden compartir con equipos.

[Notas completas de la versión original](https://github.com/cryptpad/cryptpad/releases/tag/2026.10.1)`,
    de_DE: `Aktualisiert CryptPad auf 2026.10.1, mit Sicherheitskorrekturen.

- Das Löschen eines Teams oder Kontos bleibt nicht mehr in einer endlosen Ladeanzeige hängen.
- Hochgeladene Dateien lassen sich mit Teams teilen.

[Vollständige Upstream-Versionshinweise](https://github.com/cryptpad/cryptpad/releases/tag/2026.10.1)`,
    pl_PL: `Aktualizuje CryptPad do 2026.10.1, z poprawkami bezpieczeństwa.

- Usuwanie zespołu lub konta nie zawiesza się już na niekończącym się wskaźniku ładowania.
- Przesłane pliki można udostępniać zespołom.

[Pełne informacje o wydaniu upstream](https://github.com/cryptpad/cryptpad/releases/tag/2026.10.1)`,
    fr_FR: `Met à jour CryptPad vers 2026.10.1, qui comprend des correctifs de sécurité.

- La suppression d'une équipe ou d'un compte ne reste plus bloquée sur un indicateur de chargement sans fin.
- Les fichiers téléversés peuvent être partagés avec les équipes.

[Notes de version complètes en amont](https://github.com/cryptpad/cryptpad/releases/tag/2026.10.1)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
