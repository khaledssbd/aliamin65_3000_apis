import { Schema, model } from 'mongoose';
import { IChatMessage } from './chat.interface';

const chatMessageSchema = new Schema<IChatMessage>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: {
      type: String,
      enum: ['TEXT', 'IMAGE'],
      // enum: ['TEXT', 'IMAGE', 'AUDIO'],
      default: 'TEXT',
    },
    content: { type: String, required: true },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

chatMessageSchema.index({ order: 1, createdAt: -1 });
chatMessageSchema.index({ from: 1, to: 1, createdAt: -1 });

const ChatMessageModel = model<IChatMessage>('ChatMessage', chatMessageSchema);
export default ChatMessageModel;
