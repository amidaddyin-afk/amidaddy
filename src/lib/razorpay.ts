export type RazorpayPaymentEvent = {
  orderId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
};

export function isMatchingCapturedPayment(
  payment: RazorpayPaymentEvent,
  expectedOrderId: string,
  expectedAmountPaise: number,
) {
  return (
    payment.orderId === expectedOrderId &&
    payment.amount === expectedAmountPaise &&
    payment.currency === "INR" &&
    payment.status === "captured"
  );
}
