import 'dotenv/config';
import express from 'express';
import { initUserRoutes } from './handlers/routes/user-routes';
import { initInvoiceRoutes } from './handlers/routes/invoice-routes';
import { initPropertyRoutes } from './handlers/routes/property-routes';
import { initReservationRoutes } from './handlers/routes/reservation-routes';
import { initAvailabilityRoutes } from './handlers/routes/availability-routes';
import { initPaymentRoutes } from './handlers/routes/payment-routes';
import { initInterventionRoutes } from './handlers/routes/intervention-routes';
import { initServiceRoutes } from './handlers/routes/service-routes';
import { initSimulationRoutes } from './handlers/routes/simulation-routes';
import { initProviderRoutes } from './handlers/routes/provider-routes';
import { AppDataSource } from './database/database';
import './services/EmailScheduler';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

//verify if request is for stripe webhook
const isStripeWebhook = (req: express.Request): boolean => req.originalUrl === '/api/payment/webhook';

const main = async () => {
  const app = express();
  app.use(cors());

  const port = 3000;

  try {
    await AppDataSource.initialize();
    console.log('Successfully connected to database');
  } catch (error) {
    console.error('Cannot contact database', error);
    process.exit(1);
  }

  //body parser
  app.use((req, res, next) => {
    if (isStripeWebhook(req)) {
      next();
    } else {
      bodyParser.json()(req, res, next);
    }
  });

  //multer storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 } //5mb limit
  });

  //file serve
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  //file upload
  app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    try {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      res.send({ imageUrl });
    } catch (error) {
      console.error('Error processing file upload:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  });

  initUserRoutes(app);
  initInvoiceRoutes(app);
  initPropertyRoutes(app);
  initReservationRoutes(app);
  initAvailabilityRoutes(app);
  initPaymentRoutes(app);
  initInterventionRoutes(app);
  initServiceRoutes(app);
  initSimulationRoutes(app);
  initProviderRoutes(app);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

main();
