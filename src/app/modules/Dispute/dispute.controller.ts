import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DisputeService } from './dispute.service';

// 1. createDisputeForOrder
const createDisputeForOrder = asyncHandler(async (req, res) => {
  const doc = await DisputeService.createDisputeForOrderInDB({
    orderId: req.body.orderId,
    raisedBy: String(req.user._id),
    type: req.body.type,
    description: req.body.description,
    attachments: req.body.attachments,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Dispute created',
    data: doc,
  });
});

// 2. listDisputesByOrderId
const listDisputesByOrderId = asyncHandler(async (req, res) => {
  const docs = await DisputeService.listDisputesByOrderIdFromDB(
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Disputes',
    data: docs,
  });
});

// 3. updateDisputeStatus
const updateDisputeStatus = asyncHandler(async (req, res) => {
  const doc = await DisputeService.updateDisputeStatusInDB(
    String(req.params.id),
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Status updated',
    data: doc,
  });
});

// 4. setDisputeAdminNotes
const setDisputeAdminNotes = asyncHandler(async (req, res) => {
  const doc = await DisputeService.setDisputeAdminNotesInDB(
    String(req.params.id),
    req.body.adminNotes,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Notes updated',
    data: doc,
  });
});

export const DisputeController = {
  createDisputeForOrder,
  listDisputesByOrderId,
  updateDisputeStatus,
  setDisputeAdminNotes,
};
