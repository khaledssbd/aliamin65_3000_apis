import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PaymentService } from './payment.service';

// 1. createIntent
const createIntent = asyncHandler(async (req, res) => {
  const { clientSecret } = await PaymentService.createIntentInDB(
    req.user._id,
    req.body.orderId,
    req.body.amount,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Payment intent created',
    data: { clientSecret },
  });
});

// 2. confirm
const confirm = asyncHandler(async (req, res) => {
  const doc = await PaymentService.confirmInDB(req.user._id, req.body.orderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment captured',
    data: doc,
  });
});

// 3. byOrder
const byOrder = asyncHandler(async (req, res) => {
  const doc = await PaymentService.byOrderInDB(String(req.params.orderId));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment',
    data: doc,
  });
});

export const PaymentController = {
  createIntent,
  confirm,
  byOrder,
};
