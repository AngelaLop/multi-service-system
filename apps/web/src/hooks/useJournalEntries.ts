"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import type { JournalEntry, MoodLevel } from "@/types";

interface JournalRow {
  id: string;
  user_id: string;
  date: string;
  mood: string;
  emotion: string;
  tags: string[];
  text: string;
  created_at: string;
}

function rowToEntry(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    mood: row.mood as MoodLevel,
    emotion: row.emotion,
    tags: row.tags || [],
    text: row.text || "",
    createdAt: row.created_at,
  };
}

export function useJournalEntries() {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[useJournalEntries] fetch error:", error.message);
    }
    if (data) {
      setEntries(data.map(rowToEntry));
    }
    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (payload: Omit<JournalEntry, "id">) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        date: payload.date,
        mood: payload.mood,
        emotion: payload.emotion,
        tags: payload.tags,
        text: payload.text,
        created_at: payload.createdAt,
      })
      .select()
      .single();

    if (error) {
      console.error("[useJournalEntries] insert error:", error.message);
      return;
    }
    if (data) {
      setEntries((prev) => [rowToEntry(data), ...prev]);
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) {
      console.error("[useJournalEntries] delete error:", error.message);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, loading, addEntry, deleteEntry, refetch: fetchEntries };
}
