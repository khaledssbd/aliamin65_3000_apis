import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
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
    UserController.createUser
  );

// 2. sendSignupOtpAgain
router
  .route('/send-signup-otp-again')
  .post(
    validateRequest(UserValidation.sendSignupOtpAgainSchema),
    UserController.sendSignupOtpAgain
  );

// 3. verifySignupOtp
router
  .route('/verify-signup-otp')
  .post(
    validateRequest(UserValidation.verifySignupOtpSchema),
    UserController.verifySignupOtp
  );

// 4. signin
router
  .route('/signin')
  .post(validateRequest(UserValidation.signinSchema), UserController.signin);

// 5. updateProfilePhoto
router
  .route('/update-profile-photo')
  .put(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    multerUpload.single('user'),
    UserController.updateProfilePhoto
  );

// 6. changePassword
router
  .route('/change-password')
  .patch(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.changePasswordSchema),
    UserController.changePassword
  );

// 7. forgotPassword
router
  .route('/forgot-password')
  .post(
    validateRequest(UserValidation.forgotPasswordSchema),
    UserController.forgotPassword
  );

// 8. sendForgotPasswordOtpAgain
router
  .route('/send-forgot-password-otp-again')
  .post(
    validateRequest(UserValidation.sendForgotPasswordOtpAgainSchema),
    UserController.sendForgotPasswordOtpAgain
  );

// 9. verifyOtpForForgotPassword
router
  .route('/verify-forgot-password-otp')
  .post(
    validateRequest(UserValidation.verifyOtpForForgotPasswordSchema),
    UserController.verifyOtpForForgotPassword
  );

// 10. resetPassword
router
  .route('/reset-password')
  .post(
    validateRequest(UserValidation.resetPasswordSchema),
    UserController.resetPassword
  );

// 11. fetchProfile
router
  .route('/profile')
  .get(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    UserController.fetchProfile
  );

// 12. deactivateUserAccount
router
  .route('/deactive-account')
  .patch(
    auth(ROLE.USER),
    validateRequest(UserValidation.deactivateUserAccountSchema),
    UserController.deactivateUserAccount
  );

// 13. deleteSpecificUserAccount
router
  .route('/delete-account')
  .delete(auth(ROLE.USER), UserController.deleteSpecificUserAccount);

// 14. getNewAccessToken
router.route('/access-token').get(
  // validateRequest(UserValidation.getNewAccessTokenSchema),
  UserController.getNewAccessToken
);

// 15. updateUserData
router
  .route('/update-user-data')
  .patch(
    auth(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
    validateRequest(UserValidation.updateUserDataSchema),
    UserController.updateUserData
  );

// 16. adminGetAllUsers
router
  .route('/admin-get-all')
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), UserController.adminGetAllUsers);

// 17. adminGetAllMetaData
router
  .route('/meta-data')
  .get(auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), UserController.adminGetAllMetaData);

// 18. getAllUser
router.route('/users').get(UserController.getAllUser);

export const UserRoutes = router;
