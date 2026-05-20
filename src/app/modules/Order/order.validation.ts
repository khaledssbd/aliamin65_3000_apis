import { z } from 'zod';
import {
  PICKUP_TYPE_VALUES,
  SERVICE_TYPE_VALUES,
  ORDER_STATUS_VALUES,
  ORDER_STAGE_VALUES,
} from './order.constant';

// 1. createOrderSchema
const createOrderSchema = z.object({
  body: z.object({
    serviceType: z.enum(SERVICE_TYPE_VALUES as [string, ...string[]]),
    bags: z.number().min(1),
    pickupType: z.enum(PICKUP_TYPE_VALUES as [string, ...string[]]),
    scheduledPickupAt: z.string().datetime().optional(),
    specialInstructions: z.string().optional(),
  }),
});

// 2. assignDriverToOrderSchema
const assignDriverToOrderSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    driverId: z.string(),
  }),
});

// 3. updateOrderStatusSchema
const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.enum(ORDER_STATUS_VALUES as [string, ...string[]]),
  }),
});

// 4. setBagCountSchema
const setBagCountSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    bagCount: z.number().min(0),
  }),
});

// 5. setOrderReadyTimeSchema
const setOrderReadyTimeSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    isoTime: z.string().datetime(),
  }),
});

// 6. updateOrderStageSchema
const updateOrderStageSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    stage: z.enum(ORDER_STAGE_VALUES as [string, ...string[]]),
  }),
});

// 7. cancelOrderSchema
const cancelOrderSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z
    .object({
      reason: z.string().trim().max(500).optional(),
    })
    .optional(),
});

export const OrderValidation = {
  createOrderSchema,
  assignDriverToOrderSchema,
  updateOrderStatusSchema,
  setBagCountSchema,
  setOrderReadyTimeSchema,
  updateOrderStageSchema,
  cancelOrderSchema,
};
