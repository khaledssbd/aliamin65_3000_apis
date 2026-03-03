import { z } from 'zod';
import {
  PICKUP_TYPE_VALUES,
  SERVICE_TYPE_VALUES,
  ORDER_STATUS_VALUES,
  ORDER_STAGE_VALUES,
} from './order.constant';

// 1. createSchema
const createSchema = z.object({
  body: z.object({
    pickupAddress: z.string().min(1),
    deliveryAddress: z.string().min(1),
    serviceType: z.enum(SERVICE_TYPE_VALUES as [string, ...string[]]),
    pickupType: z.enum(PICKUP_TYPE_VALUES as [string, ...string[]]),
    scheduledPickupAt: z.string().datetime().optional(),
    bags: z.number().min(1),
    specialInstructions: z.string().optional(),
  }),
});

// 2. assignDriverSchema
const assignDriverSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    driverId: z.string(),
  }),
});

// 3. statusSchema
const statusSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.enum(ORDER_STATUS_VALUES as [string, ...string[]]),
  }),
});

// 4. bagCountSchema
const bagCountSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    bagCount: z.number().min(0),
  }),
});

// 5. readyTimeSchema
const readyTimeSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    isoTime: z.string().datetime(),
  }),
});

// 6. stageSchema
const stageSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    stage: z.enum(ORDER_STAGE_VALUES as [string, ...string[]]),
  }),
});

export const OrderValidation = {
  create: createSchema,
  assignDriver: assignDriverSchema,
  status: statusSchema,
  bagCount: bagCountSchema,
  readyTime: readyTimeSchema,
  stage: stageSchema,
};
