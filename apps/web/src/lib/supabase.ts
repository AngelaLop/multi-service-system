"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

// Singleton: one Supabase client, one token getter
let supabaseInstance: SupabaseClient | null = null;
let getTokenFn: (() => Promise<string | null>) | null = null;

function getClient(): SupabaseClient {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = getTokenFn ? await getTokenFn() : null;
            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set("Authorization", `Bearer ${clerkToken}`);
            }
            return fetch(url, { ...options, headers });
          },
        },
      }
    );
  }
  return supabaseInstance;
}

export function createClerkSupabaseClient(): SupabaseClient {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { session } = useSession();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Keep the module-level token getter in sync with the latest session
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    getTokenFn = session ? () => session.getToken() : null;
    return () => {
      getTokenFn = null;
    };
  }, [session]);

  // Set synchronously on first render too
  if (session && !getTokenFn) {
    getTokenFn = () => session.getToken();
  }

  return getClient();
}
