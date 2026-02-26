import { Schema, model } from 'mongoose';
import { ICard } from './card.interface';

const cardSchema = new Schema<ICard>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stripeCustomerId: { type: String, required: true },
    stripePaymentMethodId: { type: String, required: true, unique: true },
    brand: { type: String },
    last4: { type: String },
    expMonth: { type: Number },
    expYear: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

const CardModel = model<ICard>('Card', cardSchema);
export default CardModel;
