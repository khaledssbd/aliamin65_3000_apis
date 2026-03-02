import DisputeModel from './dispute.model';

const create = async (payload: {
  orderId: string;
  raisedBy: string;
  type?: string;
  description: string;
  attachments?: string[];
}) => {
  const doc = await DisputeModel.create({
    order: payload.orderId,
    raisedBy: payload.raisedBy,
    type: payload.type,
    description: payload.description,
    attachments: payload.attachments ?? [],
    status: 'OPEN',
  });
  return doc;
};

const byOrder = async (orderId: string) => {
  return DisputeModel.find({ order: orderId }).sort({ createdAt: -1 });
};

const updateStatus = async (id: string, status: string) => {
  return DisputeModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );
};

const setNotes = async (id: string, adminNotes: string) => {
  return DisputeModel.findByIdAndUpdate(
    id,
    { $set: { adminNotes } },
    { new: true },
  );
};

export const DisputeService = {
  create,
  byOrder,
  updateStatus,
  setNotes,
};
