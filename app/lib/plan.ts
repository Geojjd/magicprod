export type PlanName = "free" | "starter" | "pro";

export const PLANS: Record<
  PlanName,
  {
    stemExportAllowed: boolean;
    exportsPerMonth: number;
    aiGenerationsPerMonth: number;
    name: string;
    monthlyPrice: number;
  }
> = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    stemExportAllowed: false,
    exportsPerMonth: 5,
    aiGenerationsPerMonth: 10,
  },

  starter: {
    name: "Starter",
    monthlyPrice: 29,
    stemExportAllowed: true,
    exportsPerMonth: 50,
    aiGenerationsPerMonth: 200,
  },

  pro: {
    name: "Pro",
    monthlyPrice: 49,
    stemExportAllowed: true,
    exportsPerMonth: 500,
    aiGenerationsPerMonth: 2000,
  },
};