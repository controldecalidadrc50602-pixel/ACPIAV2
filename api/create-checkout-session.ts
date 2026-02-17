
import Stripe from 'stripe';

export const config = {
    runtime: 'edge',
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json();

        if (!priceId || !userId) {
            return new Response('Missing required parameters', { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: userEmail,
            metadata: {
                userId,
            },
            subscription_data: {
                metadata: {
                    userId,
                },
            },
        });

        return new Response(JSON.stringify({ sessionId: session.id }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
