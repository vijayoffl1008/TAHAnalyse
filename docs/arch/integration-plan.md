# AlgoHopperBot × TAHAnalyse — Integration Plan

> **Goal:** Unify AlgoHopperBot (Angular, the parent app) and TAHAnalyse (React, the subset app) into a single React + Tailwind application with reusable components and a dynamic, AI-ready UI framework.
> **Last updated:** 2026-10-30 — All open items fully resolved. O-1 confirmed from Django source (§10). O-6 Gin auth conflict documented with bypass plan (§11, GIN-1 to GIN-5). All 19 decisions locked. **Plan complete. Ready for Phase 0 implementation.**

---

## 1. Current State Analysis

### TAHAnalyse (React) — What Exists

| Area | Status | Details |
|---|---|---|
| **Auth** | Partial | `AuthContext` with localStorage session, login API, token storage, 401 interceptor redirect. No role-based routing, no admin flag, logout doesn't clear token. |
| **Layout** | Functional | `AppLayout` (sidebar + header + outlet), `AppSidebar` (5 nav items), `Header` (credits badge, notifications, user dropdown). Settings link is dead. |
| **Strategies** | Rich (mock data) | 7-step wizard: config → indicators → entry conditions → exit conditions → reentry → special scenarios → summary. Auto-reverse logic. View dialog. All local state, no API persistence. |
| **Indicators** | Functional (mock data) | 20 predefined indicator definitions with typed parameters. Custom indicator creation (combination/calculation). All local state. |
| **Tests** | UI only (mock data) | Backtest run list with search/filter. All actions are stubs. |
| **Dashboard** | UI only (mock) | 4 stat cards + latest test runs. All mock. |
| **Credits** | UI only (mock) | Credit packages + transaction history. All mock. |
| **API layer** | Scaffold only | Axios instance + interceptors + `apiRequest` helper. Only `loginAPI` is real. No TanStack Query usage despite being installed. |
| **Forms** | Scaffold only | React Hook Form + Zod installed but unused. shadcn `Form` component present but never imported. All forms are controlled useState. |
| **Types** | Solid for strategies | `Strategy`, `IndicatorConfig`, `Condition`, `ExitCondition`, `ReentrySettings`, `SpecialScenario`, `IndicatorDefinition`. `User` type has `full_name` but UI uses `user.name` (bug). |

### AlgoHopperBot (Angular) — What to Bring Over

| Area | Status | Details |
|---|---|---|
| **Auth** | Full | sessionStorage-based, token header, admin/client roles, T&C modal, auto-redirect by role. |
| **Layout** | Full | Wrapper shell, header (price ticker — disabled), sidebar (role-based nav, collapsible), theme switching (jQuery). |
| **Users** | Full CRUD | List/add/edit/delete/activate. Pagination stubs. Search not wired. |
| **Brokers** | Full (Alice Blue only) | Add/update/delete/connect/show-funds. Angel Broking shows "not configured". |
| **Channel** | Full | Server list, feed mode toggle, channel start/stop/switch. Dynamic server URL routing. |
| **Thread** | Full | Strategy execution management: list/start/stop/delete/action/dname-edit. Strategy-details-modal for add/edit (lss_v1, orb_v1 layouts). |
| **Strategy (Entity)** | Full CRUD | Master strategy definitions: name, type, capital config, script type, scope (public/private), state (active/inactive). Delete confirmation bug (Gap-5). |
| **Instrument** | Full CRUD | Trading instruments + nested expiry date management. |
| **Order Positions** | Full | Live orders + open positions across users. Cancel/close with confirmation. |
| **Tradeboard** | Full UI, partial logic | Tradeboard list + tabbed tradeboard + tradeboard-content (settings + positions). Order placement is stubbed (Gap-3). |
| **Data Collection** | Full | Run/stop/check data collection + archive operations. dc_token config. |
| **Report Alerts** | Full CRUD | Report aggregation, generate, download PDF. Symbol selection broken (Gap-4). |
| **Logs** | Partial | Log viewer with JSON viewer + tabular. Search/pagination commented out (Inc-8). |
| **Settings** | Full | Profile management + admin system config (feed token, app state, Zerodha login). |
| **Change Password** | Full | Old/new/confirm with cross-field validation. Auto-logout on success. |
| **Dashboard** | Partial (test endpoints) | Client PnL: running/completed positions + PnL chart. All APIs point to "test/" (Gap-2). |
| **Services** | 17 API services | Full service layer across 5 backend base URLs. |
| **Tutorial** | Empty | Blank page, sidebar link commented out. Keep for later. |

### Overlap Map

| TAHAnalyse Page | AlgoHopperBot Page | Action |
|---|---|---|
| Login | Login | **Merge** — Use Angular's auth model (roles, admin flag, T&C) on React's existing form. |
| Dashboard | Dashboard | **Replace** — TAHAnalyse's mock → Angular's client PnL dashboard. Keep TAHAnalyse's stat cards as an admin overview. |
| Strategies | Thread + Strategy (Entity) | **Unify** — Three layers: Strategy Definition (builder), Strategy Entity (registry), Strategy Instance/Thread (execution). See §3. |
| — (none) | Indicators | TAHAnalyse's indicator feature stays as-is. No overlap. |
| Tests | — (none) | TAHAnalyse's backtesting stays. No overlap. Wire to API eventually. |
| Credits | — (none) | Keep as a billing/credits section. Wire to API eventually. |
| — (none) | Users, Brokers, Channel, Instrument, Order Positions, Tradeboard, Data Collection, Report Alerts, Logs, Settings, Change Password, Tutorial | **New** — Port from Angular to React. |
| Settings (dead link) | Settings | **Merge** — Profile + system config. |

---

## 2. Unified Architecture

### Workspace Architecture (Login + Workspaces with Code Isolation)

**Decision:** Login is a standalone page (no layout). Admin and Client are separate **workspaces** — isolated module trees with code splitting so a client never loads admin code and vice versa. In browser dev tools (Sources tab), only the authenticated role's code chunk appears.

```
/login                          → Login (standalone, no layout)
                                → On success: admin → /admin, client → /client

=== ADMIN WORKSPACE (separate lazy-loaded chunk) ===
/admin                          → AdminWorkspace (own sidebar, header, routes)

  Top-level menu items:
  /admin/users                  → User CRUD
  /admin/brokers                → Broker management (all users)
  /admin/indicators             → Indicator management (top-level, not under Strategy)

  /admin/strategy               → Strategy (parent menu, expandable)
    /admin/strategy/backtest/dashboard    → Backtest Dashboard (from TAHAnalyse)
    /admin/strategy/backtest/tests        → Backtest Tests (from TAHAnalyse)
    /admin/strategy/backtest/strategies   → Backtest Strategies (from TAHAnalyse — builder/library)
    /admin/strategy/thread                → Strategy execution / Thread (from AlgoHopperBot)

  /admin/orders-positions       → Orders & Positions (all users)
  /admin/tradeboard             → Tradeboard list + editor
  /admin/channels               → Feed channel management
  /admin/reports                → Report Alerts (report configuration + generation)

  /admin/entity                 → Entity (parent menu, expandable)
    /admin/entity/strategy      → Strategy entity CRUD (master definitions)
    /admin/entity/instruments   → Instrument CRUD + expiry

  /admin/data-collection        → Market data collection
  /admin/logs                   → Log viewer (all users)
  /admin/settings               → System config + profile
  /admin/tutorial              → Tutorial (placeholder)

=== CLIENT WORKSPACE (separate lazy-loaded chunk) ===
/client                         → ClientWorkspace (own sidebar, header, routes)

  Client sees only what they control:
  /client/brokers               → Own broker management
  /client/indicators            → Indicator management (view + create)

  /client/strategy              → Strategy (parent menu, expandable)
    /client/strategy/backtest/dashboard    → Backtest Dashboard (own)
    /client/strategy/backtest/tests        → Backtest Tests (own)
    /client/strategy/backtest/strategies   → Backtest Strategies (own — builder/library)
    /client/strategy/thread                → Own strategy execution / Thread

  /client/orders-positions      → Own orders + positions [see Q-2]
  /client/tradeboard            → Tradeboard (own)
  /client/logs                  → Own logs
  /client/settings              → Profile + change password
  /client/credits               → Credits / billing [see Q-2]
  /client/tutorial             → Tutorial (placeholder)
```

### Admin Sidebar Menu Structure

```
Users
Brokers
Indicators
Strategy ▸
  Backtest ▸
    Dashboard
    Tests
    Strategies
  Thread          (sibling of Backtest under Strategy)
Orders & Positions
Tradeboard
Channels
Reports
Entity ▸
  Strategy
  Instruments
DataCollection
Logs
Settings
```

### Client Sidebar Menu Structure

```
Brokers
Indicators
Strategy ▸
  Backtest ▸
    Dashboard
    Tests
    Strategies
  Thread          (sibling of Backtest under Strategy)
Orders & Positions      [see Q-2]
Tradeboard
Logs
Settings
Credits                 [see Q-2]
Tutorial
```

**Key rules:**
- Indicators is a top-level menu (NOT under Strategy > Backtest).
- TAHAnalyse pages (Dashboard, Tests, Strategies) nest under Strategy > Backtest.
- Client menu is a subset of admin — only items the client controls.
- Admin-only items NOT shown to client: Users, Channels, Reports, Entity, DataCollection.

**Shared components** render differently based on role. For example, `Thread` shows all users' strategies for admin but only the client's own strategies for client. Same component, different query params.

### Code Isolation Strategy

The workspaces are separate lazy-loaded chunks. Vite code-splits at the dynamic `import()` boundary. When a client logs in, the admin chunk is **never fetched, never executed** — it doesn't appear in browser dev tools.

```
src/workspaces/
├── admin/
│    ├── AdminWorkspace.tsx          → lazy(() => import('./workspaces/admin/AdminWorkspace'))
│    ├── AdminSidebar.tsx            → only imported inside admin chunk
│    ├── AdminHeader.tsx
│    └── routes.tsx                  → admin route tree (lazy-loads admin pages)
│
├── client/
│    ├── ClientWorkspace.tsx         → lazy(() => import('./workspaces/client/ClientWorkspace'))
│    ├── ClientSidebar.tsx           → only imported inside client chunk
│    ├── ClientHeader.tsx
│    └── routes.tsx                  → client route tree (lazy-loads client pages)
│
└── shared/                          → components used by BOTH workspaces
     ├── EntityTable.tsx
     ├── DynamicForm.tsx
     ├── selectors/
     └── ...
```

**App.tsx routing with workspace isolation:**

```tsx
const AdminWorkspace = lazy(() => import('./workspaces/admin/AdminWorkspace'));
const ClientWorkspace = lazy(() => import('./workspaces/client/ClientWorkspace'));

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Only the authenticated role's workspace chunk is loaded.
  // The other workspace's dynamic import() is never called,
  // so Vite never fetches that chunk — it won't appear in dev tools.
  return (
    <Suspense fallback={<FullscreenLoader />}>
      {user?.role === 'admin' ? <AdminWorkspace /> : <ClientWorkspace />}
    </Suspense>
  );
}
```

**Why this works:**
- `React.lazy()` only triggers `import()` when the component is actually rendered.
- If `user.role === 'user'`, the `<AdminWorkspace />` branch is never rendered, so `import('./workspaces/admin/AdminWorkspace')` is never called.
- Vite generates a separate chunk for each lazy import. The admin chunk's JS file is never requested by the browser.
- In browser dev tools → Sources, only loaded chunks appear. The other role's code is invisible.
- Each workspace has its own `<Router>` (or uses a shared BrowserRouter with role-gated routes). Recommend shared `BrowserRouter` in `App.tsx` with each workspace managing its own route tree internally.

**Additional isolation measures:**
- Admin API service modules are imported only within the admin workspace chunk.
- Client API service modules are imported only within the client workspace chunk.
- Shared API services (used by both) live in `src/workspaces/shared/`.
- Shared UI components (EntityTable, DynamicForm, selectors) live in `src/workspaces/shared/` — these are in a common chunk loaded by both.

### Provider Stack (App.tsx)

```
QueryClientProvider (with default options — staleTime, retry, etc.)
  └─ TooltipProvider
       └─ Toaster + Sonner
            └─ BrowserRouter
                 └─ AuthProvider (enhanced: roles, admin flag, token, profile)
                      └─ AppRoutes
                           ├─ /login → <Login/> (standalone, no layout)
                           └─ <Suspense>
                                ├─ if admin → <AdminWorkspace/> (lazy chunk)
                                └─ if client → <ClientWorkspace/> (lazy chunk)
```

### Auth Model (Unified)

**Decision: localStorage** — persists across tabs and browser restarts, best for a workspace app where users stay logged in. Access token stored in a separate localStorage key. When backends merge later, switch to httpOnly cookies for production security.

**Dual backend during transition:**
- **Django backend** (AlgoHopperBot): full auth system with admin/client roles, T&C, all AlgoHopperBot features. Base URLs: `faq/`, `qcont_api/`, `qfeed_api/`, `qorder_api/`, `qreport_api/`.
- **Gin backend** (TAHAnalyse): existing login + TAHAnalyse-specific features (indicators, tests, credits). Base URL: `VITE_API_BASE_URL`.
- Login should go through the **Django backend** since it has the complete role system (admin/client, T&C, user management). The Gin backend's login will be deprecated once backends merge.

| Angular sessionStorage key | React AuthContext field | Storage | Notes |
|---|---|---|---|
| `un` (username) | `user.full_name` | localStorage `tahanalyzer_user` | Fix existing `user.name` bug |
| `em` (email) | `user.email` | localStorage `tahanalyzer_user` | Already exists |
| `ph` (phone) | `user.phone` | localStorage `tahanalyzer_user` | Already exists |
| `adm` (is_admin) | `user.role` → `'admin' \| 'user'` | localStorage `tahanalyzer_user` | Already exists as UserRole |
| `us_id` (user_id) | `user.id` | localStorage `tahanalyzer_user` | Already exists |
| `header_token` | `access_token` | localStorage `access_token` | Token for Django API |
| — (new) | `gin_token` | localStorage `gin_token` | Token for Gin API (if needed during transition) |

**Changes needed:**
- Login calls Django `POST auth/login/` → returns email, token, is_admin, phone, username, user_id.
- Store Django token as `access_token` in localStorage (already handled by interceptors).
- `ProtectedRoute` role checking wired up via `requiredRole` prop.
- `logout()` clears both `access_token` and `tahanalyzer_user` from localStorage.
- Token validation on app load: call Django `GET account/profile/` to verify token + fetch fresh user data.
- Auth interceptor injects `token` header (not `Authorization: Bearer`) for Django API calls — matching Angular's `auth.interceptor.service.ts`.
- For Gin backend calls (TAHAnalyse features during transition), use a separate Axios instance with `Authorization: Bearer` header.
- When backends merge, consolidate to a single token + header format.

---

## 3. Strategy Model Unification

This is the most critical part of the integration. Both apps have a "strategy" concept, but they mean different things.

### Three-Layer Strategy Model

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: Strategy Type Definition (Registry)      │
│  ─────────────────────────────────────────────────  │
│  What IS a strategy type? Its metadata + config     │
│  schema (what sections/fields it needs).             │
│                                                      │
│  Source: AlgoHopperBot Strategy Entity               │
│        + TAHAnalyse Strategy type/indicator model     │
│                                                      │
│  Examples:                                            │
│  - lss_v1: { layouts: [symbol, time, trade, ...] }   │
│  - orb_v1: { layouts: [symbol, time, order, ...] }   │
│  - trend_following: { indicators, conditions, ... }  │
│  - custom (AI-generated): { dynamic layouts }        │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Layer 2: Strategy Instance (Definition + Config)    │
│  ─────────────────────────────────────────────────  │
│  A specific configuration of a strategy type.         │
│  The actual parameter values for this instance.       │
│                                                      │
│  Source: TAHAnalyse Strategy (local state)            │
│        + AlgoHopperBot strategy-details-modal form    │
│                                                      │
│  Stored via API (strategy/add, strategy/update).     │
│  Can be created via the Strategy Builder wizard.     │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Layer 3: Strategy Thread (Execution / Deployment)  │
│  ─────────────────────────────────────────────────  │
│  A running/stopped instance assigned to a user with  │
│  a broker account. The live execution unit.          │
│                                                      │
│  Source: AlgoHopperBot Thread                         │
│                                                      │
│  Operations: start, stop, enable, disable, delete,    │
│  edit settings, inline display name edit.            │
└─────────────────────────────────────────────────────┘
```

### Unified Type Definitions

```typescript
// types/strategy-type.ts — Layer 1: Strategy Type Definition
interface StrategyTypeDefinition {
  _id: string;
  name: string;                    // 'lss_v1', 'orb_v1', 'trend_following'
  display_name: string;            // 'LSS V1', 'ORB V1'
  type: 'lss_v1' | 'orb_v1' | 'trend_following' | 'mean_reversion' | 'momentum' | 'breakout' | 'custom';
  script_type: 'internal' | 'external';
  capital_config: { ... };
  scope: 'public' | 'private';
  state: 'active' | 'inactive';

  // The schema that defines how this strategy type is configured
  config_schema: StrategyConfigSchema;
}

// types/strategy-config-schema.ts — The dynamic form definition
interface StrategyConfigSchema {
  sections: ConfigSection[];
}

interface ConfigSection {
  id: string;                      // 'symbol', 'time', 'trade', 'order', etc.
  title: string;                  // 'Symbol Selection', 'Time Settings'
  layout: string;                  // matches AlgoHopperBot LAYOUTS constants
  fields: ConfigField[];
  // Optional: show/hide this section based on other field values
  visible_when?: { field: string; equals: string | number | boolean };
}

interface ConfigField {
  name: string;                    // 'exchange', 'segment', 'interval'
  label: string;                   // 'Exchange', 'Segment'
  type: 'text' | 'number' | 'select' | 'boolean' | 'multi-select' | 'group';
  options?: { label: string; value: string | number }[];  // for select/multi-select
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  // Nested fields (for compound inputs like strike selection)
  sub_fields?: ConfigField[];
  // Dynamic options from API (e.g., symbols loaded from instrument list)
  options_source?: { api: string; params?: Record<string, string> };
}

// types/strategy-instance.ts — Layer 2: Strategy Instance
interface StrategyInstance {
  _id: string;
  type_id: string;                 // → StrategyTypeDefinition._id
  type_name: string;               // denormalized for display
  name: string;                    // user-given name
  display_name: string;
  config: Record<string, any>;    // values matching ConfigSection fields
  indicators?: IndicatorConfig[];  // for TAHAnalyse-style strategies
  entry_conditions?: { buy: ConditionGroup[]; sell: ConditionGroup[] };
  exit_conditions?: { buy: ExitCondition[]; sell: ExitCondition[] };
  reentry_settings?: ReentrySettings;
  special_scenarios?: SpecialScenario[];
  state: 'running' | 'stopped';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// types/strategy-thread.ts — Layer 3: Execution Thread
interface StrategyThread {
  _id: string;
  instance_id: string;             // → StrategyInstance._id
  user_id: string;
  broker_account_id: string;
  display_name: string;
  state: 'running' | 'stopped';
  enabled: boolean;
  settings: Record<string, any>;  // thread-level overrides
  created_at: string;
}
```

### How This Maps to Existing Apps

| Angular Concept | React Unified Concept | API |
|---|---|---|
| Strategy (Entity) | StrategyTypeDefinition | `strategy/list`, `add`, `update`, `delete` |
| strategy-details-modal form values | StrategyInstance.config | `thread/add` (creates instance + thread) |
| Thread | StrategyThread | `thread/list`, `start`, `stop`, `delete`, `action` |
| TAHAnalyse Strategy (local) | StrategyInstance (with indicators) | New API or reuse `strategy/add` |
| TAHAnalyse EnhancedCreateStrategyDialog | Strategy Builder wizard | UI only |

### Strategy Builder Evolution — Three Modes

The existing TAHAnalyse 7-step wizard is indicator-based. The Angular strategy-details-modal is layout-section-based. The unified builder supports **all three modes** since different users create different strategy types:

**Mode 1: Indicator-Based (TAHAnalyse model)**
- Users select indicators (MA, RSI, MACD, etc.), configure parameters, define entry/exit conditions, reentry, special scenarios.
- Best for: quantitative/technical-analysis strategies.
- Uses existing TAHAnalyse wizard steps: IndicatorSelection → Conditions → ExitConditions → Reentry → Scenarios.

**Mode 2: Price Action / Layout-Based (AlgoHopperBot model)**
- Users configure via layout sections: Symbol, Time, Trade, Order, Target, SL, TSL, Order Adjustment, Reenter, Weekday.
- Best for: discretionary/price-action strategies (ORB, LSS, etc.).
- Uses DynamicForm rendering sections from the strategy type's config_schema.

**Mode 3: Custom / Combined (price action + indicators + custom scripts)**
- Combines elements from both modes. May include custom indicators (user-defined formulas/combinations) alongside price action settings.
- Custom strategy scripts are coded separately on the backend and registered as strategy types.
- The frontend manages them: displays the strategy, allows configuring its parameters via DynamicForm (from the config_schema the backend provides), deploys as a thread.
- Best for: hybrid strategies, AI-generated strategies, or proprietary algorithms.

```
Strategy Builder (unified — adapts based on strategy type)
├─ Step 1: Strategy Config
│    ├─ Name, description (required)
│    ├─ Strategy type selector (loads from strategy/list API)
│    ├─ Direction (buy/sell/both), duration (intraday/positional)
│    └─ Timeframe (if applicable)
│
├─ Step 2: Strategy-specific sections (DYNAMIC — mode determined by strategy type)
│    │
│    ├─ [Mode 1: Indicator-based]
│    │    ├─ Indicator Selection (pick indicators, configure params)
│    │    ├─ Entry Conditions (indicator vs indicator/price/value, AND/OR groups)
│    │    ├─ Exit Conditions (SL/TGT/SAR/CONDITION per side, with auto-reverse)
│    │    ├─ Reentry Settings (none/ON_SL/ON_TGT/ON_BOTH/CUSTOM)
│    │    └─ Special Scenarios (trigger conditions → actions)
│    │
│    ├─ [Mode 2: Price action / Layout-based]
│    │    └─ DynamicForm renders sections from config_schema:
│    │       Symbol → Time → Trade → Order → Target → SL → TSL
│    │       → Order Adjustment → Reenter → Weekday
│    │       (section order/visibility from the strategy type definition)
│    │
│    └─ [Mode 3: Custom / Combined]
│         ├─ DynamicForm renders layout sections (from config_schema)
│         ├─ + Indicator selection (if the type supports indicators)
│         ├─ + Custom indicator selection (if the type supports custom indicators)
│         └─ + Any additional sections the backend/AI defines in config_schema
│
└─ Step 3: Summary & Save → creates StrategyInstance → deployed as StrategyThread
```

**How mode is determined:** The `StrategyTypeDefinition.config_schema` includes a `builder_mode` field:

```typescript
interface StrategyTypeDefinition {
  // ... existing fields
  builder_mode: 'indicator' | 'layout' | 'combined';
  config_schema: StrategyConfigSchema;  // used by layout & combined modes
  supports_indicators?: boolean;        // used by indicator & combined modes
  supports_custom_indicators?: boolean; // used by combined mode
}
```

The key: **Step 2 renders dynamically from the strategy type definition**. This is the bridge between both apps, supports all three user workflows, and is the foundation for AI-generated strategy UIs.

---

## 4. Reusable Component Library

This is the core investment. Every component below should be generic, typed, and reusable across both workspaces.

### 4.1 Schema-Driven Form System (Critical for AI Dynamic UI)

This is the generalization of TAHAnalyse's `DynamicIndicatorConfig` pattern. Instead of rendering indicator parameters, it renders ANY form from a schema definition.

```
src/workspaces/shared/dynamic-form/
├── DynamicField.tsx          — Renders one field (text/number/select/boolean/multi-select/group)
├── DynamicSection.tsx        — Renders one section (group of fields with a title)
├── DynamicForm.tsx           — Renders entire form (array of sections)
├── types.ts                  — FieldDefinition, SectionDefinition, FormSchema types
└── index.ts                  — Barrel export
```

**`DynamicField`** — the atom:
```typescript
interface DynamicFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  // For dynamic options (loaded from API)
  options?: { label: string; value: string | number }[];
  isLoadingOptions?: boolean;
}
```

Renders based on `field.type`:
- `text` → shadcn `Input`
- `number` → shadcn `Input` (type=number) with min/max/step
- `select` → shadcn `Select` (or `Combobox` for searchable)
- `boolean` → shadcn `Switch`
- `multi-select` → shadcn `MultiSelect` (or `cmdk` Combobox)
- `group` → nested `DynamicField[]` (compound inputs like strike selection)

**`DynamicSection`** — renders a titled group of fields with optional visibility logic.

**`DynamicForm`** — renders all sections, manages form state with React Hook Form, validates with Zod schemas auto-generated from field definitions.

**Why this matters for AI:** When AI generates a new strategy type, it produces a `StrategyConfigSchema` (JSON). The `DynamicForm` renders the configuration UI automatically — no new React components needed. The AI defines *what* fields exist; the form system handles *how* they render.

### 4.2 Entity Management Components

```
src/workspaces/shared/entity/
├── EntityTable.tsx           — Generic data table with search, sort, pagination, row actions
├── EntityPage.tsx            — Full page wrapper: header + table + add/edit modal + delete confirm
├── CrudModal.tsx             — Reusable add/edit modal (schema-driven via DynamicForm)
├── ConfirmDialog.tsx         — Reusable confirmation dialog
├── StatusBadge.tsx           — Status indicator (running/stopped/active/inactive/success/error)
├── types.ts                  — EntityTableColumn, EntityAction, CrudModalConfig
└── index.ts
```

**`EntityTable<T>`** — the workhorse:
```typescript
interface EntityTableProps<T> {
  columns: EntityTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  // Search
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  // Pagination (fixes Inc-6)
  pagination?: { totalItems: number; itemsPerPage: number; currentPage: number; onPageChange: (page: number) => void };
  // Row actions
  rowActions?: EntityAction<T>[];
  // Selection
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  // Empty state
  emptyState?: React.ReactNode;
}
```

Used by: Users, Brokers, Strategy (Entity), Instrument, Report Alerts, Tradeboard List, Logs, Thread, Order Positions.

**`EntityPage<T>`** — composes EntityTable + CrudModal + ConfirmDialog + PageHeader into a complete CRUD page. Reduces each entity page to ~50 lines of config.

**`CrudModal`** — wraps shadcn `Dialog` + `DynamicForm`. Add/edit mode. Auto-generates Zod validation from field definitions.

### 4.3 Domain-Specific Reusable Components

```
src/workspaces/shared/selectors/
├── UserSelector.tsx          — Admin user dropdown (loads from account/list, caches in TanStack Query)
├── BrokerSelector.tsx        — Broker account dropdown (loads from baccount/list, filtered by user)
├── StrategySelector.tsx       — Strategy type dropdown (loads from strategy/list)
├── SymbolSelector.tsx         — Symbol/instrument dropdown (loads from symbol/list, cascades from exchange/segment)
├── ExchangeSegmentSelector.tsx — Cascading exchange → segment selector
├── DateRangePicker.tsx        — Date range picker for reports/logs (uses date-fns + shadcn Calendar)
├── NotificationAlert.tsx      — Toast/alert wrapper (replaces Angular NotificationService → Sonner)
├── JsonViewer.tsx             — JSON tree viewer (replaces ngx-json-viewer for logs)
├── PageHeader.tsx             — Title + description + action buttons
├── TabbedView.tsx             — Reusable tab container (uses shadcn Tabs)
└── index.ts
```

### 4.4 Layout Components

```
src/workspaces/
├── admin/
│    ├── AdminWorkspace.tsx    — Admin entry point (own sidebar + header + router outlet)
│    ├── AdminSidebar.tsx       — Admin-only navigation items
│    └── AdminHeader.tsx        — Admin header (user menu, theme toggle, notifications)
│
├── client/
│    ├── ClientWorkspace.tsx   — Client entry point (own sidebar + header + router outlet)
│    ├── ClientSidebar.tsx      — Client-only navigation items
│    └── ClientHeader.tsx       — Client header (user menu, theme toggle, notifications)
│
└── shared/
     └── ThemeToggle.tsx        — Light/Dark toggle (replaces jQuery theme switching → next-themes)
```

### 4.5 Component Dependency Graph

```
EntityPage<T>
  ├─ PageHeader
  ├─ EntityTable<T>
  │    └─ StatusBadge (in cells)
  ├─ CrudModal
  │    └─ DynamicForm
  │         └─ DynamicSection[]
  │              └─ DynamicField[]
  └─ ConfirmDialog

StrategyPage (specialized EntityPage)
  └─ StrategyBuilder wizard
       ├─ Step 1: Strategy Config (name, type, direction, duration)
       └─ Step 2: mode-dependent sections
            ├─ [indicator mode] EnhancedCreateStrategyDialog steps
            │    ├─ IndicatorSelectionStep → DynamicIndicatorConfig
            │    ├─ EnhancedConditionsBuilder
            │    ├─ EnhancedExitConditionsBuilder
            │    ├─ ReentrySettingsBuilder
            │    └─ SpecialScenariosBuilder
            ├─ [layout mode] DynamicForm
            │    └─ DynamicSection[] (from config_schema)
            └─ [combined mode] DynamicForm + indicator steps (if supports_indicators)
       └─ Step 3: Summary & Save

AdminWorkspace (lazy chunk — never loaded for clients)
  ├─ AdminSidebar + AdminHeader
  └─ Admin routes (lazy-loaded pages)
       └─ EntityPage / StrategyBuilder / specialized pages

ClientWorkspace (lazy chunk — never loaded for admins)
  ├─ ClientSidebar + ClientHeader
  └─ Client routes (lazy-loaded pages)
       └─ EntityPage / StrategyBuilder / specialized pages (filtered to own data)
```

---

## 5. Data Layer Architecture

### Dual Backend Configuration (Transition Period)

During the transition, the React app talks to **two backends**:

- **Django backend** (AlgoHopperBot) — full feature set: auth, users, brokers, channels, threads, strategies, instruments, orders, positions, data collection, reports, logs, settings. 5 microservice base URLs.
- **Gin backend** (TAHAnalyse) — existing features: indicators, tests, credits. Single base URL.

When backends merge, all services consolidate to one base URL.

### Multi-BaseURL API Setup

```typescript
// src/services/api/clients.ts
import axios, { AxiosInstance } from 'axios';

// === Django backend instances (AlgoHopperBot) ===
export const faqApi    = createClient(import.meta.env.VITE_BASE_URL, 'django');
export const contApi    = createClient(import.meta.env.VITE_CONT_BASE_URL, 'django');
export const feedApi    = createClient(import.meta.env.VITE_FEED_BASE_URL, 'django');
export const orderApi   = createClient(import.meta.env.VITE_ORDER_BASE_URL, 'django');
export const reportApi  = createClient(import.meta.env.VITE_REPORT_BASE_URL, 'django');

// === Gin backend instance (TAHAnalyse — existing) ===
export const ginApi     = createClient(import.meta.env.VITE_API_BASE_URL, 'gin');

function createClient(baseURL: string, backend: 'django' | 'gin'): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 15000 });
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      // Django expects 'token' header; Gin expects 'Authorization: Bearer'
      if (backend === 'django') {
        config.headers['token'] = token;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );
  return client;
}
```

### Service Module Pattern

```typescript
// src/services/api/strategies.api.ts
import { faqApi, apiRequest } from './clients';
import type { StrategyTypeDefinition } from '@/types/strategy-type';

export const strategiesApi = {
  list: () => apiRequest<StrategyTypeDefinition[]>({ method: 'get', url: 'strategy/list/', client: faqApi }),
  add: (data: AddStrategyDTO) => apiRequest({ method: 'post', url: 'strategy/add/', data, client: faqApi }),
  update: (data: UpdateStrategyDTO) => apiRequest({ method: 'put', url: 'strategy/update/', data, client: faqApi }),
  delete: (id: string) => apiRequest({ method: 'delete', url: 'strategy/delete/', params: { sid: id }, client: faqApi }),
  updateState: (data) => apiRequest({ method: 'put', url: 'strategy/update/state/', data, client: faqApi }),
  updateScope: (data) => apiRequest({ method: 'put', url: 'strategy/update/scope/', data, client: faqApi }),
};

// src/services/api/indicators.api.ts (Gin backend)
import { ginApi } from './clients';
export const indicatorsApi = {
  list: () => apiRequest({ method: 'get', url: 'indicators', client: ginApi }),
  // ... when wired to Gin API
};
```

### TanStack Query Hook Pattern

```typescript
// src/hooks/queries/useStrategies.ts
export function useStrategies() {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: strategiesApi.list,
    staleTime: 5 * 60 * 1000,  // 5 min cache
  });
}

export function useCreateStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: strategiesApi.add,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['strategies'] }),
  });
}
```

**One hook file per entity** — this is the pattern for all services.

### Service-to-Backend Mapping

| Service | Backend | Client |
|---|---|---|
| LoginService | Django | `faqApi` |
| AccountService | Django | `faqApi` |
| BrokerService | Django | `faqApi` |
| ChannelService | Django | `faqApi` (dynamic server URL) |
| StrategyService | Django | `faqApi` |
| ThreadService | Django | `faqApi` |
| InstrumentService | Django | `faqApi` |
| DataCollectionService | Django | `faqApi` |
| ConfigService | Django | `faqApi` |
| AppService | Django | `faqApi` |
| ReportService | Django | `reportApi` |
| TradeboardService | Django | `orderApi` |
| OrderService | Django | `orderApi` |
| PositionService | Django | `orderApi` |
| ClientService | Django | `faqApi` |
| LogService | Django | `faqApi` |
| SymbolService | Django | `faqApi` |
| IndicatorService | Gin | `ginApi` |
| TestService | Gin | `ginApi` |
| CreditsService | Gin | `ginApi` |

### Environment Variables

```env
# .env.development

# === Django backend (AlgoHopperBot) ===
VITE_BASE_URL=https://tah.thealgohopper.com/faq/
VITE_CONT_BASE_URL=https://tah.thealgohopper.com/qcont_api/
VITE_FEED_BASE_URL=https://tah.thealgohopper.com/qfeed_api/
VITE_FEED_SOCK_URL=https://tah.thealgohopper.com/qfeed_sock
VITE_ORDER_BASE_URL=https://tah.thealgohopper.com/qorder_api/
VITE_REPORT_BASE_URL=https://tah.thealgohopper.com/qreport_api/

# === Gin backend (TAHAnalyse — existing) ===
VITE_API_BASE_URL=http://localhost:8080/api

# .env.production

# === Django backend (AlgoHopperBot) ===
VITE_BASE_URL=https://thealgohopper.com/faq/
VITE_CONT_BASE_URL=https://thealgohopper.com/qcont_api/
VITE_FEED_BASE_URL=https://thealgohopper.com/qfeed_api/
VITE_FEED_SOCK_URL=https://thealgohopper.com/qfeed_sock
VITE_ORDER_BASE_URL=https://thealgohopper.com/qorder_api/
VITE_REPORT_BASE_URL=https://thealgohopper.com/qreport_api/

# === Gin backend (TAHAnalyse — existing) ===
VITE_API_BASE_URL=https://thalgohopper.com/tahanalyse/api
```

---

## 6. Dynamic UI Framework for AI-Generated Strategies

The user said: *"dynamic UI has to be created based on the strategies added with help of AI."*

### How It Works

```
AI generates strategy type definition (JSON)
  ↓
{
  name: "ai_mean_reversion_v3",
  display_name: "AI Mean Reversion V3",
  config_schema: {
    sections: [
      {
        id: "symbol",
        title: "Symbol Selection",
        layout: "symbol",
        fields: [
          { name: "exchange", label: "Exchange", type: "select",
            options_source: { api: "symbol/exchanges/" } },
          { name: "segment", label: "Segment", type: "select",
            options_source: { api: "segments/", params: { exchange: "$exchange" } } },
          ...
        ]
      },
      {
        id: "entry",
        title: "Entry Conditions",
        layout: "trade",
        fields: [
          { name: "entry_type", label: "Entry Type", type: "select",
            options: [{ label: "Breakout", value: "breakout" }, ...] },
          { name: "confirmation_candles", label: "Confirmation Candles",
            type: "number", default: 3, min: 1, max: 10 },
          ...
        ]
      },
      ...
    ]
  }
}
  ↓
Strategy Builder renders DynamicForm from config_schema
  ↓
User fills in values → saved as StrategyInstance.config
  ↓
StrategyInstance deployed as StrategyThread (execution)
```

### Key Design Principles

1. **Strategy type = data, not code.** New strategy types are JSON definitions, not React components. The `DynamicForm` renders them. No code changes needed for new strategy types.

2. **Field types are extensible.** The `DynamicField` component handles known types (text, number, select, boolean, multi-select, group). New types can be added by registering a new renderer — AI can use existing types, and we add new ones as needed.

3. **Options can be dynamic.** Fields with `options_source` load options from an API endpoint (e.g., exchange list, segment list, symbol list). The `DynamicField` component fetches and caches these via TanStack Query.

4. **Sections can be conditional.** A section's `visible_when` clause shows/hides it based on other field values. This enables complex strategy configurations where different modes show different fields.

5. **Validation is auto-generated.** The `DynamicForm` generates Zod schemas from field definitions (required, min, max, pattern). No manual validation code per strategy type.

6. **The builder adapts.** For indicator-based strategies (TAHAnalyse's model), the wizard shows indicator selection + condition builders. For layout-based strategies (AlgoHopperBot's model), the wizard shows layout sections via `DynamicForm`. The strategy type definition determines which mode to use.

### Strategy Type Registry

```typescript
// src/lib/strategy-type-registry.ts

// Built-in strategy types with their config schemas
const BUILT_IN_TYPES: Record<string, StrategyConfigSchema> = {
  lss_v1: { sections: [/* symbol, time, trade, order, target, sl, tsl, ... */] },
  orb_v1: { sections: [/* symbol, time, order, target, sl, tsl, reenter, ... */] },
  trend_following: { sections: [/* indicators, entry, exit, reentry, ... */] },
  // ... other TAHAnalyse types
};

// AI-generated types are fetched from API and merged
async function loadStrategyTypes(): Promise<Record<string, StrategyConfigSchema>> {
  const apiTypes = await strategiesApi.list();
  const merged = { ...BUILT_IN_TYPES };
  for (const type of apiTypes) {
    if (type.config_schema) {
      merged[type.name] = type.config_schema;
    }
  }
  return merged;
}
```

---

## 7. Migration Phases

### Phase 0: Foundation (prerequisite for everything)

| # | Task | Tracker Ref | Details |
|---|---|---|---|
| 0.1 | Environment variables | BE-1, C-4 | Add all 6 env vars (5 Django + 1 Gin) to `.env.development` and `.env.production` |
| 0.2 | Multi-Axios setup | BE-2, BE-3 | Create `clients.ts` with 6 Axios instances. Django instances (`faqApi`, `contApi`, `feedApi`, `orderApi`, `reportApi`) inject `token` header from localStorage. Gin instance (`ginApi`) injects `Authorization: Bearer`. 401 → `localStorage.clear()` + redirect `/login`. |
| 0.3 | Port constants | C-1 | `constants.ts` → `src/lib/constants.ts` — all API endpoint paths, URI paths, defaults, intervals, strategy types, ORB config enums |
| 0.4 | Port error codes | C-2 | `error.codes.ts` → `src/lib/error-codes.ts` |
| 0.5 | Port all types/interfaces | C-3 | Full TypeScript interfaces for every API request/response shape → `src/types/` — user, broker, channel, thread, instrument, order, position, report, log, config, symbol, etc. Add alongside existing strategy types (keep existing `Strategy`, `Condition`, `ExitCondition` etc). |
| 0.6 | Enhance AuthContext | R-1, R-2, R-3, R-4 | Login via Django `POST auth/login/`. Store token in localStorage `access_token`. Store user object in localStorage `tahanalyzer_user`. User shape: `{ id, full_name, email, phone, role: 'admin'\|'user' }`. Fix logout to clear both keys. Add token validation on app load via `GET account/profile/`. Remove `user.name` usage — use `user.full_name` everywhere. Session: localStorage (not sessionStorage). |
| 0.7 | TanStack Query setup | — | Add default options to QueryClient: `staleTime: 5 * 60 * 1000`, `retry: 1`, `refetchOnWindowFocus: false`. |
| 0.8 | React Hook Form + Zod | — | Create reusable form patterns. Wire shadcn `Form` component throughout. Replace all controlled-`useState` forms. |
| 0.9 | Theme system | MP-17 | Keep TAHAnalyse HSL CSS variable theme. Configure `next-themes` for light/dark toggle. No jQuery. |
| 0.10 | Remove Alert.js | SS-9 | Delete `alert.js` legacy helper. Use Sonner (`toast`) everywhere instead. |
| 0.11 | Remove jQuery dependency | MP-17 | Ensure jQuery is not added to `package.json`. Uninstall if present. |
| 0.12 | Workspace scaffolding | — | Create `src/workspaces/admin/`, `src/workspaces/client/`, `src/workspaces/shared/` with lazy-loaded entry points. Set up code-splitting boundaries. |
| 0.13 | Update App.tsx | R-1 | Replace flat routing with workspace pattern: `/login` standalone; role-based lazy workspace loading (`React.lazy` for AdminWorkspace/ClientWorkspace). |

### Phase 1: Reusable Component Library

| # | Task | Tracker Ref | Details |
|---|---|---|---|
| 1.1 | `DynamicField` | SS-6 | Renders one field from FieldDefinition: text/number → shadcn `Input`, select → `Select`/`Combobox`, boolean → `Switch`, multi-select → Combobox, group → nested fields. Dynamic options loaded via TanStack Query when `options_source` is set. Replaces Angular jQuery form helpers. |
| 1.2 | `DynamicSection` | SS-6 | Titled group of `DynamicField`s with `visible_when` conditional visibility. Uses shadcn `Card` or plain `div`. |
| 1.3 | `DynamicForm` | SS-6 | Renders array of sections. Integrates React Hook Form + auto-generated Zod schema from field definitions. Replaces `JqueryUtils` form resets → RHF `reset()`. |
| 1.4 | `EntityTable<T>` | P-22, Inc-6 | Generic table: columns config, search (client-side), sort, TanStack Query pagination (fixes Inc-6 empty `next()`/`prev()` stubs), row actions dropdown, selectable rows, empty state. Uses shadcn `Table`. |
| 1.5 | `EntityPage<T>` | P-6→P-18 | Full CRUD page wrapper: composes `PageHeader` + `EntityTable` + `CrudModal` + `ConfirmDialog`. Reduces each entity page to config only. |
| 1.6 | `CrudModal` | SS-6 | Add/edit modal: shadcn `Dialog` + `DynamicForm`. Auto-generates Zod validation from field definitions. Replaces Angular Bootstrap modals + jQuery show/hide. |
| 1.7 | `ConfirmDialog` | Gap-5 | Reusable confirmation dialog (shadcn `AlertDialog`). Fixes Gap-5 (strategy delete logic) — caller passes `onConfirm` callback directly, no action-string matching needed. |
| 1.8 | `StatusBadge` | SS-2 | Status indicator for running/stopped/active/inactive/success/error/warning. Uses shadcn `Badge` + TAHAnalyse theme tokens (`success`, `warning`). Replaces Angular NotificationService inline status display. |
| 1.9 | `PageHeader` | — | Title + description + action buttons (e.g. "Add User" button). Used by every page. |
| 1.10 | `TabbedView` | P-14, P-21 | Reusable tab container (shadcn `Tabs`). Used by Tradeboard, Order Positions, Logs. |
| 1.11 | `UserSelector` | SS-1 | Admin user dropdown. Fetches `account/list/` via TanStack Query. Cached. Replaces Angular `DataService` shared user list. |
| 1.12 | `BrokerSelector` | SS-1 | Broker account dropdown. Fetches `baccount/list/` filtered by user. Cached. |
| 1.13 | `StrategySelector` | SS-1 | Strategy type dropdown. Fetches `strategy/list/`. Cached. |
| 1.14 | `SymbolSelector` | SS-1 | Symbol/instrument cascading selector. Fetches instruments. Cascades from exchange/segment. |
| 1.15 | `ExchangeSegmentSelector` | SS-1 | Cascading exchange → segment. Fetches `symbol/exchanges/` then `segments/`. Replaces Angular `DataService.setExchanges()` pattern. |
| 1.16 | `DateRangePicker` | P-15, P-16, P-17 | Date range picker using `date-fns` + shadcn `Calendar` + `Popover`. Used by DataCollection, Reports, Logs. |
| 1.17 | `JsonViewer` | P-17 | JSON tree viewer component. Replaces `ngx-json-viewer`. Used by Logs detailed view. |
| 1.18 | `NotificationAlert` | SS-2 | Centralised toast wrapper around Sonner `toast()`. Replaces Angular `NotificationService.showAlert()`. Exposes `notify.success()`, `notify.error()`, `notify.warn()`. |
| 1.19 | `ThemeToggle` | MP-17 | Light/Dark mode toggle using `next-themes`. Replaces jQuery `$("#LightTheme").on("click", ...)`. |

### Phase 2: Workspace Layout & Navigation

| # | Task | Tracker Ref | Details |
|---|---|---|---|
| 2.1 | AdminWorkspace | P-1, P-3, MP-17 | Lazy-loaded entry point. Own sidebar, header, router outlet. Replaces Angular `WrapperComponent`. No jQuery. |
| 2.2 | ClientWorkspace | P-1, P-3, MP-17 | Lazy-loaded entry point. Own sidebar, header, router outlet. |
| 2.3 | AdminSidebar | P-3, MP-16 | Admin nav with nested collapsible groups using Radix `Collapsible` (not jQuery). Menu: Users, Brokers, Indicators, Strategy▸(Backtest▸Dashboard/Tests/Strategies, Thread), Orders&Positions, Tradeboard, Channels, Reports, Entity▸(Strategy/Instruments), DataCollection, Logs, Settings. Active state via `useLocation()` — fix MP-16 (no missing constant lookups). |
| 2.4 | ClientSidebar | P-3 | Client nav subset using same pattern as AdminSidebar. Menu: Brokers, Indicators, Strategy▸(Backtest▸Dashboard/Tests/Strategies, Thread), Orders&Positions, Tradeboard, Logs, Settings, Credits, Tutorial. |
| 2.5 | AdminHeader | P-2, MP-18 | User menu (fix `user.name` → `user.full_name` bug), theme toggle (`ThemeToggle`), notifications bell. Logout wired to AuthContext. |
| 2.6 | ClientHeader | P-2 | Same as AdminHeader. |
| 2.7 | Route guards | R-1 | AdminWorkspace only renders for `role === 'admin'`; ClientWorkspace only for `role === 'user'`. Unauthenticated → `/login`. Wrong role → `/unauthorized`. |
| 2.8 | Code splitting verification | — | Confirm via `vite build --analyze` that admin and client chunks are separate. Admin chunk must not load for clients. |

### Phase 3: Auth & User Management

| # | Task | Tracker Ref | Details |
|---|---|---|---|
| 3.1 | Login page | P-4 | Standalone (no layout). T&C modal (Angular pattern). Email/password form with RHF + Zod. Calls Django `POST auth/login/`. On success: admin → `/admin`, client → `/client`. Uses existing TAHAnalyse theme. |
| 3.2 | Change Password | P-5, MP-18 | Settings sub-section modal. RHF + Zod cross-field validation (new/confirm match). Calls `PUT account/changepassword/` (renamed from `chnagePassword` — fixes MP-18). Auto-logout on success. |
| 3.3 | Users page | P-6, Inc-6 | `EntityPage<User>` with CRUD (add/edit/delete/activate/deactivate). Pagination wired to API (fixes Inc-6). Password field shown only on add. Route: `/admin/users`. |
| 3.4 | Settings — profile | P-18 | Phone/email/subscription end date management. `PUT account/update/`. Both admin and client. |
| 3.5 | Settings — admin config | P-18 | Feed token, feed ID, feed broker via `ConfigService`. App state panel: Contracts Loaded / Feed User Connected with trigger buttons (`GET app/state`, `GET app/initialize`). Admin only. |

### Phase 4: Strategy System Unification

> **Migration scope (Decision 17 & 18):** Port Angular strategy system as-is. Do not add the dynamic config_schema / AI form system during migration — that is a separate post-migration phase. Port `strategy-details-modal` layouts (`lss_v1`, `orb_v1`) directly. Keep TAHAnalyse indicator wizard as-is. Custom script registration admin UI is also deferred. Use real API data throughout (Decision 16).

| # | Task | Tracker Ref | Details |
|---|---|---|---|
| 4.1 | Strategy type definitions | S-5, C-3 | Port `lss_v1` and `orb_v1` layout sections as `ConfigSchema` with `builder_mode: 'layout'`. Existing TAHAnalyse types get `builder_mode: 'indicator'`. Combined custom types get `builder_mode: 'combined'`. Add `builder_mode`, `supports_indicators`, `supports_custom_indicators` to `StrategyTypeDefinition`. |
| 4.2 | Strategy type registry | — | `src/lib/strategy-type-registry.ts` — built-in schemas for `lss_v1`, `orb_v1`, `trend_following`. AI-generated types fetched from `strategy/list/` API and merged at runtime. |
| 4.3 | Port StrategyHelper | SS-7 | `StrategyHelper.toUsRow()`, param population → pure TypeScript utility `src/lib/strategy-helper.ts`. No Angular DI. |
| 4.4 | Strategy entity page | P-10, Gap-5, Inc-6 | `EntityPage<StrategyTypeDefinition>` — CRUD for master definitions. Pagination wired (Inc-6). Delete via `ConfirmDialog` with direct `onConfirm` callback — fixes Gap-5 action-string mismatch. Route: `/admin/entity/strategy`. |
| 4.5 | Strategy Builder wizard | P-20, S-5 | Merge TAHAnalyse's `EnhancedCreateStrategyDialog` with `DynamicForm`. Mode 1 (indicator): existing wizard steps. Mode 2 (layout): `DynamicForm` sections from `config_schema`. Mode 3 (combined): both. Routes: `/*/strategy/backtest/strategies`. |
| 4.6 | Thread page | P-9, Inc-6, Inc-10 | Strategy execution management. `EntityTable<Thread>` with start/stop toggle, enable/disable toggle, inline display-name edit, edit (opens Strategy Builder), copy, delete. Pagination wired (Inc-6). Restart = stop then start (fixes Inc-10). Admin: `UserSelector` to filter by user. Client: filtered to own. Routes: `/admin/strategy/thread`, `/client/strategy/thread`. |
| 4.7 | Backtest Dashboard | P-19, Gap-2 | Under `/*/strategy/backtest/dashboard`. Replaces TAHAnalyse mock + Angular client PnL. Calls `client/strategies` and `client/report` (Gap-2: keep `"test/"` endpoints as-is). PnL bar chart via recharts. |
| 4.8 | Backtest Tests | — | Move `Tests` page to `/*/strategy/backtest/tests`. Replace local state with Gin API TanStack Query when available. |
| 4.9 | Backtest Strategies | — | Move `Strategies` page (strategy library/builder) to `/*/strategy/backtest/strategies`. Replace local state with Django `strategy/add`/`strategy/update` API. |

### Phase 5: Broker & Trading

| # | Task | Tracker Ref | Details |
|---|---|---|---|
| 5.1 | Brokers page | P-7, Inc-9 | `EntityPage<Broker>` + connect action (opens login URL) + show-funds action. Admin: `UserSelector` to view all users' brokers. Client: own brokers only. Alice Blue wired, Angel Broking shows "not configured" (Inc-9 replicate as-is). `onBrokerChanged`, `onLoginTypeChanged` empty stubs as-is. Password field with show/hide toggle. Routes: `/admin/brokers`, `/client/brokers`. |
| 5.2 | Channels page | P-8 | Server list dropdown → channel table with broker name, login/connection status badges. Start/stop/switch actions. Test/live mode toggle. Dynamic per-server URL routing (ChannelService). Route: `/admin/channels`. |
| 5.3 | Orders & Positions | P-12, Gap-1 | `TabbedView` with Orders tab + Positions tab. Admin: `UserSelector` then Load button. Cancel order + close position with `ConfirmDialog`. WebSocket (Gap-1): socket structure present but disabled. Routes: `/admin/orders-positions`, `/client/orders-positions`. |
| 5.4 | Tradeboard List | P-13, Inc-6 | `EntityTable<Tradeboard>` with open/add/delete. Pagination wired (Inc-6). Navigate to Tradeboard editor with state. Routes: `/admin/tradeboard`, `/client/tradeboard`. |
| 5.5 | Tradeboard Editor | P-14, P-21, Gap-3 | Tab-based editor. `DynamicForm` for settings tab (symbol, product type, users/broker accounts, option contracts, Target/SL/TSL config). Positions tab shows live positions. `placeOrder()`, `placeExitOrder()`, `modifyOrder()`, `cancelOrder()`, all type-change handlers — empty stubs (Gap-3 replicate as-is). Routes: `/admin/tradeboard/:name`, `/client/tradeboard/:name`. |

### Phase 6: Data & Reports

| # | Task | Tracker Ref | Details |
|---|---|---|---|
| 6.1 | Data Collection | P-15, S-8, S-9 | Category selector + `DateRangePicker`. Run/stop/check/archive operations with status feedback. `dc_token` config via `ConfigService`. `onCategoryChanged` empty stub (Inc note: replicate as-is). Route: `/admin/data-collection`. |
| 6.2 | Report Alerts | P-16, Gap-4, Inc-6 | `EntityPage<Report>` — Report CRUD + generate/download PDF. View modal with per-strategy data + manual entry. Pagination wired (Inc-6). Symbol selection: `loadSegments()` + `listSymbols()` remain commented/disabled (Gap-4 replicate as-is). `onInputTypeChanged`, `onPeriodChanged`, `on_no_data`, `onSymbolSelected` remain stubs. Remove `import { rejects } from 'assert'` (DC-5). Route: `/admin/reports`. |
| 6.3 | Logs | P-17, Inc-6, Inc-8 | Admin: `UserSelector` + strategy selector + date + log type (State/Log). State logs: `TabbedView` with Detailed (`JsonViewer`) + Short (table). Client: Short state view only. Pagination wired via `EntityTable` (Inc-6). Search + clear wired to API (Inc-8 fix for initial page load; full search/pagination fixed by Inc-6). Route: `/admin/logs`, `/client/logs`. |
| 6.4 | Client Dashboard | P-19, Gap-2 | Running/completed strategy positions with per-leg PnL + close-leg. PnL bar chart (`recharts` — already installed). `ClientService` endpoints remain `"test/"` (Gap-2 replicate as-is). Route: `/client/strategy/backtest/dashboard`. |
| 6.5 | Admin Dashboard | — | System overview stats (wire TAHAnalyse's existing stat cards to Django API). Route: `/admin` (index). |

### Phase 7: Remaining Features, Cleanup & Dead Code

| # | Task | Tracker Ref | Details |
|---|---|---|---|
| 7.1 | Instrument page | P-11, Inc-6 | `EntityPage<Instrument>` + nested expiry management modal (sub-modal within CrudModal). Pagination wired (Inc-6). Activate/deactivate toggle. Route: `/admin/entity/instruments`. |
| 7.2 | Indicators page | — | Keep existing TAHAnalyse Indicators page. Move to `/admin/indicators` and `/client/indicators`. Replace local state with Gin API + TanStack Query when Gin endpoints are confirmed (O-2). |
| 7.3 | Credits page | — | Keep existing TAHAnalyse Credits page. Move to `/client/credits`. Wire to Gin API when confirmed (O-2). |
| 7.4 | Tutorial placeholder | DC-Keep-1 | Port empty tutorial page with "Coming Soon" content. Add sidebar link in both Admin and Client sidebars. Routes: `/admin/tutorial`, `/client/tutorial`. |
| 7.5 | Scheduler stub | Inc-7 | Port Angular scheduler component structure as a stub page. No API calls wired. Not in sidebar (replicate as-is). |
| 7.6 | Remove dead code — Angular sources | DC-1, DC-2, DC-3, DC-4, DC-5 | Do not port to React: `report` component (Google Sheets), `monthlyreport` component (Google Sheets), `live` component (legacy strategy UI). Ensure `google-generated-creds.json` is NOT copied to TAHAnalyse. Remove `import { rejects } from 'assert'` from report-alerts (already handled in 6.2). |
| 7.7 | Remove dead code — TAHAnalyse sources | — | Delete legacy dead components: `CreateStrategyDialog.tsx`, `DynamicConditionsBuilder.tsx`, `ExitConditionsBuilder.tsx` (superseded by Enhanced* variants). |
| 7.8 | Remove StrategyActions dead code | — | `StrategyActions.tsx` is defined but never imported by any page. Remove or properly wire it. |
| 7.9 | Fix LoginForm demo credentials | — | `LoginForm` has hardcoded visible demo credentials (`admin@tahanalyzer.com / admin123`). Remove before production. |
| 7.10 | Fix ProtectedRoute UserRole import | — | `ProtectedRoute` imports `UserRole` from `AuthContext` which doesn't export it (latent type error). Fix to import from `types/user.ts`. |
| 7.11 | Fix `CreateCustomIndicatorDialog` anti-pattern | — | Uses `document.getElementById` to read input values. Replace with RHF `register` / `Controller`. |

---

## 8. What Changes in Existing TAHAnalyse Code

| File | Change | Tracker Ref |
|---|---|---|
| `App.tsx` | Replace flat routing with workspace pattern: `/login` standalone, role-based lazy workspace loading | R-1 |
| `contexts/AuthContext.tsx` | Login via Django `POST auth/login/`. Fix `user.name` → `user.full_name`. Fix logout to clear `access_token` + `tahanalyzer_user`. Token validation on load via `GET account/profile/`. Session: localStorage. | R-2, R-3, R-4 |
| `components/layout/AppSidebar.tsx` | Split: `workspaces/admin/AdminSidebar.tsx` (full admin menu with collapsible groups) and `workspaces/client/ClientSidebar.tsx` (client subset). Active state via `useLocation()` — no missing constant lookups. | P-3, MP-16 |
| `components/layout/AppHeader.tsx` | Split into per-workspace headers. Fix `user.name` → `user.full_name`. Add `ThemeToggle`. | P-2 |
| `pages/Strategies.tsx` | Move → `workspaces/*/pages/strategy/backtest/strategies.tsx`. Replace local state with TanStack Query. Support all 3 builder modes. | P-9 |
| `pages/Dashboard.tsx` | Move → `workspaces/*/pages/strategy/backtest/dashboard.tsx`. Replace mock with real PnL data (Gap-2 as-is). | P-19 |
| `pages/Indicators.tsx` | Move → `workspaces/*/pages/indicators.tsx` (top-level). Replace local state with Gin API + TanStack Query. | — |
| `pages/Tests.tsx` | Move → `workspaces/*/pages/strategy/backtest/tests.tsx`. Wire to Gin API. | — |
| `pages/Login.tsx` / `LoginForm.tsx` | Add T&C modal. Role-based redirect. Remove demo credentials. | P-4 |
| `components/auth/ProtectedRoute.tsx` | Fix `UserRole` import (from `types/user.ts` not `AuthContext`). Wire `requiredRole` prop. | R-1 |
| `services/api/axios.ts` | Replace single axios instance with `clients.ts` (6 instances, dual auth headers). | BE-2, BE-3 |
| `services/api/interceptors.ts` | Interceptors now live inside `createClient()` factory in `clients.ts`. Remove standalone `interceptors.ts`. | BE-3 |
| `services/api/internal/auth.api.ts` | Update `loginAPI` to call Django `POST auth/login/` via `faqApi`. | S-1 |
| `components/strategy/StrategyActions.tsx` | Currently dead code (not imported by any page). Remove or wire. | — |
| `components/indicators/CreateCustomIndicatorDialog.tsx` | Replace `document.getElementById` with RHF `Controller`. | — |
| `types/user.ts` | Already has correct shape. Export `UserRole` — no change needed. | C-3 |
| `index.css` | Theme system already correct. Add `next-themes` class toggling. | MP-17 |
| `tailwind.config.ts` | Already has custom tokens. Extend as needed. | — |
| `new: src/workspaces/admin/` | AdminWorkspace, AdminSidebar, AdminHeader, admin route tree | P-1 |
| `new: src/workspaces/client/` | ClientWorkspace, ClientSidebar, ClientHeader, client route tree | P-1 |
| `new: src/workspaces/shared/` | EntityTable, DynamicForm, selectors, StatusBadge, ConfirmDialog, PageHeader, etc. | Phase 1 |
| `new: src/services/api/clients.ts` | Multi-Axios factory | BE-2 |
| `new: src/services/api/*.api.ts` | One file per service (17 Django + 3 Gin) | S-1 to S-17 |
| `new: src/hooks/queries/*.ts` | One TanStack Query hook file per entity | — |
| `new: src/lib/constants.ts` | Ported from Angular `constants.ts` | C-1 |
| `new: src/lib/error-codes.ts` | Ported from Angular `error.codes.ts` | C-2 |
| `new: src/lib/strategy-helper.ts` | Ported from Angular `StrategyHelper` | SS-7 |
## 9. Key Decisions — Resolved & Open

### Resolved Decisions

| # | Decision | Resolution |
|---|---|---|
| 1 | Session storage | **localStorage** — persists across tabs and browser restarts. Token in separate `access_token` key. Switch to httpOnly cookies when backends merge. |
| 2 | Auth token format | **Django: `token` header** (matching Angular's interceptor). **Gin: `Authorization: Bearer`** (existing pattern). Each Axios instance uses the correct header for its backend. |
| 3 | Strategy Builder modes | **All three modes** — indicator-based (TAHAnalyse), layout-based/price-action (AlgoHopperBot), and combined/custom. Mode determined by `StrategyTypeDefinition.builder_mode`. |
| 4 | Routing architecture | **Login standalone + Admin/Client as separate lazy-loaded workspaces.** Client code never loads for admins and vice versa. |
| 5 | Dashboard separation | **Separate dashboards** — admin sees system overview + all users; client sees own PnL/positions. |
| 6 | Credits page | **Client workspace only** — confirmed (point 6). |
| 7 | Backend transition | **Dual backend** (Django + Gin). Login via Django. TAHAnalyse features (indicators, tests, credits) call Gin. Consolidate when backends merge. |
| 8 | Existing TAHAnalyse types | **Keep as-is** — existing `Strategy`, `Condition`, `ExitCondition` serve as the indicator-based variant. New types added alongside. |
| 9 | Theme | **TAHAnalyse theme** — HSL CSS variables, shadcn/ui, `next-themes`. No jQuery. |
| 10 | Reusable components | **Maximize reuse** — EntityTable, DynamicForm, CrudModal, selectors everywhere. |
| 11 | Login backend | **Django login** — full role system. Gin for TAHAnalyse-specific features only. |
| 12 | Menu structure | **Admin:** Users, Brokers, Indicators, Strategy▸(Backtest▸Dashboard/Tests/Strategies, Thread), Orders&Positions, Tradeboard, Channels, Reports, Entity▸(Strategy/Instruments), DataCollection, Logs, Settings. **Client:** Brokers, Indicators, Strategy▸(Backtest▸Dashboard/Tests/Strategies, Thread), Orders&Positions, Tradeboard, Logs, Settings, Credits, Tutorial. |
| 13 | Client menu items (Q-2) | **Confirmed** — Client has access to: Orders & Positions (own), Credits, Tradeboard. Menu is correct as-is. |
| 14 | Admin personal trading | Admin can trade for their own personal account. Since admin has access to all panels (Users, Brokers, Thread, Orders & Positions, Tradeboard), this is naturally covered within the admin workspace — no separate client workspace needed for admin. Admin manages their personal broker accounts + strategies exactly the same way they manage any user's, just filtered to their own account when needed. |
| 15 | Admin workspace access | **Admin does NOT get access to client workspace.** Admin workspace already covers everything including personal trading. No workspace switching or impersonation feature in this migration. |
| 16 | TAHAnalyse real data | **All TAHAnalyse features use real/master data.** Dashboard, Tests, Strategies, Indicators — replace all mock/local state with live API data. Gin backend for TAHAnalyse features; Django for everything else. |
| 17 | Custom strategy scripts (O-3) | **Deferred post-migration.** Port the Angular admin panel's existing strategy entity CRUD as-is to React. The dynamic form / AI config_schema / custom script registration feature will be designed and implemented as a separate phase after the migration is complete. Keep `StrategyTypeDefinition` + `builder_mode` types in place for forward compatibility. |
| 18 | Migration scope | **Port Angular as-is.** Do not restructure or redo during migration. Migrate what exists in Angular today. Restructuring and improvements come in a separate phase after migration. |
| 19 | Gin auth layer conflict | **Temporarily disable Gin JWT middleware on protected routes** during migration so Gin API calls work using only the Django token. A proper token bridge/federation plan will be provided post-migration. See §11 for exact change. |

### Open Items — All Resolved

| # | Item | Resolution |
|---|---|---|
| O-1 | Django login response shape | **Resolved** — See §10 for exact shape and field mapping. `response.user._id`, `response.user.full_name`, `response.user.email`, `response.user.phone`, `response.admin` (boolean), `response.token`, `response.socket_conn`. |
| O-2 | Gin backend API contracts | **Resolved (Decision 16)** — Use real data throughout. Gin endpoints confirmed when TAHAnalyse pages are wired. |
| O-3 | Custom strategy script registration | **Resolved (Decision 17)** — Deferred post-migration. |
| O-4 | WebSocket integration | **Resolved** — Replicate Angular as-is (disabled). Revisit post-migration. |
| O-5 | Admin/client workspace switching | **Resolved (Decisions 14 & 15)** — No switching. Admin covers personal trading within admin workspace. |
| O-6 | Gin auth layer conflict | **Resolved (Decision 19)** — See §11 for full breakdown and the exact change to make. |
| Q-1 | Thread placement | **Resolved** — Thread as sibling of Backtest under Strategy. |
| Q-2 | Client menu items | **Resolved (Decision 13)** — Confirmed: Orders & Positions (own), Credits, Tradeboard. |

---

## 10. O-1: Django Login Response — Confirmed

Verified from `quant_services/impl/auth.py` + `dto/user.py` + `dto/account.py` + Angular `login.component.ts`.

### Exact Response Shape

```json
{
  "response_code": 1000,
  "token": "<jwt string>",
  "admin": true,
  "user": {
    "_id": "<ObjectId string>",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "9999999999"
  },
  "socket_conn": {
    "socket_url": "<wss://...>",
    "bname": "alice_blue",
    "instruments": [...]
  }
}
```

### Confirmed Answers

| Question | Answer |
|---|---|
| Success indicator | `response_code === 1000` ✓ |
| `is_admin` type | `admin: boolean` (true/false) — field is `admin`, not `is_admin` |
| `user_id` | `user._id` — MongoDB ObjectId string (this is what Angular stores as `COOKIE.USER_ID`, and passes as `acc_id` in API calls) |
| `username` (O-1 Q4) | `user.full_name` — the display name. The login input field is `username` in the POST body, which is the user's email or phone number — not returned in response. |
| `pnl_channel_connection` | `socket_conn` — always returned, shape: `{ socket_url, bname, instruments }` |
| Additional fields | None. |

### Key Corrections vs Earlier Assumptions

- Angular stores `response.user.email`, `response.user.phone`, `response.user.full_name`, `response.user._id` — all nested under `user`
- The role flag is `response.admin` (boolean), NOT `response.is_admin` (string)
- Socket key is `socket_conn`, NOT `pnl_channel_connection`
- The User model has exactly 4 fields: `_id`, `full_name`, `email`, `phone`

### Impact on `AuthContext` and `User` Type

**Updated `User` type (`src/types/user.ts`):**
```typescript
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;          // from response.user._id (ObjectId string)
  full_name: string;   // from response.user.full_name
  email: string;       // from response.user.email
  phone: string;       // from response.user.phone
  role: UserRole;      // derived: response.admin ? 'admin' : 'user'
}

export interface SocketConn {
  socket_url: string;
  bname: string;
  instruments: string[];
}
```

**`AuthContext.login()` implementation:**
```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  const res = await loginAPI({ username: email, password });
  if (res.response_code === 1000) {
    const user: User = {
      id:        res.user._id,
      full_name: res.user.full_name,
      email:     res.user.email,
      phone:     res.user.phone,
      role:      res.admin ? 'admin' : 'user',
    };
    setAccessToken(res.token);                                  // localStorage 'access_token'
    saveSocketConn(res.socket_conn);                           // localStorage 'socket_conn'
    localStorage.setItem('tahanalyzer_user', JSON.stringify(user));
    setUser(user);
    return true;
  }
  return false;
};
```

**Post-login redirect:**
```typescript
// In Login page (after AuthContext.login() returns true)
if (user.role === 'admin') {
  navigate('/admin');
} else {
  navigate('/client');
}
```

**O-1 status: Resolved. All fields confirmed. Ready for Phase 0 implementation.**

---

## 11. O-6: Gin Auth Layer — Temporary Bypass Plan

### The Problem

The React app now uses **Django for login**. The Django JWT and the Gin JWT are completely incompatible:

| | Django (AlgoHopperBot) | Gin (TAHAnalyseServer) |
|---|---|---|
| Auth header | `token: <jwt>` | `Authorization: Bearer <jwt>` |
| JWT secret | `Constants.JWT_SECRET` (Django) | `config.AppConfig.JwtSecret` (Go) |
| User store | MongoDB (`users` / `accounts` collections) | PostgreSQL (`users` table) |
| Session store | MongoDB `UserSession` | PostgreSQL `sessions` table |
| JWT payload | `us_id`, `id`, `exp` | `uid`, `email`, `phone`, `role`, `jti`, `force_pwd` |

The Gin `JWTAuthMiddleware` validates its own JWT using its own secret and its own session table. A Django-issued JWT will always fail Gin's validation — wrong secret, wrong payload shape, session not found.

### What Needs to Change (Temporary — Migration Period)

**In `TAHAnalyseServer/internal/middleware/jwt_auth.go`:** bypass the middleware so all protected routes are accessible without a token.

**In `TAHAnalyseServer/routes/routes.go`:** remove `middleware.JWTAuthMiddleware` and `middleware.EnforcePasswordChange()` from the `protected` group, and remove `middleware.JWTAuthMiddleware` + `middleware.RequireRole("admin")` from `adminUrls`.

The `protected` group becomes open, and `adminUrls` uses only the role check (or is also opened temporarily).

**Exact change to `routes.go`:**

```go
// BEFORE (current)
protected := r.Group("/api")
protected.Use(middleware.JWTAuthMiddleware(ctx))
protected.Use(middleware.EnforcePasswordChange())

adminUrls := r.Group("/api/admin")
adminUrls.Use(middleware.JWTAuthMiddleware(ctx))
adminUrls.Use(middleware.RequireRole("admin"))

// AFTER (temporary — migration period)
protected := r.Group("/api")
// middleware.JWTAuthMiddleware removed temporarily
// middleware.EnforcePasswordChange removed temporarily

adminUrls := r.Group("/api/admin")
// middleware.JWTAuthMiddleware removed temporarily
// middleware.RequireRole removed temporarily
// Note: admin routes are unsecured during migration — ensure server is not publicly exposed
```

### Affected Routes (Gin)

Routes that become open during migration:

| Route | Handler | Notes |
|---|---|---|
| `GET /api/secure` | `secure.SecureEndpoint` | Test endpoint — harmless |
| `GET /api/me` | `profile.GetMe` | Profile — React calls this via `ginApi` |
| `PUT /api/me` | `profile.UpdateMe` | Profile update |
| `POST /api/me/credits/add` | `credit.AddSelf` | Credits |
| `GET /api/me/credits/history` | `credit.MyHistory` | Credits |
| `GET /api/me/credits/balance` | `credit.MyBalance` | Credits |
| `POST /api/auth/change-password` | `auth.ChangePassword` | Currently stubbed out (all logic commented) |
| `POST /api/auth/logout` | `auth.Logout` | Gin logout — not used by React (Django logout used instead) |
| `POST /api/admin/users` | `admin.AddUser` | Admin — not used by React (Django users used instead) |
| `POST /api/admin/users/:id/credits/add` | `admin.AddCreditsToUser` | Admin credits |
| `GET /api/admin/users/:id/credits/history` | `admin.UserHistory` | Admin credits history |
| `GET /api/admin/users/:id/credits/balance` | `admin.UserBalance` | Admin credits balance |
| `POST /api/admin/users/:id/reset-password` | `admin.ResetPassword` | Admin — not used by React (Django used instead) |

### React Side — No Change Needed

The `ginApi` Axios instance already sends `Authorization: Bearer <token>` with the Django token. Once the middleware is removed server-side, the Gin routes will respond normally regardless of the token value.

Since `ChangePassword` in the Gin handler is entirely commented out (returns `200 { message: "password changed" }` stub), it won't cause issues.

### What This Does NOT Affect

- Django API calls — completely unaffected. Django auth layer unchanged.
- The Gin `/api/login`, `/api/register`, `/api/forgot-password`, `/api/reset-password` public routes — these stay as-is (already public). They won't be called by React during migration (Django login is used).
- Gin server's own user/session data in PostgreSQL — untouched.

### Post-Migration: Proper Bridge Plan

After migration is complete, the token federation plan will cover one of these options:

1. **Token forwarding:** React sends Django token to a Gin proxy endpoint which validates it against Django and issues a short-lived Gin token.
2. **Shared secret:** Django and Gin use the same JWT secret + compatible payload shape. Single token works on both.
3. **API gateway:** A reverse proxy sits in front of both backends and validates the token once, forwarding identity headers to each service.
4. **Backend merge:** Django + Gin services consolidated under a single auth layer.

Until that plan is provided, the Gin auth middleware stays disabled.

### Tracking

| # | Task | File | Status |
|---|---|---|---|
| GIN-1 | Remove `JWTAuthMiddleware` from `protected` group | `TAHAnalyseServer/routes/routes.go` | Open |
| GIN-2 | Remove `EnforcePasswordChange` from `protected` group | `TAHAnalyseServer/routes/routes.go` | Open |
| GIN-3 | Remove `JWTAuthMiddleware` from `adminUrls` group | `TAHAnalyseServer/routes/routes.go` | Open |
| GIN-4 | Remove `RequireRole("admin")` from `adminUrls` group | `TAHAnalyseServer/routes/routes.go` | Open |
| GIN-5 | Keep `jwt_auth.go` middleware file intact | `TAHAnalyseServer/internal/middleware/jwt_auth.go` | Open (do not delete — needed post-migration) |
