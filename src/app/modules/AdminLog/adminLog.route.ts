// import { Router } from 'express';
// import { AdminLogController } from './adminLog.controller';
// import { AdminLogValidation } from './adminLog.validation';
// import { validateRequest } from '../../middlewares';
// import auth from '../../middlewares/auth';
// import { ROLE } from '../User/user.constant';

// const router = Router();

// // 1. createAdminLog
// router.post(
//   '/',
//   auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
//   validateRequest(AdminLogValidation.createAdminLogSchema),
//   AdminLogController.createAdminLog,
// );

// // 2. getAllAdminLogs
// router.get(
//   '/',
//   auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
//   AdminLogController.getAllAdminLogs,
// );

// export const AdminLogRoutes = router;
