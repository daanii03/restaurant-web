/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly DATABASE_URL: string;
    readonly AUTH_TOKEN: string;
}

interface ImportMeta{
    readonly env: ImportMetaEnv;
}