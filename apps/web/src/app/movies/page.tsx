"use client";

import { useState } from "react";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import { useSavedMovies } from "@/hooks/useSavedMovies";
import { useEvents } from "@/hooks/useEvents";
import { useMovieInvites } from "@/hooks/useMovieInvites";
import { useFriends } from "@/hooks/useFriends";
import { todayString } from "@/lib/dates";
import type { MovieSearchResult, SavedMovie } from "@/types";

type SortOption = "recent" | "title" | "rating" | "tmdb";
type FilterOption = "all" | "unwatched" | "watched";
type TabOption = "search" | "watchlist" | "invites";

function MovieDetailModal({
  movie,
  onClose,
  onUpdate,
  onUnsave,
  onSchedule,
  onInvite,
  friends,
  onAddFriend,
}: {
  movie: SavedMovie;
  onClose: () => void;
  onUpdate: (updates: Partial<Pick<SavedMovie, "rating" | "notes" | "recommendedBy" | "watched">>) => void;
  onUnsave: () => void;
  onSchedule: (date: string, startTime: string) => void;
  onInvite: (recipientId: string, date: string, time: string, message: string) => Promise<boolean>;
  friends: { id: string; friendId: string; friendName: string; friendEmail: string }[];
  onAddFriend: (friendId: string, name: string, email: string) => void;
}) {
  const [notes, setNotes] = useState(movie.notes);
  const [recommendedBy, setRecommendedBy] = useState(movie.recommendedBy);
  const [imgError, setImgError] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(todayString());
  const [scheduleTime, setScheduleTime] = useState("20:00");
  const [scheduled, setScheduled] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSearching, setInviteSearching] = useState(false);
  const [foundUsers, setFoundUsers] = useState<{ id: string; firstName: string; lastName: string; email: string }[]>([]);
  const [inviteDate, setInviteDate] = useState(todayString());
  const [inviteTime, setInviteTime] = useState("20:00");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  async function searchUsers() {
    if (!inviteEmail.trim()) return;
    setInviteSearching(true);
    try {
      const res = await fetch(`/api/users/search?email=${encodeURIComponent(inviteEmail.trim())}`);
      const data = await res.json();
      setFoundUsers(Array.isArray(data) ? data : []);
    } catch {
      setFoundUsers([]);
    }
    setInviteSearching(false);
  }

  async function handleSendInvite(recipientId: string) {
    const success = await onInvite(recipientId, inviteDate, inviteTime, inviteMessage);
    if (success) {
      setInviteSent(true);
      setShowInvite(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--bg-secondary)",
          border: "var(--border-width) solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poster header */}
        <div className="flex gap-4 p-5">
          <div
            className="w-28 shrink-0 rounded overflow-hidden"
            style={{ background: "var(--bg-tertiary)", aspectRatio: "2/3" }}
          >
            {!imgError && movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1" style={{ opacity: 0.3 }}>
                  <path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {movie.title}
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {movie.releaseDate && movie.releaseDate.substring(0, 4)}
            </p>
            {movie.tmdbRating > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {movie.tmdbRating}/10
                </span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>TMDB</span>
              </div>
            )}
            {/* Watched toggle */}
            <button
              onClick={() => onUpdate({ watched: !movie.watched })}
              className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors"
              style={{
                background: movie.watched ? "var(--accent-start)" : "var(--bg-tertiary)",
                color: movie.watched ? "white" : "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {movie.watched ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Watched
                </>
              ) : (
                "Mark as watched"
              )}
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Your rating */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Your Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onUpdate({ rating: star === movie.rating ? 0 : star })}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={star <= movie.rating ? "var(--accent-start)" : "none"}
                    stroke="var(--accent-start)"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Recommended by */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Recommended by
            </label>
            <input
              type="text"
              value={recommendedBy}
              onChange={(e) => setRecommendedBy(e.target.value)}
              onBlur={() => onUpdate({ recommendedBy })}
              placeholder="Who told you about this movie?"
              className="w-full px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "var(--border-width) solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdate({ notes })}
              placeholder="Thoughts, reactions, favorite scenes..."
              rows={3}
              className="w-full px-3 py-2 text-sm outline-none resize-none"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "var(--border-width) solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
              }}
            />
          </div>

          {/* Schedule to watch */}
          <div>
            {!showSchedule && !scheduled && (
              <button
                onClick={() => setShowSchedule(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-width) solid var(--border-color)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Schedule movie night
              </button>
            )}
            {showSchedule && (
              <div className="space-y-3 p-3" style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs outline-none"
                      style={{
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "var(--border-width) solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs outline-none"
                      style={{
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "var(--border-width) solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onSchedule(scheduleDate, scheduleTime);
                      setShowSchedule(false);
                      setScheduled(true);
                    }}
                    className="flex-1 py-2 text-xs font-medium text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    Add to Calendar
                  </button>
                  <button
                    onClick={() => setShowSchedule(false)}
                    className="px-3 py-2 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {scheduled && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--accent-start)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Added to your calendar!
              </div>
            )}
          </div>

          {/* Invite to watch together */}
          <div>
            {!showInvite && !inviteSent && (
              <button
                onClick={() => setShowInvite(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-width) solid var(--border-color)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                Invite someone to watch together
              </button>
            )}
            {showInvite && (
              <div className="space-y-3 p-3" style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}>
                {/* Date/time + message */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>When?</label>
                    <input type="date" value={inviteDate} onChange={(e) => setInviteDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs outline-none"
                      style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "var(--border-width) solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>Time</label>
                    <input type="time" value={inviteTime} onChange={(e) => setInviteTime(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs outline-none"
                      style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "var(--border-width) solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                  className="w-full px-2 py-1.5 text-xs outline-none"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "var(--border-width) solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                />

                {/* Friends list */}
                {friends.length > 0 && (
                  <div>
                    <label className="block text-[10px] mb-1.5" style={{ color: "var(--text-tertiary)" }}>Your friends</label>
                    <div className="space-y-1.5">
                      {friends.map((f) => (
                        <div key={f.friendId} className="flex items-center justify-between p-2 rounded" style={{ background: "var(--bg-secondary)" }}>
                          <div>
                            <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{f.friendName}</div>
                            <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{f.friendEmail}</div>
                          </div>
                          <button
                            onClick={() => handleSendInvite(f.friendId)}
                            className="px-3 py-1 text-[10px] font-medium text-white"
                            style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))", borderRadius: "var(--radius-sm)" }}
                          >
                            Invite
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search for new people */}
                <div>
                  <label className="block text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    {friends.length > 0 ? "Or find someone new" : "Find a user by email"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@email.com"
                      className="flex-1 px-2 py-1.5 text-xs outline-none"
                      style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "var(--border-width) solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                      onKeyDown={(e) => { if (e.key === "Enter") searchUsers(); }}
                    />
                    <button
                      onClick={searchUsers}
                      disabled={inviteSearching}
                      className="px-3 py-1.5 text-[10px] font-medium text-white"
                      style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))", borderRadius: "var(--radius-sm)" }}
                    >
                      {inviteSearching ? "..." : "Find"}
                    </button>
                  </div>
                </div>
                {foundUsers.length > 0 && (
                  <div className="space-y-1.5">
                    {foundUsers.map((u) => {
                      const alreadyFriend = friends.some((f) => f.friendId === u.id);
                      return (
                        <div key={u.id} className="flex items-center justify-between p-2 rounded" style={{ background: "var(--bg-secondary)" }}>
                          <div>
                            <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{u.firstName} {u.lastName}</div>
                            <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{u.email}</div>
                          </div>
                          <div className="flex gap-1.5">
                            {!alreadyFriend && (
                              <button
                                onClick={() => onAddFriend(u.id, `${u.firstName} ${u.lastName}`.trim(), u.email)}
                                className="px-2 py-1 text-[10px] font-medium"
                                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)", border: "var(--border-width) solid var(--border-color)" }}
                              >
                                + Friend
                              </button>
                            )}
                            <button
                              onClick={() => handleSendInvite(u.id)}
                              className="px-2 py-1 text-[10px] font-medium text-white"
                              style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))", borderRadius: "var(--radius-sm)" }}
                            >
                              Invite
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {foundUsers.length === 0 && inviteEmail && !inviteSearching && (
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>No users found. They need an account first.</p>
                )}
                <button onClick={() => setShowInvite(false)} className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Cancel</button>
              </div>
            )}
            {inviteSent && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--accent-start)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                Invite sent!
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Done
            </button>
            <button
              onClick={() => { onUnsave(); onClose(); }}
              className="px-4 py-2.5 text-xs font-medium"
              style={{
                background: "var(--event-red-bg)",
                color: "var(--event-red-text)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MoviesPage() {
  const {
    movies,
    loading,
    saveMovie,
    unsaveMovie,
    updateMovie,
    isMovieSaved,
  } = useSavedMovies();
  const { addEvent } = useEvents();
  const { sendInvite, received, respondToInvite, pendingCount } = useMovieInvites();
  const { friends, addFriend } = useFriends();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<TabOption>("search");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [filterText, setFilterText] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<SavedMovie | null>(null);
  const [saveRecommendedBy, setSaveRecommendedBy] = useState("");
  const [showRecommendPrompt, setShowRecommendPrompt] = useState<MovieSearchResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }

  function handleSaveWithRecommendation(movie: MovieSearchResult) {
    setShowRecommendPrompt(movie);
    setSaveRecommendedBy("");
  }

  function confirmSave() {
    if (showRecommendPrompt) {
      saveMovie(showRecommendPrompt, saveRecommendedBy);
      setShowRecommendPrompt(null);
    }
  }

  const sortedMovies = [...movies]
    .filter((m) => {
      if (filterBy === "watched" && !m.watched) return false;
      if (filterBy === "unwatched" && m.watched) return false;
      if (filterText) {
        const q = filterText.toLowerCase();
        return m.title.toLowerCase().includes(q) || m.recommendedBy.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "tmdb") return b.tmdbRating - a.tmdbRating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const watchedCount = movies.filter((m) => m.watched).length;
  const unwatchedCount = movies.length - watchedCount;

  return (
    <div className="flex flex-col h-full">
      <Header title="Movies" />
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Tabs */}
          <div className="flex gap-2">
            {(["search", "watchlist", "invites"] as TabOption[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 text-sm font-medium transition-colors relative"
                style={{
                  background: tab === t ? "var(--bg-tertiary)" : "transparent",
                  color: tab === t ? "var(--text-primary)" : "var(--text-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: tab === t ? "var(--border-width) solid var(--border-color)" : "var(--border-width) solid transparent",
                }}
              >
                {t === "search" ? "Discover" : t === "watchlist" ? `Watchlist (${unwatchedCount})` : "Invites"}
                {t === "invites" && pendingCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white rounded-full"
                    style={{ background: "var(--accent-start)" }}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === "search" && (
            <>
              {/* Search */}
              <div
                className="p-4"
                style={{
                  background: "var(--bg-secondary)",
                  border: "var(--border-width) solid var(--border-color)",
                }}
              >
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="flex-1 px-4 py-2.5 text-sm outline-none"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      border: "var(--border-width) solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </form>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                    Results
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {results.map((movie) => (
                      <MovieCard
                        key={movie.tmdbId}
                        movie={movie}
                        isSaved={isMovieSaved(movie.tmdbId)}
                        onSave={() => handleSaveWithRecommendation(movie)}
                        onUnsave={() => {
                          const saved = movies.find((m) => m.tmdbId === movie.tmdbId);
                          if (saved) unsaveMovie(saved.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {results.length === 0 && !searching && query && (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    No movies found. Try a different search.
                  </p>
                </div>
              )}
            </>
          )}

          {tab === "watchlist" && (
            <>
              {/* Stats bar */}
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                <span>{movies.length} total</span>
                <span>{watchedCount} watched</span>
                <span>{unwatchedCount} to watch</span>
              </div>

              {/* Sort + Filter */}
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter by title or who recommended..."
                  className="px-3 py-2 text-xs outline-none flex-1 min-w-[180px]"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "var(--border-width) solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                  }}
                />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="px-3 py-2 text-xs outline-none"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "var(--border-width) solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <option value="all">All</option>
                  <option value="unwatched">To Watch</option>
                  <option value="watched">Watched</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 text-xs outline-none"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "var(--border-width) solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <option value="recent">Recently Added</option>
                  <option value="title">Title</option>
                  <option value="rating">Your Rating</option>
                  <option value="tmdb">TMDB Rating</option>
                </select>
              </div>

              {/* Watchlist grid */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse"
                      style={{
                        background: "var(--bg-tertiary)",
                        borderRadius: "var(--radius-md)",
                        aspectRatio: "2/3.3",
                      }}
                    />
                  ))}
                </div>
              ) : sortedMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sortedMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isSaved={true}
                      onUnsave={() => unsaveMovie(movie.id)}
                      onClick={() => setSelectedMovie(movie)}
                      showWatched
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-tertiary)"
                    strokeWidth="1"
                    className="mx-auto mb-3"
                    style={{ opacity: 0.4 }}
                  >
                    <path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    {filterText || filterBy !== "all" ? "No movies match your filter." : "Your watchlist is empty. Search and save some movies!"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

          {tab === "invites" && (
            <>
              <div className="space-y-3">
                {received.length === 0 ? (
                  <div className="py-12 text-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1" className="mx-auto mb-3" style={{ opacity: 0.4 }}>
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      No invites yet. When someone invites you to watch a movie, it&apos;ll show up here.
                    </p>
                  </div>
                ) : (
                  received.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex gap-4 p-4"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "var(--border-width) solid var(--border-color)",
                        borderLeft: invite.status === "pending" ? "3px solid var(--accent-start)" : "var(--border-width) solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      {invite.posterUrl && (
                        <img
                          src={invite.posterUrl}
                          alt={invite.title}
                          className="w-16 h-24 object-cover rounded shrink-0"
                          style={{ background: "var(--bg-tertiary)" }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {invite.title}
                        </div>
                        <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                          <span style={{ color: "var(--accent-start)" }}>{invite.senderName}</span> invited you to watch
                        </div>
                        {invite.proposedDate && (
                          <div className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                            {invite.proposedDate} at {invite.proposedTime}
                          </div>
                        )}
                        {invite.message && (
                          <div className="text-xs mt-1 italic" style={{ color: "var(--text-tertiary)" }}>
                            &ldquo;{invite.message}&rdquo;
                          </div>
                        )}
                        {invite.status === "pending" ? (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={async () => {
                                const ok = await respondToInvite(invite.id, "accepted");
                                if (ok) {
                                  const startHour = parseInt(invite.proposedTime.split(":")[0]);
                                  const endTime = `${((startHour + 2) % 24).toString().padStart(2, "0")}:${invite.proposedTime.split(":")[1]}`;
                                  await addEvent({
                                    title: `Watch: ${invite.title} (with ${invite.senderName})`,
                                    description: invite.message || "",
                                    date: invite.proposedDate,
                                    startTime: invite.proposedTime,
                                    endTime,
                                    color: "purple",
                                    completed: false,
                                  });
                                }
                              }}
                              className="px-4 py-1.5 text-xs font-medium text-white"
                              style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))", borderRadius: "var(--radius-sm)" }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondToInvite(invite.id, "declined")}
                              className="px-4 py-1.5 text-xs font-medium"
                              style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)" }}
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 text-xs font-medium" style={{ color: invite.status === "accepted" ? "var(--accent-start)" : "var(--text-tertiary)" }}>
                            {invite.status === "accepted" ? "Accepted" : "Declined"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

      {/* Recommended By prompt */}
      {showRecommendPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowRecommendPrompt(null)}
        >
          <div
            className="w-full max-w-sm p-5 space-y-4"
            style={{
              background: "var(--bg-secondary)",
              border: "var(--border-width) solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Save &ldquo;{showRecommendPrompt.title}&rdquo;
            </h3>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Who recommended it? <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
              </label>
              <input
                type="text"
                value={saveRecommendedBy}
                onChange={(e) => setSaveRecommendedBy(e.target.value)}
                placeholder="A friend's name..."
                className="w-full px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "var(--border-width) solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                }}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") confirmSave(); }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmSave}
                className="flex-1 py-2 text-xs font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Save to Watchlist
              </button>
              <button
                onClick={() => setShowRecommendPrompt(null)}
                className="px-4 py-2 text-xs font-medium"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onUpdate={(updates) => {
            updateMovie(selectedMovie.id, updates);
            setSelectedMovie((prev) => prev ? { ...prev, ...updates } : null);
          }}
          onUnsave={() => unsaveMovie(selectedMovie.id)}
          onSchedule={async (date, startTime) => {
            const startHour = parseInt(startTime.split(":")[0]);
            const endTime = `${((startHour + 2) % 24).toString().padStart(2, "0")}:${startTime.split(":")[1]}`;
            await addEvent({
              title: `Watch: ${selectedMovie.title}`,
              description: selectedMovie.recommendedBy ? `Recommended by ${selectedMovie.recommendedBy}` : "",
              date,
              startTime,
              endTime,
              color: "purple",
              completed: false,
            });
          }}
          onInvite={async (recipientId, date, time, message) => {
            const success = await sendInvite({
              recipientId,
              tmdbId: selectedMovie.tmdbId,
              title: selectedMovie.title,
              posterUrl: selectedMovie.posterUrl,
              proposedDate: date,
              proposedTime: time,
              message,
            });
            return !!success;
          }}
          friends={friends}
          onAddFriend={addFriend}
        />
      )}
    </div>
  );
}
