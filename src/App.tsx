import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppThemeProvider } from "./components/shared/ThemeProvider";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// ── Workspace lazy imports (code-split: admin chunk never loads for clients) ──
const AdminWorkspace = lazy(
  () => import("./workspaces/admin/AdminWorkspace")
);
const ClientWorkspace = lazy(
  () => import("./workspaces/client/ClientWorkspace")
);

// ── TanStack Query client ─────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — avoid unnecessary refetches
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ── Workspace router ──────────────────────────────────────────────────────────

function WorkspaceRouter() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  // Unauthenticated: only /login and /unauthorized are accessible
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated: render only the correct workspace chunk.
  // The other workspace's dynamic import() is never called — it won't
  // appear in the browser's network panel or Sources tab.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading workspace…</span>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Redirect root to the correct workspace */}
        <Route
          path="/"
          element={
            <Navigate to={user?.role === "admin" ? "/admin" : "/client"} replace />
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin workspace — only rendered when role === 'admin' */}
        {user?.role === "admin" && (
          <Route path="/admin/*" element={<AdminWorkspace />} />
        )}

        {/* Client workspace — only rendered when role === 'user' */}
        {user?.role === "user" && (
          <Route path="/client/*" element={<ClientWorkspace />} />
        )}

        {/* Wrong role trying to access the other workspace */}
        <Route path="/admin/*" element={<Navigate to="/unauthorized" replace />} />
        <Route path="/client/*" element={<Navigate to="/unauthorized" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// ── Root app ──────────────────────────────────────────────────────────────────

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors closeButton />
        <BrowserRouter>
          <AuthProvider>
            <WorkspaceRouter />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AppThemeProvider>
  </QueryClientProvider>
);

export default App;
