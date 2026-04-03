import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const PLANS = {
  pro: {
    name: "ParkPlan Pro",
    price: 2000, // $20.00
    interval: "year" as const,
    features: [
      "Unlimited trip saves",
      "AI-powered park recommendations",
      "Offline itinerary downloads",
      "Priority community features",
      "Permit alerts & reminders",
      "Ad-free experience",
    ],
  },
} as const;
