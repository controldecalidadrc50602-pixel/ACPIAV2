
// Mock Payment Service (Stripe Simulation)

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'processing' | 'requires_payment_method';
}

export const createPaymentIntent = async (amount: number, currency: string = 'usd'): Promise<PaymentIntent> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency,
        status: 'requires_payment_method'
    };
};

export const confirmPayment = async (paymentIntentId: string, paymentMethodId: string): Promise<{ success: boolean, error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
        return { success: false, error: 'Targeta rechazada (Simulación)' };
    }

    return { success: true };
};
