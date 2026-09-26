import type { Contact, ContactKind, Location, Operation, OperationPayload, Warehouse } from "../types/inventory";
import type { Product } from "../types/product";
import { api } from "./api";

type WarehouseInput = Pick<Warehouse, "name" | "short_code" | "address">;
type LocationInput = Pick<Location, "name" | "short_code" | "warehouse_id">;
type ProductInput = Omit<Product, "id">;

export const inventoryService = {
  createWarehouse: (body: WarehouseInput) => api<Warehouse>("/warehouses", { method: "POST", body }),
  updateWarehouse: (id: number, body: WarehouseInput) => api<Warehouse>(`/warehouses/${id}`, { method: "PUT", body }),
  deleteWarehouse: (id: number) => api<void>(`/warehouses/${id}`, { method: "DELETE" }),

  createLocation: (body: LocationInput) => api<Location>("/locations", { method: "POST", body }),
  updateLocation: (id: number, body: LocationInput) => api<Location>(`/locations/${id}`, { method: "PUT", body }),
  deleteLocation: (id: number) => api<void>(`/locations/${id}`, { method: "DELETE" }),

  createProduct: (body: ProductInput) => api<Product>("/products", { method: "POST", body }),

  createContact: (body: { name: string; kind: ContactKind; address: string | null }) =>
    api<Contact>("/contacts", { method: "POST", body }),

  getOperation: (id: number) => api<Operation>(`/operations/${id}`),
  createOperation: (body: OperationPayload) => api<Operation>("/operations", { method: "POST", body }),
  updateOperation: (id: number, body: OperationPayload) => api<Operation>(`/operations/${id}`, { method: "PUT", body }),
  operationAction: (id: number, action: "todo" | "validate" | "cancel") =>
    api<Operation>(`/operations/${id}/${action}`, { method: "POST" }),
};
