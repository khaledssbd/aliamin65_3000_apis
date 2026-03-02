import BackgroundCheckModel from './backgroundCheck.model';

const start = async (payload: {
  driverId: string;
  provider: 'CHECKR' | 'KARMACHECK' | 'STERLING' | 'VERIFF';
}) => {
  return BackgroundCheckModel.create({
    driver: payload.driverId,
    provider: payload.provider,
    status: 'PENDING',
    startedAt: new Date(),
  });
};

const byDriver = async (driverId: string) => {
  return BackgroundCheckModel.findOne({ driver: driverId }).sort({
    createdAt: -1,
  });
};

const getById = async (id: string) => {
  return BackgroundCheckModel.findById(id);
};

export const BackgroundCheckService = {
  start,
  byDriver,
  getById,
};
