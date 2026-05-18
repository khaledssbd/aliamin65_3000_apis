import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { ROLE } from '../User/user.constant';
import { AdminService } from './admin.service';

// getDashboard
const getDashboard = asyncHandler(async (_req, res) => {
  const result = await AdminService.getDashboardFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dashboard data fetched successfully!',
    data: result,
  });
});

// getYearlyAppointmentStats
const getYearlyAppointmentStats = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const result = await AdminService.getYearlyAppointmentStatsFromDB(year);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Appointment stats fetched successfully!',
    data: result,
  });
});

// getYearlyRevenueStats
const getYearlyRevenueStats = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const result = await AdminService.getYearlyRevenueStatsFromDB(year);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Revenue stats fetched successfully!',
    data: result,
  });
});

// getUsers
const getUsers = asyncHandler(async (req, res) => {
  const role = String(req.query.role ?? '').toUpperCase();
  if (role !== ROLE.CUSTOMER && role !== ROLE.DRIVER) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Invalid role provided!',
      data: null,
    });
  }

  const result = await AdminService.getUsersByRoleFromDB(
    req.query,
    role as typeof ROLE.CUSTOMER | typeof ROLE.DRIVER,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users fetched successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// toggleUserStatus
const toggleUserStatus = asyncHandler(async (req, res) => {
  const result = await AdminService.toggleUserStatusIntoDB(
    String(req.params.id),
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'User not found!',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User status updated successfully!',
    data: result,
  });
});

// updateDriverStatus
const updateDriverStatus = asyncHandler(async (req, res) => {
  const status = String(req.body?.status ?? '').toUpperCase();
  const result = await AdminService.updateDriverStatusIntoDB(
    String(req.params.id),
    status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Driver profile not found or invalid status provided!',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver application status updated successfully!',
    data: result,
  });
});

// updateDriverTier
const updateDriverTier = asyncHandler(async (req, res) => {
  const reputationTier = Number(req.body?.reputationTier);
  const result = await AdminService.updateDriverTierIntoDB(
    String(req.params.id),
    reputationTier,
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Driver profile not found or invalid tier provided!',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver tier updated successfully!',
    data: result,
  });
});

// getBookings
const getBookings = asyncHandler(async (req, res) => {
  const result = await AdminService.getBookingsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Bookings fetched successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// getPaymentHistories
const getPaymentHistories = asyncHandler(async (req, res) => {
  const result = await AdminService.getPaymentHistoriesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment histories fetched successfully!',
    data: result.data,
    meta: result.meta,
  });
});

export const AdminController = {
  getDashboard,
  getYearlyAppointmentStats,
  getYearlyRevenueStats,
  getUsers,
  toggleUserStatus,
  updateDriverStatus,
  updateDriverTier,
  getBookings,
  getPaymentHistories,
};
