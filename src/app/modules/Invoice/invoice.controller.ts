import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { InvoiceService } from './invoice.service';

const getByOrder = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.getByOrder(String(req.params.orderId));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice',
    data: doc,
  });
});

const getByNumber = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.getByNumber(
    String(req.params.invoiceNumber),
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice',
    data: doc,
  });
});

const generate = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.generate(String(req.params.orderId));
  if (!doc)
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Order not found',
      data: null,
    });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice generated',
    data: doc,
  });
});

export const InvoiceController = { getByOrder, getByNumber, generate };
