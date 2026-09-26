import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FONT_DISPLAY = { fontFamily: "'Space Grotesk', sans-serif" };
const FONT_MONO = { fontFamily: "'JetBrains Mono', monospace" };
const FONT_BODY = { fontFamily: "'Inter', sans-serif" };

const features = [
  {
    code: "PRD",
    bars: [3, 1, 2, 4, 1, 3],
    title: "Product management",
    description:
      "Products, SKUs, categories, availability and reordering rules — all from one place.",
  },
  {
    code: "OPS",
    bars: [2, 4, 1, 1, 3, 2],
    title: "Inventory operations",
    description:
      "Receipts, deliveries, internal transfers and adjustments, kept organized.",
  },
  {
    code: "MON",
    bars: [1, 2, 3, 2, 4, 1],
    title: "Stock monitoring",
    description:
      "Low-stock and out-of-stock products surfaced before they become a problem.",
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
    name: "Delivery orders",
    description: "Manage outgoing stock",
    icon: "↑",
    status: "Processing",
    iconStyle: "bg-blue-500/10 text-blue-600",
    statusStyle: "bg-blue-100 text-blue-700",
  },
  {
    name: "Internal transfers",
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
  { label: "Products", value: "1,284", change: "+12% this month" },
  { label: "Low stock", value: "18", change: "Needs attention" },
  { label: "Receipts", value: "42", change: "This week" },
];

const products = [
  { name: "Wireless Scanner", sku: "SKU-1048", stock: "248", status: "Healthy" },
  { name: "Thermal Printer", sku: "SKU-2091", stock: "32", status: "Low" },
  { name: "Barcode Labels", sku: "SKU-3312", stock: "680", status: "Healthy" },
];

function BarcodeMark({
  bars,
  tone,
}: {
  bars: number[]
  tone: string
}) {
  const widths: Record<number, string> = {
    1: 'w-[2px]',
    2: 'w-[3px]',
    3: 'w-[4px]',
    4: 'w-[5px]',
  }

  return (
    <div className="flex h-8 items-end gap-[2px]">
      {bars.map((w, i) => (
        <span
          key={i}
          className={`${widths[w]} rounded-[1px] ${tone}`}
        />
      ))}
    </div>
  )
}

function Landing() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = "stocksense-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div
      style={FONT_BODY}
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        darkMode ? "bg-[#08111f] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <style>{`
        @keyframes riseIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes growUp { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        .rise { animation: riseIn 0.6s cubic-bezier(.16,1,.3,1) both; }
        .grow { animation: growUp 0.7s cubic-bezier(.16,1,.3,1) both; transform-origin: bottom; }
        @media (prefers-reduced-motion: reduce) {
          .rise, .grow { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
          darkMode ? "border-slate-800/80 bg-[#08111f]/85" : "border-slate-200/80 bg-white/85"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-600 sm:h-10 sm:w-10">
              <span style={FONT_DISPLAY} className="text-base font-bold text-white sm:text-lg">
                S
              </span>
            </div>
            <div className="min-w-0">
              <p style={FONT_DISPLAY} className="truncate text-base font-bold tracking-tight sm:text-lg">
                StockSense
              </p>
              <p style={FONT_MONO} className={`hidden text-[10px] sm:block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                inventory / v2.4
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className={`text-sm font-medium transition ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
              Features
            </a>
            <a href="#operations" className={`text-sm font-medium transition ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
              Operations
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              aria-label="Toggle dark mode"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition sm:h-10 sm:w-10 ${
                darkMode ? "border-slate-700 bg-slate-900 text-yellow-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {darkMode ? "☀" : "☾"}
            </button>
            <Link to="/login" className={`hidden rounded-md px-4 py-2.5 text-sm font-semibold transition sm:block ${darkMode ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              Log in
            </Link>
            <Link to="/signup" className="hidden rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:block">
              Get started
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border md:hidden ${darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={`border-t px-4 py-4 md:hidden ${darkMode ? "border-slate-800 bg-[#08111f]" : "border-slate-200 bg-white"}`}>
            <div className="flex flex-col gap-1">
              <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium">Features</a>
              <a href="#operations" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium">Operations</a>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium">Log in</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="mt-1 rounded-md bg-indigo-600 px-3 py-3 text-center text-sm font-semibold text-white">Get started</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16 sm:pt-20">
        {/* ================= HERO ================= */}
        <section className="relative isolate overflow-hidden">
          {/* barcode-strip texture, grounded in the product's own vernacular */}
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 hidden h-[420px] sm:block ${darkMode ? "opacity-[0.10]" : "opacity-[0.55]"}`}
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${darkMode ? "#334155" : "#cbd5e1"} 0px, ${darkMode ? "#334155" : "#cbd5e1"} 2px, transparent 2px, transparent 10px)`,
              maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[110px] sm:h-[480px] sm:w-[480px]" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 py-10 sm:gap-12 sm:py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:py-24">
              {/* Hero copy */}
              <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
                <div
                  className={`rise mx-auto mb-6 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium sm:mb-7 lg:mx-0 ${
                    darkMode ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300" : "border-indigo-200 bg-indigo-50 text-indigo-700"
                  }`}
                  style={{ ...FONT_MONO, animationDelay: "0ms" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  status: tracking 1,284 SKUs
                </div>

                <h1
                  style={{ ...FONT_DISPLAY, animationDelay: "80ms" }}
                  className={`rise text-4xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-5xl sm:leading-[1.03] lg:text-6xl xl:text-[68px] ${darkMode ? "text-white" : "text-slate-950"}`}
                >
                  Know your stock.
                  <span className="mt-1 block text-indigo-600 sm:mt-2">Move it smarter.</span>
                </h1>

                <p
                  className={`rise mx-auto mt-6 max-w-xl text-base leading-7 sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  style={{ animationDelay: "150ms" }}
                >
                  StockSense brings products, stock levels and inventory operations
                  together in one clear workspace — no spreadsheets standing in the gaps.
                </p>

                <div className="rise mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:justify-center lg:justify-start" style={{ animationDelay: "220ms" }}>
                  <Link to="/signup" className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700">
                    Get started
                  </Link>
                  <Link
                    to="/login"
                    className={`inline-flex items-center justify-center rounded-md border px-6 py-3.5 text-sm font-semibold transition ${
                      darkMode ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Log in
                  </Link>
                </div>

                <div
                  className="rise mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-500 sm:mt-9 lg:justify-start"
                  style={{ animationDelay: "280ms" }}
                >
                  <span><b className="mr-2 text-emerald-500">✓</b>Multi-warehouse</span>
                  <span><b className="mr-2 text-emerald-500">✓</b>Stock alerts</span>
                  <span><b className="mr-2 text-emerald-500">✓</b>Smart filters</span>
                </div>
              </div>

              {/* ================= HERO DASHBOARD PREVIEW ================= */}
              <div className="relative mx-auto w-full max-w-[560px] lg:max-w-xl">
                <div className={`rounded-xl border p-2 shadow-2xl sm:p-3 ${darkMode ? "border-slate-700 bg-slate-900/90 shadow-black/40" : "border-slate-200 bg-white shadow-slate-300/40"}`}>
                  <div className={`rounded-lg border p-3.5 sm:p-5 ${darkMode ? "border-slate-800 bg-[#0d1728]" : "border-slate-100 bg-slate-50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div style={FONT_DISPLAY} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">S</div>
                        <div className="min-w-0">
                          <p style={FONT_DISPLAY} className="text-xs font-semibold sm:text-sm">Inventory dashboard</p>
                          <p style={FONT_MONO} className="mt-0.5 text-[10px] text-slate-500">warehouse: main-01</p>
                        </div>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${darkMode ? "bg-emerald-500" : "bg-emerald-500"}`} />
                    </div>

                    {/* KPI row */}
                    <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
                      {heroKpis.map((kpi) => (
                        <div key={kpi.label} className="px-2.5 first:pl-0 last:pr-0 sm:px-3.5">
                          <p style={FONT_MONO} className="text-[9px] uppercase tracking-wide text-slate-500 sm:text-[10px]">{kpi.label}</p>
                          <p style={FONT_DISPLAY} className="mt-1.5 text-lg font-bold sm:text-xl">{kpi.value}</p>
                          <p className="mt-0.5 truncate text-[9px] text-slate-400">{kpi.change}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart + stock health */}
                    <div className="mt-4 grid gap-3 sm:mt-5 lg:grid-cols-[1.35fr_0.85fr]">
                      <div className={`rounded-lg border p-3.5 sm:p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center justify-between">
                          <p style={FONT_DISPLAY} className="text-xs font-semibold">Stock trend</p>
                          <span style={FONT_MONO} className="text-[9px] text-slate-400">7d</span>
                        </div>
                        <div className="relative mt-5 h-24 sm:h-28">
                          <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1.5 sm:gap-2">
                            {[38, 52, 46, 70, 57, 86, 67].map((height, index) => (
                              <div key={index} className="flex h-full flex-1 items-end">
                                <div
                                  className={`grow w-full rounded-t-[2px] ${index === 5 ? "bg-indigo-600" : "bg-indigo-500/20"}`}
                                  style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={FONT_MONO} className="mt-2 flex justify-between text-[8px] text-slate-400">
                          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                        </div>
                      </div>

                      <div className={`rounded-lg border p-3.5 sm:p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center justify-between">
                          <p style={FONT_DISPLAY} className="text-xs font-semibold">Stock health</p>
                          <span style={FONT_MONO} className="text-[9px] text-emerald-500">92%</span>
                        </div>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div className="h-full w-[92%] rounded-full bg-emerald-500" />
                        </div>
                        <div style={FONT_MONO} className="mt-4 space-y-2.5 text-[9px]">
                          <div className="flex items-center justify-between"><span className="text-slate-500">healthy</span><span>1,102</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-500">low</span><span className="text-amber-500">18</span></div>
                          <div className="flex items-center justify-between"><span className="text-slate-500">out</span><span className="text-red-500">6</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Product list */}
                    <div className={`mt-3 rounded-lg border p-3 sm:mt-4 sm:p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                      <p style={FONT_DISPLAY} className="mb-3 text-xs font-semibold">Product overview</p>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {products.map((product) => (
                          <div key={product.sku} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                            <div className="min-w-0">
                              <p className="truncate text-[10px] font-semibold">{product.name}</p>
                              <p style={FONT_MONO} className="mt-0.5 text-[8px] text-slate-400">{product.sku}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span style={FONT_MONO} className="text-[9px] font-semibold">{product.stock}</span>
                              <span className={`rounded-sm px-1.5 py-0.5 text-[8px] font-medium ${product.status === "Healthy" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {product.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`absolute -left-6 top-24 hidden w-48 rounded-lg border p-4 shadow-xl xl:block ${darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-100 font-bold text-amber-600">!</div>
                    <div>
                      <p style={FONT_DISPLAY} className="text-xs font-semibold">Stock alert</p>
                      <p className="mt-1 text-[11px] text-slate-500">3 items need attention</p>
                    </div>
                  </div>
                </div>

                <div className={`absolute -bottom-5 -right-5 hidden w-48 rounded-lg border p-4 shadow-xl xl:block ${darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-500">Inventory status</p>
                      <p style={FONT_DISPLAY} className="mt-1 text-xs font-semibold">Everything organized</p>
                    </div>
                    <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section id="features" className={`border-t ${darkMode ? "border-slate-800 bg-[#0b1423]" : "border-slate-200 bg-white"}`}>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 style={FONT_DISPLAY} className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Everything your inventory needs.
              </h2>
              <p className={`mt-4 max-w-xl leading-7 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Keep products, stock information and inventory operations connected without unnecessary complexity.
              </p>
            </div>

            {/* Manifest-style feature list — replaces the identical-card grid */}
            <div className={`mt-10 divide-y sm:mt-14 ${darkMode ? "divide-slate-800" : "divide-slate-200"}`}>
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`group grid grid-cols-1 gap-4 border-l-2 border-transparent py-7 pl-0 transition-all duration-200 hover:border-indigo-600 hover:pl-4 sm:grid-cols-[auto_1fr_1.4fr] sm:items-center sm:gap-8`}
                >
                  <div className="flex items-center gap-4 sm:w-40">
                    <BarcodeMark bars={feature.bars} tone={darkMode ? "bg-indigo-400" : "bg-indigo-600"} />
                    <span style={FONT_MONO} className="text-[11px] text-slate-400">{feature.code}</span>
                  </div>
                  <h3 style={FONT_DISPLAY} className="text-lg font-semibold">{feature.title}</h3>
                  <p className={`text-sm leading-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= OPERATIONS ================= */}
        <section id="operations" className={`border-t ${darkMode ? "border-slate-800 bg-[#08111f]" : "border-slate-200 bg-[#f8fafc]"}`}>
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-14 lg:px-8">
            <div>
              <h2 style={FONT_DISPLAY} className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Every stock movement, clearly organized.
              </h2>
              <p className={`mt-4 max-w-xl leading-7 sm:mt-5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                StockSense gives your team a structured way to manage the everyday movement of inventory across your business.
              </p>

              <div className="mt-7 space-y-3 sm:mt-8">
                {operations.map((operation) => (
                  <div key={operation.name} className={`flex items-center gap-4 rounded-lg border p-4 text-left transition ${darkMode ? "border-slate-800 bg-slate-900/50 hover:border-indigo-500/30" : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-bold ${operation.iconStyle}`}>{operation.icon}</div>
                    <div className="min-w-0">
                      <p style={FONT_DISPLAY} className="truncate text-sm font-semibold">{operation.name}</p>
                      <p className="truncate text-xs text-slate-500">{operation.description}</p>
                    </div>
                    <span style={FONT_MONO} className={`ml-auto shrink-0 rounded-sm px-2 py-1 text-[10px] font-medium ${operation.statusStyle}`}>
                      {operation.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-xl border p-3 shadow-xl sm:p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <div className={`rounded-lg border p-4 sm:p-5 ${darkMode ? "border-slate-800 bg-[#0d1728]" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600">↗</div>
                    <div>
                      <p style={FONT_DISPLAY} className="text-sm font-semibold">Operations center</p>
                      <p style={FONT_MONO} className="mt-0.5 text-[10px] text-slate-500">today — no activity yet</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
                  {[
                    { label: "Today", value: "0" },
                    { label: "Pending", value: "0" },
                    { label: "Completed", value: "0" },
                  ].map((s) => (
                    <div key={s.label} className="px-3 first:pl-0 last:pr-0">
                      <p style={FONT_MONO} className="text-[9px] uppercase tracking-wide text-slate-500">{s.label}</p>
                      <p style={FONT_DISPLAY} className="mt-1 text-lg font-bold">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className={`mt-4 rounded-lg border p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                  <p style={FONT_DISPLAY} className="text-xs font-semibold">Recent activity</p>
                  <div className="mt-3 space-y-2.5">
                    {operations.map((operation) => (
                      <div key={operation.name} className={`flex items-center gap-3 rounded-md p-3 ${darkMode ? "bg-slate-800/60" : "bg-slate-50"}`}>
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold ${operation.iconStyle}`}>{operation.icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-semibold">{operation.name}</p>
                          <p className="mt-0.5 truncate text-[9px] text-slate-500">{operation.description}</p>
                        </div>
                        <span className={`hidden shrink-0 rounded-sm px-2 py-1 text-[8px] font-medium sm:block ${operation.statusStyle}`}>{operation.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className={`border-t ${darkMode ? "border-slate-800 bg-[#0b1423]" : "border-slate-200 bg-white"}`}>
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <h2 style={FONT_DISPLAY} className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Ready to organize your inventory?
            </h2>
            <p className={`mx-auto mt-4 max-w-xl leading-7 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Bring products, stock and inventory operations together with StockSense.
            </p>
            <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-700 sm:px-7">
              Get started →
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className={`border-t ${darkMode ? "border-slate-800 bg-[#08111f]" : "border-slate-200 bg-white"}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:gap-4 sm:px-6 sm:py-7 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div style={FONT_DISPLAY} className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">S</div>
            <span style={FONT_DISPLAY} className="text-sm font-semibold">StockSense</span>
          </Link>
          <p style={FONT_MONO} className={`text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            © 2026 StockSense — inventory management made simple.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;