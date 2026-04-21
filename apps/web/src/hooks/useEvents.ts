"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import type { PlannerEvent, EventColor } from "@/types";

interface EventRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  color: string;
  completed: boolean;
  created_at: string;
}

function rowToEvent(row: EventRow): PlannerEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    color: row.color as EventColor,
    completed: row.completed,
  };
}

// Simple event bus to sync all useEvents instances
const listeners = new Set<() => void>();
function notifyAll() {
  listeners.forEach((fn) => fn());
}

export function useEvents() {
  const supabase = createClerkSupabaseClient();
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!isLoaded) return;
    if (!user?.id) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date")
      .order("start_time");

    if (error) {
      console.error("[useEvents] fetch error:", error.message);
    }
    if (data) {
      setEvents(data.map(rowToEvent));
    }
    setLoading(false);
  }, [isLoaded, user?.id, supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Subscribe to cross-instance notifications so all useEvents hooks stay in sync
  useEffect(() => {
    listeners.add(fetchEvents);
    return () => { listeners.delete(fetchEvents); };
  }, [fetchEvents]);

  const addEvent = async (payload: Omit<PlannerEvent, "id">) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        title: payload.title,
        description: payload.description,
        date: payload.date,
        start_time: payload.startTime,
        end_time: payload.endTime,
        color: payload.color,
        completed: payload.completed,
      })
      .select()
      .single();

    if (error) {
      console.error("[useEvents] insert error:", error.message);
      return;
    }
    if (data) {
      setEvents((prev) => [...prev, rowToEvent(data)]);
      notifyAll();
    }
  };

  const updateEvent = async (event: PlannerEvent) => {
    const { error } = await supabase
      .from("events")
      .update({
        title: event.title,
        description: event.description,
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        color: event.color,
        completed: event.completed,
      })
      .eq("id", event.id);

    if (error) {
      console.error("[useEvents] update error:", error.message);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
    notifyAll();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error("[useEvents] delete error:", error.message);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    notifyAll();
  };

  const toggleComplete = async (id: string) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const newCompleted = !event.completed;
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: newCompleted } : e))
    );
    const { error } = await supabase
      .from("events")
      .update({ completed: newCompleted })
      .eq("id", id);
    if (error) {
      console.error("[useEvents] toggle error:", error.message);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, completed: !newCompleted } : e))
      );
    }
  };

  return { events, loading, addEvent, updateEvent, deleteEvent, toggleComplete, refetch: fetchEvents };
}
