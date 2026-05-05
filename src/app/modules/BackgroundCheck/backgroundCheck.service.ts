import { AppError } from '../../utils';
import { TBackgroundStatus } from '../Driver/driver.interface';
import DriverModel from '../Driver/driver.model';
import BackgroundCheckModel from './backgroundCheck.model';
import { dispatchProviderStatusCheck } from './backgroundCheck.util';
import httpStatus from 'http-status';
import config from '../../config';
import { TBackgroundProvider } from './backgroundCheck.interface';

// checkDriverBackgroundStatusIntoDB
const checkDriverBackgroundStatusIntoDB = async (id: string) => {
  const doc = await BackgroundCheckModel.findById(id);

  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Background check not found!');
  }

  if (!doc.reportId) {
    return doc;
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

// createBackgroundCheckForDriverInDB
const createBackgroundCheckForDriverInDB = async (driverId: string) => {
  const existingDriver = await DriverModel.findById(driverId);
  if (!existingDriver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Driver not found!');
  }

  const existing = await BackgroundCheckModel.findOne({
    driver: driverId,
  }).sort({
    createdAt: -1,
  });

  if (existing) return existing;

  const provider = config.status.default_background_provider || 'VERIFF';

  const doc = await BackgroundCheckModel.create({
    driver: driverId,
    provider: provider as TBackgroundProvider,
    status: 'PENDING',
    startedAt: new Date(),
  });

  await DriverModel.findByIdAndUpdate(driverId, {
    backgroundCheckStatus: 'PENDING',
  });

  return doc;
};

// syncDriverBackgroundStatusByDriverIdIntoDB
const syncDriverBackgroundStatusByDriverIdIntoDB = async (driverId: string) => {
  const doc = await BackgroundCheckModel.findOne({ driver: driverId }).sort({
    createdAt: -1,
  });

  if (!doc) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Background check not found for this driver!',
    );
  }

  if (!doc.reportId) {
    return doc;
  }

  const providerResult = await dispatchProviderStatusCheck(
    doc.provider,
    doc.reportId,
  );

  doc.status = providerResult.status as TBackgroundStatus;
  doc.completedAt =
    providerResult.status !== 'PENDING' ? new Date() : undefined;
  await doc.save();

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
  createBackgroundCheckForDriverInDB,
  syncDriverBackgroundStatusByDriverIdIntoDB,
  getDriverBackgroundDataByHisDriverIdFromDB,
  getDriverBackgroundDataByHisUserIdFromDB,
};
