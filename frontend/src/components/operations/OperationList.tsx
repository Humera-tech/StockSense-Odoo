import { useMemo, useState } from 'react'
import Sidebar from '../layout/Sidebar'
import Header from '../layout/Header'

type OperationType = 'IN' | 'OUT' | 'INTERNAL' | 'ADJUSTMENT'

type OperationListProps = {
  type: OperationType
}

type Operation = {
  id: number
  reference: string
  source: string
  destination: string
  scheduledDate: string
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled'
}

const config: Record<
  OperationType,
  {
    title: string
    description: string
    prefix: string
  }
> = {
  IN: {
    title: 'Receipts',
    description: 'Manage incoming stock receipts',
    prefix: 'WH/IN/',
  },
  OUT: {
    title: 'Deliveries',
    description: 'Manage outgoing stock deliveries',
    prefix: 'WH/OUT/',
  },
  INTERNAL: {
    title: 'Internal Transfers',
    description: 'Move stock between locations',
    prefix: 'WH/INT/',
  },
  ADJUSTMENT: {
    title: 'Inventory Adjustments',
    description: 'Adjust stock quantities',
    prefix: 'WH/ADJ/',
  },
}

function OperationList({ type }: OperationListProps) {
  const current = config[type]

  const [operations, setOperations] = useState<Operation[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const filteredOperations = useMemo(() => {
    return operations.filter((operation) => {
      const matchesSearch =
        operation.reference.toLowerCase().includes(search.toLowerCase()) ||
        operation.source.toLowerCase().includes(search.toLowerCase()) ||
        operation.destination.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' || operation.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [operations, search, statusFilter])

  const createOperation = () => {
    const number = String(operations.length + 1).padStart(4, '0')

    const newOperation: Operation = {
      id: Date.now(),
      reference: `${current.prefix}${number}`,
      source: type === 'IN' ? 'Vendors' : 'WH/Stock',
      destination: type === 'OUT' ? 'Customers' : 'WH/Stock',
      scheduledDate: new Date().toISOString().slice(0, 10),
      status: 'Draft',
    }

    setOperations((items) => [newOperation, ...items])
    setShowForm(false)
  }

  const validateOperation = (id: number) => {
    setOperations((items) =>
      items.map((operation) =>
        operation.id === id
          ? { ...operation, status: 'Done' }
          : operation,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <Sidebar />

      <div className="ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {current.title}
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {current.description}
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + New Operation
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operations..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option>All</option>
              <option>Draft</option>
              <option>Waiting</option>
              <option>Ready</option>
              <option>Done</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {filteredOperations.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-4xl">📦</div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  No operations yet
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Create your first operation to get started.
                </p>

                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create Operation
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Reference</th>
                      <th className="px-6 py-4 font-semibold">Source</th>
                      <th className="px-6 py-4 font-semibold">Destination</th>
                      <th className="px-6 py-4 font-semibold">Scheduled</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOperations.map((operation) => (
                      <tr
                        key={operation.id}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                          {operation.reference}
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {operation.source}
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {operation.destination}
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {operation.scheduledDate}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {operation.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {operation.status !== 'Done' &&
                            operation.status !== 'Cancelled' && (
                              <button
                                onClick={() => validateOperation(operation.id)}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Validate
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              New {current.title.slice(0, -1)}
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              A new draft operation will be created with an automatic reference.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:text-white"
              >
                Cancel
              </button>

              <button
                onClick={createOperation}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperationList