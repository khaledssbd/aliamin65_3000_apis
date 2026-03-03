import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { CardService } from './card.service';

// 1. listMySavedCards
const listMySavedCards = asyncHandler(async (req, res) => {
  const docs = await CardService.listMySavedCardsInDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Cards',
    data: docs,
  });
});

// 2. attachNewCardToMyAccount
const attachNewCardToMyAccount = asyncHandler(async (req, res) => {
  const doc = await CardService.attachNewCardToMyAccountInDB(
    req.user._id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Card attached',
    data: doc,
  });
});

// 3. setMyDefaultCard
const setMyDefaultCard = asyncHandler(async (req, res) => {
  const doc = await CardService.setMyDefaultCardInDB(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Default set',
    data: doc,
  });
});

// 4. detachMyCard
const detachMyCard = asyncHandler(async (req, res) => {
  const doc = await CardService.detachMyCardInDB(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Card detached',
    data: doc,
  });
});

export const CardController = {
  listMySavedCards,
  attachNewCardToMyAccount,
  setMyDefaultCard,
  detachMyCard,
};
