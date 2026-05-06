import { IZone } from './zone.interface';
import ZoneModel from './zone.model';

// 1. createZone
const createZoneIntoDB = async (payload: Partial<IZone>) => {
  const result = await ZoneModel.create(payload);
  return result;
};

// 2. getAllZones
const getAllZonesFromDB = async () => {
  const result = await ZoneModel.find();
  return result;
};

// 3. updateZone
const updateZoneIntoDB = async (id: string, payload: Partial<IZone>) => {
  const result = await ZoneModel.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
  });
  return result;
};

// 4. toggleZoneStatus
const toggleZoneStatusIntoDB = async (id: string) => {
  const zone = await ZoneModel.findById(id);
  if (!zone) {
    return null;
  }
  zone.active = !zone.active;
  await zone.save();
  return zone;
};

export const ZoneService = {
  createZoneIntoDB,
  getAllZonesFromDB,
  updateZoneIntoDB,
  toggleZoneStatusIntoDB,
};
