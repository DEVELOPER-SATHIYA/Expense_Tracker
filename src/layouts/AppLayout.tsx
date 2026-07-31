import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Logo from "../components/Logo";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/transactions": "Transactions",
    "/profit": "Monthly Profit",
    "/leaks": "Leak Report",
    "/settings": "Settings",
  };

  const title = pageTitles[location.pathname] ?? "Dashboard";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-[100dvh] max-w-[100vw] overflow-hidden bg-[#0d1117]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="safe-px sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#111827]/95 backdrop-blur sm:h-16 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="shrink-0 rounded-lg p-2 text-slate-300 hover:bg-white/5 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="truncate text-base font-semibold text-white sm:text-xl">
              {title}
            </h2>
          </div>

          <div className="shrink-0 md:hidden">
            <Logo size="sm" showText={false} />
          </div>
        </header>

        <main className="safe-pb min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#0d1117] text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
