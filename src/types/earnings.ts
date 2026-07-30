// src/types/earnings.ts
export interface EarningsPeriod {
  period_start: string;
  period_end: string;
  batch_revenue_share: string;
  tuition_earnings: string;
  total_earnings: string;
  total_payouts_processed: string;
  pending_payout_amount: string;
}

export interface Payout {
  public_id: string;
  amount: string;
  status: "queued" | "processing" | "processed" | "failed";
  period_start: string;
  period_end: string;
  failure_reason: string;
  created_at: string;
}
