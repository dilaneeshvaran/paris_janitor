import { DataSource } from 'typeorm';
import { User } from '../database/entities/user';
import { Invoice } from '../database/entities/invoice';
import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export class PaymentUsecase {
  constructor(private readonly db: DataSource) {}

  async processMembershipPayment(userId: number): Promise<string> {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Membership',
            },
            unit_amount: 1000, // $10 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/dashboard/owner',
      metadata: { userId: userId.toString() },
    });

    return session.id;
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;
    const payload = req.body;

    console.log("Received Stripe webhook with signature:", sig);
    console.log("Stripe Endpoint Secret:", endpointSecret);

    if (!sig || !endpointSecret) {
      console.error('Missing stripe-signature or endpoint secret.');
      res.status(400).send('Webhook signature verification failed.');
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripeClient.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata) {
        const userId = parseInt(session.metadata.userId);
        const userRepo = this.db.getRepository(User);
        const invoiceRepo = this.db.getRepository(Invoice);

        const user = await userRepo.findOneBy({ id: userId });
        if (user) {
          user.vip_status = true;
          await userRepo.save(user);

          const invoice = new Invoice(
            session.amount_total ? session.amount_total / 100 : 0,
            userId,
            new Date().toISOString()
          );
          await invoiceRepo.save(invoice);
        }
      }
    }

    res.status(200).end();
  }
}
