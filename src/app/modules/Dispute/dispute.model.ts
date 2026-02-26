import { Schema, model } from 'mongoose';
import { IDispute } from './dispute.interface';

const disputeSchema = new Schema<IDispute>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'OPEN',
    },
    adminNotes: { type: String },
  },
  { timestamps: true, versionKey: false },
);

const DisputeModel = model<IDispute>('Dispute', disputeSchema);
export default DisputeModel;
