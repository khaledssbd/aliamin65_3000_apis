import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { InvoiceService } from './invoice.service';

// 1. getInvoiceByOrder
const getInvoiceByOrder = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.getInvoiceByOrderFromDB(
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice fetched successfully!',
    data: doc,
  });
});

// 2. getInvoiceByNumber
const getInvoiceByNumber = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.getInvoiceByNumberFromDB(
    String(req.params.invoiceNumber),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice fetched successfully!',
    data: doc,
  });
});

// 3. createInvoice
const createInvoice = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.createInvoiceIntoDB(
    String(req.params.orderId),
  );
  if (!doc)
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Order not found!',
      data: null,
    });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice created successfully!',
    data: doc,
  });
});

export const InvoiceController = {
  getInvoiceByOrder,
  getInvoiceByNumber,
  createInvoice,
};
