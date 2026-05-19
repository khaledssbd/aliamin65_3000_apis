import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PaymentService } from './payment.service';
import { getIO } from '../../socket';
import OrderModel from '../Order/order.model';

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

  if (doc && doc.status === 'succeeded') {
    const order = await OrderModel.findById(doc.order).select(
      'customer driver status',
    );
    const ordersNs = getIO()?.of('/orders');
    const payload = {
      orderId: String(doc.order),
      paymentId: String(doc._id),
      status: doc.status,
      orderStatus: order?.status,
    };

    ordersNs?.to(`customer:${String(doc.customer)}`).emit(
      'order:payment:confirmed',
      payload,
    );

    if (order?.driver) {
      ordersNs
        ?.to(`driver:${String(order.driver)}`)
        .emit('order:payment:confirmed', payload);
    }

    ordersNs?.to(`order:${String(doc.order)}`).emit(
      'order:payment:confirmed',
      payload,
    );
  }

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
