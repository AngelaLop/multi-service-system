"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";

export interface MovieInvite {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  tmdbId: string;
  title: string;
  posterUrl: string;
  proposedDate: string;
  proposedTime: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

interface InviteRow {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  tmdb_id: string;
  title: string;
  poster_url: string;
  proposed_date: string;
  proposed_time: string;
  message: string;
  status: string;
  created_at: string;
}

function rowToInvite(row: InviteRow): MovieInvite {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    recipientId: row.recipient_id,
    tmdbId: row.tmdb_id,
    title: row.title,
    posterUrl: row.poster_url,
    proposedDate: row.proposed_date,
    proposedTime: row.proposed_time,
    message: row.message,
    status: row.status as MovieInvite["status"],
    createdAt: row.created_at,
  };
}

export function useMovieInvites() {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [received, setReceived] = useState<MovieInvite[]>([]);
  const [sent, setSent] = useState<MovieInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    // Fetch all invites where user is sender or recipient
    const { data, error } = await supabase
      .from("movie_invites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[useMovieInvites] fetch error:", error.message);
    }
    if (data) {
      const all = data.map(rowToInvite);
      setReceived(all.filter((i) => i.recipientId === user.id));
      setSent(all.filter((i) => i.senderId === user.id));
    }
    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const sendInvite = async (invite: {
    recipientId: string;
    tmdbId: string;
    title: string;
    posterUrl: string;
    proposedDate: string;
    proposedTime: string;
    message: string;
  }) => {
    if (!user?.id) return;
    const { error } = await supabase.from("movie_invites").insert({
      sender_id: user.id,
      sender_name: user.firstName || user.emailAddresses?.[0]?.emailAddress || "Someone",
      recipient_id: invite.recipientId,
      tmdb_id: invite.tmdbId,
      title: invite.title,
      poster_url: invite.posterUrl,
      proposed_date: invite.proposedDate,
      proposed_time: invite.proposedTime,
      message: invite.message,
      status: "pending",
    });

    if (error) {
      console.error("[useMovieInvites] send error:", error.message);
      return false;
    }
    await fetchInvites();
    return true;
  };

  const respondToInvite = async (inviteId: string, status: "accepted" | "declined") => {
    const { error } = await supabase
      .from("movie_invites")
      .update({ status })
      .eq("id", inviteId);

    if (error) {
      console.error("[useMovieInvites] respond error:", error.message);
      return false;
    }
    setReceived((prev) =>
      prev.map((i) => (i.id === inviteId ? { ...i, status } : i))
    );
    return true;
  };

  const pendingCount = received.filter((i) => i.status === "pending").length;

  return { received, sent, loading, sendInvite, respondToInvite, pendingCount, refetch: fetchInvites };
}
