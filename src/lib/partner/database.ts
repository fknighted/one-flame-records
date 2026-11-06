import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as sessionClient, createServiceClient } from '@/lib/supabase/server';

// Same One Flame connection and session. Namespaced savings schema is introduced
// by the reviewed migration; no legacy Flames Partner credentials are used.
export async function createClient(): Promise<SupabaseClient> {
  return await sessionClient() as unknown as SupabaseClient;
}
// Only validated public form/token boundaries, mail delivery and guarded admin
// operations use this privileged client. Member screens use the session client.
export function createAdminClient(): SupabaseClient {
  return createServiceClient() as unknown as SupabaseClient;
}
