"use client";

import { useState, useEffect } from "react";
import type { NewsSource, NewsArticle } from "@/types";

const SOURCES: { key: NewsSource; label: string }[] = [
  { key: "nytimes", label: "NY Times" },
  { key: "ft", label: "Financial Times" },
  { key: "eltiempo", label: "El Tiempo" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NewsWidget({ embedded = false }: { embedded?: boolean }) {
  const [source, setSource] = useState<NewsSource>("nytimes");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/news?source=${source}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [source]);

  return (
    <div
      className="p-4"
      style={embedded ? {} : {
        background: "var(--bg-secondary)",
        border: "var(--border-width) solid var(--border-color)",
        borderLeft: "3px solid var(--accent-start)",
      }}
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {SOURCES.map((s) => (
          <button
            key={s.key}
            onClick={() => setSource(s.key)}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
            style={{
              background:
                source === s.key
                  ? "linear-gradient(135deg, var(--accent-start), var(--accent-end))"
                  : "var(--bg-tertiary)",
              color: source === s.key ? "white" : "var(--text-secondary)",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div
                className="w-10 h-10 rounded shrink-0"
                style={{ background: "var(--bg-tertiary)" }}
              />
              <div className="flex-1 space-y-1.5 py-0.5">
                <div
                  className="h-3 rounded w-full"
                  style={{ background: "var(--bg-tertiary)" }}
                />
                <div
                  className="h-3 rounded w-2/3"
                  style={{ background: "var(--bg-tertiary)" }}
                />
              </div>
            </div>
          ))}

        {error && (
          <p className="text-xs py-4 text-center" style={{ color: "var(--text-tertiary)" }}>
            Headlines unavailable
          </p>
        )}

        {!loading &&
          !error &&
          articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ background: "var(--bg-tertiary)" }}
            >
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt=""
                  className="w-10 h-10 rounded object-cover shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs font-medium line-clamp-2 leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {article.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {timeAgo(article.pubDate)}
                </p>
              </div>
            </a>
          ))}
      </div>
    </div>
  );
}
