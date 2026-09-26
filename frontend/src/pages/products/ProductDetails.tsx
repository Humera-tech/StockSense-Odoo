import { useState } from "react";

interface StockLocation {
  location: string;
  warehouse: string;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

interface Movement {
  id: string;
  date: string;
  type: "Receipt" | "Delivery" | "Transfer" | "Adjustment";
  quantity: number;
  from: string;
  to: string;
}

const stockLocations: StockLocation[] = [
  {
    location: "Main Warehouse",
    warehouse: "WH-001",
    quantity: 120,
    status: "In Stock",
  },
  {
    location: "Store Room",
    warehouse: "WH-001",
    quantity: 35,
    status: "In Stock",
  },
  {
    location: "Display Area",
    warehouse: "WH-002",
    quantity: 8,
    status: "Low Stock",
  },
];

const movements: Movement[] = [
  {
    id: "MOV-001",
    date: "2026-09-26",
    type: "Receipt",
    quantity: 50,
    from: "Vendor",
    to: "Main Warehouse",
  },
  {
    id: "MOV-002",
    date: "2026-09-25",
    type: "Delivery",
    quantity: 20,
    from: "Main Warehouse",
    to: "Customer",
  },
  {
    id: "MOV-003",
    date: "2026-09-24",
    type: "Transfer",
    quantity: 15,
    from: "Main Warehouse",
    to: "Store Room",
  },
  {
    id: "MOV-004",
    date: "2026-09-22",
    type: "Adjustment",
    quantity: 5,
    from: "Main Warehouse",
    to: "Adjustment",
  },
];

const typeStyles: Record<Movement["type"], string> = {
  Receipt: "bg-green-500/10 text-green-400",
  Delivery: "bg-red-500/10 text-red-400",
  Transfer: "bg-blue-500/10 text-blue-400",
  Adjustment: "bg-yellow-500/10 text-yellow-400",
};

export default function ProductsDetail() {
  const [activeTab, setActiveTab] = useState<"stock" | "movements">(
    "stock"
  );

  const totalStock = stockLocations.reduce(
    (total, location) => total + location.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 text-sm text-gray-500">
            Products / Product Details
          </div>

          <h1 className="text-2xl font-bold">
            Wireless Mouse
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Complete product and inventory information.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-700"
        >
          Edit Product
        </button>
      </div>

      {/* Product Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            SKU
          </p>

          <p className="mt-2 text-xl font-semibold">
            WM-001
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Total Stock
          </p>

          <p className="mt-2 text-xl font-semibold text-green-400">
            {totalStock}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Unit of Measure
          </p>

          <p className="mt-2 text-xl font-semibold">
            Units
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Product Status
          </p>

          <p className="mt-2">
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
              Active
            </span>
          </p>
        </div>
      </div>

      {/* Product Information */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 px-6 py-5">
          <h2 className="text-lg font-semibold">
            Product Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">

          <div>
            <p className="text-sm text-gray-500">
              Product Name
            </p>
            <p className="mt-1 font-medium">
              Wireless Mouse
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              SKU
            </p>
            <p className="mt-1 font-medium">
              WM-001
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Unit of Measure
            </p>
            <p className="mt-1 font-medium">
              Units
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Created On
            </p>
            <p className="mt-1 font-medium">
              20 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Last Updated
            </p>
            <p className="mt-1 font-medium">
              26 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Reorder Level
            </p>
            <p className="mt-1 font-medium">
              20 units
            </p>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">

        <div className="flex border-b border-gray-800">

          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === "stock"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Stock by Location
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("movements")}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === "movements"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Recent Movements
          </button>

        </div>

        {/* Stock */}
        {activeTab === "stock" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="border-b border-gray-800 bg-gray-950/50">
                <tr>
                  <th className="px-6 py-4 text-gray-400">
                    Location
                  </th>

                  <th className="px-6 py-4 text-gray-400">
                    Warehouse
                  </th>

                  <th className="px-6 py-4 text-gray-400">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">

                {stockLocations.map((location) => (
                  <tr
                    key={location.location}
                    className="hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-4 font-medium">
                      {location.location}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {location.warehouse}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {location.quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          location.status === "In Stock"
                            ? "bg-green-500/10 text-green-400"
                            : location.status === "Low Stock"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {location.status}
                      </span>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

        {/* Movements */}
        {activeTab === "movements" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="border-b border-gray-800 bg-gray-950/50">
                <tr>
                  <th className="px-6 py-4 text-gray-400">
                    Movement
                  </th>

                  <th className="px-6 py-4 text-gray-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-gray-400">
                    Type
                  </th>

                  <th className="px-6 py-4 text-gray-400">
                    From
                  </th>

                  <th className="px-6 py-4 text-gray-400">
                    To
                  </th>

                  <th className="px-6 py-4 text-gray-400">
                    Quantity
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">

                {movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-4 font-medium">
                      {movement.id}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {movement.date}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${typeStyles[movement.type]}`}
                      >
                        {movement.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {movement.from}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {movement.to}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {movement.quantity}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}