import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AdminController } from './admin.controller';

const router = Router();

// getDashboard
router.get(
  '/dashboard',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.getDashboard,
);

// getYearlyAppointmentStats
router.get(
  '/dashboard/yearly-appoiontment',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.getYearlyAppointmentStats,
);

// getYearlyRevenueStats
router.get(
  '/dashboard/yearly-revenue',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.getYearlyRevenueStats,
);

// getUsers
router.get(
  '/users',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.getUsers,
);

// toggleUserStatus
router.patch(
  '/users/:id/status',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.toggleUserStatus,
);

// updateDriverStatus
router.patch(
  '/drivers/:id/status',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.updateDriverStatus,
);

// updateDriverTier
router.patch(
  '/drivers/:id/tier',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.updateDriverTier,
);

// getBookings
router.get(
  '/get-all-bookings',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.getBookings,
);

// getPaymentHistories
router.get(
  '/payment-history/admin',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.getPaymentHistories,
);

export const AdminRoutes = router;
