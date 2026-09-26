export interface Product {
  id: number;
  sku: string;
  name: string;
  unit_cost: number;
  uom: string;
}

export interface StockLevel {
  product: Product;
  on_hand: number;
  free_to_use: number;
}
