function DashboardFilters() {
  const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Inventory Filters
        </h2>

        <p className="text-sm text-slate-400">
          Filter your inventory and operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <select className={selectClass}>
          <option>All Document Types</option>
          <option>Receipts</option>
          <option>Deliveries</option>
          <option>Transfers</option>
          <option>Adjustments</option>
        </select>

        <select className={selectClass}>
          <option>All Statuses</option>
          <option>Draft</option>
          <option>Waiting</option>
          <option>Ready</option>
          <option>Done</option>
        </select>

        <select className={selectClass}>
          <option>All Warehouses</option>
          <option>WH-01</option>
          <option>WH-02</option>
          <option>WH-03</option>
        </select>

        <select className={selectClass}>
          <option>All Categories</option>
          <option>Raw Materials</option>
          <option>Hardware</option>
          <option>Safety</option>
          <option>Chemicals</option>
        </select>
      </div>
    </div>
  )
}

export default DashboardFilters