import { useState } from "react";
import type { FormEvent } from "react";

import { Alert, EmptyState, Field, PageHeader } from "../../components/ui";
import { useApi } from "../../lib/useApi";
import { ApiError, errorMessage } from "../../services/api";
import { inventoryService } from "../../services/inventoryService";
import type { Location, Warehouse } from "../../types/inventory";

const EMPTY = { name: "", short_code: "", warehouse_id: "" };

export default function Locations() {
  const { data: warehouses } = useApi<Warehouse[]>("/warehouses");
  const { data: locations, error, reload } = useApi<Location[]>("/locations");
  const [editing, setEditing] = useState<Location | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const warehouseId = draft.warehouse_id || String(warehouses?.[0]?.id ?? "");
  const warehouseCode = new Map(warehouses?.map((w) => [w.id, w.short_code]));
  const internal = locations?.filter((loc) => loc.type === "INTERNAL") ?? [];
  const virtual = locations?.filter((loc) => loc.type !== "INTERNAL") ?? [];

  const startEdit = (location: Location | null) => {
    setEditing(location);
    setDraft(location ? { name: location.name, short_code: location.short_code, warehouse_id: String(location.warehouse_id) } : EMPTY);
    setErrors({});
    setBanner(null);
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!draft.name.trim()) errs.name = "Enter a location name";
    if (!/^[A-Za-z0-9]{1,10}$/.test(draft.short_code.trim())) errs.short_code = "Short code must be 1–10 letters or digits";
    if (!warehouseId) errs.warehouse_id = "Choose a warehouse";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const body = { name: draft.name, short_code: draft.short_code, warehouse_id: Number(warehouseId) };
    try {
      if (editing) await inventoryService.updateLocation(editing.id, body);
      else await inventoryService.createLocation(body);
      startEdit(null);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.field) setErrors({ [err.field]: err.message });
      else setBanner(errorMessage(err));
    }
  }

  async function remove(location: Location) {
    if (!window.confirm(`Delete location ${location.full_code}?`)) return;
    try {
      await inventoryService.deleteLocation(location.id);
      if (editing?.id === location.id) startEdit(null);
      reload();
    } catch (err) {
      setBanner(errorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader title="Locations" subtitle="Rooms and racks inside a warehouse, e.g. WH/Stock1." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-3">
          {(error || banner) && <Alert>{error ?? banner}</Alert>}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-line bg-subtle text-xs font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Warehouse</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {internal.map((loc) => (
                    <tr key={loc.id}>
                      <td className="px-4 py-3 font-semibold text-ink">{loc.full_code}</td>
                      <td className="px-4 py-3 text-ink/80">{loc.name}</td>
                      <td className="px-4 py-3 text-muted">{warehouseCode.get(loc.warehouse_id)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button type="button" onClick={() => startEdit(loc)} className="mr-3 font-semibold text-brand hover:text-brand">Edit</button>
                        <button type="button" onClick={() => remove(loc)} className="font-semibold text-rose-600 hover:text-rose-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {locations && internal.length === 0 && <EmptyState>No locations yet.</EmptyState>}
          </div>
          {virtual.length > 0 && (
            <p className="px-1 text-xs text-muted">
              System locations (not editable): {[...new Set(virtual.map((loc) => loc.name))].join(", ")}.
            </p>
          )}
        </div>

        <form onSubmit={save} noValidate className="card h-fit space-y-4 p-5">
          <h2 className="text-base font-semibold text-ink">{editing ? `Edit ${editing.full_code}` : "New location"}</h2>
          <Field label="Name" htmlFor="loc-name" error={errors.name}>
            <input id="loc-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Stock 3" className={`input ${errors.name ? "input-invalid" : ""}`} />
          </Field>
          <Field label="Short code" htmlFor="loc-code" error={errors.short_code}>
            <input id="loc-code" value={draft.short_code} onChange={(e) => setDraft({ ...draft, short_code: e.target.value })}
              placeholder="Stock3" className={`input ${errors.short_code ? "input-invalid" : ""}`} />
          </Field>
          <Field label="Warehouse" htmlFor="loc-wh" error={errors.warehouse_id}>
            <select id="loc-wh" value={warehouseId} onChange={(e) => setDraft({ ...draft, warehouse_id: e.target.value })}
              className={`input ${errors.warehouse_id ? "input-invalid" : ""}`}>
              {warehouses?.map((w) => (
                <option key={w.id} value={w.id}>{w.short_code} — {w.name}</option>
              ))}
            </select>
          </Field>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">{editing ? "Save changes" : "Create location"}</button>
            {editing && <button type="button" onClick={() => startEdit(null)} className="btn btn-secondary">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
