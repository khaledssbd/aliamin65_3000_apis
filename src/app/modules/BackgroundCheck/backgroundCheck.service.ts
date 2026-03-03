import { AppError } from '../../utils';
import { TBackgroundStatus } from '../Driver/driver.interface';
import DriverModel from '../Driver/driver.model';
import BackgroundCheckModel from './backgroundCheck.model';
import { dispatchProviderStatusCheck } from './backgroundCheck.util';
import httpStatus from 'http-status';

// checkDriverBackgroundStatusIntoDB
const checkDriverBackgroundStatusIntoDB = async (id: string) => {
  const doc = await BackgroundCheckModel.findById(id);

  if (!doc || !doc.reportId) {
    throw new AppError(httpStatus.NOT_FOUND, 'Background check not found!');
  }

  const providerResult = await dispatchProviderStatusCheck(
    doc.provider,
    doc.reportId,
  );

  doc.status = providerResult.status as TBackgroundStatus;
  doc.completedAt =
    providerResult.status !== 'PENDING' ? new Date() : undefined;

  await doc.save();

  // driver status auto update
  await DriverModel.findByIdAndUpdate(doc.driver, {
    backgroundCheckStatus: doc.status,
  });

  return doc;
};

// getDriverBackgroundDataByHisDriverIdFromDB
const getDriverBackgroundDataByHisDriverIdFromDB = async (driverId: string) => {
  return BackgroundCheckModel.findOne({ driver: driverId }).sort({
    createdAt: -1,
  });
};

// getDriverBackgroundDataByHisUserIdFromDB
const getDriverBackgroundDataByHisUserIdFromDB = async (id: string) => {
  return BackgroundCheckModel.findById(id);
};

export const BackgroundCheckService = {
  checkDriverBackgroundStatusIntoDB,
  getDriverBackgroundDataByHisDriverIdFromDB,
  getDriverBackgroundDataByHisUserIdFromDB,
};
