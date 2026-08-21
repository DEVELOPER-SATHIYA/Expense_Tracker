import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";
import PublicRoute from "../routes/PublicRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import AppLayout from "../layouts/AppLayout";
import Transactions from "../pages/Transactions";
import Settings from "../pages/Settings";
import MonthlyProfit from "../pages/MonthlyProfit";
import LeakReport from "../pages/LeakReport";
import Dockets from "../pages/Dockets";
import Onboarding from "../pages/Onboarding";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="onboarding" element={<Onboarding />} />
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profit" element={<MonthlyProfit />} />
            <Route path="leaks" element={<LeakReport />} />
            <Route path="dockets" element={<Dockets />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
