import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

let cachedClient: SupabaseClient<Database> | null = null;

export function hasSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!cachedClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
    }
    cachedClient = createClient<Database>(url, key, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}
