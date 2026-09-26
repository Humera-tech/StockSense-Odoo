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

const initialProducts: Product[] = [
  {
    id: 1,
    sku: 'SKU-8821',
    name: 'Steel Rods 12mm',
    category: 'Raw Materials',
    cost: 24.5,
    stock: 12,
    freeToUse: 10,
    location: 'WH-01',
  },
  {
    id: 2,
    sku: 'SKU-7732',
    name: 'Hex Bolts M8',
    category: 'Hardware',
    cost: 2.4,
    stock: 245,
    freeToUse: 220,
    location: 'WH-02',
  },
  {
    id: 3,
    sku: 'SKU-6610',
    name: 'Industrial Paint',
    category: 'Chemicals',
    cost: 18.75,
    stock: 5,
    freeToUse: 5,
    location: 'WH-01',
  },
  {
    id: 4,
    sku: 'SKU-5523',
    name: 'Safety Gloves',
    category: 'Safety',
    cost: 6.25,
    stock: 120,
    freeToUse: 95,
    location: 'WH-03',
  },
  {
    id: 5,
    sku: 'SKU-4412',
    name: 'Copper Wire',
    category: 'Raw Materials',
    cost: 15.8,
    stock: 0,
    freeToUse: 0,
    location: 'WH-01',
  },
]

function Products() {
  const [products, setProducts] = useState(initialProducts)
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
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              stock: value,
              freeToUse: Math.min(product.freeToUse, value),
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
      ...product,
      freeToUse: product.stock,
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
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Add Product
            </button>
          </div>

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product or SKU..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option>All Categories</option>
                <option>Raw Materials</option>
                <option>Hardware</option>
                <option>Chemicals</option>
                <option>Safety</option>
              </select>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option>All Locations</option>
                <option>WH-01</option>
                <option>WH-02</option>
                <option>WH-03</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Inventory
              </h2>

              <p className="text-xs text-slate-400">
                {filteredProducts.length} products found
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    {[
                      'Product',
                      'Category',
                      'Cost',
                      'On Hand',
                      'Free to Use',
                      'Location',
                      'Status',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-semibold uppercase text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map((product) => {
                    const outOfStock = product.stock === 0
                    const lowStock = product.stock > 0 && product.stock < 20

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {product.sku}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {product.category}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                          ₹{product.cost.toFixed(2)}
                        </td>

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
                            className="w-24 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {product.freeToUse}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {product.location}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              outOfStock
                                ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                                : lowStock
                                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                            }`}
                          >
                            {outOfStock
                              ? 'Out of Stock'
                              : lowStock
                                ? 'Low Stock'
                                : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

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