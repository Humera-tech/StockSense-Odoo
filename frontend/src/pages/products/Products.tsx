import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import ProductForm from '../../components/products/ProductForm'

type Product = {
  id: number
  sku: string
  name: string
  category: string
  cost: number
  stock: number
  freeToUse: number
  location: string
}

function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [location, setLocation] = useState('All Locations')
  const [showForm, setShowForm] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'All Categories' || product.category === category

    const matchesLocation =
      location === 'All Locations' || product.location === location

    return matchesSearch && matchesCategory && matchesLocation
  })

  const updateStock = (id: number, value: number) => {
    const safeValue = Math.max(0, value)

    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              stock: safeValue,
              freeToUse: Math.min(product.freeToUse, safeValue),
            }
          : product,
      ),
    )
  }

  const addProduct = (product: {
    sku: string
    name: string
    category: string
    cost: number
    stock: number
    location: string
  }) => {
    const newProduct: Product = {
      id: Date.now(),
      sku: product.sku,
      name: product.name,
      category: product.category,
      cost: product.cost,
      stock: product.stock,
      freeToUse: product.stock,
      location: product.location,
    }

    setProducts((current) => [newProduct, ...current])
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <Sidebar />

      <div className="ml-64">
        <Header />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Products & Stock
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage products and inventory availability
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add Product
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Inventory Filters
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Search and filter your products
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product or SKU..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-950"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option>All Categories</option>
                  <option>Raw Materials</option>
                  <option>Hardware</option>
                  <option>Chemicals</option>
                  <option>Safety</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Location
                </label>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option>All Locations</option>
                  <option>WH-01</option>
                  <option>WH-02</option>
                  <option>WH-03</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Inventory
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {filteredProducts.length}{' '}
                  {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>

              {products.length > 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  + Add Product
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cost
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      On Hand
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Free to Use
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* EMPTY STATE */}
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-20 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">
                          📦
                        </div>

                        <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
                          {products.length === 0
                            ? 'No products yet'
                            : 'No products found'}
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                          {products.length === 0
                            ? 'Add your first product to start managing your inventory.'
                            : 'Try changing your search or filters.'}
                        </p>

                        {products.length === 0 && (
                          <button
                            onClick={() => setShowForm(true)}
                            className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                          >
                            + Add Your First Product
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const outOfStock = product.stock === 0
                      const lowStock =
                        product.stock > 0 && product.stock < 20

                      return (
                        <tr
                          key={product.id}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          {/* Product */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {product.sku}
                            </p>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {product.category}
                          </td>

                          {/* Cost */}
                          <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                            ₹{product.cost.toFixed(2)}
                          </td>

                          {/* On Hand */}
                          <td className="px-5 py-4">
                            <input
                              type="number"
                              min="0"
                              value={product.stock}
                              onChange={(e) =>
                                updateStock(
                                  product.id,
                                  Number(e.target.value),
                                )
                              }
                              className="w-24 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </td>

                          {/* Free to Use */}
                          <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {product.freeToUse}
                          </td>

                          {/* Location */}
                          <td className="px-5 py-4">
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {product.location}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            {outOfStock ? (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-400">
                                Out of Stock
                              </span>
                            ) : lowStock ? (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                Low Stock
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <ProductForm
          onClose={() => setShowForm(false)}
          onAdd={addProduct}
        />
      )}
    </div>
  )
}

export default Products