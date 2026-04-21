"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import MiniCalendar from "./MiniCalendar";

const navItems = [
  { href: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: "/week", label: "Week", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/journal", label: "Journal", icon: "M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5V5a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z" },
  { href: "/new", label: "New Event", icon: "M12 4v16m8-8H4" },
  { href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function UserSection({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: "var(--border-color)" }}>
      <div className="flex items-center gap-3">
        <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Account"}
          </div>
          <div className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
            {user?.emailAddresses?.[0]?.emailAddress || ""}
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          onNavigate?.();
          signOut({ redirectUrl: "/sign-in" });
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors rounded"
        style={{ color: "var(--text-secondary)", borderRadius: "var(--radius-sm)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-tertiary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Sign out
      </button>
    </div>
  );
}

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={mobile ? "flex flex-col h-full" : "hidden md:flex flex-col h-full shrink-0 border-r"}
      style={{
        width: mobile ? "100%" : "var(--sidebar-width)",
        background: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{
            background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
            borderRadius: "var(--radius-sm)",
          }}
        >
          W
        </div>
        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Weatherwise
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-3">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2 text-sm transition-colors"
              style={{
                borderRadius: "var(--radius-sm)",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-tertiary)" : "transparent",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 my-1 border-t" style={{ borderColor: "var(--border-color)" }} />
      <MiniCalendar />
      <div className="mt-auto" />
      <UserSection onNavigate={onNavigate} />
    </aside>
  );
}
