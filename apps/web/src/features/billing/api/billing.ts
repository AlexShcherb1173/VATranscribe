import { apiClient } from "@/shared/api/client";
import type { BillingOverview } from "@/entities/billing/model/types";

export async function getBillingOverview(): Promise<BillingOverview> {
  try {
    const response = await apiClient.get<BillingOverview>("/billing/overview");
    return response.data;
  } catch {
    return {
      current_plan: {
        id: "plan_starter",
        code: "starter",
        name: "Starter",
        price_monthly: 0,
        currency: "USD",
        storage_bytes_limit: 10 * 1024 * 1024 * 1024,
        transcription_seconds_limit: 10 * 60 * 60,
        jobs_count_limit: 500,
        is_active: true,
      },
      available_plans: [
        {
          id: "plan_starter",
          code: "starter",
          name: "Starter",
          price_monthly: 0,
          currency: "USD",
          storage_bytes_limit: 10 * 1024 * 1024 * 1024,
          transcription_seconds_limit: 10 * 60 * 60,
          jobs_count_limit: 500,
          is_active: true,
        },
        {
          id: "plan_pro",
          code: "pro",
          name: "Pro",
          price_monthly: 19,
          currency: "USD",
          storage_bytes_limit: 100 * 1024 * 1024 * 1024,
          transcription_seconds_limit: 100 * 60 * 60,
          jobs_count_limit: 5000,
          is_active: true,
        },
        {
          id: "plan_team",
          code: "team",
          name: "Team",
          price_monthly: 79,
          currency: "USD",
          storage_bytes_limit: 500 * 1024 * 1024 * 1024,
          transcription_seconds_limit: 500 * 60 * 60,
          jobs_count_limit: 25000,
          is_active: true,
        },
      ],
      subscription: {
        id: "sub_demo",
        user_id: "demo_user",
        plan_id: "plan_starter",
        status: "active",
        started_at: new Date().toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        cancel_at_period_end: false,
      },
      usage_history: [
        {
          label: "Week 1",
          storage_bytes_used: 1.5 * 1024 * 1024 * 1024,
          transcription_seconds_used: 1800,
          jobs_count_used: 24,
        },
        {
          label: "Week 2",
          storage_bytes_used: 2.1 * 1024 * 1024 * 1024,
          transcription_seconds_used: 3200,
          jobs_count_used: 55,
        },
        {
          label: "Week 3",
          storage_bytes_used: 3.4 * 1024 * 1024 * 1024,
          transcription_seconds_used: 5100,
          jobs_count_used: 88,
        },
        {
          label: "Week 4",
          storage_bytes_used: 4.2 * 1024 * 1024 * 1024,
          transcription_seconds_used: 6400,
          jobs_count_used: 120,
        },
      ],
    };
  }
}

export async function upgradePlan(planCode: string): Promise<{ ok: true }> {
  try {
    await apiClient.post("/billing/upgrade", { plan_code: planCode });
  } catch {
    // mock fallback for now
  }

  return { ok: true };
}