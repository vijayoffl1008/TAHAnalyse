/**
 * Application-wide constants.
 * Ported from AlgoHopperBot `constants.ts`.
 * Base URLs are read from Vite env vars — see src/services/api/clients.ts.
 */

export const CONSTANTS = {

  // ── API endpoint paths ─────────────────────────────────────────────────────
  API: {
    LOGOUT: "auth/logout/",
    LOGIN:  "auth/login/",

    APP: {
      APP_STATE: "app/state",
      INIT_APP:  "app/initialize",
    },

    BROKER: {
      USER_BROKERS:      "baccount/list/",
      ADD_BROKER:        "baccount/add/",
      UPDATE_BROKER:     "baccount/update/",
      DELETE_BROKER:     "baccount/delete/",
      CONNECT_BROKER:    "baccount/connect/",
      FEED_ACCOUNT_LOGIN:"baccount/login/",
      ALL_BROKERS:       "baccount/all/",
    },

    CHANNEL: {
      LIST:         "feed/",
      MODE:         "feed/mode/",
      SERVER_LIST:  "channel/serverlist/",
      SWITCH:       "feed/switch/",
      START_STOP:   "feed/connect/",
      CONN_DETAILS: "channel/details/",
    },

    // NOTE: CLIENT endpoints currently point to "test/" stubs (Gap-2 — replicate as-is)
    CLIENT: {
      GET_STRATEGIES: "test/",
      CLOSE_LEG:      "test/",
      GET_REPORTS:    "test/",
    },

    CONFIG_DATA: {
      GET_CDS:      "cdata/datas/",
      GET_AUTH_CDS: "cdata/authdatas/",
      UPDATE_CDS:   "cdata/updatedatas/",
    },

    DATA_COLLECTION: {
      LIST_CATEGORIES:         "dc/categories/",
      SPLIT_CATEGORY:          "dc/category/split/",
      CHECK_DATA_STATUS:       "dc/check/status/",
      RUN_DATA:                "dc/run/",
      STOP_DATA:               "dc/stop/",
      CHECK_DATA_RUN_STATUS:   "dc/run/status/",
      ARCHIEVE_DATA:           "dc/archive/run/",
      STOP_ARCHIEVE_DATA:      "dc/archive/stop/",
      ARCHIEVE_DATA_RUN_STATUS:"dc/archive/run/status/",
    },

    INSTRUMENT: {
      GET_INSTRUMENT:         "instrument/",
      GET_INSTRUMENTS:        "instrument/list/",
      ADD_INSTRUMENT:         "instrument/add/",
      UPDATE_INSTRUMENT:      "instrument/update/",
      DELETE_INSTRUMENT:      "instrument/delete/",
      GET_INSTRUMENTS_EXPIRY: "instrument/exp/",
      ADD_INSTRUMENT_EXPIRY:  "instrument/update/exp/",
      DELETE_INSTRUMENT_EXPIRY:"instrument/delete/exp/",
    },

    TRADEBOARD: {
      ADD:         "tradeboard/",
      UPDATE:      "tradeboard/",
      DELETE:      "tradeboard/",
      GET:         "tradeboard/",
      GET_DETAILS: "tradeboard/",
    },

    USERS: {
      GET_USERS:       "account/list/",
      ADD_USER:        "account/add/",
      SIGNUP_USER:     "account/signup/",
      GET_ACCOUNT:     "account/",
      UPDATE_USER:     "account/update/",
      DELETE_USER:     "account/delete/",
      ACTIVATE_USER:   "account/activate/",
      CHANGE_PASSWORD: "account/changepassword/",
      RESET_PASSWORD:  "account/resetpassword/",
      GET_PROFILE:     "account/profile/",
    },

    SYMBOLS: {
      GET_CATEGORIES: "categories/",
      GET_SEGMENTS:   "segments/",
      GET_SYMBOLS:    "symbols/",
      GET_EXCHANGES:  "symbol/exchanges/",
    },

    STRATEGY: {
      GET_STRATEGIES:        "strategy/list/",
      ADD_STRATEGY:          "strategy/add/",
      UPDATE_STRATEGY:       "strategy/update/",
      UPDATE_STRATEGY_STATE: "strategy/update/state/",
      UPDATE_STRATEGY_SCOPE: "strategy/update/scope/",
      DELETE_STRATEGY:       "strategy/delete/",
    },

    REPORT: {
      GET_REPORTS:       "report/",
      ADD_REPORT:        "report/",
      UPDATE_REPORT:     "report/",
      DELETE_REPORT:     "report/",
      UPDATE_STATUS:     "report/status/",
      GET_REPORT_DATA:   "report/data/",
      UPDATE_REPORT_DATA:"report/data/",
      GENERATE_REPORT:   "report/create/",
      DOWNLOAD_REPORT:   "report/dl/",
    },

    THREAD: {
      GET_THREADS:        "thread/list/",
      ADD_THREAD:         "thread/add/",
      STOP_THREAD:        "thread/stop/",
      START_THREAD:       "thread/start/",
      UPDATE_THREAD:      "thread/settings/update/",
      DELETE_THREAD:      "thread/delete/",
      THREAD_ACTION:      "thread/action/",
      THREAD_UPDATE_DNAME:"thread/dname/",
    },

    SCHEDULER: {
      GET_SCHEDULER:    "thread/listaccs/",
      FILTER_SCHEDULER: "thread/filteraccs/",
      START_SCHEDULER:  "thread/runaccs/",
      SEARCH_SCHEDULER: "thread/searchacc/",
    },

    LOG: {
      GET_LOGS: "tl/list/",
    },

    ORDER: {
      GET_ORDERS:   "order",
      CANCEL_ORDER: "order",
    },

    PROFILE: {
      GET:  "uprofileupdate/list/",
      POST: "uprofileupdate/update/",
    },

    POSITION: {
      GET_POSITIONS: "position",
    },
  },

  // ── Route URI paths ────────────────────────────────────────────────────────
  URI_PATH: {
    // Workspace roots
    ADMIN:  "admin",
    CLIENT: "client",
    LOGIN:  "login",

    // Admin top-level
    USERS:           "users",
    BROKERS:         "brokers",
    INDICATORS:      "indicators",
    ORDERS_POSITIONS:"orders-positions",
    TRADEBOARD:      "tradeboard",
    CHANNELS:        "channels",
    REPORTS:         "reports",
    DATA_COLLECTION: "data-collection",
    LOGS:            "logs",
    SETTINGS:        "settings",
    TUTORIAL:        "tutorial",
    CREDITS:         "credits",

    // Strategy group
    STRATEGY:  "strategy",
    BACKTEST:  "backtest",
    THREAD:    "thread",
    DASHBOARD: "dashboard",
    TESTS:     "tests",
    STRATEGIES:"strategies",

    // Entity group
    ENTITY:              "entity",
    ENTITY_STRATEGY:     "strategy",
    ENTITY_INSTRUMENTS:  "instruments",
  },

  // ── Auth / cookie keys ─────────────────────────────────────────────────────
  STORAGE: {
    ACCESS_TOKEN: "access_token",
    SOCKET_CONN:  "socket_conn",
    USER:         "tahanalyzer_user",
  },

  // ── Misc defaults ──────────────────────────────────────────────────────────
  DEFAULT: {
    BROKER:   { _id: "select", name: "Broker",    disabled: true },
    EXCHANGE: { _id: "select", name: "Exchange" },
    SEGMENT:  { _id: "select", name: "Segment"  },
    INTERVAL: { _id: 0,        name: "Interval"  },
    STRATEGY: { _id: "select", display_name: "Strategy", name: "Strategy", disabled: true },
    SYMBOL:   { _id: "select", name: "Symbol", trading_symbol: "Symbol", disabled: true },
    USER:     { full_name: "Select", _id: 0 },
  },

  INTERVALS: [
    { name: "1m",  _id: 1  },
    { name: "2m",  _id: 2  },
    { name: "3m",  _id: 3  },
    { name: "4m",  _id: 4  },
    { name: "5m",  _id: 5  },
    { name: "10m", _id: 10 },
    { name: "15m", _id: 15 },
    { name: "30m", _id: 30 },
    { name: "1h",  _id: 60 },
  ],

  DAYS: ["MON", "TUE", "WED", "THUR", "FRI", "SAT"],

  STRATEGY_STATES: {
    RUNNING: "running",
    STOPPED: "stopped",
  },

  // Strategy layout section IDs (used by DynamicForm config_schema)
  LAYOUTS: {
    SYMBOL:            "symbol",
    TIME:              "time",
    TRADE:             "trade",
    ORDER:             "order",
    TARGET:            "target",
    SL:                "sl",
    TSL:               "tsl",
    ORDER_ADJUSTMENT:  "order_adjustment",
    REENTER:           "reenter",
    WEEKDAY:           "weekday",
  },

  // ── ORB strategy enums ─────────────────────────────────────────────────────
  ORB_REENTRY_ON_TYPES: [
    { name: "Both",   _id: "both" },
    { name: "SL",     _id: "sl"   },
    { name: "Target", _id: "tgt"  },
  ],

  ORB_REENTRY_WHAT_TYPES: [
    { name: "Other Leg",  _id: "other_leg"  },
    { name: "Same Leg",   _id: "same_leg"   },
    { name: "Both Legs",  _id: "both_legs"  },
  ],

  ORB_REENTRY_FREQ_TYPES: [
    { name: "Per Leg",   _id: "per_leg"   },
    { name: "Both Legs", _id: "both_legs" },
  ],

  ORB_RUNMODE_TELEGRAM_TYPES: [
    { name: "Channel", _id: "channel" },
    { name: "User",    _id: "user"    },
  ],

  ORB_SS_SEGMENTS: [
    { name: "Spot",    _id: "spot"    },
    { name: "Options", _id: "options" },
  ],

  VALUE_TYPES: [
    { name: "Points",  _id: "pts",     default: false },
    { name: "Percent", _id: "percent", default: true, default_value: 10 },
  ],

  SCRIPT_TYPES: [
    { name: "Internal", _id: "internal", default: true  },
    { name: "External", _id: "external", default: false },
  ],
} as const;
