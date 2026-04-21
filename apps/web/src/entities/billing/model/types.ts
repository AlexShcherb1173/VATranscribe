export type BillingPlan = {
  id: string;
  code: string;
  name: string;
  price_monthly: number;
  currency: string;
  storage_bytes_limit: number;
  transcription_seconds_limit: number;
  jobs_count_limit: number;
  is_active: boolean;
};

export type BillingSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
};

export type UsageHistoryPoint = {
  label: string;
  storage_bytes_used: number;
  transcription_seconds_used: number;
  jobs_count_used: number;
};

export type BillingOverview = {
  current_plan: BillingPlan;
  available_plans: BillingPlan[];
  subscription: BillingSubscription;
  usage_history: UsageHistoryPoint[];
};