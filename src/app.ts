import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import routes from './app/routes';
import { globalErrorHandler, notFoundHandler } from './app/utils';
import os from 'os';
import config from './app/config';
import { PaymentController } from './app/modules/Payment/payment.controller';

const app: Application = express();

// app.disable('etag');

// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:5173',
      'http://10.10.20.30:3000',
      'http://10.10.20.30:3001',
      'http://10.10.20.30:3002',
      'http://10.10.20.30:3003',
      'http://10.10.20.30:5173',
      'http://10.10.20.30:5173',
    ],
  }),
);

//parser
app.use(cookieParser());
app.use(morgan('dev'));
app.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook,
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for static files
// app.use('/public', express.static('public'));

// All main routes
app.use('/api/v1', routes);

// Testing
// app.get('/', (req: Request, res: Response) => {
//   res.send({ message: 'Server is running like a Rabit!' });
// });

app.get('/', (req: Request, res: Response) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();
  res.send({
    success: true,
    message: `Welcome to ${config.preffered_website_name} Server`,
    version: '1.0.0',
    clientDetails: {
      ipAddress: clientIp,
      accessedAt: currentDateTime,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        (serverUptime / 60) % 60,
      )} minutes`,
    },
    developerContact: {
      name: 'Khaled Siddique',
      email: 'khaledssbd@gmail.com',
      website: 'https://khaled-siddique.vercel.app',
    },
  });
});

// global error handler
app.use(globalErrorHandler);

// all not found handler
app.use(notFoundHandler);

export default app;
