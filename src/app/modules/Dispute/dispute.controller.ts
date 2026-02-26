import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DisputeService } from './dispute.service';

const create = asyncHandler(async (req, res) => {
  const doc = await DisputeService.create({
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

const byOrder = asyncHandler(async (req, res) => {
  const docs = await DisputeService.byOrder(String(req.params.orderId));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Disputes',
    data: docs,
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const doc = await DisputeService.updateStatus(
    String(req.params.id),
    req.body.status,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Status updated',
    data: doc,
  });
});

const setNotes = asyncHandler(async (req, res) => {
  const doc = await DisputeService.setNotes(
    String(req.params.id),
    req.body.adminNotes,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Notes updated',
    data: doc,
  });
});

export const DisputeController = { create, byOrder, updateStatus, setNotes };
