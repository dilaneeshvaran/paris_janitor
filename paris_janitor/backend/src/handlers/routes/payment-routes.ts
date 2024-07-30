import express from 'express';
import { PaymentUsecase } from '../../domain/payment-usecase';
import { AppDataSource } from '../../database/database';

const paymentRouter = express.Router();
const paymentUsecase = new PaymentUsecase(AppDataSource);

paymentRouter.post('/membership', async (req, res) => {
  try {
    const { userId } = req.body;
    const sessionId = await paymentUsecase.processMembershipPayment(userId);
    res.json({ id: sessionId });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
});

paymentRouter.post('/reservation', async (req, res) => {
  try {
    await paymentUsecase.processReservationPayment(req, res);
  } catch (error) {
    console.error('Error creating reservation payment session:', error);
    res.status(500).json({ message: 'Error creating reservation payment session' });
  }
});

// Use raw body parser for Stripe webhook endpoint
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    await paymentUsecase.handleWebhook(req, res);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export const initPaymentRoutes = (app: express.Application) => {
  app.use('/api/payment', paymentRouter);
};
