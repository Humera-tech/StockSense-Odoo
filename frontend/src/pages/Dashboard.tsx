import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import DashboardKPI from '../components/dashboard/DashboardKPI'
import DashboardFilters from '../components/dashboard/DashboardFilters'
import StockAlerts from '../components/dashboard/StockAlerts'
import RecentOperations from '../components/dashboard/RecentOperations'

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <Sidebar />

      <div className="ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Inventory Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Overview of your inventory operations
            </p>
          </div>

          <DashboardKPI />

          <DashboardFilters />

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RecentOperations />
            <StockAlerts />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard