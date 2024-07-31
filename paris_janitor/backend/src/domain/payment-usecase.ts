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
      metadata: { userId: userId.toString(),      payVip: 'true'
      },
    });

    return session.id;
  }

  async processReservationPayment(req: Request, res: Response): Promise<void> {
    try {
      const { amount, userId, clientId, reservationId  } = req.body; // Include reservationId

      // Log received values
      console.log('Received values:', { userId, clientId, amount, reservationId });

      // Validate and parse the input values
      const parsedUserId = parseInt(userId);
      const parsedClientId = parseInt(clientId);
      const parsedAmount = parseInt(amount);
      const parsedReservationId = reservationId ? parseInt(reservationId) : 0;



      if (isNaN(parsedUserId) || isNaN(parsedClientId) || isNaN(parsedAmount)) {
        console.error('Invalid values received:', { parsedUserId, parsedClientId, parsedAmount });
        res.status(400).json({ message: 'Invalid input values' });
        return;
      }

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Reservation',
              },
              unit_amount: parsedAmount * 100, // cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:5173/dashboard/client',
        cancel_url: 'http://localhost:5173/dashboard/client',
        metadata: {
          userId: parsedUserId.toString(),
          clientId: parsedClientId.toString(),
          amount: parsedAmount.toString(),
          reservationId: parsedReservationId.toString(),
        },
      });

      res.json({ id: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Error creating checkout session' });
    }
  }
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;
    const payload = req.body;
  
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
        const userId = parseInt(session.metadata.userId) || 0;
        const clientId = parseInt(session.metadata.clientId) || 0;
        const reservationId = session.metadata.reservationId ? parseInt(session.metadata.reservationId) : 0;
        const payVip = session.metadata.payVip === 'true' ? true : false;
  

      let amount = 0;

      //check membership or reservation
      if (payVip) {
        amount = 10; 
      } else {
        amount = parseInt(session.metadata.amount) || 0;
      }
          if (isNaN(userId)) {
            console.error('Invalid metadata values:', session.metadata);
            res.status(400).send('Invalid metadata values.');
            return;
          }
  
          const userRepo = this.db.getRepository(User);
          const invoiceRepo = this.db.getRepository(Invoice);
  
          const user = await userRepo.findOneBy({ id: userId });
          if (user) {
            user.vip_status = true;
            await userRepo.save(user);
  
            const invoice = new Invoice(amount, userId, new Date().toISOString(), reservationId, payVip);
            await invoiceRepo.save(invoice);
  
            console.log(`Invoice created for user ID ${userId} with amount ${amount}`);
          }
        
      }
    }
  
    res.status(200).end();
  }
}
