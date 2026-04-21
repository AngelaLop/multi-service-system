"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

let supabaseInstance: SupabaseClient | null = null;
let accessTokenFn: (() => Promise<string | null>) | null = null;

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
        accessToken: async () => (accessTokenFn ? await accessTokenFn() : null),
      }
    );
  }

  return supabaseInstance;
}

export function createClerkSupabaseClient(): SupabaseClient {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { getToken, isLoaded } = useAuth();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    accessTokenFn = isLoaded ? () => getToken() : async () => null;
  }, [getToken, isLoaded]);

  if (isLoaded) {
    accessTokenFn = () => getToken();
  }

  return getClient();
}
