/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Plans
export interface PlanBand {
  fromMonth: number;
  toMonth: number;
  monthlyRate: number; // 0.04 => 4%
}

export interface PlanRule {
  _id: string;
  name: string;
  minAmount: number;
  specialMin: number;
  bands: PlanBand[];
  specialRate: number;
  adminCharge: number;
  booster: number;
  active: boolean;
  version: number;
  effectiveFrom: string;
}

// Payout simulation
export interface PayoutSimulateRequest {
  amount: number;
  month: number;
  boosterApplied?: boolean;
}

export interface PayoutSimulateResponse {
  principal: number;
  month: number;
  grossMonthly: number;
  adminCharge: number;
  booster: number;
  netPayout: number;
  rates: { adminCharge: number; booster: number };
}
