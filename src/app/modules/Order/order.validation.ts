import { z } from 'zod';
import {
  PICKUP_TYPE_VALUES,
  SERVICE_TYPE_VALUES,
  ORDER_STATUS_VALUES,
  ORDER_STAGE_VALUES,
} from './order.constant';

export const OrderValidation = {
  create: z.object({
    body: z.object({
      pickupAddressId: z.string(),
      deliveryAddressId: z.string(),
      serviceType: z.enum(SERVICE_TYPE_VALUES as [string, ...string[]]),
      pickupType: z.enum(PICKUP_TYPE_VALUES as [string, ...string[]]),
      scheduledPickupAt: z.string().datetime().optional(),
      bags: z.number().min(1),
      specialInstructions: z.string().optional(),
    }),
  }),
  assignDriver: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      driverId: z.string(),
    }),
  }),
  status: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      status: z.enum(ORDER_STATUS_VALUES as [string, ...string[]]),
    }),
  }),
  bagCount: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      bagCount: z.number().min(0),
    }),
  }),
  readyTime: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      isoTime: z.string().datetime(),
    }),
  }),
  stage: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      stage: z.enum(ORDER_STAGE_VALUES as [string, ...string[]]),
    }),
  }),
};
