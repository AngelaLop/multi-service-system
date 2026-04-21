"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";

export interface Friend {
  id: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
}

export function useFriends() {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .order("friend_name");

    if (error) {
      console.error("[useFriends] fetch error:", error.message);
    }
    if (data) {
      setFriends(
        data.map((r: { id: string; friend_id: string; friend_name: string; friend_email: string }) => ({
          id: r.id,
          friendId: r.friend_id,
          friendName: r.friend_name,
          friendEmail: r.friend_email,
        }))
      );
    }
    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const addFriend = async (friendId: string, friendName: string, friendEmail: string) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("friends")
      .insert({
        user_id: user.id,
        friend_id: friendId,
        friend_name: friendName,
        friend_email: friendEmail,
      })
      .select()
      .single();

    if (error) {
      console.error("[useFriends] add error:", error.message);
      return;
    }
    if (data) {
      setFriends((prev) => [...prev, {
        id: data.id,
        friendId: data.friend_id,
        friendName: data.friend_name,
        friendEmail: data.friend_email,
      }]);
    }
  };

  const removeFriend = async (id: string) => {
    const { error } = await supabase.from("friends").delete().eq("id", id);
    if (error) {
      console.error("[useFriends] remove error:", error.message);
      return;
    }
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  const isFriend = (friendId: string) => friends.some((f) => f.friendId === friendId);

  return { friends, loading, addFriend, removeFriend, isFriend, refetch: fetchFriends };
}
