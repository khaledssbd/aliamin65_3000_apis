# Payment Module

Base path: `/api/v1/payments`

## Overview
Stripe card payments captured after successful delivery. Stores intent state for reconciliation.

## REST Endpoints
- POST `/intent` – Create PaymentIntent for an order. Body: `{ orderId }` → `{ clientSecret }`
- POST `/confirm` – Confirm capture after delivery. Body: `{ orderId }` → updates `status` to `succeeded`.
- GET `/order/:orderId` – Get payment by order.
- POST `/webhook` – Stripe webhook receiver.

## Notes
- Uses Stripe Payment Intents. Platform split happens in Earnings module.

## Data Model
- [payment.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Payment/payment.interface.ts)
- [payment.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Payment/payment.model.ts)

