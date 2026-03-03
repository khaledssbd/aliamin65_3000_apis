import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DisputeService } from './dispute.service';

// 1. createDispute
const createDispute = asyncHandler(async (req, res) => {
  const doc = await DisputeService.createDisputeIntoDB({
    orderId: req.body.orderId,
    raisedBy: String(req.user._id),
    type: req.body.type,
    description: req.body.description,
    attachments: req.body.attachments,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Dispute created successfully!',
    data: doc,
  });
});

// 2. getDisputes
const getDisputes = asyncHandler(async (req, res) => {
  const docs = await DisputeService.getDisputesFromDB(
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Disputes fetched successfully!',
    data: docs,
  });
});

// 3. updateDisputeStatus
const updateDisputeStatus = asyncHandler(async (req, res) => {
  const doc = await DisputeService.updateDisputeStatusIntoDB(
    String(req.params.id),
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dispute status updated successfully!',
    data: doc,
  });
});

// 4. setDisputeAdminNotes
const setDisputeAdminNotes = asyncHandler(async (req, res) => {
  const doc = await DisputeService.setDisputeAdminNotesIntoDB(
    String(req.params.id),
    req.body.adminNotes,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin notes updated successfully!',
    data: doc,
  });
});

export const DisputeController = {
  createDispute,
  getDisputes,
  updateDisputeStatus,
  setDisputeAdminNotes,
};
