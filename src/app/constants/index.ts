// export const CURRENCY = {
//   USD: 'USD',
// } as const;

export const ORDER_STATUS = {
  REQUESTED: 'REQUESTED',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  WASHING_DRYING: 'WASHING_DRYING',
  DRYING: 'DRYING',
  FOLDING: 'FOLDING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS) as Array<
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]
>;

export const ORDER_STAGE = {
  WASHING: 'WASHING',
  DRYING: 'DRYING',
  FOLDING: 'FOLDING',
  DELIVERY: 'DELIVERY',
} as const;

export const SERVICE_TYPE = {
  WASH_DRY: 'WASH_DRY',
  DRY_CLEAN: 'DRY_CLEAN',
} as const;

export const PICKUP_TYPE = {
  ASAP: 'ASAP',
  SCHEDULED: 'SCHEDULED',
} as const;

export const DRIVER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const BACKGROUND_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  FAILED: 'FAILED',
} as const;

export const NOTIFICATION_TYPE = {
  ORDER_STATUS: 'ORDER_STATUS',
  REMINDER: 'REMINDER',
  PAYMENT: 'PAYMENT',
  SYSTEM: 'SYSTEM',
  CHAT: 'CHAT',
} as const;

export const PAYMENT_STATUS = {
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  CANCELED: 'canceled',
  REQUIRES_ACTION: 'requires_action',
} as const;

export const PAYOUT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
} as const;
