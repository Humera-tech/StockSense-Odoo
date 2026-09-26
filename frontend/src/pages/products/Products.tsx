import { useState } from "react";
import type { FormEvent } from "react";

import { Alert, EmptyState, Field, PageHeader } from "../../components/ui";
import { formatMoney } from "../../lib/format";
import { useApi } from "../../lib/useApi";
import { ApiError, errorMessage, withQuery } from "../../services/api";
import { inventoryService } from "../../services/inventoryService";
import type { StockLevel } from "../../types/product";

const EMPTY_PRODUCT = { sku: "", name: "", unit_cost: "", uom: "unit" };

export default function Products() {
  const [search, setSearch] = useState("");
  const { data: levels, error, loading, reload } = useApi<StockLevel[]>(withQuery("/stock", { search: search.trim() }));
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(EMPTY_PRODUCT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function createProduct(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!draft.sku.trim()) errs.sku = "Enter a SKU";
    if (!draft.name.trim()) errs.name = "Enter a product name";
    const cost = Number(draft.unit_cost);
    if (draft.unit_cost.trim() === "" || Number.isNaN(cost) || cost < 0) errs.unit_cost = "Enter a cost of 0 or more";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await inventoryService.createProduct({ ...draft, unit_cost: cost });
      setDraft(EMPTY_PRODUCT);
      setShowForm(false);
      reload();
    } catch (err) {
      setErrors(err instanceof ApiError && err.field ? { [err.field]: err.message } : { form: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Stock"
        subtitle="On hand and free-to-use quantities across internal locations."
        actions={
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn btn-primary">
            {showForm ? "Close" : "+ New product"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={createProduct} noValidate className="card mb-5 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="SKU" htmlFor="sku" error={errors.sku}>
            <input id="sku" value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
              placeholder="DESK001" className={`input ${errors.sku ? "input-invalid" : ""}`} />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Name" htmlFor="name" error={errors.name}>
              <input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Desk" className={`input ${errors.name ? "input-invalid" : ""}`} />
            </Field>
          </div>
          <Field label="Per-unit cost" htmlFor="cost" error={errors.unit_cost}>
            <input id="cost" type="number" min={0} step="0.01" value={draft.unit_cost}
              onChange={(e) => setDraft({ ...draft, unit_cost: e.target.value })}
              className={`input ${errors.unit_cost ? "input-invalid" : ""}`} />
          </Field>
          <Field label="Unit" htmlFor="uom" error={errors.uom}>
            <input id="uom" value={draft.uom} onChange={(e) => setDraft({ ...draft, uom: e.target.value })} className="input" />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-5">
            <button type="submit" disabled={saving} className="btn btn-primary">Create product</button>
            {errors.form && <span className="text-sm text-rose-600">{errors.form}</span>}
          </div>
        </form>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by product name or SKU…"
        aria-label="Search products"
        className="input mb-4 sm:max-w-sm"
      />

      {error && <Alert>{error}</Alert>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-right">Per-unit cost</th>
                <th className="px-4 py-3 text-right">On hand</th>
                <th className="px-4 py-3 text-right">Free to use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {levels?.map(({ product, on_hand, free_to_use }) => (
                <tr key={product.id} className={on_hand === 0 ? "bg-rose-50/60" : undefined}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-500">[{product.sku}]</span>{" "}
                    <span className="font-medium text-slate-900">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatMoney(product.unit_cost)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${on_hand === 0 ? "text-rose-600" : "text-slate-900"}`}>
                    {on_hand} <span className="text-xs font-normal text-slate-400">{product.uom}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${free_to_use <= 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    {free_to_use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && levels?.length === 0 && <EmptyState>No products found.</EmptyState>}
        {loading && !levels && <EmptyState>Loading…</EmptyState>}
      </div>
    </div>
  );
}
