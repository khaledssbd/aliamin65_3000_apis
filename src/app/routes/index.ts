import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { AddressRoutes } from '../modules/Address/address.route';
import { PricingRoutes } from '../modules/Pricing/pricing.route';
import { OrderRoutes } from '../modules/Order/order.route';
import { DriverRoutes } from '../modules/Driver/driver.route';
import { NotificationRoutes } from '../modules/Notification/notification.route';
import { ChatRoutes } from '../modules/Chat/chat.route';
import { EarningRoutes } from '../modules/Earning/earning.route';
import { InvoiceRoutes } from '../modules/Invoice/invoice.route';
import { DisputeRoutes } from '../modules/Dispute/dispute.route';
import { BackgroundCheckRoutes } from '../modules/BackgroundCheck/backgroundCheck.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { CardRoutes } from '../modules/Card/card.route';
import { PageRoutes } from '../modules/Page/page.route';
import { DispatchRoutes } from '../modules/Dispatch/dispatch.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/addresses',
    route: AddressRoutes,
  },
  {
    path: '/pricing',
    route: PricingRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/drivers',
    route: DriverRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/chat',
    route: ChatRoutes,
  },
  {
    path: '/earnings',
    route: EarningRoutes,
  },
  {
    path: '/invoices',
    route: InvoiceRoutes,
  },
  {
    path: '/disputes',
    route: DisputeRoutes,
  },
  {
    path: '/background-checks',
    route: BackgroundCheckRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/cards',
    route: CardRoutes,
  },
  {
    path: '/pages',
    route: PageRoutes,
  },
  {
    path: '/dispatch',
    route: DispatchRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
