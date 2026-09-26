import { useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: "▦",
    title: "Product Management",
    description:
      "Manage products, SKUs, categories, availability and reordering rules from one place.",
  },
  {
    icon: "↗",
    title: "Inventory Operations",
    description:
      "Keep receipts, deliveries, internal transfers and adjustments organized.",
  },
  {
    icon: "!",
    title: "Stock Monitoring",
    description:
      "Spot low-stock and out-of-stock products before they become a problem.",
  },
];

const operations = [
  {
    name: "Receipts",
    description: "Track incoming inventory",
    icon: "↓",
    status: "Ready",
    iconStyle: "bg-emerald-500/10 text-emerald-600",
    statusStyle: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Delivery Orders",
    description: "Manage outgoing stock",
    icon: "↑",
    status: "Processing",
    iconStyle: "bg-blue-500/10 text-blue-600",
    statusStyle: "bg-blue-100 text-blue-700",
  },
  {
    name: "Internal Transfers",
    description: "Move stock between locations",
    icon: "⇄",
    status: "Scheduled",
    iconStyle: "bg-amber-500/10 text-amber-600",
    statusStyle: "bg-amber-100 text-amber-700",
  },
  {
    name: "Adjustments",
    description: "Correct inventory quantities",
    icon: "±",
    status: "Completed",
    iconStyle: "bg-indigo-500/10 text-indigo-600",
    statusStyle: "bg-indigo-100 text-indigo-700",
  },
];

const heroKpis = [
  {
    label: "Products",
    value: "1,284",
    change: "+12%",
    icon: "▦",
    style: "bg-indigo-500/10 text-indigo-600",
  },
  {
    label: "Low Stock",
    value: "18",
    change: "Needs attention",
    icon: "!",
    style: "bg-amber-500/10 text-amber-600",
  },
  {
    label: "Receipts",
    value: "42",
    change: "This week",
    icon: "↓",
    style: "bg-cyan-500/10 text-cyan-600",
  },
];

const products = [
  {
    name: "Wireless Scanner",
    sku: "SKU-1048",
    stock: "248",
    status: "Healthy",
  },
  {
    name: "Thermal Printer",
    sku: "SKU-2091",
    stock: "32",
    status: "Low",
  },
  {
    name: "Barcode Labels",
    sku: "SKU-3312",
    stock: "680",
    status: "Healthy",
  },
];

function Landing() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        darkMode
          ? "bg-[#08111f] text-slate-100"
          : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* ================= NAVBAR ================= */}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
          darkMode
            ? "border-slate-800/80 bg-[#08111f]/85"
            : "border-slate-200/80 bg-white/85"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 sm:h-10 sm:w-10">
              <span className="text-base font-bold text-white sm:text-lg">
                S
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight sm:text-lg">
                StockSense
              </p>

              <p
                className={`hidden text-[10px] font-semibold uppercase tracking-[0.18em] sm:block ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Inventory Management
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className={`text-sm font-medium transition ${
                darkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Features
            </a>

            <a
              href="#operations"
              className={`text-sm font-medium transition ${
                darkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Operations
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle theme"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition sm:h-10 sm:w-10 ${
                darkMode
                  ? "border-slate-700 bg-slate-900 text-yellow-300 hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {darkMode ? "☀" : "☾"}
            </button>

            <Link
              to="/login"
              className={`hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:block ${
                darkMode
                  ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="hidden rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 sm:block"
            >
              Get Started
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border md:hidden ${
                darkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            className={`border-t px-4 py-4 md:hidden ${
              darkMode
                ? "border-slate-800 bg-[#08111f]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-col gap-1">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium"
              >
                Features
              </a>

              <a
                href="#operations"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium"
              >
                Operations
              </a>

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-lg bg-indigo-600 px-3 py-3 text-center text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16 sm:pt-20">
        {/* ================= HERO ================= */}
        <section className="relative isolate overflow-hidden">
          {/* Grid hidden on mobile so it never interferes with buttons/content */}
          <div
            className={`pointer-events-none absolute inset-0 hidden sm:block ${
              darkMode ? "opacity-[0.07]" : "opacity-[0.35]"
            }`}
            style={{
              backgroundImage: `linear-gradient(to right, ${
                darkMode ? "#64748b" : "#cbd5e1"
              } 1px, transparent 1px),
              linear-gradient(to bottom, ${
                darkMode ? "#64748b" : "#cbd5e1"
              } 1px, transparent 1px)`,
              backgroundSize: "52px 52px",
              maskImage:
                "linear-gradient(to bottom, black 0%, transparent 75%)",
            }}
          />

          <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[100px] sm:h-[500px] sm:w-[500px] sm:blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <div className="grid items-center gap-10 py-10 sm:gap-12 sm:py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:py-24">
              {/* Hero copy */}
              <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
                <div
                  className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold sm:mb-7 lg:mx-0 ${
                    darkMode
                      ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                      : "border-indigo-200 bg-indigo-50 text-indigo-700"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Smart inventory management
                </div>

                <h1
                  className={`text-4xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-5xl sm:leading-[1.02] sm:tracking-[-0.045em] lg:text-6xl xl:text-[70px] ${
                    darkMode ? "text-white" : "text-slate-950"
                  }`}
                >
                  Know your stock.
                  <span className="mt-1 block text-indigo-600 sm:mt-2">
                    Move it smarter.
                  </span>
                </h1>

                <p
                  className={`mx-auto mt-6 max-w-xl text-base leading-7 sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  StockSense brings products, stock levels and inventory
                  operations together in one clear workspace.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    to="/signup"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                  >
                    Get Started
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  <Link
                    to="/login"
                    className={`inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-sm font-semibold transition ${
                      darkMode
                        ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Login
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-500 sm:mt-9 lg:justify-start">
                  <span>
                    <b className="mr-2 text-emerald-500">✓</b>
                    Multi-warehouse
                  </span>

                  <span>
                    <b className="mr-2 text-emerald-500">✓</b>
                    Stock alerts
                  </span>

                  <span>
                    <b className="mr-2 text-emerald-500">✓</b>
                    Smart filters
                  </span>
                </div>
              </div>

              {/* ================= HERO DASHBOARD PREVIEW ================= */}
              <div className="relative mx-auto w-full max-w-[560px] lg:max-w-xl">
                <div
                  className={`rounded-2xl border p-2 shadow-2xl sm:rounded-3xl sm:p-3 ${
                    darkMode
                      ? "border-slate-700 bg-slate-900/90 shadow-black/40"
                      : "border-slate-200 bg-white shadow-slate-300/40"
                  }`}
                >
                  <div
                    className={`rounded-xl border p-3.5 sm:rounded-2xl sm:p-5 ${
                      darkMode
                        ? "border-slate-800 bg-[#0d1728]"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    {/* Dashboard header */}
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                          S
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold sm:text-sm">
                            Inventory Dashboard
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Warehouse overview
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="hidden rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[9px] font-semibold text-emerald-600 sm:block">
                          ● Live
                        </div>

                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            darkMode
                              ? "bg-slate-800 text-slate-400"
                              : "bg-white text-slate-500"
                          }`}
                        >
                          ⚙
                        </div>
                      </div>
                    </div>

                    {/* KPI cards */}
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
                      {heroKpis.map((kpi) => (
                        <div
                          key={kpi.label}
                          className={`rounded-xl border p-2.5 sm:p-3.5 ${
                            darkMode
                              ? "border-slate-800 bg-slate-900"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold sm:h-8 sm:w-8 ${kpi.style}`}
                            >
                              {kpi.icon}
                            </div>

                            <span className="hidden text-[8px] font-medium text-emerald-500 sm:block">
                              {kpi.change === "+12%" ? kpi.change : "●"}
                            </span>
                          </div>

                          <p className="mt-2 text-[9px] font-medium text-slate-500 sm:mt-3 sm:text-[10px]">
                            {kpi.label}
                          </p>

                          <p className="text-base font-bold sm:text-lg">
                            {kpi.value}
                          </p>

                          <p className="mt-0.5 truncate text-[8px] text-slate-400 sm:text-[9px]">
                            {kpi.change}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Chart + stock health */}
                    <div className="mt-3 grid gap-3 sm:mt-4 lg:grid-cols-[1.35fr_0.85fr]">
                      {/* Chart */}
                      <div
                        className={`rounded-xl border p-3.5 sm:p-4 ${
                          darkMode
                            ? "border-slate-800 bg-slate-900"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold">
                              Stock Trend
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-500">
                              Inventory movement
                            </p>
                          </div>

                          <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-[9px] font-medium text-indigo-500">
                            7 Days
                          </span>
                        </div>

                        <div className="relative mt-5 h-24 sm:h-28">
                          <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-200/70 dark:border-slate-700/60" />
                          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200/70 dark:border-slate-700/60" />
                          <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-slate-200/70 dark:border-slate-700/60" />

                          <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1.5 sm:gap-2">
                            {[38, 52, 46, 70, 57, 86, 67].map(
                              (height, index) => (
                                <div
                                  key={index}
                                  className="flex h-full flex-1 items-end"
                                >
                                  <div
                                    className={`w-full rounded-t-md ${
                                      index === 5
                                        ? "bg-indigo-600"
                                        : "bg-indigo-500/20"
                                    }`}
                                    style={{ height: `${height}%` }}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex justify-between text-[8px] text-slate-400">
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                          <span>Sun</span>
                        </div>
                      </div>

                      {/* Stock health */}
                      <div
                        className={`rounded-xl border p-3.5 sm:p-4 ${
                          darkMode
                            ? "border-slate-800 bg-slate-900"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">Stock Health</p>

                          <span className="text-[9px] text-emerald-500">
                            92%
                          </span>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div className="h-full w-[92%] rounded-full bg-emerald-500" />
                        </div>

                        <div className="mt-4 space-y-2.5">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-500">Healthy</span>
                            <span className="font-semibold">1,102</span>
                          </div>

                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-500">Low stock</span>
                            <span className="font-semibold text-amber-500">
                              18
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-500">
                              Out of stock
                            </span>
                            <span className="font-semibold text-red-500">
                              6
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product list */}
                    <div
                      className={`mt-3 rounded-xl border p-3 sm:mt-4 sm:p-4 ${
                        darkMode
                          ? "border-slate-800 bg-slate-900"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold">
                            Product Overview
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-500">
                            Recently updated inventory
                          </p>
                        </div>

                        <span className="text-[9px] font-semibold text-indigo-500">
                          View all →
                        </span>
                      </div>

                      <div className="space-y-2">
                        {products.map((product) => (
                          <div
                            key={product.sku}
                            className={`flex items-center justify-between gap-3 rounded-lg p-2 ${
                              darkMode ? "bg-slate-800/60" : "bg-slate-50"
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[10px] text-indigo-500">
                                ▦
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-[9px] font-semibold">
                                  {product.name}
                                </p>

                                <p className="mt-0.5 text-[8px] text-slate-400">
                                  {product.sku}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-[9px] font-semibold">
                                {product.stock}
                              </span>

                              <span
                                className={`rounded-full px-2 py-1 text-[8px] font-medium ${
                                  product.status === "Healthy"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {product.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stock alert */}
                <div
                  className={`absolute -left-6 top-24 hidden w-48 rounded-2xl border p-4 shadow-xl xl:block ${
                    darkMode
                      ? "border-slate-700 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-600">
                      !
                    </div>

                    <div>
                      <p className="text-xs font-semibold">Stock Alert</p>

                      <p className="mt-1 text-[11px] text-slate-500">
                        3 items need attention
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating status */}
                <div
                  className={`absolute -bottom-5 -right-5 hidden w-48 rounded-2xl border p-4 shadow-xl xl:block ${
                    darkMode
                      ? "border-slate-700 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-500">
                        Inventory status
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        Everything organized
                      </p>
                    </div>

                    <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section
          id="features"
          className={`border-t ${
            darkMode
              ? "border-slate-800 bg-[#0b1423]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-indigo-600">
                One workspace
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Everything your inventory needs.
              </h2>

              <p
                className={`mt-4 leading-7 ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Keep products, stock information and inventory operations
                connected without unnecessary complexity.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`group rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 sm:p-7 ${
                    darkMode
                      ? "border-slate-800 bg-slate-900/50 hover:border-indigo-500/40"
                      : "border-slate-200 bg-slate-50/50 hover:border-indigo-200 hover:bg-white hover:shadow-xl"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl font-bold text-indigo-600 sm:h-12 sm:w-12">
                    {feature.icon}
                  </div>

                  <h3 className="mt-5 text-base font-semibold sm:mt-6 sm:text-lg">
                    {feature.title}
                  </h3>

                  <p
                    className={`mt-2.5 text-sm leading-6 sm:mt-3 ${
                      darkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= OPERATIONS ================= */}
        <section
          id="operations"
          className={`border-t ${
            darkMode
              ? "border-slate-800 bg-[#08111f]"
              : "border-slate-200 bg-[#f8fafc]"
          }`}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-14 lg:px-8">
            {/* Operations text */}
            <div className="text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-indigo-600">
                Operations
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Every stock movement, clearly organized.
              </h2>

              <p
                className={`mx-auto mt-4 max-w-xl leading-7 sm:mt-5 lg:mx-0 ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                StockSense gives your team a structured way to manage the
                everyday movement of inventory across your business.
              </p>

              <div className="mt-7 space-y-3 sm:mt-8">
                {operations.map((operation) => (
                  <div
                    key={operation.name}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                      darkMode
                        ? "border-slate-800 bg-slate-900/50 hover:border-indigo-500/30"
                        : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${operation.iconStyle}`}
                    >
                      {operation.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {operation.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {operation.description}
                      </p>
                    </div>

                    <span
                      className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${operation.statusStyle}`}
                    >
                      {operation.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= OPERATIONS PREVIEW ================= */}
            <div
              className={`rounded-2xl border p-3 shadow-xl sm:rounded-3xl sm:p-4 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`rounded-xl border p-4 sm:rounded-2xl sm:p-5 ${
                  darkMode
                    ? "border-slate-800 bg-[#0d1728]"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                {/* Operations header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                      ↗
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Operations Center
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Track every inventory movement
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="hidden rounded-lg bg-indigo-500/10 px-3 py-2 text-[10px] font-semibold text-indigo-600 sm:block"
                  >
                    View all
                  </button>
                </div>

                {/* Zero summary */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div
                    className={`rounded-xl border p-3 ${
                      darkMode
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-[9px] text-slate-500">Today</p>
                    <p className="mt-1 text-lg font-bold">0</p>
                    <p className="mt-0.5 text-[8px] text-slate-400">
                      No activity
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-3 ${
                      darkMode
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-[9px] text-slate-500">Pending</p>
                    <p className="mt-1 text-lg font-bold">0</p>
                    <p className="mt-0.5 text-[8px] text-slate-400">
                      No pending
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-3 ${
                      darkMode
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-[9px] text-slate-500">Completed</p>
                    <p className="mt-1 text-lg font-bold">0</p>
                    <p className="mt-0.5 text-[8px] text-slate-400">
                      This month
                    </p>
                  </div>
                </div>

                {/* Recent activity */}
                <div
                  className={`mt-4 rounded-xl border p-4 ${
                    darkMode
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Recent activity</p>

                      <p className="mt-0.5 text-[9px] text-slate-500">
                        Latest inventory movements
                      </p>
                    </div>

                    <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>

                  <div className="space-y-2.5">
                    {operations.map((operation) => (
                      <div
                        key={operation.name}
                        className={`flex items-center gap-3 rounded-xl p-3 ${
                          darkMode ? "bg-slate-800/60" : "bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${operation.iconStyle}`}
                        >
                          {operation.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[10px] font-semibold">
                              {operation.name}
                            </p>

                            <span className="shrink-0 text-[8px] text-slate-400">
                              —
                            </span>
                          </div>

                          <p className="mt-0.5 truncate text-[9px] text-slate-500">
                            {operation.description}
                          </p>
                        </div>

                        <span
                          className={`hidden shrink-0 rounded-full px-2 py-1 text-[8px] font-medium sm:block ${operation.statusStyle}`}
                        >
                          {operation.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zero progress */}
                <div
                  className={`mt-3 rounded-xl border p-4 ${
                    darkMode
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">
                        Daily operations
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-500">
                        0 of 0 planned movements
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                      0%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full w-0 rounded-full bg-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section
          className={`border-t ${
            darkMode
              ? "border-slate-800 bg-[#0b1423]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
            

            <h2 className="mt-6 text-2xl font-bold tracking-tight sm:mt-7 sm:text-3xl lg:text-4xl">
              Ready to organize your inventory?
            </h2>

            <p
              className={`mx-auto mt-4 max-w-xl leading-7 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Bring products, stock and inventory operations together with
              StockSense.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-700 sm:px-7"
            >
              Get Started
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer
        className={`border-t ${
          darkMode
            ? "border-slate-800 bg-[#08111f]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:gap-4 sm:px-6 sm:py-7 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              S
            </div>

            <span className="text-sm font-semibold">StockSense</span>
          </Link>

          <p
            className={`text-xs ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            © 2026 StockSense. Inventory management made simple.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;