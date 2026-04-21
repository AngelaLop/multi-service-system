"use client";

import { useState } from "react";
import type { MovieSearchResult, SavedMovie } from "@/types";

interface MovieCardProps {
  movie: MovieSearchResult | SavedMovie;
  isSaved: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  onClick?: () => void;
  showWatched?: boolean;
}

export default function MovieCard({
  movie,
  isSaved,
  onSave,
  onUnsave,
  onClick,
  showWatched,
}: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const posterUrl = movie.posterUrl;
  const isWatched = "watched" in movie && movie.watched;
  const tmdbRating = "tmdbRating" in movie ? movie.tmdbRating : 0;
  const recommendedBy = "recommendedBy" in movie ? (movie as SavedMovie).recommendedBy : "";

  return (
    <div
      className="group relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
      style={{
        background: "var(--bg-secondary)",
        border: "var(--border-width) solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        opacity: showWatched && isWatched ? 0.6 : 1,
      }}
      onClick={onClick}
    >
      {/* Poster */}
      <div
        className="relative overflow-hidden"
        style={{ background: "var(--bg-tertiary)", aspectRatio: "2/3" }}
      >
        {!imgError && posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="1"
              style={{ opacity: 0.4 }}
            >
              <path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Watched badge */}
        {isWatched && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full"
            style={{ background: "var(--accent-start)", color: "white" }}
          >
            Watched
          </div>
        )}

        {/* TMDB rating badge */}
        {tmdbRating > 0 && (
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{ background: "rgba(0,0,0,0.7)", color: "#ffd700" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffd700">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {tmdbRating}
          </div>
        )}

        {/* Save/Unsave button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            isSaved ? onUnsave?.() : onSave?.();
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          style={{
            background: isSaved ? "var(--accent-start)" : "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          title={isSaved ? "Remove from watchlist" : "Add to watchlist"}
        >
          {isSaved ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <div
          className="text-sm font-medium truncate"
          style={{ color: "var(--text-primary)", textDecoration: isWatched ? "line-through" : "none" }}
        >
          {movie.title}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {movie.releaseDate ? movie.releaseDate.substring(0, 4) : ""}
          </span>
          {recommendedBy && (
            <span className="text-[10px] truncate max-w-[80px]" style={{ color: "var(--accent-start)" }}>
              via {recommendedBy}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
