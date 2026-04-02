/**
 * Shared domain types used across server components and API routes.
 */

export type DeliveryStatus = "delivered" | "not_delivered" | "skipped";

export interface PricingRow {
  id: string;
  product_type: "milk" | "curd";
  price_per_liter: number;
  is_active: boolean;
}

export interface DeliveryRecord {
  id?: string;
  customerId: string;
  milkQuantity: number;
  extraMilkQuantity: number;
  curdQuantity: number;
  extraCurdQuantity: number;
  status: DeliveryStatus;
  notes?: string;
}
