import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PaymentService } from './payment.service';

// 1. createPaymentIntentForMyOrder
const createPaymentIntentForMyOrder = asyncHandler(async (req, res) => {
  const tipAmount =
    req.body && req.body.tipAmount !== undefined && req.body.tipAmount !== null
      ? Number(req.body.tipAmount)
      : undefined;

  const { clientSecret } =
    await PaymentService.createPaymentIntentForMyOrderIntoDB(
      req.user._id,
      req.body.orderId,
      Number.isFinite(tipAmount as number) ? tipAmount : undefined,
    );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Payment intent created successfully!',
    data: { clientSecret },
  });
});

// 2. capturePaymentForMyOrder
const capturePaymentForMyOrder = asyncHandler(async (req, res) => {
  const tipAmount =
    req.body && req.body.tipAmount !== undefined && req.body.tipAmount !== null
      ? Number(req.body.tipAmount)
      : undefined;

  const doc = await PaymentService.capturePaymentForMyOrderIntoDB(
    req.user._id,
    req.body.orderId,
    Number.isFinite(tipAmount as number) ? tipAmount : undefined,
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
    req.user._id,
    req.user.role,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment details fetched successfully!',
    data: doc,
  });
});

const handleStripeWebhook = asyncHandler(async (req, res) => {
  const result = await PaymentService.handleStripeWebhookIntoDB(
    req.body,
    req.headers['stripe-signature'] as string | undefined,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Stripe webhook handled successfully!',
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntentForMyOrder,
  capturePaymentForMyOrder,
  getPaymentByOrderId,
  handleStripeWebhook,
};
