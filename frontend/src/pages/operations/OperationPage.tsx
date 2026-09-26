import { useParams } from "react-router-dom";

import OperationForm from "../../components/operations/OperationForm";
import { Alert } from "../../components/ui";
import { flowType } from "../../lib/status";
import { useApi } from "../../lib/useApi";
import type { Operation } from "../../types/inventory";

export default function OperationPage({ type }: { type?: "IN" | "OUT" }) {
  const { id } = useParams();
  const opId = id ? Number(id) : null;
  const { data, error } = useApi<Operation>(opId ? `/operations/${opId}` : null);

  if (!opId) return <OperationForm key={`new-${type}`} type={type ?? "IN"} initial={null} />;

  const op = data?.id === opId ? data : undefined;
  if (error && !op) return <Alert>{error}</Alert>;
  if (!op) return <p className="text-sm text-slate-500">Loading…</p>;
  return <OperationForm key={op.id} type={flowType(op.type)} initial={op} />;
}
