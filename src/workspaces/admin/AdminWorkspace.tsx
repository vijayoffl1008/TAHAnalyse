/**
 * Admin Workspace entry point.
 *
 * This file is the lazy-loaded boundary for the admin chunk.
 * Nothing from client/ is imported here, ensuring Vite keeps
 * admin and client code in separate bundle chunks.
 *
 * Phase 0: scaffold only — routes will be added in Phase 2.
 */

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { AdminPlaceholder } from "./pages/AdminPlaceholder";

// ── Shared TAHAnalyse pages (used by both workspaces) ───────────────────────
import BacktestDashboard  from "@/workspaces/shared/pages/BacktestDashboard";
import BacktestTests      from "@/workspaces/shared/pages/BacktestTests";
import BacktestStrategies from "@/workspaces/shared/pages/BacktestStrategies";
import { Indicators }      from "@/workspaces/shared/pages/Indicators";
import Credits            from "@/workspaces/shared/pages/Credits";
import { SettingsPage }   from "@/workspaces/shared/pages/SettingsPage";
import { ThreadPage }     from "@/workspaces/shared/pages/ThreadPage";
import { ClientDashboardPage } from "@/workspaces/shared/pages/ClientDashboardPage";
import { LogsPage }        from "@/workspaces/shared/pages/LogsPage";
import { TutorialPage }    from "@/workspaces/shared/pages/TutorialPage";
import { BrokersPage }      from "@/workspaces/shared/pages/BrokersPage";
import { ChannelsPage }     from "./pages/ChannelsPage";
import { DataCollectionPage } from "./pages/DataCollectionPage";
import { OrdersPositionsPage } from "@/workspaces/shared/pages/OrdersPositionsPage";
import { TradeboardListPage } from "@/workspaces/shared/pages/TradeboardListPage";
import { TradeboardEditorPage } from "@/workspaces/shared/pages/TradeboardEditorPage";
import { UsersPage }      from "./pages/UsersPage";
import { StrategyEntityPage } from "./pages/StrategyEntityPage";
import { InstrumentPage }    from "./pages/InstrumentPage";
import { ReportAlertsPage }  from "./pages/ReportAlertsPage";
import { AdminDashboard }    from "./pages/AdminDashboard";

export default function AdminWorkspace() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Index → dashboard */}
        <Route index element={<AdminDashboard />} />

        {/* Top-level pages */}
        <Route path="users"            element={<UsersPage />} />
        <Route path="brokers"          element={<BrokersPage />} />
        <Route path="indicators"       element={<Indicators />} />
        <Route path="orders-positions" element={<OrdersPositionsPage />} />
        <Route path="tradeboard"       element={<TradeboardListPage basePath="/admin" />} />
        <Route path="tradeboard/:name" element={<TradeboardEditorPage basePath="/admin" />} />
        <Route path="channels"         element={<ChannelsPage />} />
        <Route path="reports"          element={<ReportAlertsPage />} />
        <Route path="data-collection"  element={<DataCollectionPage />} />
        <Route path="logs"             element={<LogsPage />} />
        <Route path="settings"         element={<SettingsPage />} />
        <Route path="tutorial"         element={<TutorialPage />} />

        {/* Strategy group */}
        <Route path="strategy">
          <Route index element={<Navigate to="thread" replace />} />
          <Route path="thread" element={<ThreadPage />} />
          <Route path="backtest">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<ClientDashboardPage />} />
            <Route path="tests"      element={<BacktestTests />} />
            <Route path="strategies" element={<BacktestStrategies />} />
          </Route>
        </Route>

        {/* Entity group */}
        <Route path="entity">
          <Route index element={<Navigate to="strategy" replace />} />
          <Route path="strategy"    element={<StrategyEntityPage />} />
          <Route path="instruments" element={<InstrumentPage />} />
        </Route>

        {/* Catch-all within admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
