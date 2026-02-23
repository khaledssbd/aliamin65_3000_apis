import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { CategoryRoutes } from '../modules/Category/category.routes';
import { BookRoutes } from '../modules/Book/book.routes';
import { OrderRoutes } from '../modules/Order/order.routes';
import { ReviewRoutes } from '../modules/Review/review.routes';
import { PageRoutes } from '../modules/Page/page.route';
import { AdminRoutes } from '../modules/Admin/admin.routes';
import { ContactRoutes } from '../modules/Contact/contact.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },

  {
    path: '/category',
    route: CategoryRoutes,
  },

  {
    path: '/book',
    route: BookRoutes,
  },

  {
    path: '/order',
    route: OrderRoutes,
  },
  {
    path: '/review',
    route: ReviewRoutes,
  },
  {
    path: '/page',
    route: PageRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
