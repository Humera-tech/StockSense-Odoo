const kpis = [
  {
    title: 'Products in Stock',
    value: '1,284',
    change: '+12%',
    description: 'this month',
    icon: '▦',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950',
    iconText: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Low / Out of Stock',
    value: '24',
    change: '18 low',
    description: '6 out of stock',
    icon: '!',
    iconBg: 'bg-amber-100 dark:bg-amber-950',
    iconText: 'text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Pending Receipts',
    value: '42',
    change: '4 late',
    description: 'to receive',
    icon: '↓',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950',
    iconText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Pending Deliveries',
    value: '37',
    change: '5 waiting',
    description: 'to deliver',
    icon: '↑',
    iconBg: 'bg-blue-100 dark:bg-blue-950',
    iconText: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Internal Transfers',
    value: '12',
    change: '3 today',
    description: 'scheduled',
    icon: '↔',
    iconBg: 'bg-purple-100 dark:bg-purple-950',
    iconText: 'text-purple-600 dark:text-purple-400',
  },
]

function DashboardKPI() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <div
          key={kpi.title}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {kpi.title}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {kpi.value}
              </p>
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.iconBg} ${kpi.iconText} font-bold`}
            >
              {kpi.icon}
            </div>
          </div>

          <div className="mt-4 flex gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {kpi.change}
            </span>

            <span className="text-slate-400">
              {kpi.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardKPI