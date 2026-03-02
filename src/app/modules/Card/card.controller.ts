import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { CardService } from './card.service';

const listMine = asyncHandler(async (req, res) => {
  const docs = await CardService.listMine(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Cards',
    data: docs,
  });
});

const attach = asyncHandler(async (req, res) => {
  const doc = await CardService.attach(req.user._id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Card attached',
    data: doc,
  });
});

const setDefault = asyncHandler(async (req, res) => {
  const doc = await CardService.setDefault(req.user._id, String(req.params.id));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Default set',
    data: doc,
  });
});

const detach = asyncHandler(async (req, res) => {
  const doc = await CardService.detach(req.user._id, String(req.params.id));

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
