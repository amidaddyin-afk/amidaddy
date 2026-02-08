import Stripe from "stripe";
import asyncHandler from "../utils/asyncHandler.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20"
});

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = "inr" } = req.body;
  if (!amount) {
    return res.status(400).json({ message: "Amount required" });
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true }
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});
