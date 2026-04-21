"use client";

import { useCallback, useEffect, useState } from "react";
import { createClerkSupabaseClient } from "@/lib/supabase";
import type { FxRateSnapshot } from "@/types";

interface FxRow {
  pair_key: string;
  base_currency: string;
  quote_currency: string;
  rate: number;
  trend: number[] | null;
  direction: "up" | "down" | "flat";
  summary: string;
  observed_at: string;
  updated_at: string;
}

function rowToSnapshot(row: FxRow): FxRateSnapshot {
  return {
    pairKey: row.pair_key,
    baseCurrency: row.base_currency,
    quoteCurrency: row.quote_currency,
    rate: Number(row.rate),
    trend: Array.isArray(row.trend) ? row.trend.map((value) => Number(value)) : [],
    direction: row.direction,
    summary: row.summary,
    observedAt: row.observed_at,
    updatedAt: row.updated_at,
  };
}

export function useFxRate(pairKey = "usd_cop") {
  const supabase = createClerkSupabaseClient();
  const [fxRate, setFxRate] = useState<FxRateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRate = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("fx_rates")
      .select("*")
      .eq("pair_key", pairKey)
      .maybeSingle();

    if (fetchError) {
      console.error("[useFxRate] fetch error:", fetchError.message);
      setError(true);
      setLoading(false);
      return;
    }

    setFxRate(data ? rowToSnapshot(data as FxRow) : null);
    setError(false);
    setLoading(false);
  }, [pairKey, supabase]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  useEffect(() => {
    const channelName = `fx:${pairKey}:${Date.now()}:${Math.random()
      .toString(36)
      .slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fx_rates",
          filter: `pair_key=eq.${pairKey}`,
        },
        (payload) => {
          if (payload.new) {
            setFxRate(rowToSnapshot(payload.new as FxRow));
            setLoading(false);
            setError(false);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [pairKey, supabase]);

  return { fxRate, loading, error, refetch: fetchRate };
}
