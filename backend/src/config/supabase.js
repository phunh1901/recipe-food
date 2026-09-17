import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const authOptions = { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false };

const fetchWithTimeout = (url, options = {}) => fetch(url, {
  ...options,
  signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
});

// Every request gets its own user session. Never sign in on the admin client.
export const createAuthClient = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: authOptions, global: { fetch: fetchWithTimeout } }
);

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: authOptions, global: { fetch: fetchWithTimeout } }
);
