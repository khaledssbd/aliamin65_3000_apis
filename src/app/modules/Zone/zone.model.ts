import { Schema, model } from 'mongoose';
import { IZone } from './zone.interface';

const zoneSchema = new Schema<IZone>(
  {
    name: { type: String, required: true, unique: true },
    polygon: {
      type: { type: String, enum: ['Polygon'] },
      coordinates: { type: [[[Number]]] },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

zoneSchema.index({ polygon: '2dsphere' });

const ZoneModel = model<IZone>('Zone', zoneSchema);
export default ZoneModel;
