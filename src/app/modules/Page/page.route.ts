import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PageController } from './page.controller';

const router = Router();

router.get('/slug/:slug', PageController.getBySlug);
router.get('/', auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), PageController.list);
router.post('/', auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), PageController.create);
router.patch('/:id', auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), PageController.update);
router.patch(
  '/:id/toggle',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PageController.toggle,
);

export const PageRoutes = router;
