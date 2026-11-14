import { LogIn, LogOut, Star } from "lucide-react";
import type { ActiveTab, StudentProfile } from "../types";

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  student: StudentProfile | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  guestStars: number;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: "home", label: "Home" },
  { id: "maths", label: "Maths 1-10" },
  { id: "classroom", label: "Classroom" },
  { id: "quiz", label: "Practice Quiz" },
  { id: "progress", label: "My Progress" },
];

export function TopBar({
  activeTab,
  onSelectTab,
  student,
  authLoading,
  onSignIn,
  onSignOut,
  guestStars,
}: TopBarProps) {
  const displayStars = student ? student.stars : guestStars;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab("home")}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded"
        >
          Shikshak
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded ${
                  isActive ? "text-sky-700 font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-[17px] h-0.5 bg-sky-600" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {student ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectTab("progress")}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 rounded px-2 py-1"
              >
                <span className="max-w-[130px] truncate">{student.displayName}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums text-amber-700 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                  {displayStars}
                </span>
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={authLoading}
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              {authLoading ? "Signing in..." : "Sign In"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-around border-t border-slate-100 px-1 py-1.5 bg-white overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-2 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                isActive ? "bg-sky-50 text-sky-700 font-semibold" : "text-slate-600"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
