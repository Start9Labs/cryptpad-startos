import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.10.0:1',
  releaseNotes: {
    en_US: 'Now maintained by Start9 and published in the Start9 Registry.',
    es_ES: 'Ahora lo mantiene Start9 y se publica en el Start9 Registry.',
    de_DE:
      'Wird jetzt von Start9 gepflegt und in der Start9 Registry veröffentlicht.',
    pl_PL: 'Teraz utrzymywany przez Start9 i publikowany w Start9 Registry.',
    fr_FR: 'Désormais maintenu par Start9 et publié dans le Start9 Registry.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
