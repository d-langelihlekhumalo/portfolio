/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute site origin used for canonical / Open Graph URLs. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
