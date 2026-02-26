import { Schema, model } from 'mongoose';
import { IRating } from './rating.interface';

const ratingSchema = new Schema<IRating>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String },
  },
  { timestamps: true, versionKey: false },
);

const RatingModel = model<IRating>('Rating', ratingSchema);
export default RatingModel;
