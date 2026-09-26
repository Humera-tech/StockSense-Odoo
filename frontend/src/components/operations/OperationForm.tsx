import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/auth";
import { formatDate, productLabel, todayIso } from "../../lib/format";
import { STATUS_FLOW, STATUS_LABEL, TYPE_COPY } from "../../lib/status";
import { useApi } from "../../lib/useApi";
import { ApiError, errorMessage, withQuery } from "../../services/api";
import { inventoryService } from "../../services/inventoryService";
import type { Contact, Location, Operation, OperationPayload, Warehouse } from "../../types/inventory";
import type { Product, StockLevel } from "../../types/product";
import { Alert, Field } from "../ui";
import StatusBadge from "./StatusBadge";

interface LineDraft {
  key: string;
  product_id: string;
  quantity: string;
}

interface FormState {
  warehouse_id: string;
  contact_id: string;
  scheduled_date: string;
  location_id: string;
  lines: LineDraft[];
}

type Errors = Record<string, string>;
type Action = "todo" | "validate" | "cancel";

const VISIBLE_FIELD = /^(contact_id|scheduled_date|src_location_id|dest_location_id|warehouse_id|lines(\.\d+\.(product_id|quantity))?)$/;

function newLine(): LineDraft {
  return { key: crypto.randomUUID(), product_id: "", quantity: "1" };
}

function toForm(op: Operation | null, type: "IN" | "OUT"): FormState {
  if (!op) {
    return { warehouse_id: "", contact_id: "", scheduled_date: todayIso(), location_id: "", lines: [newLine()] };
  }
  const internal = type === "IN" ? op.dest_location : op.src_location;
  return {
    warehouse_id: String(op.warehouse_id),
    contact_id: op.contact ? String(op.contact.id) : "",
    scheduled_date: op.scheduled_date,
    location_id: String(internal.id),
    lines: op.lines.map((line) => ({
      key: String(line.id),
      product_id: String(line.product.id),
      quantity: String(line.quantity),
    })),
  };
}

export default function OperationForm({ type, initial }: { type: "IN" | "OUT"; initial: Operation | null }) {
  const copy = TYPE_COPY[type];
  const navigate = useNavigate();
  const { user } = useAuth();
  const [op, setOp] = useState<Operation | null>(initial);
  const [form, setForm] = useState<FormState>(() => toForm(initial, type));
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const editable = !op || op.status === "DRAFT";
  const locationField = type === "IN" ? "dest_location_id" : "src_location_id";

  const { data: warehouses } = useApi<Warehouse[]>("/warehouses");
  const { data: contacts } = useApi<Contact[]>(withQuery("/contacts", { kind: type === "IN" ? "VENDOR" : "CUSTOMER" }));
  const { data: products } = useApi<Product[]>("/products");
  const { data: locations } = useApi<Location[]>(withQuery("/locations", { type: "INTERNAL" }));

  const warehouseId = form.warehouse_id || String(warehouses?.[0]?.id ?? "");
  const warehouseLocations = locations?.filter((loc) => String(loc.warehouse_id) === warehouseId) ?? [];
  const locationId = form.location_id || String(warehouseLocations[0]?.id ?? "");

  const { data: stock } = useApi<StockLevel[]>(
    type === "OUT" && editable && locationId ? withQuery("/stock", { location_id: locationId }) : null,
  );
  const freeByProduct = new Map(stock?.map((level) => [String(level.product.id), level.free_to_use]));
  const selectedContact = contacts?.find((c) => String(c.id) === form.contact_id);

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));
  const updateLine = (key: string, patch: Partial<LineDraft>) =>
    setForm((prev) => ({ ...prev, lines: prev.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)) }));

  function validate(): Errors {
    const errs: Errors = {};
    if (!form.contact_id) errs.contact_id = "Choose a contact";
    if (!form.scheduled_date) errs.scheduled_date = "Choose a schedule date";
    if (!locationId) errs[locationField] = "Choose a location";
    if (form.lines.length === 0) errs.lines = "Add at least one product line";
    const seen = new Set<string>();
    form.lines.forEach((line, i) => {
      const qty = Number(line.quantity);
      if (!line.product_id) errs[`lines.${i}.product_id`] = "Choose a product";
      else if (seen.has(line.product_id)) errs[`lines.${i}.product_id`] = "Product already added to this operation";
      seen.add(line.product_id);
      if (line.quantity.trim() === "" || !Number.isInteger(qty) || qty <= 0) {
        errs[`lines.${i}.quantity`] = "Quantity must be a whole number greater than 0";
      }
    });
    return errs;
  }

  function payload(): OperationPayload {
    return {
      ...(op ? {} : { type, warehouse_id: Number(warehouseId) }),
      contact_id: Number(form.contact_id),
      scheduled_date: form.scheduled_date,
      [locationField]: Number(locationId),
      lines: form.lines.map((line) => ({ product_id: Number(line.product_id), quantity: Number(line.quantity) })),
    };
  }

  async function run(action?: Action) {
    setBanner(null);
    setNotice(null);
    if (action === "cancel" && !window.confirm(`Cancel ${op?.reference}? This releases any reserved stock.`)) return;

    let current = op;
    if (editable && action !== "cancel") {
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    setBusy(true);
    try {
      if (editable && action !== "cancel") {
        current = op
          ? await inventoryService.updateOperation(op.id, payload())
          : await inventoryService.createOperation(payload());
      }
      if (action && current) current = await inventoryService.operationAction(current.id, action);
      if (!current) return;
      if (!op) {
        navigate(`/operations/${current.id}`, { replace: true });
        return;
      }
      setOp(current);
      setForm(toForm(current, type));
      setErrors({});
      if (action === "validate") setNotice(`${current.reference} validated — stock updated.`);
      else if (!action) setNotice("Saved.");
    } catch (error) {
      if (editable && error instanceof ApiError && error.field && VISIBLE_FIELD.test(error.field)) {
        setErrors({ [error.field]: error.message });
      } else {
        setBanner(errorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void run();
  };

  const savedLocation = op ? (type === "IN" ? op.dest_location : op.src_location) : null;
  const savedWarehouse = op ? warehouses?.find((w) => w.id === op.warehouse_id) : undefined;
  const warehouseText = savedWarehouse
    ? `${savedWarehouse.short_code} — ${savedWarehouse.name}`
    : (savedLocation?.full_code.split("/")[0] ?? "");

  const flow = STATUS_FLOW[type];
  const status = op?.status ?? "DRAFT";
  const shortLines = op?.status === "WAITING" ? op.lines.filter((l) => l.reserved_qty < l.quantity) : [];

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to={copy.listPath} className="text-sm font-medium text-slate-500 hover:text-slate-800 print:hidden">
            ← {copy.title}
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {op ? op.reference : `New ${copy.singular.toLowerCase()}`}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          {editable && (
            <button type="submit" disabled={busy} className="btn btn-secondary">
              Save
            </button>
          )}
          {status === "DRAFT" && (
            <button type="button" disabled={busy} onClick={() => run("todo")} className="btn btn-primary">
              To Do
            </button>
          )}
          {op && (status === "READY" || status === "WAITING") && (
            <button
              type="button"
              disabled={busy || status === "WAITING"}
              title={status === "WAITING" ? "Waiting for stock" : undefined}
              onClick={() => run("validate")}
              className="btn btn-primary"
            >
              Validate
            </button>
          )}
          {op && (
            <button type="button" disabled={status !== "DONE"} onClick={() => window.print()} className="btn btn-secondary">
              Print
            </button>
          )}
          {op && status !== "DONE" && status !== "CANCELLED" && (
            <button type="button" disabled={busy} onClick={() => run("cancel")} className="btn btn-danger">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm print:hidden">
        {status === "CANCELLED" ? (
          <StatusBadge status="CANCELLED" />
        ) : (
          flow.map((step, i) => {
            const reached = flow.indexOf(status) >= i;
            return (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-300">→</span>}
                <span
                  className={`rounded-full px-3 py-1 font-semibold ${
                    step === status
                      ? "bg-indigo-600 text-white"
                      : reached
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {STATUS_LABEL[step]}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-4">
        {banner && <Alert>{banner}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}
        {shortLines.length > 0 && (
          <Alert tone="warning">
            <strong>Not enough stock:</strong>{" "}
            {shortLines.map((l) => `${l.product.name} (${l.reserved_qty} of ${l.quantity} reserved)`).join(", ")}. This
            delivery moves to Ready automatically when a receipt brings the missing quantity.
          </Alert>
        )}

        <div className="card grid gap-5 p-5 sm:p-6 md:grid-cols-2">
          <Field label={copy.contactLabel} htmlFor="contact" error={errors.contact_id}>
            {editable ? (
              <select
                id="contact"
                value={form.contact_id}
                onChange={(e) => update({ contact_id: e.target.value })}
                className={`input ${errors.contact_id ? "input-invalid" : ""}`}
              >
                <option value="">Select a contact…</option>
                {contacts?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input id="contact" value={op?.contact?.name ?? "—"} disabled className="input" />
            )}
            {type === "OUT" && (editable ? selectedContact : op?.contact)?.address && (
              <p className="mt-1.5 text-xs text-slate-500">
                Delivery address: {(editable ? selectedContact : op?.contact)?.address}
              </p>
            )}
          </Field>

          <Field label="Schedule date" htmlFor="scheduled" error={errors.scheduled_date}>
            <input
              id="scheduled"
              type="date"
              value={form.scheduled_date}
              disabled={!editable}
              onChange={(e) => update({ scheduled_date: e.target.value })}
              className={`input ${errors.scheduled_date ? "input-invalid" : ""}`}
            />
            {op?.is_late && <p className="mt-1.5 text-xs font-semibold text-rose-600">Late</p>}
          </Field>

          <Field label="Warehouse" htmlFor="warehouse" error={errors.warehouse_id}>
            {op ? (
              <input id="warehouse" value={warehouseText} disabled className="input" />
            ) : (
              <select
                id="warehouse"
                value={warehouseId}
                onChange={(e) => update({ warehouse_id: e.target.value, location_id: "" })}
                className="input"
              >
                {warehouses?.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.short_code} — {w.name}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field
            label={type === "IN" ? "Destination location" : "Source location"}
            htmlFor="location"
            error={errors[locationField]}
          >
            {editable ? (
              <select
                id="location"
                value={locationId}
                onChange={(e) => update({ location_id: e.target.value })}
                className={`input ${errors[locationField] ? "input-invalid" : ""}`}
              >
                {locations && warehouseLocations.length === 0 && (
                  <option value="">No locations — add one in Settings</option>
                )}
                {warehouseLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.full_code} — {loc.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="location"
                value={savedLocation ? `${savedLocation.full_code} — ${savedLocation.name}` : ""}
                disabled
                className="input"
              />
            )}
          </Field>

          <Field label="Responsible" htmlFor="responsible">
            <input id="responsible" value={op?.responsible.name ?? user?.name ?? ""} disabled className="input" />
          </Field>

          <Field label="Reference" htmlFor="reference">
            <input
              id="reference"
              value={op?.reference ?? ""}
              placeholder="Assigned automatically on save"
              disabled
              className="input"
            />
            {op?.done_at && <p className="mt-1.5 text-xs text-slate-500">Done on {formatDate(op.done_at)}</p>}
          </Field>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2.5">Product</th>
                  <th className="w-36 px-5 py-2.5">Quantity</th>
                  {type === "OUT" && <th className="w-40 px-5 py-2.5">{editable ? "Free to use" : "Reserved"}</th>}
                  {editable && <th className="w-12 px-2 py-2.5" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {form.lines.map((line, i) => {
                  const saved = op?.lines[i];
                  const free = freeByProduct.get(line.product_id);
                  const qty = Number(line.quantity);
                  const short =
                    type === "OUT" &&
                    (editable
                      ? line.product_id !== "" && free !== undefined && qty > free
                      : op?.status === "WAITING" && !!saved && saved.reserved_qty < saved.quantity);
                  const productError = errors[`lines.${i}.product_id`];
                  const qtyError = errors[`lines.${i}.quantity`];
                  return (
                    <tr key={line.key} className={short ? "bg-rose-50" : undefined}>
                      <td className="px-5 py-2.5 align-top">
                        {editable ? (
                          <>
                            <select
                              aria-label={`Product for line ${i + 1}`}
                              value={line.product_id}
                              onChange={(e) => updateLine(line.key, { product_id: e.target.value })}
                              className={`input ${productError ? "input-invalid" : ""}`}
                            >
                              <option value="">Select a product…</option>
                              {products?.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {productLabel(p)}
                                </option>
                              ))}
                            </select>
                            {productError && <p className="mt-1 text-xs font-medium text-rose-600">{productError}</p>}
                          </>
                        ) : (
                          <span className={short ? "font-semibold text-rose-700" : "text-slate-800"}>
                            {saved ? productLabel(saved.product) : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 align-top">
                        {editable ? (
                          <>
                            <input
                              aria-label={`Quantity for line ${i + 1}`}
                              type="number"
                              min={1}
                              step={1}
                              inputMode="numeric"
                              value={line.quantity}
                              onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                              className={`input ${qtyError ? "input-invalid" : ""}`}
                            />
                            {qtyError && <p className="mt-1 text-xs font-medium text-rose-600">{qtyError}</p>}
                          </>
                        ) : (
                          <span className="text-slate-800">{line.quantity}</span>
                        )}
                      </td>
                      {type === "OUT" && (
                        <td className={`px-5 py-2.5 align-top ${short ? "font-semibold text-rose-600" : "text-slate-600"}`}>
                          {editable
                            ? line.product_id && (free ?? 0)
                            : saved && `${saved.reserved_qty} / ${saved.quantity}`}
                          {short && editable && <span className="ml-1 text-xs">· not enough</span>}
                        </td>
                      )}
                      {editable && (
                        <td className="px-2 py-2.5 align-top">
                          <button
                            type="button"
                            aria-label={`Remove line ${i + 1}`}
                            onClick={() => setForm((prev) => ({ ...prev, lines: prev.lines.filter((l) => l.key !== line.key) }))}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {errors.lines && <p className="px-5 pt-3 text-xs font-medium text-rose-600">{errors.lines}</p>}
          {editable && (
            <div className="px-5 py-3 print:hidden">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, lines: [...prev.lines, newLine()] }))}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + Add a product
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
