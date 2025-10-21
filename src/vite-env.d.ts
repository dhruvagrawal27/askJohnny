/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BACKEND_BASE_URL?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
