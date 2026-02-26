import { Document } from 'mongoose';

export interface IZone extends Document {
  name: string;
  polygon?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
