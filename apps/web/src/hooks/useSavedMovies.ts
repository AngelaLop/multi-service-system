"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import type { SavedMovie, MovieSearchResult } from "@/types";

interface MovieRow {
  id: string;
  user_id: string;
  tmdb_id: string;
  title: string;
  director: string;
  release_date: string;
  poster_url: string;
  tmdb_rating: number;
  rating: number;
  notes: string;
  recommended_by: string;
  watched: boolean;
  created_at: string;
}

function rowToMovie(row: MovieRow): SavedMovie {
  return {
    id: row.id,
    userId: row.user_id,
    tmdbId: row.tmdb_id,
    title: row.title,
    director: row.director || "",
    releaseDate: row.release_date,
    posterUrl: row.poster_url,
    tmdbRating: Number(row.tmdb_rating) || 0,
    rating: row.rating,
    notes: row.notes || "",
    recommendedBy: row.recommended_by || "",
    watched: row.watched,
    createdAt: row.created_at,
  };
}

export function useSavedMovies() {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [movies, setMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[useSavedMovies] fetch error:", error.message);
    }
    if (data) {
      setMovies(data.map(rowToMovie));
    }
    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const saveMovie = async (result: MovieSearchResult, recommendedBy?: string) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("saved_movies")
      .insert({
        user_id: user.id,
        tmdb_id: result.tmdbId,
        title: result.title,
        director: "",
        release_date: result.releaseDate,
        poster_url: result.posterUrl,
        tmdb_rating: result.tmdbRating,
        rating: 0,
        notes: "",
        recommended_by: recommendedBy || "",
        watched: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[useSavedMovies] insert error:", error.message);
      return;
    }
    if (data) {
      setMovies((prev) => [rowToMovie(data), ...prev]);
    }
  };

  const unsaveMovie = async (id: string) => {
    const { error } = await supabase.from("saved_movies").delete().eq("id", id);
    if (error) {
      console.error("[useSavedMovies] delete error:", error.message);
      return;
    }
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMovie = async (id: string, updates: Partial<Pick<SavedMovie, "rating" | "notes" | "recommendedBy" | "watched">>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.recommendedBy !== undefined) dbUpdates.recommended_by = updates.recommendedBy;
    if (updates.watched !== undefined) dbUpdates.watched = updates.watched;

    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    const { error } = await supabase
      .from("saved_movies")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      console.error("[useSavedMovies] update error:", error.message);
    }
  };

  const isMovieSaved = (tmdbId: string) => movies.some((m) => m.tmdbId === tmdbId);

  return {
    movies,
    loading,
    saveMovie,
    unsaveMovie,
    updateMovie,
    isMovieSaved,
    refetch: fetchMovies,
  };
}
