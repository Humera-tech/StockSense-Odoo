import type { User } from "./auth";
import type { Product } from "./product";

export type OperationType = "IN" | "OUT" | "ADJ";
export type OperationStatus = "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELLED";
export type LocationType = "INTERNAL" | "VENDOR" | "CUSTOMER" | "ADJUSTMENT";
export type ContactKind = "VENDOR" | "CUSTOMER";

export interface Warehouse {
  id: number;
  name: string;
  short_code: string;
  address: string | null;
}

export interface Location {
  id: number;
  name: string;
  short_code: string;
  warehouse_id: number;
  type: LocationType;
  full_code: string;
}

export interface Contact {
  id: number;
  name: string;
  kind: ContactKind;
  address: string | null;
}

export interface OperationLine {
  id: number;
  product: Product;
  quantity: number;
  reserved_qty: number;
}

export interface Operation {
  id: number;
  reference: string;
  type: OperationType;
  status: OperationStatus;
  warehouse_id: number;
  contact: Contact | null;
  src_location: Location;
  dest_location: Location;
  scheduled_date: string;
  responsible: User;
  done_at: string | null;
  is_late: boolean;
  lines: OperationLine[];
}

export interface OperationPayload {
  type?: OperationType;
  warehouse_id?: number;
  contact_id: number | null;
  scheduled_date: string;
  src_location_id?: number | null;
  dest_location_id?: number | null;
  lines: { product_id: number; quantity: number }[];
}
