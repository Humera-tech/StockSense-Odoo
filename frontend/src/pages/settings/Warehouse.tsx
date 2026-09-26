import { useState } from "react";
import type { FormEvent } from "react";

import { Alert, EmptyState, Field, PageHeader } from "../../components/ui";
import { useApi } from "../../lib/useApi";
import { ApiError, errorMessage } from "../../services/api";
import { inventoryService } from "../../services/inventoryService";
import type { Warehouse as WarehouseType } from "../../types/inventory";

const EMPTY = { name: "", short_code: "", address: "" };

export default function Warehouse() {
  const { data: warehouses, error, reload } = useApi<WarehouseType[]>("/warehouses");
  const [editing, setEditing] = useState<WarehouseType | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const startEdit = (warehouse: WarehouseType | null) => {
    setEditing(warehouse);
    setDraft(warehouse ? { name: warehouse.name, short_code: warehouse.short_code, address: warehouse.address ?? "" } : EMPTY);
    setErrors({});
    setBanner(null);
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!draft.name.trim()) errs.name = "Enter a warehouse name";
    if (!/^[A-Za-z0-9]{1,10}$/.test(draft.short_code.trim())) errs.short_code = "Short code must be 1–10 letters or digits";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const body = { name: draft.name, short_code: draft.short_code, address: draft.address.trim() || null };
    try {
      if (editing) await inventoryService.updateWarehouse(editing.id, body);
      else await inventoryService.createWarehouse(body);
      startEdit(null);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.field) setErrors({ [err.field]: err.message });
      else setBanner(errorMessage(err));
    }
  }

  async function remove(warehouse: WarehouseType) {
    if (!window.confirm(`Delete warehouse ${warehouse.short_code}?`)) return;
    try {
      await inventoryService.deleteWarehouse(warehouse.id);
      if (editing?.id === warehouse.id) startEdit(null);
      reload();
    } catch (err) {
      setBanner(errorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader title="Warehouses" subtitle="The short code prefixes every reference, e.g. WH/IN/0001." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-3">
          {(error || banner) && <Alert>{error ?? banner}</Alert>}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-line bg-subtle text-xs font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Short code</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {warehouses?.map((w) => (
                    <tr key={w.id}>
                      <td className="px-4 py-3 font-semibold text-ink">{w.short_code}</td>
                      <td className="px-4 py-3 text-ink/80">{w.name}</td>
                      <td className="px-4 py-3 text-muted">{w.address ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button type="button" onClick={() => startEdit(w)} className="mr-3 font-semibold text-brand hover:text-brand">Edit</button>
                        <button type="button" onClick={() => remove(w)} className="font-semibold text-rose-600 hover:text-rose-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {warehouses?.length === 0 && <EmptyState>No warehouses yet.</EmptyState>}
          </div>
        </div>

        <form onSubmit={save} noValidate className="card h-fit space-y-4 p-5">
          <h2 className="text-base font-semibold text-ink">{editing ? `Edit ${editing.short_code}` : "New warehouse"}</h2>
          <Field label="Name" htmlFor="wh-name" error={errors.name}>
            <input id="wh-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Main Warehouse" className={`input ${errors.name ? "input-invalid" : ""}`} />
          </Field>
          <Field label="Short code" htmlFor="wh-code" error={errors.short_code} hint="Letters and digits, saved in uppercase.">
            <input id="wh-code" value={draft.short_code}
              onChange={(e) => setDraft({ ...draft, short_code: e.target.value.toUpperCase() })}
              placeholder="WH" className={`input ${errors.short_code ? "input-invalid" : ""}`} />
          </Field>
          <Field label="Address" htmlFor="wh-address" error={errors.address}>
            <textarea id="wh-address" rows={3} value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })} className="input" />
          </Field>
          {!editing && (
            <p className="text-xs text-muted">A default “Stock” location plus vendor, customer and adjustment locations are created with it.</p>
          )}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">{editing ? "Save changes" : "Create warehouse"}</button>
            {editing && <button type="button" onClick={() => startEdit(null)} className="btn btn-secondary">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
