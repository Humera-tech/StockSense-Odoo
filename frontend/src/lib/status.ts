import type { OperationStatus, OperationType } from "../types/inventory";

export const STATUS_LABEL: Record<OperationStatus, string> = {
  DRAFT: "Draft",
  WAITING: "Waiting",
  READY: "Ready",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const STATUS_FLOW: Record<"IN" | "OUT", OperationStatus[]> = {
  IN: ["DRAFT", "READY", "DONE"],
  OUT: ["DRAFT", "WAITING", "READY", "DONE"],
};

export const KANBAN_COLUMNS: Record<"IN" | "OUT", OperationStatus[]> = {
  IN: ["DRAFT", "READY", "DONE", "CANCELLED"],
  OUT: ["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"],
};

export const TYPE_COPY: Record<"IN" | "OUT", { title: string; singular: string; listPath: string; contactLabel: string }> = {
  IN: { title: "Receipts", singular: "Receipt", listPath: "/receipts", contactLabel: "Receive from" },
  OUT: { title: "Deliveries", singular: "Delivery", listPath: "/deliveries", contactLabel: "Deliver to" },
};

export function flowType(type: OperationType): "IN" | "OUT" {
  return type === "OUT" ? "OUT" : "IN";
}
