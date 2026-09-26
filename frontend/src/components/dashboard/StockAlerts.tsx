const alerts = [
  {
    product: 'Steel Rods 12mm',
    sku: 'SKU-8821',
    stock: 12,
    minimum: 20,
  },
  {
    product: 'Industrial Paint',
    sku: 'SKU-6610',
    stock: 5,
    minimum: 15,
  },
  {
    product: 'Copper Wire',
    sku: 'SKU-4412',
    stock: 0,
    minimum: 10,
  },
  {
    product: 'Safety Helmets',
    sku: 'SKU-2241',
    stock: 8,
    minimum: 12,
  },
]

function StockAlerts() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Stock Alerts
          </h2>

          <p className="text-sm text-slate-400">
            Products requiring attention
          </p>
        </div>

        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-400">
          {alerts.length} Alerts
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {alerts.map((alert) => (
          <div
            key={alert.sku}
            className="flex items-center justify-between p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  alert.stock === 0
                    ? 'bg-red-100 dark:bg-red-950'
                    : 'bg-amber-100 dark:bg-amber-950'
                }`}
              >
                <span
                  className={
                    alert.stock === 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }
                >
                  !
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {alert.product}
                </p>

                <p className="text-xs text-slate-400">
                  {alert.sku}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`text-sm font-bold ${
                  alert.stock === 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {alert.stock} units
              </p>

              <p className="text-xs text-slate-400">
                Min: {alert.minimum}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StockAlerts