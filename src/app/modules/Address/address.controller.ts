import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { AddressService } from './address.service';

// 1. listMineAddress
const listMineAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.listMineAddressInDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Addresses retrieved',
    data: result,
  });
});

// 2. createAddress
const createAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.createAddressInDB(req.user._id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Address created',
    data: result,
  });
});

// 3. updateAddress
const updateAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.updateAddressInDB(
    req.user._id,
    String(req.params.id),
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Address updated',
    data: result,
  });
});

// 4. removeAddress
const removeAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.removeAddressInDB(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Address deleted',
    data: result,
  });
});

// 5. setDefaultAddress
const setDefaultAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.setDefaultAddressInDB(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Default updated',
    data: result,
  });
});

export const AddressController = {
  listMineAddress,
  createAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
};
