/// <reference types="vite/client" />
/// <reference types="google.maps" />

declare interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BACKEND_BASE_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare interface Window {
  google: typeof google;
}
