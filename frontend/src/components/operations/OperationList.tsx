import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { formatDate } from "../../lib/format";
import { KANBAN_COLUMNS, STATUS_LABEL, TYPE_COPY } from "../../lib/status";
import { useApi } from "../../lib/useApi";
import { withQuery } from "../../services/api";
import type { Operation, OperationStatus } from "../../types/inventory";
import { Alert, EmptyState, PageHeader } from "../ui";
import StatusBadge from "./StatusBadge";

function withParam(prev: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(prev);
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}

export default function OperationList({ type }: { type: "IN" | "OUT" }) {
  const copy = TYPE_COPY[type];
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "kanban" ? "kanban" : "list";
  const status = params.get("status") ?? "";
  const late = params.get("late") === "1";
  const q = params.get("q") ?? "";
  const [search, setSearch] = useState(q);

  const updateParam = (key: string, value: string) => setParams((prev) => withParam(prev, key, value), { replace: true });

  useEffect(() => {
    const value = search.trim();
    if (value === q) return;
    const timer = setTimeout(() => setParams((prev) => withParam(prev, "q", value), { replace: true }), 300);
    return () => clearTimeout(timer);
  }, [search, q, setParams]);

  const { data: operations, error, loading } = useApi<Operation[]>(
    withQuery("/operations", { type, status, q, late: late || undefined }),
  );

  const statuses = KANBAN_COLUMNS[type];

  return (
    <div>
      <PageHeader
        title={copy.title}
        subtitle={late ? "Showing late operations only" : undefined}
        actions={
          <Link to={`${copy.listPath}/new`} className="btn btn-primary">
            + New {copy.singular.toLowerCase()}
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference or contact…"
          aria-label="Search"
          className="input sm:max-w-sm"
        />
        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          aria-label="Filter by status"
          className="input sm:w-44"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        {late && (
          <button type="button" onClick={() => updateParam("late", "")} className="btn btn-secondary">
            Clear late filter
          </button>
        )}
        <div className="flex rounded-xl border border-line bg-surface p-1 sm:ml-auto">
          {(["list", "kanban"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => updateParam("view", mode === "list" ? "" : mode)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                view === mode ? "bg-brand text-white" : "text-muted hover:bg-subtle"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {view === "list" ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-subtle text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Schedule date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {operations?.map((op) => (
                  <tr
                    key={op.id}
                    onClick={() => navigate(`/operations/${op.id}`)}
                    className="cursor-pointer transition hover:bg-subtle"
                  >
                    <td className="px-4 py-3 font-semibold text-brand">
                      <Link to={`/operations/${op.id}`} onClick={(e) => e.stopPropagation()}>
                        {op.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{op.src_location.full_code}</td>
                    <td className="px-4 py-3 text-muted">{op.dest_location.full_code}</td>
                    <td className="px-4 py-3 text-ink/80">{op.contact?.name ?? "—"}</td>
                    <td className={`px-4 py-3 ${op.is_late ? "font-semibold text-rose-600" : "text-muted"}`}>
                      {formatDate(op.scheduled_date)}
                      {op.is_late && <span className="ml-2 text-xs">Late</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={op.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && operations?.length === 0 && <EmptyState>No {copy.title.toLowerCase()} found.</EmptyState>}
          {loading && !operations && <EmptyState>Loading…</EmptyState>}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {statuses
            .filter((s) => !status || s === status)
            .map((column: OperationStatus) => {
              const cards = operations?.filter((op) => op.status === column) ?? [];
              return (
                <section key={column} className="w-72 shrink-0 rounded-2xl bg-subtle p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <StatusBadge status={column} />
                    <span className="text-xs font-semibold text-muted">{cards.length}</span>
                  </div>
                  <div className="space-y-2">
                    {cards.map((op) => (
                      <Link
                        key={op.id}
                        to={`/operations/${op.id}`}
                        className="block rounded-xl border border-line bg-surface p-3 shadow-sm transition hover:border-brand/40"
                      >
                        <p className="text-sm font-semibold text-ink">{op.reference}</p>
                        <p className="mt-1 text-sm text-muted">{op.contact?.name ?? "—"}</p>
                        <p className={`mt-2 text-xs ${op.is_late ? "font-semibold text-rose-600" : "text-muted"}`}>
                          {formatDate(op.scheduled_date)}
                          {op.is_late && " · Late"}
                        </p>
                      </Link>
                    ))}
                    {cards.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted/70">Nothing here</p>}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
