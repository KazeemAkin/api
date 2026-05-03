import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export const createPaymentIntent = async (amount: number, currency = 'usd') => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
};

export default stripe;