import httpStatus from 'http-status';
import { AppError, asyncHandler } from '../../utils';
import { UserService } from './user.service';
// import { TProfileFileFields } from '../../types';
import { sendResponse } from '../../utils';
import { OTP_EXPIRY_MINUTES } from './user.constant';

// 1. createUser
const createUser = asyncHandler(async (req, res) => {
  const result = await UserService.createUserInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent successfully, verify your account in 5 minutes!',
    data: result,
  });
});

// 2. sendSignupOtpAgain
const sendSignupOtpAgain = asyncHandler(async (req, res) => {
  const userEmail = req.body.userEmail;
  const result = await UserService.sendSignupOtpAgain(userEmail);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: `OTP sent again successfully, verify in ${OTP_EXPIRY_MINUTES} minutes!`,
    data: result,
  });
});

// 3. verifySignupOtp
const verifySignupOtp = asyncHandler(async (req, res) => {
  const userEmail = req.body.userEmail;
  const otp = req.body.otp;
  const result = await UserService.verifySignupOtpInDB(userEmail, otp);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'OTP verified successfully!',
    data: result,
  });
});

// 4. signin
const signin = asyncHandler(async (req, res) => {
  const result = await UserService.signinInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Signin successful!',
    data: result,
  });
});

// 5. updateProfilePhoto
const updateProfilePhoto = asyncHandler(async (req, res) => {
  const result = await UserService.updateProfilePhotoInDB(req.user, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Photo updated successfully!',
    data: result,
  });
});

// 6. changePassword
const changePassword = asyncHandler(async (req, res) => {
  const result = await UserService.changePasswordInDB(req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully!',
    data: result,
  });
});

// 7. forgotPassword
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const result = await UserService.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message:
      'OTP sent to your email. Please check your spam or junk folder too!',
    data: result,
  });
});

// 8. sendForgotPasswordOtpAgain
const sendForgotPasswordOtpAgain = asyncHandler(async (req, res) => {
  const token = req.body.token;
  const result = await UserService.sendForgotPasswordOtpAgain(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent again. Please check your spam or junk folder too!',
    data: result,
  });
});

// 9. verifyOtpForForgotPassword
const verifyOtpForForgotPassword = asyncHandler(async (req, res) => {
  const result = await UserService.verifyOtpForForgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP verified successfully!',
    data: result,
  });
});

// 10. resetPassword
const resetPassword = asyncHandler(async (req, res) => {
  const result = await UserService.resetPasswordInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password has been reset successfully!',
    data: result,
  });
});

// 11. fetchProfile
const fetchProfile = asyncHandler(async (req, res) => {
  const result = await UserService.fetchProfileFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile data retrieved successfully!',
    data: result,
  });
});

// 12. deactivateUserAccount
const deactivateUserAccount = asyncHandler(async (req, res) => {
  const result = await UserService.deactivateUserAccountFromDB(
    req.user,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Account deactivated successfully!',
    data: result,
  });
});

// 13. deleteSpecificAccount
const deleteSpecificUserAccount = asyncHandler(async (req, res) => {
  const result = await UserService.deleteSpecificUserAccount(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Account deleted successfully!',
    data: result,
  });
});

// 14. getNewAccessToken
const getNewAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.headers.authorization?.replace('Bearer ', '');

  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token is required!');
  }
  const result = await UserService.getNewAccessTokenFromServer(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Access token given successfully!',
    data: result,
  });
});

// 15. updateUserData
const updateUserData = asyncHandler(async (req, res) => {
  const result = await UserService.updateUserDataInDB(req.body, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Data updated successfully!',
    data: result,
  });
});

// 16. adminGetAllUsers
const adminGetAllUsers = asyncHandler(async (req, res) => {
  const result = await UserService.adminGetAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// 17. adminGetAllMetaData
// const adminGetAllMetaData = asyncHandler(async (req, res) => {
//   const result = await UserService.adminGetAllMetaDataFromDB();

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Dashboard data retrieved successfully!',
//     data: result,
//   });
// });

// 18. getAllUser
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
  signin,
  updateProfilePhoto,
  changePassword,
  forgotPassword,
  sendForgotPasswordOtpAgain,
  verifyOtpForForgotPassword,
  resetPassword,
  fetchProfile,
  deactivateUserAccount,
  deleteSpecificUserAccount,
  getNewAccessToken,
  updateUserData,
  adminGetAllUsers,
  // adminGetAllMetaData,
  // getAllUser,
};
