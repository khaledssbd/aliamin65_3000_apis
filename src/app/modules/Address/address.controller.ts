import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { AddressService } from './address.service';

const listMine = asyncHandler(async (req, res) => {
  const result = await AddressService.listMine(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Addresses retrieved',
    data: result,
  });
});

const create = asyncHandler(async (req, res) => {
  const result = await AddressService.create(req.user._id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Address created',
    data: result,
  });
});

const update = asyncHandler(async (req, res) => {
  const result = await AddressService.update(
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

const remove = asyncHandler(async (req, res) => {
  const result = await AddressService.remove(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Address deleted',
    data: result,
  });
});

const setDefault = asyncHandler(async (req, res) => {
  const result = await AddressService.setDefault(
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
  listMine,
  create,
  update,
  remove,
  setDefault,
};
