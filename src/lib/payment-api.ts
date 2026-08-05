const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type CheckoutResponse = {
  success: true;
  message: string;
  data: {
    paymentId: string;
    checkoutUrl: string;
  };
};

type FailedResponse = {
  success?: false;
  message?: string;
};

export const createStripeCheckout = async (courseId: string) => {
  const response = await fetch(`${API_URL}/api/payments/checkout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      courseId,
    }),
  });

  const result = (await response.json().catch(() => null)) as
    | CheckoutResponse
    | FailedResponse
    | null;

  if (!response.ok || !result || !result.success) {
    const error = new Error(
      result?.message ?? 'Unable to create Stripe Checkout session.'
    ) as Error & { status?: number };

    error.status = response.status;

    throw error;
  }

  return result.data;
};
