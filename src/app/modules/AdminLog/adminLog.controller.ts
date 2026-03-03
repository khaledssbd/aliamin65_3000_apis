// import httpStatus from 'http-status';
// import { asyncHandler, sendResponse } from '../../utils';
// import { AdminLogService } from './adminLog.service';

// // 1. createAdminLog
// const createAdminLog = asyncHandler(async (req, res) => {
//   const result = await AdminLogService.createAdminLogIntoDB(req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     message: 'Admin log created successfully!',
//     data: result,
//   });
// });

// // 2. getAllAdminLogs
// const getAllAdminLogs = asyncHandler(async (req, res) => {
//   const result = await AdminLogService.getAllAdminLogsFromDB(req.query);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Admin logs fetched successfully!',
//     data: result.data,
//     meta: result.meta,
//   });
// });

// export const AdminLogController = {
//   createAdminLog,
//   getAllAdminLogs,
// };
