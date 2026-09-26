const operations = [
  {
    reference: 'WH/IN/0007',
    type: 'Receipt',
    product: 'Steel Rods 12mm',
    status: 'Done',
    quantity: '+120',
  },
  {
    reference: 'WH/OUT/0014',
    type: 'Delivery',
    product: 'Safety Gloves',
    status: 'Ready',
    quantity: '-40',
  },
  {
    reference: 'WH/INT/0005',
    type: 'Transfer',
    product: 'Hex Bolts M8',
    status: 'Waiting',
    quantity: '80',
  },
  {
    reference: 'WH/IN/0006',
    type: 'Receipt',
    product: 'Industrial Paint',
    status: 'Draft',
    quantity: '+25',
  },
]

function RecentOperations() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Recent Operations
          </h2>

          <p className="text-sm text-slate-400">
            Latest inventory movements
          </p>
        </div>

        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          View all
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {operations.map((operation) => (
          <div
            key={operation.reference}
            className="flex items-center justify-between p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {operation.reference}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {operation.type} · {operation.product}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  operation.quantity.startsWith('+')
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : operation.quantity.startsWith('-')
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {operation.quantity}
              </p>

              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {operation.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentOperations