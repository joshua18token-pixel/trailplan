import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client authenticated as a specific user.
 * This client will have the user's JWT so RLS policies (auth.uid()) work.
 */
export function createAuthClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}
