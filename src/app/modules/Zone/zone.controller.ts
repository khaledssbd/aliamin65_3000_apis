import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { ZoneService } from './zone.service';

// 1. createZone
const createZone = asyncHandler(async (req, res) => {
  const result = await ZoneService.createZoneIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Zone created successfully!',
    data: result,
  });
});

// 2. getAllZones
const getAllZones = asyncHandler(async (req, res) => {
  const result = await ZoneService.getAllZonesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Zones fetched successfully!',
    data: result,
  });
});

// 3. updateZone
const updateZone = asyncHandler(async (req, res) => {
  const result = await ZoneService.updateZoneIntoDB(
    String(req.params.id),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Zone updated successfully!',
    data: result,
  });
});

// 4. toggleZoneStatus
const toggleZoneStatus = asyncHandler(async (req, res) => {
  const result = await ZoneService.toggleZoneStatusIntoDB(
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Zone status toggled successfully!',
    data: result,
  });
});

export const ZoneController = {
  createZone,
  getAllZones,
  updateZone,
  toggleZoneStatus,
};
