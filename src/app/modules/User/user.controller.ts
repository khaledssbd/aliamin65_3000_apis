import httpStatus from 'http-status';
import { AppError, asyncHandler } from '../../utils';
import { UserService } from './user.service';
import { sendResponse } from '../../utils';
import { otpExpiryMinutes } from './user.constant';

// 1. createUser
const createUser = asyncHandler(async (req, res) => {
  const result = await UserService.createUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent successfully, verify your account in 5 minutes!',
    data: result,
  });
});

// 2. sendSignupOtpAgain
const sendSignupOtpAgain = asyncHandler(async (req, res) => {
  const userEmail = req.body.userEmail;
  const result = await UserService.sendSignupOtpAgainIntoDB(userEmail);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: `OTP sent again successfully, verify in ${otpExpiryMinutes} minutes!`,
    data: result,
  });
});

// 3. verifySignupOtp
const verifySignupOtp = asyncHandler(async (req, res) => {
  const userEmail = req.body.userEmail;
  const otp = req.body.otp;
  const result = await UserService.verifySignupOtpIntoDB(userEmail, otp);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'OTP verified successfully!',
    data: result,
  });
});

// 4. createDriverProfile
const createDriverProfile = asyncHandler(async (req, res) => {
  const result = await UserService.createDriverProfileIntoDB(
    req.user,
    req.body,
    req.files,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver account created successfully!',
    data: result,
  });
});

// 5. signin
const signin = asyncHandler(async (req, res) => {
  const result = await UserService.signinIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Signin successful!',
    data: result,
  });
});

// 6. updateProfilePhoto
const updateProfilePhoto = asyncHandler(async (req, res) => {
  const result = await UserService.updateProfilePhotoIntoDB(req.user, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Photo updated successfully!',
    data: result,
  });
});

// 7. updateUserData
const updateUserData = asyncHandler(async (req, res) => {
  const result = await UserService.updateUserDataIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Data updated successfully!',
    data: result,
  });
});

// 8. changePassword
const changePassword = asyncHandler(async (req, res) => {
  const result = await UserService.changePasswordIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully!',
    data: result,
  });
});

// 9. forgotPassword
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const result = await UserService.forgotPasswordIntoDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message:
      'OTP sent to your email. Please check your spam or junk folder too!',
    data: result,
  });
});

// 10. sendForgotPasswordOtpAgain
const sendForgotPasswordOtpAgain = asyncHandler(async (req, res) => {
  const token = req.body.token;
  const result = await UserService.sendForgotPasswordOtpAgainIntoDB(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent again. Please check your spam or junk folder too!',
    data: result,
  });
});

// 11. verifyOtpForForgotPassword
const verifyOtpForForgotPassword = asyncHandler(async (req, res) => {
  const result = await UserService.verifyOtpForForgotPasswordIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP verified successfully!',
    data: result,
  });
});

// 12. resetPassword
const resetPassword = asyncHandler(async (req, res) => {
  const result = await UserService.resetPasswordIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password has been reset successfully!',
    data: result,
  });
});

// 13. fetchProfile
const fetchProfile = asyncHandler(async (req, res) => {
  const result = await UserService.fetchProfileFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile data retrieved successfully!',
    data: result,
  });
});

// 14. getNewAccessToken
const getNewAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.headers.authorization?.replace('Bearer ', '');

  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token is required!');
  }

  const result = await UserService.getNewAccessTokenFromDB(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Access token fetched successfully!',
    data: result,
  });
});

// 15. deactivateUserAccount
const deactivateUserAccount = asyncHandler(async (req, res) => {
  const result = await UserService.deactivateAccountIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Account deactivated successfully!',
    data: result,
  });
});

// 16. deleteSpecificAccount
const deleteSpecificUserAccount = asyncHandler(async (req, res) => {
  const result = await UserService.deleteSpecificUserAccountIntoDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Account deleted successfully!',
    data: result,
  });
});

// 17. adminGetAllUsers
const adminGetAllUsers = asyncHandler(async (req, res) => {
  const result = await UserService.adminGetAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users fetched successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// 18. adminGetAllMetaData
// const adminGetAllMetaData = asyncHandler(async (req, res) => {
//   const result = await UserService.adminGetAllMetaDataFromDB();

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Dashboard data retrieved successfully!',
//     data: result,
//   });
// });

// 19. getAllUser
// const getAllUser = asyncHandler(async (req, res) => {
//   const result = await UserService.getAllUserFromDB(req.query);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Users retrieved successfully!',
//     data: result.data,
//     meta: result.meta,
//   });
// });

export const UserController = {
  createUser,
  sendSignupOtpAgain,
  verifySignupOtp,
  createDriverProfile,
  signin,
  updateProfilePhoto,
  updateUserData,
  changePassword,
  forgotPassword,
  sendForgotPasswordOtpAgain,
  verifyOtpForForgotPassword,
  resetPassword,
  fetchProfile,
  getNewAccessToken,
  deactivateUserAccount,
  deleteSpecificUserAccount,
  adminGetAllUsers,
  // adminGetAllMetaData,
  // getAllUser,
};
