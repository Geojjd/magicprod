export type PlanName = "free" | "starter" | "pro";

export const PLANS: Record<PlanName, {
    stemExportAllowed: any;
    exportsPerMonth: number;
    aiGenerationsPerMonth: number;
    name: string;
    monthlyPrice: number;
}> = {
    free: {
        name: "Free",
        monthlyPrice: 0,

    },
    starter: {
        name: "Starter",
        monthlyPrice: 29,
    },
    pro: {
        name: "Pro",
        monthlyPrice: 29,
    }
};