import { NavLink } from "react-router-dom";
import { useState } from "react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import {
  Home,
  ArrowLeftRight,
  Settings,
  LogOut,
  Wallet,
  IndianRupee,

} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Colors from "../theme/colors";

import AccountSwitcher from "../components/account/AccountSwitcher";
const menus = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Monthly Profit", path: "/profit", icon: IndianRupee },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface Props {
  open: boolean;
  onClose: () => void;
}
export default function Sidebar({
  open,
  onClose,
}: Props) {

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
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:static
          top-0
          left-0
          z-50
          h-screen
          w-64
          bg-[#111827]
          text-white
          transition-transform
          duration-300
          ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-5 border-b border-slate-700 gap-4">
          <div className="flex  items-center justify-center  gap-4 mb-5">
            <Wallet size={18} className="text-white" />
            <span className="text-white text-center font-semibold text-lg">கல்லாப்பெட்டி</span>
          </div>
          <AccountSwitcher />
        </div>

        <nav className="px-3 mt-5">

          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-lg
                  mb-2
                  transition

                  ${isActive
                    ? "bg-blue-600"
                    : "hover:bg-gray-700"
                  }
                `
                }
              >
                <Icon size={18} />

                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div
          onClick={() => setLogoutOpen(true)}
          className="
          mt-auto
          mx-3
          mb-4
          flex
          items-center
          gap-3
          rounded-lg
          px-4
          py-3
          font-medium
          text-red-500
          cursor-pointer
          transition-all
          duration-200
          hover:bg-red-500/10
          hover:text-red-400
          active:scale-[0.98]
          select-none
        "
        >
          <LogOut size={18} />

          <span>Logout</span>
        </div>
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
