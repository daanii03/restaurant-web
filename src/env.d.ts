/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly AUTH_TOKEN: string;
  readonly CANCEL_SECRET: string;
  readonly RESEND_API_KEY: string;
  readonly PUBLIC_SITE_URL: string;
  readonly ADMIN_SECRET: string;
}

interface ImportMeta{
    readonly env: ImportMetaEnv;
}