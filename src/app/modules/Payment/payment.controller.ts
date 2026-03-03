import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PaymentService } from './payment.service';

// 1. createPaymentIntentForMyOrder
const createPaymentIntentForMyOrder = asyncHandler(async (req, res) => {
  const { clientSecret } =
    await PaymentService.createPaymentIntentForMyOrderIntoDB(
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

// 2. capturePaymentForMyOrder
const capturePaymentForMyOrder = asyncHandler(async (req, res) => {
  const doc = await PaymentService.capturePaymentForMyOrderIntoDB(
    req.user._id,
    req.body.orderId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment captured',
    data: doc,
  });
});

// 3. getPaymentByOrderId
const getPaymentByOrderId = asyncHandler(async (req, res) => {
  const doc = await PaymentService.getPaymentByOrderIdFromDB(
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment',
    data: doc,
  });
});

export const PaymentController = {
  createPaymentIntentForMyOrder,
  capturePaymentForMyOrder,
  getPaymentByOrderId,
};
