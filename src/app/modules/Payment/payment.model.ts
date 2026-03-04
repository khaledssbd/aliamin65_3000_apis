import { Schema, model } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    // currency: { type: String, default: 'USD' },
    stripePaymentIntentId: { type: String },
    stripeChargeId: { type: String },
    status: {
      type: String,
      enum: [
        'requires_payment_method',
        'requires_confirmation',
        'processing',
        'succeeded',
        'canceled',
        'requires_action',
      ],
      required: true,
    },
    capturedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

const PaymentModel = model<IPayment>('Payment', paymentSchema);
export default PaymentModel;
