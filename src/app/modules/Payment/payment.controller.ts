import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PaymentService } from './payment.service';

// 1. createPaymentIntentForMyOrder
const createPaymentIntentForMyOrder = asyncHandler(async (req, res) => {
  const amount =
    req.body?.amount !== undefined && req.body?.amount !== null
      ? Number(req.body.amount)
      : undefined;

  const { clientSecret } =
    await PaymentService.createPaymentIntentForMyOrderIntoDB(
      req.user._id,
      req.body.orderId,
      Number.isFinite(amount as number) ? amount : undefined,
    );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Payment intent created successfully!',
    data: { clientSecret },
  });
});

// 2. capturePaymentForMyOrder
const capturePaymentForMyOrder = asyncHandler(async (req, res) => {
  const amount =
    req.body?.amount !== undefined && req.body?.amount !== null
      ? Number(req.body.amount)
      : undefined;

  const doc = await PaymentService.capturePaymentForMyOrderIntoDB(
    req.user._id,
    req.body.orderId,
    Number.isFinite(amount as number) ? amount : undefined,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment captured successfully!',
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
    message: 'Payment details fetched successfully!',
    data: doc,
  });
});

export const PaymentController = {
  createPaymentIntentForMyOrder,
  capturePaymentForMyOrder,
  getPaymentByOrderId,
};
