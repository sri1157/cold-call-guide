// One Supabase client for the whole backend.
// The service-role key bypasses Row Level Security, so it must only ever live here,
// on the server. The browser never sees it.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.warn('[db] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing; database calls will fail.');
}

export const supabase = createClient(url || 'http://localhost', key || 'missing', {
  auth: { persistSession: false },
});
