import Stripe from "stripe";

export function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Missing STRIPE_SECRET_KEY in environement variables. ")

    return new Stripe(key, {
        apiVersion: "2026-01-28.clover" as any,

    });
}
