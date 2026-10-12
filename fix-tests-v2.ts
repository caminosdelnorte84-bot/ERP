import { vi } from 'vitest';

(globalThis as any).import = {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://mock.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'mock-key',
      VITE_MOCK_AUTH: 'true'
    }
  }
};
