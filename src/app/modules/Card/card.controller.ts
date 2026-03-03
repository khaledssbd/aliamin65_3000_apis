import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { CardService } from './card.service';

// 1. listMine
const listMine = asyncHandler(async (req, res) => {
  const docs = await CardService.listMineInDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Cards',
    data: docs,
  });
});

// 2. attach
const attach = asyncHandler(async (req, res) => {
  const doc = await CardService.attachInDB(req.user._id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Card attached',
    data: doc,
  });
});

// 3. setDefault
const setDefault = asyncHandler(async (req, res) => {
  const doc = await CardService.setDefaultInDB(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Default set',
    data: doc,
  });
});

// 4. detach
const detach = asyncHandler(async (req, res) => {
  const doc = await CardService.detachInDB(req.user._id, String(req.params.id));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Card detached',
    data: doc,
  });
});

export const CardController = {
  listMine,
  attach,
  setDefault,
  detach,
};
