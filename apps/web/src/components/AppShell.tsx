"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import PomodoroTimer from "./PomodoroTimer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full">
      <Sidebar onNavigate={() => setMenuOpen(false)} />

      <div
        className="fixed top-0 left-0 right-0 z-40 md:hidden flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--bg-secondary)", borderBottom: "var(--border-width) solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))" }}
          >
            W
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Weatherwise
          </span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5" style={{ color: "var(--text-primary)" }}>
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30 md:hidden" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setMenuOpen(false)}>
          <div className="w-64 h-full" style={{ background: "var(--bg-secondary)" }} onClick={(e) => e.stopPropagation()}>
            <Sidebar mobile onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto pt-12 md:pt-0">{children}</main>
      <PomodoroTimer />
    </div>
  );
}
