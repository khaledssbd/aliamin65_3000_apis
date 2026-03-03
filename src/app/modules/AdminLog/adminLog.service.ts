// import AdminLogModel from './adminLog.model';
// import { IAdminLog } from './adminLog.interface';
// import QueryBuilder from '../../builder/QueryBuilder';

// // 1. createAdminLog
// const createAdminLogIntoDB = async (payload: Partial<IAdminLog>) => {
//   const result = await AdminLogModel.create(payload);
//   return result;
// };

// // 2. getAllAdminLogs
// const getAllAdminLogsFromDB = async (query: Record<string, unknown>) => {
//   const adminLogQuery = new QueryBuilder(
//     AdminLogModel.find().populate('adminUser'),
//     query,
//   )
//     .search(['action', 'entityType'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await adminLogQuery.modelQuery;
//   const meta = await adminLogQuery.countTotal();

//   return {
//     meta,
//     data: result,
//   };
// };

// export const AdminLogService = {
//   createAdminLogIntoDB,
//   getAllAdminLogsFromDB,
// };
