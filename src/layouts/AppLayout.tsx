import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import { Outlet, useLocation } from "react-router-dom";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/transactions": "Transactions",
    "/profit": "Monthly Profit calculation",
    "/settings": "Settings",
  };

  const title = pageTitles[location.pathname] ?? "Dashboard";

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1">

        <header
          style={{
            height: 72,
            // bg-[#111827]
            background: "#111827",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Mobile only */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <Menu />
            </button>

            <h2
              style={{
                margin: 0,
                color: "#fff",
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              {title}
            </h2>
          </div>


        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Modal
        open={open}
        title="Modal"
        onClose={() => setOpen(false)}
      >
        {null}
      </Modal>

    </div>
  );
}