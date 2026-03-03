import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { CardService } from './card.service';

// 1. getSavedCards
const getSavedCards = asyncHandler(async (req, res) => {
  const docs = await CardService.getSavedCardsFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Cards retrieved',
    data: docs,
  });
});

// 2. createCard
const createCard = asyncHandler(async (req, res) => {
  const doc = await CardService.createCardIntoDB(
    req.user._id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Card created',
    data: doc,
  });
});

// 3. setDefaultCard
const setDefaultCard = asyncHandler(async (req, res) => {
  const doc = await CardService.setDefaultCardIntoDB(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Default card updated',
    data: doc,
  });
});

// 4. deleteCard
const deleteCard = asyncHandler(async (req, res) => {
  const doc = await CardService.deleteCardFromDB(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Card deleted',
    data: doc,
  });
});

export const CardController = {
  getSavedCards,
  createCard,
  setDefaultCard,
  deleteCard,
};
