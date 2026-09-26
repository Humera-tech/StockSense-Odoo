import { STATUS_LABEL } from "../../lib/status";
import type { OperationStatus } from "../../types/inventory";

const STATUS_STYLE: Record<OperationStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-200",
  WAITING: "bg-amber-50 text-amber-700 ring-amber-200",
  READY: "bg-teal-50 text-teal-700 ring-teal-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-600 ring-rose-200",
};

export default function StatusBadge({ status }: { status: OperationStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
