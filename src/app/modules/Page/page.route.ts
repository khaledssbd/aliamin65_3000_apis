import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PageController } from './page.controller';

const router = Router();

// 1. getPageBySlug
router.get('/slug/:slug', PageController.getPageBySlug);

// 2. getAllPages
router.get('/', auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), PageController.getAllPages);

// 3. createPage
router.post('/', auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), PageController.createPage);

// 4. updatePage
router.patch(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PageController.updatePage,
);

// 5. upsertPageBySlug
router.post(
  '/upsert',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PageController.upsertPageBySlug,
);

// 6. togglePagePublishStatus
router.patch(
  '/:id/toggle',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PageController.togglePagePublishStatus,
);

export const PageRoutes = router;
