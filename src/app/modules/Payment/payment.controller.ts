import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PaymentService } from './payment.service';

const createIntent = asyncHandler(async (req, res) => {
  const { clientSecret } = await PaymentService.createIntent(
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

const confirm = asyncHandler(async (req, res) => {
  const doc = await PaymentService.confirm(req.user._id, req.body.orderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment captured',
    data: doc,
  });
});

const byOrder = asyncHandler(async (req, res) => {
  const doc = await PaymentService.byOrder(String(req.params.orderId));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment',
    data: doc,
  });
});

export const PaymentController = { createIntent, confirm, byOrder };
