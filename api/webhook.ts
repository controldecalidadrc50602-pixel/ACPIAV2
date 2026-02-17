
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        // Assuming priceId maps to a tier or we check the amount/product
        // In a real app, you'd map price_id to plan tier.
        // verification: session.line_items? or session.amount_total

        // For MVP, we'll assume any payment is for 'STANDARD' or higher based on logic
        // But better to look at what was bought.
        const plan = 'STANDARD'; // Simplified for MVP

        if (userId) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            await supabase.auth.admin.updateUserById(userId, {
                user_metadata: { subscriptionTier: plan }
            });

            // Also update public profile if exists
            // await supabase.from('profiles').update({ subscription_tier: plan }).eq('id', userId);
        }
    }

    res.json({ received: true });
}
