function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900">
        StockSense Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome to your inventory dashboard.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Products
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Low Stock
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Pending Receipts
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Pending Deliveries
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            0
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;