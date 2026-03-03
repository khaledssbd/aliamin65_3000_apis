import DisputeModel from './dispute.model';

// 1. createDisputeForOrderInDB
const createDisputeForOrderInDB = async (payload: {
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

// 2. listDisputesByOrderIdFromDB
const listDisputesByOrderIdFromDB = async (orderId: string) => {
  return DisputeModel.find({ order: orderId }).sort({ createdAt: -1 });
};

// 3. updateDisputeStatusInDB
const updateDisputeStatusInDB = async (id: string, status: string) => {
  return DisputeModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );
};

// 4. setDisputeAdminNotesInDB
const setDisputeAdminNotesInDB = async (id: string, adminNotes: string) => {
  return DisputeModel.findByIdAndUpdate(
    id,
    { $set: { adminNotes } },
    { new: true },
  );
};

export const DisputeService = {
  createDisputeForOrderInDB,
  listDisputesByOrderIdFromDB,
  updateDisputeStatusInDB,
  setDisputeAdminNotesInDB,
};
