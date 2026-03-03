import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { AddressService } from './address.service';

// 1. getMyAddress
const getMyAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.getMyAddressFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Addresses retrieved',
    data: result,
  });
});

// 2. createAddress
const createAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.createAddressIntoDB(req.user._id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Address created',
    data: result,
  });
});

// 3. updateAddress
const updateAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.updateAddressIntoDB(
    req.user._id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Address updated',
    data: result,
  });
});

// 4. deleteAddress
const deleteAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.deleteAddressFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Address deleted',
    data: result,
  });
});

// 5. setDefaultAddress
const setDefaultAddress = asyncHandler(async (req, res) => {
  const result = await AddressService.setDefaultAddressIntoDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Default updated',
    data: result,
  });
});

export const AddressController = {
  getMyAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
