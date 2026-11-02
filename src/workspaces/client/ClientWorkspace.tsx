/**
 * Client Workspace entry point.
 *
 * Separate lazy-loaded chunk from AdminWorkspace.
 * Admin code is never imported here.
 *
 * Phase 0: scaffold only — routes will be added in Phase 2.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { ClientLayout } from "./ClientLayout";
import { ClientPlaceholder } from "./pages/ClientPlaceholder";

// ── Shared TAHAnalyse pages (used by both workspaces) ───────────────────────
import BacktestDashboard  from "@/workspaces/shared/pages/BacktestDashboard";
import BacktestTests      from "@/workspaces/shared/pages/BacktestTests";
import BacktestStrategies from "@/workspaces/shared/pages/BacktestStrategies";
import { Indicators } from "@/workspaces/shared/pages/Indicators";
import Credits            from "@/workspaces/shared/pages/Credits";
import { SettingsPage }   from "@/workspaces/shared/pages/SettingsPage";
import { ThreadPage }     from "@/workspaces/shared/pages/ThreadPage";
import { ClientDashboardPage } from "@/workspaces/shared/pages/ClientDashboardPage";
import { LogsPage }        from "@/workspaces/shared/pages/LogsPage";
import { TutorialPage }    from "@/workspaces/shared/pages/TutorialPage";
import { BrokersPage }      from "@/workspaces/shared/pages/BrokersPage";
import { OrdersPositionsPage } from "@/workspaces/shared/pages/OrdersPositionsPage";
import { TradeboardListPage } from "@/workspaces/shared/pages/TradeboardListPage";
import { TradeboardEditorPage } from "@/workspaces/shared/pages/TradeboardEditorPage";

export default function ClientWorkspace() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        {/* Index → dashboard */}
        <Route index element={<ClientPlaceholder title="Dashboard" />} />

        {/* Top-level pages */}
        <Route path="brokers"          element={<BrokersPage />} />
        <Route path="indicators"       element={<Indicators />} />
        <Route path="orders-positions" element={<OrdersPositionsPage />} />
        <Route path="tradeboard"       element={<TradeboardListPage basePath="/client" />} />
        <Route path="tradeboard/:name" element={<TradeboardEditorPage basePath="/client" />} />
        <Route path="logs"             element={<LogsPage />} />
        <Route path="settings"         element={<SettingsPage />} />
        <Route path="credits"          element={<Credits />} />
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

        {/* Catch-all within client */}
        <Route path="*" element={<Navigate to="/client" replace />} />
      </Route>
    </Routes>
  );
}
