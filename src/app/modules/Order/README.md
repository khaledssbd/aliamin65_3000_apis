# Order Module

Base path: `/api/v1/orders`

## Overview

Per-bag laundry request lifecycle. Status flow: `REQUESTED → DRIVER_ASSIGNED → PICKED_UP → WASHING_DRYING → OUT_FOR_DELIVERY → DELIVERED → COMPLETED`. Supports special instructions, bag counts, scheduled vs ASAP, and full driver workflow.

## REST Endpoints

- POST `/` – [Customer] Create order. Body: `{ serviceType, pickupType, scheduledPickupAt?, bags, specialInstructions? }` → totals computed from active pricing.
- GET `/` – List customer's orders.
- GET `/:id` – Get order details.
- PATCH `/:id/assign-driver` – [Admin/Dispatch] Body: `{ driverId }`.
- PATCH `/:id/status` – Update status. Body: `{ status }` (admin/automation).
- PATCH `/:id/bag-count/pickup` – [Driver] Body: `{ bagCount }` (supports “overfilled = 2 bags” rule).
- PATCH `/:id/bag-count/delivery` – [Driver] Body: `{ bagCount }`.
- POST `/:id/ready-time` – [Driver] Set estimated ready time: `{ isoTime }`.
- POST `/:id/stage/washing` – [Driver] Mark Washing in progress → updates timeline.washingDryingAt.
- POST `/:id/stage/drying` – [Driver] Mark Drying in progress.
- POST `/:id/stage/folding` – [Driver] Mark Folding & Packaging.
- POST `/:id/stage/delivery/start` – [Driver] Start delivery leg → status `OUT_FOR_DELIVERY`.
- POST `/:id/stage/delivery/complete` – [Driver] Complete delivery → status `DELIVERED` and triggers Payment capture + Ratings prompt.
- GET `/:id/timeline` – Order timeline.

## Socket Events

Events are emitted on the `/orders` namespace.

- Server → Client
  - `order:created` `{ orderId }` (to `customer:{userId}`)
  - `driver:job:new` `{ orderId }` (to nearby `driver:{userId}`)
  - `order:driver:accepted` `{ orderId, driverUserId }` (to customer)
  - `order:hidden` `{ orderId }` (to other drivers after a driver accepts)
  - `order:tracking:location` `{ orderId, lat, lng }` (to `order:{orderId}` room)

- Client → Server
  - `orders:join` `{ userId, role, orderId? }` (joins `customer:{id}` / `driver:{id}` / `order:{orderId}`)
  - `order:tracking:location:push` `{ orderId, driverUserId, lat, lng }` (driver)

## Data Model

- [order.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Order/order.interface.ts)
- [order.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Order/order.model.ts)
