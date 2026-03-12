import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import { multerUpload } from '../../lib';
import { ROLE } from './user.constant';

const router = Router();

// 1. createUser
router
  .route('/signup')
  .post(
    validateRequest(UserValidation.createUserSchema),
    UserController.createUser,
  );

// 2. sendSignupOtpAgain
router
  .route('/send-signup-otp-again')
  .post(
    validateRequest(UserValidation.sendSignupOtpAgainSchema),
    UserController.sendSignupOtpAgain,
  );

// 3. verifySignupOtp
router
  .route('/verify-signup-otp')
  .post(
    validateRequest(UserValidation.verifySignupOtpSchema),
    UserController.verifySignupOtp,
  );

// 4. registerDriverSchema
router.route('/create-driver-profile').post(
  auth(ROLE.CUSTOMER),
  multerUpload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'insuranceDocument', maxCount: 1 },
  ]),
  validateRequestFromFormData(UserValidation.createDriverAccountSchema),
  UserController.createDriverProfile,
);

// 5. signin
router
  .route('/signin')
  .post(validateRequest(UserValidation.signinSchema), UserController.signin);

// 6. updateProfilePhoto
router
  .route('/update-profile-photo')
  .put(
    auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    multerUpload.single('user'),
    UserController.updateProfilePhoto,
  );

// 7. updateUserData
router
  .route('/update-user-data')
  .patch(
    auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.updateUserDataSchema),
    UserController.updateUserData,
  );

// 8. changePassword
router
  .route('/change-password')
  .patch(
    auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.changePasswordSchema),
    UserController.changePassword,
  );

// 9. forgotPassword
router
  .route('/forgot-password')
  .post(
    validateRequest(UserValidation.forgotPasswordSchema),
    UserController.forgotPassword,
  );

// 10. sendForgotPasswordOtpAgain
router
  .route('/send-forgot-password-otp-again')
  .post(
    validateRequest(UserValidation.sendForgotPasswordOtpAgainSchema),
    UserController.sendForgotPasswordOtpAgain,
  );

// 11. verifyOtpForForgotPassword
router
  .route('/verify-forgot-password-otp')
  .post(
    validateRequest(UserValidation.verifyOtpForForgotPasswordSchema),
    UserController.verifyOtpForForgotPassword,
  );

// 12. resetPassword
router
  .route('/reset-password')
  .post(
    validateRequest(UserValidation.resetPasswordSchema),
    UserController.resetPassword,
  );

// 13. fetchProfile
router
  .route('/profile')
  .get(
    auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    UserController.fetchProfile,
  );

// 14. getNewAccessToken
router.route('/access-token').get(
  // validateRequest(UserValidation.getNewAccessTokenSchema),
  UserController.getNewAccessToken,
);

// 15. deactivateUserAccount
router
  .route('/deactive-account')
  .patch(
    auth(ROLE.CUSTOMER, ROLE.DRIVER),
    validateRequest(UserValidation.deactivateUserAccountSchema),
    UserController.deactivateUserAccount,
  );

// 16. deleteSpecificUserAccount
router
  .route('/delete-account')
  .delete(
    auth(ROLE.CUSTOMER, ROLE.DRIVER),
    UserController.deleteSpecificUserAccount,
  );

// 17. adminGetAllUsers
router
  .route('/admin-get-all')
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), UserController.adminGetAllUsers);

// 18. adminGetAllMetaData
// router
//   .route('/meta-data')
//   .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), UserController.adminGetAllMetaData);

// 19. getAllUser
// router.route('/users').get(UserController.getAllUser);

export const UserRoutes = router;
