import { NavLink } from 'react-router-dom'

function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
    }`

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
          S
        </div>

        <div>
          <h1 className="font-bold text-slate-900 dark:text-white">
            StockSense
          </h1>

          <p className="text-xs text-slate-400">
            Inventory Management
          </p>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        <NavLink to="/" className={linkClass}>
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/products" className={linkClass}>
          <span>□</span>
          Products
        </NavLink>

        <NavLink to="/operations" className={linkClass}>
          <span>↔</span>
          Operations
        </NavLink>

        <NavLink to="/move-history" className={linkClass}>
          <span>↻</span>
          Move History
        </NavLink>

        <NavLink to="/settings" className={linkClass}>
          <span>⚙</span>
          Settings
        </NavLink>
      </nav>

      <div className="absolute bottom-0 w-full border-t border-slate-200 p-4 dark:border-slate-800">
        <NavLink to="/profile" className={linkClass}>
          <span>◯</span>
          Profile
        </NavLink>

        <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar