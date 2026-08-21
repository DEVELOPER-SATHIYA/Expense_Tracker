import { NavLink } from "react-router-dom";
import { useState } from "react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import {
  Home,
  ArrowLeftRight,
  Settings,
  LogOut,
  IndianRupee,
  Droplets,
  Package,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AccountSwitcher from "../components/account/AccountSwitcher";
import Logo from "./Logo";

const menus = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Monthly Profit", path: "/profit", icon: IndianRupee },
  { name: "Leak Report", path: "/leaks", icon: Droplets },
  { name: "Dockets", path: "/dockets", icon: Package },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const { logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          flex h-[100dvh] w-[min(18rem,88vw)] flex-col
          border-r border-white/[0.06]
          bg-[#0d1117] text-white
          transition-transform duration-300 ease-in-out
          pt-[env(safe-area-inset-top)]
          pb-[env(safe-area-inset-bottom)]
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:w-64 md:translate-x-0
        `}
      >
        <div className="border-b border-white/[0.06] p-3 sm:p-4">
          <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
            <Logo size="md" className="min-w-0 flex-1" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
            >
              <X size={18} />
            </button>
          </div>
          <AccountSwitcher />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 sm:py-4">
          {menus.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `mb-1.5 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors active:scale-[0.99] ${
                    isActive
                      ? "bg-amber-500/15 text-amber-300"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`
                }
              >
                <Icon size={17} className="shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="mx-3 mb-3 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 sm:mb-4"
        >
          <LogOut size={17} className="shrink-0" />
          Logout
        </button>
      </aside>

      <LogoutConfirmModal
        open={logoutOpen}
        loading={loggingOut}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
